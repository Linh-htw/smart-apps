# architecture.md - Nina Wolffs Shop- und Kundenmanagement-App

_Technische Wahrheit des Projekts. Aktualisieren, sobald Stack, Datenmodell, Module oder Konventionen entschieden werden._

---

## Status

Noch kein Code-Stack festgelegt. Diese Datei dokumentiert daher zunaechst fachliche Architekturannahmen aus `docs/spec.md` und offene technische Entscheidungen.

## Empfohlene Zielarchitektur

| Bereich | Empfehlung | Begruendung |
|---|---|---|
| App-Typ | Web-App mit rollenbasierter Admin-/Mitarbeiteroberflaeche | Nina und Mitarbeitende brauchen zentrale, geraeteunabhaengige Arbeitsansichten. |
| Datenbank | Relationale Datenbank | Die Spec enthaelt klare Entitaeten, Beziehungen, Status und Transaktionen. |
| Backend | Server-seitige Validierung und Rechtepruefung | Rollen, Bestand, Reservierungen und Zahlungen duerfen nicht nur im Frontend geprueft werden. |
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

Die Entitaeten und Beziehungen stehen in `docs/spec.md`. Bei Umsetzung sollten technische Tabellennamen und Enum-Werte hier ergaenzt werden, sobald der Stack feststeht.

## Offene technische Entscheidungen

- Framework und Sprache
- Datenbank
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
