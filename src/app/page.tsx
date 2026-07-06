import { revalidatePath } from "next/cache";
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
import { isRolle, rollen } from "@/lib/employee-options";

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

function getNextBestellschritt(bestellung: {
  zahlungsstatus: string;
  status: string;
}) {
  if (bestellung.status === "storniert") {
    return "Keine Aktion";
  }

  if (bestellung.zahlungsstatus === "ausstehend") {
    return "Zahlung pruefen";
  }

  return "Zur weiteren Bearbeitung vormerken";
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

export default async function Home() {
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
  const mitarbeiter = await prisma.mitarbeiter.findMany({
    orderBy: [{ rolle: "asc" }, { name: "asc" }],
  });
  const aktiveBestellungen = bestellungen.filter(
    (bestellung) => bestellung.status !== "storniert",
  );
  const ausstehendeZahlungen = aktiveBestellungen.filter(
    (bestellung) => bestellung.zahlungsstatus === "ausstehend",
  );
  const verbindlicheBestellungen = aktiveBestellungen.filter(
    (bestellung) => bestellung.status === "verbindlich",
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">NW-001 / NW-002 / NW-005 / NW-011 / NW-032</p>
          <h1>Arbeitsansicht</h1>
        </div>
        <p className="summary">
          {kunden.length} Kunden · {produkte.length} Produkte ·{" "}
          {bestellungen.length} Bestellungen · {mitarbeiter.length} Mitarbeitende
        </p>
      </header>

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
              <span>Verbindliche Bestellungen</span>
              <strong>{verbindlicheBestellungen.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Stornierte ausgeblendet</span>
              <strong>{bestellungen.length - aktiveBestellungen.length}</strong>
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
        </div>
      </section>

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
    </main>
  );
}
