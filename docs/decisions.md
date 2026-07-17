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
Bestellkanal nutzt `Instagram`, `Email` und `Abo`. Zahlungsstatus nutzt `ausstehend` und `bezahlt`. Bestellstatus nutzt `Eingegangen`, `verbindlich`, `storniert` und `abgeschlossen`.

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

## 2026-07-06 - NW-029 Bestellpositionen umgesetzt

**Kontext:** Bestellpositionen waren bis zur Chargenverwaltung blockiert, weil sie laut Spec Bestellung, Produkt, Charge und Menge enthalten.

### Entscheidung
Die App ergaenzt ein Prisma-Modell `Bestellposition` mit Pflicht-Relationen zu `Bestellung`, `Produkt` und `Charge`. Beim Anlegen wird serverseitig validiert, dass die gewaehlte Charge zum gewaehlten Produkt gehoert.

### Konsequenzen
- `NW-029` ist im Backlog auf `done` gesetzt.
- Automatische FIFO-Zuteilung wird nicht in `NW-029` umgesetzt, sondern bleibt Teil von `NW-008`.
- Automatische Reservierungs- oder Lagerabbuchung folgt in den Lagerfeatures, insbesondere `NW-027`.

## 2026-07-06 - NW-008 FIFO-Bestandszuteilung umgesetzt

**Kontext:** Nach Chargen, Lagerbestand und Bestellpositionen kann die App eine Charge automatisch nach fruehestem MHD vorschlagen und zuweisen.

### Entscheidung
Beim Anlegen einer Bestellposition waehlt die App serverseitig die freigegebene Charge des Produkts mit dem fruehesten MHD, sofern die verfuegbare Menge fuer die gewuenschte Menge reicht. Verfuegbare Menge wird aus produzierter Chargenmenge minus Lagerreservierungen und bereits angelegten Bestellpositionen berechnet.

### Konsequenzen
- `NW-008` ist im Backlog auf `done` gesetzt.
- Die manuelle Chargenauswahl fuer Bestellpositionen entfaellt.
- Lagerabzug und kanalweite Bestandsbuchung bleiben Teil von `NW-027`.

## 2026-07-06 - NW-007 Manuelle Reservierungswarnungen umgesetzt

**Kontext:** `GR-02` legt unterschiedliche Warn- und Prueffristen fuer unbezahlte Reservierungen fest. Gleichzeitig darf die App unbezahlte Reservierungen nicht automatisch stornieren.

### Entscheidung
Die aktive Arbeitsansicht markiert ausstehende Zahlungen nach Alter der Bestellung. B2C-Neukunden werden ab Tag 3 gewarnt und ab Tag 5 zur manuellen Stornierungspruefung markiert. Stammkunden werden ab Tag 7 gewarnt und ab Tag 10 zur manuellen Pruefung markiert.

### Konsequenzen
- `NW-007` ist im Backlog auf `done` gesetzt.
- Die App zeigt Warnungen und Kennzahlen, nimmt aber keine automatische Stornierung vor.
- Die Warnlogik nutzt lokale Kalendertage auf Basis des Bestelldatums.

## 2026-07-06 - NW-009 Packlisten fuer Packer umgesetzt

**Kontext:** Nach Bestellpositionen und FIFO-Zuteilung liegen Produkt, Menge und zugewiesene Charge fuer verbindliche Bestellungen vor. Packer duerfen nur die fuer das Packen noetigen Daten sehen.

### Entscheidung
Die Packer-Ansicht zeigt eine Tages-Packliste aus verbindlichen Bestellungen mit Bestellpositionen. Sichtbar sind Name, Lieferadresse, Produkte, Mengen und zugewiesene Chargen inklusive MHD. Preise, Zahlungsstatus und vollstaendige Kundendaten werden in dieser Rolle nicht angezeigt.

### Konsequenzen
- `NW-009` ist im Backlog auf `done` gesetzt.
- Paketstatus wird noch nicht angezeigt, weil Paketverwaltung und Paketstatus separat in `NW-030` und `NW-016` umgesetzt werden.
- Die Umsetzung stuetzt die Datensparsamkeit aus `GR-09`; `NW-035` bleibt offen, bis auch Paketstatus abgedeckt ist.

## 2026-07-06 - NW-027 Lagerreservierung bei Bestellpositionen umgesetzt

