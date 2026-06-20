# Status & handoff – Edison Hemguide

Levande arbetsdokument. **Uppdateras i slutet av varje session.** Nästa session läser detta
först (efter `CLAUDE.md`, `docs/plan.md`, `docs/design.md`, `docs/roadmap.md`), gör EXAKT
ett roadmap-steg, uppdaterar detta dokument + roadmap, committar till `main`, och skriver
en ny copy-paste längst ned.

Senast uppdaterad: 2026-06-20 · testverktyg (datadrivet genomklick av alla kapitel) + GitHub Actions-CI

## Nuläge (fakta)
- Kapitel 1 komplett: text, vuxen-tips, flerval, ordning – med gating, snäll feedback, a11y.
- Kapitel 2 "Ditt första program" klart (11 steg) i `content/kapitel-2.js`.
- **Kapitel 3 "Robotar i världen" är nu byggt** som innehåll i `content/kapitel-3.js`
  (13 steg: text + vuxen-tips, två flervalsfrågor om robotarm/robotdammsugare och en
  ordningsfråga känna av→följa program→göra något). Laddas via en ny `<script>`-rad i
  `index.html` före `js/app.js`.
- Designsystem + mobil + desktop-ark (≥720 px) + chapter-rail (≥900 px) + tunn
  framstegsstapel ligger på `main`.
- `js/app.js` väljer kapitel via `?kapitel=N`; utan query visas en landningsvy som listar
  alla laddade kapitel. Landningsvyn listar nu kapitel 1, 2 och 3. Kapitel 3 är sista
  kapitlet, så dess sista steg länkar till "Till kapitelöversikt".
- Committat testverktyg: `npm test` kör en jsdom-genomklick (`test/clickthrough.test.js`,
  **10 tester**). `jsdom` är DEV-beroende; `node_modules/` är git-ignorerat. Sajten själv är
  fortsatt beroendefri.
- **Testet genomklickar nu ALLA riktiga `content/kapitel-*.js` automatiskt** (kapitel 1, 2, 3
  i dag) – inte längre bara kapitel 1 + ett syntetiskt inline-kapitel. Ett nytt kapitel testas
  alltså bara genom att lägga till filen; trasig kapiteldata får `npm test` att faila.
- **GitHub Actions-CI** (`.github/workflows/ci.yml`) kör `node --check` (renderaren + alla
  kapitelfiler) + `npm test` på varje PR och vid push till `main`. Workflow-filen påverkar inte
  sajten (laddas aldrig av `index.html`); sajten är fortsatt beroendefri.

## Vad senaste sessionen gjorde
- **Granskade + mergade roadmap-steg 4 (Kapitel 3 "Robotar i världen").** PR #9 granskad
  (ren additiv datapåbyggnad, schema ok, säker robotfakta), `node --check` + `npm test` gröna,
  squash-mergad till `main` som commit `d466926`.
- **Byggde ut testverktyget så det genomklickar ALLA riktiga `content/kapitel-*.js`.**
  `test/clickthrough.test.js` läser nu in alla kapitelfiler i `content/` (sorterat på nummer),
  laddar dem i jsdom och kör samma datadrivna genomklick per kapitel (gating, fel→rätt, blandad
  ordning, samt rätt avslutslänk: "Nästa kapitel" för alla utom det sista, "Till kapitelöversikt"
  för det sista). Det syntetiska inline-kapitlet finns kvar för routing-/rail-testerna.
- **La till GitHub Actions-CI** (`.github/workflows/ci.yml`): `npm install` → `node --check`
  (renderaren + alla `content/kapitel-*.js`) → `npm test`, på `pull_request` och push till `main`.
- Rörde INTE renderaren (`js/app.js`), datamodellen, CSS:en eller innehållet – bara testfilen,
  CI-workflowen samt dokumentationen (`CLAUDE.md` + `.cursorrules` i synk).
- Verifierade: `node --check js/app.js` ✓, `node --check test/clickthrough.test.js` ✓,
  `npm test` ✓ (**10 tester**). Bekräftade fail-loud: en tillfällig `correctAnswer` utanför
  index i `content/kapitel-3.js` fick testet att faila, och grönt igen efter återställning.

## Beslut (varför)
- **Höll testet datadrivet, inga hårdkodade svar.** Det läser `correctAnswer` ur datan och
  räknar ut förväntad avslutslänk ur kapitelordningen → nya kapitelfiler täcks AUTOMATISKT
  utan teständring (matchar intentionen i `CLAUDE.md`).
