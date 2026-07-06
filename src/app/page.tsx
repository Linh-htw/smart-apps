import { revalidatePath } from "next/cache";
import { Fragment } from "react";
import { prisma } from "@/lib/prisma";
import {
  hauttypen,
  isHauttyp,
  isKundentyp,
  kundentypen,
} from "@/lib/customer-options";
import {
  isProduktkategorie,
  produktkategorien,
} from "@/lib/product-options";
import {
  bestellkanaele,
  getBestellstatusForZahlung,
  isBestellkanal,
  isZahlungsstatus,
  zahlungsstatusWerte,
} from "@/lib/order-options";
import {
  canAccess,
  isRolle,
  type Rolle,
  rollen,
} from "@/lib/employee-options";
import {
  chargenstatusWerte,
  isChargenstatus,
} from "@/lib/batch-options";
import { isLagerort, lagerorte } from "@/lib/inventory-options";

export const dynamic = "force-dynamic";

function nullableText(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text ? text : null;
}

function nullableNumber(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  if (!text) {
    return null;
  }

  const number = Number.parseInt(text, 10);
  return Number.isNaN(number) ? null : number;
}

function requiredInt(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  if (!text) {
    return null;
  }

  const number = Number.parseInt(text, 10);
  return Number.isNaN(number) ? null : number;
}

function requiredNonNegativeInt(value: FormDataEntryValue | null) {
  const number = requiredInt(value);
  return number !== null && number >= 0 ? number : null;
}

function requiredDecimal(value: FormDataEntryValue | null) {
  const text = value?.toString().trim().replace(",", ".");
  if (!text) {
    return null;
  }

  const number = Number(text);
  return Number.isFinite(number) && number >= 0 ? text : null;
}