**Kontext:** Nach Chargen, Lagerbestand, FIFO-Zuteilung und Bestellpositionen muss die App verhindern, dass dieselbe freie Chargenmenge mehrfach fuer Bestellungen verplant wird.

### Entscheidung
Beim Anlegen einer Bestellposition bucht die App die zugewiesene FIFO-Charge in derselben Transaktion in den Lagerbestand. Ausstehende Bestellungen erhoehen die voruebergehend reservierte Menge, bezahlte Bestellungen erhoehen die verbindlich reservierte Menge. Verfuegbare Menge wird kuenftig aus produzierter Chargenmenge minus Lagerreservierungen berechnet.

### Konsequenzen
- `NW-027` ist im Backlog auf `done` gesetzt.
- Die Lagerreservierung ist fuer den bestehenden Bestellkanal synchron zur Bestellposition.
- Verkaufsevents werden ueber `mengeMitgenommen` in die freie Chargenmenge einbezogen; Abo-Abwicklung und Retouren werden spaeter angeschlossen, sobald ihre Modelle umgesetzt sind.
- Statuswechsel von ausstehend zu bezahlt braucht spaeter eine Umbuchung von voruebergehender zu verbindlicher Reservierung.

## 2026-07-06 - NW-020 Verkaufsevent-Verwaltung umgesetzt

**Kontext:** Die Spec beschreibt Verkaufsevents mit Datum, Ort und Positionen fuer mitgenommene und verkaufte Chargenmengen. Nach Chargen und Lagerlogik kann dieser Verkaufskanal als naechster Fulfillment-Baustein modelliert werden.

### Entscheidung
Die App ergaenzt `Verkaufsevent` und `VerkaufseventPosition`. Positionen verbinden Events mit Chargen und speichern `mengeMitgenommen` und `mengeVerkauft`. Serverseitig wird geprueft, dass verkaufte Mengen nicht groesser als mitgenommene Mengen sind und dass fuer die mitgenommene Menge noch freie Chargenmenge vorhanden ist.

### Konsequenzen
- `NW-020` und `NW-036` sind im Backlog auf `done` gesetzt.
- Mitgenommene Event-Mengen reduzieren die freie Chargenmenge, damit diese Ware nicht parallel fuer Bestellungen verplant wird.
- Nicht verkaufte Event-Mengen werden noch nicht automatisch zurueckgebucht; dafuer braucht es spaeter eine eigene fachliche Rueckbuchungsfunktion.

## 2026-07-06 - NW-017 MHD-Warnungen umgesetzt

**Kontext:** `GR-12` verlangt Rabattvorschlaege vor Ablauf des MHD, aber keine automatische Preisaenderung ohne Ninas Bestaetigung.

### Entscheidung
Die aktive Arbeitsansicht zeigt freie, freigegebene Chargen mit nahem MHD als Aufgabe. Ab 56 Tagen vor MHD wird ein 20-%-Rabatt vorgeschlagen, ab 30 Tagen vor MHD ein 50-%-Rabatt. Bereits ueberschrittene MHDs werden als kritische Restposten-Pruefung angezeigt.

### Konsequenzen
- `NW-017` ist im Backlog auf `done` gesetzt.
- Preise, Produktdaten und Lagerorte werden nicht automatisch veraendert.
- Die Warnung nutzt die aktuell freie Chargenmenge, damit voll reservierte oder fuer Events mitgenommene Chargen nicht als Verkaufsaufgabe erscheinen.

## 2026-07-06 - NW-014 B2B-Pufferregel umgesetzt

**Kontext:** `GR-06` definiert B2B-Sonderkonditionen ab 50 Einheiten und schuetzt den B2C-Puffer vor B2B-Bestellungen.

### Entscheidung
Beim Anlegen einer Bestellposition prueft die FIFO-Zuteilung den Kundentyp der Bestellung. Fuer B2B-Bestellpositionen ab 50 Einheiten wird nur eine Charge verwendet, wenn nach der Reservierung mindestens die am Produkt gepflegte B2C-Puffermenge frei bleibt. B2B-Bestellpositionen unter 50 Einheiten werden wie B2C behandelt.

