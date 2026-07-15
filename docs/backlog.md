# backlog.md - Nina Wolffs Shop- und Kundenmanagement-App

_Stabile Feature-IDs. Nicht umnummerieren. Killed-IDs bleiben killed._

---

## Konvention

- **ID-Schema:** `NW-001`, `NW-002`, ...
- **Prefix:** `NW` fuer Nina Wolff.
- **Nummerierung:** fortlaufend, nie wiederverwenden.
- **Status:** `hypo`, `validated`, `in-progress`, `done`, `killed`.
- **Phase:** Sortiert nach fachlichem Kern zuerst.
- **Quelle:** `docs/spec.md`, inklusive V1-Scope, Entitaeten, Beziehungen, Geschaeftsregeln und offenen Klaerungen.

## Phasen

| Phase | Bedeutung |
|---|---|
| P1 - Kern | Minimales Arbeitsprodukt: Kunden, Produkte, Bestellungen, Status, Rollen und aktive Arbeitsansicht. |
| P2 - Lager & Fulfillment | Chargen, Lager, Reservierungen, FIFO, Packlisten, Pakete, Versand und Verkaufsevents. |
| P3 - Regeln & Automatisierung | Stammkunden, Knappheit, B2B-Puffer, Retouren, MHD-Warnungen, Abo-Abwicklung und automatische Statuslogik. |
| P4 - Spaeter | Explizit nicht V1 oder fachlich nachgelagert. |
| P0 - Klaerung | Offene Grundsatzentscheidungen, die vor oder waehrend der Umsetzung geklaert werden muessen. |

## P1 - Kern

| ID | Name | Phase | Status | Quelle | Notiz |
|---|---|---|---|---|---|
| NW-001 | Kundenverwaltung | P1 - Kern | done | docs/spec.md Entitaet Kunde | Kunden mit Typ, Kontakt, Adresse, Zahlungsziel, Stammkundenstatus, Vorlieben und Hauttyp. |
| NW-002 | Produktverwaltung | P1 - Kern | done | docs/spec.md Entitaet Produkt | Produkte mit Kategorie, Vegan-Flag, Inhaltsstoffen, Preisen, B2C-Puffer, Standard-MHD und Abo-Box-Markierung. |
| NW-005 | Bestellverwaltung kanaluebergreifend | P1 - Kern | done | docs/spec.md V1-Scope, Entitaet Bestellung | Zentrale Verwaltung aller Bestellungen aus verschiedenen Kanaelen. |
| NW-026 | Kundenzuordnung fuer Bestellungen | P1 - Kern | done | docs/spec.md Beziehung 1 | Jede Bestellung ist genau einem Kunden zugeordnet; Kunde hat 1:n Bestellungen. |
| NW-029 | Bestellpositionen | P1 - Kern | done | docs/spec.md Entitaet Bestellposition, Beziehungen 2-5 | Bestellpositionen verbinden Bestellung, Produkt, Charge und Menge. |
| NW-006 | Zahlungsstatus und Verbindlichkeit | P1 - Kern | done | docs/spec.md GR-01, W-1 | DM-Zusage reserviert nur; verbindlich erst nach Zahlungseingang. |
| NW-028 | Klarer Bestellstatus | P1 - Kern | done | docs/spec.md V1-Scope | Bestellung braucht sichtbaren, eindeutigen Status fuer aktive Bearbeitung. |
| NW-011 | Aktive Arbeitsansicht | P1 - Kern | done | docs/spec.md V1-Scope | Ausschliesslich offene Aufgaben, relevante Warnungen und naechste Schritte anzeigen. |
| NW-010 | Rollen- und Berechtigungssystem | P1 - Kern | done | docs/spec.md V1-Scope, GR-09 | Serverseitige Rollenansicht trennt Admin, Werkstatt-Hilfe und Packer fuer die vorhandenen Arbeitsbereiche. |
| NW-032 | Mitarbeiterverwaltung | P1 - Kern | done | docs/spec.md Entitaet Mitarbeiter | Mitarbeitende mit Rolle, Rechten und Kontakt. Zuordnung zu Chargen/Paketen folgt mit den jeweiligen Fachmodellen. |
| NW-033 | Admin-Vollzugriff | P1 - Kern | done | docs/spec.md Zielgruppe, GR-09 | Nina sieht und bearbeitet alle vorhandenen Bereiche inklusive Tages-Packliste. |
| NW-034 | Werkstatt-Hilfe-Zugriff | P1 - Kern | done | docs/spec.md Zielgruppe, GR-09 | Werkstatt-Hilfe sieht ausschliesslich den Chargenarbeitsbereich und kann Chargen anlegen. |
| NW-035 | Packer-Zugriff mit Datensparsamkeit | P1 - Kern | done | docs/spec.md Zielgruppe, GR-09 | Packer sieht nur die Tages-Packliste mit Name, Lieferadresse, Produkten, Menge, Charge, MHD und Paketstatus; keine Preise, Umsaetze, Zahlungsstatus oder vollstaendige Kundendaten. |

