# architecture.md - Nina Wolffs Shop- und Kundenmanagement-App

_Technische Wahrheit des Projekts. Aktualisieren, sobald Stack, Datenmodell, Module oder Konventionen entschieden werden._

---

## Status

Code-Stack für die erste Umsetzung ist festgelegt und im Repo eingerichtet:

- **Framework:** Next.js mit React und TypeScript.
- **Datenbankzugriff:** Prisma.
- **Datenbank:** SQLite für die lokale Solo-Entwicklung und den initialen V1-Aufbau.

Diese Entscheidung gilt für den aktuellen Projektstand und kann später neu bewertet werden, wenn Hosting, Mehrbenutzerbetrieb oder externe Integrationen konkrete Anforderungen an Betrieb und Skalierung stellen.

## Projektsetup

- `package.json` definiert die Next.js-App mit TypeScript, React, ESLint, Prisma CLI und Prisma Client.
- Runtime- und Build-Abhängigkeiten sind exakt gepinnt, damit `npm install` keine unerwarteten Minor-/Patch-Upgrades in das lokale Geruest zieht.
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

Hinweis für Windows: Generierte Artefakte wie `.next` und `node_modules/.prisma` können lokal durch Dateisperren blockiert werden. In diesem Fall müssen hängende Node-Prozesse beendet und die generierten Artefakte bereinigt werden, bevor erneut gebaut wird.

## Empfohlene Zielarchitektur

| Bereich | Empfehlung | Begruendung |
|---|---|---|
| App-Typ | Web-App mit rollenbasierter Admin-/Mitarbeiteroberflaeche | Nina und Mitarbeitende brauchen zentrale, geraeteunabhängige Arbeitsansichten. |
| Framework | Next.js mit React und TypeScript | Erlaubt eine kompakte Full-Stack-Web-App mit serverseitiger Validierung und arbeitsorientierter UI in einem Projekt. |
| Datenbank | SQLite ueber Prisma | Passt für lokale Solo-Entwicklung, relationale Entitaeten und schnelle Iteration ohne zusätzlichen Datenbankbetrieb. |
| Backend | Next.js-Serverlogik mit serverseitiger Validierung und Rechtepruefung | Rollen, Bestand, Reservierungen und Zahlungen duerfen nicht nur im Frontend geprueft werden. |
| Frontend | Arbeitsorientierte, rollenbasierte Tab-Oberflaeche statt Marketing-UI | Hauptnutzen ist schnelle Bearbeitung offener Aufgaben ohne ueberladene Ein-Seiten-Ansicht. |

## Frontend-Struktur

Die Arbeitsoberflaeche ist in rollenbasierte Tabs gegliedert. Sichtbar sind nur Tabs, für die die aktive Rolle serverseitig berechtigt ist:

- **Übersicht:** priorisierte Startseite mit dringenden Aufgaben, Blockaden, nächstem Klick, Warnungen und offenen Aufgaben.
- **Packen:** Packer-Sicht mit packrelevanten Daten.
- **Kunden:** Kundenanlage, Bearbeitung und Kundenliste.
- **Produkte:** Produktanlage, Bearbeitung und Produktliste.
- **Bestellungen:** Bestellanlage, Bearbeitung, Bestellliste und Produkte zur Bestellung.
- **Versand & Pakete:** Pakete, Versandoption, Versandkosten, Tracking, Zustellung und Bearbeitung.
- **Retouren:** Retourenanlage, Bearbeitung vor Bestandsbuchung, Retourenliste und Bestandsbuchung angenommener Retouren.
- **Abo-Boxen:** Abo-Boxen, Bearbeitung und monatliche Abo-Abwicklung.
- **Lager & Chargen:** Chargen, Lagerbestand, Verkaufsevents, Bearbeitung und Event-Positionen.
- **Mitarbeitende:** Mitarbeiteranlage, Bearbeitung und Mitarbeiterliste.

Tabs werden ueber den Query-Parameter `tab` gesteuert, z. B. `/?tab=kunden`. Das haelt die Navigation serverseitig, teilbar und ohne zusätzlichen Client-State.

