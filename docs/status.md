# Status & handoff – Edison Hemguide

Levande arbetsdokument. **Uppdateras i slutet av varje session.** Nästa session läser detta
först (efter `CLAUDE.md`, `docs/plan.md`, `docs/design.md`, `docs/roadmap.md`), gör EXAKT
ett roadmap-steg, uppdaterar detta dokument + roadmap, committar till `main`, och skriver
en ny copy-paste längst ned.

Senast uppdaterad: 2026-06-20 · grund-/processpass (grön CI, schema-validator, kapitelmall)

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
- **CI är grön och kör på Node 22.** Tidigare var den falskt röd på varje körning (Node 20
  expanderar inte globben i `node --test`). Nu verifieras `node --check` + `npm run validate`
  + `npm test` på varje PR och push till `main`.
- **Schema-validator finns:** `npm run validate` (`tools/validate-content.js`) fäller bygget
  på trasig kapiteldata (id↔filnamn, `role`/`type`, `text`, `options` ≥2, `correctAnswer` i
  range/permutation). **Kapitelmall finns:** `content/_mall.js` (kopiera → `kapitel-N.js`).

## Vad senaste sessionen gjorde
- **Granskade + mergade PR #11 (framstegssparande via `localStorage`, roadmap-steg 5).** Läste
  diffen, körde testerna själv (14/14), godkände på meriter. Squash-mergad till `main` (`a4c400f`).
- **Hittade + fixade en falskt röd CI.** CI:n (från #10) hade varit röd på *varje* körning,
  inklusive push till `main`, eftersom den var pinnad på Node 20 där `node --test
  "test/**/*.test.js"` inte expanderar globben. Lokalt (Node 22) såg det grönt ut → osynligt.
  Åtgärd: CI → Node 22. Repots första genuint gröna körning, både på PR #11 och på `main`.
- **Grund-/processpass (delar av roadmap-spår C + D):**
  - `tools/validate-content.js` + `npm run validate`: schema-validator som fäller bygget på
    trasig kapiteldata (id↔filnamn, `role`/`type`, `text`, `options` ≥2, `correctAnswer` i
    range/permutation). Wired in i CI före `npm test`. Rent Node (`vm`-sandlåda, samma
    `window.KAPITEL`-mönster som sajten) – ingen jsdom, inget sajtberoende.
  - `content/_mall.js`: kapitelmall + checklista för snabb, säker innehållsproduktion (även
    från mobilen). Laddas aldrig av sajt/test/validator (matchar inte `kapitel-<siffra>.js`).
  - Dokumentation i synk: `CLAUDE.md` + `.cursorrules` (validator, mall, Node 22, required-check),
    `docs/roadmap.md` (markerat C/D-poster klara), denna `docs/status.md`.
- Verifierade: `node --check` (renderare + kapitel + validator + mall) ✓, `npm run validate` ✓
  (och bekräftat fail-loud: en tillfälligt trasig `correctAnswer` gav exit 1, grönt efter
  återställning), `npm test` ✓ (**14 tester**). CI grön på `main` efter merge.

## Beslut (varför)
- **Fixa CI före merge av #11.** Funktionen var verifierad, men att merga med röd CI (och lämna
  `main` röd) bryter mot "håll CI grön". En-rads-fixen (Node 22) lades på #11:s branch så det
  blev en ren merge med grön check.
- **Validatorn är rent Node (ingen jsdom).** Den kör en `vm`-sandlåda med samma
  `window.KAPITEL`-mönster som `index.html` – snabbt, utan extra beroende, och oberoende av
  testharnessen. Fel → exit 1 (fäller CI); "Vuxen:"-prefix m.m. är varning (fäller inte).
- **Mall som `_mall.js`, inte ett extra dokument.** Checklistan bor där man kopierar ifrån, och
  underscore-namnet gör den automatiskt osynlig för sajt/test/validator.
- **Required check kunde inte sättas härifrån.** Ingen branch-protection-API i denna MCP-scope →
  lämnat som tydligt owner-steg i roadmap/status i stället för att låtsas att det är gjort.

## Varningar / blockers
- `npm test` täcker logik + datakorrekthet, INTE det visuella. CSS/layout måste fortfarande
  ögongranskas via `file://` i Chrome.