### Konsequenzen
- `NW-014` ist im Backlog auf `done` gesetzt.
- Die Regel greift serverseitig bei der Chargenzuteilung und kann nicht nur durch die Oberflaeche umgangen werden.
- Zahlungsziel- und Preisautomatik fuer B2B bleiben spaetere Aufgaben, weil die App aktuell noch keine Positionspreise oder Rechnungslogik fuehrt.

## 2026-07-06 - Paketstatus fuer NW-030 geklaert

**Kontext:** Fuer Paketverwaltung und Paket-/Trackingstatus braucht die App konkrete Statuswerte.

### Entscheidung
Paketstatus nutzt fuer V1 die Werte `Vorbereitet`, `Gepackt`, `Versendet` und `Zugestellt`.

### Konsequenzen
- `NW-030` und `NW-016` sind nicht mehr durch fehlende Paketstatuswerte blockiert.
- `NW-039` bleibt `in-progress`, weil Retourenstatus, Produktzustand und Erstattungsart weiterhin offen sind.

## 2026-07-06 - Versandoptionen fuer NW-030 geklaert

**Kontext:** Fuer die Paketverwaltung braucht die App konkrete Versandoptionen.

### Entscheidung
Versandoption nutzt fuer V1 die Werte `DHL` und `DHL Express`.

### Konsequenzen
- `NW-030` ist nicht mehr durch fehlende Versandoptionen blockiert.
- Weitere Versandarten werden erst ergaenzt, wenn sie fachlich benoetigt werden.

## 2026-07-06 - Versandlabel und Tracking fuer V1 manuell

**Kontext:** Fuer Paketverwaltung und Paket-/Trackingstatus muss geklaert sein, ob V1 eine Versanddienstleister-Integration braucht.

### Entscheidung
V1 erstellt Versandlabel ausserhalb der App. Die App speichert Versandoption, Versandkosten, Paketstatus, Trackingnummer, Versanddatum und Zustelldatum manuell.

### Konsequenzen
- `NW-041` ist im Backlog auf `done` gesetzt.
- Es wird fuer V1 keine DHL- oder andere Versanddienstleister-Integration gebaut.
- `NW-030` und `NW-016` koennen mit manueller Paket- und Trackingpflege umgesetzt werden.

## 2026-07-06 - Retourenstatus geklaert

**Kontext:** Fuer `NW-015 Retourenverwaltung` braucht die App Prozessstatuswerte fuer Retouren. Erstattung soll nicht als Retourenstatus modelliert werden.

### Entscheidung
Retourenstatus nutzt fuer V1 die Werte `Angemeldet`, `Eingegangen`, `In Prüfung`, `Angenommen`, `Abgelehnt` und `Abgeschlossen`.

### Konsequenzen
- `NW-039` bleibt `in-progress`, weil Produktzustand und Erstattungsart weiterhin offen sind.
- Erstattung wird separat ueber `Erstattungsart` geklaert und nicht in den Retourenstatus gemischt.

## 2026-07-06 - Produktzustand fuer Retouren geklaert

**Kontext:** Fuer Retouren und Rueckbuchung in Bestand muss die App den Zustand der zurueckgesendeten Ware erfassen.

### Entscheidung
Produktzustand nutzt fuer V1 die Werte `Ungeöffnet`, `Geöffnet`, `Beschädigt` und `Mangelhaft`.

### Konsequenzen
- `NW-039` bleibt `in-progress`, weil Erstattungsart weiterhin offen ist.
- Die Werte passen zur spaeteren Bestandsrueckbuchung: ungeoeffnete Ware kann geprueft zurueckgebucht werden; geoeffnete oder beschaedigte Ware wird ausgebucht; mangelhafte Ware dient als Reklamationsfall.

## 2026-07-06 - Erstattungsart fuer Retouren geklaert

**Kontext:** Fuer `NW-015 Retourenverwaltung` braucht die App neben Retourenstatus und Produktzustand konkrete Erstattungsarten.

### Entscheidung
Erstattungsart nutzt fuer V1 die Werte `Keine`, `Gutschein`, `Geld zurück` und `Ersatzprodukt`.

### Konsequenzen
- `NW-039` ist im Backlog auf `done` gesetzt.
- `Keine` wird nur verwendet, wenn keine Erstattung erfolgt, etwa weil die Retoure abgelehnt wurde.

## 2026-07-06 - Auth und Hosting werden spaeter geklaert

