# Status & handoff – Edison Hemguide

Levande arbetsdokument. Nästa session läser `AGENTS.md`, `docs/plan.md`, `docs/design.md`,
`docs/roadmap.md` och därefter detta dokument. Vid implementation görs ett roadmap-steg;
granskning, felsökning och processunderhåll kan vara egna avgränsade pass. Ändringar hålls
lokala tills användaren uttryckligen ber om commit/push/PR/merge.

Senast uppdaterad: 2026-06-20 · Fas 2 plugin-refaktor med cleanup-reviewfixar; manuell `file://`-kontroll återstår före merge

## Nuläge (fakta)
- Kapitel 1 komplett: text, vuxen-tips, flerval, ordning – med gating, snäll feedback, a11y.
- Kapitel 2 "Ditt första program" klart (11 steg) i `content/kapitel-2.js`.
- **Kapitel 5 "Loopar – göra om och om igen" är nu byggt** i `content/kapitel-5.js` (12 steg: text +
  vuxen-tips, två flervalsfrågor om loop/oändlig-loop och en ordningsfråga kör fram → vänta tills
  hinder → sväng → loopen börjar om). Loop som nästa kärnkoncept efter villkor (sekvens → program →
  villkor → loop). Exempel: blinka LED i loop, köra en fyrkant (kör fram + sväng × 4), kör-för-alltid
  tills stoppknappen (fyrkanten), loop + sensor. Laddas via ny `<script>`-rad i `index.html` före `js/app.js`.
  Befintliga stegtyper, inga bilder; renderare/datamodell/CSS orörda. Kapitel 5 är nu sista kapitlet
  (numerisk sortering), så kap 4 länkar till kap 5 och kap 5 länkar till "Till kapitelöversikt".
- **Kapitel 4 "Roboten som känner" är nu byggt** i `content/kapitel-4.js` (13 steg: text +
  vuxen-tips, två flervalsfrågor om hindersensor/villkor och en ordningsfråga känn av → kolla
  villkor → gör något). Introducerar sensorer (ljus/hinder/ljud/linje) och idén om villkor
  (om-då). Laddas via ny `<script>`-rad i `index.html` före `js/app.js`. Befintliga stegtyper,
  inga bilder; renderare/datamodell/CSS orörda. Kapitel 4 följs nu av kapitel 5.
- **Kapitel 3 "Robotar i världen" är nu byggt** som innehåll i `content/kapitel-3.js`
  (13 steg: text + vuxen-tips, två flervalsfrågor om robotarm/robotdammsugare och en
  ordningsfråga känna av→följa program→göra något). Laddas via en ny `<script>`-rad i
  `index.html` före `js/app.js`.
- Designsystem + mobil + desktop-ark (≥720 px) + chapter-rail (≥900 px) + tunn
  framstegsstapel ligger på `main`.
- `js/app.js` väljer kapitel via `?kapitel=N`; utan query visas en landningsvy som listar
  alla laddade kapitel. På `main` listas kapitel 1–5 och kapitel 5 är sist.
- **Fas 2 av stegtypsarkitekturen är implementerad för dagens fyra typer.** `window.EdisonApp`
  byggs additivt i `js/edison-app.js`, standardtyperna ligger i `js/step-types/*.js`, och
  `index.html` laddar registry → plugins → kapiteldata → app. `js/app.js` äger fortsatt
  routing, storage-envelope, nav, reset och chapter-rail, men anropar plugin-kontraktet för
  state, restore, serialize, progress, gating, rendering och event-bindning. Den interaktiva
  "Sekvens vs loop"-spiken är inte byggd.
- **Cleanup-reviewfixar:** rendergenerationen invalideras före cleanup, cleanup-fel låser
  ägande steg i stället för att avbryta navigationen, och `isDone`/`serialize` kan visa felvyn
  i samma render. Datamodell, CSS och plugin-kontraktets publika metodsignaturer är orörda.
- **Verifiering för fas 2:** `node --check` på nya/ändrade JS-filer, `npm run validate` och
  `npm test` (**25 tester**) är gröna. Tidigare Chrome-`file://`-genomklick täckte landning,
  text, bild, fel→rätt, ordering, bakåt, reloadad progress, reset, avslutslänk och inga
  http-resurser; en ny manuell Chrome-kontroll efter cleanup-fixen återstår före merge.
