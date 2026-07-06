# decisions.md - Architektur- und Produktentscheidungen

_Chronologisches Log aller Architektur- und Produktentscheidungen._

---

## 2026-07-02 - Spec ersetzt PRD

**Kontext:** Die Modus-Operandi-Methodik nutzt normalerweise `docs/prd.md`. Fuer dieses Projekt soll die vorhandene `Spec.md` die PRD-Rolle uebernehmen.

### Entscheidung
Es wird keine `docs/prd.md` angelegt. Die fachliche Single Source of Truth ist `docs/spec.md`, basierend auf der vorhandenen `Spec.md`.

### Alternativen verworfen
- `prd.md` aus Template kopieren: Verworfen, weil dadurch Doppelpflege und Drift zur bestehenden Spec entstehen wuerden.

### Konsequenzen
- Alle Agenten- und Arbeitsprozess-Verweise zeigen auf `docs/spec.md`.
- Scope-Aenderungen werden in `docs/spec.md` dokumentiert.

## 2026-07-02 - Solo-Projekt ohne Meetings-, Results- und Team-Struktur

**Kontext:** Das Projekt wird allein umgesetzt. Der Nutzer hat Meeting- und Results-Ordner explizit ausgeschlossen.

### Entscheidung
Es werden keine `docs/meetings/`, `docs/results/`, `docs/team/` und keine `docs/INBOX.md` angelegt.

### Alternativen verworfen
- Vollstaendige Modus-Operandi-Struktur: Verworfen, weil sie fuer ein Solo-Projekt unnoetige Pflege erzeugt.

### Konsequenzen
- Dokumentation bleibt schlank: `docs/spec.md`, `docs/architecture.md`, `docs/backlog.md`, `docs/decisions.md`, `docs/modus-operandi.md`, optional `docs/concepts/` und `docs/audit/`.

## 2026-07-02 - AGENTS.md als Agent-Briefing

**Kontext:** Die Vorlage liefert `CLAUDE.md`, dieses Projekt wird hier aber mit Codex/Agent-Kontext bearbeitet.

### Entscheidung
Das Projekt nutzt `AGENTS.md` als primaeres Agent-Briefing.

### Alternativen verworfen
- Nur `CLAUDE.md`: Verworfen, weil `AGENTS.md` in diesem Arbeitskontext direkter passt.

### Konsequenzen
- Neue Agent-Sessions sollen zuerst `AGENTS.md` lesen.
- Falls spaeter Claude Code genutzt wird, kann `CLAUDE.md` aus `AGENTS.md` abgeleitet werden.

## 2026-07-02 - README als kompakter Projekt-Einstieg

**Kontext:** Nach der initialen Dokumentationsstruktur brauchte das Repo einen kurzen Einstieg, der Zweck, Struktur und Arbeitsweise zusammenfasst.

### Entscheidung
Das Repo nutzt `README.md` als kompakten Projekt-Einstieg. Die fachliche Detailwahrheit bleibt in `docs/spec.md`; die README verweist nur auf die zentralen Artefakte und den V1-Fokus.

### Alternativen verworfen
- README als vollstaendige Produktbeschreibung: Verworfen, weil dadurch Doppelpflege zu `docs/spec.md` und `docs/backlog.md` entstehen wuerde.

### Konsequenzen
- Neue Leser bekommen eine schnelle Orientierung im Repo.
- Fachliche Aenderungen werden weiterhin nicht in der README entschieden, sondern in `docs/spec.md`, `docs/backlog.md` oder `docs/decisions.md`.

## 2026-07-02 - Backlog aus Spec-Anforderungen erweitert

**Kontext:** Der erste Backlog enthielt nur einen groben Ausschnitt der V1-Funktionen. Die Spec definiert weitere Entitaeten, Beziehungen, Geschaeftsregeln und offene Klaerungen, die fuer Umsetzung und Priorisierung referenzierbare IDs brauchen.

### Entscheidung
`docs/backlog.md` wurde aus `docs/spec.md` heraus erweitert und nutzt stabile `NW-###` Feature-IDs. Die Features sind nach Phasen geordnet: `P1 - Kern`, `P2 - Lager & Fulfillment`, `P3 - Regeln & Automatisierung`, `P4 - Spaeter` und `P0 - Klaerung`.

### Alternativen verworfen
- Anforderungen nur in `docs/spec.md` belassen: Verworfen, weil Umsetzung, Statuspflege und Commit-Referenzen stabile operative IDs brauchen.
- IDs nachtraeglich pro Implementierung vergeben: Verworfen, weil dadurch Beziehungen zwischen Spec, Backlog und Commits schwerer nachvollziehbar werden.

