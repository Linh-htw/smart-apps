# KALIBRIERUNG: Kennst du deine App?

## 1. Business Rule: FIFO-Zuteilung nach frühestem MHD

**Aussage:** Beim Anlegen einer Bestellposition wählt die App automatisch eine freigegebene Charge desselben Produkts mit ausreichender freier Menge und frühestem MHD.

**Konfidenz:** 10/10

**Wie geprüft?** Ich habe für dasselbe Produkt mehrere freigegebene Chargen mit unterschiedlichen MHD-Daten angelegt und anschließend eine Bestellposition erstellt. Die App hat automatisch die Charge mit dem frühesten MHD zugewiesen, sofern dort eine ausreichende freie Menge verfügbar war.

## 2. Business Rule: Allergenbestätigung vor Abschluss

**Aussage:** Eine Bestellung mit allergenbehafteten Produkten kann nur abgeschlossen werden, wenn der Kunde bestätigt hat, die Allergenliste gelesen zu haben.

**Konfidenz:** 10/10

**Wie geprüft?** Ich habe versucht, einer Bestellung ein allergenbehaftetes Produkt zunächst ohne und anschließend mit Allergenbestätigung hinzuzufügen. Ohne die Auswahl „Allergenliste gelesen und vom Kunden bestätigt“ wurde die Bestellposition nicht angelegt. Nach dem Setzen der Bestätigung konnte ich das Produkt hinzufügen. Die erforderliche Bestätigung wird somit bereits beim Hinzufügen des Produkts erzwungen.

## 3. Datenmodell: n:m Bestellung zu Produkt

**Aussage:** Die n:m-Beziehung zwischen `Bestellung` und `Produkt` wird durch das Zwischenmodell `Bestellposition` aufgelöst. Eine Bestellung kann mehrere Produkte enthalten und ein Produkt kann mehreren Bestellungen zugeordnet sein.

**Konfidenz:** 10/10

**Wie geprüft?** Ich habe mehrere Produkte als einzelne Bestellpositionen zu einer Bestellung hinzugefügt. Außerdem konnte ich dasselbe Produkt über jeweils eine Bestellposition mehreren Bestellungen zuordnen.

## 4. Widerspruchsauflösung: Keine automatische Stornierung

**Aussage:** Unbezahlte Reservierungen werden nicht automatisch storniert; die App zeigt nur Warnungen und markiert manuelle Prüfaufgaben.

**Konfidenz:** 9/10

**Wie geprüft?** `docs/spec.md` legt in `GR-02` fest, dass unbezahlte Bestellungen nicht automatisch storniert werden; in `src/app/page.tsx` erzeugt `getReservierungswarnung(...)` nur Warntexte wie „manuelle Stornierung prüfen“ und ändert keinen Bestellstatus.

## 5. Frei: Rollentrennung mit verschiedenen Zugriffsrechten

**Aussage:** Der Admin hat Vollzugriff. Die Werkstatt-Hilfe darf ausschließlich Chargen anlegen. Der Packer sieht nur die Tages-Packliste und darf den jeweiligen Paketstatus bearbeiten.

**Konfidenz:** 10/10

**Wie geprüft?** Ich habe Mitarbeitende mit den Rollen Admin, Packer und Werkstatt-Hilfe angelegt, mich nacheinander mit jeder Rolle angemeldet und die sichtbaren Bereiche sowie die verfügbaren Aktionen geprüft. Als Admin konnte ich auf alle Bereiche zugreifen. Als Packer sah ich ausschließlich die Tages-Packliste und die Paketstatuspflege. Als Werkstatt-Hilfe konnte ich nur den Bereich zur Chargenanlage verwenden.
