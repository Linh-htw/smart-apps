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