- `docs/architecture.md` definierar det fortsatta stegtyps-plugin-kontraktet och
  `docs/reference/cs-curriculum.md` beskriver den anonymiserade, utforskande riktningen
  för en senare interaktiv "Sekvens vs loop"-spik.
- Committat testverktyg: `npm test` kör en jsdom-genomklick (`test/clickthrough.test.js`,
  **25 tester**). Nya kontraktstester täcker additivt registry, obligatoriska pluginmetoder,
  app-bootstrap utan namespace-överskrivning, okänd låst stegtyp, plugin-cleanup, sena
  cleanup-callbacks, cleanup-fel och validatorns separata Node-registry. `jsdom` är
  DEV-beroende; `node_modules/` är git-ignorerat. Sajten själv är fortsatt beroendefri.
- **Testet genomklickar nu ALLA riktiga `content/kapitel-*.js` automatiskt** (kapitel 1–5 på
  `main`). Ett nytt kapitel testas
  alltså bara genom att lägga till filen; trasig kapiteldata får `npm test` att faila.
- **GitHub Actions-CI** (`.github/workflows/ci.yml`) kör `node --check` (renderaren + alla
  kapitelfiler) + `npm test` på varje PR och vid push till `main`. Workflow-filen påverkar inte
  sajten (laddas aldrig av `index.html`); sajten är fortsatt beroendefri.
- **Framstegssparande via `localStorage` ligger nu i `js/app.js`** (roadmap-steg 5, första
  alternativet). Säker wrapper (feature-detect + `try/catch`) → tyst no-op när storage saknas/
  blockeras. Sparar besvarade frågor + senaste steg per kapitel och återupptar vid omladdning;
  sparade rätta svar visas gröna. Landningsvyn märker `Klart`/`Påbörjat`, rail (≥900 px) märker
  `Klart`, "Börja om kapitlet" nollställer. Datamodellen orörd; totalsviten är nu **16 tester**.
- **CI är grön och kör på Node 22.** Tidigare var den falskt röd på varje körning (Node 20
  expanderar inte globben i `node --test`). Nu verifieras `node --check` + `npm run validate`
  + `npm test` på varje PR och push till `main`.
- **Schema-validator finns:** `npm run validate` (`tools/validate-content.js`) fäller bygget
  på trasig kapiteldata (id↔filnamn, `role`/`type`, `text`, typregistry, lokala bildfält,
  `options` ≥2, `correctAnswer` i range/permutation). Validatorn har ett separat Node-registry
  och laddar inte browser-DOM-plugin. **Kapitelmall finns:** `content/_mall.js` (kopiera →
  `kapitel-N.js`).
- **Innehållet är faktagranskat mot meetedison.com** (kap 1–3): sensorer/knappar/WebUSB/V3-flöde
  verifierade; två rättningar gjorda (kap 1 runda knappen = "programknapp" inte "laddar in";
  kap 2 USB-C-adapter för MacBook). **Pedagogik-riktlinjer:** `docs/pedagogik.md`.
- **Ny stegtyp `image`** i renderaren: lokal bild (`src`) + `alt`, texten bär betydelsen. Första
  bilden `assets/edison-knappar.svg` (original-SVG: rund/triangel/fyrkant) i kapitel 1. Validatorn
  kräver lokal `src` + `alt`; CSS `.step-image` (responsiv). Totalsviten är nu **16 tester**.
- **UI/UX- & a11y-granskning klar (spår B).** Strukturerad genomgång av `docs/design.md` mot
  bygget dokumenterad i nya `docs/a11y.md` (kontrasttabell + checklista). **WCAG-fix:** `.app-title`
  var `#F26B1D` på `#FAF7F2` ≈ 2,85:1 (under AA för stor text) → nu `--color-edison-orange-dark`
  (`#C8540F`, ≈ 4,1:1). `#F26B1D` kvar för kant/fokusring/maskot (dekor). **Reduced-motion** utökad:
  förutom maskot-nudge stängs nu `transition` på progressstapel/knappar/alternativ/rail-länkar av.
  Badges, fokus, touch-mål, responsivitet, "text bär betydelse" verifierade som AA-OK. Datamodellen
  orörd; sajten beroendefri. `npm test` har nu **16 tester**.

