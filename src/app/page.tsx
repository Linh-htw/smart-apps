import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  hauttypen,
  isHauttyp,
  isKundentyp,
  kundentypen,
} from "@/lib/customer-options";

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

export default async function Home() {
  const kunden = await prisma.kunde.findMany({
    orderBy: [{ stammkunde: "desc" }, { name: "asc" }],
  });

  return (
    <main className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">NW-001</p>
          <h1>Kundenverwaltung</h1>
        </div>
        <p className="summary">{kunden.length} Kunden erfasst</p>
      </header>

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
    </main>
  );
}
