# AGENTS.md - Nina Wolffs Shop- und Kundenmanagement-App

## Projekt
Interne Shop- und Kundenmanagement-App fuer Nina Wolff. Ziel ist eine zentrale Arbeitsoberflaeche fuer Bestellungen, Kunden, Chargen, Lagerbestand, Packlisten, Retouren, Abo-Boxen und rollenbasierte Mitarbeitenden-Zugriffe.

## Arbeitsmodell
Solo-Projekt nach Modus Operandi. Markdown im Repo ist die Single Source of Truth. Es gibt keine Meeting- und Results-Ordner. `docs/spec.md` ersetzt die sonst uebliche `docs/prd.md`.

## Was bauen wir?
Lies zuerst `docs/spec.md`. Diese Datei ist die fachliche Quelle fuer Scope, Entitaeten, Beziehungen, Geschaeftsregeln, Widerspruchsaufloesungen und V1-Prioritaeten.

## Tech-Stack + Standards
Lies `docs/architecture.md`. Der Stack ist noch nicht final festgelegt; bis dahin keine impliziten Framework- oder Datenbankentscheidungen treffen.

## Feature-IDs + Status
Lies `docs/backlog.md`, sobald Features umgesetzt oder priorisiert werden. Feature-IDs werden nie umnummeriert oder wiederverwendet.

## Architektur- und Produktentscheidungen
Lies und pflege `docs/decisions.md`, wenn eine technische oder produktbezogene Entscheidung getroffen wird.

## Arbeitsweise
Lies `docs/modus-operandi.md` fuer den projektspezifischen Solo-Workflow.

## Coding-Prinzipien

**1. Think Before Coding.** Annahmen explizit machen. Bei Mehrdeutigkeit Interpretationen aufzeigen statt still zu raten. Wenn etwas unklar oder fachlich riskant ist, stoppen und fragen.

**2. Simplicity First.** Minimum Code, der das Problem loest. Keine Features ueber das Gefragte hinaus, keine Abstraktion fuer Single-Use-Code, keine konfigurierbare Flexibilitaet ohne konkreten Bedarf.

**3. Surgical Changes.** Nur die Dateien und Stellen anfassen, die fuer die Aufgabe noetig sind. Kein Drive-by-Refactoring und keine ungefragten Architekturwechsel.

**4. Goal-Driven Execution.** Vor Umsetzung Erfolgskriterien klaeren. Bei Bugs zuerst Reproduktion oder Testfall, dann Fix bis verifiziert. Bei Features Akzeptanzkriterien als Checkliste verwenden.

## Projektregeln
- Deutsche UI- und Doku-Texte verwenden, sofern nicht anders verlangt.
- Fachbegriffe aus `docs/spec.md` konsistent uebernehmen.
- Bestellstatus, Zahlungsstatus, Rollen, Lager- und Chargenlogik nicht frei erfinden; fehlende Enum-Werte in `docs/spec.md` oder `docs/decisions.md` klaeren.
- Keine automatische Stornierung unbezahlter Reservierungen implementieren; die Entscheidung bleibt manuell bei Nina.
- FIFO nach fruehestem MHD ist Standard fuer Bestandszuteilung und Packlisten.
- Rollen strikt trennen: Admin, Werkstatt-Hilfe, Packer.
- Keine Secrets, Tokens, Passwoerter oder echten Kundendaten in Code, Docs oder KI-Konversationen schreiben.

## Session-Ende
- Relevante Docs aktualisieren: `docs/spec.md` bei Scope-Aenderung, `docs/architecture.md` bei technischen Strukturentscheidungen, `docs/backlog.md` bei Feature-Status, `docs/decisions.md` bei Entscheidungen.
- Tests oder sinnvolle Verifikation ausfuehren, sobald Code existiert.
- Commit-Messages im Conventional-Commits-Stil formulieren und Feature-ID referenzieren, wenn das Feature im Backlog steht.
