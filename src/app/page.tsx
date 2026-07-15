import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
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
import {
  isPaketstatus,
  isVersandoption,
  paketstatusWerte,
  versandoptionen,
} from "@/lib/package-options";
import {
  erstattungsarten,
  isErstattungsart,
  isProduktzustand,
  isRetourenstatus,
  produktzustandWerte,
  retourenstatusWerte,
} from "@/lib/return-options";
import {
  aboBoxStatusWerte,
  isAboBoxStatus,
} from "@/lib/subscription-options";

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

function nullableDate(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  if (!text) {
    return null;
  }

  const date = new Date(`${text}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function requiredMonth(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  const match = text?.match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const jahr = Number.parseInt(match[1], 10);
  const monat = Number.parseInt(match[2], 10);

  if (Number.isNaN(jahr) || Number.isNaN(monat) || monat < 1 || monat > 12) {
    return null;
  }

  return { jahr, monat };
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

function formatMonth(jahr: number, monat: number) {
  return new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric",
  }).format(new Date(jahr, monat - 1, 1));
}

function formatDecimalInput(value: unknown) {
  return Number(value).toFixed(2);
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

function getHoursSince(value: Date, now = new Date()) {
  return Math.max(
    0,
    Math.floor((now.getTime() - value.getTime()) / 3_600_000),
  );
}

function addMonths(value: Date, months: number) {
  const date = new Date(value);
  date.setMonth(date.getMonth() + months);
  return date;
}

function getDaysUntil(value: Date, now = new Date()) {
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - start.getTime()) / 86_400_000);
}

function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function getAboAbwicklungsdatum(jahr: number, monat: number) {
  return new Date(jahr, monat - 1, 15);
}

function getMonatsdatum(monat: { jahr: number; monat: number }) {
  return new Date(monat.jahr, monat.monat - 1, 1);
}

function getMonatsabstand(start: Date, ende: Date) {
  return (
    (ende.getFullYear() - start.getFullYear()) * 12 +
    ende.getMonth() -
    start.getMonth()
  );
}

function getPausenAnmeldefrist(pausiertVon: Date) {
  return new Date(pausiertVon.getFullYear(), pausiertVon.getMonth() - 1, 15);
}

function isPausenzeitraumGueltig(pausiertVon: Date, pausiertBis: Date) {
  const abstand = getMonatsabstand(pausiertVon, pausiertBis);
  return abstand >= 0 && abstand <= 1;
}

function isPausenanmeldungFristgerecht(
  pausiertVon: Date,
  now = new Date(),
) {
  const heute = new Date(now);
  heute.setHours(0, 0, 0, 0);

  const frist = getPausenAnmeldefrist(pausiertVon);
  frist.setHours(0, 0, 0, 0);

  return heute <= frist;
}

function isAboBoxImMonatPausiert(
  aboBox: { pausiertVon: Date | null; pausiertBis: Date | null },
  monat: { jahr: number; monat: number },
) {
  if (!aboBox.pausiertVon || !aboBox.pausiertBis) {
    return false;
  }

  const zielmonat = getMonatsdatum(monat);

  return zielmonat >= aboBox.pausiertVon && zielmonat <= aboBox.pausiertBis;
}

function getAboPausenwarnung(aboBox: {
  pausiertBis: Date | null;
}) {
  if (!aboBox.pausiertBis) {
    return null;
  }

  const naechsterMonatNachPause = new Date(
    aboBox.pausiertBis.getFullYear(),
    aboBox.pausiertBis.getMonth() + 1,
    1,
  );
  const aktuellerMonat = new Date();
  aktuellerMonat.setDate(1);
  aktuellerMonat.setHours(0, 0, 0, 0);

  if (aktuellerMonat < naechsterMonatNachPause) {
    return null;
  }

  return "Abo-Pause ist abgelaufen, Status mit Kunde pruefen";
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

function hatUnbestaetigteAllergene(bestellung: {
  allergeneBestaetigtAm: Date | null;
  positionen: Array<{ produkt: { allergene: string | null } }>;
}) {
  return (
    !bestellung.allergeneBestaetigtAm &&
    bestellung.positionen.some((position) =>
      Boolean(position.produkt.allergene?.trim()),
    )
  );
}

function getPositionspreis(position: {
  menge: number;
  produkt: { preisB2b: unknown; preisB2c: unknown };
  bestellung: { kunde: { stammkunde: boolean; typ: string } };
}) {
  const nutztB2bPreis = position.bestellung.kunde.typ === "B2B" && position.menge >= 50;
  const basispreis = nutztB2bPreis
    ? Number(position.produkt.preisB2b)
    : Number(position.produkt.preisB2c);
  const einzelpreis =
    !nutztB2bPreis && position.bestellung.kunde.stammkunde
      ? basispreis * 0.9
      : basispreis;

  return einzelpreis * position.menge;
}

function getBestellwert(positionen: Array<{
  menge: number;
  produkt: { preisB2b: unknown; preisB2c: unknown };
  bestellung: { kunde: { stammkunde: boolean; typ: string } };
}>) {
  return positionen.reduce(
    (summe, position) => summe + getPositionspreis(position),
    0,
  );
}

function getVersandkostenVorschlag(bestellung: {
  kanal: string;
  kunde: { typ: string };
  positionen: Array<{
    menge: number;
    produkt: { preisB2b: unknown; preisB2c: unknown };
    bestellung: { kunde: { stammkunde: boolean; typ: string } };
  }>;
}) {
  if (bestellung.kanal === "Abo" || bestellung.kunde.typ === "B2B") {
    return 0;
  }

  return getBestellwert(bestellung.positionen) >= 39 ? 0 : 4.5;
}

function getRetourenfrist(bestellung: {
  kanal: string;
  kunde: { typ: string };
  pakete: Array<{ zustelldatum: Date | null }>;
}) {
  const zugestelltePakete = bestellung.pakete
    .filter((paket) => paket.zustelldatum)
    .sort(
      (a, b) =>
        Number(a.zustelldatum?.getTime() ?? 0) -
        Number(b.zustelldatum?.getTime() ?? 0),
    );
  const zustelldatum = zugestelltePakete[0]?.zustelldatum ?? null;

  if (!zustelldatum) {
    return null;
  }

  const fristTage =
    bestellung.kanal === "Abo" || bestellung.kunde.typ === "B2B" ? 7 : 14;

  return {
    fristTage,
    fristEnde: addDays(zustelldatum, fristTage),
    zustelldatum,
  };
}

function istRetourenfaehig({
  bestellung,
  produktzustand,
  now = new Date(),
}: {
  bestellung: {
    kanal: string;
    kunde: { typ: string };
    pakete: Array<{ zustelldatum: Date | null }>;
  };
  produktzustand: string;
  now?: Date;
}) {
  const frist = getRetourenfrist(bestellung);

  if (!frist) {
    return false;
  }

  if (getDaysSince(frist.zustelldatum, now) > frist.fristTage) {
    return false;
  }

  if (bestellung.kanal === "Abo" || bestellung.kunde.typ === "B2B") {
    return produktzustand === "Beschaedigt" || produktzustand === "Mangelhaft";
  }

  return true;
}

function getRetoureBestandsbuchung(retoure: {
  produktzustand: string;
  bestellposition: { charge: { mhd: Date } };
}) {
  if (retoure.produktzustand !== "Ungeoeffnet") {
    return "Ausgebucht";
  }

  return getDaysUntil(retoure.bestellposition.charge.mhd) > 28
    ? "Zurueckgebucht"
    : "Restposten";
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

function getGanzePuffermenge(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.ceil(number) : 0;
}

function schuetztB2cPuffer({
  charge,
  kundeTyp,
  menge,
  produkt,
}: {
  charge: {
    produzierteMenge: number;
    lagerbestaende: Array<{
      mengeVoruebergehendReserviert: number;
      mengeVerbindlichReserviert: number;
    }>;
    verkaufseventPositionen?: Array<{ mengeMitgenommen: number }>;
  };
  kundeTyp: string;
  menge: number;
  produkt: { b2cPuffermenge: unknown };
}) {
  if (kundeTyp !== "B2B" || menge < 50) {
    return true;
  }

  return (
    getFreieMenge(charge) - menge >= getGanzePuffermenge(produkt.b2cPuffermenge)
  );
}

function getPhysischVerfuegbareMenge(charge: {
  produzierteMenge: number;
  verkaufseventPositionen?: Array<{ mengeMitgenommen: number }>;
}) {
  const eventMengen =
    charge.verkaufseventPositionen?.reduce(
      (summe, position) => summe + position.mengeMitgenommen,
      0,
    ) ?? 0;

  return charge.produzierteMenge - eventMengen;
}

function getKnappheitsPrioritaet(position: {
  bestellung: { datum: Date; id: number; kunde: { stammkunde: boolean } };
}) {
  return {
    gruppe: position.bestellung.kunde.stammkunde ? 0 : 1,
    datum: position.bestellung.datum.getTime(),
    bestellungId: position.bestellung.id,
  };
}

function compareKnappheitsPrioritaet(
  a: {
    bestellung: { datum: Date; id: number; kunde: { stammkunde: boolean } };
  },
  b: {
    bestellung: { datum: Date; id: number; kunde: { stammkunde: boolean } };
  },
) {
  const prioritaetA = getKnappheitsPrioritaet(a);
  const prioritaetB = getKnappheitsPrioritaet(b);

  return (
    prioritaetA.gruppe - prioritaetB.gruppe ||
    prioritaetA.datum - prioritaetB.datum ||
    prioritaetA.bestellungId - prioritaetB.bestellungId
  );
}

function getKnappheitsPrioritaetslabel(position: {
  bestellung: { kunde: { stammkunde: boolean } };
}) {
  return position.bestellung.kunde.stammkunde
    ? "Stammkunde"
    : "B2C-Neukunde";
}

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function aktualisiereStammkundeStatus(
  tx: Prisma.TransactionClient,
  kundeId: number,
) {
  const seit = addDays(new Date(), -365);
  const abgeschlosseneBestellungen = await tx.bestellung.count({
    where: {
      kundeId,
      status: "abgeschlossen",
      datum: { gte: seit },
    },
  });

  if (abgeschlosseneBestellungen < 6) {
    return;
  }

  await tx.kunde.updateMany({
    where: { id: kundeId, stammkunde: false },
    data: { stammkunde: true },
  });
}

async function aktualisiereAlleStammkunden() {
  const kundenMitAbschluessen = await prisma.kunde.findMany({
    where: {
      stammkunde: false,
      bestellungen: {
        some: {
          status: "abgeschlossen",
          datum: { gte: addDays(new Date(), -365) },
        },
      },
    },
    select: { id: true },
  });

  for (const kunde of kundenMitAbschluessen) {
    await prisma.$transaction((tx) => aktualisiereStammkundeStatus(tx, kunde.id));
  }
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

async function createAboBox(formData: FormData) {
  "use server";

  const kundeId = requiredInt(formData.get("aboBoxKundeId"));
  const lieferadresse = formData.get("aboBoxLieferadresse")?.toString().trim() ?? "";
  const status = formData.get("aboBoxStatus")?.toString() ?? "";
  const startdatum = requiredDate(formData.get("aboBoxStartdatum"));
  const pausiertVonMonat = requiredMonth(formData.get("aboBoxPausiertVon"));
  const pausiertBisMonat = requiredMonth(formData.get("aboBoxPausiertBis"));
  const kuendigungsdatum = nullableDate(formData.get("aboBoxKuendigungsdatum"));
  const pausiertVon = pausiertVonMonat
    ? getMonatsdatum(pausiertVonMonat)
    : null;
  const pausiertBis = pausiertBisMonat
    ? getMonatsdatum(pausiertBisMonat)
    : null;

  if (!kundeId || !lieferadresse || !isAboBoxStatus(status) || !startdatum) {
    return;
  }

  if (
    (pausiertVon || pausiertBis) &&
    (!pausiertVon ||
      !pausiertBis ||
      !isPausenzeitraumGueltig(pausiertVon, pausiertBis) ||
      !isPausenanmeldungFristgerecht(pausiertVon))
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

  await prisma.aboBox.create({
    data: {
      kundeId,
      lieferadresse,
      status,
      startdatum,
      pausiertSeit: pausiertVon ? new Date() : null,
      pausiertVon,
      pausiertBis,
      kuendigungsdatum: status === "gekuendigt" ? kuendigungsdatum : null,
    },
  });

  revalidatePath("/");
}

async function createAboAbwicklung(formData: FormData) {
  "use server";

  const monat = requiredMonth(formData.get("aboAbwicklungMonat"));
  const allergeneBestaetigt =
    formData.get("aboAbwicklungAllergeneBestaetigt") === "on";

  if (!monat) {
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const bestehendeAbwicklung = await tx.aboAbwicklung.findUnique({
        where: {
          jahr_monat: {
            jahr: monat.jahr,
            monat: monat.monat,
          },
        },
        select: { id: true },
      });

      if (bestehendeAbwicklung) {
        return;
      }

      const abwicklungsdatum = getAboAbwicklungsdatum(
        monat.jahr,
        monat.monat,
      );
      const [aktiveAboBoxen, aboProdukte] = await Promise.all([
        tx.aboBox.findMany({
          where: {
            status: "aktiv",
            startdatum: { lte: abwicklungsdatum },
          },
          include: { kunde: true },
          orderBy: [{ id: "asc" }],
        }),
        tx.produkt.findMany({
          where: { inAboBoxEnthalten: true },
          orderBy: [{ kategorie: "asc" }, { name: "asc" }, { id: "asc" }],
        }),
      ]);

      if (aktiveAboBoxen.length === 0 || aboProdukte.length !== 4) {
        return;
      }

      const abzuwickelndeAboBoxen = aktiveAboBoxen.filter(
        (aboBox) => !isAboBoxImMonatPausiert(aboBox, monat),
      );

      if (abzuwickelndeAboBoxen.length === 0) {
        return;
      }

      const brauchtAllergenbestaetigung = aboProdukte.some((produkt) =>
        Boolean(produkt.allergene?.trim()),
      );

      if (brauchtAllergenbestaetigung && !allergeneBestaetigt) {
        return;
      }

      const produktIds = aboProdukte.map((produkt) => produkt.id);
      const chargenFuerAbo = await tx.charge.findMany({
        where: {
          produktId: { in: produktIds },
          status: "freigegeben",
        },
        include: {
          lagerbestaende: true,
          verkaufseventPositionen: { select: { mengeMitgenommen: true } },
        },
        orderBy: [{ mhd: "asc" }, { id: "asc" }],
      });
      const freieMengen = new Map(
        chargenFuerAbo.map((charge) => [charge.id, getFreieMenge(charge)]),
      );
      const positionenProAboBox = abzuwickelndeAboBoxen.map((aboBox) => {
        const positionen = aboProdukte.map((produkt) => {
          const charge = chargenFuerAbo.find(
            (candidate) =>
              candidate.produktId === produkt.id &&
              (freieMengen.get(candidate.id) ?? 0) >= 1,
          );

          if (!charge) {
            return null;
          }

          freieMengen.set(charge.id, (freieMengen.get(charge.id) ?? 0) - 1);

          return { produkt, charge };
        });

        if (positionen.some((position) => position === null)) {
          return null;
        }

        return {
          aboBox,
          positionen: positionen as Array<{
            produkt: (typeof aboProdukte)[number];
            charge: (typeof chargenFuerAbo)[number];
          }>,
        };
      });

      if (positionenProAboBox.some((eintrag) => eintrag === null)) {
        return;
      }

      const abwicklung = await tx.aboAbwicklung.create({
        data: {
          jahr: monat.jahr,
          monat: monat.monat,
        },
      });

      for (const eintrag of positionenProAboBox) {
        if (!eintrag) {
          continue;
        }

        const bestellung = await tx.bestellung.create({
          data: {
            kundeId: eintrag.aboBox.kundeId,
            datum: abwicklungsdatum,
            kanal: "Abo",
            lieferadresse: eintrag.aboBox.lieferadresse,
            allergeneBestaetigtAm: brauchtAllergenbestaetigung
              ? new Date()
              : null,
            zahlungsstatus: "bezahlt",
            status: "verbindlich",
            aboAbwicklungId: abwicklung.id,
          },
        });

        for (const position of eintrag.positionen) {
          await tx.bestellposition.create({
            data: {
              bestellungId: bestellung.id,
              produktId: position.produkt.id,
              chargeId: position.charge.id,
              menge: 1,
            },
          });

          await tx.lagerbestand.upsert({
            where: {
              chargeId_lagerort: {
                chargeId: position.charge.id,
                lagerort: getReservierungsLagerort(position.charge),
              },
            },
            create: {
              chargeId: position.charge.id,
              lagerort: getReservierungsLagerort(position.charge),
              mengeVoruebergehendReserviert: 0,
              mengeVerbindlichReserviert: 1,
            },
            update: { mengeVerbindlichReserviert: { increment: 1 } },
          });
        }
      }
    });
  } catch {
    return;
  }

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
      select: {
        id: true,
        allergeneBestaetigtAm: true,
        zahlungsstatus: true,
        kunde: { select: { typ: true } },
      },
    }),
    prisma.produkt.findUnique({
      where: { id: produktId },
      select: { id: true, allergene: true, b2cPuffermenge: true },
    }),
    prisma.charge.findMany({
      where: { produktId, status: "freigegeben" },
      include: {
        lagerbestaende: true,
        verkaufseventPositionen: { select: { mengeMitgenommen: true } },
      },
      orderBy: [{ mhd: "asc" }, { id: "asc" }],
    }),
  ]);

  if (!bestellung || !produkt) {
    return;
  }

  const allergenBestaetigt = formData.get("allergeneBestaetigt") === "on";
  const brauchtAllergenbestaetigung = Boolean(produkt.allergene?.trim());

  if (
    brauchtAllergenbestaetigung &&
    !allergenBestaetigt &&
    !bestellung.allergeneBestaetigtAm
  ) {
    return;
  }

  const vorgeschlageneCharge = chargenFuerProdukt.find(
    (charge) =>
      getFreieMenge(charge) >= menge &&
      schuetztB2cPuffer({
        charge,
        kundeTyp: bestellung.kunde.typ,
        menge,
        produkt,
      }),
  );

  if (!vorgeschlageneCharge) {
    return;
  }

  const lagerort = getReservierungsLagerort(vorgeschlageneCharge);
  const isVerbindlich = bestellung.zahlungsstatus === "bezahlt";

  await prisma.$transaction(async (tx) => {
    if (brauchtAllergenbestaetigung && allergenBestaetigt) {
      await tx.bestellung.update({
        where: { id: bestellungId },
        data: { allergeneBestaetigtAm: new Date() },
      });
    }

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

async function createPaket(formData: FormData) {
  "use server";

  const bestellungId = requiredInt(formData.get("paketBestellungId"));
  const mitarbeiterId = requiredInt(formData.get("paketMitarbeiterId"));
  const versandoption = formData.get("versandoption")?.toString() ?? "";
  const versandkosten = requiredDecimal(formData.get("versandkosten"));
  const status = formData.get("paketStatus")?.toString() ?? "";
  const versanddatum = nullableDate(formData.get("versanddatum"));
  const zustelldatum = nullableDate(formData.get("zustelldatum"));

  if (
    !bestellungId ||
    !mitarbeiterId ||
    !isVersandoption(versandoption) ||
    !versandkosten ||
    !isPaketstatus(status)
  ) {
    return;
  }

  const [bestellung, mitarbeiter] = await Promise.all([
    prisma.bestellung.findUnique({
      where: { id: bestellungId },
      select: {
        id: true,
        kundeId: true,
        allergeneBestaetigtAm: true,
        positionen: { select: { produkt: { select: { allergene: true } } } },
      },
    }),
    prisma.mitarbeiter.findUnique({
      where: { id: mitarbeiterId },
      select: { id: true, rolle: true },
    }),
  ]);

  if (!bestellung || !mitarbeiter || mitarbeiter.rolle !== "Packer") {
    return;
  }

  if (status === "Zugestellt" && hatUnbestaetigteAllergene(bestellung)) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.paket.create({
      data: {
        bestellungId,
        mitarbeiterId,
        versandoption,
        versandkosten,
        status,
        versanddatum,
        trackingnummer: nullableText(formData.get("trackingnummer")),
        zustelldatum,
      },
    });

    if (status === "Zugestellt") {
      await tx.bestellung.update({
        where: { id: bestellungId },
        data: { status: "abgeschlossen" },
      });
      await aktualisiereStammkundeStatus(tx, bestellung.kundeId);
    }
  });

  revalidatePath("/");
}

async function updatePaketstatus(formData: FormData) {
  "use server";

  const paketId = requiredInt(formData.get("paketId"));
  const status = formData.get("paketStatus")?.toString() ?? "";
  const versanddatum = nullableDate(formData.get("versanddatum"));
  const zustelldatum = nullableDate(formData.get("zustelldatum"));

  if (!paketId || !isPaketstatus(status)) {
    return;
  }

  const paket = await prisma.paket.findUnique({
    where: { id: paketId },
    select: {
      id: true,
      bestellungId: true,
      bestellung: {
        select: {
          kundeId: true,
          allergeneBestaetigtAm: true,
          positionen: { select: { produkt: { select: { allergene: true } } } },
        },
      },
    },
  });

  if (!paket) {
    return;
  }

  if (status === "Zugestellt" && hatUnbestaetigteAllergene(paket.bestellung)) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.paket.update({
      where: { id: paketId },
      data: {
        status,
        versanddatum,
        trackingnummer: nullableText(formData.get("trackingnummer")),
        zustelldatum,
      },
    });

    if (status === "Zugestellt") {
      await tx.bestellung.update({
        where: { id: paket.bestellungId },
        data: { status: "abgeschlossen" },
      });
      await aktualisiereStammkundeStatus(tx, paket.bestellung.kundeId);
    }
  });

  revalidatePath("/");
}

async function createRetoure(formData: FormData) {
  "use server";

  const bestellpositionId = requiredInt(formData.get("retourePositionId"));
  const produktzustand = formData.get("produktzustand")?.toString() ?? "";
  const status = formData.get("retourenstatus")?.toString() ?? "";
  const erstattungsart = formData.get("erstattungsart")?.toString() ?? "";

  if (
    !bestellpositionId ||
    !isProduktzustand(produktzustand) ||
    !isRetourenstatus(status) ||
    !isErstattungsart(erstattungsart)
  ) {
    return;
  }

  const position = await prisma.bestellposition.findUnique({
    where: { id: bestellpositionId },
    include: {
      bestellung: {
        include: {
          kunde: true,
          pakete: { select: { zustelldatum: true } },
        },
      },
    },
  });

  if (
    !position ||
    !istRetourenfaehig({ bestellung: position.bestellung, produktzustand })
  ) {
    return;
  }

  await prisma.retoure.create({
    data: {
      bestellpositionId,
      grund: nullableText(formData.get("retourengrund")),
      produktzustand,
      status,
      erstattungsart,
    },
  });

  revalidatePath("/");
}

async function bucheRetoureInBestand(formData: FormData) {
  "use server";

  const retoureId = requiredInt(formData.get("retoureId"));

  if (!retoureId) {
    return;
  }

  const retoure = await prisma.retoure.findUnique({
    where: { id: retoureId },
    include: {
      bestellposition: {
        include: {
          charge: { include: { lagerbestaende: true } },
        },
      },
    },
  });

  if (
    !retoure ||
    retoure.bestandsbuchungAm ||
    retoure.status !== "Angenommen"
  ) {
    return;
  }

  const buchung = getRetoureBestandsbuchung(retoure);

  await prisma.$transaction(async (tx) => {
    if (buchung === "Zurueckgebucht" || buchung === "Restposten") {
      const verbindlicherBestand =
        retoure.bestellposition.charge.lagerbestaende.find(
          (bestand) => bestand.mengeVerbindlichReserviert > 0,
        );

      if (verbindlicherBestand) {
        await tx.lagerbestand.update({
          where: { id: verbindlicherBestand.id },
          data: {
            mengeVerbindlichReserviert: Math.max(
              0,
              verbindlicherBestand.mengeVerbindlichReserviert -
                retoure.bestellposition.menge,
            ),
          },
        });
      }

      if (buchung === "Restposten") {
        await tx.lagerbestand.upsert({
          where: {
            chargeId_lagerort: {
              chargeId: retoure.bestellposition.chargeId,
              lagerort: "Restposten",
            },
          },
          create: {
            chargeId: retoure.bestellposition.chargeId,
            lagerort: "Restposten",
            mengeVoruebergehendReserviert: 0,
            mengeVerbindlichReserviert: 0,
          },
          update: { lagerort: "Restposten" },
        });
      }
    }

    await tx.retoure.update({
      where: { id: retoure.id },
      data: {
        bestandsbuchung: buchung,
        bestandsbuchungAm: new Date(),
        status: "Abgeschlossen",
      },
    });
  });

  revalidatePath("/");
}

type HomeProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  await aktualisiereAlleStammkunden();

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
      bestellung: { include: { kunde: true, pakete: true } },
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
  const pakete = await prisma.paket.findMany({
    include: {
      bestellung: { include: { kunde: true } },
      mitarbeiter: true,
    },
    orderBy: [{ id: "desc" }],
  });
  const retouren = await prisma.retoure.findMany({
    include: {
      bestellposition: {
        include: {
          bestellung: { include: { kunde: true } },
          produkt: true,
          charge: true,
        },
      },
    },
    orderBy: [{ id: "desc" }],
  });
  const aboBoxen = await prisma.aboBox.findMany({
    include: { kunde: true },
    orderBy: [{ status: "asc" }, { startdatum: "desc" }, { id: "desc" }],
  });
  const aboAbwicklungen = await prisma.aboAbwicklung.findMany({
    include: {
      _count: { select: { bestellungen: true } },
    },
    orderBy: [{ jahr: "desc" }, { monat: "desc" }],
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
  const packerMitarbeiter = mitarbeiter.filter(
    (person) => person.rolle === "Packer",
  );
  const bestellungenMitVersandkosten = bestellungen.map((bestellung) => {
    const positionen = bestellpositionen.filter(
      (position) => position.bestellungId === bestellung.id,
    );
    const bestellwert = getBestellwert(positionen);

    return {
      bestellung,
      bestellwert,
      versandkostenVorschlag: getVersandkostenVorschlag({
        ...bestellung,
        positionen,
      }),
    };
  });
  const retourenfaehigePositionen = bestellpositionen
    .map((position) => {
      const frist = getRetourenfrist(position.bestellung);

      return frist &&
        getDaysSince(frist.zustelldatum) <= frist.fristTage
        ? { position, frist }
        : null;
    })
    .filter((eintrag) => eintrag !== null);
  const offeneRetouren = retouren.filter(
    (retoure) =>
      retoure.status !== "Abgelehnt" && retoure.status !== "Abgeschlossen",
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
            puffer: getGanzePuffermenge(produkt.b2cPuffermenge),
          }
        : null;
    })
    .filter((vorschlag) => vorschlag !== null);
  const produktKnappheiten = produkte
    .map((produkt) => {
      const produktChargen = chargen.filter(
        (charge) =>
          charge.produktId === produkt.id && charge.status === "freigegeben",
      );
      const freieMenge = produktChargen.reduce(
        (summe, charge) => summe + getFreieMenge(charge),
        0,
      );
      const physischVerfuegbar = produktChargen.reduce(
        (summe, charge) => summe + getPhysischVerfuegbareMenge(charge),
        0,
      );
      const offeneB2cPositionen = bestellpositionen
        .filter(
          (position) =>
            position.produktId === produkt.id &&
            position.bestellung.kunde.typ === "B2C" &&
            position.bestellung.status !== "storniert" &&
            position.bestellung.status !== "abgeschlossen",
        )
        .sort(compareKnappheitsPrioritaet);
      const offeneB2cNachfrage = offeneB2cPositionen.reduce(
        (summe, position) => summe + position.menge,
        0,
      );

      if (
        offeneB2cPositionen.length === 0 ||
        physischVerfuegbar <= 0 ||
        freieMenge >= offeneB2cNachfrage
      ) {
        return null;
      }

      return {
        produkt,
        freieMenge,
        offeneB2cNachfrage,
        physischVerfuegbar,
        priorisiertePositionen: offeneB2cPositionen,
      };
    })
    .filter((eintrag) => eintrag !== null);
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
  const allergenWarnungen = aktiveBestellungen
    .map((bestellung) => ({
      bestellung,
      positionen: bestellpositionen.filter(
        (position) =>
          position.bestellungId === bestellung.id &&
          Boolean(position.produkt.allergene?.trim()),
      ),
    }))
    .filter(
      (eintrag) =>
        eintrag.positionen.length > 0 &&
        !eintrag.bestellung.allergeneBestaetigtAm,
    );
  const stammkundenInaktiv = kunden
    .filter((kunde) => kunde.stammkunde)
    .map((kunde) => {
      const letzteBestellung =
        bestellungen
          .filter(
            (bestellung) =>
              bestellung.kundeId === kunde.id &&
              bestellung.status === "abgeschlossen",
          )
          .sort((a, b) => b.datum.getTime() - a.datum.getTime())[0] ?? null;

      return { kunde, letzteBestellung };
    })
    .filter(({ letzteBestellung }) => {
      if (!letzteBestellung) {
        return true;
      }

      return letzteBestellung.datum < addMonths(new Date(), -8);
    });
  const stammkundenVorabChargen =
    kunden.some((kunde) => kunde.stammkunde)
      ? chargen.filter(
          (charge) =>
            charge.status === "freigegeben" &&
            getHoursSince(charge.createdAt) <= 24,
        )
      : [];
  const packlistenBestellungen = verbindlicheBestellungen
    .map((bestellung) => ({
      bestellung,
      positionen: bestellpositionen.filter(
        (position) => position.bestellungId === bestellung.id,
      ),
      pakete: pakete.filter((paket) => paket.bestellungId === bestellung.id),
    }))
    .filter((eintrag) => eintrag.positionen.length > 0);
  const aktuellerAbwicklungsmonat = {
    jahr: new Date().getFullYear(),
    monat: new Date().getMonth() + 1,
  };
  const aktiveAboBoxen = aboBoxen.filter((aboBox) => aboBox.status === "aktiv");
  const pausierteAboBoxenAktuellerMonat = aktiveAboBoxen.filter((aboBox) =>
    isAboBoxImMonatPausiert(aboBox, aktuellerAbwicklungsmonat),
  );
  const aktiveAboBoxenAktuellerMonat = aktiveAboBoxen.filter(
    (aboBox) => !isAboBoxImMonatPausiert(aboBox, aktuellerAbwicklungsmonat),
  );
  const aboPausenwarnungen = aboBoxen
    .map((aboBox) => ({
      aboBox,
      warnung: getAboPausenwarnung(aboBox),
    }))
    .filter((eintrag) => eintrag.warnung !== null);
  const aboBoxProdukte = produkte.filter((produkt) => produkt.inAboBoxEnthalten);
  const aboProdukteMitAllergenen = aboBoxProdukte.filter((produkt) =>
    Boolean(produkt.allergene?.trim()),
  );
  const kannAboAbwickeln =
    aktiveAboBoxen.length > 0 && aboBoxProdukte.length === 4;
  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <main className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">
            NW-001 / NW-002 / NW-003 / NW-004 / NW-005 / NW-007 / NW-008 / NW-009 / NW-010 / NW-011 / NW-013 / NW-014 / NW-015 / NW-016 / NW-017 / NW-018 / NW-019 / NW-020 / NW-025 / NW-027 / NW-029 / NW-030 / NW-032 / NW-036 / NW-037
          </p>
          <h1>Arbeitsansicht</h1>
        </div>
        <p className="summary">
          {kunden.length} Kunden · {produkte.length} Produkte ·{" "}
          {bestellungen.length} Bestellungen · {chargen.length} Chargen ·{" "}
          {bestellpositionen.length} Positionen · {lagerbestaende.length} Lagerbestaende ·{" "}
          {verkaufsevents.length} Verkaufsevents Â· {pakete.length} Pakete -{" "}
          {retouren.length} Retouren - {aboBoxen.length} Abo-Boxen -{" "}
          {aboAbwicklungen.length} Abo-Abwicklungen - {mitarbeiter.length} Mitarbeitende
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

      {canViewPacklists ? (
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
                {packlistenBestellungen.map(({ bestellung, positionen, pakete }) => (
                  <article className="packlist-order" key={bestellung.id}>
                    <div className="packlist-header">
                      <div>
                        <h3>{bestellung.kunde.name}</h3>
                        <p>{bestellung.lieferadresse ?? "Keine Lieferadresse erfasst"}</p>
                      </div>
                      <div className="task-meta">
                        <span className="status-pill">
                          Bestellung #{bestellung.id}
                        </span>
                        {pakete.length === 0 ? (
                          <span className="status-pill">Kein Paket</span>
                        ) : (
                          pakete.map((paket) => (
                            <span className="status-pill" key={paket.id}>
                              Paket #{paket.id}: {paket.status}
                            </span>
                          ))
                        )}
                      </div>
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
              <span>Produktknappheit</span>
              <strong>{produktKnappheiten.length}</strong>
            </div>
            <div className="metric-tile">
              <span>MHD-Warnungen</span>
              <strong>{mhdWarnungen.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Allergenbestaetigung offen</span>
              <strong>{allergenWarnungen.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Offene Retouren</span>
              <strong>{offeneRetouren.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Stammkunden inaktiv</span>
              <strong>{stammkundenInaktiv.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Vorabinfo Chargen</span>
              <strong>{stammkundenVorabChargen.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Aktive Abo-Boxen</span>
              <strong>{aktiveAboBoxenAktuellerMonat.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Abo-Pausen</span>
              <strong>{pausierteAboBoxenAktuellerMonat.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Abo-Pausen pruefen</span>
              <strong>{aboPausenwarnungen.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Abo-Produktauswahl</span>
              <strong>{aboBoxProdukte.length}/4</strong>
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

          {produktKnappheiten.length === 0 ? null : (
            <div className="task-list">
              {produktKnappheiten.map((knappheit) => (
                <article className="task-item" key={knappheit.produkt.id}>
                  <div>
                    <h3>{knappheit.produkt.name}</h3>
                    <p>
                      {knappheit.offeneB2cNachfrage} offen angefragt -{" "}
                      {knappheit.freieMenge} frei -{" "}
                      {knappheit.physischVerfuegbar} physisch verfuegbar
                    </p>
                    <p className="warning-text">
                      Produkt knapp: Stammkunden zuerst, danach B2C-Neukunden
                      nach Anfragezeitpunkt.
                    </p>
                  </div>
                  <div className="task-meta">
                    {knappheit.priorisiertePositionen.slice(0, 3).map(
                      (position) => (
                        <span className="status-pill" key={position.id}>
                          {getKnappheitsPrioritaetslabel(position)} - #
                          {position.bestellung.id}
                        </span>
                      ),
                    )}
                    <strong>Reihenfolge pruefen</strong>
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

          {allergenWarnungen.length === 0 ? null : (
            <div className="task-list">
              {allergenWarnungen.map(({ bestellung, positionen }) => (
                <article className="task-item" key={bestellung.id}>
                  <div>
                    <h3>Bestellung #{bestellung.id}</h3>
                    <p>
                      {bestellung.kunde.name} -{" "}
                      {positionen
                        .map((position) => position.produkt.name)
                        .join(", ")}
                    </p>
                    <p className="warning-text critical">
                      Allergenliste muss vor Abschluss bestaetigt werden.
                    </p>
                  </div>
                  <div className="task-meta">
                    <span className="status-pill">Allergene offen</span>
                    <strong>Bestaetigung nachholen</strong>
                  </div>
                </article>
              ))}
            </div>
          )}

          {offeneRetouren.length === 0 ? null : (
            <div className="task-list">
              {offeneRetouren.slice(0, 6).map((retoure) => (
                <article className="task-item" key={retoure.id}>
                  <div>
                    <h3>Retoure #{retoure.id}</h3>
                    <p>
                      Bestellung #{retoure.bestellposition.bestellung.id} -{" "}
                      {retoure.bestellposition.bestellung.kunde.name} -{" "}
                      {retoure.bestellposition.produkt.name}
                    </p>
                  </div>
                  <div className="task-meta">
                    <span className="status-pill">{retoure.status}</span>
                    <span className="status-pill">{retoure.produktzustand}</span>
                    <strong>Retoure bearbeiten</strong>
                  </div>
                </article>
              ))}
            </div>
          )}

          {stammkundenInaktiv.length === 0 ? null : (
            <div className="task-list">
              {stammkundenInaktiv.slice(0, 6).map(({ kunde, letzteBestellung }) => (
                <article className="task-item" key={kunde.id}>
                  <div>
                    <h3>{kunde.name}</h3>
                    <p>
                      {letzteBestellung
                        ? `Letzte abgeschlossene Bestellung am ${formatDate(
                            letzteBestellung.datum,
                          )}`
                        : "Keine abgeschlossene Bestellung dokumentiert"}
                    </p>
                    <p className="warning-text">
                      Stammkunde seit 8 Monaten inaktiv, Kontakt pruefen.
                    </p>
                  </div>
                  <div className="task-meta">
                    <span className="status-pill">Stammkunde</span>
                    <strong>Nachfassen</strong>
                  </div>
                </article>
              ))}
            </div>
          )}

          {stammkundenVorabChargen.length === 0 ? null : (
            <div className="task-list">
              {stammkundenVorabChargen.map((charge) => (
                <article className="task-item" key={charge.id}>
                  <div>
                    <h3>Charge #{charge.id}</h3>
                    <p>
                      {charge.produkt.name} - MHD {formatDate(charge.mhd)}
                    </p>
                    <p className="warning-text">
                      Neue Charge innerhalb von 24 Stunden: Stammkunden vorab
                      informieren.
                    </p>
                  </div>
                  <div className="task-meta">
                    <span className="status-pill">Vorabinfo</span>
                    <strong>Stammkunden informieren</strong>
                  </div>
                </article>
              ))}
            </div>
          )}

          {aboPausenwarnungen.length === 0 ? null : (
            <div className="task-list">
              {aboPausenwarnungen.slice(0, 6).map(({ aboBox, warnung }) => (
                <article className="task-item" key={aboBox.id}>
                  <div>
                    <h3>Abo-Box #{aboBox.id}</h3>
                    <p>
                      {aboBox.kunde.name} - Pause bis{" "}
                      {aboBox.pausiertBis ? formatMonth(
                        aboBox.pausiertBis.getFullYear(),
                        aboBox.pausiertBis.getMonth() + 1,
                      ) : "unbekannt"}
                    </p>
                    <p className="warning-text">{warnung}</p>
                  </div>
                  <div className="task-meta">
                    <span className="status-pill">Abo-Pause</span>
                    <strong>Status pruefen</strong>
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
                    {bestellung.allergeneBestaetigtAm ? (
                      <>
                        <dt>Allergene</dt>
                        <dd>{formatDate(bestellung.allergeneBestaetigtAm)}</dd>
                      </>
                    ) : null}
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
          <form action={createAboBox} className="panel form-panel">
            <h2>Abo-Box anlegen</h2>

            {kunden.length === 0 ? (
              <p className="empty-state">Zuerst einen Kunden anlegen.</p>
            ) : (
              <>
                <label>
                  Kunde
                  <select name="aboBoxKundeId" required>
                    {kunden.map((kunde) => (
                      <option key={kunde.id} value={kunde.id}>
                        {kunde.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Lieferadresse
                  <textarea name="aboBoxLieferadresse" required rows={3} />
                </label>

                <div className="field-row">
                  <label>
                    Status
                    <select name="aboBoxStatus" defaultValue="aktiv" required>
                      {aboBoxStatusWerte.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Startdatum
                    <input
                      defaultValue={today}
                      name="aboBoxStartdatum"
                      required
                      type="date"
                    />
                  </label>
                </div>

                <div className="field-row">
                  <label>
                    Pause von
                    <input name="aboBoxPausiertVon" type="month" />
                  </label>

                  <label>
                    Pause bis
                    <input name="aboBoxPausiertBis" type="month" />
                  </label>

                  <label>
                    Kuendigungsdatum
                    <input name="aboBoxKuendigungsdatum" type="date" />
                  </label>
                </div>

                <p className="note-text">
                  Pausen gelten fuer maximal zwei aufeinanderfolgende Monate
                  und muessen bis zum 15. des Vormonats erfasst sein.
                  Aktuelle Abo-Produktauswahl: {aboBoxProdukte.length}/4 markiert.
                </p>

                <button type="submit">Abo-Box speichern</button>
              </>
            )}
          </form>

          <section className="panel form-panel" aria-labelledby="abo-abwicklung-heading">
            <h2 id="abo-abwicklung-heading">Abo-Abwicklung</h2>

            <form action={createAboAbwicklung} className="stacked-form">
              <label>
                Monat
                <input
                  defaultValue={currentMonth}
                  name="aboAbwicklungMonat"
                  required
                  type="month"
                />
              </label>

              <dl>
                <dt>Aktive Abo-Boxen</dt>
                <dd>{aktiveAboBoxenAktuellerMonat.length}</dd>
                <dt>Im aktuellen Monat pausiert</dt>
                <dd>{pausierteAboBoxenAktuellerMonat.length}</dd>
                <dt>Abo-Produkte</dt>
                <dd>{aboBoxProdukte.length}/4</dd>
              </dl>

              {aboBoxProdukte.length === 0 ? (
                <p className="empty-state">
                  Zuerst vier Produkte als Abo-Box-Inhalt markieren.
                </p>
              ) : (
                <div className="fifo-box">
                  <p className="eyebrow">Monatsauswahl</p>
                  <div className="customer-list">
                    {aboBoxProdukte.map((produkt) => (
                      <article className="task-item" key={produkt.id}>
                        <div>
                          <h3>{produkt.name}</h3>
                          <p>{produkt.kategorie}</p>
                          {produkt.allergene ? (
                            <p>Allergene: {produkt.allergene}</p>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {aboProdukteMitAllergenen.length > 0 ? (
                <label className="checkbox-label">
                  <input name="aboAbwicklungAllergeneBestaetigt" type="checkbox" />
                  Allergenlisten fuer Abo-Produkte liegen bestaetigt vor
                </label>
              ) : null}

              {!kannAboAbwickeln ? (
                <p className="empty-state">
                  Abwicklung braucht mindestens eine aktive Abo-Box und genau
                  vier markierte Abo-Produkte. Abo-Boxen mit Pause im
                  Abwicklungsmonat werden uebersprungen.
                </p>
              ) : null}

              <button disabled={!kannAboAbwickeln} type="submit">
                Abo-Abwicklung erstellen
              </button>
            </form>

            {aboAbwicklungen.length === 0 ? (
              <p className="empty-state">Noch keine Abo-Abwicklung erfasst.</p>
            ) : (
              <div className="customer-list">
                {aboAbwicklungen.slice(0, 6).map((abwicklung) => (
                  <article className="customer-card" key={abwicklung.id}>
                    <div>
                      <h3>{formatMonth(abwicklung.jahr, abwicklung.monat)}</h3>
                      <p>{formatDate(abwicklung.ausgefuehrtAm)}</p>
                    </div>
                    <span className="status-pill">
                      {abwicklung._count.bestellungen} Bestellungen
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="panel list-panel" aria-labelledby="abo-boxen-heading">
            <h2 id="abo-boxen-heading">Abo-Boxen</h2>
            {aboBoxen.length === 0 ? (
              <p className="empty-state">Noch keine Abo-Boxen erfasst.</p>
            ) : (
              <div className="customer-list">
                {aboBoxen.map((aboBox) => (
                  <article className="customer-card" key={aboBox.id}>
                    <div>
                      <h3>Abo-Box #{aboBox.id}</h3>
                      <p>
                        {aboBox.kunde.name} - Start{" "}
                        {formatDate(aboBox.startdatum)}
                      </p>
                    </div>
                    <dl>
                      <dt>Status</dt>
                      <dd>
                        <span className="status-pill">{aboBox.status}</span>
                      </dd>
                      <dt>Lieferadresse</dt>
                      <dd>{aboBox.lieferadresse}</dd>
                      {aboBox.pausiertSeit ? (
                        <>
                          <dt>Pause erfasst</dt>
                          <dd>{formatDate(aboBox.pausiertSeit)}</dd>
                        </>
                      ) : null}
                      {aboBox.pausiertVon && aboBox.pausiertBis ? (
                        <>
                          <dt>Pausenzeitraum</dt>
                          <dd>
                            {formatMonth(
                              aboBox.pausiertVon.getFullYear(),
                              aboBox.pausiertVon.getMonth() + 1,
                            )}{" "}
                            bis{" "}
                            {formatMonth(
                              aboBox.pausiertBis.getFullYear(),
                              aboBox.pausiertBis.getMonth() + 1,
                            )}
                          </dd>
                        </>
                      ) : null}
                      {aboBox.kuendigungsdatum ? (
                        <>
                          <dt>Kuendigung</dt>
                          <dd>{formatDate(aboBox.kuendigungsdatum)}</dd>
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
                        {bestellung.allergeneBestaetigtAm
                          ? " - Allergene bestaetigt"
                          : ""}
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
                        {vorschlag.produkt.allergene
                          ? ` - Allergene: ${vorschlag.produkt.allergene}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Menge
                  <input min="1" name="positionMenge" required type="number" />
                </label>

                <label className="checkbox-label">
                  <input name="allergeneBestaetigt" type="checkbox" />
                  Allergenliste gelesen und vom Kunden bestaetigt
                </label>

                <div className="fifo-box">
                  <p className="eyebrow">FIFO-Vorschlag</p>
                  <div className="customer-list">
                    {fifoVorschlaege.map((vorschlag) => (
                      <article className="task-item" key={vorschlag.produkt.id}>
                        <div>
                          <h3>{vorschlag.produkt.name}</h3>
                          <p>B2C-Puffer: {vorschlag.puffer}</p>
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

      {canManageOrders ? (
        <section className="layout-grid feature-section">
          <form action={createPaket} className="panel form-panel">
            <h2>Paket anlegen</h2>

            {bestellungen.length === 0 || packerMitarbeiter.length === 0 ? (
              <p className="empty-state">
                Zuerst Bestellung und Packer anlegen.
              </p>
            ) : (
              <>
                <label>
                  Bestellung
                  <select name="paketBestellungId" required>
                    {bestellungenMitVersandkosten.map(
                      ({ bestellung, bestellwert, versandkostenVorschlag }) => (
                      <option key={bestellung.id} value={bestellung.id}>
                        #{bestellung.id} - {bestellung.kunde.name} -{" "}
                        {formatDate(bestellung.datum)} - Warenwert{" "}
                        {formatCurrency(bestellwert)} - Versandvorschlag{" "}
                        {formatCurrency(versandkostenVorschlag)}
                      </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  Packer
                  <select name="paketMitarbeiterId" required>
                    {packerMitarbeiter.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="field-row">
                  <label>
                    Versandoption
                    <select name="versandoption" defaultValue="DHL" required>
                      {versandoptionen.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Versandkosten
                    <input
                      defaultValue={
                        bestellungenMitVersandkosten[0]
                          ? formatDecimalInput(
                              bestellungenMitVersandkosten[0]
                                .versandkostenVorschlag,
                            )
                          : "0.00"
                      }
                      min="0"
                      name="versandkosten"
                      required
                      step="0.01"
                      type="number"
                    />
                  </label>
                </div>

                <label>
                  Paketstatus
                  <select name="paketStatus" defaultValue="Vorbereitet" required>
                    {paketstatusWerte.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Trackingnummer
                  <input name="trackingnummer" />
                </label>

                <div className="field-row">
                  <label>
                    Versanddatum
                    <input name="versanddatum" type="date" />
                  </label>

                  <label>
                    Zustelldatum
                    <input name="zustelldatum" type="date" />
                  </label>
                </div>

                <button type="submit">Paket speichern</button>
              </>
            )}
          </form>

          <section className="panel list-panel" aria-labelledby="pakete-heading">
            <h2 id="pakete-heading">Pakete</h2>
            {pakete.length === 0 ? (
              <p className="empty-state">Noch keine Pakete erfasst.</p>
            ) : (
              <div className="customer-list">
                {pakete.map((paket) => (
                  <article className="customer-card" key={paket.id}>
                    <div>
                      <h3>Paket #{paket.id}</h3>
                      <p>
                        Bestellung #{paket.bestellung.id} -{" "}
                        {paket.bestellung.kunde.name}
                      </p>
                    </div>
                    <dl>
                      <dt>Packer</dt>
                      <dd>{paket.mitarbeiter.name}</dd>
                      <dt>Versand</dt>
                      <dd>
                        {paket.versandoption} -{" "}
                        {formatCurrency(paket.versandkosten)}
                      </dd>
                      <dt>Vorschlag</dt>
                      <dd>
                        {formatCurrency(
                          bestellungenMitVersandkosten.find(
                            (eintrag) =>
                              eintrag.bestellung.id === paket.bestellungId,
                          )?.versandkostenVorschlag ?? 0,
                        )}
                      </dd>
                      {paket.trackingnummer ? (
                        <>
                          <dt>Tracking</dt>
                          <dd>{paket.trackingnummer}</dd>
                        </>
                      ) : null}
                      {paket.versanddatum ? (
                        <>
                          <dt>Versendet</dt>
                          <dd>{formatDate(paket.versanddatum)}</dd>
                        </>
                      ) : null}
                      {paket.zustelldatum ? (
                        <>
                          <dt>Zugestellt</dt>
                          <dd>{formatDate(paket.zustelldatum)}</dd>
                        </>
                      ) : null}
                    </dl>
                    <span className="status-pill">{paket.status}</span>
                    <form action={updatePaketstatus} className="inline-form">
                      <input name="paketId" type="hidden" value={paket.id} />

                      <label>
                        Paketstatus aktualisieren
                        <select
                          name="paketStatus"
                          defaultValue={paket.status}
                          required
                        >
                          {paketstatusWerte.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Trackingnummer
                        <input
                          defaultValue={paket.trackingnummer ?? ""}
                          name="trackingnummer"
                        />
                      </label>

                      <div className="field-row">
                        <label>
                          Versanddatum
                          <input
                            defaultValue={
                              paket.versanddatum
                                ? paket.versanddatum.toISOString().slice(0, 10)
                                : ""
                            }
                            name="versanddatum"
                            type="date"
                          />
                        </label>

                        <label>
                          Zustelldatum
                          <input
                            defaultValue={
                              paket.zustelldatum
                                ? paket.zustelldatum.toISOString().slice(0, 10)
                                : ""
                            }
                            name="zustelldatum"
                            type="date"
                          />
                        </label>
                      </div>

                      <button type="submit">Status speichern</button>
                    </form>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      ) : null}

      {canManageOrders ? (
        <section className="layout-grid feature-section">
          <form action={createRetoure} className="panel form-panel">
            <h2>Retoure anlegen</h2>

            {retourenfaehigePositionen.length === 0 ? (
              <p className="empty-state">
                Keine zugestellte Bestellposition innerhalb der Retourenfrist.
              </p>
            ) : (
              <>
                <label>
                  Bestellposition
                  <select name="retourePositionId" required>
                    {retourenfaehigePositionen.map(({ position, frist }) => (
                      <option key={position.id} value={position.id}>
                        #{position.id} - Bestellung #{position.bestellung.id} -{" "}
                        {position.bestellung.kunde.name} -{" "}
                        {position.produkt.name} - Frist bis{" "}
                        {formatDate(frist.fristEnde)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Grund
                  <textarea name="retourengrund" rows={3} />
                </label>

                <div className="field-row">
                  <label>
                    Produktzustand
                    <select name="produktzustand" defaultValue="Ungeoeffnet" required>
                      {produktzustandWerte.map((zustand) => (
                        <option key={zustand} value={zustand}>
                          {zustand}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Status
                    <select name="retourenstatus" defaultValue="Angemeldet" required>
                      {retourenstatusWerte.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  Erstattungsart
                  <select name="erstattungsart" defaultValue="Keine" required>
                    {erstattungsarten.map((art) => (
                      <option key={art} value={art}>
                        {art}
                      </option>
                    ))}
                  </select>
                </label>

                <p className="note-text">
                  B2B- und Abo-Retouren werden nur fuer beschaedigte oder
                  mangelhafte Produkte akzeptiert.
                </p>

                <button type="submit">Retoure speichern</button>
              </>
            )}
          </form>

          <section className="panel list-panel" aria-labelledby="retouren-heading">
            <h2 id="retouren-heading">Retouren</h2>
            {retouren.length === 0 ? (
              <p className="empty-state">Noch keine Retouren erfasst.</p>
            ) : (
              <div className="customer-list">
                {retouren.map((retoure) => (
                  <article className="customer-card" key={retoure.id}>
                    <div>
                      <h3>Retoure #{retoure.id}</h3>
                      <p>
                        Bestellung #{retoure.bestellposition.bestellung.id} -{" "}
                        {retoure.bestellposition.bestellung.kunde.name}
                      </p>
                    </div>
                    <dl>
                      <dt>Produkt</dt>
                      <dd>{retoure.bestellposition.produkt.name}</dd>
                      <dt>Charge</dt>
                      <dd>#{retoure.bestellposition.charge.id}</dd>
                      <dt>Zustand</dt>
                      <dd>{retoure.produktzustand}</dd>
                      <dt>Erstattung</dt>
                      <dd>{retoure.erstattungsart}</dd>
                      {retoure.bestandsbuchung ? (
                        <>
                          <dt>Bestand</dt>
                          <dd>
                            {retoure.bestandsbuchung}
                            {retoure.bestandsbuchungAm
                              ? ` am ${formatDate(retoure.bestandsbuchungAm)}`
                              : ""}
                          </dd>
                        </>
                      ) : null}
                      {retoure.grund ? (
                        <>
                          <dt>Grund</dt>
                          <dd>{retoure.grund}</dd>
                        </>
                      ) : null}
                    </dl>
                    <span className="status-pill">{retoure.status}</span>
                    {retoure.status === "Angenommen" &&
                    !retoure.bestandsbuchungAm ? (
                      <form action={bucheRetoureInBestand} className="inline-form">
                        <input name="retoureId" type="hidden" value={retoure.id} />
                        <button type="submit">Bestand buchen</button>
                      </form>
                    ) : null}
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
