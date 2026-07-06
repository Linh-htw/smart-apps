# Spec - Nina Wolffs Shop- und Kundenmanagement-App

_Diese Datei ersetzt in diesem Projekt das sonst uebliche `docs/prd.md` aus Modus Operandi. Sie ist die fachliche Single Source of Truth._

_Grundlage: `Spec.md` im Repo-Root._

---

## 1. Produktkontext

Nina Wolff braucht eine interne Shop- und Kundenmanagement-App, die Bestellungen aus verschiedenen Kanaelen, Kunden, Produkte, Chargen, Lagerbestand, Packlisten, Retouren, Abo-Boxen und Mitarbeitenden-Zugriffe zusammenfuehrt.

Der Kernnutzen liegt in einer aktiven Arbeitsansicht: offene Aufgaben, Zahlungsstatus, Bestellstatus, Lagerverfuegbarkeit, Packlisten und Warnungen sollen eindeutig sichtbar sein.

## 2. Zielgruppe

- **Admin:** Nina, mit Vollzugriff auf Kunden, Produkte, Preise, Lager, Bestellungen, Retouren, Abo-Boxen und Auswertungen.
- **Werkstatt-Hilfe:** Legt ausschliesslich Chargen an.
- **Packer:** Sieht nur Tages-Packlisten mit Name, Lieferadresse, zu packenden Produkten und zugewiesener Charge. Kein Zugriff auf Preise, Umsaetze oder vollstaendige Kundendaten.

## 3. V1-Scope

### Muss in V1
- Zentrale Verwaltung aller Bestellungen aus verschiedenen Kanaelen
- Zuordnung von Bestellungen zu Kunden
- Lagerverwaltung mit Chargen- und MHD-Logik in Echtzeit
- Synchroner Lagerabzug ueber alle Verkaufskanaele hinweg
- Klar sichtbarer Zahlungsstatus
- Klarer Status einer Bestellung
- Packlisten fuer Mitarbeiter
- Rollen- und Berechtigungssystem
- Aktive Arbeitsansicht mit ausschliesslich offenen Aufgaben
- Verpflichtender Allergen-Bestaetigungsworkflow bei allergenbehafteten Produkten

### Kann warten
- Marketing-Aktionen
- Rabattcodes
- Automatische Versandkosten-Berechnung
- Statistiken und Auswertungen, z. B. Bestseller

## 4. Entitaeten

### Kunde

| Attribut | Datentyp |
|---|---|
| Kunde-ID | Integer |
| Typ | Enum |
| Name | String |
| Firmenname | String |
| USt-ID | String |
| E-Mail | String |
| Instagram-Handle | String |
| Adresse | String |
| Zahlungsziel | Integer |
| Stammkunde | Boolean |
| Vorlieben | Freitext |
| Hauttyp | Enum |

### Produkt

| Attribut | Datentyp |
|---|---|
| Produkt-ID | Integer |
| Name | String |
| Kategorie | Enum |
| Vegan | Boolean |
| Inhaltsstoffe | Freitext |
| Allergene | String |
| Preis B2C | Decimal |
| Preis B2B | Decimal |
| B2C-Puffermenge | Decimal |
| Standard-MHD-Dauer (Monate) | Integer |
| In Abo-Box enthalten | Boolean |

### Charge

| Attribut | Datentyp |
|---|---|
| Charge-ID | Integer |
| Produkt-ID | Integer |
| Mitarbeiter-ID | Integer |
| Herstellungsdatum | Date |
| MHD | Date |
| Produzierte Menge | Integer |
| Status | Enum |

### Lagerbestand

| Attribut | Datentyp |
|---|---|
| Lagerbestand-ID | Integer |
| Charge-ID | Integer |
| Lagerort | Enum |
| Menge voruebergehend reserviert | Integer |
| Menge verbindlich reserviert | Integer |

### Abo-Box

| Attribut | Datentyp |
|---|---|
| Abo-Box-ID | Integer |
| Kunde-ID | Integer |
| Lieferadresse | String |
| Status | Enum |
| Startdatum | Date |
| Pausiert seit | Date |
| Kuendigungsdatum | Date |

### Verkaufsevent

| Attribut | Datentyp |
|---|---|
| Verkaufsevent-ID | Integer |
| Datum | Date |
| Ort | String |

### Verkaufsevent-Position

