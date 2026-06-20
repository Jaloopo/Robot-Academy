# Status & handoff – Edison Hemguide

Levande arbetsdokument. **Uppdateras i slutet av varje session.** Nästa session läser detta
först (efter `CLAUDE.md`, `docs/plan.md`, `docs/design.md`, `docs/roadmap.md`), gör EXAKT
ett roadmap-steg, uppdaterar detta dokument + roadmap, committar till `main`, och skriver
en ny copy-paste längst ned.

Senast uppdaterad: 2026-06-20 · framstegssparande via localStorage (roadmap-steg 5)

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
- **Framstegssparande via `localStorage` ligger nu i `js/app.js`** (roadmap-steg 5, första
  alternativet). Säker wrapper (feature-detect + `try/catch`) → tyst no-op när storage saknas/
  blockeras. Sparar besvarade frågor + senaste steg per kapitel och återupptar vid omladdning;
  sparade rätta svar visas gröna. Landningsvyn märker `Klart`/`Påbörjat`, rail (≥900 px) märker
  `Klart`, "Börja om kapitlet" nollställer. Datamodellen orörd. `npm test` är nu **14 tester**.

## Vad senaste sessionen gjorde
- **Implementerade roadmap-steg 5 – framstegssparande via `localStorage`.** Allt i `js/app.js`
  + `style.css` + `test/clickthrough.test.js` (datamodell/innehåll orört):
  - Säker storage-wrapper (`getStorage`, cachas; `try/catch` runt både `root.localStorage`-åtkomst
    OCH `setItem`-prob). Saknas/blockeras storage → `null` → all persistens blir no-op.
  - `loadChapterProgress`/`saveChapterProgress`/`clearChapterProgress` med nyckel
    `edison-hemguide:<kapitel-id>` och en versionerad payload `{ v, current, completed, steps[] }`.
    Validerar `v` + att `steps.length` matchar innehållet (ändrat kapitel → stale-data kastas).
  - I kapitelvyn: `restoreProgress()` återställer `done`/`chosen`/`picks` + `current`-steg;
    `persistProgress()` körs i varje `render()`. Ordering-displayordningen sparas INTE (blandas om
    varje gång; picks mappar på optionsindex så badges stämmer ändå).
  - Landningsvy + rail: `chapterProgressStatus()` ger `done`/`started`/`none` → `Klart`/`Påbörjat`.
  - "Börja om kapitlet" (`#btn-reset-chapter`) → `resetChapter()` rensar storage + nollställer state.
  - CSS additivt: `.chapter-status(--done/--started)`, `.linklike`/`.chapter-reset`, `.rail-status`.
- **La till 4 persistens-tester** (totalt **14**, alla gröna): sparar/återupptar efter
  (simulerad) omladdning, `Klart`/`Påbörjat`-märken på landningsvyn, "Börja om kapitlet"-reset,
  samt graceful degradation på `file://` (jsdom saknar `localStorage` där). Testet fick
  `bootstrap({url, prepare})` + en `reload()`-hjälpare (re-eval i samma fönster).
- **Höll `CLAUDE.md`/`.cursorrules` orörda** (ingen regeländring behövdes).
- Verifierade: `node --check js/app.js` ✓, `node --check test/clickthrough.test.js` ✓,
  `npm test` ✓ (**14 tester**), och **`file://`-genomklick i riktiga Chrome**: bekräftat att
  progress sparas/återupptas över reload, `Påbörjat`→`Klart`-märken, och reset – med video.

## Beslut (varför)
- **`localStorage` framför ljud/animation.** Större pedagogiskt värde (barn kan fortsätta där de
  slutade) och matchar Opus-rollen (state-logik + edge-cases på `file://`).
- **Säker wrapper är obligatorisk:** jsdom på `file://` saknar `localStorage` HELT (kastar vid
  åtkomst). Verifierat empiriskt. Riktiga Chrome på `file://` sparar dock – så feature ger värde
  där, och degraderar tyst där det inte går. Inga nätverksanrop, inget nytt beroende.
- **Versionerad + längd-validerad payload:** framtida kapiteländringar ska aldrig felmappa gammalt
  framsteg – hellre börja om än visa fel "rätt svar".
