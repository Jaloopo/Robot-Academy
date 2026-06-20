# Status & handoff – Edison Hemguide

Levande arbetsdokument. **Uppdateras i slutet av varje session.** Nästa session läser detta
först (efter `CLAUDE.md`, `docs/plan.md`, `docs/design.md`, `docs/roadmap.md`), gör EXAKT
ett roadmap-steg, uppdaterar detta dokument + roadmap, committar till `main`, och skriver
en ny copy-paste längst ned.

Senast uppdaterad: 2026-06-20 · roadmap-steg 3 (Kapitel 2-innehåll, EdBlocks / första programmet)

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
  9 tester). `jsdom` är DEV-beroende; `node_modules/` är git-ignorerat. Sajten själv är
  fortsatt beroendefri.

## Vad senaste sessionen gjorde
- **Genomförde roadmap-steg 3 (Kapitel 2-innehåll).** Skapade `content/kapitel-2.js`
  (`window.KAPITEL["kapitel-2"] = { id, titel, steps: [...] }`) enligt datamodellen i
  `CLAUDE.md` och la till `<script src="./content/kapitel-2.js"></script>` i `index.html`
  FÖRE `js/app.js`.
- Innehållet: max 2–3 meningar per steg, tilltalar barnet direkt, korta vuxen-tips via
  `role:"adult"`. Edison-fakta omskrivet med egna ord. Osäkra appspecifika detaljer (exakta
  blocknamn/placering) flaggade som "att verifiera" i ett vuxen-tips i stället för att
  påstås som sanning.
- Rörde INTE renderaren (`js/app.js`), datamodellen, CSS:en eller testfilen.
- Verifierade: `node --check js/app.js` ✓, `node --check content/kapitel-2.js` ✓,
  `npm install && npm test` ✓ (9 tester), samt Chrome `file://`-genomklick ✓ av kapitel 2
  (gating, fel→rätt-feedback, blandad ordning + "Börja om", avslutslänk "Till
  kapitelöversikt"). Inga konsolfel (bara den ofarliga `file://`-varningen).

## Beslut (varför)
- **Edison-fakta flaggas, hittas aldrig på:** själva block-appens exakta menyer/blocknamn
  varierar mellan versioner, så det ligger som "att verifiera" i ett vuxen-tips. Det barnet
  läser hålls på säker, generell nivå ("ett block som får Edison att köra framåt").
- **Första programmet = kör framåt:** enklast möjliga, bygger på fakta som redan etablerats
  i kapitel 1 (Edison kan köra framåt). Inga nya, osäkra robotpåståenden införs.
- **WebUSB-tipset till den vuxne** (Chrome/Edge/Opera, inte Safari/Firefox; USB-sladd)
  upprepar bara fakta som redan står i `CLAUDE.md`/kapitel 1 – inga nya antaganden.
- **Ren datapåbyggnad:** nytt kapitel = ny `content/*.js` + en script-rad, exakt enligt
  mönstret. Ingen ändring i logik/CSS behövdes, så inga regressioner kunde införas.

## Varningar / blockers
- `test/clickthrough.test.js` använder fortfarande ett **syntetiskt** testkapitel 2 i
  jsdom (det laddar bara `content/kapitel-1.js` + sin egen inline-data). Den verkliga
  `content/kapitel-2.js` testas alltså inte av `npm test` – den verifierades i stället via
  `node --check` + manuell `file://`-genomklick. Det riktiga kapitel 2 är nu sista kapitlet,
  vilket matchar testets antagande (sista kapitlet → "Till kapitelöversikt").
- `file://` ger en ofarlig konsolvarning ("Unsafe attempt to load URL") – inga nätverksanrop.
- `node_modules/` committas aldrig: kör `npm install` en gång innan `npm test`.
- Denna körning gjordes som Cloud-agent → arbetet ligger på
  `cursor/kapitel-2-edblocks-db77` med draft-PR (#8) i stället för direkt push till `main`
  (miljön tillåter inte push till `main`). PR är vägen in till `main` här.

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

VERIFIERA: node --check js/app.js, npm test (kör npm install först), samt genomklick via
file:// i Chrome (landningsvy + nya innehållet, gating/avslutslänkar om det är ett kapitel).

AVSLUTA enligt handoff: uppdatera docs/status.md (nuläge, gjort, beslut, varningar, nästa
steg, modellrek) + bocka av roadmap-steg 4 i docs/roadmap.md, committa och pusha. I Cloud:
jobba på `cursor/...`-branch och öppna/uppdatera PR. Skriv en ny copy-paste för nästa session
i status.md.
```