**Kontext:** Die App nutzt aktuell eine lokale Rollenansicht ohne echte Authentifizierung. Auth, Hosting und Deployment sind wichtig, aber fuer die naechsten Fachfeatures nicht zwingend.

### Entscheidung
Auth, Hosting und Deployment werden jetzt nicht weiter festgelegt. Die lokale Entwicklung mit Next.js, Prisma und SQLite bleibt fuer die fachliche V1-Umsetzung bestehen.

### Konsequenzen
- `NW-040` bleibt als geklaerte, aber spaeter umzusetzende Grundsatzfrage im Backlog sichtbar.
- Fachfeatures wie Pakete, Retouren und Bearbeitung koennen weitergebaut werden, ohne jetzt Login oder Hosting zu entscheiden.

## 2026-07-06 - Allergen-Workflow gehoert in V1

**Kontext:** Allergene standen zunaechst unter "Kann warten", gleichzeitig verlangt `GR-10` eine Bestaetigung vor Bestellabschluss bei allergenbehafteten Produkten.

### Entscheidung
V1 bekommt einen verpflichtenden Allergen-Bestaetigungsworkflow. Bei Bestellungen mit allergenbehafteten Produkten muss vor dem Abschluss eine Bestaetigung mit Timestamp vorliegen.

### Konsequenzen
- `NW-042` ist im Backlog auf `done` gesetzt.
- `NW-025` wird aus `P4 - Spaeter` in `P3 - Regeln & Automatisierung` verschoben und bleibt als umzusetzenes V1-Feature sichtbar.
- Produkt-Allergene bleiben nicht nur ein sichtbares Datenfeld, sondern werden workflow-relevant.

## 2026-07-06 - Bestellabschluss ueber Paket-Zustellung

**Kontext:** `GR-11` verlangt, dass eine Bestellung abgeschlossen wird, sobald die Zustellung bestaetigt ist. Dafuer braucht die Bestellung einen klaren Abschlussstatus.

### Entscheidung
Bestellstatus erhaelt den zusaetzlichen Wert `abgeschlossen`. Wenn ein Paket den Status `Zugestellt` bekommt, soll die zugehoerige Bestellung automatisch auf `abgeschlossen` gesetzt werden. Ein separater Status `archiviert` wird fuer V1 nicht eingefuehrt.

### Konsequenzen
- `NW-016` kann mit Paketstatus `Zugestellt` als Ausloeser fuer den Bestellabschluss umgesetzt werden.
- Abgeschlossene Bestellungen gelten als erledigt und sollen nicht mehr als offene Aufgabe erscheinen.

## 2026-07-09 - NW-030 Paketverwaltung umgesetzt

**Kontext:** Fuer Packlisten und spaetere Trackingstatus braucht die App Pakete mit Bestellung, Packer, Versandoption, Versandkosten, Paketstatus und manuellen Versand-/Zustelldaten. Versandlabel werden in V1 ausserhalb der App erstellt.

### Entscheidung
Die App ergaenzt ein Prisma-Modell `Paket` mit Pflicht-Relationen zu `Bestellung` und `Mitarbeiter`. Als Packer kann nur ein Mitarbeiter mit Rolle `Packer` zugeordnet werden. Paketstatus und Versandoptionen werden zentral in `src/lib/package-options.ts` validiert.

### Konsequenzen
- `NW-030` ist im Backlog auf `done` gesetzt.
- Die Packer-Packliste zeigt Paketstatus zu einer Bestellung, bleibt aber bei Name, Lieferadresse, Produkt, Menge und Charge datensparsam.
- `NW-016` bleibt separat: Erst dort setzt `Zugestellt` die zugehoerige Bestellung automatisch auf `abgeschlossen`.

## 2026-07-09 - NW-016 Paketstatus schliesst Bestellung ab

**Kontext:** `GR-11` verlangt, dass eine Bestellung abgeschlossen wird, sobald die Zustellung bestaetigt ist. Paketstatus und Trackingdaten werden in V1 manuell gepflegt.

### Entscheidung
Beim Anlegen oder Aktualisieren eines Pakets setzt der Status `Zugestellt` die zugehoerige Bestellung in derselben Datenbanktransaktion auf `abgeschlossen`. Paketstatus, Trackingnummer, Versanddatum und Zustelldatum bleiben manuell pflegbar.