function requiredDate(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  if (!text) {
    return null;
  }

  const date = new Date(`${text}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value));
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("de-DE").format(value);
}

function getDaysSince(value: Date, now = new Date()) {
  const start = new Date(value);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(0, 0, 0, 0);

  return Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / 86_400_000),
  );
}

function getDaysUntil(value: Date, now = new Date()) {
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - start.getTime()) / 86_400_000);
}

function getMhdWarnung(charge: {
  mhd: Date;
  status: string;
}) {
  if (charge.status !== "freigegeben") {
    return null;
  }

  const tageBisMhd = getDaysUntil(charge.mhd);

  if (tageBisMhd <= 30) {
    return {
      level: "critical",
      rabatt: 50,
      tageBisMhd,
      text:
        tageBisMhd < 0
          ? "MHD ueberschritten, Restposten pruefen"
          : "30 Tage oder weniger bis MHD, 50 % Rabatt vorschlagen",
    };
  }

  if (tageBisMhd <= 56) {
    return {
      level: "warning",
      rabatt: 20,
      tageBisMhd,
      text: "8 Wochen oder weniger bis MHD, 20 % Rabatt vorschlagen",
    };
  }

  return null;
}

function getReservierungswarnung(bestellung: {
  datum: Date;
  zahlungsstatus: string;
  status: string;
  kunde: { stammkunde: boolean };
}) {
  if (bestellung.status === "storniert") {
    return null;
  }

  if (bestellung.zahlungsstatus !== "ausstehend") {
    return null;
  }

  const alterInTagen = getDaysSince(bestellung.datum);
  const warnAbTag = bestellung.kunde.stammkunde ? 7 : 3;
  const stornierbarAbTag = bestellung.kunde.stammkunde ? 10 : 5;

  if (alterInTagen >= stornierbarAbTag) {
    return {
      level: "critical",
      text: `Seit ${alterInTagen} Tagen unbezahlt, manuelle Stornierung pruefen`,
    };
  }

  if (alterInTagen >= warnAbTag) {
    return {
      level: "warning",
      text: `Seit ${alterInTagen} Tagen unbezahlt, Zahlung nachfassen`,
    };
  }

  return null;
}

function getNextBestellschritt(bestellung: {
  datum: Date;
  zahlungsstatus: string;
  status: string;
  kunde: { stammkunde: boolean };
}) {
  const warnung = getReservierungswarnung(bestellung);

  if (warnung) {
    return warnung.text;
  }

  if (bestellung.status === "storniert") {
    return "Keine Aktion";
  }

  if (bestellung.zahlungsstatus === "ausstehend") {
    return "Zahlung pruefen";
  }

  return "Zur weiteren Bearbeitung vormerken";
}

function getReservierteMenge(charge: {
  lagerbestaende: Array<{
    mengeVoruebergehendReserviert: number;
    mengeVerbindlichReserviert: number;
  }>;
  verkaufseventPositionen?: Array<{ mengeMitgenommen: number }>;
}) {
  const lagerReserviert = charge.lagerbestaende.reduce(
    (summe, bestand) =>
      summe +
      bestand.mengeVoruebergehendReserviert +
      bestand.mengeVerbindlichReserviert,
    0,
  );
  const eventMengen =
    charge.verkaufseventPositionen?.reduce(
      (summe, position) => summe + position.mengeMitgenommen,
      0,
    ) ?? 0;

  return lagerReserviert + eventMengen;
}

function getReservierungsLagerort(charge: {
  lagerbestaende: Array<{ lagerort: string }>;
}) {
  return (
    charge.lagerbestaende.find((bestand) => bestand.lagerort === "Versandbereit")
      ?.lagerort ??
    charge.lagerbestaende[0]?.lagerort ??
    "Versandbereit"
  );
}

function getFreieMenge(charge: {
  produzierteMenge: number;
  lagerbestaende: Array<{
    mengeVoruebergehendReserviert: number;
    mengeVerbindlichReserviert: number;
  }>;
  verkaufseventPositionen?: Array<{ mengeMitgenommen: number }>;
}) {
  return charge.produzierteMenge - getReservierteMenge(charge);
}

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function createKunde(formData: FormData) {
  "use server";

  const typ = formData.get("typ")?.toString() ?? "";
  const name = formData.get("name")?.toString().trim() ?? "";
  const hauttyp = nullableText(formData.get("hauttyp"));

  if (!name || !isKundentyp(typ) || (hauttyp && !isHauttyp(hauttyp))) {
    return;
  }

  await prisma.kunde.create({
    data: {
      typ,
      name,
      firmenname: nullableText(formData.get("firmenname")),
      ustId: nullableText(formData.get("ustId")),
      email: nullableText(formData.get("email")),
      instagramHandle: nullableText(formData.get("instagramHandle")),
      adresse: nullableText(formData.get("adresse")),
      zahlungsziel: nullableNumber(formData.get("zahlungsziel")),
      stammkunde: formData.get("stammkunde") === "on",
      vorlieben: nullableText(formData.get("vorlieben")),
      hauttyp,
    },
  });

  revalidatePath("/");
}

async function createProdukt(formData: FormData) {
  "use server";

  const name = formData.get("produktName")?.toString().trim() ?? "";
  const kategorie = formData.get("kategorie")?.toString() ?? "";
  const preisB2c = requiredDecimal(formData.get("preisB2c"));
  const preisB2b = requiredDecimal(formData.get("preisB2b"));
  const b2cPuffermenge = requiredDecimal(formData.get("b2cPuffermenge"));
  const standardMhdDauerMonate = requiredInt(
    formData.get("standardMhdDauerMonate"),
  );

  if (
    !name ||
    !isProduktkategorie(kategorie) ||
    !preisB2c ||
    !preisB2b ||
    !b2cPuffermenge ||
    !standardMhdDauerMonate ||
    standardMhdDauerMonate < 1
  ) {
    return;
  }

  await prisma.produkt.create({
    data: {
      name,
      kategorie,
      vegan: formData.get("vegan") === "on",
      inhaltsstoffe: nullableText(formData.get("inhaltsstoffe")),
      allergene: nullableText(formData.get("allergene")),
      preisB2c,
      preisB2b,
      b2cPuffermenge,
      standardMhdDauerMonate,
      inAboBoxEnthalten: formData.get("inAboBoxEnthalten") === "on",
    },
  });

  revalidatePath("/");
}

async function createBestellung(formData: FormData) {
  "use server";

  const kundeId = requiredInt(formData.get("kundeId"));
  const datum = requiredDate(formData.get("datum"));
  const kanal = formData.get("kanal")?.toString() ?? "";
  const zahlungsstatus = formData.get("zahlungsstatus")?.toString() ?? "";

  if (
    !kundeId ||
    !datum ||
    !isBestellkanal(kanal) ||
    !isZahlungsstatus(zahlungsstatus)
  ) {
    return;
  }

  const kunde = await prisma.kunde.findUnique({
    where: { id: kundeId },
    select: { id: true },
  });

  if (!kunde) {
    return;
  }

  await prisma.bestellung.create({
    data: {
      kundeId,
      datum,
      kanal,
      lieferadresse: nullableText(formData.get("lieferadresse")),
      zahlungsstatus,
      status: getBestellstatusForZahlung(zahlungsstatus),
    },
  });

  revalidatePath("/");
}

async function createBestellposition(formData: FormData) {
  "use server";

  const bestellungId = requiredInt(formData.get("positionBestellungId"));
  const produktId = requiredInt(formData.get("positionProduktId"));
  const menge = requiredInt(formData.get("positionMenge"));

  if (!bestellungId || !produktId || !menge || menge < 1) {
    return;
  }

  const [bestellung, produkt, chargenFuerProdukt] = await Promise.all([
    prisma.bestellung.findUnique({
      where: { id: bestellungId },
      select: { id: true, zahlungsstatus: true },
    }),
    prisma.produkt.findUnique({
      where: { id: produktId },
      select: { id: true },
    }),
    prisma.charge.findMany({
      where: { produktId, status: "freigegeben" },
      include: { lagerbestaende: true },
      orderBy: [{ mhd: "asc" }, { id: "asc" }],
    }),
  ]);

  if (!bestellung || !produkt) {
    return;
  }

  const vorgeschlageneCharge = chargenFuerProdukt.find(
    (charge) => getFreieMenge(charge) >= menge,
  );

  if (!vorgeschlageneCharge) {
    return;
  }

  const lagerort = getReservierungsLagerort(vorgeschlageneCharge);
  const isVerbindlich = bestellung.zahlungsstatus === "bezahlt";

  await prisma.$transaction(async (tx) => {
    await tx.bestellposition.create({
      data: {
        bestellungId,
        produktId,
        chargeId: vorgeschlageneCharge.id,
        menge,
      },
    });

    await tx.lagerbestand.upsert({
      where: {
        chargeId_lagerort: {
          chargeId: vorgeschlageneCharge.id,
          lagerort,
        },
      },
      create: {
        chargeId: vorgeschlageneCharge.id,
        lagerort,
        mengeVoruebergehendReserviert: isVerbindlich ? 0 : menge,
        mengeVerbindlichReserviert: isVerbindlich ? menge : 0,
      },
      update: isVerbindlich
        ? { mengeVerbindlichReserviert: { increment: menge } }
        : { mengeVoruebergehendReserviert: { increment: menge } },
    });
  });

  revalidatePath("/");
}

async function createMitarbeiter(formData: FormData) {
  "use server";

  const name = formData.get("mitarbeiterName")?.toString().trim() ?? "";
  const rolle = formData.get("rolle")?.toString() ?? "";

  if (!name || !isRolle(rolle)) {
    return;
  }

  await prisma.mitarbeiter.create({
    data: {
      name,
      rolle,
      zugriffsrechte: nullableText(formData.get("zugriffsrechte")),
      email: nullableText(formData.get("mitarbeiterEmail")),
      telefonnummer: nullableText(formData.get("telefonnummer")),
    },
  });

  revalidatePath("/");
}

async function createCharge(formData: FormData) {
  "use server";

  const produktId = requiredInt(formData.get("chargenProduktId"));
  const mitarbeiterId = requiredInt(formData.get("chargenMitarbeiterId"));
  const herstellungsdatum = requiredDate(formData.get("herstellungsdatum"));
  const mhd = requiredDate(formData.get("mhd"));
  const produzierteMenge = requiredInt(formData.get("produzierteMenge"));
  const status = formData.get("chargenStatus")?.toString() ?? "";

  if (
    !produktId ||
    !mitarbeiterId ||
    !herstellungsdatum ||
    !mhd ||
    !produzierteMenge ||
    produzierteMenge < 1 ||
    !isChargenstatus(status)
  ) {
    return;
  }

  const [produkt, mitarbeiter] = await Promise.all([
    prisma.produkt.findUnique({
      where: { id: produktId },
      select: { id: true },
    }),
    prisma.mitarbeiter.findUnique({
      where: { id: mitarbeiterId },
      select: { id: true, rolle: true },
    }),
  ]);

  if (!produkt || !mitarbeiter || mitarbeiter.rolle !== "Werkstatt-Hilfe") {
    return;
  }

  await prisma.charge.create({
    data: {
      produktId,
      mitarbeiterId,
      herstellungsdatum,
      mhd,
      produzierteMenge,
      status,
    },
  });

  revalidatePath("/");
}

async function createLagerbestand(formData: FormData) {
  "use server";

  const chargeId = requiredInt(formData.get("lagerbestandChargeId"));
  const lagerort = formData.get("lagerort")?.toString() ?? "";
  const mengeVoruebergehendReserviert = requiredNonNegativeInt(
    formData.get("mengeVoruebergehendReserviert"),
  );
  const mengeVerbindlichReserviert = requiredNonNegativeInt(
    formData.get("mengeVerbindlichReserviert"),
  );

  if (
    !chargeId ||
    !isLagerort(lagerort) ||
    mengeVoruebergehendReserviert === null ||
    mengeVerbindlichReserviert === null
  ) {
    return;
  }

  const charge = await prisma.charge.findUnique({
    where: { id: chargeId },
    select: { id: true },
  });

  if (!charge) {
    return;
  }

  await prisma.lagerbestand.upsert({
    where: {
      chargeId_lagerort: {
        chargeId,
        lagerort,
      },
    },
    create: {
      chargeId,
      lagerort,
      mengeVoruebergehendReserviert,
      mengeVerbindlichReserviert,
    },
    update: {
      mengeVoruebergehendReserviert,
      mengeVerbindlichReserviert,
    },
  });

  revalidatePath("/");
}

async function createVerkaufsevent(formData: FormData) {
  "use server";

  const datum = requiredDate(formData.get("verkaufseventDatum"));
  const ort = formData.get("verkaufseventOrt")?.toString().trim() ?? "";

  if (!datum || !ort) {
    return;
  }

  await prisma.verkaufsevent.create({
    data: {
      datum,
      ort,
    },
  });

  revalidatePath("/");
}

async function createVerkaufseventPosition(formData: FormData) {
  "use server";

  const verkaufseventId = requiredInt(formData.get("verkaufseventId"));
  const chargeId = requiredInt(formData.get("verkaufseventChargeId"));
  const mengeMitgenommen = requiredInt(formData.get("mengeMitgenommen"));
  const mengeVerkauft = requiredNonNegativeInt(formData.get("mengeVerkauft"));

  if (
    !verkaufseventId ||
    !chargeId ||
    !mengeMitgenommen ||
    mengeMitgenommen < 1 ||
    mengeVerkauft === null ||
    mengeVerkauft > mengeMitgenommen
  ) {
    return;
  }

  const [verkaufsevent, charge, bestehendePosition] = await Promise.all([
    prisma.verkaufsevent.findUnique({
      where: { id: verkaufseventId },
      select: { id: true },
    }),
    prisma.charge.findUnique({
      where: { id: chargeId },
      include: {
        lagerbestaende: true,
        verkaufseventPositionen: { select: { mengeMitgenommen: true } },
      },
    }),
    prisma.verkaufseventPosition.findUnique({
      where: {
        verkaufseventId_chargeId: {
          verkaufseventId,
          chargeId,
        },
      },
      select: { id: true },
    }),
  ]);

  if (
    !verkaufsevent ||
    !charge ||
    bestehendePosition ||
    getFreieMenge(charge) < mengeMitgenommen
  ) {
    return;
  }

  await prisma.verkaufseventPosition.create({
    data: {
      verkaufseventId,
      chargeId,
      mengeMitgenommen,
      mengeVerkauft,
    },
  });

  revalidatePath("/");
}

type HomeProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const kunden = await prisma.kunde.findMany({
    orderBy: [{ stammkunde: "desc" }, { name: "asc" }],
  });
  const produkte = await prisma.produkt.findMany({
    orderBy: [{ kategorie: "asc" }, { name: "asc" }],
  });
  const bestellungen = await prisma.bestellung.findMany({
    include: { kunde: true },
    orderBy: [{ datum: "desc" }, { id: "desc" }],
  });
  const bestellpositionen = await prisma.bestellposition.findMany({
    include: {
      bestellung: { include: { kunde: true } },
      produkt: true,
      charge: true,
    },
    orderBy: [{ id: "desc" }],
  });
  const mitarbeiter = await prisma.mitarbeiter.findMany({
    orderBy: [{ rolle: "asc" }, { name: "asc" }],
  });
  const chargen = await prisma.charge.findMany({
    include: {
      produkt: true,
      mitarbeiter: true,
      lagerbestaende: true,
      bestellpositionen: { select: { menge: true } },
      verkaufseventPositionen: { select: { mengeMitgenommen: true } },
    },
    orderBy: [{ mhd: "asc" }, { id: "desc" }],
  });
  const lagerbestaende = await prisma.lagerbestand.findMany({
    include: { charge: { include: { produkt: true } } },
    orderBy: [{ lagerort: "asc" }, { id: "desc" }],
  });
  const verkaufsevents = await prisma.verkaufsevent.findMany({
    include: {
      positionen: {
        include: { charge: { include: { produkt: true } } },
        orderBy: [{ id: "desc" }],
      },
    },
    orderBy: [{ datum: "desc" }, { id: "desc" }],
  });
  const verkaufseventPositionen = await prisma.verkaufseventPosition.findMany({
    include: {
      verkaufsevent: true,
      charge: { include: { produkt: true } },
    },
    orderBy: [{ id: "desc" }],
  });
  const params = searchParams ? await searchParams : {};
  const selectedMitarbeiterId = requiredInt(
    getQueryValue(params.mitarbeiterId) ?? null,
  );
  const selectedMitarbeiter =
    mitarbeiter.find((person) => person.id === selectedMitarbeiterId) ??
    mitarbeiter.find((person) => person.rolle === "Admin") ??
    mitarbeiter[0] ??
    null;
  const activeRolle: Rolle =
    selectedMitarbeiter && isRolle(selectedMitarbeiter.rolle)
      ? selectedMitarbeiter.rolle
      : "Admin";
  const canManageCustomers = canAccess(activeRolle, "manageCustomers");
  const canManageEmployees = canAccess(activeRolle, "manageEmployees");
  const canManageOrders = canAccess(activeRolle, "manageOrders");
  const canManageProducts = canAccess(activeRolle, "manageProducts");
  const canManageInventory = canAccess(activeRolle, "manageInventory");
  const canCreateBatches = canAccess(activeRolle, "createBatches");
  const canViewPacklists = canAccess(activeRolle, "viewPacklists");
  const aktiveBestellungen = bestellungen.filter(
    (bestellung) => bestellung.status !== "storniert",
  );
  const ausstehendeZahlungen = aktiveBestellungen.filter(
    (bestellung) => bestellung.zahlungsstatus === "ausstehend",
  );
  const reservierungswarnungen = ausstehendeZahlungen
    .map((bestellung) => ({
      bestellung,
      warnung: getReservierungswarnung(bestellung),
    }))
    .filter((eintrag) => eintrag.warnung !== null);
  const stornierpruefungen = reservierungswarnungen.filter(
    (eintrag) => eintrag.warnung?.level === "critical",
  );
  const verbindlicheBestellungen = aktiveBestellungen.filter(
    (bestellung) => bestellung.status === "verbindlich",
  );
  const werkstattMitarbeiter = mitarbeiter.filter(
    (person) => person.rolle === "Werkstatt-Hilfe",
  );
  const fifoVorschlaege = produkte
    .map((produkt) => {
      const charge = chargen.find(
        (charge) =>
          charge.produktId === produkt.id &&
          charge.status === "freigegeben" &&
          getFreieMenge(charge) > 0,
      );

      return charge
        ? {
            produkt,
            charge,
            verfuegbar: getFreieMenge(charge),
          }
        : null;
    })
    .filter((vorschlag) => vorschlag !== null);
  const chargenMitFreierMenge = chargen
    .map((charge) => ({
      charge,
      frei: getFreieMenge(charge),
    }))
    .filter((eintrag) => eintrag.frei > 0);
  const mhdWarnungen = chargenMitFreierMenge
    .map(({ charge, frei }) => ({
      charge,
      frei,
      warnung: getMhdWarnung(charge),
    }))
    .filter((eintrag) => eintrag.warnung !== null);
  const packlistenBestellungen = verbindlicheBestellungen
    .map((bestellung) => ({
      bestellung,
      positionen: bestellpositionen.filter(
        (position) => position.bestellungId === bestellung.id,
      ),
    }))
    .filter((eintrag) => eintrag.positionen.length > 0);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">
            NW-001 / NW-002 / NW-003 / NW-004 / NW-005 / NW-007 / NW-008 / NW-009 / NW-010 / NW-011 / NW-017 / NW-020 / NW-027 / NW-029 / NW-032 / NW-036
          </p>
          <h1>Arbeitsansicht</h1>
        </div>
        <p className="summary">
          {kunden.length} Kunden · {produkte.length} Produkte ·{" "}
          {bestellungen.length} Bestellungen · {chargen.length} Chargen ·{" "}
          {bestellpositionen.length} Positionen · {lagerbestaende.length} Lagerbestaende ·{" "}
          {verkaufsevents.length} Verkaufsevents - {mitarbeiter.length} Mitarbeitende
        </p>
      </header>

      <section className="workspace-overview" aria-labelledby="rolle-heading">
        <div className="panel role-panel">
          <div>
            <p className="eyebrow">Aktive Rolle</p>
            <h2 id="rolle-heading">
              {selectedMitarbeiter
                ? `${selectedMitarbeiter.name} · ${selectedMitarbeiter.rolle}`
                : "Admin · Ersteinrichtung"}
            </h2>
            <p>
              Die Auswahl steuert serverseitig, welche Arbeitsbereiche diese
              Ansicht anzeigt.
            </p>
          </div>

          {mitarbeiter.length === 0 ? (
            <p className="empty-state">
              Noch keine Mitarbeitenden erfasst. Bis zur ersten Anlage bleibt
              die Admin-Ansicht aktiv.
            </p>
          ) : (
            <form className="role-switcher">
              <label>
                Mitarbeiter
                <select
                  name="mitarbeiterId"
                  defaultValue={selectedMitarbeiter?.id ?? ""}
                >
                  {mitarbeiter.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} · {person.rolle}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit">Ansicht wechseln</button>
            </form>
          )}
        </div>
      </section>

      {canCreateBatches ? (
        <section className="layout-grid feature-section">
          <form action={createCharge} className="panel form-panel">
            <h2>Charge anlegen</h2>

            {produkte.length === 0 || werkstattMitarbeiter.length === 0 ? (
              <p className="empty-state">
                Zuerst Produkt und Werkstatt-Hilfe anlegen.
              </p>
            ) : (
              <>
                <label>
                  Produkt
                  <select name="chargenProduktId" required>
                    {produkte.map((produkt) => (
                      <option key={produkt.id} value={produkt.id}>
                        {produkt.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Werkstatt-Hilfe
                  <select name="chargenMitarbeiterId" required>
                    {werkstattMitarbeiter.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="field-row">
                  <label>
                    Herstellungsdatum
                    <input
                      defaultValue={today}
                      name="herstellungsdatum"
                      required
                      type="date"
                    />
                  </label>

                  <label>
                    MHD
                    <input name="mhd" required type="date" />
                  </label>
                </div>

                <div className="field-row">
                  <label>
                    Produzierte Menge
                    <input min="1" name="produzierteMenge" required type="number" />
                  </label>

                  <label>
                    Status
                    <select
                      name="chargenStatus"
                      defaultValue="freigegeben"
                      required
                    >
                      {chargenstatusWerte.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <button type="submit">Charge speichern</button>
              </>
            )}
          </form>

          <section className="panel list-panel" aria-labelledby="chargen-heading">
            <h2 id="chargen-heading">Chargen</h2>
            {chargen.length === 0 ? (
              <p className="empty-state">Noch keine Chargen erfasst.</p>
            ) : (
              <div className="customer-list">
                {chargen.map((charge) => (
                  <article className="customer-card" key={charge.id}>
                    <div>
                      <h3>Charge #{charge.id}</h3>
                      <p>
                        {charge.produkt.name} · MHD {formatDate(charge.mhd)}
                      </p>
                    </div>
                    <dl>
                      <dt>Herstellung</dt>
                      <dd>{formatDate(charge.herstellungsdatum)}</dd>
                      <dt>Menge</dt>
                      <dd>{charge.produzierteMenge}</dd>
                      <dt>Werkstatt</dt>
                      <dd>{charge.mitarbeiter.name}</dd>
                    </dl>
                    <span className="status-pill">{charge.status}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      ) : null}

      {canManageInventory ? (
        <section className="layout-grid feature-section">
          <form action={createLagerbestand} className="panel form-panel">
            <h2>Lagerbestand erfassen</h2>

            {chargen.length === 0 ? (
              <p className="empty-state">Zuerst eine Charge anlegen.</p>
            ) : (
              <>
                <label>
                  Charge
                  <select name="lagerbestandChargeId" required>
                    {chargen.map((charge) => (
                      <option key={charge.id} value={charge.id}>
                        #{charge.id} · {charge.produkt.name} · MHD{" "}
                        {formatDate(charge.mhd)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Lagerort
                  <select name="lagerort" defaultValue="Werkstatt" required>
                    {lagerorte.map((lagerort) => (
                      <option key={lagerort} value={lagerort}>
                        {lagerort}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="field-row">
                  <label>
                    Voruebergehend reserviert
                    <input
                      defaultValue="0"
                      min="0"
                      name="mengeVoruebergehendReserviert"
                      required
                      type="number"
                    />
                  </label>

                  <label>
                    Verbindlich reserviert
                    <input
                      defaultValue="0"
                      min="0"
                      name="mengeVerbindlichReserviert"
                      required
                      type="number"
                    />
                  </label>
                </div>

                <button type="submit">Lagerbestand speichern</button>
              </>
            )}
          </form>

          <section className="panel list-panel" aria-labelledby="lagerbestand-heading">
            <h2 id="lagerbestand-heading">Lagerbestand</h2>
            {lagerbestaende.length === 0 ? (
              <p className="empty-state">Noch kein Lagerbestand erfasst.</p>
            ) : (
              <div className="customer-list">
                {lagerbestaende.map((bestand) => (
                  <article className="customer-card" key={bestand.id}>
                    <div>
                      <h3>{bestand.lagerort}</h3>
                      <p>
                        Charge #{bestand.charge.id} ·{" "}
                        {bestand.charge.produkt.name} · MHD{" "}
                        {formatDate(bestand.charge.mhd)}
                      </p>
                    </div>
                    <dl>
                      <dt>Produziert</dt>
                      <dd>{bestand.charge.produzierteMenge}</dd>
                      <dt>Voruebergehend</dt>
                      <dd>{bestand.mengeVoruebergehendReserviert}</dd>
                      <dt>Verbindlich</dt>
                      <dd>{bestand.mengeVerbindlichReserviert}</dd>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      ) : null}

      {canManageInventory ? (
        <section className="layout-grid feature-section">
          <form action={createVerkaufsevent} className="panel form-panel">
            <h2>Verkaufsevent anlegen</h2>

            <label>
              Datum
              <input
                defaultValue={today}
                name="verkaufseventDatum"
                required
                type="date"
              />
            </label>

            <label>
              Ort
              <input name="verkaufseventOrt" required />
            </label>

            <button type="submit">Event speichern</button>
          </form>

          <section className="panel list-panel" aria-labelledby="events-heading">
            <h2 id="events-heading">Verkaufsevents</h2>
            {verkaufsevents.length === 0 ? (
              <p className="empty-state">Noch keine Verkaufsevents erfasst.</p>
            ) : (
              <div className="customer-list">
                {verkaufsevents.map((event) => (
                  <article className="customer-card" key={event.id}>
                    <div>
                      <h3>{event.ort}</h3>
                      <p>
                        Event #{event.id} - {formatDate(event.datum)}
                      </p>
                    </div>
                    {event.positionen.length === 0 ? (
                      <p className="note-text">Noch keine Chargen erfasst.</p>
                    ) : (
                      <dl>
                        {event.positionen.map((position) => (
                          <Fragment key={position.id}>
                            <dt>{position.charge.produkt.name}</dt>
                            <dd>
                              Charge #{position.charge.id}:{" "}
                              {position.mengeMitgenommen} mitgenommen,{" "}
                              {position.mengeVerkauft} verkauft
                            </dd>
                          </Fragment>
                        ))}
                      </dl>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      ) : null}

      {canManageInventory ? (
        <section className="layout-grid feature-section">
          <form action={createVerkaufseventPosition} className="panel form-panel">
            <h2>Event-Position erfassen</h2>

            {verkaufsevents.length === 0 || chargenMitFreierMenge.length === 0 ? (
              <p className="empty-state">
                Zuerst Verkaufsevent und freie Charge anlegen.
              </p>
            ) : (
              <>
                <label>
                  Verkaufsevent
                  <select name="verkaufseventId" required>
                    {verkaufsevents.map((event) => (
                      <option key={event.id} value={event.id}>
                        #{event.id} - {event.ort} - {formatDate(event.datum)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Charge
                  <select name="verkaufseventChargeId" required>
                    {chargenMitFreierMenge.map(({ charge, frei }) => (
                      <option key={charge.id} value={charge.id}>
                        #{charge.id} - {charge.produkt.name} - {frei} frei
                      </option>
                    ))}
                  </select>
                </label>

                <div className="field-row">
                  <label>
                    Mitgenommen
                    <input min="1" name="mengeMitgenommen" required type="number" />
                  </label>

                  <label>
                    Verkauft
                    <input
                      defaultValue="0"
                      min="0"
                      name="mengeVerkauft"
                      required
                      type="number"
                    />
                  </label>
                </div>

                <button type="submit">Position speichern</button>
              </>
            )}
          </form>

          <section
            className="panel list-panel"
            aria-labelledby="event-positionen-heading"
          >
            <h2 id="event-positionen-heading">Event-Positionen</h2>
            {verkaufseventPositionen.length === 0 ? (
              <p className="empty-state">Noch keine Event-Positionen erfasst.</p>
            ) : (
              <div className="customer-list">
                {verkaufseventPositionen.map((position) => (
                  <article className="customer-card" key={position.id}>
                    <div>
                      <h3>{position.verkaufsevent.ort}</h3>
                      <p>
                        {formatDate(position.verkaufsevent.datum)} -{" "}
                        {position.charge.produkt.name}
                      </p>
                    </div>
                    <dl>
                      <dt>Charge</dt>
                      <dd>#{position.charge.id}</dd>
                      <dt>Mitgenommen</dt>
                      <dd>{position.mengeMitgenommen}</dd>
                      <dt>Verkauft</dt>
                      <dd>{position.mengeVerkauft}</dd>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      ) : null}

      {canViewPacklists && !canManageOrders ? (
        <section className="workspace-overview" aria-labelledby="packliste-heading">
          <div className="panel overview-panel">
            <div className="overview-header">
              <div>
                <p className="eyebrow">Packer</p>
                <h2 id="packliste-heading">Tages-Packliste</h2>
              </div>
              <p className="summary">
                {packlistenBestellungen.length} Bestellungen
              </p>
            </div>

            {packlistenBestellungen.length === 0 ? (
              <p className="empty-state">Keine Packaufgaben vorhanden.</p>
            ) : (
              <div className="packlist">
                {packlistenBestellungen.map(({ bestellung, positionen }) => (
                  <article className="packlist-order" key={bestellung.id}>
                    <div className="packlist-header">
                      <div>
                        <h3>{bestellung.kunde.name}</h3>
                        <p>{bestellung.lieferadresse ?? "Keine Lieferadresse erfasst"}</p>
                      </div>
                      <span className="status-pill">Bestellung #{bestellung.id}</span>
                    </div>

                    <div className="packlist-items">
                      {positionen.map((position) => (
                        <div className="packlist-item" key={position.id}>
                          <div>
                            <strong>{position.produkt.name}</strong>
                            <p>
                              Charge #{position.charge.id} · MHD{" "}
                              {formatDate(position.charge.mhd)}
                            </p>
                          </div>
                          <span>{position.menge}x</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {canManageOrders ? (
        <section className="workspace-overview" aria-labelledby="arbeit-heading">
        <div className="panel overview-panel">
          <div className="overview-header">
            <div>
              <p className="eyebrow">Heute offen</p>
              <h2 id="arbeit-heading">Aktive Arbeitsansicht</h2>
            </div>
            <p className="summary">{aktiveBestellungen.length} offene Aufgaben</p>
          </div>

          <div className="metric-grid">
            <div className="metric-tile">
              <span>Ausstehende Zahlungen</span>
              <strong>{ausstehendeZahlungen.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Reservierungswarnungen</span>
              <strong>{reservierungswarnungen.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Stornierung pruefen</span>
              <strong>{stornierpruefungen.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Verbindliche Bestellungen</span>
              <strong>{verbindlicheBestellungen.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Stornierte ausgeblendet</span>
              <strong>{bestellungen.length - aktiveBestellungen.length}</strong>
            </div>
            <div className="metric-tile">
              <span>MHD-Warnungen</span>
              <strong>{mhdWarnungen.length}</strong>
            </div>
          </div>

          {aktiveBestellungen.length === 0 ? (
            <p className="empty-state">Keine offenen Aufgaben.</p>
          ) : (
            <div className="task-list">
              {aktiveBestellungen.slice(0, 6).map((bestellung) => (
                <article className="task-item" key={bestellung.id}>
                  <div>
                    <h3>Bestellung #{bestellung.id}</h3>
                    <p>
                      {bestellung.kunde.name} Â· {bestellung.kanal} Â·{" "}
                      {formatDate(bestellung.datum)}
                    </p>
                    {getReservierungswarnung(bestellung) ? (
                      <p
                        className={`warning-text ${
                          getReservierungswarnung(bestellung)?.level ===
                          "critical"
                            ? "critical"
                            : ""
                        }`}
                      >
                        {getReservierungswarnung(bestellung)?.text}
                      </p>
                    ) : null}
                  </div>
                  <div className="task-meta">
                    <span className="status-pill">
                      {bestellung.zahlungsstatus}
                    </span>
                    <span className="status-pill">{bestellung.status}</span>
                    <strong>{getNextBestellschritt(bestellung)}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}

          {mhdWarnungen.length === 0 ? null : (
            <div className="task-list">
              {mhdWarnungen.map(({ charge, frei, warnung }) => (
                <article className="task-item" key={charge.id}>
                  <div>
                    <h3>Charge #{charge.id}</h3>
                    <p>
                      {charge.produkt.name} - MHD {formatDate(charge.mhd)} -{" "}
                      {frei} frei
                    </p>
                    <p
                      className={`warning-text ${
                        warnung?.level === "critical" ? "critical" : ""
                      }`}
                    >
                      {warnung?.text}
                    </p>
                  </div>
                  <div className="task-meta">
                    <span className="status-pill">
                      {warnung?.rabatt} % Vorschlag
                    </span>
                    <strong>Manuell bestaetigen</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        </section>
      ) : null}

      {canManageCustomers ? (
        <section className="layout-grid">
        <form action={createKunde} className="panel form-panel">
          <h2>Kunde anlegen</h2>

          <label>
            Name
            <input name="name" required />
          </label>

          <div className="field-row">
            <label>
              Kundentyp
              <select name="typ" defaultValue="B2C" required>
                {kundentypen.map((typ) => (
                  <option key={typ} value={typ}>
                    {typ}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Hauttyp
              <select name="hauttyp" defaultValue="">
                <option value="">Nicht erfasst</option>
                {hauttypen.map((hauttyp) => (
                  <option key={hauttyp} value={hauttyp}>
                    {hauttyp}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-row">
            <label>
              Firmenname
              <input name="firmenname" />
            </label>

            <label>
              USt-ID
              <input name="ustId" />
            </label>
          </div>

          <div className="field-row">
            <label>
              E-Mail
              <input name="email" type="email" />
            </label>

            <label>
              Instagram
              <input name="instagramHandle" placeholder="@name" />
            </label>
          </div>

          <label>
            Adresse
            <textarea name="adresse" rows={3} />
          </label>

          <div className="field-row">
            <label>
              Zahlungsziel in Tagen
              <input min="0" name="zahlungsziel" type="number" />
            </label>

            <label className="checkbox-label">
              <input name="stammkunde" type="checkbox" />
              Stammkunde
            </label>
          </div>

          <label>
            Vorlieben
            <textarea name="vorlieben" rows={3} />
          </label>

          <button type="submit">Kunde speichern</button>
        </form>

        <section className="panel list-panel" aria-labelledby="kunden-heading">
          <h2 id="kunden-heading">Kunden</h2>
          {kunden.length === 0 ? (
            <p className="empty-state">Noch keine Kunden erfasst.</p>
          ) : (
            <div className="customer-list">
              {kunden.map((kunde) => (
                <article className="customer-card" key={kunde.id}>
                  <div>
                    <h3>{kunde.name}</h3>
                    <p>
                      {kunde.typ}
                      {kunde.hauttyp ? ` · ${kunde.hauttyp}` : ""}
                    </p>
                  </div>
                  <dl>
                    {kunde.firmenname ? (
                      <>
                        <dt>Firma</dt>
                        <dd>{kunde.firmenname}</dd>
                      </>
                    ) : null}
                    {kunde.email ? (
                      <>
                        <dt>E-Mail</dt>
                        <dd>{kunde.email}</dd>
                      </>
                    ) : null}
                    {kunde.instagramHandle ? (
                      <>
                        <dt>Instagram</dt>
                        <dd>{kunde.instagramHandle}</dd>
                      </>
                    ) : null}
                    {kunde.zahlungsziel !== null ? (
                      <>
                        <dt>Zahlungsziel</dt>
                        <dd>{kunde.zahlungsziel} Tage</dd>
                      </>
                    ) : null}
                  </dl>
                  {kunde.stammkunde ? (
                    <span className="status-pill">Stammkunde</span>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
        </section>
      ) : null}

      {canManageEmployees ? (
        <section className="layout-grid feature-section">
        <form action={createMitarbeiter} className="panel form-panel">
          <h2>Mitarbeiter anlegen</h2>

          <label>
            Name
            <input name="mitarbeiterName" required />
          </label>

          <label>
            Rolle
            <select name="rolle" defaultValue="Packer" required>
              {rollen.map((rolle) => (
                <option key={rolle} value={rolle}>
                  {rolle}
                </option>
              ))}
            </select>
          </label>

          <div className="field-row">
            <label>
              E-Mail
              <input name="mitarbeiterEmail" type="email" />
            </label>

            <label>
              Telefonnummer
              <input name="telefonnummer" />
            </label>
          </div>

          <label>
            Zugriffsrechte
            <textarea name="zugriffsrechte" rows={3} />
          </label>

          <button type="submit">Mitarbeiter speichern</button>
        </form>

        <section className="panel list-panel" aria-labelledby="mitarbeiter-heading">
          <h2 id="mitarbeiter-heading">Mitarbeitende</h2>
          {mitarbeiter.length === 0 ? (
            <p className="empty-state">Noch keine Mitarbeitenden erfasst.</p>
          ) : (
            <div className="customer-list">
              {mitarbeiter.map((person) => (
                <article className="customer-card" key={person.id}>
                  <div>
                    <h3>{person.name}</h3>
                    <p>{person.rolle}</p>
                  </div>
                  <dl>
                    {person.email ? (
                      <>
                        <dt>E-Mail</dt>
                        <dd>{person.email}</dd>
                      </>
                    ) : null}
                    {person.telefonnummer ? (
                      <>
                        <dt>Telefon</dt>
                        <dd>{person.telefonnummer}</dd>
                      </>
                    ) : null}
                    {person.zugriffsrechte ? (
                      <>
                        <dt>Rechte</dt>
                        <dd>{person.zugriffsrechte}</dd>
                      </>
                    ) : null}
                  </dl>
                  <span className="status-pill">{person.rolle}</span>
                </article>
              ))}
            </div>
          )}
        </section>
        </section>
      ) : null}

      {canManageOrders ? (
        <section className="layout-grid feature-section">
        <form action={createBestellung} className="panel form-panel">
          <h2>Bestellung anlegen</h2>

          {kunden.length === 0 ? (
            <p className="empty-state">Zuerst einen Kunden anlegen.</p>
          ) : (
            <>
              <label>
                Kunde
                <select name="kundeId" required>
                  {kunden.map((kunde) => (
                    <option key={kunde.id} value={kunde.id}>
                      {kunde.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="field-row">
                <label>
                  Datum
                  <input defaultValue={today} name="datum" required type="date" />
                </label>

                <label>
                  Kanal
                  <select name="kanal" defaultValue="Instagram" required>
                    {bestellkanaele.map((kanal) => (
                      <option key={kanal} value={kanal}>
                        {kanal}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Zahlungsstatus
                <select name="zahlungsstatus" defaultValue="ausstehend" required>
                  {zahlungsstatusWerte.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Lieferadresse
                <textarea name="lieferadresse" rows={3} />
              </label>

              <button type="submit">Bestellung speichern</button>
            </>
          )}
        </form>

        <section className="panel list-panel" aria-labelledby="bestellungen-heading">
          <h2 id="bestellungen-heading">Bestellungen</h2>
          {bestellungen.length === 0 ? (
            <p className="empty-state">Noch keine Bestellungen erfasst.</p>
          ) : (
            <div className="customer-list">
              {bestellungen.map((bestellung) => (
                <article className="customer-card" key={bestellung.id}>
                  <div>
                    <h3>Bestellung #{bestellung.id}</h3>
                    <p>
                      {bestellung.kunde.name} · {bestellung.kanal} ·{" "}
                      {formatDate(bestellung.datum)}
                    </p>
                  </div>
                  <dl>
                    <dt>Zahlung</dt>
                    <dd>
                      <span className="status-pill">
                        {bestellung.zahlungsstatus}
                      </span>
                    </dd>
                    <dt>Status</dt>
                    <dd>
                      <span className="status-pill">{bestellung.status}</span>
                    </dd>
                    {bestellung.lieferadresse ? (
                      <>
                        <dt>Lieferadresse</dt>
                        <dd>{bestellung.lieferadresse}</dd>
                      </>
                    ) : null}
                  </dl>
                </article>
              ))}
            </div>
          )}
        </section>
        </section>
      ) : null}

      {canManageOrders ? (
        <section className="layout-grid feature-section">
          <form action={createBestellposition} className="panel form-panel">
            <h2>Bestellposition anlegen</h2>

            {bestellungen.length === 0 || fifoVorschlaege.length === 0 ? (
              <p className="empty-state">
                Zuerst Bestellung und freigegebene Charge mit Bestand anlegen.
              </p>
            ) : (
              <>
                <label>
                  Bestellung
                  <select name="positionBestellungId" required>
                    {bestellungen.map((bestellung) => (
                      <option key={bestellung.id} value={bestellung.id}>
                        #{bestellung.id} · {bestellung.kunde.name} ·{" "}
                        {formatDate(bestellung.datum)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Produkt
                  <select name="positionProduktId" required>
                    {fifoVorschlaege.map((vorschlag) => (
                      <option
                        key={vorschlag.produkt.id}
                        value={vorschlag.produkt.id}
                      >
                        {vorschlag.produkt.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Menge
                  <input min="1" name="positionMenge" required type="number" />
                </label>

                <div className="fifo-box">
                  <p className="eyebrow">FIFO-Vorschlag</p>
                  <div className="customer-list">
                    {fifoVorschlaege.map((vorschlag) => (
                      <article className="task-item" key={vorschlag.produkt.id}>
                        <div>
                          <h3>{vorschlag.produkt.name}</h3>
                          <p>
                            Charge #{vorschlag.charge.id} · MHD{" "}
                            {formatDate(vorschlag.charge.mhd)}
                          </p>
                        </div>
                        <div className="task-meta">
                          <span className="status-pill">
                            {vorschlag.verfuegbar} verfuegbar
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <button type="submit">Position speichern</button>
              </>
            )}
          </form>

          <section className="panel list-panel" aria-labelledby="positionen-heading">
            <h2 id="positionen-heading">Bestellpositionen</h2>
            {bestellpositionen.length === 0 ? (
              <p className="empty-state">Noch keine Bestellpositionen erfasst.</p>
            ) : (
              <div className="customer-list">
                {bestellpositionen.map((position) => (
                  <article className="customer-card" key={position.id}>
                    <div>
                      <h3>Bestellung #{position.bestellung.id}</h3>
                      <p>
                        {position.bestellung.kunde.name} ·{" "}
                        {position.produkt.name}
                      </p>
                    </div>
                    <dl>
                      <dt>Menge</dt>
                      <dd>{position.menge}</dd>
                      <dt>Charge</dt>
                      <dd>
                        #{position.charge.id} · MHD{" "}
                        {formatDate(position.charge.mhd)}
                      </dd>
                      <dt>Status</dt>
                      <dd>{position.bestellung.status}</dd>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      ) : null}

      {canManageProducts ? (
        <section className="layout-grid feature-section">
        <form action={createProdukt} className="panel form-panel">
          <h2>Produkt anlegen</h2>

          <label>
            Name
            <input name="produktName" required />
          </label>

          <div className="field-row">
            <label>
              Kategorie
              <select name="kategorie" defaultValue="Seifen" required>
                {produktkategorien.map((kategorie) => (
                  <option key={kategorie} value={kategorie}>
                    {kategorie}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Standard-MHD in Monaten
              <input
                min="1"
                name="standardMhdDauerMonate"
                required
                type="number"
              />
            </label>
          </div>

          <div className="field-row">
            <label>
              Preis B2C
              <input min="0" name="preisB2c" required step="0.01" type="number" />
            </label>

            <label>
              Preis B2B
              <input min="0" name="preisB2b" required step="0.01" type="number" />
            </label>
          </div>

          <label>
            B2C-Puffermenge
            <input
              min="0"
              name="b2cPuffermenge"
              required
              step="0.01"
              type="number"
            />
          </label>

          <label>
            Inhaltsstoffe
            <textarea name="inhaltsstoffe" rows={3} />
          </label>

          <label>
            Allergene
            <input name="allergene" />
          </label>

          <div className="field-row">
            <label className="checkbox-label">
              <input name="vegan" type="checkbox" />
              Vegan
            </label>

            <label className="checkbox-label">
              <input name="inAboBoxEnthalten" type="checkbox" />
              In Abo-Box enthalten
            </label>
          </div>

          <button type="submit">Produkt speichern</button>
        </form>

        <section className="panel list-panel" aria-labelledby="produkte-heading">
          <h2 id="produkte-heading">Produkte</h2>
          {produkte.length === 0 ? (
            <p className="empty-state">Noch keine Produkte erfasst.</p>
          ) : (
            <div className="customer-list">
              {produkte.map((produkt) => (
                <article className="customer-card" key={produkt.id}>
                  <div>
                    <h3>{produkt.name}</h3>
                    <p>
                      {produkt.kategorie}
                      {produkt.vegan ? " · vegan" : ""}
                      {produkt.inAboBoxEnthalten ? " · Abo-Box" : ""}
                    </p>
                  </div>
                  <dl>
                    <dt>Preis B2C</dt>
                    <dd>{formatCurrency(produkt.preisB2c)}</dd>
                    <dt>Preis B2B</dt>
                    <dd>{formatCurrency(produkt.preisB2b)}</dd>
                    <dt>B2C-Puffer</dt>
                    <dd>{produkt.b2cPuffermenge.toString()}</dd>
                    <dt>Standard-MHD</dt>
                    <dd>{produkt.standardMhdDauerMonate} Monate</dd>
                    {produkt.allergene ? (
                      <>
                        <dt>Allergene</dt>
                        <dd>{produkt.allergene}</dd>
                      </>
                    ) : null}
                  </dl>
                  {produkt.inhaltsstoffe ? (
                    <p className="note-text">{produkt.inhaltsstoffe}</p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
        </section>
      ) : null}
    </main>
  );
}
