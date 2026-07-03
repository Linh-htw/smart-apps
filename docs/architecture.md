# architecture.md - Nina Wolffs Shop- und Kundenmanagement-App

_Technische Wahrheit des Projekts. Aktualisieren, sobald Stack, Datenmodell, Module oder Konventionen entschieden werden._

---

## Status

Code-Stack fuer die erste Umsetzung ist festgelegt und im Repo eingerichtet:

- **Framework:** Next.js mit React und TypeScript.
- **Datenbankzugriff:** Prisma.
- **Datenbank:** SQLite fuer die lokale Solo-Entwicklung und den initialen V1-Aufbau.

Diese Entscheidung gilt fuer den aktuellen Projektstand und kann spaeter neu bewertet werden, wenn Hosting, Mehrbenutzerbetrieb oder externe Integrationen konkrete Anforderungen an Betrieb und Skalierung stellen.

## Projektsetup

- `package.json` definiert die Next.js-App mit TypeScript, React, ESLint, Prisma CLI und Prisma Client.
- Runtime- und Build-Abhaengigkeiten sind exakt gepinnt, damit `npm install` keine unerwarteten Minor-/Patch-Upgrades in das lokale Geruest zieht.
- `prisma/schema.prisma` nutzt SQLite ueber `DATABASE_URL`.
- `.env.example` dokumentiert die lokale Standard-URL: `DATABASE_URL="file:./dev.db"`.
- `src/lib/prisma.ts` stellt einen wiederverwendbaren Prisma Client bereit und verhindert in der lokalen Next.js-Entwicklung unnoetige Mehrfachinstanzen.
- Prisma-Migrationen werden versioniert; die lokale SQLite-Datei `prisma/dev.db` bleibt ignoriert.

Aktueller Framework-Stand:

| Komponente | Version |
|---|---|
| Next.js | 15.5.19 |
| React | 19.0.0 |
| Prisma / Prisma Client | 6.11.1 |
| TypeScript | 5.8.3 |
| Node.js lokal | 22.23.1 |

Wichtige Kommandos:

```bash
npm run dev
npm run build
npm run lint
npm run prisma:generate
npm run prisma:migrate -- --name <name>
```

Zuletzt verifiziert:

```bash
npm run prisma:generate
npm run lint
npm run build
```

Hinweis fuer Windows: Generierte Artefakte wie `.next` und `node_modules/.prisma` koennen lokal durch Dateisperren blockiert werden. In diesem Fall muessen haengende Node-Prozesse beendet und die generierten Artefakte bereinigt werden, bevor erneut gebaut wird.

## Empfohlene Zielarchitektur

| Bereich | Empfehlung | Begruendung |
|---|---|---|
| App-Typ | Web-App mit rollenbasierter Admin-/Mitarbeiteroberflaeche | Nina und Mitarbeitende brauchen zentrale, geraeteunabhaengige Arbeitsansichten. |
| Framework | Next.js mit React und TypeScript | Erlaubt eine kompakte Full-Stack-Web-App mit serverseitiger Validierung und arbeitsorientierter UI in einem Projekt. |
| Datenbank | SQLite ueber Prisma | Passt fuer lokale Solo-Entwicklung, relationale Entitaeten und schnelle Iteration ohne zusaetzlichen Datenbankbetrieb. |
| Backend | Next.js-Serverlogik mit serverseitiger Validierung und Rechtepruefung | Rollen, Bestand, Reservierungen und Zahlungen duerfen nicht nur im Frontend geprueft werden. |
| Frontend | Arbeitsorientiertes Dashboard statt Marketing-UI | Hauptnutzen ist schnelle Bearbeitung offener Aufgaben. |

## Fachliche Module

- **Kunden:** Stammdaten, Typ B2C/B2B, Stammkundenstatus, Vorlieben, Hauttyp.
- **Produkte:** Preise, Kategorien, Allergene, Inhaltsstoffe, B2C-Puffer, Abo-Box-Markierung.
- **Chargen:** Herstellung, MHD, produzierte Menge, Status, verantwortliche Werkstatt-Hilfe.
- **Lagerbestand:** Lagerort, verfuegbare Menge, voruebergehende Reservierung, verbindliche Reservierung.
- **Bestellungen:** Kanal, Status, Zahlungsstatus, Lieferadresse, Allergenbestaetigung.
- **Bestellpositionen:** Produkt, Charge, Menge.
- **Packlisten/Pakete:** Packer-Sicht, Versandoption, Paketstatus, Tracking.
- **Retouren:** Fristen, Produktzustand, Erstattung/Ersatz, Rueckbuchung in Bestand.
- **Abo-Boxen:** Status, Lieferadresse, monatliche Sammelabwicklung, Pausierung.
- **Verkaufsevents:** Mitgenommene und verkaufte Chargenmengen.
- **Mitarbeiter/Rollen:** Admin, Werkstatt-Hilfe, Packer.

## Zentrale Invarianten

- Bestand muss kanaluebergreifend konsistent sein.
- Reservierung und verbindliche Buchung sind getrennte Mengen.
- FIFO nach fruehestem MHD ist Standard bei Bestandszuteilung.
- B2B-Bestellungen duerfen den B2C-Puffer nicht unterschreiten.
- Statuswechsel muessen nachvollziehbar und validiert sein.
- Rollenrechte muessen serverseitig erzwungen werden.

## Datenmodell

Die Entitaeten und Beziehungen stehen in `docs/spec.md`. Prisma ist die technische Modellierungsschicht fuer Tabellen, Relationen und spaetere Migrationen. Enum-Werte werden nicht frei erfunden, sondern aus `docs/spec.md` oder dokumentierten Entscheidungen abgeleitet.

SQLite ist fuer den initialen V1-Aufbau ausreichend, weil das Projekt als Solo-Projekt startet und die fachlichen Regeln zuerst lokal korrekt modelliert werden muessen. Ein spaeterer Wechsel auf eine serverbasierte relationale Datenbank bleibt moeglich, wenn Hosting oder paralleler Zugriff das erfordern.

Bis die Enum-Werte aus `NW-039` geklaert sind, enthaelt das Prisma-Schema nur fachliche Tabellen, deren benoetigte Enum-Werte geklaert und zentral validiert sind. `NW-001` nutzt fuer Kunden `Kunde` als erstes fachliches Modell; Kundentyp und Hauttyp werden in der App gegen die Werte aus `docs/spec.md` validiert. `NW-002` ergaenzt `Produkt`; Produktkategorien werden zentral gegen `Seifen`, `Öle`, `Balsam` und `Bodylotions` validiert.

## Offene technische Entscheidungen

- Authentifizierung und Rollenmodell
- Hosting und Deployment
- Versandlabel-/Tracking-Anbieter
- Zahlungsstatus: manuelle Pflege oder Zahlungsanbieter-Integration
- Audit-Log fuer Bestands- und Statusaenderungen

## Konventionen

- Fachliche Statuswerte zentral definieren, nicht als verstreute Strings.
- Geldwerte als Decimal speichern, nicht als Floating-Point.
- Datumslogik explizit behandeln; Fristen beziehen sich auf lokale Geschaeftslogik in Europe/Berlin.
- Jede Bestandsaenderung muss auf eine fachliche Ursache zurueckfuehrbar sein: Bestellung, Reservierung, Retoure, Abo-Abwicklung oder Verkaufsevent.