### Konsequenzen
- `NW-016` ist im Backlog auf `done` gesetzt.
- Abgeschlossene Bestellungen verschwinden aus der offenen Arbeits- und Packer-Packliste.
- Ein spaeteres Zuruecksetzen des Paketstatus oeffnet die Bestellung nicht automatisch wieder; dafuer gibt es aktuell keine fachliche Regel.

## 2026-07-09 - NW-025 Allergen-Workflow umgesetzt

**Kontext:** `GR-10` verlangt bei allergenbehafteten Produkten eine Kundenbestaetigung mit Timestamp vor dem Bestellabschluss. Produkte haben bereits ein freies Feld `allergene`; Bestellungen hatten noch keinen dokumentierten Bestaetigungszeitpunkt.

### Entscheidung
Die App speichert die Allergenbestaetigung als `Bestellung.allergeneBestaetigtAm`. Beim Anlegen einer Bestellposition mit befuellten Produkt-Allergenen muss die Allergenliste als gelesen bestaetigt werden, sofern die Bestellung noch keinen Timestamp hat. Zusaetzlich verhindert die Paketstatuslogik den Wechsel auf `Zugestellt`, wenn eine Bestellung allergenbehaftete Positionen ohne Bestaetigung enthaelt.

### Konsequenzen
- `NW-025` ist im Backlog auf `done` gesetzt.
- Die aktive Arbeitsansicht zeigt offene Allergenbestaetigungen als Warnung.
- Das Bestellattribut aus der Spec wird technisch als Timestamp konkretisiert, nicht als weiteres Enum.

## 2026-07-09 - NW-038 Versandkostenregel als Vorschlag umgesetzt

**Kontext:** `GR-13` definiert Versandkosten fuer B2C, B2B und Abo-Bestellungen. Gleichzeitig ist automatische Versandkostenberechnung als eigenes spaeteres Feature `NW-021` markiert.

### Entscheidung
Die App berechnet beim Paket-Anlegen einen Versandkosten-Vorschlag: B2C unter 39,00 EUR Warenwert bekommt 4,50 EUR, B2C ab 39,00 EUR ist frei, B2B und Abo sind immer frei. Der Vorschlag wird als Default im manuellen Versandkostenfeld genutzt und in der Paketliste sichtbar gemacht.

### Konsequenzen
- `NW-038` ist im Backlog auf `done` gesetzt.
- Nina kann den vorgeschlagenen Betrag weiterhin manuell ueberschreiben.
- `NW-021` bleibt offen, weil es um eine spaetere vollautomatische Versandkostenberechnung geht.

## 2026-07-09 - NW-015 Retourenverwaltung umgesetzt

**Kontext:** Die Spec definiert Retouren je Bestellposition mit Grund, Produktzustand, Status und Erstattungsart. `GR-07` legt unterschiedliche Fristen und Bedingungen fuer B2C, B2B und Abo fest.

### Entscheidung
Die App ergaenzt ein Prisma-Modell `Retoure`. Retouren werden nur fuer Bestellpositionen mit zugestelltem Paket innerhalb der Frist angelegt: B2C 14 Tage, B2B und Abo 7 Tage ab Zustellung. Fuer B2B und Abo akzeptiert die App nur die Produktzustaende `Beschaedigt` und `Mangelhaft`, weil die Spec dort nur eindeutige Maengel, Transportschaeden oder fehlerhafte/beschaedigte Produkte erlaubt.

### Konsequenzen
- `NW-015` ist im Backlog auf `done` gesetzt.
- Die aktive Arbeitsansicht zeigt offene Retouren.
- Bestandsrueckbuchung oder Ausbuchung erfolgt noch nicht; das bleibt `NW-031`.

## 2026-07-09 - NW-031 Retouren-Rueckbuchung umgesetzt

**Kontext:** `GR-08` definiert, wie angenommene Retouren je nach Produktzustand und MHD-Restlaufzeit zu behandeln sind. Das aktuelle Lagerbestand-Modell speichert Reservierungen je Charge und Lagerort; physische Mengen liegen weiterhin an der Charge.