## P2 - Lager & Fulfillment

| ID | Name | Phase | Status | Quelle | Notiz |
|---|---|---|---|---|---|
| NW-003 | Chargenverwaltung | P2 - Lager & Fulfillment | done | docs/spec.md Entitaet Charge | Chargen mit Produkt, Werkstatt-Hilfe, Herstellungsdatum, MHD, Menge und Status. |
| NW-004 | Lagerbestand mit Reservierungen | P2 - Lager & Fulfillment | done | docs/spec.md Entitaet Lagerbestand | Lagerorte, voruebergehend reservierte und verbindlich reservierte Mengen je Charge. |
| NW-027 | Synchroner Lagerabzug ueber alle Kanaele | P2 - Lager & Fulfillment | done | docs/spec.md V1-Scope | Bestellpositionen buchen Reservierungen direkt in den Lagerbestand; Verkaufsevent-Mengen reduzieren die freie Chargenmenge; Abo-Abwicklung und Retouren folgen mit den jeweiligen Modellen. |
| NW-007 | Manuelle Reservierungswarnungen | P2 - Lager & Fulfillment | done | docs/spec.md GR-02, W-2 | Warnfristen fuer Neukunden und Stammkunden in der Arbeitsansicht, keine automatische Stornierung. |
| NW-008 | FIFO-Bestandszuteilung | P2 - Lager & Fulfillment | done | docs/spec.md GR-03 | Automatischer Vorschlag und Zuweisung der freigegebenen Charge mit fruehestem MHD bei Bestellpositionen. |
| NW-009 | Packlisten fuer Packer | P2 - Lager & Fulfillment | done | docs/spec.md V1-Scope, GR-03, GR-09 | Tages-Packliste fuer verbindliche Bestellungen mit Name, Lieferadresse, Produkt, Menge und zugewiesener Charge. |
| NW-030 | Paketverwaltung | P2 - Lager & Fulfillment | done | docs/spec.md Entitaet Paket, Beziehung 7, 13 | Paket mit Bestellung, Packer, Versandoption, Versandkosten, Status, Tracking und Zustellung. |
| NW-016 | Paket- und Trackingstatus | P2 - Lager & Fulfillment | done | docs/spec.md GR-11 | Wenn ein Paket `Zugestellt` ist, wird die Bestellung automatisch auf `abgeschlossen` gesetzt. |
| NW-020 | Verkaufsevent-Verwaltung | P2 - Lager & Fulfillment | done | docs/spec.md Entitaeten Verkaufsevent, Verkaufsevent-Position | Verkaufsevents mit Datum und Ort sowie mitgenommenen und verkauften Chargenmengen erfassen. |
| NW-036 | Verkaufsevent-zu-Charge-Beziehung | P2 - Lager & Fulfillment | done | docs/spec.md Beziehungen 10-11 | Verkaufsevents werden ueber Positionen n:m mit Chargen verbunden. |

## P3 - Regeln & Automatisierung