- **Behöll det syntetiska kapitlet** för routing-/landningsvy-/rail-testerna: de behöver
  minimal, kontrollerad data och ska inte bero på hur många riktiga kapitel som finns.
- **Default-läget oförändrat.** Det nya `allContent`-läget är opt-in i `bootstrap`, så de
  befintliga testerna (som antar exakt 2 kapitel) påverkas inte.
- **Manuell `file://`-koll smalnas av:** behövs nu främst för PR:ar som rör `js/app.js`/
  `style.css` (logik/visuellt), inte för rent innehåll – det täcker `npm test` nu.

## Varningar / blockers
- `npm test` täcker logik + datakorrekthet, INTE det visuella. CSS/layout (responsivitet,
  ikonfeedback, fokusring) måste fortfarande ögongranskas via `file://` i Chrome.
- `file://` ger en ofarlig konsolvarning ("Unsafe attempt to load URL") – inga nätverksanrop.
- `node_modules/` committas aldrig: kör `npm install` en gång innan `npm test`. (I denna
  Cloud-miljö saknades `node_modules/` initialt trots install-skriptet – kör `npm install`.)
- Denna körning gjordes som Cloud-agent → arbetet ligger på
  `claude/test-real-kapitel-clickthrough` med PR i stället för direkt push till `main`
  (miljön tillåter inte push till `main`). PR är vägen in till `main` här.

## Nästa steg (exakt ETT)
Roadmap-steg 5 (Nice-to-have) – välj ETT:
- **Framstegssparande** via `localStorage`: kom ihåg klarade steg/kapitel. Måste degradera
  snällt på `file://` (där `localStorage` kan saknas/blockeras) och inte röra datamodellen i
  onödan. — **Opus** (rör renderings-/state-logik + edge-cases).
- **Lätt ljud/animation** enligt `docs/design.md`: liten feedback vid rätt svar/kapitelklart.
  A11y: respektera `prefers-reduced-motion`, inget ljud-autospel. — **enklare modell** när
  scopet är låst (mest CSS/asset), men låt Opus granska a11y.

(Mindre, valfritt tillägg om man vill: en schema-validator – `correctAnswer` i range,
`ordering` = permutation, `options` finns – som CI kan köra. Enklare modell.)

## Modellrekommendation för nästa steg
- Framstegssparande (`localStorage`) → **Opus** (logik + edge-case-bedömning på `file://`).
- Ljud/animation → **enklare modell (Sonnet)** när scope är låst; Opus granskar a11y.

## Copy-paste för nästa session
```text
Du tar över samordnar-/byggrollen för "Edison Hemguide" (repo Jaloopo/Robot-Academy, main).
Läs FÖRST: CLAUDE.md, docs/plan.md, docs/design.md, docs/roadmap.md, docs/status.md.
Ange kort nuläge + din planerade åtgärd innan du kör verktyg.

UPPGIFT (ett steg): Roadmap-steg 5 – Nice-to-have. Välj EN av:
- Framstegssparande via localStorage (kom ihåg klarade steg/kapitel). Måste degradera snällt på
  file:// (localStorage kan saknas/blockeras) och inte röra datamodellen i onödan. ELLER
- Lätt ljud/animation enligt docs/design.md (feedback vid rätt svar/kapitelklart). A11y:
  prefers-reduced-motion, inget ljud-autospel.
Bestäm scope/form först. Endast statisk HTML+CSS+vanilla JS, ingen build, funkar på file:// och
GitHub Pages. Inga ramverk/CDN/externa fonter/nätverksanrop. All UI-text på svenska.
OBS: npm test genomklickar nu ALLA riktiga content/kapitel-*.js automatiskt, och GitHub Actions-CI
(.github/workflows/ci.yml) kör node --check + npm test på varje PR – håll den grön.

VERIFIERA: node --check js/app.js, npm test (kör npm install först), samt genomklick via file://
i Chrome (landningsvy + berört flöde) – särskilt vid CSS/logik-ändring.

AVSLUTA enligt handoff: uppdatera docs/status.md (nuläge, gjort, beslut, varningar, nästa steg,
modellrek) + bocka av i docs/roadmap.md, committa och pusha. I Cloud: jobba på en branch och
öppna/uppdatera PR. Skriv en ny copy-paste för nästa session i status.md.
```