Der Bestellprozess wird zusätzlich als geführter Ablauf in der Übersicht dargestellt. Die Schritte sind: Kunde erfassen, Produkt und Bestand vorbereiten, Bestellung anlegen, Produkte zur Bestellung hinzufügen, Paket und Versand pflegen sowie Retoure bei Bedarf bearbeiten. Jeder Schritt zeigt Status, kurze Orientierung und den direkten Sprung zum passenden Tab. In den Fach-Tabs beginnt die Ansicht direkt mit den jeweiligen Formularen und Listen.

Das Dashboard fasst die wichtigsten Handlungen als Fokus-Karten zusammen: `Dringend`, `Blockiert` und `Nächster Klick`. Diese Karten werden aus bestehenden Warnungen, offenen Aufgaben und dem geführten Bestellablauf serverseitig berechnet.

Nach erfolgreichen Speichern-Aktionen leitet die App auf den passenden nächsten Tab weiter und übergibt `saved` sowie optional `focus` in der URL. Daraus rendert die Seite einen Erfolgshinweis mit nächstem Schritt und hebt den neu gespeicherten Eintrag in der Liste hervor.

Arbeitslisten nutzen einfache URL-basierte Schnellfilter ueber `filter`, z. B. offene Bestellungen, offene Zahlungen, Packaufgaben ohne Paket, kritische MHD-Chargen, offene Pakete und offene Retouren. Die Filter bleiben serverseitig, direkt teilbar und pro Tab bewusst auf wenige häufige Arbeitszustände begrenzt.

Die zentrale UI-Akzentfarbe ist `#B23F00` Dunkelorange. Abgeleitete Hover- und Soft-Tones werden in `src/app/globals.css` ueber CSS-Variablen gepflegt.

Sichtbare deutsche UI-Texte nutzen echte Umlaute. Technische Namen, Query-Parameter, Formularfelder und gespeicherte Validierungswerte bleiben stabil und werden bei Bedarf nur über Anzeige-Labels übersetzt.

## Fachliche Module

- **Kunden:** Stammdaten, Typ B2C/B2B, Stammkundenstatus, Vorlieben, Hauttyp.
- **Produkte:** Preise, Kategorien, Allergene, Inhaltsstoffe, B2C-Puffer, Abo-Box-Markierung.
- **Chargen:** Herstellung, MHD, produzierte Menge, Status, verantwortliche Werkstatt-Hilfe.
- **Lagerbestand:** Lagerort, verfügbare Menge, voruebergehende Reservierung, verbindliche Reservierung.
- **Bestellungen:** Kanal, Status, Zahlungsstatus, Lieferadresse, Allergenbestätigung.
- **Bestellpositionen:** Produkt, Charge, Menge.
- **Packlisten/Pakete:** Packer-Sicht, Versandoption, Paketstatus, Tracking.
- **Retouren:** Fristen, Produktzustand, Erstattung/Ersatz, Rueckbuchung in Bestand.
- **Abo-Boxen:** Status, Lieferadresse, monatliche Sammelabwicklung, Pausierung, globale Produktauswahl.
- **Verkaufsevents:** Mitgenommene und verkaufte Chargenmengen.
- **Mitarbeiter/Rollen:** Admin, Werkstatt-Hilfe, Packer.

## Zentrale Invarianten

- Bestand muss kanaluebergreifend konsistent sein.
- Reservierung und verbindliche Buchung sind getrennte Mengen.
- FIFO nach fruehestem MHD ist Standard bei Bestandszuteilung.
- B2B-Bestellungen duerfen den B2C-Puffer nicht unterschreiten.
- Statuswechsel müssen nachvollziehbar und validiert sein.
- `Produkt.inAboBoxEnthalten` bildet in V1 die monatliche globale Abo-Auswahl: genau vier markierte Produkte für alle aktiven Abo-Boxen.
- Rollenrechte müssen serverseitig erzwungen werden.