| Attribut | Datentyp |
|---|---|
| Verkaufsevent-ID | Integer |
| Charge-ID | Integer |
| Menge mitgenommen | Integer |
| Menge verkauft | Integer |

### Bestellung

| Attribut | Datentyp |
|---|---|
| Bestellung-ID | Integer |
| Kunde-ID | Integer |
| Datum | Date |
| Kanal | Enum |
| Lieferadresse | String |
| Allergene gelesen | Enum |
| Zahlungsstatus | Enum |
| Status | Enum |

### Bestellposition

| Attribut | Datentyp |
|---|---|
| Bestellposition-ID | Integer |
| Bestellung-ID | Integer |
| Produkt-ID | Integer |
| Charge-ID | Integer |
| Menge | Integer |

### Paket

| Attribut | Datentyp |
|---|---|
| Paket-ID | Integer |
| Bestellung-ID | Integer |
| Mitarbeiter-ID | Integer |
| Versandoption | Enum |
| Versandkosten | Decimal |
| Status | Enum |
| Versanddatum | Date |
| Trackingnummer | String |
| Zustelldatum | Date |

### Retoure

| Attribut | Datentyp |
|---|---|
| Retoure-ID | Integer |
| Bestellposition-ID | Integer |
| Grund | Freitext |
| Produktzustand | Enum |
| Status | Enum |
| Erstattungsart | Enum |

### Mitarbeiter

| Attribut | Datentyp |
|---|---|
| Mitarbeiter-ID | Integer |
| Name | String |
| Rolle | Enum |
| Zugriffsrechte | Freitext |
| E-Mail | String |
| Telefonnummer | String |

## 5. Beziehungen

| # | Entitaet A | Kardinalitaet | Entitaet B |
|---|---|---|---|
| 1 | Kunde | 1:n | Bestellung |
| 2 | Bestellung | 1:n | Bestellposition |
| 3 | Produkt | 1:n | Bestellposition |
| 4 | Produkt | 1:n | Charge |
| 5 | Charge | 1:n | Bestellposition |
| 6 | Bestellposition | 1:n | Retoure |
| 7 | Bestellung | 1:n | Paket |
| 8 | Charge | 1:n | Lagerbestand |
| 9 | Kunde | 1:n | Abo-Box |
| 10 | Verkaufsevent | 1:n | Verkaufsevent-Position |
| 11 | Charge | 1:n | Verkaufsevent-Position |
| 12 | Mitarbeiter | 1:n | Charge |
| 13 | Mitarbeiter | 1:n | Paket |

Aufgeloeste n:m-Beziehungen:
- Bestellung n:m Produkt wird durch Bestellposition aufgeloest.
- Verkaufsevent n:m Charge wird durch Verkaufsevent-Position aufgeloest.

## 6. Geschaeftsregeln