### Entscheidung
Die App ergaenzt an `Retoure` die Felder `bestandsbuchung` und `bestandsbuchungAm`. Angenommene Retouren koennen einmalig gebucht werden. Ungeoeffnete Ware mit mehr als 28 Tagen MHD-Restlaufzeit reduziert die verbindliche Reservierung der urspruenglichen Charge. Ungeoeffnete Ware mit 28 Tagen oder weniger MHD-Restlaufzeit reduziert ebenfalls die verbindliche Reservierung und markiert die Charge ueber einen `Restposten`-Lagerbestand. Nicht ungeoeffnete Ware wird als `Ausgebucht` dokumentiert.

### Konsequenzen
- `NW-031` ist im Backlog auf `done` gesetzt.
- Eine Retoure wird nach der Bestandsbuchung auf `Abgeschlossen` gesetzt und kann nicht erneut gebucht werden.
- Das Modell bleibt kompatibel mit der bisherigen Ableitung freier Mengen aus produzierter Menge minus Reservierungen.

## 2026-07-09 - NW-012 Stammkundenautomatik umgesetzt

**Kontext:** `GR-04` definiert Stammkunden als Kunden mit sechs erfolgreichen Bestellungen innerhalb von 365 Tagen. Stammkunden erhalten 10 % Rabatt, 24 Stunden Vorab-Benachrichtigung ueber neue Chargen und nach acht Monaten Inaktivitaet eine Warnung fuer Nina.

### Entscheidung
Die App wertet `abgeschlossen` als erfolgreiche Bestellung. Beim Bestellabschluss ueber Paket-Zustellung wird der Kunde automatisch auf `stammkunde` gesetzt, wenn innerhalb von 365 Tagen sechs abgeschlossene Bestellungen vorliegen. Bestehende Daten werden beim Laden der Arbeitsansicht nachgezogen. Berechnete B2C-Warenwerte nutzen fuer Stammkunden 10 % Rabatt. Vorab-Benachrichtigungen und Inaktivitaet werden als Aufgaben in der Arbeitsansicht dargestellt, nicht als externe Nachrichten.

### Konsequenzen
- `NW-012` ist im Backlog auf `done` gesetzt.
- Die App versendet keine Nachrichten automatisch; Nina sieht eine Vorabinfo-Aufgabe fuer neue freigegebene Chargen.
- Stammkunden werden nicht automatisch zurueckgestuft, wenn sie spaeter weniger als sechs Bestellungen im rollierenden Zeitraum haben.

## 2026-07-09 - Abo-Box-Statuswerte geklaert

**Kontext:** `NW-018 Abo-Box-Verwaltung` braucht konkrete Statuswerte. Die Spec definiert fuer Abo-Boxen bereits `Status`, `Startdatum`, `Pausiert seit` und `Kuendigungsdatum`, aber bisher keine Werte fuer das Status-Enum.

### Entscheidung
Abo-Box-Status nutzt fuer V1 die Werte `aktiv`, `pausiert` und `gekuendigt`.

### Konsequenzen
- `NW-018` ist nicht mehr durch fehlende Statuswerte blockiert.
- `aktiv` wird bei der monatlichen Abo-Abwicklung beruecksichtigt.
- `pausiert` wird fuer voruebergehend ausgesetzte Abo-Boxen verwendet.
- `gekuendigt` wird fuer beendete Abo-Boxen verwendet und nicht mehr abgewickelt.

## 2026-07-09 - Abo-Box-Inhalt fuer V1 geklaert

**Kontext:** `NW-018 Abo-Box-Verwaltung` und `NW-019 Monatliche Abo-Abwicklung` brauchen eine klare Definition, welche Produkte in einer monatlichen Abo-Box enthalten sind.

### Entscheidung
Nina waehlt monatlich genau vier Produkte fuer die Abo-Box aus. In der App sind das die Produkte, die mit `In Abo-Box enthalten` markiert sind. Diese vier Produkte gelten fuer alle aktiven Abo-Boxen im jeweiligen Monat.

### Konsequenzen
- Vor der monatlichen Abo-Abwicklung muessen genau vier Produkte mit `In Abo-Box enthalten` markiert sein.
- Kundenspezifische Abo-Box-Inhalte werden in V1 nicht modelliert.
- Eine separate Historie der monatlichen Abo-Auswahl wird in V1 nicht eingefuehrt; die abgewickelten Bestellungen und Positionen dokumentieren den konkreten Monatsinhalt.