## Datenmodell

Die Entitaeten und Beziehungen stehen in `docs/spec.md`. Prisma ist die technische Modellierungsschicht für Tabellen, Relationen und spätere Migrationen. Enum-Werte werden nicht frei erfunden, sondern aus `docs/spec.md` oder dokumentierten Entscheidungen abgeleitet.

SQLite ist für den initialen V1-Aufbau ausreichend, weil das Projekt als Solo-Projekt startet und die fachlichen Regeln zuerst lokal korrekt modelliert werden müssen. Ein späterer Wechsel auf eine serverbasierte relationale Datenbank bleibt möglich, wenn Hosting oder paralleler Zugriff das erfordern.

Bis die Enum-Werte aus `NW-039` geklaert sind, enthaelt das Prisma-Schema nur fachliche Tabellen, deren benoetigte Enum-Werte geklaert und zentral validiert sind. `NW-001` nutzt für Kunden `Kunde` als erstes fachliches Modell; Kundentyp und Hauttyp werden in der App gegen die Werte aus `docs/spec.md` validiert. `NW-002` ergaenzt `Produkt`; Produktkategorien werden zentral gegen `Seifen`, `Öle`, `Balsam` und `Bodylotions` validiert.

`NW-005` ergaenzt `Bestellung` mit Kunde-Relation, Bestellkanal, Zahlungsstatus, Bestellstatus, Datum und Lieferadresse. Die Bestellwerte werden zentral validiert.

`NW-006` leitet den Bestellstatus beim Anlegen aus dem Zahlungsstatus ab: `ausstehend` bleibt `Eingegangen`, `bezahlt` wird `verbindlich`. Dadurch kann eine Bestellung nicht versehentlich ohne Zahlung als verbindlich angelegt werden. Der Status bleibt in der Bestellliste sichtbar (`NW-028`).

`NW-011` stellt die aktive Arbeitsansicht als erste Oberflaeche dar. Sie zeigt offene, nicht stornierte Bestellungen, Zahlungswarnungen, verbindliche Bestellungen und den nächsten Schritt pro Bestellung. Lager-, Chargen- und Packlistenwarnungen werden erst ergaenzt, sobald die zugehörigen Fachmodelle existieren.

`NW-032` ergaenzt `Mitarbeiter` als Stammdatenmodell mit Rolle, Zugriffsrechten und Kontaktfeldern. Mitarbeitende können angelegt und mit Name, Rolle, E-Mail, Telefonnummer und Zugriffsrechten bearbeitet werden. Rollen werden zentral gegen `Admin`, `Werkstatt-Hilfe` und `Packer` validiert. Die Zuordnung zu Chargen und Paketen folgt, sobald diese Fachmodelle umgesetzt werden.

`NW-010` nutzt die Mitarbeiterrolle als serverseitig ausgewerteten Ansichtskontext. Die Startseite rendert Verwaltungsbereiche nur, wenn die aktive Rolle die passende Berechtigung hat: Admin sieht die vorhandenen Verwaltungsbereiche, Werkstatt-Hilfe sieht nur den Chargenarbeitsbereich, Packer nur den Packlistenarbeitsbereich. Bis eine echte Authentifizierung entschieden ist, ersetzt diese Auswahl kein Login und keine Identitaetspruefung.

`NW-033`, `NW-034` und `NW-035` schliessen die rollenbezogenen V1-Sichten ab. Admin hat Zugriff auf alle vorhandenen Verwaltungs- und Arbeitsbereiche inklusive Tages-Packliste. Werkstatt-Hilfe sieht nur den Chargenarbeitsbereich. Packer sieht ausschliesslich die Tages-Packliste mit Name, Lieferadresse, Produkten, Menge, Charge, MHD und Paketstatus; Preise, Umsaetze, Zahlungsstatus und vollständige Kundendaten werden dort nicht gerendert. Diese Trennung bleibt eine serverseitige Rollenansicht und ersetzt weiterhin keine echte Authentifizierung.