## Denna arkitektur-/kontraktssession gjorde
- Portade och omarbetade `docs/architecture.md` från källbranchens skiss efter dagens
  faktiska `js/app.js`. Kontraktet täcker `createState`, `restore`, `serialize`,
  `hasProgress`, `isDone`, `render` och `bind`, så att state, persistence, progress,
  gating, rendering och events kan flyttas från kärnans typvillkor.
- Beslutade additiv bootstrap för `window.EdisonApp`, registry → plugins → kapiteldata →
  app som file://-säker scriptordning, målfilstruktur, felhantering för okänd/dubbel
  registrering och uppdelat a11y-/reduced-motion-ansvar.
- Skrev en fasad migration: kontrakt → beteendebevarande registry-refaktor → en enda
  "Sekvens vs loop"-spik → utvärdering. Första refaktorn behåller HTML-sträng →
  `innerHTML` → bind och ändrar ingen produktfunktion.
- Portade `docs/reference/cs-curriculum.md` och generaliserade den tidigare personliga
  barnprofilen till en anonym målgrupp. Inga boktitlar, exakta räkneexempel eller
  förmågepåståenden om ett enskilt barn finns kvar.
- Portade vision/epos selektivt till `docs/roadmap.md` på aktuell `main` och behöll
  kapitel 5, AGENTS.md-processen, 16 tester och varningen om branch protection.
- Berörda filer i detta pass: `docs/architecture.md`, `docs/reference/cs-curriculum.md`,
  `docs/roadmap.md` och `docs/status.md`. Inga produkt-, test-, content- eller package-
  filer är rörda.

## Vad detta processpass gjorde
- Gjorde `AGENTS.md` till gemensam källa för agentregler.
- Gjorde `CLAUDE.md` till en liten `@AGENTS.md`-wrapper och `.cursorrules` till en
  kompatibilitetshänvisning, i stället för tre kopior av samma regler.
- Anpassade README/handoff till branch-baserat, lokalt arbete och gjorde modellrollerna
  verktygsneutrala.
- Rättade Kapitel 5:s stoppknapp från rund programknapp till fyrkantig stoppknapp och lade
  till ett regressionstest för faktainvarianten. Totalt 16 tester.

## Senaste innehållssessionen (PR #18)
- **Nytt kapitel 5 "Loopar – göra om och om igen" (upprepa).**
  - `content/kapitel-5.js` (nytt, 12 steg): intro (knyter till kap 4) → vuxen-tips (loop som
    nyckelbegrepp) → vad en loop är (block runt andra block) → blinka LED i loop → flervalsfråga
    (vad gör loopen med blocken inuti) → köra en fyrkant (kör fram + sväng × 4) → vuxen-tips
    (EdBlocks loop-grupp, blocknamn "att verifiera") → kör-för-alltid → flervalsfråga (när slutar
    en oändlig loop) → loop + sensor → ordningsfråga (kör fram → vänta tills hinder → sväng →
    loopen börjar om) → avslut.
  - `index.html`: ny `<script src="./content/kapitel-5.js">`-rad före `js/app.js`.
  - Loop-fakta omskrivna med egna ord ur "Verifierade loop-fakta" nedan (EdBlocks-lärarguiden,
    idébank). Befintliga stegtyper, inga bilder; renderare/datamodell/CSS orörda. Frivillig
    brygglektion FÖRE loopar hoppades över (tempot bedömdes ok – kap 4 introducerade redan om-då).
  - Bockade av "Loopar" i `docs/roadmap.md`.
- Verifierat: `node --check js/app.js` + `content/kapitel-5.js` ✓, `npm run validate` ✓ (5 kapitel-
  filer), `npm test` ✓ (**15 tester**, genomklicket täcker kap 5 automatiskt), samt `file://`-
  genomklick i Chrome (computerUse): landning listar kap 5, gating, fel→rätt-feedback, andra
  flervalsfrågan, ordningsfråga löst, sista steget länkar till "Till kapitelöversikt". Demo-video +
  skärmdumpar bifogade i PR #18 / artefakter.