| ID | Regel |
|---|---|
| GR-01 | Eine Bestellung wird erst mit Zahlungseingang verbindlich; eine reine DM-Zusage fuehrt nur zu einer Reservierung. |
| GR-02 | Reservierte, unbezahlte Bestellungen werden nicht automatisch storniert. B2C-Neukunden: Warnung nach 3 Tagen, manuelle Stornierung ab Tag 5. B2C-Stammkunden: Warnung nach 7 Tagen, manuelle Stornierung ab Tag 10. |
| GR-03 | Beim Packen und bei der Bestandszuteilung gilt FIFO nach fruehestem MHD. Die App schlaegt die Charge automatisch vor und weist sie auf der Packliste aus. |
| GR-04 | Sechs erfolgreiche Bestellungen innerhalb von 365 Tagen machen Kunden automatisch zu Stammkunden. Stammkunden erhalten 10 % Rabatt und 24 Stunden Vorab-Benachrichtigung ueber neue Chargen. Nach 8 Monaten Inaktivitaet wird Nina gewarnt. |
| GR-05 | Bei Produktknappheit zuerst Stammkunden, dann B2C-Neukunden. Innerhalb der Gruppe entscheidet der Anfragezeitpunkt. |
| GR-06 | B2B-Preise und Zahlungsziel bis 30 Tage gelten ab 50 Einheiten. Darunter gelten B2C-Konditionen. B2B darf den B2C-Puffer nicht aufbrauchen; Standard-Puffer ist 30 % der aktuellen Charge. |
| GR-07 | B2C-Retourenfrist: 14 Tage ab Lieferung. B2B: 7 Tage nur bei eindeutigen Maengeln oder Transportschaeden. Abo-Box: 7 Tage fuer fehlerhafte oder beschaedigte Produkte, keine komplette Box-Retoure. |
| GR-08 | Ungeoeffnete Ware mit mehr als vier Wochen MHD-Restlaufzeit wird wieder dem Chargenbestand zugefuehrt. Vier Wochen oder weniger werden als reduzierter Restposten gefuehrt. Geoeffnete oder beschaedigte Ware wird ausgebucht. |
| GR-09 | Zugriffsrechte sind strikt nach Rolle getrennt: Admin Vollzugriff, Werkstatt-Hilfe nur Chargenanlage, Packer nur Tages-Packliste und Paketstatus. |
| GR-10 | Bei allergenbehafteten Produkten muss der Kunde vor Bestellabschluss mit Timestamp bestaetigen, die Allergenliste gelesen zu haben. |
| GR-11 | Eine Bestellung gilt automatisch als abgeschlossen und wandert ins Archiv, sobald das Tracking die Zustellung bestaetigt. |
| GR-12 | Acht Wochen vor MHD: 20 %-Rabattvorschlag. Dreissig Tage vor MHD: 50 %-Rabattvorschlag. Preis wird erst nach manueller Bestaetigung durch Nina geaendert. |
| GR-13 | B2C ab 39,00 EUR versandkostenfrei, darunter 4,50 EUR. B2B- und Abo-Bestellungen immer versandkostenfrei. |
| GR-14 | Abo-Bestellungen werden am 15. jedes Monats gesammelt abgewickelt, inklusive Versandlabel, konsolidierter Packliste und Lagerabbuchung. |
| GR-15 | Abo-Pausierung maximal zwei aufeinanderfolgende Monate und Anmeldung bis zum 15. des Vormonats. |

## 7. Aufgeloeste Widersprueche

### W-1: Wann ist eine Bestellung verbindlich?
Es gibt zwei Zustaende: `eingegangen` fuer DM-Zusage mit Reservierung, aber ohne Verbindlichkeit, und `verbindlich` nach Zahlungseingang.

### W-2: Automatisches Stornieren nach Fristablauf?
Das System storniert nicht automatisch. Es warnt Nina und ueberlaesst ihr die manuelle Entscheidung.

### W-3: Reihenfolge bei Produktknappheit
Es gilt ein zweistufiges Prinzip: zuerst Stammkunden, dann B2C-Neukunden; innerhalb jeder Gruppe nach Eingang der Anfrage.

## 8. Offene Klaerungen

- Gewuenschter Tech-Stack und Hosting.

## 9. Geklaerte Enum-Werte

### Bestellung

| Feld | Werte |
|---|---|
| Bestellkanal | Instagram, Email, Abo |
| Zahlungsstatus | ausstehend, bezahlt |
| Bestellstatus | Eingegangen, verbindlich, storniert, abgeschlossen |

### Produkt

| Feld | Werte |
|---|---|
| Produktkategorie | Seifen, Öle, Balsam, Bodylotions |

### Lagerbestand

| Feld | Werte |
|---|---|
| Lagerort | Werkstatt, Versandbereit, Restposten |

### Charge

| Feld | Werte |
|---|---|
| Chargenstatus | freigegeben, gesperrt |

### Mitarbeiter

| Feld | Werte |
|---|---|
| Rolle | Admin, Werkstatt-Hilfe, Packer |

### Kunde

| Feld | Werte |
|---|---|
| Kundentyp | B2C, B2B |
| Hauttyp | normale Haut, ölige Haut, trockene Haut, Mischhaut |

### Paket

| Feld | Werte |
|---|---|
| Paketstatus | Vorbereitet, Gepackt, Versendet, Zugestellt |
| Versandoption | DHL, DHL Express |

### Versand und Tracking

| Feld | Werte |
|---|---|
| Versandlabel und Tracking V1 | Manuell; Versandlabel wird ausserhalb der App erstellt, Trackingnummer und Versand-/Zustelldaten werden in der App gepflegt |

### Retoure

| Feld | Werte |
|---|---|
| Retourenstatus | Angemeldet, Eingegangen, In Prüfung, Angenommen, Abgelehnt, Abgeschlossen |
| Produktzustand | Ungeöffnet, Geöffnet, Beschädigt, Mangelhaft |
| Erstattungsart | Keine, Gutschein, Geld zurück, Ersatzprodukt |