`NW-040` klaert Auth und Betrieb für V1. Sobald Mitarbeitende angelegt sind, zeigt die App für die Prüfungsabgabe eine Login-Seite mit Mitarbeiter-Auswahl. Nach erfolgreicher Auswahl wird die Mitarbeiter-ID in einem HTTP-only Cookie gespeichert und die Rolle serverseitig aus der Datenbank gelesen. Es gibt in V1 bewusst kein Passwort und keinen Login-Code, damit der Dozent die lokale App ohne Geheimwissen prüfen kann. Die App läuft lokal und wird im Browser ueber `http://localhost:3000` oder im lokalen Netzwerk ueber die vom Dev-Server angezeigte Netzwerk-URL geöffnet. Externes Hosting, Deployment-Pipeline und stärkere Authentifizierung bleiben spätere Haertung.

`NW-003` ergaenzt `Charge` mit Produkt-Relation, verantwortlicher Werkstatt-Hilfe, Herstellungsdatum, MHD, produzierter Menge und Status. Chargenstatus wird zentral gegen `freigegeben` und `gesperrt` validiert. Lagerbestand und Bestandsmengen werden erst mit `NW-004` modelliert.

`NW-004` ergaenzt `Lagerbestand` je Charge und Lagerort mit voruebergehend und verbindlich reservierten Mengen. Lagerorte sind physische Orte und werden zentral gegen `Werkstatt`, `Markt-Truck` und `Zuhause` validiert. Die produzierte Gesamtmenge bleibt an der Charge; freie Mengen werden später aus Charge und Reservierungen abgeleitet.

`NW-029` ergaenzt `Bestellposition` als Verbindung zwischen Bestellung, Produkt, Charge und Menge. Beim Anlegen wird serverseitig geprueft, dass die zugewiesene Charge zum gewählten Produkt gehoert. Automatische Bestandsreservierung folgt separat in den Lagerfeatures.

`NW-008` weist Bestellpositionen serverseitig per FIFO der freigegebenen Charge mit fruehestem MHD zu, sofern genuegend verfügbare Menge vorhanden ist. Verfügbarkeit wird aus produzierter Chargenmenge minus gebuchten Lagerreservierungen berechnet.

`NW-027` bucht beim Anlegen einer Bestellposition im selben Transaktionsschritt auch den Lagerbestand: ausstehende Bestellungen erhoehen `mengeVoruebergehendReserviert`, bezahlte Bestellungen erhoehen `mengeVerbindlichReserviert`. Die Buchung erfolgt am vorhandenen Lagerort der Charge, sonst am Standardort `Werkstatt`. Verkaufsevent-Positionen reduzieren die freie Chargenmenge ueber `mengeMitgenommen`. Abo-Abwicklung und Retouren werden erst angebunden, sobald ihre Fachmodelle existieren.

`NW-007` ergaenzt manuelle Reservierungswarnungen in der aktiven Arbeitsansicht. Ausstehende B2C-Neukunden werden ab Tag 3 gewarnt und ab Tag 5 zur manuellen Stornierungspruefung markiert; Stammkunden ab Tag 7 beziehungsweise Tag 10. Es erfolgt keine automatische Stornierung.

`NW-009` ergaenzt eine Packer-spezifische Tages-Packliste für verbindliche Bestellungen mit Bestellpositionen. Die Ansicht zeigt nur Name, Lieferadresse, Produkt, Menge und zugewiesene Charge mit MHD. Preise, Zahlungsstatus und weitere Kundendaten bleiben für Packer ausgeblendet; Paketstatus folgt mit der Paketverwaltung.

`NW-030` ergaenzt `Paket` mit Bestellung-Relation, verantwortlichem Packer, Versandoption, Versandkosten, Paketstatus, Trackingnummer, Versanddatum und Zustelldatum. Paket- und Versandwerte werden zentral validiert. Die Packer-Packliste zeigt vorhandene Paketstatus, ohne Preise, Zahlungsstatus oder vollständige Kundendaten offenzulegen. Der automatische Bestellabschluss bei Zustellung bleibt Teil von `NW-016`.

