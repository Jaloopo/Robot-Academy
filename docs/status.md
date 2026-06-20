# Status & handoff – Edison Hemguide

Levande arbetsdokument. **Uppdateras i slutet av varje session.** Nästa session läser detta
först (efter `CLAUDE.md`, `docs/plan.md`, `docs/design.md`, `docs/roadmap.md`), gör EXAKT
ett roadmap-steg, uppdaterar detta dokument + roadmap, committar till `main`, och skriver
en ny copy-paste längst ned.

Senast uppdaterad: 2026-06-20 · roadmap-steg 4 (Explore-fördjupning, Kapitel 3 "Robotar i världen")

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
  9 tester). `jsdom` är DEV-beroende; `node_modules/` är git-ignorerat. Sajten själv är
  fortsatt beroendefri.

## Vad senaste sessionen gjorde
- **Genomförde roadmap-steg 4 (Explore-fördjupning).** Skapade `content/kapitel-3.js`
  (`window.KAPITEL["kapitel-3"] = { id, titel, steps: [...] }`) enligt datamodellen i
  `CLAUDE.md` och la till `<script src="./content/kapitel-3.js"></script>` i `index.html`
  FÖRE `js/app.js`.
- Innehållet: max 2–3 meningar per steg, tilltalar barnet direkt, korta vuxen-tips via
  `role:"adult"`. Robotfakta (robotarmar i fabriker, robotdammsugare/Roomba, drönare) hålls
  säker/allmängiltig och omskriven med egna ord. Kopplas till Edison: känna av → följa
  program → göra något.
- Rörde INTE renderaren (`js/app.js`), datamodellen, CSS:en eller testfilen.
- Verifierade: `node --check js/app.js` ✓, `node --check content/kapitel-3.js` ✓,
  `npm install && npm test` ✓ (9 tester), samt Chrome `file://`-genomklick ✓ av kapitel 3
  (gating, fel→rätt-feedback, blandad ordning, avslutslänk "Till kapitelöversikt"). Inga
  konsolfel (bara den ofarliga `file://`-varningen).

## Beslut (varför)
- **Formbeslut: eget kapitel med BEFINTLIGA stegtyper, inga bilder/länkar.** Renderaren
  escapar all text (`escapeHtml`), så `<img>`/`<a>` skulle inte renderas som markup utan en
  logikändring. Det strider mot "rör inte logiken i onödan", en-PR-disciplinen och
  beroendefriheten. Tillåtelsen "externa länkar ok / bilder lokala" är en tillåtelse, inte
  ett krav. Lokala bilder kan bli ett eget, additivt roadmap-steg senare (ny additiv
  stegtyp/renderarstöd + lokala assets, separat PR).
- **Ren datapåbyggnad:** nytt kapitel = ny `content/*.js` + en script-rad, exakt enligt
  mönstret. Ingen ändring i logik/CSS behövdes, så inga regressioner kunde införas.
- **Edison-fakta hittas aldrig på:** robotexemplen hålls på säker, allmän nivå (vad en
  robotarm/robotdammsugare/drönare gör generellt). Ett vuxen-tips påminner om att allt som
  rör sig inte är en robot, utan att påstå något osäkert.

## Varningar / blockers
- `test/clickthrough.test.js` laddar fortfarande bara `content/kapitel-1.js` + ett
  **syntetiskt** inline-testkapitel 2 i jsdom. De verkliga `content/kapitel-2.js` och
  `content/kapitel-3.js` testas alltså inte av `npm test` – de verifieras i stället via
  `node --check` + manuell `file://`-genomklick. (Möjlig framtida förbättring: låt testet
  även göra ett dataladdande genomklick av de riktiga kapitelfilerna.)
- `file://` ger en ofarlig konsolvarning ("Unsafe attempt to load URL") – inga nätverksanrop.
- `node_modules/` committas aldrig: kör `npm install` en gång innan `npm test`. (I denna
  Cloud-miljö saknades `node_modules/` initialt trots install-skriptet – kör `npm install`.)
- Denna körning gjordes som Cloud-agent → arbetet ligger på
  `cursor/kapitel-3-robottyper-ef3e` med draft-PR (#9) i stället för direkt push till `main`
  (miljön tillåter inte push till `main`). PR är vägen in till `main` här.

## Nästa steg (exakt ETT)
Roadmap-steg 5: **Nice-to-have** – framstegssparande (`localStorage`; opålitligt på `file://`,
så det måste degradera snällt) ELLER lätt ljud/animation. (Den committade dev-testharnessen är
redan KLAR.) Bestäm form/scope först; håll dig till beroendefri statisk HTML+CSS+JS och rör inte
datamodellen i onödan. Alternativt: bygg ut testet så att det även genomklickar de RIKTIGA
`content/kapitel-2.js`/`kapitel-3.js`.

## Modellrekommendation för nästa steg
- `localStorage`-sparande rör renderings-/state-logik och måste degradera snällt på `file://`
  → **Opus** (logik + edge-case-bedömning).
- Ljud/animation är mest CSS/asset-arbete enligt design → kan göras av **enklare modell** när
  scope är låst, men a11y (`prefers-reduced-motion`, inget ljud-autospel) bör Opus granska.

## Copy-paste för nästa session
```text
Du tar över samordnar-/byggrollen för "Edison Hemguide" (repo Jaloopo/Robot-Academy, main).
Läs FÖRST: CLAUDE.md, docs/plan.md, docs/design.md, docs/roadmap.md, docs/status.md.
Ange kort nuläge + din planerade åtgärd innan du kör verktyg.

UPPGIFT (ett steg): Roadmap-steg 5 – Nice-to-have. Välj EN av:
- Framstegssparande via localStorage (måste degradera snällt på file://; rör inte datamodellen
  i onödan), ELLER
- Lätt ljud/animation enligt docs/design.md (a11y: prefers-reduced-motion, inget ljud-autospel),
  ELLER
- Bygg ut test/clickthrough.test.js så att det även genomklickar de RIKTIGA content/kapitel-2.js
  och content/kapitel-3.js (inte bara syntetiskt inline-kapitel).
Bestäm scope/form först. Endast statisk HTML+CSS+vanilla JS, ingen build, funkar på file:// och
GitHub Pages. Inga ramverk/CDN/externa fonter/nätverksanrop. All UI-text på svenska.

VERIFIERA: node --check js/app.js, npm test (kör npm install först), samt genomklick via file://
i Chrome (landningsvy + berört flöde).

AVSLUTA enligt handoff: uppdatera docs/status.md (nuläge, gjort, beslut, varningar, nästa steg,
modellrek) + bocka av roadmap-steg 5 i docs/roadmap.md, committa och pusha. I Cloud: jobba på
`cursor/...`-branch och öppna/uppdatera PR. Skriv en ny copy-paste för nästa session i status.md.
```
