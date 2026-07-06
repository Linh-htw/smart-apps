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
| NW-029 | Bestellpositionen | P1 - Kern | validated | docs/spec.md Entitaet Bestellposition, Beziehungen 2-5 | Wartet auf Chargenverwaltung, weil Bestellposition laut Spec Produkt, Charge und Menge enthaelt. |
| NW-006 | Zahlungsstatus und Verbindlichkeit | P1 - Kern | done | docs/spec.md GR-01, W-1 | DM-Zusage reserviert nur; verbindlich erst nach Zahlungseingang. |
| NW-028 | Klarer Bestellstatus | P1 - Kern | done | docs/spec.md V1-Scope | Bestellung braucht sichtbaren, eindeutigen Status fuer aktive Bearbeitung. |
| NW-011 | Aktive Arbeitsansicht | P1 - Kern | done | docs/spec.md V1-Scope | Ausschliesslich offene Aufgaben, relevante Warnungen und naechste Schritte anzeigen. |
| NW-010 | Rollen- und Berechtigungssystem | P1 - Kern | done | docs/spec.md V1-Scope, GR-09 | Serverseitige Rollenansicht trennt Admin, Werkstatt-Hilfe und Packer fuer die vorhandenen Arbeitsbereiche. |
| NW-032 | Mitarbeiterverwaltung | P1 - Kern | done | docs/spec.md Entitaet Mitarbeiter | Mitarbeitende mit Rolle, Rechten und Kontakt. Zuordnung zu Chargen/Paketen folgt mit den jeweiligen Fachmodellen. |
| NW-033 | Admin-Vollzugriff | P1 - Kern | validated | docs/spec.md Zielgruppe, GR-09 | Nina sieht und bearbeitet alle Bereiche. |
| NW-034 | Werkstatt-Hilfe-Zugriff | P1 - Kern | validated | docs/spec.md Zielgruppe, GR-09 | Werkstatt-Hilfe darf ausschliesslich Chargen anlegen. |
| NW-035 | Packer-Zugriff mit Datensparsamkeit | P1 - Kern | validated | docs/spec.md Zielgruppe, GR-09 | Packer sieht nur Packliste, Name, Lieferadresse, Produkte, Charge und Paketstatus. |

## P2 - Lager & Fulfillment

| ID | Name | Phase | Status | Quelle | Notiz |
|---|---|---|---|---|---|
| NW-003 | Chargenverwaltung | P2 - Lager & Fulfillment | done | docs/spec.md Entitaet Charge | Chargen mit Produkt, Werkstatt-Hilfe, Herstellungsdatum, MHD, Menge und Status. |
| NW-004 | Lagerbestand mit Reservierungen | P2 - Lager & Fulfillment | done | docs/spec.md Entitaet Lagerbestand | Lagerorte, voruebergehend reservierte und verbindlich reservierte Mengen je Charge. |
| NW-027 | Synchroner Lagerabzug ueber alle Kanaele | P2 - Lager & Fulfillment | validated | docs/spec.md V1-Scope | Bestand muss bei Bestellungen, Events, Abo-Abwicklung und Retouren konsistent bleiben. |
| NW-007 | Manuelle Reservierungswarnungen | P2 - Lager & Fulfillment | validated | docs/spec.md GR-02, W-2 | Warnfristen fuer Neukunden und Stammkunden, keine automatische Stornierung. |
| NW-008 | FIFO-Bestandszuteilung | P2 - Lager & Fulfillment | validated | docs/spec.md GR-03 | Automatischer Vorschlag der Charge mit fruehestem MHD fuer Packen und Zuteilung. |
| NW-009 | Packlisten fuer Packer | P2 - Lager & Fulfillment | validated | docs/spec.md V1-Scope, GR-03, GR-09 | Tages-Packliste mit zugewiesener Charge und minimal noetigen Kundendaten. |
| NW-030 | Paketverwaltung | P2 - Lager & Fulfillment | validated | docs/spec.md Entitaet Paket, Beziehung 7, 13 | Paket mit Bestellung, Packer, Versandoption, Versandkosten, Status, Tracking und Zustellung. |
| NW-016 | Paket- und Trackingstatus | P2 - Lager & Fulfillment | validated | docs/spec.md GR-11 | Bestellung automatisch abschliessen, wenn Tracking Zustellung bestaetigt. |
| NW-020 | Verkaufsevent-Verwaltung | P2 - Lager & Fulfillment | validated | docs/spec.md Entitaeten Verkaufsevent, Verkaufsevent-Position | Mitgenommene und verkaufte Chargenmengen erfassen. |
| NW-036 | Verkaufsevent-zu-Charge-Beziehung | P2 - Lager & Fulfillment | validated | docs/spec.md Beziehungen 10-11 | Verkaufsevents werden ueber Positionen n:m mit Chargen verbunden. |

## P3 - Regeln & Automatisierung

