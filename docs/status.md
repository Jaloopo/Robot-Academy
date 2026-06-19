# Status & handoff – Edison Hemguide

Levande arbetsdokument. **Uppdateras i slutet av varje session.** Nästa session läser detta
först (efter `CLAUDE.md`, `docs/plan.md`, `docs/design.md`, `docs/roadmap.md`), gör EXAKT
ett roadmap-steg, uppdaterar detta dokument + roadmap, committar till `main`, och skriver
en ny copy-paste längst ned.

Senast uppdaterad: 2026-06-19 · main @ `7ce0d75`

## Nuläge (fakta)
- Kapitel 1 komplett: text, vuxen-tips, flerval, ordning – med gating, snäll feedback, a11y.
- Designsystem + mobil + desktop-ark (≥720 px) + tunn framstegsstapel ligger på `main`.
- Innehåll i `content/kapitel-1.js` (`window.KAPITEL`). `js/app.js` har `CHAPTER_ID`
  hårdkodat till `"kapitel-1"` (blockerar flera kapitel – se roadmap-steg 1).

## Vad senaste sessionen gjorde
- Desktop-polish: inramat ark på lugn canvas + framstegsstapel.
- Satte upp handoff-systemet: `docs/roadmap.md`, denna `docs/status.md`, och en
  "Sessioner & handoff"-sektion i `CLAUDE.md`/`.cursorrules`.

## Beslut (varför)
- Framsteg = "Steg X av N"-text + tunn stapel (inte 12 prickar).
- Desktop = Layout A (ark på canvas). Layout B (chapter-rail) skjuts till flerkapitel.

## Varningar / blockers
- Ingen webbläsare i denna miljö → **visuell kontroll görs manuellt** (Chrome, `file://`).
- Fjärrgrenar går inte att radera härifrån (git-proxy 403) – radera i GitHub-UI.
- Inget committat testverktyg. En `jsdom`-genomklick finns att återskapa (roadmap-steg 5
  väger för/emot att committa node-tooling).

## Nästa steg (exakt ETT)
Roadmap-steg 0: **Granska byggarbetet** (UI mobil + desktop) mot `docs/design.md`, a11y och
`file://`. Bekräfta att mobil <720 px är oförändrad och att inget regredierat.

## Modellrekommendation för nästa steg
Granskning kräver omdöme → **Opus**. (Senare rena CSS-/innehållsbyggen kan köras i enklare
modell eller Cursor – se `docs/roadmap.md` → Modellval.)

## Copy-paste för nästa session
```text
Du tar över samordnar-/byggrollen för "Edison Hemguide" (repo Jaloopo/Robot-Academy, main).
Läs FÖRST: CLAUDE.md, docs/plan.md, docs/design.md, docs/roadmap.md, docs/status.md.
Ange kort nuläge + din planerade åtgärd innan du kör verktyg.

UPPGIFT (ett steg): Granska byggarbetet av UI-grunden (mobil + desktop) mot docs/design.md
och a11y. Kontrollera särskilt:
- Mobil <720 px är oförändrad; desktop ≥720 px = inramat ark på #e7e5df-canvas; stapeln fylls.
- Inga externa beroenden/fonter/fetch; fungerar via file:// och GitHub Pages.
- a11y: fokusring, riktiga <button>, info inte enbart via färg, lang="sv".
- node --check js/app.js och en genomklick av kapitlet (gating, fel→rätt, ordning).
Rör inte datamodellen. Hitta inte på Edison-fakta.

AVSLUTA enligt handoff: uppdatera docs/status.md (nuläge, gjort, beslut, varningar, nästa
steg = roadmap-steg 1 flerkapitelstöd, modellrek) + bocka av i docs/roadmap.md, committa
och pusha till main. Öppna ingen PR. Skriv en ny copy-paste för nästa session i status.md.
```
