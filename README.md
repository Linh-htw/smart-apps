# Nina Wolff Shop- und Kundenmanagement-App

Interne Web-App fuer Shop- und Kundenmanagement. Die App buendelt Kunden,
Produkte, Bestellungen, Chargen, Lagerbestand, Packlisten, Pakete, Retouren,
Abo-Boxen und rollenbezogene Arbeitsansichten.

Der V1-Fokus liegt auf einer zentralen Arbeitsansicht fuer offene Aufgaben,
Zahlungs- und Bestellstatus, FIFO-Zuteilung nach MHD, Packlisten,
Retourenlogik, Abo-Abwicklung und einfachen Rollen fuer Admin,
Werkstatt-Hilfe und Packer.

## Setup und Start

Voraussetzung: Node.js und npm.

1. Abhaengigkeiten installieren:

```bash
npm install
```

2. Lokale Umgebungsdatei anlegen:

```bash
copy .env.example .env
```

3. Datenbank vorbereiten:

```bash
npm run prisma:migrate -- --skip-generate
```

4. App starten:

```bash
npm run dev
```

5. Im Browser oeffnen:

```text
http://localhost:3000
```

Beim Start zeigt Next.js zusaetzlich eine lokale Netzwerk-URL an. Diese kann
im selben Netzwerk im Browser geoeffnet werden.

## Nutzung

Wenn noch keine Mitarbeitenden angelegt sind, startet die App in der
Admin-Ersteinrichtung. Danach kann ein Admin-Mitarbeiter angelegt werden.

Sobald Mitarbeitende existieren, erscheint ein Demo-Login. Fuer die
Pruefungsabgabe ist kein Passwort und kein Login-Code noetig: Mitarbeiter
auswaehlen und anmelden. Die Rolle steuert anschliessend serverseitig die
sichtbaren Arbeitsbereiche.

Rollen:

- Admin: Zugriff auf alle vorhandenen Verwaltungs- und Arbeitsbereiche.
- Werkstatt-Hilfe: Zugriff auf den Chargenarbeitsbereich.
- Packer: Zugriff auf die Tages-Packliste mit den noetigen Packdaten.

## Wichtige Befehle

```bash
npm run dev
npm run build
npm run lint
npm run prisma:generate
npm run prisma:migrate -- --skip-generate
```

## Projektdokumentation

- `docs/spec.md`: fachliche Spezifikation und Geschaeftsregeln.
- `docs/backlog.md`: Feature-Backlog mit `NW-###` IDs.
- `docs/architecture.md`: technische Architektur und Entscheidungen.
- `docs/decisions.md`: chronologisches Entscheidungslog.

## KI-Hinweis

Bei der Erstellung und Umsetzung dieses Projekts wurde KI-Unterstuetzung
genutzt:

- Tool: OpenAI Codex
- Modell: GPT-5

Die fachlichen Entscheidungen, Anforderungen und Abnahmekriterien wurden im
Repository dokumentiert. Der finale Code wurde lokal geprueft mit `npm run lint`
und `npm run build`.
