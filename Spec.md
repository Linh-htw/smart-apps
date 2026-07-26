# Spec — Nina Wolffs Shop- und Kundenmanagement-App

_Diese Datei ist die fachliche Single Source of Truth für Scope, Entitäten, Beziehungen, Geschäftsregeln, Widerspruchsauflösungen und V1-Prioritäten._

## Produktkontext und Zielgruppen

Nina Wolff braucht eine interne Shop- und Kundenmanagement-App, die Bestellungen aus verschiedenen Kanälen, Kunden, Produkte, Chargen, Lagerbestand, Packlisten, Retouren, Abo-Boxen und Mitarbeitenden-Zugriffe zusammenführt.

Der Kernnutzen liegt in einer aktiven Arbeitsansicht: offene Aufgaben, Zahlungsstatus, Bestellstatus, Lagerverfügbarkeit, Packlisten und Warnungen sollen eindeutig sichtbar sein.

- **Admin:** Nina, mit Vollzugriff auf Kunden, Produkte, Preise, Lager, Bestellungen, Retouren, Abo-Boxen und Auswertungen.
- **Werkstatt-Hilfe:** Legt ausschließlich Chargen an.
- **Packer:** Sieht nur die Tages-Packliste mit Name, Lieferadresse, zu packenden Produkten, zugewiesener Charge und Paketstatus. Kein Zugriff auf Preise, Umsätze oder vollständige Kundendaten.

## 1. Entitäten

### 1 Kunde

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

### 2 Produkt

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
| B2C-Puffermenge | Integer |
| Standard-MHD-Dauer (Monate) | Integer |
| In Abo-Box enthalten | Boolean |

### 3 Charge

| Attribut | Datentyp |
|---|---|
| Charge-ID | Integer |
| Produkt-ID | Integer |
| Mitarbeiter-ID | Integer |
| Herstellungsdatum | Date |
| MHD | Date |
| Produzierte Menge | Integer |
| Status | Enum |

### 4 Lagerbestand

| Attribut | Datentyp |
|---|---|
| Lagerbestand-ID | Integer |
| Charge-ID | Integer |
| Lagerort | Enum |
| Menge vorübergehend reserviert | Integer |
| Menge verbindlich reserviert | Integer |

### 5 Abo-Box

| Attribut | Datentyp |
|---|---|
| Abo-Box-ID | Integer |
| Kunde-ID | Integer |
| Lieferadresse | String |
| Status | Enum |
| Startdatum | Date |
| Pausiert seit | Date |
| Pausiert von | Date |
| Pausiert bis | Date |
| Kündigungsdatum | Date |

### 6 Verkaufsevent

| Attribut | Datentyp |
|---|---|
| Verkaufsevent-ID | Integer |
| Datum | Date |
| Ort | String |

### 7 Verkaufsevent-Position

| Attribut | Datentyp |
|---|---|
| Verkaufsevent-ID | Integer |
| Charge-ID | Integer |
| Menge mitgenommen | Integer |
| Menge verkauft | Integer |

### 8 Bestellung

| Attribut | Datentyp |
|---|---|
| Bestellung-ID | Integer |
| Kunde-ID | Integer |
| Datum | Date |
| Kanal | Enum |
| Lieferadresse | String |
| Allergene gelesen | Boolean |
| Zahlungsstatus | Enum |
| Status | Enum |

### 9 Bestellposition

| Attribut | Datentyp |
|---|---|
| Bestellposition-ID | Integer |
| Bestellung-ID | Integer |
| Produkt-ID | Integer |
| Charge-ID | Integer |
| Menge | Integer |

### 10 Paket

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

### 11 Retoure

| Attribut | Datentyp |
|---|---|
| Retoure-ID | Integer |
| Bestellposition-ID | Integer |
| Grund | Freitext |
| Produktzustand | Enum |
| Status | Enum |
| Erstattungsart | Enum |

### 12 Mitarbeiter

| Attribut | Datentyp |
|---|---|
| Mitarbeiter-ID | Integer |
| Name | String |
| Rolle | Enum |
| Zugriffsrechte | Freitext |
| E-Mail | String |
| Telefonnummer | String |

---

## 2. Beziehungen

| # | Entität A | Kardinalität | Entität B |
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

**Aufgelöste n:m-Beziehungen:**
- **Bestellung n:m Produkt** — aufgelöst durch Bestellposition
- **Verkaufsevent n:m Charge** — aufgelöst durch Verkaufsevent-Position

---

## 3. Geschäftsregeln

**GR-01 — Bestellverbindlichkeit:** Eine Bestellung wird erst mit Zahlungseingang verbindlich; eine reine DM-Zusage führt nur zu einer Reservierung.

**GR-02 — Reservierungsfristen:** Eine reservierte, unbezahlte Bestellung wird nach Ablauf der Reservierungsfrist  (B2C-Neukunden: Warnung nach 3 Tagen, manuelle Stornierung durch Nina ab Tag 5; B2C-Stammkunden: Warnung nach 7 Tagen, manuelle Stornierung durch Nina ab Tag 10) nicht automatisch storniert, sondern manuell entschieden.