| ID | Name | Phase | Status | Quelle | Notiz |
|---|---|---|---|---|---|
| NW-012 | Stammkundenautomatik | P3 - Regeln & Automatisierung | done | docs/spec.md GR-04 | Sechs erfolgreiche Bestellungen in 365 Tagen, 10 % Rabatt, Vorab-Benachrichtigung, Inaktivitaetswarnung. |
| NW-013 | Produktknappheit-Priorisierung | P3 - Regeln & Automatisierung | done | docs/spec.md GR-05, W-3 | Die Arbeitsansicht zeigt knappe B2C-Produkte mit priorisierter Reihenfolge: zuerst Stammkunden, danach B2C-Neukunden, innerhalb der Gruppe nach Bestelldatum als Anfragezeitpunkt. |
| NW-014 | B2B-Sonderkonditionen und B2C-Puffer | P3 - Regeln & Automatisierung | done | docs/spec.md GR-06 | B2B-Bestellpositionen ab 50 Einheiten duerfen den B2C-Puffer der Charge nicht aufbrauchen; kleinere B2B-Mengen laufen wie B2C. |
| NW-015 | Retourenverwaltung | P3 - Regeln & Automatisierung | done | docs/spec.md Entitaet Retoure, GR-07 | Fristen, Produktzustand, Status, Erstattungsart und Reklamationslogik. |
| NW-031 | Retouren-Rueckbuchung in Bestand | P3 - Regeln & Automatisierung | done | docs/spec.md GR-08 | Ungeoeffnete Ware je nach MHD zurueckbuchen oder als Restposten fuehren; beschaedigte Ware ausbuchen. |
| NW-017 | MHD-Warnungen und Restposten-Vorschlaege | P3 - Regeln & Automatisierung | done | docs/spec.md GR-12 | Aktive Arbeitsansicht zeigt freie freigegebene Chargen 8 Wochen vor MHD mit 20 % und 30 Tage vor MHD mit 50 % Rabattvorschlag; keine automatische Preisaenderung. |
| NW-018 | Abo-Box-Verwaltung | P3 - Regeln & Automatisierung | done | docs/spec.md Entitaet Abo-Box, GR-16 | Abo-Boxen mit Kunde, Lieferadresse, Status, Startdatum, Pausiert-seit und Kuendigungsdatum. Inhalt ist die monatliche globale Auswahl von genau vier mit `In Abo-Box enthalten` markierten Produkten. |
| NW-019 | Monatliche Abo-Abwicklung | P3 - Regeln & Automatisierung | done | docs/spec.md GR-14, GR-16 | Manuell ausgeloeste Monatsabwicklung erzeugt Abo-Bestellungen fuer aktive Abo-Boxen, legt je vier globale Abo-Produkte per FIFO als Positionen an und bucht verbindliche Lagerreservierungen. |
| NW-037 | Abo-Pausierungsregel | P3 - Regeln & Automatisierung | done | docs/spec.md GR-15 | Abo-Pausen gelten fuer konkrete Kalendermonate, maximal zwei aufeinanderfolgende Monate; Erfassung bis zum 15. des Vormonats. Pausierte Abo-Boxen werden in der Monatsabwicklung uebersprungen, nach Ablauf erscheint eine Warnung fuer Nina. |
| NW-038 | Versandkostenregel | P3 - Regeln & Automatisierung | done | docs/spec.md GR-13 | B2C ab 39 EUR frei, darunter 4,50 EUR; B2B und Abo immer frei. |
| NW-025 | Allergen-Workflow | P3 - Regeln & Automatisierung | done | docs/spec.md GR-10 | In V1 verpflichtend: Bei allergenbehafteten Produkten muss vor Bestellabschluss eine Allergenbestaetigung mit Timestamp vorliegen. |

## P4 - Spaeter

| ID | Name | Phase | Status | Quelle | Notiz |
|---|---|---|---|---|---|
| NW-021 | Automatische Versandkostenberechnung | P4 - Spaeter | validated | docs/spec.md Kann warten, GR-13 | Fachregel ist definiert, automatische Berechnung ist laut Priorisierung nicht V1. |
| NW-022 | Marketing-Aktionen | P4 - Spaeter | hypo | docs/spec.md Kann warten | Explizit nicht V1. |
| NW-023 | Rabattcodes | P4 - Spaeter | hypo | docs/spec.md Kann warten | Explizit nicht V1. |
| NW-024 | Statistiken und Auswertungen | P4 - Spaeter | hypo | docs/spec.md Kann warten | Bestseller etc., explizit nicht V1. |

## P0 - Klaerung

| ID | Name | Phase | Status | Quelle | Notiz |
|---|---|---|---|---|---|
| NW-039 | Enum-Werte definieren | P0 - Klaerung | done | docs/spec.md Offene Klaerungen | Alle aktuell benoetigten Enum-Werte sind geklaert: Kundentyp, Hauttyp, Produktkategorie, Bestellkanal, Zahlungsstatus, Bestellstatus, Rolle, Chargenstatus, Lagerort, Paketstatus, Versandoption, Abo-Box-Status, Retourenstatus, Produktzustand und Erstattungsart. |
| NW-040 | Auth, Hosting und Deployment klaeren | P0 - Klaerung | done | docs/spec.md Offene Klaerungen | V1 nutzt fuer die Pruefungsabgabe einen einfachen Demo-Login mit Mitarbeiter/Rolle ohne Code. Die App laeuft lokal und wird im Browser ueber `localhost` oder eine lokale Netzwerk-URL geoeffnet; echtes externes Hosting und starke Auth bleiben spaeter. |
| NW-041 | Versandlabel- und Tracking-Integration klaeren | P0 - Klaerung | done | docs/spec.md Offene Klaerungen | V1 arbeitet manuell: Versandlabel ausserhalb der App, Trackingnummer und Versand-/Zustelldaten in der App pflegen. |
| NW-042 | Allergen-Scope fuer V1 klaeren | P0 - Klaerung | done | docs/spec.md Offene Klaerungen | V1 bekommt einen verpflichtenden Allergen-Bestaetigungsworkflow bei allergenbehafteten Produkten. |

## Workflow

- Neues Feature bekommt die naechste freie `NW-###` ID.
- Bestehende IDs bleiben stabil, auch wenn die Phase spaeter geaendert wird.
- Commit-Message bei Umsetzung: `feat: NW-### Kurzbeschreibung`.
- Bei Status `killed` Begruendung in `docs/decisions.md` dokumentieren.
- Backlog ist operativ; strategische Fachlogik bleibt in `docs/spec.md`.