### Konsequenzen
- Feature-IDs werden nicht umnummeriert oder wiederverwendet.
- Backlog-Status ist operativ; strategische Fachlogik bleibt in `docs/spec.md`.
- Offene Grundsatzfragen wie Enum-Werte, Tech-Stack, Versand-/Tracking-Integration und Allergen-Scope sind als `P0 - Klaerung` sichtbar.

## 2026-07-03 - Next.js mit Prisma und SQLite fuer initiale Umsetzung

**Kontext:** Fuer den Start der Umsetzung braucht das Projekt ein lauffaehiges Web-App-Geruest und eine lokale relationale Datenbank. Das Projekt ist ein Solo-Projekt; Hosting, Authentifizierung und Mehrbenutzerbetrieb sind noch nicht entschieden.

### Entscheidung
Das Projekt startet mit Next.js, React, TypeScript, Prisma und SQLite. Prisma-Migrationen werden versioniert, die lokale SQLite-Datei bleibt ignoriert.

### Alternativen verworfen
- Datenbankentscheidung weiter offen lassen: Verworfen, weil ohne persistente Modellierung keine belastbare Umsetzung der Kernentitaeten moeglich ist.
- Direkt serverbasierte Datenbank waehlen: Vorerst verworfen, weil Hosting und paralleler Betrieb noch offen sind und SQLite fuer lokale Iteration ausreicht.

### Konsequenzen
- Das fachliche Datenmodell wird in `prisma/schema.prisma` modelliert, sobald die offenen Enum-Werte geklaert sind.
- Ein spaeterer Wechsel auf eine serverbasierte relationale Datenbank bleibt moeglich.
- Authentifizierung, Hosting und Deployment bleiben offene technische Entscheidungen.

## 2026-07-03 - Abhaengigkeitsversionen fuer App-Geruest exakt pinnen

**Kontext:** `npm install` darf das frische Next.js-/Prisma-Geruest nicht unbemerkt auf andere Minor- oder Patch-Versionen heben. Beim lokalen Build traten zusaetzlich Windows-Dateisperren in generierten Ordnern wie `.next` und `node_modules` auf.

### Entscheidung
Die Runtime- und Build-Abhaengigkeiten im App-Geruest werden in `package.json` exakt gepinnt. Generierte Ordner wie `.next`, `node_modules/.prisma` und lokale SQLite-Dateien bleiben nicht versioniert.

### Konsequenzen
- Builds sind besser reproduzierbar.
- Sicherheits- und Kompatibilitaetsupdates werden bewusst per eigener Abhaengigkeitsaktualisierung eingespielt.
- Wenn Windows Dateisperren auf generierten Artefakten setzt, muessen diese Artefakte bereinigt werden, bevor erneut gebaut wird.

## 2026-07-03 - Kunden-Enums fuer NW-001 geklaert

**Kontext:** Fuer die Kundenverwaltung braucht die App konkrete Werte fuer Kundentyp und Hauttyp. Diese Werte waren in `NW-039` noch offen.

### Entscheidung
Kundentyp nutzt die Werte `B2C` und `B2B`. Hauttyp nutzt `normale Haut`, `ölige Haut`, `trockene Haut` und `Mischhaut`.

### Konsequenzen
- `NW-001` kann als erstes fachliches Modell umgesetzt werden.
- Die App validiert Kundentyp und Hauttyp zentral gegen diese Werte.
- Die uebrigen Enum-Werte aus `NW-039` bleiben offen.

## 2026-07-03 - Produktkategorien fuer NW-002 geklaert

**Kontext:** Fuer die Produktverwaltung braucht die App konkrete Werte fuer `Produkt.kategorie`. Dieser Wert war in `NW-039` noch offen.

### Entscheidung
Produktkategorien nutzen die Werte `Seifen`, `Öle`, `Balsam` und `Bodylotions`.

### Konsequenzen
- `NW-002` kann mit zentral validierten Produktkategorien umgesetzt werden.
- Die uebrigen Enum-Werte aus `NW-039` bleiben offen.

## 2026-07-03 - NW-002 Produktverwaltung umgesetzt

**Kontext:** Nach `NW-001` ist `NW-002 Produktverwaltung` das naechste P1-Kernfeature. Produkte muessen als Stammdaten mit Kategorie, Vegan-Flag, Inhaltsstoffen, Preisen, B2C-Puffer, Standard-MHD und Abo-Box-Markierung verwaltet werden.

### Entscheidung
Die App ergaenzt ein Prisma-Modell `Produkt` und eine Produktverwaltung auf der bestehenden Stammdaten-Seite. Geldwerte werden als Prisma `Decimal` gespeichert. Produktkategorien werden zentral in `src/lib/product-options.ts` definiert und serverseitig validiert.

