# smart-apps

Shop- und Kundenmanagement-App fuer Nina Wolff.

Dieses Repository ist als Solo-Projekt nach der Modus-Operandi-Methodik eingerichtet. Die fachliche Grundlage ist `docs/spec.md`; sie ersetzt in diesem Projekt ein klassisches PRD.

## Projektstruktur

| Pfad | Zweck |
|---|---|
| `AGENTS.md` | Arbeitsanweisungen und Kontext fuer Coding-Agenten |
| `Spec.md` | Urspruengliche Spezifikation im Repo-Root |
| `docs/spec.md` | Fachliche Single Source of Truth fuer Scope, Entitaeten, Beziehungen und Geschaeftsregeln |
| `docs/architecture.md` | Technische Architekturannahmen und offene Stack-Entscheidungen |
| `docs/backlog.md` | Feature-Backlog mit stabilen `NW-###` IDs |
| `docs/decisions.md` | Chronologisches Entscheidungslog |
| `docs/modus-operandi.md` | Projektspezifischer Solo-Workflow |
| `docs/concepts/` | Optionale Feature-Konzepte vor komplexer Umsetzung |
| `docs/audit/` | Spaetere Codebase-, Security- und Architektur-Audits |

## V1-Fokus

- Zentrale Verwaltung von Bestellungen aus verschiedenen Kanaelen
- Kunden- und Bestellzuordnung
- Lagerverwaltung mit Chargen- und MHD-Logik
- Zahlungs- und Bestellstatus
- Packlisten fuer Mitarbeitende
- Rollen- und Berechtigungssystem
- Aktive Arbeitsansicht mit offenen Aufgaben

## Arbeitsweise

Neue Sessions starten mit `AGENTS.md`, danach `docs/spec.md`, `docs/architecture.md` und bei Feature-Arbeit `docs/backlog.md` lesen.

`docs/prd.md`, `docs/meetings/`, `docs/results/`, `docs/team/` und `docs/INBOX.md` werden in diesem Solo-Setup bewusst nicht verwendet.