**GR-03 — FIFO-Prinzip:** Beim Packen und bei der Bestandszuteilung muss immer die Charge mit dem frühesten MHD verwendet werden; die App schlägt sie automatisch vor und weist sie auf der Packliste aus.

**GR-04 — Stammkundenstatus:** Wer innerhalb von 365 Tagen sechs erfolgreiche Bestellungen abschließt, wird automatisch Stammkunde und erhält dadurch automatisch 10 % Rabatt auf den gesamten Warenkorb sowie 24 Stunden Vorab-Benachrichtigung über neue Chargen, wobei die App Nina warnt, sobald ein Stammkunde 8 Monate inaktiv ist.

**GR-05 — Priorität bei Produktknappheit:** Bei Produktengpässen werden Anfragen in folgender Reihenfolge berücksichtigt: Zunächst werden Stammkunden bevorzugt, anschließend B2C-Neukunden. Innerhalb der jeweiligen Kundengruppe erfolgt die Bearbeitung nach dem Zeitpunkt des Anfrageeingangs („First come, first serve“).

**GR-06 — B2B-Sonderkonditionen:** B2B-Preise und ein Zahlungsziel bis zu 30 Tagen gelten ab einer Mindestbestellmenge von 50 Einheiten; darunter gelten B2C-Konditionen.
B2B-Bestellungen dürfen den B2C-Bestand nicht vollständig leeren. Pro Produkt ist ein konfigurierbarer B2C-Puffer definiert (Standard: 30%). Das System blockiert diesen prozentualen Anteil des Gesamtbestands der aktuellen Charge für den B2C-Kanal und verhindert, dass B2B-Bestellungen diesen geschützten Mindestbestand mindern oder aufbrauchen.


**GR-07 — Retourenfristen:** B2C-Kunden haben 14 Tage ab Lieferung Zeit, eine Retoure anzukündigen, B2B-Kunden nur 7 Tage ab Lieferung und das ausschließlich bei eindeutigen Mängeln oder Transportschäden. Bei der Abo-Box gilt eine Meldefrist von 7 Tagen ab Lieferung für fehlerhafte oder beschädigte Produkte – keine komplette Box-Retoure. Bei berechtigter Reklamation gibt es Ersatz oder Gutschrift für die nächste Box.

**GR-08 — Retouren-Rückbuchung:** Ungeöffnete Ware mit mehr als vier Wochen MHD-Restlaufzeit wird wieder dem Chargenbestand zugeführt, ungeöffnete Ware mit vier Wochen oder weniger wird als reduzierter Restposten geführt, und geöffnete oder beschädigte Ware wird vollständig ausgebucht und durch Ersatzlieferung oder Rückerstattung kompensiert.

**GR-09 — Strikte Rollentrennung:** Zugriffsrechte sind strikt nach Rolle getrennt — Admin (Nina) hat Vollzugriff, Werkstatt-Hilfe darf ausschließlich Chargen anlegen, und der Packer darf nur seine Tages-Packliste mit Name, Lieferadresse, den zu packenden Produkten und der zugewiesenen Charge sehen und den Paketstatus entsprechend setzen, jeweils ohne Zugriff auf Preise, Umsätze oder vollständige Kundendaten.

**GR-10 — Allergen-Bestätigung:** Bei allergenbehafteten Produkten muss der Kunde vor Bestellabschluss bestätigen, die Allergenliste gelesen zu haben, sonst kann die Bestellung nicht abgeschlossen werden.

**GR-11 — Bestellabschluss:** Eine Bestellung gilt automatisch als abgeschlossen und wandert ins Archiv, sobald das Tracking die Zustellung bestätigt.

**GR-12 — MHD-Warnung und Restpostenpreis:** Acht Wochen vor MHD warnt die App automatisch mit einem 20 %-Rabattvorschlag und dreißig Tage vorher mit einem 50 %-Rabattvorschlag, wobei der Preis erst nach manueller Bestätigung durch Nina geändert wird.

**GR-13 — Versandkosten:** B2C-Bestellungen sind ab 39,00 € versandkostenfrei, darunter werden 4,50 € berechnet, während B2B- und Abo-Bestellungen immer kostenfrei versendet werden.

**GR-14 — Abo-Abwicklung:** Die Abo-Bestellungen werden für den 15. jedes Monats in einem manuell ausgelösten Monatslauf gesammelt abgewickelt. Der Lauf erzeugt die Bestellungen und Positionen, erstellt eine konsolidierte Packliste und bucht den Lagerbestand. Versandlabel werden außerhalb der App erstellt; Tracking- und Versanddaten werden in der App manuell gepflegt.

**GR-15 — Abo-Pausierung:** Eine Abo-Pausierung gilt ab einem konkreten Kalendermonat und ist für maximal zwei aufeinanderfolgende Monate möglich. Sie muss bis einschließlich 15. des Vormonats erfasst werden. Nach Ablauf der Pause wird die Abo-Box nicht automatisch umgestellt; Nina erhält eine Warnung zur Statusprüfung.

