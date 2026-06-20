# Status & handoff – Edison Hemguide

Levande arbetsdokument. **Uppdateras i slutet av varje session.** Nästa session läser detta
först (efter `CLAUDE.md`, `docs/plan.md`, `docs/design.md`, `docs/roadmap.md`), gör EXAKT
ett roadmap-steg, uppdaterar detta dokument + roadmap, committar till `main`, och skriver
en ny copy-paste längst ned.

Senast uppdaterad: 2026-06-20 · roadmap-steg 2 (Layout B / chapter-rail ≥900 px)

## Nuläge (fakta)
- Kapitel 1 komplett: text, vuxen-tips, flerval, ordning – med gating, snäll feedback, a11y.
- Designsystem + mobil + desktop-ark (≥720 px) + tunn framstegsstapel ligger på `main`.
- Innehåll i `content/kapitel-1.js` (`window.KAPITEL`). `js/app.js` väljer kapitel via
  `?kapitel=N`; utan query visas en landningsvy som listar alla laddade kapitel.
- **Layout B är nu byggd:** på desktop ≥900 px renderar kapitelvyn en kontextspalt
  `<aside class="chapter-rail">` (kapitellista, aktivt kapitel markerat + dess "Steg X av N",
  "Alla kapitel"-länk). Landningsvyn förblir en kolumn; mobil + 720 px-arket är orört.
- Committat testverktyg: `npm test` kör en jsdom-genomklick (`test/clickthrough.test.js`,
  nu 9 tester). `jsdom` är DEV-beroende; `node_modules/` är git-ignorerat. Sajten själv är
  fortsatt beroendefri.

## Vad senaste sessionen gjorde
- **Genomförde roadmap-steg 2 (Layout B / chapter-rail).** I `js/app.js`: ny
  `chapterRailHtml()`, steginnehållet wrappat i `.step-main` och `#app` får klassen
  `has-rail` i kapitelvyn (landningsvyn nollställer klassen → en kolumn).
- I `style.css`: ny additiv `@media (min-width: 900px)` med tvåkolumns-grid
  (`#app.has-rail`) + rail-stilar (sticky spalt, kapitellänkar, aktiv markering). Basregeln
  `.chapter-rail { display: none }` håller railen dold under 900 px. Mobilens och 720 px-blockets
  värden ändrades inte.
- Lade till två tester i `test/clickthrough.test.js`: railen finns i kapitelvyn, markerar
  aktivt kapitel + progress och dubblerar inte stegnavigeringen; railen finns inte på landningsvyn.
- Uppdaterade `docs/design.md` (Layout B markerad som IMPLEMENTERAD med CSS-deltat).
- Verifierade: `node --check js/app.js` ✓, `npm install && npm test` ✓ (9 tester), samt
  Chrome `file://`-genomklick ✓ i både mobilbredd (~400 px, ingen rail) och desktop ≥900 px
  (rail synlig, progress i synk med headern).

## Beslut (varför)
- **Railen är kontext, inte nav:** den listar kapitlen och visar var man är, men den primära
  steg-navigeringen (Föregående/Nästa) ligger kvar i `.nav` och dubbleras aldrig.
- **Klass-toggle på `#app` (`has-rail`)** i stället för att lägga grid direkt på `#app`: så
  blir bara kapitelvyn tvåkolumns medan landningsvyn (egen kapitellista) förblir en kolumn –
  ingen dubblerad kapitellista och ingen trasig grid-layout med lösa barn.
- **Brytpunkt 900 px** (inte 720 px) enligt roadmap: arket (≥720 px) lämnas helt orört och
  railen läggs additivt ovanpå först när det finns horisontellt utrymme.
- **Inga drag-and-drop / inga nya beroenden / ingen fetch:** railen är ren HTML+CSS i samma
  beroendefria mönster; `file://` laddar fortfarande bara lokala filer.

## Varningar / blockers
- Bara kapitel 1 finns som riktigt innehåll. Railen listar därför oftast bara ett kapitel
  (plus testets syntetiska kapitel 2 i jsdom). Den ger ändå kontext + progress.
- `file://` ger en ofarlig konsolvarning ("Unsafe attempt to load URL") – inga nätverksanrop
  görs (bara `index.html` + `style.css` laddas lokalt).
- `node_modules/` committas aldrig: kör `npm install` en gång innan `npm test`.
- Denna körning gjordes som Cloud-agent → arbetet ligger på
  `cursor/layout-b-chapter-rail-cf87` med draft-PR (#7) i stället för direkt push till `main`
  (miljön tillåter inte push till `main`). PR är vägen in till `main` här.

## Nästa steg (exakt ETT)
Roadmap-steg 3: **Kapitel 2-innehåll** (EdBlocks / första programmet) i en ny
`content/kapitel-2.js` enligt datamodellen + en ny `<script>`-rad i `index.html` före
`js/app.js`. Pedagogik enligt `docs/plan.md`; Edison-fakta skrivs om med egna ord och allt
osäkert flaggas "att verifiera" (hitta aldrig på fakta). Rör inte renderaren/datamodellen.

## Modellrekommendation för nästa steg
Kapitel 2 är innehåll med pedagogik + Edison-faktakänsla → **Opus** för författande och
faktabedömning. Själva filtillägget är mekaniskt och kan annars köras i en enklare modell om
texten är färdigspecad.

## Copy-paste för nästa session
```text
Du tar över samordnar-/byggrollen för "Edison Hemguide" (repo Jaloopo/Robot-Academy, main).
Läs FÖRST: CLAUDE.md, docs/plan.md, docs/design.md, docs/roadmap.md, docs/status.md.
Ange kort nuläge + din planerade åtgärd innan du kör verktyg.

UPPGIFT (ett steg): Roadmap-steg 3 – Kapitel 2-innehåll (EdBlocks / första programmet).
- Skapa content/kapitel-2.js (window.KAPITEL["kapitel-2"] = { id, titel, steps: [...] })
  enligt datamodellen i CLAUDE.md, och lägg till en <script src="./content/kapitel-2.js"></script>
  i index.html FÖRE js/app.js.
- Max 2–3 meningar per steg, tilltala barnet direkt, korta vuxen-tips via role:"adult".
- Hitta ALDRIG på Edison-fakta: skriv om med egna ord, flagga osäkert som "att verifiera".
- Rör inte renderaren (js/app.js), datamodellen eller mobilens CSS.

VERIFIERA: node --check js/app.js, npm test (kör npm install först), samt genomklick via
file:// i Chrome (kapitel 1 + nytt kapitel 2, landningsvy och avslutslänkar).

AVSLUTA enligt handoff: uppdatera docs/status.md (nuläge, gjort, beslut, varningar, nästa
steg, modellrek) + bocka av roadmap-steg 3 i docs/roadmap.md, committa och pusha. I Cloud:
jobba på `cursor/...`-branch och öppna/uppdatera PR. Skriv en ny copy-paste för nästa session
i status.md.
```