### Konsequenzen
- `NW-002` ist im Backlog auf `done` gesetzt.
- Die lokale Datenbank nutzt die Migration `20260703210527_add_produkt`.
- Die Startseite zeigt jetzt Kunden- und Produkt-Stammdaten gemeinsam.

## 2026-07-03 - Bestell-Enums fuer NW-005 geklaert

**Kontext:** Fuer die kanaluebergreifende Bestellverwaltung braucht die App konkrete Werte fuer Bestellkanal, Zahlungsstatus und Bestellstatus. Diese Werte waren in `NW-039` noch offen.

### Entscheidung
Bestellkanal nutzt `Instagram`, `Email` und `Abo`. Zahlungsstatus nutzt `ausstehend` und `bezahlt`. Bestellstatus nutzt `Eingegangen`, `verbindlich` und `storniert`.

### Konsequenzen
- `NW-005` kann mit zentral validierten Bestellwerten umgesetzt werden.
- Die uebrigen Enum-Werte aus `NW-039` bleiben offen.

## 2026-07-03 - NW-005 Bestellverwaltung umgesetzt

**Kontext:** Nach Produkt- und Kundenverwaltung ist die kanaluebergreifende Bestellverwaltung das naechste P1-Kernfeature. Bestellungen sollen zentral erfasst und nach Kanal, Zahlung und Status sichtbar sein.

### Entscheidung
Die App ergaenzt ein Prisma-Modell `Bestellung` mit Pflicht-Relation zu `Kunde`, Datum, Kanal, Lieferadresse, Zahlungsstatus und Bestellstatus. Die Werte werden zentral in `src/lib/order-options.ts` definiert und serverseitig validiert. Bestellpositionen bleiben bewusst ausserhalb dieser Umsetzung, weil sie als `NW-029` separat gefuehrt werden.

### Konsequenzen
- `NW-005` ist im Backlog auf `done` gesetzt.
- `NW-026` ist ebenfalls auf `done` gesetzt, weil jede Bestellung genau einem Kunden zugeordnet ist.
- Die lokale Datenbank nutzt die Migration `20260703213251_add_bestellung`.
- Die Startseite zeigt jetzt Kunden, Bestellungen und Produkte als erste Stammdaten- und Arbeitsbasis.

## 2026-07-03 - NW-006 Zahlungsstatus steuert Verbindlichkeit

**Kontext:** `GR-01` und `W-1` definieren, dass eine Bestellung erst nach Zahlungseingang verbindlich ist. Eine reine Zusage darf nicht versehentlich als verbindliche Bestellung angelegt werden.

### Entscheidung
Beim Anlegen einer Bestellung wird der Bestellstatus serverseitig aus dem Zahlungsstatus abgeleitet: `ausstehend` ergibt `Eingegangen`, `bezahlt` ergibt `verbindlich`. Der Status ist nicht mehr frei im Anlageformular waehlbar. Der definierte Status `storniert` bleibt fuer spaetere manuelle Statusaenderungen erhalten.

### Konsequenzen
- `NW-006` ist im Backlog auf `done` gesetzt.
- `NW-028` ist ebenfalls auf `done` gesetzt, weil der eindeutige Bestellstatus in der Bestellliste sichtbar ist.
- Bestellstatus und Zahlungsstatus koennen beim Anlegen nicht mehr in fachlich widerspruechliche Kombinationen geraten.

## 2026-07-03 - NW-011 Aktive Arbeitsansicht als Startbereich

**Kontext:** Der Kernnutzen der App ist eine aktive Arbeitsansicht mit offenen Aufgaben, relevanten Warnungen und naechsten Schritten. Zum aktuellen Umsetzungsstand existieren Kunden, Produkte und Bestellungen, aber noch keine Chargen-, Lager- oder Packlistenmodelle.

### Entscheidung
Die Startseite zeigt zuerst eine aktive Arbeitsansicht auf Basis der vorhandenen Bestelldaten. Stornierte Bestellungen werden aus der Aufgabenliste ausgeblendet. Ausstehende Zahlungen, verbindliche Bestellungen und ausgeblendete Stornierungen werden als Kennzahlen angezeigt. Jede offene Bestellung zeigt Zahlungsstatus, Bestellstatus und einen naechsten Schritt.

### Konsequenzen
- `NW-011` ist im Backlog auf `done` gesetzt.
- Die Arbeitsansicht wird spaeter um Lager-, Chargen- und Packlistenwarnungen erweitert, sobald die zugehoerigen Features umgesetzt sind.
- `NW-029` bleibt validiert, wartet aber auf `NW-003 Chargenverwaltung`, weil Bestellpositionen laut Spec eine Charge enthalten.

