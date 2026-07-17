# KALIBRIERUNG: Kennst du deine App?

## 1. Business Rule: FIFO-Zuteilung nach frühestem MHD

**Aussage:** Beim Anlegen einer Bestellposition wählt die App automatisch eine freigegebene Charge desselben Produkts mit ausreichender freier Menge und frühestem MHD.

**Konfidenz:** 9/10

**Wie geprüft?** In `src/app/page.tsx` sucht `createBestellposition` die Charge mit `orderBy: [{ mhd: "asc" }, { id: "asc" }]` und prüft `getFreieMenge(charge) >= menge`; die Regel ist außerdem in `docs/spec.md` als `GR-03` dokumentiert.

## 2. Business Rule: Allergenbestätigung vor Abschluss

**Aussage:** Eine Bestellung mit allergenbehafteten Produkten kann nicht über den Paketstatus `Zugestellt` abgeschlossen werden, solange `allergeneBestaetigtAm` fehlt.

**Konfidenz:** 9/10

**Wie geprüft?** In `src/app/page.tsx` verhindern `createPaket` und `updatePaketstatus` bei `status === "Zugestellt"` den Abschluss über `hatUnbestaetigteAllergene(...)`; das Feld `allergeneBestaetigtAm` steht im Prisma-Modell `Bestellung`.

## 3. Datenmodell: n:m Bestellung zu Produkt

**Aussage:** Die n:m-Beziehung zwischen `Bestellung` und `Produkt` ist über das Zwischenmodell `Bestellposition` aufgelöst; jede Position verbindet genau eine Bestellung, ein Produkt, eine Charge und eine Menge.

**Konfidenz:** 10/10

**Wie geprüft?** In `prisma/schema.prisma` hat `Bestellposition` die Fremdschlüssel `bestellungId`, `produktId` und `chargeId`; `docs/spec.md` nennt ausdrücklich, dass `Bestellung n:m Produkt` durch `Bestellposition` aufgelöst wird.

## 4. Widerspruchsauflösung: Keine automatische Stornierung

**Aussage:** Unbezahlte Reservierungen werden nicht automatisch storniert; die App zeigt nur Warnungen und markiert manuelle Prüfaufgaben.

**Konfidenz:** 9/10

**Wie geprüft?** `docs/spec.md` legt in `GR-02` fest, dass unbezahlte Bestellungen nicht automatisch storniert werden; in `src/app/page.tsx` erzeugt `getReservierungswarnung(...)` nur Warntexte wie „manuelle Stornierung prüfen“ und ändert keinen Bestellstatus.

## 5. Frei: Monatliche Abo-Abwicklung ist manuell und atomar

**Aussage:** Die monatliche Abo-Abwicklung wird manuell gestartet und nur angelegt, wenn aktive Abo-Boxen vorhanden sind, genau vier Abo-Produkte markiert sind, nötige Allergenbestätigungen vorliegen und für jede Position FIFO-Bestand verfügbar ist.

**Konfidenz:** 8/10

**Wie geprüft?** In `src/app/page.tsx` validiert `createAboAbwicklung` aktive Abo-Boxen, `aboProdukte.length === 4`, Allergenbestätigung und verfügbare FIFO-Chargen innerhalb einer Prisma-Transaktion; `prisma/schema.prisma` verhindert doppelte Monatsläufe mit `@@unique([jahr, monat])`.