`NW-016` ergaenzt die manuelle Paketstatuspflege. Wenn ein Paket beim Anlegen oder Aktualisieren den Status `Zugestellt` erhaelt, setzt die App die zugehörige Bestellung in derselben Transaktion auf `abgeschlossen`. Ein späteres Zuruecksetzen eines Paketstatus öffnet die Bestellung nicht automatisch wieder, weil dafür keine fachliche Regel definiert ist.

`NW-020` und `NW-036` ergaenzen `Verkaufsevent` und `VerkaufseventPosition`. Ein Verkaufsevent hat Datum und Ort. Positionen verbinden ein Event mit einer Charge und speichern `mengeMitgenommen` sowie `mengeVerkauft`; `mengeVerkauft` darf nicht groesser sein als `mengeMitgenommen`. Pro Event und Charge gibt es maximal eine Position. Nicht verkaufte Event-Mengen bleiben bis zu einer späteren Rueckbuchungsfunktion blockiert.

`NW-017` ergaenzt MHD-Warnungen in der aktiven Arbeitsansicht. Freie, freigegebene Chargen werden ab 56 Tagen vor MHD mit einem 20-%-Rabattvorschlag und ab 30 Tagen vor MHD mit einem 50-%-Rabattvorschlag angezeigt. Die App aendert Preise nicht automatisch; Nina muss jeden Vorschlag manuell bestätigen.

`NW-014` erweitert die Bestandszuteilung für B2B-Bestellungen. Wenn eine B2B-Bestellposition mindestens 50 Einheiten umfasst, darf die FIFO-Zuteilung nur eine Charge waehlen, bei der nach der Reservierung mindestens die am Produkt gepflegte B2C-Puffermenge frei bleibt. B2B-Bestellpositionen unter 50 Einheiten werden wie B2C behandelt.

`NW-025` ergaenzt `Bestellung.allergeneBestaetigtAm` als Timestamp für die Allergenbestätigung. Beim Anlegen einer Bestellposition mit einem Produkt, dessen `allergene`-Feld befuellt ist, muss die Bestätigung gesetzt oder bereits vorhanden sein. Eine Bestellung mit allergenbehafteten Positionen ohne Timestamp kann nicht ueber den Paketstatus `Zugestellt` auf `abgeschlossen` wechseln.

`NW-038` berechnet einen Versandkosten-Vorschlag für Pakete nach `GR-13`: B2C ab 39,00 EUR Warenwert versandkostenfrei, darunter 4,50 EUR; B2B- und Abo-Bestellungen immer versandkostenfrei. Der Vorschlag wird beim Anlegen eines Pakets als Default angezeigt, bleibt aber manuell ueberschreibbar, weil die automatische Versandkostenberechnung als separates späteres Feature (`NW-021`) gefuehrt wird.

`NW-015` ergaenzt `Retoure` als positionsbezogenes Modell mit Grund, Produktzustand, Retourenstatus und Erstattungsart. Eine Retoure kann nur für zugestellte Bestellpositionen innerhalb der fachlichen Frist angelegt werden: B2C 14 Tage, B2B und Abo 7 Tage ab Zustellung. B2B- und Abo-Retouren werden nur für `Beschaedigt` oder `Mangelhaft` akzeptiert. Die Rueckbuchung in Bestand bleibt Teil von `NW-031`.

`NW-031` ergaenzt eine einmalige Bestandsbuchung für angenommene Retouren. Ungeöffnete Ware mit mehr als 28 Tagen MHD-Restlaufzeit reduziert die verbindliche Reservierung der urspruenglichen Charge und wird damit wieder frei. Ungeöffnete Ware mit 28 Tagen oder weniger MHD-Restlaufzeit wird ebenfalls aus der verbindlichen Reservierung geloest und als `Restposten`-Buchung dokumentiert; `Restposten` ist kein Lagerort. Geöffnete, beschädigte oder mangelhafte Ware wird als ausgebucht dokumentiert und erhoeht den freien Bestand nicht.

