# backlog.md - Nina Wolffs Shop- und Kundenmanagement-App

_Stabile Feature-IDs. Nicht umnummerieren. Killed-IDs bleiben killed._

---

## Konvention

- **ID-Schema:** `NW-001`, `NW-002`, ...
- **Prefix:** `NW` fuer Nina Wolff.
- **Nummerierung:** fortlaufend, nie wiederverwenden.
- **Status:** `hypo`, `validated`, `in-progress`, `done`, `killed`.
- **Phase:** Verweist auf die Phasen aus `docs/spec.md` bzw. die V1-/Spaeter-Priorisierung.

## Features

| ID | Name | Phase | Status | Quelle | Notiz |
|---|---|---|---|---|---|
| NW-001 | Kundenverwaltung | V1 | validated | docs/spec.md | Kunden mit Typ, Kontakt, Adresse, Stammkundenstatus, Vorlieben und Hauttyp. |
| NW-002 | Produktverwaltung | V1 | validated | docs/spec.md | Produkte mit Preisen, Kategorien, Inhaltsstoffen, Allergenen, B2C-Puffer und Abo-Box-Markierung. |
| NW-003 | Chargenverwaltung | V1 | validated | docs/spec.md | Chargen mit Produkt, Mitarbeiter, Herstellungsdatum, MHD, Menge und Status. |
| NW-004 | Lagerbestand mit Reservierungen | V1 | validated | docs/spec.md | Lagerorte, voruebergehend reservierte und verbindlich reservierte Mengen. |
| NW-005 | Bestellverwaltung kanaluebergreifend | V1 | validated | docs/spec.md | Zentrale Verwaltung aller Bestellungen aus verschiedenen Kanaelen. |
| NW-006 | Zahlungsstatus und Verbindlichkeit | V1 | validated | docs/spec.md | DM-Zusage reserviert nur; verbindlich erst nach Zahlungseingang. |
| NW-007 | Manuelle Reservierungswarnungen | V1 | validated | docs/spec.md | Warnfristen fuer Neukunden und Stammkunden, keine automatische Stornierung. |
| NW-008 | FIFO-Bestandszuteilung | V1 | validated | docs/spec.md | Automatischer Vorschlag der Charge mit fruehestem MHD. |
| NW-009 | Packlisten fuer Packer | V1 | validated | docs/spec.md | Packer sieht Tagesliste mit minimal noetigen Daten und zugewiesener Charge. |
| NW-010 | Rollen- und Berechtigungssystem | V1 | validated | docs/spec.md | Admin, Werkstatt-Hilfe, Packer strikt trennen. |
| NW-011 | Aktive Arbeitsansicht | V1 | validated | docs/spec.md | Ausschliesslich offene Aufgaben und relevante Warnungen. |
| NW-012 | Stammkundenautomatik | V1 | validated | docs/spec.md | Sechs erfolgreiche Bestellungen in 365 Tagen, Rabatt, Vorab-Benachrichtigung, Inaktivitaetswarnung. |
| NW-013 | Produktknappheit-Priorisierung | V1 | validated | docs/spec.md | Stammkunden vor Neukunden, innerhalb der Gruppe nach Anfragezeitpunkt. |
| NW-014 | B2B-Sonderkonditionen und B2C-Puffer | V1 | validated | docs/spec.md | Mindestmenge 50, Zahlungsziel bis 30 Tage, B2C-Puffer schuetzen. |
| NW-015 | Retourenverwaltung | V1 | validated | docs/spec.md | Fristen, Produktzustand, Status, Erstattungsart und Rueckbuchungslogik. |
| NW-016 | Paket- und Trackingstatus | V1 | validated | docs/spec.md | Bestellung automatisch abschliessen, wenn Tracking Zustellung bestaetigt. |
| NW-017 | MHD-Warnungen und Restposten-Vorschlaege | V1 | validated | docs/spec.md | 8 Wochen 20 %, 30 Tage 50 %, Preis erst nach Ninas Bestaetigung. |
| NW-018 | Abo-Box-Verwaltung | V1 | validated | docs/spec.md | Status, Lieferadresse, Pausierung, Kuendigung. |
| NW-019 | Monatliche Abo-Abwicklung | V1 | validated | docs/spec.md | Sammelabwicklung am 15. mit Packliste, Labeln und Lagerabbuchung. |
| NW-020 | Verkaufsevent-Verwaltung | V1 | validated | docs/spec.md | Mitgenommene und verkaufte Chargenmengen erfassen. |
| NW-021 | Versandkostenberechnung | Spaeter | validated | docs/spec.md | Laut Spec kann automatische Berechnung warten, Regel ist fachlich definiert. |
| NW-022 | Marketing-Aktionen | Spaeter | hypo | docs/spec.md | Explizit nicht V1. |
| NW-023 | Rabattcodes | Spaeter | hypo | docs/spec.md | Explizit nicht V1. |
| NW-024 | Statistiken und Auswertungen | Spaeter | hypo | docs/spec.md | Bestseller etc., explizit nicht V1. |
| NW-025 | Allergen-Workflow | Spaeter | validated | docs/spec.md | Fachregel existiert, aber Allergene koennen laut Priorisierung warten. |

## Workflow

- Neues Feature bekommt die naechste freie `NW-###` ID.
- Commit-Message bei Umsetzung: `feat: NW-### Kurzbeschreibung`.
- Bei Status `killed` Begruendung in `docs/decisions.md` dokumentieren.
- Backlog ist operativ; strategische Fachlogik bleibt in `docs/spec.md`.
