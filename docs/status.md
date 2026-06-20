# Status & handoff – Edison Hemguide

Levande arbetsdokument. **Uppdateras i slutet av varje session.** Nästa session läser detta
först (efter `CLAUDE.md`, `docs/plan.md`, `docs/design.md`, `docs/roadmap.md`), gör EXAKT
ett roadmap-steg, uppdaterar detta dokument + roadmap, committar till `main`, och skriver
en ny copy-paste längst ned.

Senast uppdaterad: 2026-06-20 · UI/UX- & a11y-granskning (spår B): kontrastfix + reduced-motion + `docs/a11y.md`

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
- **Innehållet är faktagranskat mot meetedison.com** (kap 1–3): sensorer/knappar/WebUSB/V3-flöde
  verifierade; två rättningar gjorda (kap 1 runda knappen = "programknapp" inte "laddar in";
  kap 2 USB-C-adapter för MacBook). **Pedagogik-riktlinjer:** `docs/pedagogik.md`.
- **Ny stegtyp `image`** i renderaren: lokal bild (`src`) + `alt`, texten bär betydelsen. Första
  bilden `assets/edison-knappar.svg` (original-SVG: rund/triangel/fyrkant) i kapitel 1. Validatorn
  kräver lokal `src` + `alt`; CSS `.step-image` (responsiv). `npm test` är nu **15 tester**.
- **UI/UX- & a11y-granskning klar (spår B).** Strukturerad genomgång av `docs/design.md` mot
  bygget dokumenterad i nya `docs/a11y.md` (kontrasttabell + checklista). **WCAG-fix:** `.app-title`
  var `#F26B1D` på `#FAF7F2` ≈ 2,85:1 (under AA för stor text) → nu `--color-edison-orange-dark`
  (`#C8540F`, ≈ 4,1:1). `#F26B1D` kvar för kant/fokusring/maskot (dekor). **Reduced-motion** utökad:
  förutom maskot-nudge stängs nu `transition` på progressstapel/knappar/alternativ/rail-länkar av.
  Badges, fokus, touch-mål, responsivitet, "text bär betydelse" verifierade som AA-OK. Datamodellen
  orörd; sajten beroendefri. `npm test` fortsatt **15 tester**.

## Vad senaste sessionen gjorde
- **UI/UX- & a11y-granskning (spår B – nu KLAR).**
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
    http/CDN) + `alt` (sträng; varnar vid tom alt). `content/_mall.js` + `CLAUDE.md`/`.cursorrules`
    (datamodell + rendering) uppdaterade och i synk.
  - **Test:** nytt dedikerat test ("bild-steg renderar lokal bild med alt-text och låser inte
    Nästa") – totalt **15 tester**, alla gröna. Det datadrivna genomklicket täcker dessutom det nya
    steget automatiskt (kap 1).
- Bockade av "Bilder/media" i `docs/roadmap.md` (spår A) och uppdaterade denna `docs/status.md`.
- Verifierade: `node --check` ✓, `npm run validate` ✓, `npm test` ✓ (**15 tester**).
  OBS: själva bildvisningen i webbläsare (att SVG:n syns/skalar) behöver fortfarande en
  `file://`-koll i Chrome – jsdom laddar inte bilder, testet kollar bara attributen.

## Beslut (varför)
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
UI/UX- & a11y-granskningen (spår B) är klar. Rekommenderat nästa (välj ETT):
- **Innehållstäckning / nytt kapitel eller modul** (t.ex. sensorer, loopar, felsökning) – beslut
  bredd vs djup. Opus (pedagogik + Edison-fakta, samma datamodell/mall `content/_mall.js`). ELLER
- **Fler bilder** med befintliga `image`-typen: block-snäpp i kap 2 / robotsiluetter i kap 3 –
  bara nya lokala assets + ett bild-steg per kapitel. Enklare modell (Sonnet) mot spec. ELLER
- **Owner-/processteg:** gör CI till *required* check + bekräfta GitHub Pages (se "Owner-steg").
Notera: pixel-/visuell slutkoll sker alltid i Chrome (`file://`); i Cloud kan computerUse köra den.

## Modellrekommendation för nästa steg
- Nytt kapitel/modul eller innehåll → **Opus** (pedagogik + Edison-fakta).
- Fler bilder (nya assets till befintlig `image`-typ) → **enklare modell (Sonnet)** mot spec.
- Ev. ytterligare a11y-skärpning (vilolägeskanter) → **Opus** (avvägning lugn design vs 1.4.11).

## Copy-paste för nästa session
```text
Du tar över samordnar-/byggrollen för "Edison Hemguide" (repo Jaloopo/Robot-Academy, main).
Läs FÖRST: CLAUDE.md, docs/plan.md, docs/design.md, docs/roadmap.md, docs/status.md.
Ange kort nuläge + din planerade åtgärd innan du kör verktyg.

UPPGIFT (ett steg): VÄLJ ETT. (a) Nytt kapitel/modul (sensorer, loopar el. felsökning) – Opus,
pedagogik + Edison-fakta, utgå från content/_mall.js + ny <script>-rad i index.html FÖRE
js/app.js. (b) Fler bilder via befintliga image-stegtypen (block-snäpp kap 2 / robotsiluetter
kap 3) – egna lokala SVG i assets/, ett bild-steg per kapitel, ingen logikändring. (c) Owner-/
processteg (CI required check + bekräfta GitHub Pages). A11y- & UI/UX-granskningen (spår B) är
redan klar – se docs/a11y.md (kontrasttabell + checklista) om du rör CSS/markup, och håll AA.
Endast statisk HTML+CSS+vanilla JS, ingen build, funkar på file:// och GitHub Pages. All UI-text
på svenska. Rör inte datamodellen vid design-/UI-arbete.

VERKTYG: npm install (en gång) → npm run validate (schema) → npm test (15, genomklickar alla
kapitel) → node --check js/app.js. Nytt kapitel: utgå från content/_mall.js. Bild-steg: type
"image" med lokal src + alt (se kap 1). CI (Node 22) kör node --check + npm run validate + npm test
på varje PR/push – håll grön.

VERIFIERA: npm run validate ✓, npm test ✓, samt file://-genomklick i Chrome vid CSS/logik-ändring
(i Cloud: computerUse). Vid a11y-känsliga färgändringar: kontrollera AA-kontrast mot docs/a11y.md.

AVSLUTA enligt handoff: uppdatera docs/status.md (nuläge, gjort, beslut, varningar, nästa steg,
modellrek) + bocka av i docs/roadmap.md, committa och pusha till main (eller branch+PR i Cloud).
Skriv en ny copy-paste för nästa session i status.md.
```