## Föregående session gjorde (kap 4)
- **Nytt kapitel 4 "Roboten som känner" (sensorer + om-då).**
  - `content/kapitel-4.js` (nytt, 13 steg): intro → ljussensorer → hindersensor → flervalsfråga
    (hindersensorn) → ljudsensor/klapp → villkor "om-då" → vuxen-tips (villkor/förgrening,
    appspecifika blocknamn "att verifiera") → flervalsfråga (väg fri → fortsätter rakt) →
    linjesensor → ordningsfråga (känn av → kolla villkor → gör något) → avslut.
  - `index.html`: ny `<script src="./content/kapitel-4.js">`-rad före `js/app.js`.
  - Faktagranskat mot meetedison.com: ljussensorer ovansida v/h, hindersensor framtill (IR),
    ljudsensor vid runda knappen (klapp), linjesensor undertill, villkor/förgrening. Renderare,
    datamodell och CSS orörda.
  - Bockade av "Innehållstäckning" (kap 4) i `docs/roadmap.md`.
- Verifierat: `node --check` ✓, `npm run validate` ✓ (4 kapitelfiler), `npm test` ✓ (**15 tester**,
  genomklicket täcker kap 4 automatiskt), samt `file://`-genomklick i Chrome (computerUse):
  landning listar kap 4, fel→rätt-feedback, ordningsfråga, sista steget länkar till kapitel-
  översikt. Demo-video + skärmdumpar bifogade i PR #16 / artefakter.

## Förra sessionen gjorde
- **UI/UX- & a11y-granskning (spår B – KLAR).**
  - `style.css`: `.app-title` → `--color-edison-orange-dark` (AA-kontrast); `prefers-reduced-motion`
    stänger nu även av `transition` på `.progressbar > span`, `.btn`, `.option`, `.chapter-link`,
    `.rail-link`. Båda additiva, inga mobilvärden i övrigt ändrade.
  - `docs/a11y.md` (ny): kontrasttabell (FÖRE/EFTER), checklista för fokus/tangentbord, touch-mål,
    responsivitet, reduced-motion, semantik, samt "noterat ej åtgärdat" (subtila vilolägeskanter
    `#e0dbd3` < 3:1 enligt 1.4.11 – medveten lugn-design-avvägning, förstärks av hover/fokus).
  - `docs/design.md`: tokens-notisen uppdaterad – `#C8540F` används nu för rubriktext, med skäl.
  - Bockade av spår B i `docs/roadmap.md`.
- Verifierat: `node --check` ✓, `npm run validate` ✓, `npm test` ✓ (**15 tester**), samt
  `file://`-genomklick i Chrome (computerUse): landning, kapitel 1, fel→rätt-feedback, bild-steg –
  titel mörkt orange/läsbar, inget trasigt. Demo-video + skärmdumpar bifogade i PR/artefakter.