`NW-012` aktualisiert Kunden automatisch zu Stammkunden, sobald sechs abgeschlossene Bestellungen innerhalb von 365 Tagen vorliegen. Die Pruefung läuft beim Bestellabschluss ueber Paket-Zustellung und wird beim Laden der Arbeitsansicht für bestehende Daten nachgezogen. B2C-Positionswerte beruecksichtigen für Stammkunden einen 10-%-Rabatt bei berechneten Warenwerten. Die Arbeitsansicht zeigt Inaktivitaetswarnungen nach acht Monaten ohne abgeschlossene Bestellung sowie Vorabinfo-Aufgaben für neue freigegebene Chargen innerhalb der ersten 24 Stunden.

`NW-013` ergaenzt die Produktknappheit-Priorisierung in der Arbeitsansicht. Für knappe B2C-Produkte werden offene Bestellpositionen priorisiert: zuerst Stammkunden, danach B2C-Neukunden, innerhalb der Gruppe nach `Bestellung.datum` als Anfragezeitpunkt und anschliessend Bestell-ID. Bereits reservierte Mengen werden in V1 nicht automatisch umverteilt; Nina erhaelt eine priorisierte Pruefliste.

`NW-018` ergaenzt `AboBox` als kundenbezogenes Modell mit Lieferadresse, Status, Startdatum, Pausiert-seit und Kündigungsdatum. Statuswerte werden zentral gegen `aktiv`, `pausiert` und `gekuendigt` validiert. Die globale Monatsauswahl bleibt an `Produkt.inAboBoxEnthalten`; die Arbeitsansicht zeigt die aktuelle Auswahl als `x/4`, ohne die monatliche Abo-Abwicklung schon auszufuehren.

`NW-019` ergaenzt `AboAbwicklung` als Monatslauf mit eindeutiger Kombination aus Jahr und Monat. Die Abwicklung wird in V1 manuell per Button ausgelöst, nicht automatisch per Cronjob. Voraussetzung sind mindestens eine aktive Abo-Box und genau vier mit `In Abo-Box enthalten` markierte Produkte. Pro aktiver Abo-Box wird eine `Abo`-Bestellung mit Status `verbindlich` und Zahlungsstatus `bezahlt` angelegt; je Abo-Produkt entsteht eine Bestellposition mit Menge 1 per FIFO-Zuteilung. Die Lagerreservierung wird im selben Transaktionsschritt verbindlich gebucht. Wenn für eine Position keine freigegebene FIFO-Charge mit freier Menge vorhanden ist, wird der gesamte Monatslauf nicht angelegt.

`NW-037` ergaenzt die Abo-Pausierungsregel. `AboBox.pausiertVon` und `AboBox.pausiertBis` speichern die konkreten Pausenmonate als Monatsanker. Der Zeitraum darf maximal zwei aufeinanderfolgende Monate umfassen und muss bis einschliesslich 15. des Vormonats erfasst werden. Die Abo-Abwicklung ueberspringt aktive Abo-Boxen, wenn der Abwicklungsmonat im Pausenfenster liegt. Nach Ablauf der Pause wird keine automatische Statusaenderung vorgenommen; die Arbeitsansicht zeigt Nina eine Warnung zur Pruefung.

## Offene technische Entscheidungen

- Versandlabel-/Tracking-Anbieter
- Zahlungsstatus: manuelle Pflege oder Zahlungsanbieter-Integration
- Audit-Log für Bestands- und Statusaenderungen

## Konventionen

- Fachliche Statuswerte zentral definieren, nicht als verstreute Strings.
- Geldwerte als Decimal speichern, nicht als Floating-Point.
- Datumslogik explizit behandeln; Fristen beziehen sich auf lokale Geschaeftslogik in Europe/Berlin.
- Jede Bestandsaenderung muss auf eine fachliche Ursache zurueckfuehrbar sein: Bestellung, Reservierung, Retoure, Abo-Abwicklung oder Verkaufsevent.