- **`localStorage` på `file://` är browserberoende.** Det fungerade i denna Chrome, men kan vara
  blockerat i andra uppsättningar/privat läge → då degraderar appen tyst (ingen sparning, inga
  badges, men full funktion). På GitHub Pages (http(s)) är det pålitligt.
- `file://` ger en ofarlig konsolvarning ("Unsafe attempt to load URL") – inga nätverksanrop.
- `node_modules/` committas aldrig: kör `npm install` en gång innan `npm test`/`npm run validate`.
  (I denna Cloud-miljö installeras det via setup-skript; kör annars `npm install`.)
- **CI är grön men ännu inte en *required* check.** Inget hindrar tekniskt en merge med röd CI
  förrän en branch-protection-regel satts för `main` (owner-steg, se roadmap D). Tills dess:
  granska CI-status manuellt före merge.
- **GitHub Pages-deploy är inte bekräftad härifrån.** Filerna är Pages-redo (relativa `./`-
  sökvägar, ingen CDN/fetch), men att Pages är på och publicerar från `main`/root är ett owner-steg.

## Owner-steg (manuella, kan inte göras via API härifrån)
- **Gör CI till required check:** Settings → Branches → branch protection för `main` →
  Require status checks to pass → välj **"test"**. Då gatear grönt faktiskt merge.
- **Bekräfta GitHub Pages:** Settings → Pages → Source = `main` / root; öppna den publicerade
  URL:en och klicka igenom ett kapitel.

## Nästa steg (exakt ETT)
Grund-/processpasset är klart. Rekommenderat nästa: **roadmap-spår A – Innehåll & pedagogik**,
och börja med **Edison-faktagranskning av kapitel 1–3** mot källa (EdBlocks V3) + korta
pedagogik-riktlinjer i `docs/`. Lyft allt osäkert som "att verifiera" – hitta ALDRIG på fakta.
Extern deep research (t.ex. Perplexity) eller egna sökningar FÅR användas för faktakoll/research;
skriv alltid om med egna svenska ord (kopiera aldrig). (Alternativt nice-to-have: lätt
ljud/animation, `prefers-reduced-motion` – enklare modell, Opus granskar a11y.)

## Modellrekommendation för nästa steg
- Innehåll & pedagogik / Edison-faktagranskning → **Opus** (omdöme, pedagogik, faktasäkerhet).
- Ljud/animation (om det väljs i stället) → **enklare modell (Sonnet)** när scope är låst; Opus
  granskar a11y.

## Copy-paste för nästa session
```text
Du tar över samordnar-/byggrollen för "Edison Hemguide" (repo Jaloopo/Robot-Academy, main).
Läs FÖRST: CLAUDE.md, docs/plan.md, docs/design.md, docs/roadmap.md, docs/status.md.
Ange kort nuläge + din planerade åtgärd innan du kör verktyg.

UPPGIFT (ett steg): Roadmap-spår A – Innehåll & pedagogik. Börja med en Edison-faktagranskning
av kapitel 1–3 (content/kapitel-1..3.js) mot källa (EdBlocks V3, https://www.edblocksapp.com/v3/):
gå igenom varje påstående, lyft osäkert som "att verifiera" i ett adult-tips, rätta inget på
gissning. Lägg gärna korta pedagogik-riktlinjer (åldersanpassning 7–10 år, scaffolding,
gör-tillsammans) i docs/. Extern deep research (Perplexity) eller egna sökningar FÅR användas för
faktakoll – skriv ALLTID om med egna svenska ord, kopiera aldrig. Rör inte datamodellen/renderaren
i onödan; ändrar du steg-antal i ett kapitel, kör npm run validate + npm test.
Endast statisk HTML+CSS+vanilla JS, ingen build, funkar på file:// och GitHub Pages. All UI-text
på svenska.

VERKTYG: npm install (en gång) → npm run validate (schema) → npm test (14, genomklickar alla
kapitel) → node --check js/app.js. Nytt kapitel: utgå från content/_mall.js. CI (Node 22) kör
node --check + npm run validate + npm test på varje PR/push – håll grön.

VERIFIERA: npm run validate ✓, npm test ✓, samt file://-genomklick i Chrome vid CSS/logik-ändring.

AVSLUTA enligt handoff: uppdatera docs/status.md (nuläge, gjort, beslut, varningar, nästa steg,
modellrek) + bocka av i docs/roadmap.md, committa och pusha till main (eller branch+PR i Cloud).
Skriv en ny copy-paste för nästa session i status.md.
```