| ID | Name | Phase | Status | Quelle | Notiz |
|---|---|---|---|---|---|
| NW-012 | Stammkundenautomatik | P3 - Regeln & Automatisierung | validated | docs/spec.md GR-04 | Sechs erfolgreiche Bestellungen in 365 Tagen, 10 % Rabatt, Vorab-Benachrichtigung, Inaktivitaetswarnung. |
| NW-013 | Produktknappheit-Priorisierung | P3 - Regeln & Automatisierung | validated | docs/spec.md GR-05, W-3 | Stammkunden vor Neukunden, innerhalb der Gruppe nach Anfragezeitpunkt. |
| NW-014 | B2B-Sonderkonditionen und B2C-Puffer | P3 - Regeln & Automatisierung | validated | docs/spec.md GR-06 | Mindestmenge 50, Zahlungsziel bis 30 Tage, B2C-Puffer schuetzen. |
| NW-015 | Retourenverwaltung | P3 - Regeln & Automatisierung | validated | docs/spec.md Entitaet Retoure, GR-07 | Fristen, Produktzustand, Status, Erstattungsart und Reklamationslogik. |
| NW-031 | Retouren-Rueckbuchung in Bestand | P3 - Regeln & Automatisierung | validated | docs/spec.md GR-08 | Ungeoeffnete Ware je nach MHD zurueckbuchen oder als Restposten fuehren; beschaedigte Ware ausbuchen. |
| NW-017 | MHD-Warnungen und Restposten-Vorschlaege | P3 - Regeln & Automatisierung | validated | docs/spec.md GR-12 | 8 Wochen 20 %, 30 Tage 50 %, Preis erst nach Ninas Bestaetigung. |
| NW-018 | Abo-Box-Verwaltung | P3 - Regeln & Automatisierung | validated | docs/spec.md Entitaet Abo-Box | Status, Lieferadresse, Start, Pausierung und Kuendigung. |
| NW-019 | Monatliche Abo-Abwicklung | P3 - Regeln & Automatisierung | validated | docs/spec.md GR-14 | Sammelabwicklung am 15. mit Versandlabeln, konsolidierter Packliste und Lagerabbuchung. |
| NW-037 | Abo-Pausierungsregel | P3 - Regeln & Automatisierung | validated | docs/spec.md GR-15 | Maximal zwei Monate pausieren; Anmeldung bis zum 15. des Vormonats. |
| NW-038 | Versandkostenregel | P3 - Regeln & Automatisierung | validated | docs/spec.md GR-13 | B2C ab 39 EUR frei, darunter 4,50 EUR; B2B und Abo immer frei. |

## P4 - Spaeter

| ID | Name | Phase | Status | Quelle | Notiz |
|---|---|---|---|---|---|
| NW-021 | Automatische Versandkostenberechnung | P4 - Spaeter | validated | docs/spec.md Kann warten, GR-13 | Fachregel ist definiert, automatische Berechnung ist laut Priorisierung nicht V1. |
| NW-022 | Marketing-Aktionen | P4 - Spaeter | hypo | docs/spec.md Kann warten | Explizit nicht V1. |
| NW-023 | Rabattcodes | P4 - Spaeter | hypo | docs/spec.md Kann warten | Explizit nicht V1. |
| NW-024 | Statistiken und Auswertungen | P4 - Spaeter | hypo | docs/spec.md Kann warten | Bestseller etc., explizit nicht V1. |
| NW-025 | Allergen-Workflow | P4 - Spaeter | validated | docs/spec.md Kann warten, GR-10 | Fachregel existiert, aber Allergene koennen laut Priorisierung warten. |

## P0 - Klaerung

| ID | Name | Phase | Status | Quelle | Notiz |
|---|---|---|---|---|---|
| NW-039 | Enum-Werte definieren | P0 - Klaerung | in-progress | docs/spec.md Offene Klaerungen | Kundentyp, Hauttyp, Produktkategorie, Bestellkanal, Zahlungsstatus, Bestellstatus, Rolle, Chargenstatus und Lagerort sind geklaert; Paketstatus, Retourenstatus, Produktzustand und Erstattungsart bleiben offen. |
| NW-040 | Tech-Stack entscheiden | P0 - Klaerung | in-progress | docs/spec.md Offene Klaerungen | Framework-Setup erledigt: Next.js, TypeScript, Prisma, SQLite. Auth, Hosting und Deployment bleiben offen. |
| NW-041 | Versandlabel- und Tracking-Integration klaeren | P0 - Klaerung | hypo | docs/spec.md Offene Klaerungen | Manuell, halbautomatisch oder Anbieter-Integration fuer V1 entscheiden. |
| NW-042 | Allergen-Scope fuer V1 klaeren | P0 - Klaerung | hypo | docs/spec.md Offene Klaerungen | Datenfeld sichtbar, aber Workflow spaeter, oder komplett spaeter. |

## Workflow

- Neues Feature bekommt die naechste freie `NW-###` ID.
- Bestehende IDs bleiben stabil, auch wenn die Phase spaeter geaendert wird.
- Commit-Message bei Umsetzung: `feat: NW-### Kurzbeschreibung`.
- Bei Status `killed` Begruendung in `docs/decisions.md` dokumentieren.
- Backlog ist operativ; strategische Fachlogik bleibt in `docs/spec.md`.
