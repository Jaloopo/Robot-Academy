# Status & handoff – Edison Hemguide

Levande arbetsdokument. **Uppdateras i slutet av varje session.** Nästa session läser detta
först (efter `CLAUDE.md`, `docs/plan.md`, `docs/design.md`, `docs/roadmap.md`), gör EXAKT
ett roadmap-steg, uppdaterar detta dokument + roadmap, committar till `main`, och skriver
en ny copy-paste längst ned.

Senast uppdaterad: 2026-06-20 · roadmap-steg 3 mergad (#8) + datadriven testharness

## Nuläge (fakta)
- Kapitel 1 komplett: text, vuxen-tips, flerval, ordning – med gating, snäll feedback, a11y.
- **Kapitel 2 "Ditt första program" är nu byggt** som innehåll i `content/kapitel-2.js`
  (11 steg: text + vuxen-tips, en flervalsfråga om körordning, en ordningsfråga
  bygg→skicka→play). Laddas via en ny `<script>`-rad i `index.html` före `js/app.js`.
- Designsystem + mobil + desktop-ark (≥720 px) + chapter-rail (≥900 px) + tunn
  framstegsstapel ligger på `main`.
- `js/app.js` väljer kapitel via `?kapitel=N`; utan query visas en landningsvy som listar
  alla laddade kapitel. Landningsvyn listar nu både kapitel 1 och 2, och kapitel 2:s
  sista steg länkar till "Till kapitelöversikt" (det är sista kapitlet).
- Committat testverktyg: `npm test` kör en jsdom-genomklick (`test/clickthrough.test.js`,
  nu **10 tester**). Genomklicket är **datadrivet**: det upptäcker och klickar igenom varje
  riktig `content/kapitel-*.js` (gating, fel→rätt, blandad ordning + "Börja om", avslutslänk),
  så nya kapitel testas automatiskt. `jsdom` är DEV-beroende; `node_modules/` är git-ignorerat.
  Sajten själv är fortsatt beroendefri.

## Vad senaste sessionen gjorde
- **Granskade och mergade roadmap-steg 3 (Kapitel 2-innehåll), PR #8 → `main`.** Verifierade
  datamodellen (rätt `correctAnswer`-index/array, `adult`-steg utan "Vuxen:"), reglerna
  (svenska, ≤2–3 meningar/steg, WebUSB-tipset enligt `CLAUDE.md`, osäkra blocknamn flaggade
  "att verifiera") och att logiken var orörd. Körde `node --check`, `npm test` (grönt) och
  laddade den **riktiga** `content/kapitel-2.js` genom den **riktiga** renderaren i jsdom
  (monterar, 11 steg, datamodell giltig). Squash-mergad i samma `(#N)`-stil.
- **Förbättrade testharnessen så den blev datadriven** (`test/clickthrough.test.js`):
  `bootstrap()` tar nu en `contentFiles`-lista; ett nytt test upptäcker alla riktiga
  `content/kapitel-*.js`, laddar dem och klickar igenom vart och ett mot renderaren och
  kontrollerar avslutslänken utifrån kapitlens sorterade ordning. Därmed testas nytt
  innehåll automatiskt – den tidigare luckan (att `npm test` bara körde syntetiskt kapitel 2)
  är stängd. De befintliga mekanik-testerna (routing/landning/rail) använder fortfarande ett
  syntetiskt testkapitel för kontrollerad data.
- Rörde INTE renderaren (`js/app.js`), datamodellen, CSS:en eller innehållet – bara testfilen
  och docs.
- Verifierade: `node --check js/app.js` ✓, `node --check test/clickthrough.test.js` ✓,
  `npm install && npm test` ✓ (**10 tester**, inkl. det nya datadrivna genomklicket av
  kapitel 1 + 2).

## Beslut (varför)
- **Datadrivet genomklick framför fler hårdkodade tester:** harnessen upptäcker kapitelfiler
  via filsystemet och läser `correctAnswer` ur datan, så den skalar utan ändring och blir
  skyddsräcket som låter en enklare/billigare modell fylla nya kapitel och självverifiera mot
  specen (mindre behov av manuella `file://`-inspelningar för innehålls-PR:er).
- **Befintliga mekanik-tester behåller syntetiskt testkapitel:** routing/landning/rail vill ha
  kontrollerad data (exakt 2 kapitel, kända titlar) – det är medvetet skilt från det
  datadrivna innehålls-genomklicket som kör de riktiga filerna.
- **Bara testfilen + docs rördes** (renderare/datamodell/CSS/innehåll orörda) → inga
  regressioner i sajten kunde införas.
- Kvar sedan steg 3: Edison-fakta hittas aldrig på (osäkra blocknamn ligger som "att
  verifiera"), första programmet = kör framåt (bygger bara på redan etablerad kapitel 1-fakta).

## Varningar / blockers
- Den tidigare luckan (att `npm test` bara körde syntetiskt kapitel 2) är **stängd** – det
  datadrivna genomklicket kör nu de riktiga `content/kapitel-*.js`. Verifiera ändå alltid även
  `file://` i Chrome för det visuella (CSS/layout testas inte i jsdom).
- Det datadrivna testet antar standard-stegtyperna (`text`, `question_single_choice`,
  `ordering`) och avslutslänk-logiken i renderaren. En framtida ny stegtyp kräver att
  `completeChapter()` lär sig hantera den.
- `file://` ger en ofarlig konsolvarning ("Unsafe attempt to load URL") – inga nätverksanrop.
- `node_modules/` committas aldrig: kör `npm install` en gång innan `npm test`.
- Denna körning gjordes som Cloud-agent → arbetet ligger på
  `claude/chapter-2-verify-next-r8bkyt` (miljön tillåter inte push direkt till `main`). PR #8
  (kapitel 2) är redan mergad till `main`; harness-/docs-ändringen pushas på branchen och
  mergas in på samma sätt.

## Nästa steg (exakt ETT)
Roadmap-steg 4: **"Explore"-fördjupning** – korta avsnitt/länkar om robottyper (robotarmar,
Roomba m.m.). Externa länkar ok, men bilder MÅSTE vara lokala assets (inget CDN) och all
fakta skrivs om med egna ord. Bestäm formen först: eget kapitel (`content/kapitel-N.js`) eller
en separat sektion – håll det i linje med datamodellen och renderaren (rör inte logiken i
onödan). Hitta aldrig på fakta; osäkert flaggas "att verifiera".

## Modellrekommendation för nästa steg
"Explore" är innehåll med faktaomdöme + ev. ett litet format-/UX-beslut (hur länkar/bilder
ska visas utan att bryta `file://`/beroendefriheten) → **Opus** för författande, faktakänsla
och designavvägning. Är formen redan färdigspecad och bara en kapitelfil ska fyllas i kan en
enklare modell göra mekaniken.

## Copy-paste för nästa session
```text
Du tar över samordnar-/byggrollen för "Edison Hemguide" (repo Jaloopo/Robot-Academy, main).
Läs FÖRST: CLAUDE.md, docs/plan.md, docs/design.md, docs/roadmap.md, docs/status.md.
Ange kort nuläge + din planerade åtgärd innan du kör verktyg.

UPPGIFT (ett steg): Roadmap-steg 4 – "Explore"-fördjupning om robottyper (robotarmar,
Roomba m.m.).
- Bestäm form först: eget kapitel (content/kapitel-N.js + <script>-rad i index.html före
  js/app.js, enligt datamodellen i CLAUDE.md) eller separat sektion. Håll dig till
  renderaren/datamodellen – rör inte logiken i onödan.
- Externa länkar ok; bilder MÅSTE vara lokala assets (inget CDN/fetch). All fakta omskriven
  med egna ord; hitta ALDRIG på fakta, flagga osäkert som "att verifiera".
- Max 2–3 meningar per steg, tilltala barnet direkt, korta vuxen-tips via role:"adult".

VERIFIERA: node --check js/app.js, npm test (kör npm install först) – det datadrivna
genomklicket täcker automatiskt nya content/kapitel-*.js – samt genomklick via file:// i
Chrome för det visuella (landningsvy + nya innehållet, gating/avslutslänkar om det är ett kapitel).

AVSLUTA enligt handoff: uppdatera docs/status.md (nuläge, gjort, beslut, varningar, nästa
steg, modellrek) + bocka av roadmap-steg 4 i docs/roadmap.md, committa och pusha. I Cloud:
jobba på `cursor/...`-branch och öppna/uppdatera PR. Skriv en ny copy-paste för nästa session
i status.md.
```