**GR-16 — Abo-Box-Inhalt:** Nina wählt monatlich genau vier Produkte für die Abo-Box aus. Enthalten sind die Produkte, die mit `In Abo-Box enthalten` markiert sind. Diese Auswahl gilt für alle aktiven Abo-Boxen; kundenspezifische Abo-Box-Inhalte werden in V1 nicht modelliert.

---

## 4. Widersprüche

### W-1: Wann ist eine Bestellung verbindlich?
**Nina sagt:** Eine Bestellung sei verbindlich, sobald in der DM eine Zusage erfolgt.
**Nina sagt kurz danach:** Verbindlich müsse eigentlich heißen, dass das Geld da ist.
**Auflösung:** Es werden zwei Zustände unterschieden: *eingegangen* (DM-Zusage vorhanden, Ware reserviert, aber nicht verbindlich) und *verbindlich* (Zahlung bestätigt). Im Status *eingegangen* ist die Ware für andere Kunden gesperrt, bis Zahlung eingeht oder die Reservierung freigegeben wird (siehe GR-01).

### W-2: Automatisches Stornieren nach Fristablauf — ja oder nein?
**Nina sagt zunächst:** Sie stimmt einer automatischen Stornierung nach 3 Tagen ohne Zahlung bei B2C zu.
**Nina sagt kurz danach:** Sie sei eigentlich zwiegespalten, da manche Stammkunden zuverlässig, aber später zahlen.
**Auflösung:** Das System storniert nicht automatisch, sondern warnt Nina nach Fristablauf und überlässt ihr die finale, manuelle Entscheidung mit längeren Fristen für Stammkunden (siehe GR-02).

### W-3: Reihenfolge bei Produktknappheit
**Nina sagt:** „Wer zuerst kommt, kriegt es.“
**Nina sagt aber auch:** Stammkunden sollen bei Knappheit bevorzugt werden.
**Auflösung:** Es gilt ein zweistufiges Prinzip — zuerst Stammkunden, dann B2C-Neukunden; innerhalb jeder Gruppe entscheidet die Reihenfolge des Bestelleingangs (siehe GR-05).

---

## 5. Prioritäten

### Muss in V1
- Zentrale Verwaltung aller Bestellungen aus verschiedenen Kanälen
- Zuordnung von Bestellungen zu Kunden
- Lagerverwaltung mit Chargen- und MHD-Logik in Echtzeit, synchroner Lagerabzug über alle Verkaufskanäle hinweg
- Klar sichtbarer Zahlungsstatus
- Klarer Status einer Bestellung
- Packlisten für Mitarbeiter
- Rollen- und Berechtigungssystem
- Aktive Arbeitsansicht mit ausschließlich offenen Aufgaben
- Verpflichtender Allergen-Bestätigungsworkflow bei allergenbehafteten Produkten

### Kann warten
- Marketing-Aktionen
- Rabattcodes
- Automatische Versandkosten-Berechnung
- Statistiken und Auswertungen (z. B. Bestseller)

---

## 6. Geklärte Enum-Werte

| Bereich | Feld | Werte |
|---|---|---|
| Bestellung | Bestellkanal | Instagram, Email, Abo |
| Bestellung | Zahlungsstatus | ausstehend, bezahlt |
| Bestellung | Bestellstatus | Eingegangen, verbindlich, storniert, abgeschlossen |
| Produkt | Produktkategorie | Seifen, Öle, Balsam, Bodylotions |
| Lagerbestand | Lagerort | Werkstatt, Markt-Truck, Zuhause |
| Charge | Chargenstatus | freigegeben, gesperrt |
| Mitarbeiter | Rolle | Admin, Werkstatt-Hilfe, Packer |
| Kunde | Kundentyp | B2C, B2B |
| Kunde | Hauttyp | normale Haut, ölige Haut, trockene Haut, Mischhaut |
| Paket | Paketstatus | Vorbereitet, Gepackt, Versendet, Zugestellt |
| Paket | Versandoption | DHL, DHL Express |
| Abo-Box | Status | aktiv, pausiert, gekuendigt |
| Retoure | Status | Angemeldet, Eingegangen, In Prüfung, Angenommen, Abgelehnt, Abgeschlossen |
| Retoure | Produktzustand | Ungeöffnet, Geöffnet, Beschädigt, Mangelhaft |
| Retoure | Erstattungsart | Keine, Gutschein, Geld zurück, Ersatzprodukt |

## 7. V1-Betrieb und Integrationen

- **Login:** Einfacher Demo-Login mit Mitarbeiter-Auswahl und Rolle, ohne Passwort oder Code.
- **Betrieb:** Lokal gestartete Web-App, erreichbar über `http://localhost:3000` oder eine lokale Netzwerk-URL.
- **Versandlabel:** Werden in V1 außerhalb der App erstellt.
- **Tracking:** Trackingnummer sowie Versand- und Zustelldaten werden manuell in der App gepflegt.
- **Allergenbestätigung:** Wird als Ja/Nein-Bestätigung gespeichert; ein Zeitpunkt wird nicht gespeichert.