## Föregående session gjorde
- **Bild-/mediastöd (roadmap-spår A/B).** Ny additiv stegtyp `image` – befintliga steg orörda:
  - `js/app.js`: `renderImage(step)` (rendrar `step.text` + `<img class="step-image" src alt>`,
    båda escapade) + `case "image"` i `renderStepContent`. State för bild-steg = default
    `{ done: true }` (ingen gating), så genomklicket går vidare med Nästa precis som text-steg.
  - `assets/edison-knappar.svg`: original-SVG (rund knapp m. orange punkt, triangel = play,
    fyrkant = stopp), hårdkodade brand-färger (img-SVG kan inte läsa sidans CSS-variabler).
  - `content/kapitel-1.js`: nytt bild-steg direkt efter knapp-intron (src `./assets/edison-knappar.svg`
    + alt + bildtext). Kap 1 har nu ett steg till.
  - `style.css`: `.step-image` (responsiv, `max-width:320px`, centrerad).
  - `tools/validate-content.js`: `image` tillagd i giltiga typer; kräver lokal `src` (felar på
    http/CDN) + `alt` (sträng; varnar vid tom alt). `content/_mall.js` uppdaterad; datamodell-
    och renderingsregler är senare centraliserade i `AGENTS.md`.
  - **Test:** nytt dedikerat test ("bild-steg renderar lokal bild med alt-text och låser inte
    Nästa") – totalt **15 tester**, alla gröna. Det datadrivna genomklicket täcker dessutom det nya
    steget automatiskt (kap 1).
- Bockade av "Bilder/media" i `docs/roadmap.md` (spår A) och uppdaterade denna `docs/status.md`.
- Verifierade: `node --check` ✓, `npm run validate` ✓, `npm test` ✓ (**15 tester**).
  OBS: själva bildvisningen i webbläsare (att SVG:n syns/skalar) behöver fortfarande en
  `file://`-koll i Chrome – jsdom laddar inte bilder, testet kollar bara attributen.

## Beslut (varför)
- **Ett helt stegtypsplugin, inte bara ett renderar-registry.** Dagens typkunskap finns i
  state-fabrik, restore, serialize, progress, gating, rendering och event-bindning. Varje
  plugin ska därför äga hela livscykeln via `createState`, `restore`, `serialize`,
  `hasProgress`, `isDone`, `render` och `bind`; kärnan äger bara appflöde och envelope.
- **Additivt `window.EdisonApp`.** `root.EdisonApp = {...}` måste ersättas i nästa refaktor,
  annars skrivs tidigare registrerade plugins över. Klassiska scripts laddas i ordningen
  namespace/registry → plugins → kapiteldata → app, utan ES-moduler eller buildsteg.
- **HTML-sträng → `innerHTML` → bind behålls i första refaktorn.** Det är dagens bevisade
  file://-säkra mönster. Ett DOM-paradigmskifte skulle öka risken utan att lösa kontraktets
  egentliga problem.
- **Okänd/dubbel typ är ett fel, aldrig en tyst fallback.** Validatorn stoppar okända typer i
  CI; browsern visar en låst, textbärande felvy om de ändå når dit. Dubbel registrering ska
  kasta direkt. Det förhindrar att trasig data blir automatiskt klar eller kan sparas som rätt.
- **Curriculumriktningen är bred målgrupp, inte en profil av ett enskilt barn.**
  Fördjupning ska vara valfri och kärnflödet fungera med text, tydlig visuell förändring och
  vuxensamtal oavsett läsflyt eller räknevana.
- **`image` med lokal `src` + `alt`, inte rå inline-SVG i datan.** Håller datamodellen ren och
  mobil-redigerbar (bara strängar), undviker att injicera rå HTML, och validatorn kan tvinga
  "lokal sökväg, ingen CDN". SVG:n bor som egen fil i `assets/`.
- **Texten bär fortfarande betydelsen; bilden är komplement** (a11y). Varje bild kräver `alt`.
- **Hårdkodade färger i SVG:n.** En `<img>`-laddad SVG är sandlådad och kan inte läsa sidans
  `--color-*`-variabler, så brand-färgerna är inskrivna i filen.
- **Inga bilder ur EdBlocks-PDF/app** (Microbrics IP) – egna SVG/foton, lokalt i `assets/`.
- **`.app-title` mörkare orange (`#C8540F`) i stället för `#F26B1D`.** `#F26B1D` som *text* på
  `#FAF7F2` når bara ~2,85:1 (under WCAG AA även för stor text). Den mörka brand-varianten finns
  redan som token och når ~4,1:1 – behåller orange känsla utan att skapa en ny färg. `#F26B1D`
  är kvar för icke-textbärande dekor (kant, fokusring, maskot).
- **Subtila vilolägeskanter lämnas orörda (medvetet).** `#e0dbd3`-kanten på alternativ/kort når
  inte 3:1 (WCAG 1.4.11 icke-text), men affordansen förstärks av hover/`:focus-visible` (orange)
  och elementen bär text. Att skärpa kanten skulle ändra det lugna uttrycket – noterat i
  `docs/a11y.md` som kandidat, inte ändrat nu.

## Källor (faktagranskning, föregående pass)
- https://meetedison.com/edison-robots-sensors/ (sensorer/knappar)
- https://meetedison.com/robot-programming-software/edblocks/ + https://www.edblocksapp.com/v3/ (WebUSB, V3)
- "Getting started with Edison V3" / EdBlocks getting-started (nedladdningsflöde dator vs iPad, USB-A/adapter)
- **EdBlocks lesson activities – Teachers guide & answer key (Edison V3), Microbric/Emma Dewar,
  CC BY-SA 4.0.** Ligger som idébank i `docs/reference/` (PDF, git-ignorerad – committas ALDRIG;
  se `.gitignore`). KOPIERA ALDRIG text/bilder därifrån (upphovsrätt) – skriv om allt med egna
  svenska ord. Bra för att verifiera exakta block/flöden innan ett kapitel skrivs.

## Verifierade loop-fakta (egna ord, ur lärarguiden – för kapitel 5)
Faktabas så nästa session slipper gissa. Skriv ändå om med egna ord i kapiteltexten:
- EdBlocks har en **grupp loop-block**. En loop läggs RUNT andra block och får dem att upprepas
  (vänster→höger) så länge loopens villkor är uppfyllt. (Guidens Aktivitet 16 "Let's use the lights".)
- Det finns **flera olika loop-block**, bl.a. en **oändlig loop** ("kör för alltid"). Loopar kan
  dessutom **nästlas** (loop inuti loop).
- Man kan lägga **många block i samma loop**: dra loopen över en befintlig blockkedja (den töjs ut)
  eller lägg loopen först och släpp block inuti den.
- Tids-blocket **"wait until"** låter Edison vänta ett antal sekunder (0,01–320) innan nästa block.
- **LED-lamporna** lyser i bakgrunden tills programmet släcker dem eller slutar (bra loop-exempel:
  blinka på/av för alltid).
- Klassiskt loop+sensor-program (guidens Aktivitet 17–18): **kör framåt → vänta tills hinder känns
  → backa → sväng → loopen startar om**. Bra konkret koppling mellan kap 4 (villkor) och loopar.
- "Musikstolar": spela musik i en loop **tills runda knappen trycks**. Edison läser block vänster→höger.
- OBS att verifiera: de exakta *namnen/ikonerna* i blockmenyn varierar per EdBlocks-version – håll
  texten på begrepps­nivå ("en loop", "ett upprepa-block") och flagga app-specifika detaljer i ett
  vuxen-steg, precis som i kap 4.

## Varningar / blockers
- `npm test` täcker logik + datakorrekthet, INTE det visuella. CSS/layout måste fortfarande
  ögongranskas via `file://` i Chrome.
- **`localStorage` på `file://` är browserberoende.** Det fungerade i denna Chrome, men kan vara
  blockerat i andra uppsättningar/privat läge → då degraderar appen tyst (ingen sparning, inga
  badges, men full funktion). På GitHub Pages (http(s)) är det pålitligt.
- `file://` ger en ofarlig konsolvarning ("Unsafe attempt to load URL") – inga nätverksanrop.
- `node_modules/` committas aldrig: kör `npm install` en gång innan `npm test`/`npm run validate`.
  (I denna Cloud-miljö installeras det via setup-skript; kör annars `npm install`.)
- `node_modules/` saknas i en färsk Cloud-container → `npm test` failar då falskt på
  "Cannot find module 'jsdom'". Kör **`npm install` först** (se nedan).
- Branchstädning klar 2026-06-20: de gamla brancherna för PR #2, #4 och mergade #18 är
  raderade; #2/#4 stängdes utan merge och inga öppna PR:er återstår.
- Källbranchens arkitekturskiss (`origin/claude/chapter-5-loops-merge-75czrp`, `e0a9aee`)
  är selektivt portad. Merg eller cherry-picka den fortfarande aldrig i sin helhet: dess
  roadmap har gamla processregler och pre-merge-status.

## Owner-steg
- **Branch protection måste åter verifieras.** GitHubs publika API rapporterade 2026-06-20
  `main` som `protected: false` och inga aktiva rulesets. Kontrollera att checken `test`
  verkligen är required innan nästa merge till `main`.
- **GitHub Pages är på och publicerar** (bekräftat av ägaren) – sajten är live från `main`/root.
  Filerna var redan Pages-redo (relativa `./`-sökvägar, ingen CDN/fetch).

## Nästa steg (inte startat)
**Fas 3 – första interaktiva spiken "Sekvens vs loop".** Bygg den endast om ägaren uttryckligen
ber om nästa roadmap-steg. Den ska använda det verifierade plugin-kontraktet, inte lägga
simulator-/aktivitetslogik i appkärnan, och ska ha textbärande betydelse, tangentbord,
cleanup, persistence och reduced-motion-stöd.

**Icke-mål för nästa pass tills det beställs:** inga fler plugins av bara arkitekturskäl,
ingen ändring av `content/`/CSS/package-filer utan tydligt scope, inga ES-moduler, ingen
bundler och inga runtime-beroenden.

## Modellrekommendation för nästa steg
- Fas 3 innebär ny interaktion, a11y och pedagogisk produktkänsla → använd Opus 4.8 High /
  high-thinking Opus-klass eller motsvarande stark modell för design/review; implementation
  kan delegeras till billigare modell först när specen är smal och tydlig.
