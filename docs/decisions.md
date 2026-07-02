# decisions.md - Architektur- und Produktentscheidungen

_Chronologisches Log aller Architektur- und Produktentscheidungen._

---

## 2026-07-02 - Spec ersetzt PRD

**Kontext:** Die Modus-Operandi-Methodik nutzt normalerweise `docs/prd.md`. Fuer dieses Projekt soll die vorhandene `Spec.md` die PRD-Rolle uebernehmen.

### Entscheidung
Es wird keine `docs/prd.md` angelegt. Die fachliche Single Source of Truth ist `docs/spec.md`, basierend auf der vorhandenen `Spec.md`.

### Alternativen verworfen
- `prd.md` aus Template kopieren: Verworfen, weil dadurch Doppelpflege und Drift zur bestehenden Spec entstehen wuerden.

### Konsequenzen
- Alle Agenten- und Arbeitsprozess-Verweise zeigen auf `docs/spec.md`.
- Scope-Aenderungen werden in `docs/spec.md` dokumentiert.

## 2026-07-02 - Solo-Projekt ohne Meetings-, Results- und Team-Struktur

**Kontext:** Das Projekt wird allein umgesetzt. Der Nutzer hat Meeting- und Results-Ordner explizit ausgeschlossen.

### Entscheidung
Es werden keine `docs/meetings/`, `docs/results/`, `docs/team/` und keine `docs/INBOX.md` angelegt.

### Alternativen verworfen
- Vollstaendige Modus-Operandi-Struktur: Verworfen, weil sie fuer ein Solo-Projekt unnoetige Pflege erzeugt.

### Konsequenzen
- Dokumentation bleibt schlank: `docs/spec.md`, `docs/architecture.md`, `docs/backlog.md`, `docs/decisions.md`, `docs/modus-operandi.md`, optional `docs/concepts/` und `docs/audit/`.

## 2026-07-02 - AGENTS.md als Agent-Briefing

**Kontext:** Die Vorlage liefert `CLAUDE.md`, dieses Projekt wird hier aber mit Codex/Agent-Kontext bearbeitet.

### Entscheidung
Das Projekt nutzt `AGENTS.md` als primaeres Agent-Briefing.

### Alternativen verworfen
- Nur `CLAUDE.md`: Verworfen, weil `AGENTS.md` in diesem Arbeitskontext direkter passt.

### Konsequenzen
- Neue Agent-Sessions sollen zuerst `AGENTS.md` lesen.
- Falls spaeter Claude Code genutzt wird, kann `CLAUDE.md` aus `AGENTS.md` abgeleitet werden.