## 2026-07-06 - Rollenwerte und NW-032 Mitarbeiterverwaltung umgesetzt

**Kontext:** `NW-032` braucht konkrete Rollenwerte. Die Zielgruppenbeschreibung und `GR-09` definieren bereits die drei Rollen Admin, Werkstatt-Hilfe und Packer.

### Entscheidung
Die Rollenwerte fuer Mitarbeitende sind `Admin`, `Werkstatt-Hilfe` und `Packer`. Die App ergaenzt ein Prisma-Modell `Mitarbeiter` mit Name, Rolle, Zugriffsrechten, E-Mail und Telefonnummer. Rollen werden zentral in `src/lib/employee-options.ts` definiert und serverseitig validiert.

### Konsequenzen
- `NW-032` ist im Backlog auf `done` gesetzt.
- `NW-039` bleibt `in-progress`, weil weitere Enum-Werte noch offen sind.
- Authentifizierung bleibt eine offene technische Entscheidung; die rollenbasierte Oberflaeche wird in `NW-010` behandelt.
- Zuordnungen zu Chargen und Paketen werden erst mit den jeweiligen Fachmodellen ergaenzt.

## 2026-07-06 - NW-010 serverseitige Rollenansicht umgesetzt

**Kontext:** Die Rollenwerte sind geklaert, aber Authentifizierung und Hosting sind weiterhin offene technische Entscheidungen. Fuer die lokale V1-Entwicklung braucht die App trotzdem eine rollengetrennte Arbeitsoberflaeche.

### Entscheidung
Die App nutzt vorerst eine serverseitig ausgewertete Mitarbeiter-Auswahl als aktiven Rollenkontext. Berechtigungen werden zentral in `src/lib/employee-options.ts` definiert. Die Startseite rendert Verwaltungsbereiche nur fuer berechtigte Rollen: Admin sieht Kunden, Mitarbeitende, Bestellungen und Produkte; Werkstatt-Hilfe sieht nur den Chargenarbeitsbereich; Packer sieht nur den Packlistenarbeitsbereich.

### Konsequenzen
- `NW-010` ist im Backlog auf `done` gesetzt.
- Diese Umsetzung ist keine Authentifizierung und ersetzt keine spaetere Identitaetspruefung.
- Authentifizierung bleibt eine offene technische Entscheidung.
- Werkstatt-Hilfe und Packer erhalten bis zur Umsetzung von Chargen und Packlisten nur ihre jeweiligen Arbeitsbereich-Platzhalter.

## 2026-07-06 - NW-003 Chargenverwaltung umgesetzt

**Kontext:** Fuer die Lager- und Fulfillment-Features braucht die App Chargen mit Produkt, verantwortlicher Werkstatt-Hilfe, Herstellungsdatum, MHD, produzierter Menge und Status. Der Chargenstatus war bisher in `NW-039` offen.

### Entscheidung
Chargenstatus nutzt fuer V1 die Werte `freigegeben` und `gesperrt`. `aufgebraucht` wird nicht als manueller Chargenstatus eingefuehrt, weil dieser Zustand spaeter aus Lagerbestand und Reservierungen ableitbar ist. Die App ergaenzt ein Prisma-Modell `Charge` und eine Chargenverwaltung fuer Admin und Werkstatt-Hilfe.

### Konsequenzen
- `NW-003` ist im Backlog auf `done` gesetzt.
- `NW-039` bleibt `in-progress`, weil Paketstatus, Retourenstatus, Produktzustand und Erstattungsart noch offen sind.
- `NW-004` kann als naechstes Lagerfeature den Bestand je Charge modellieren.

## 2026-07-06 - NW-004 Lagerbestand mit Reservierungen umgesetzt

**Kontext:** Nach der Chargenverwaltung braucht die App Lagerorte und getrennte Reservierungsmengen je Charge. Der Lagerort war bisher in `NW-039` offen.

### Entscheidung
Lagerorte nutzen fuer V1 die Werte `Werkstatt`, `Versandbereit` und `Restposten`. Die App ergaenzt ein Prisma-Modell `Lagerbestand` je Charge und Lagerort mit `mengeVoruebergehendReserviert` und `mengeVerbindlichReserviert`. Pro Charge und Lagerort gibt es genau einen Datensatz; erneutes Speichern aktualisiert die Reservierungsmengen.

### Konsequenzen
- `NW-004` ist im Backlog auf `done` gesetzt.
- `NW-039` bleibt `in-progress`, weil Paketstatus, Retourenstatus, Produktzustand und Erstattungsart noch offen sind.
- Freie Mengen werden noch nicht als eigenes Feld gespeichert, sondern koennen spaeter aus produzierter Chargenmenge und Reservierungen abgeleitet werden.