## 2026-07-09 - NW-018 Abo-Box-Verwaltung umgesetzt

**Kontext:** Nach Klaerung der Abo-Box-Statuswerte und des globalen Monatsinhalts kann die App Abo-Boxen als Kundenbeziehung verwalten. Die monatliche Abwicklung bleibt ein separates Feature.

### Entscheidung
Die App ergaenzt ein Prisma-Modell `AboBox` mit Kunde, Lieferadresse, Status, Startdatum, Pausiert-seit und Kuendigungsdatum. Statuswerte werden zentral in `src/lib/subscription-options.ts` validiert. Die Startseite zeigt aktive Abo-Boxen und die aktuelle globale Abo-Produktauswahl als `x/4`.

### Konsequenzen
- `NW-018` ist im Backlog auf `done` gesetzt.
- `NW-019` bleibt offen, weil aus Abo-Boxen noch keine monatlichen Bestellungen, Packlisten oder Lagerbuchungen erzeugt werden.
- `NW-037` bleibt offen; die maximale Pausierungsdauer wird noch nicht automatisch validiert.

## 2026-07-09 - NW-019 Abo-Abwicklung manuell ausloesen

**Kontext:** `GR-14` nennt den 15. des Monats als Sammelabwicklung. Hosting, Scheduler und Hintergrundjobs sind fuer V1 noch nicht entschieden.

### Entscheidung
Die monatliche Abo-Abwicklung wird in V1 manuell per Button gestartet. Die App speichert den Monatslauf als `AboAbwicklung` mit eindeutiger Kombination aus Jahr und Monat, damit derselbe Monat nicht doppelt abgewickelt wird. Aus aktiven Abo-Boxen werden Abo-Bestellungen erzeugt; die vier global markierten Abo-Produkte werden per FIFO als Positionen angelegt und verbindlich im Lager reserviert.

### Konsequenzen
- `NW-019` ist im Backlog auf `done` gesetzt.
- Ein Cronjob oder automatischer Hintergrundlauf wird fuer V1 nicht eingefuehrt.
- Der Monatslauf ist transaktional: Wenn aktive Abo-Boxen, genau vier Abo-Produkte, Allergenbestaetigung oder FIFO-Bestand fehlen, wird nichts teilweise angelegt.
- Versandlabel und Pakete bleiben weiterhin manuell, passend zur V1-Entscheidung fuer Versandlabel und Tracking.

## 2026-07-15 - NW-037 Abo-Pausierung mit konkreten Monaten

**Kontext:** `GR-15` verlangt eine Abo-Pausierung fuer maximal zwei Monate und Anmeldung bis zum 15. des Vormonats. Geklaert wurde, dass eine Pause immer ab einem konkreten Kalendermonat gilt und der Kunde die gewuenschte Dauer nennt.

### Entscheidung
Die App speichert fuer Abo-Boxen `pausiertVon` und `pausiertBis` als konkrete Pausenmonate. Der Pausenzeitraum darf hoechstens zwei aufeinanderfolgende Monate umfassen und muss bis einschliesslich 15. des Vormonats erfasst werden. Die monatliche Abo-Abwicklung ueberspringt aktive Abo-Boxen, deren Pausenfenster den Abwicklungsmonat enthaelt.

### Konsequenzen
- `NW-037` ist im Backlog auf `done` gesetzt.
- Nach Ablauf der Pause wird keine Abo-Box automatisch umgestellt.
- Die aktive Arbeitsansicht zeigt Nina eine Warnung, damit sie den Status mit dem Kunden pruefen kann.

## 2026-07-15 - NW-013 Produktknappheit als priorisierte Pruefliste

**Kontext:** `GR-05` und `W-3` definieren bei Produktknappheit die Reihenfolge: zuerst Stammkunden, danach B2C-Neukunden, innerhalb der Gruppe nach Anfragezeitpunkt. Die App reserviert Bestand bereits beim Anlegen einer Bestellposition; eine automatische Umverteilung bestehender Reservierungen ist fuer V1 nicht definiert.

### Entscheidung
Produktknappheit wird in V1 als priorisierte Pruefliste in der Arbeitsansicht umgesetzt. Als Anfragezeitpunkt gilt `Bestellung.datum`. Die Liste beruecksichtigt offene B2C-Bestellpositionen und sortiert sie nach Stammkundenstatus, Bestelldatum und Bestell-ID.

