# KALIBRIERUNG: Kennst du deine App?

## 1. Business Rule: FIFO-Zuteilung nach frühestem MHD

**Aussage:** Beim Anlegen einer Bestellposition wählt die App automatisch eine freigegebene Charge desselben Produkts mit ausreichender freier Menge und frühestem MHD.

**Konfidenz:** 7/10

**Wie geprüft?** Ich habe für dasselbe Produkt mehrere freigegebene und gesperrte Chargen mit unterschiedlichen MHD-Daten angelegt und anschließend eine Bestellposition erstellt. Die App hat automatisch die freigegebene Charge mit dem frühesten MHD zugewiesen, sofern dort eine ausreichende freie Menge verfügbar war.

## 2. Business Rule: Allergenbestätigung vor Bestellabschluss

**Aussage:** Eine Bestellung mit allergenbehafteten Produkten kann nur abgeschlossen werden, wenn der Kunde bestätigt hat, die Allergenliste gelesen zu haben.

**Konfidenz:** 10/10

**Wie geprüft?** Ich habe versucht, einer Bestellung ein allergenbehaftetes Produkt zunächst ohne und anschließend mit Allergenbestätigung hinzuzufügen. Ohne das Ankreuzen von `Allergenliste gelesen und vom Kunden bestätigt` konnte die Bestellposition nicht angelegt werden. Erst nach dem Setzen der Bestätigung konnte dieses Produkt der Bestellung hinzugefügt werden.

## 3. Datenmodell (n:m): Bestellung zu Produkt

**Aussage:** Die n:m-Beziehung zwischen `Bestellung` und `Produkt` wird durch das Zwischenmodell `Bestellposition` aufgelöst. Eine Bestellung kann mehrere Produkte enthalten und ein Produkt kann mehreren Bestellungen zugeordnet sein.

**Konfidenz:** 10/10

**Wie geprüft?** Beim Anlegen einer Bestellung konnte ich mehrere Produkte (als einzelne Bestellpositionen) zu einer Bestellung hinzufügen. Außerdem konnte ich dasselbe Produkt (über jeweils eine Bestellposition) mehreren Bestellungen zuordnen.

## 4. Widerspruchsauflösung: Keine automatische Stornierung

**Aussage:** Unbezahlte Reservierungen werden nicht automatisch storniert. Die App zeigt Warnungen an und ermöglicht dem Admin nach Ablauf der jeweiligen Frist eine manuelle Stornierung.

**Konfidenz:** 10/10

**Wie geprüft?** Ich habe unbezahlte Bestellungen für einen B2C-Neukunden und einen B2C-Stammkunden mit unterschiedlichen Bestelldaten getestet. Beim Neukunden erschien nach drei Tagen eine Zahlungswarnung und ab Tag fünf der Hinweis, eine manuelle Stornierung zu prüfen. Beim Stammkunden erschien die Warnung nach sieben Tagen und der Stornierungshinweis ab Tag zehn. In allen Fällen blieb der Bestellstatus `Eingegangen` und wechselte nicht automatisch zu `storniert`. Im Tab `Bestellungen` erschien für den Admin bei den entsprechenden Bestellungen die Option zur manuellen Stornierung.

## 5. Frei: Rollentrennung mit verschiedenen Zugriffsrechten

**Aussage:** Der Admin hat Vollzugriff. Die Werkstatt-Hilfe darf ausschließlich Chargen anlegen. Der Packer sieht nur die Tages-Packliste und darf den jeweiligen Paketstatus bearbeiten.

**Konfidenz:** 10/10

**Wie geprüft?** Ich habe Mitarbeitende mit den Rollen Admin, Packer und Werkstatt-Hilfe angelegt, mich nacheinander mit jeder Rolle angemeldet und die sichtbaren Bereiche sowie die verfügbaren Aktionen geprüft. Als Admin konnte ich alle Bereiche aufrufen und die dortigen Daten bearbeiten. Als Packer sah ich ausschließlich die Tages-Packliste und durfte nur den Paketstatus bearbeiten. Als Werkstatt-Hilfe konnte ich nur den Bereich zur Chargenanlage verwenden. Änderungen durch andere Mitarbeitende waren anschließend auch im Admin-Konto sichtbar.
