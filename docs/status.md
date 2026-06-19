# Status & handoff – Edison Hemguide

Levande arbetsdokument. **Uppdateras i slutet av varje session.** Nästa session läser detta
först (efter `CLAUDE.md`, `docs/plan.md`, `docs/design.md`, `docs/roadmap.md`), gör EXAKT
ett roadmap-steg, uppdaterar detta dokument + roadmap, committar till `main`, och skriver
en ny copy-paste längst ned.

Senast uppdaterad: 2026-06-19 · roadmap-steg 0 (granskning) + dev-testharness

## Nuläge (fakta)
- Kapitel 1 komplett: text, vuxen-tips, flerval, ordning – med gating, snäll feedback, a11y.
- Designsystem + mobil + desktop-ark (≥720 px) + tunn framstegsstapel ligger på `main`.
- Innehåll i `content/kapitel-1.js` (`window.KAPITEL`). `js/app.js` har `CHAPTER_ID`
  hårdkodat till `"kapitel-1"` (blockerar flera kapitel – se roadmap-steg 1).
- **Committat testverktyg finns nu:** `npm test` kör en jsdom-genomklick
  (`test/clickthrough.test.js`). `jsdom` är DEV-beroende; `node_modules/` är git-ignorerat.
  Sajten själv är fortsatt beroendefri.

## Vad senaste sessionen gjorde
- **Granskade UI-grunden (roadmap-steg 0)** mot `docs/design.md` + a11y: desktop-blocket är
  helt additivt (`@media (min-width: 720px)`, mobilens värden orörda), inga externa
  beroenden/fonter/fetch (`index.html` laddar bara lokala `./...`), riktiga `<button>`,
  fokusring, `lang="sv"`, info inte enbart via färg (ikon + text). Inga regressioner hittade.
- **Införde committat dev-testverktyg (roadmap-steg 5, testharness-delen):** `package.json`
  (DEV-beroende `jsdom`, script `npm test` → `node --test`) + `test/clickthrough.test.js`
  som driver den riktiga renderaren + innehållet och verifierar gating, fel→rätt,
  blandad ordning/"Börja om" och bakåtnavigering. `.gitignore` ignorerar `node_modules/`.
- Verifierade: `node --check js/app.js` ✓ och `npm test` (4 tester) ✓.

## Beslut (varför)
- Framsteg = "Steg X av N"-text + tunn stapel (inte 12 prickar).
- Desktop = Layout A (ark på canvas). Layout B (chapter-rail) skjuts till flerkapitel.
- **Testverktyget körs via Nodes inbyggda `node:test` + `node:assert`** (inget extra
  test-ramverk) och använder bara `jsdom` som DEV-beroende. Det laddar `content/*.js` och
  `js/app.js` oförändrade via `window.eval` i jsdom – sajtens beroendefrihet bevaras.
- **Testet hårdkodar inte svar:** det läser `correctAnswer` från `window.KAPITEL` och läser
  blandad ordning från DOM, så det fungerar för framtida kapitel utan ändring.

## Varningar / blockers
- Ingen webbläsare i denna miljö → **visuell pixelkontroll görs manuellt** (Chrome,
  `file://`). Funktionell genomklick täcks nu av `npm test`.
- Fjärrgrenar går inte att radera härifrån (git-proxy 403) – radera i GitHub-UI.
- `node_modules/` committas aldrig: kör `npm install` en gång innan `npm test`.
- Denna körning gjordes som Cloud-agent → arbetet ligger på en `cursor/...`-branch med
  draft-PR i stället för direkt push till `main` (miljön tillåter inte push till `main`).
  Vid lokal Claude Code-körning gäller fortsatt projektets normala flöde (push till `main`).

## Nästa steg (exakt ETT)
Roadmap-steg 1: **Flerkapitelstöd.** Avhårdkoda `CHAPTER_ID` i `js/app.js`; kapitelval via
`?kapitel=N` (måste funka på `file://`) + enkel landningsvy som listar `window.KAPITEL`
("klart → nästa/tillbaka"). Lägg till en jsdom-test som täcker routing/landningsvyn.

## Modellrekommendation för nästa steg
Flerkapitel-routing är logik/omdöme → **Opus**. (Rena CSS-/innehållsbyggen kan köras i
enklare modell eller Cursor – se `docs/roadmap.md` → Modellval.)

## Copy-paste för nästa session
```text
Du tar över samordnar-/byggrollen för "Edison Hemguide" (repo Jaloopo/Robot-Academy, main).
Läs FÖRST: CLAUDE.md, docs/plan.md, docs/design.md, docs/roadmap.md, docs/status.md.
Ange kort nuläge + din planerade åtgärd innan du kör verktyg.

UPPGIFT (ett steg): Roadmap-steg 1 – flerkapitelstöd. Avhårdkoda CHAPTER_ID i js/app.js.
- Kapitelval via ?kapitel=N som MÅSTE funka på file:// (ingen fetch/router-bibliotek).
- Enkel landningsvy som listar alla kapitel i window.KAPITEL; "klart → nästa/tillbaka".
- Behåll all befintlig a11y och gating. Rör inte datamodellen (window.KAPITEL, correctAnswer).
- Lägg till/utöka jsdom-testet (test/clickthrough.test.js eller ny test/) för routing +
  landningsvy. Hitta inte på Edison-fakta.

VERIFIERA: node --check js/app.js, npm test (kör npm install först), samt genomklick via
file:// i Chrome (inga konsolfel/nätverksanrop).

AVSLUTA enligt handoff: uppdatera docs/status.md (nuläge, gjort, beslut, varningar, nästa
steg, modellrek) + bocka av roadmap-steg 1 i docs/roadmap.md, committa och pusha. Öppna ingen
PR om användaren inte ber om det. Skriv en ny copy-paste för nästa session i status.md.
```
