# modus-operandi.md - Solo-Workflow fuer Nina Wolffs App

_Projektspezifische Anpassung von github.com/jacekzawisza/modus-operandi._

---

## Grundsatz

Dieses Projekt wird dokumentationsgetrieben gebaut. Markdown-Dateien im Repo sind die Single Source of Truth. Die KI soll nicht aus Erinnerung arbeiten, sondern aus den Projektartefakten.

## Artefakte

| Artefakt | Zweck | Pflege |
|---|---|---|
| `AGENTS.md` | Einstieg und Arbeitsregeln fuer Coding-Agenten | Aktualisieren, wenn sich zentrale Konventionen aendern. |
| `docs/spec.md` | Fachliche Produkt-Spec, ersetzt PRD | Aktualisieren bei Scope- oder Regel-Aenderungen. |
| `docs/architecture.md` | Technische Architektur, Stack, Datenmodell-Entscheidungen | Aktualisieren bei technischen Entscheidungen. |
| `docs/backlog.md` | Operative Feature-Liste mit stabilen IDs | Aktualisieren bei Feature-Status oder neuen Features. |
| `docs/decisions.md` | Chronologisches Entscheidungslog | Aktualisieren bei Produkt- oder Architekturentscheidungen. |
| `docs/concepts/` | Optionale Feature-Konzepte vor komplexer Umsetzung | Nur bei groesseren Features verwenden. |
| `docs/audit/` | Optionale Codebase- und Security-Audits | Verwenden, sobald Code existiert und das Projekt waechst. |

Nicht Teil dieses Solo-Setups:
- `docs/prd.md`, weil `docs/spec.md` diese Rolle uebernimmt.
- `docs/meetings/`, weil keine Meeting-Struktur gebraucht wird.
- `docs/results/`, weil explizit nicht gewuenscht.
- `docs/team/`, weil kein Team.
- `docs/INBOX.md`, solange nicht parallel auf mehreren Worktrees oder Maschinen gearbeitet wird.

## Session-Workflow

1. **Kontext laden:** `AGENTS.md`, dann `docs/spec.md`, bei Umsetzung auch `docs/architecture.md` und `docs/backlog.md`.
2. **Aufgabe klaeren:** Ziel und Akzeptanzkriterien formulieren.
3. **Planen:** Betroffene Dateien, Risiken und Verifikation benennen.
4. **Implementieren:** Kleine, nachvollziehbare Aenderungen.
5. **Verifizieren:** Tests, Linting oder manuelle Pruefschritte ausfuehren, sobald Code existiert.
6. **Doku synchronisieren:** Backlog, Architecture oder Decisions aktualisieren, wenn sich etwas daran geaendert hat.

## Feature-Flow

```text
docs/spec.md -> docs/backlog.md -> docs/concepts/ optional -> Implementation -> docs/decisions.md bei Entscheidung
```

`docs/spec.md` beschreibt Was und Warum. `docs/backlog.md` macht daraus stabile, referenzierbare Feature-IDs. `docs/architecture.md` beschreibt Wie. `docs/decisions.md` erklaert Warum bei Entscheidungen.

## Entscheidungsregeln

- Fachliche Regeln aus `docs/spec.md` haben Vorrang vor Annahmen.
- Wenn eine Regel fehlt, nicht frei erfinden; als offene Frage oder Entscheidung dokumentieren.
- Entscheidungen mit langfristiger Wirkung gehoeren in `docs/decisions.md`.
- Komplexe Features bekommen vor der Umsetzung ein Konzept in `docs/concepts/`.

## Commit-Konvention

Conventional Commits verwenden:

```text
feat: NW-008 FIFO-Bestandszuteilung
fix: NW-006 Zahlungsstatus korrekt behandeln
docs: Modus-Operandi-Struktur aktualisieren
```

Feature-IDs aus `docs/backlog.md` referenzieren, sobald vorhanden.

## Regelmaessige Hygiene

- Nach groesseren Umsetzungsschritten `docs/backlog.md` Status aktualisieren.
- Bei neuen technischen Mustern `docs/architecture.md` pflegen.
- Bei wiederkehrenden Fehlern oder Konventionen `AGENTS.md` ergaenzen.
- Sobald Code existiert: wiederkehrende Audits in `docs/audit/` ablegen.