### Konsequenzen
- `NW-013` ist im Backlog auf `done` gesetzt.
- Nina sieht bei knappen Produkten, welche Bestellungen zuerst beruecksichtigt werden sollen.
- Bereits gebuchte Reservierungen werden nicht automatisch umverteilt.

## 2026-07-15 - NW-033 bis NW-035 Rollenabschluss fuer V1

**Kontext:** Die App hatte bereits eine serverseitig ausgewertete Rollenansicht ueber `NW-010`. Fuer den V1-Abschluss mussten die konkreten Zielgruppen-Sichten gegen `GR-09` geprueft werden.

### Entscheidung
Admin bekommt alle vorhandenen Verwaltungs- und Arbeitsbereiche inklusive Tages-Packliste. Werkstatt-Hilfe bekommt nur den Chargenarbeitsbereich. Packer bekommt ausschliesslich die Tages-Packliste mit Name, Lieferadresse, Produkten, Menge, Charge, MHD und Paketstatus.

### Konsequenzen
- `NW-033`, `NW-034` und `NW-035` sind im Backlog auf `done` gesetzt.
- Packer sehen weiterhin keine Preise, Umsaetze, Zahlungsstatus oder vollstaendige Kundendaten.
- Die Umsetzung bleibt eine Rollenansicht ohne echte Authentifizierung; Auth bleibt Teil der offenen technischen Entscheidung `NW-040`.

## 2026-07-15 - NW-040 Demo-Login und Browser-Betrieb fuer V1

**Kontext:** Die fachliche V1 ist umgesetzt. Die App ist eine Pruefungsleistung und soll vom Dozenten lokal ohne geheime Zugangsdaten geprueft werden koennen. Gleichzeitig soll die Rollenlogik demonstrierbar bleiben.

### Entscheidung
V1 nutzt einen einfachen Demo-Login mit Mitarbeiter-Auswahl ohne Passwort oder Code. Nach erfolgreicher Auswahl wird die Mitarbeiter-ID in einem HTTP-only Cookie gespeichert; die Rolle wird serverseitig aus der Datenbank gelesen. Ohne angelegte Mitarbeitende bleibt die Admin-Ersteinrichtung offen, damit die erste Person angelegt werden kann.

Die App wird lokal gestartet und im Browser ueber `http://localhost:3000` oder eine lokale Netzwerk-URL geoeffnet. Externes Hosting und staerkere Authentifizierung werden nicht in V1 umgesetzt.

### Konsequenzen
- `NW-040` ist im Backlog auf `done` gesetzt.
- Der Dozent kann Rollen direkt testen, ohne einen geheimen Login-Code zu kennen.
- Die Loesung ist fuer lokale Pruefung gedacht und keine vollwertige Internet-Authentifizierung.

## 2026-07-17 - Arbeitsoberflaeche in Tabs gegliedert

**Kontext:** Die bisherige Arbeitsoberflaeche zeigte alle Verwaltungs- und Arbeitsbereiche untereinander auf einer Seite. Das war fuer die Bedienung unuebersichtlich, obwohl die fachlichen Bereiche bereits rollenbasiert getrennt waren.

### Entscheidung
Die App nutzt eine rollenbasierte Tab-Navigation. Die vorhandenen Bereiche werden in `Dashboard`, `Packliste`, `Kunden`, `Produkte`, `Bestellungen`, `Versand`, `Retouren`, `Abo-Boxen`, `Lager` und `Mitarbeitende` gegliedert. Der aktive Tab wird ueber `?tab=` in der URL gesteuert und weiterhin serverseitig anhand der Rolle gefiltert.

Zusaetzlich wurde die zentrale Akzentfarbe der UI von Gruen auf `#B23F00` Dunkelorange umgestellt.

### Konsequenzen
- Die Startseite bleibt technisch eine servergerenderte Next.js-Seite, wird aber fuer Nutzer in fachliche Arbeitsbereiche aufgeteilt.
- Rollenrechte bleiben unveraendert: Nicht berechtigte Tabs werden nicht gerendert.
- Die Navigation ist per URL direkt aufrufbar, z. B. `/?tab=produkte`.
- Farbwerte werden zentral in `src/app/globals.css` gepflegt.
