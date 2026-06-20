# Status & handoff – Edison Hemguide

Levande arbetsdokument. **Uppdateras i slutet av varje session.** Nästa session läser detta
först (efter `CLAUDE.md`, `docs/plan.md`, `docs/design.md`, `docs/roadmap.md`), gör EXAKT
ett roadmap-steg, uppdaterar detta dokument + roadmap, committar till `main`, och skriver
en ny copy-paste längst ned.

Senast uppdaterad: 2026-06-20 · innehålls-/faktapass (Edison-faktagranskning kap 1–3 + pedagogik)

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

## Vad senaste sessionen gjorde
- **Innehålls-/faktapass (roadmap-spår A).** Faktagranskade kapitel 1–3 mot meetedison.com och
  rättade två saker i innehållet (datamodell/renderare orörda, stegantal oförändrade):
  - **Kap 1, knappsteget:** "Den runda knappen laddar in ett program" → "Den runda knappen är
    robotens programknapp". På dator/USB (det antagna MacBook-flödet) sköts nedladdningen av
    appens *Program*-knapp över sladden; runda knappen används för iPad/ljus-flash-läget, inte
    för att ladda på en Mac. Triangel = start, fyrkant = stopp (oförändrat, korrekt).
  - **Kap 2, adult-tipset:** lade till att Edisons sladd har USB-A-kontakt → en MacBook (bara
    USB-C) behöver en USB-C-till-USB-A-adapter.
  - Verifierat och OFÖRÄNDRAT för att det redan stämmer: sensorer (ljus, ljud/klapp, IR-hinder),
    "svarar med ljud och små lampor" (summer + 2 röda LED), WebUSB-webbläsarna, V3-flödet
    bygg→skicka→play, samt kapitel 3:s allmänna robotfakta (robotarm, robotdammsugare, drönare).
- **Skrev `docs/pedagogik.md`** – korta riktlinjer (gör-tillsammans, konkret före abstrakt,
  gissa→testa→prata, stöttning, snäll feedback, skrivregler, a11y i text).
- **Kartlade bild-behov** (för kommande media-steg): bästa faktastödda kandidat är kap 1:s tre
  knappar som original-SVG. Upphovsrätt: lyft ALDRIG bilder ur EdBlocks-PDF/appen – egna SVG/foton.
- Bockade av i `docs/roadmap.md` (spår A: pedagogik-research + faktagranskning) och uppdaterade
  denna `docs/status.md`.
- Verifierade: `npm run validate` ✓, `npm test` ✓ (**14 tester**), `node --check` ✓.
  Deep research kördes via webbsök mot meetedison.com (källor nedan).

## Källor (faktagranskning)
- https://meetedison.com/edison-robots-sensors/ (sensorer/knappar)
- https://meetedison.com/robot-programming-software/edblocks/ + https://www.edblocksapp.com/v3/ (WebUSB, V3)
- "Getting started with Edison V3" / EdBlocks getting-started (nedladdningsflöde dator vs iPad, USB-A/adapter)

## Beslut (varför)
- **Rättade i stället för att flagga** där källan var entydig (runda knappen, USB-C-adapter) –
  CLAUDE.md säger flagga "att verifiera" bara vid osäkerhet, inte när fakta är bekräftad.
- **Behöll "att verifiera" på exakta blocknamn/placering** i kap 2 – de varierar mellan
  app-versioner och kunde inte verifieras säkert.
- **Inga bilder från EdBlocks-PDF/app.** Microbrics IP; samma princip som "kopiera aldrig text".
  Egna inline-SVG (vi ritar) eller egna foton är vägen – börja med kap 1:s knapp-trio.

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
Innehålls-/faktapasset är klart. Rekommenderat nästa: **bild-/mediastöd (roadmap-spår A/B)** –
en additiv, escapad media-stegtyp i `js/app.js` + **kap 1:s knapp-trio (rund/triangel/fyrkant)
som original inline-SVG**. A11y: varje bild behöver text-alternativ; texten måste fortfarande
bära betydelsen. INGA bilder ur EdBlocks-PDF/app (Microbrics IP) – egna SVG/foton. Verifiera
`file://` + Pages, `npm run validate` + `npm test`. (Alternativ: ny modul/kapitel, eller spår B
UI/UX & a11y-granskning, eller nice-to-have ljud/animation.)

## Modellrekommendation för nästa steg
- Media-stegtyp (renderarändring + a11y/alt-text) → **Opus** (klurig renderingslogik + a11y).
- SVG-rita knapparna när stegtypen finns → kan göras av **enklare modell (Sonnet)** mot spec.
- Ny modul/innehåll → **Opus** (pedagogik + Edison-fakta).

## Copy-paste för nästa session
```text
Du tar över samordnar-/byggrollen för "Edison Hemguide" (repo Jaloopo/Robot-Academy, main).
Läs FÖRST: CLAUDE.md, docs/plan.md, docs/design.md, docs/roadmap.md, docs/status.md.
Ange kort nuläge + din planerade åtgärd innan du kör verktyg.

UPPGIFT (ett steg): Bild-/mediastöd. Lägg till en additiv, escapad media-stegtyp i js/app.js
(t.ex. type "image" med fält för källa/SVG + alt-text) som INTE bryter datamodellen för befintliga
steg, och använd den för kap 1:s tre knappar (rund/triangel/fyrkant) som EGEN inline-SVG. A11y:
varje bild måste ha text-alternativ och texten ska fortfarande bära betydelsen (bild = komplement).
INGA bilder/skärmdumpar ur EdBlocks-PDF:en eller appen (Microbrics IP) – bara egna SVG/foton, lokalt
(ingen CDN/fetch). Uppdatera content/_mall.js + validatorn + docs om du inför ett nytt fält.
Endast statisk HTML+CSS+vanilla JS, ingen build, funkar på file:// och GitHub Pages. All UI-text
på svenska. (Faktagranskning av kap 1–3 är redan gjord; se docs/pedagogik.md för ton/skrivregler.)

VERKTYG: npm install (en gång) → npm run validate (schema) → npm test (14+, genomklickar alla
kapitel) → node --check js/app.js. Nytt kapitel: utgå från content/_mall.js. CI (Node 22) kör
node --check + npm run validate + npm test på varje PR/push – håll grön.

VERIFIERA: npm run validate ✓, npm test ✓, samt file://-genomklick i Chrome (bild syns, alt-text
finns, layout/responsivitet håller) – särskilt vid renderar-/CSS-ändring.

AVSLUTA enligt handoff: uppdatera docs/status.md (nuläge, gjort, beslut, varningar, nästa steg,
modellrek) + bocka av i docs/roadmap.md, committa och pusha till main (eller branch+PR i Cloud).
Skriv en ny copy-paste för nästa session i status.md.
```