- **Sparar i varje `render()`:** enkelt och robust; payloaden är liten. Reset skriver en färsk
  (tom) payload, så `chapterProgressStatus` blir `none` igen (testet kollar status, inte `null`).
- **Datadrivet test behållet:** nya persistens-tester använder samma riktiga renderare/innehåll;
  `prepare`-hooken seedar storage med EN payload som producerats av en riktig genomklick (ingen
  hårdkodning av lagringsformatet).

## Varningar / blockers
- `npm test` täcker logik + datakorrekthet, INTE det visuella. CSS/layout måste fortfarande
  ögongranskas via `file://` i Chrome.
- **`localStorage` på `file://` är browserberoende.** Det fungerade i denna Chrome, men kan vara
  blockerat i andra uppsättningar/privat läge → då degraderar appen tyst (ingen sparning, inga
  badges, men full funktion). På GitHub Pages (http(s)) är det pålitligt.
- `file://` ger en ofarlig konsolvarning ("Unsafe attempt to load URL") – inga nätverksanrop.
- `node_modules/` committas aldrig: kör `npm install` en gång innan `npm test`. (I denna
  Cloud-miljö installeras det via setup-skript; kör annars `npm install`.)
- Denna körning gjordes som Cloud-agent → arbetet ligger på
  `cursor/localstorage-progress-6c47` med **PR #11** i stället för direkt push till `main`.
  PR är vägen in till `main` här.

## Nästa steg (exakt ETT)
Roadmap-steg 5 har nu sitt `localStorage`-alternativ KLART. Kvar av "nice-to-have":
- **Lätt ljud/animation** enligt `docs/design.md`: liten feedback vid rätt svar/kapitelklart.
  A11y: respektera `prefers-reduced-motion`, inget ljud-autospel. — **enklare modell** när
  scopet är låst (mest CSS/asset), men låt Opus granska a11y. (Obs: en maskot-nudge-animation
  vid rätt svar finns redan; detta steg gäller ev. ljud och/eller en kapitelklart-animation.)

(Mindre, valfritt: en schema-validator i CI – `correctAnswer` i range, `ordering` = permutation,
`options` finns. Enklare modell.)

## Modellrekommendation för nästa steg
- Ljud/animation → **enklare modell (Sonnet)** när scope är låst; Opus granskar a11y.

## Copy-paste för nästa session
```text
Du tar över samordnar-/byggrollen för "Edison Hemguide" (repo Jaloopo/Robot-Academy, main).
Läs FÖRST: CLAUDE.md, docs/plan.md, docs/design.md, docs/roadmap.md, docs/status.md.
Ange kort nuläge + din planerade åtgärd innan du kör verktyg.

UPPGIFT (ett steg): Roadmap-steg 5 är delvis klart – framstegssparande via localStorage ligger nu
i js/app.js (se status). Kvar av nice-to-have: lätt ljud/animation enligt docs/design.md
(liten feedback vid rätt svar/kapitelklart). A11y: respektera prefers-reduced-motion, inget
ljud-autospel. En maskot-nudge-animation finns redan vid rätt svar – bestäm scope (ljud? och/eller
en kapitelklart-animation?) FÖRST. Endast statisk HTML+CSS+vanilla JS, ingen build, funkar på
file:// och GitHub Pages. Inga ramverk/CDN/externa fonter/nätverksanrop. All UI-text på svenska.
OBS: npm test genomklickar ALLA content/kapitel-*.js automatiskt och täcker nu även
framstegssparandet (14 tester); GitHub Actions-CI kör node --check + npm test på varje PR – håll grön.

VERIFIERA: node --check js/app.js, npm test (kör npm install först), samt genomklick via file://
i Chrome (landningsvy + berört flöde) – särskilt vid CSS/logik-ändring.

AVSLUTA enligt handoff: uppdatera docs/status.md (nuläge, gjort, beslut, varningar, nästa steg,
modellrek) + bocka av i docs/roadmap.md, committa och pusha. I Cloud: jobba på en branch och
öppna/uppdatera PR. Skriv en ny copy-paste för nästa session i status.md.
```
