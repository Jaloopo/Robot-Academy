# Beslutsunderlag – desktop-UI/UX för Edison Hemguide

**Typ:** rent UI/UX-designpass (Uppgift A). Inga produktändringar, ingen CSS, inga
paket, ingen commit/push i detta pass. Mått och regler nedan är en **spec** att bygga
mot i ett senare, additivt CSS-pass.

**Datum:** 2026-06-21 · **Status:** förslag för beslut. När ägaren valt alternativ blir
de valda måtten kanon i `docs/design.md` (avsnittet "Desktop").

**Förutsättningar (oförändrade):** mobil-först, additivt desktop via `@media`, vanilla
JS, statiskt, `file://` + GitHub Pages, inga runtime-beroenden, all UI-text på svenska,
WCAG AA. Mobilens token-/klassvärden rörs inte. Den första interaktiva spiken är fortsatt
"Sekvens vs loop" (Fas 3 i `docs/architecture.md`).

**Synkbas:** detta underlag utgår från `main` efter **PR #22** (Fas 2-pluginarkitekturen
och rätt scriptordning i `index.html` finns redan; `js/edison-app.js` + `js/step-types/*`
är mergade). En tidigare varning om "saknade pluginscript" gällde en gammal lokal
arbetskopia och är inte längre aktuell.

---

## 1. Diagnos av desktopproblemet

Skärmbild: 3436×1840 fysiska px. Vid normal Retina-skalning (2×) blir det ca **1718×920
CSS-px**; på en 1× extern skärm är den effektiva bredden ännu större. Mot dagens regler i
`style.css` ger det följande:

| Regel idag (`style.css`) | Effekt på ~1718 px bred vy |
| --- | --- |
| `@media (min-width:720px)` `#app { max-width:760px; margin:3rem auto }` | Landnings-/arkvy fryser vid 760 px. |
| `@media (min-width:900px)` `#app.has-rail { max-width:1060px; grid-template-columns:248px minmax(0,1fr) }` | Kapitelvyn fryser vid **1060 px** → ~329 px tom canvas på **varje** sida. |
| Innehållskolumnen = `1fr` efter 248 px rail + 2,75rem gap | ≈ **768 px brett textmått** vid 1060 px ark – **för brett för bekväm läsning** (mål ~60–66 tecken ≈ 640–680 px). |
| `#app { margin:3rem auto }` (ingen vertikal balans) | Arket **toppankras**; nedre halvan av canvasen blir tom. |
| `.step-card` rymmer 2–3 meningar + en knapp | Det smala innehållet i ett brett kort → mycket tom vit yta i kortet. |

**Slutsats (två problem, inte ett):**

1. **Skalproblem.** Skalet (arket + rail) slutar växa vid 1060 px medan canvasen är
   ~1718 px → liten "ö" i ett stort tomt hav, både horisontellt (sidomarginaler) och
   vertikalt (toppankrad). Det är detta skärmbilden visar.
2. **Läsmåttsproblem (redan idag, 900–1060 px).** Innehållskolumnen är `1fr` utan tak, så
   raderna blir ~768 px = för långa. Att bara höja `max-width` skulle **förvärra** detta.

Båda måste lösas samtidigt: skalet ska få **andas större**, men **textmåttet ska kapas**.
Den lediga ytan vid mycket stora bredder ska läsas som *avsiktlig lugn ram* (samma
"enhet på canvas"-språk som mobil-mockupen och 720 px-arket), inte som oavsiktligt
tomrum – men den ska vara **balanserad** (lika luft i sido- och höjdled) och skalet ska nå
en bekväm maxbredd innan luften tar vid.

---

## 2. Två desktopstrategier (≥900 px och ≥1200/1440 px)

Båda behåller mobil + 720 px-arket orört och bygger additivt vidare ovanpå dagens
≥900 px-rail.

### Alternativ 1 — "Lugnt skalande ark" (REKOMMENDERAS)

En enda lugn yta som växer i kontrollerade steg; textmåttet kapas alltid; den interaktiva
scenen får plats **inuti** innehållszonen (staplad som standard, sida-vid-sida först vid
mycket breda skärmar). Plain textkapitel förblir en lugn, centrerad läspelare.

- **≥900 px:** behåll rail-gridden, men **kapa läspelaren** i `.step-main` till ~680 px och
  centrera den i innehållszonen (`margin-inline:auto`). Fixar dagens 768 px-rader direkt.
- **≥1200 px:** höj arket till ~1180 px, rail 260 px, något större typografi och luft.
  Vertikal balans: centrera arket i höjd (via `min-height:100vh` + centrerad placering)
  så korta steg inte toppankras.
- **≥1440 px:** arket kapas vid ~1280 px (sluttak). Mer luft, inte mer textbredd. Kvarvarande
  sidomarginal är avsiktlig, symmetrisk ram.
- **Interaktiv scen:** ett enda stegkort med en avgränsad "scen"-panel. Staplad (scen över
  text) som standard; sida-vid-sida först ≥1280 px, och bara för spike-steget.

**För:** minimal additiv diff, lägst risk, behåller "en lugn yta"-identiteten, skyddar
läsmåttet på alla bredder, ger spiken ett hem utan permanent tom tredje zon.
**Mot:** mycket stora skärmar har kvar (avsiktlig) sidoluft; spikens sida-vid-sida-läge
kräver en villkorad modifier-klass.

### Alternativ 2 — "Tre fasta zoner" (rail · lästext · scen)

Permanent tre-kolumns-grid vid ≥1200/1440 px: rail | läspelare | scen-panel.

- **≥900 px:** som idag (rail | 1fr), men läspelaren kapas till ~640 px.
- **≥1200/1440 px:** arket växer till ~1320–1400 px och innehållszonen delas alltid i
  läspelare (~560–600 px) + permanent scen-panel (~440–520 px).

**För:** fyller den breda canvasen mest "symmetriskt"; spiken har en fast plats.
**Mot:** **varje vanligt textkapitel** får en stor tom tredje zon → känns som en dashboard,
vilket bryter mot kravet "ingen dashboard/spel". Mer markup/CSS, fler reflow-/a11y-fall att
testa, och scenen står tom 95 % av tiden eftersom nästan alla steg är text/fråga. Avrådes.

---

## 3. Rekommendation

> **Beslutat 2026-06-21 (ägaren):** Alternativ 1 valt.

**Bygg Alternativ 1.** Det löser skärmbildens skalproblem *och* dagens dolda läsmåttsproblem
med en liten, additiv diff, behåller produktens lugna karaktär och undviker dashboard-känslan.
Tre-zoners-alternativet löser bara skalet och skapar ett nytt problem (permanent tom zon) för
de kapitel som faktiskt dominerar (text/fråga/ordning).

Princip: **skalet växer, textmåttet kapas, luften balanseras, scenen är villkorad – inte
permanent.**

---

## 4. Mått (spec för Alternativ 1)

Alla värden är additiva ovanpå dagens regler. Mobil (<720 px) och 720 px-arket ändras inte.
Värdena är förslag att finjustera i webbläsare under bygget.

### 4.1 Appskal (`#app`, `#app.has-rail`)
| Brytpunkt | max-width | grid-template-columns | column-gap | vertikal |
| --- | --- | --- | --- | --- |
| <720 | 600 (oförändrat) | — | — | `margin:0 auto` |
| ≥720 (ark) | 760 (oförändrat) | — | — | `margin:3rem auto` |
| ≥900 (rail) | ~1040–1060 | `248px minmax(0,1fr)` | 2,75rem | `margin:3rem auto` |
| ≥1200 | ~1180 | `260px minmax(0,1fr)` | 3rem | centrera i höjd (se 4.6) |
| ≥1440 | ~1280 (tak) | `280px minmax(0,1fr)` | 3,5rem | centrera i höjd |

### 4.2 Chapter-rail
- Bredd 248 → 260 (≥1200) → 280 px (≥1440). `sticky`, `top` 3rem → 4rem.
- **`max-height: calc(100vh - 2*top); overflow:auto`** så railen aldrig täcker innehåll
  eller blir onåbar vid zoom/kort fönster. Behåll `border-right` och `aria-current="step"`.

### 4.3 Innehållskolumn (`.step-main`)
- **Läspelare (textbärande steg):** inre omslag `max-width: 680px; margin-inline:auto`
  (centrerad i innehållszonen). Gäller redan från ≥900 px → fixar dagens långa rader.
- **Spike-/scen-steg:** en modifier (t.ex. `.step-main--stage`) låter kortet växa till
  innehållszonens bredd (tak ~920 px) och dela i text (≤ ~520–560 px) + scen (~360–420 px)
  **endast ≥1280 px**; under det staplas scen över text. `min-width:0` behålls.

### 4.4 Typografi
| | brödtext | `.app-title` | line-height |
| --- | --- | --- | --- |
| mobil | 17px (1.0625rem) | 1.5rem | 1.55 |
| ≥720 | 18px (1.125rem) | 1.75rem | 1.55 |
| ≥1200 | 19px (1.1875rem) – **tak** | 1.9rem | 1.6 |

Brödtexten kapas vid 19px för att skydda läsmåttet (bredare skärm ⇒ mer luft, inte längre
rader). Behåll systemfontstacken (offline/`file://`).

### 4.5 Luft (spacing)
- Stegkortets padding: 1.5rem (mobil) → 2rem (≥1200).
- Arkets padding: 2,75rem 3rem (≥720) → 3rem 3,5rem (≥1200) → 3,25rem 4rem (≥1440).
- Vertikal rytm header → progressstapel → kort → nav: skala ~1,25× vid ≥1200.

### 4.6 Vertikal balans
- Vid ≥1200 px: låt skalet centreras i höjd när innehållet är kortare än fönstret, t.ex.
  `body { min-height:100vh; display:grid; place-content:center }` (gäller både landning och
  kapitelvy). **Använd `min-height`, aldrig fast `height`**, så långt innehåll fortsatt
  scrollar normalt. Verifiera att landningens enkolumn fortfarande centreras snyggt.

### 4.7 CTA ("Nästa"/nav)
- `.nav` kapas till läspelarens bredd (max 680 px, `margin-inline:auto`) så knappraden
  ligger i linje under kortet i stället för att spänna över hela arket.
- `.btn--primary` behåller `flex:1` men når därmed aldrig mer än ~680 px; behåll
  `min-height:48px` (≥720) och ≥44 px touch. Föregående vänster / Nästa höger i raden.

---

## 5. Hur "Sekvens vs loop" får plats (utan spel/dashboard)

Spiken är **ETT** interaktivt stegkort (plugin enligt Fas 3), inte en egen sida. Inuti
kortet, i denna ordning:

1. **Kort fråga (Predict).** En mening + två svarsknappar ("Samma resultat" / "Olika
   resultat").
2. **Scen-panel (en, avgränsad).** Två små programkolumner sida vid sida: vänster "Tre
   steg" = tre staplade KÖR-block; höger "En loop" = ett loop-ramat KÖR-block med etikett
   "×3". Under dem **en** resultatremsa (t.ex. 3 rutor/3 LED-prickar) som visar det
   deterministiska utfallet.
3. **"Visa"/"Kör"-knapp** → avtäcker resultatremsan + en **textrad** som säger utfallet.
4. **"Ändra antal varv" (− / +)** mellan t.ex. 2–5 som uppdaterar loop-etiketten,
   resultatremsan och textraden samtidigt.
5. Snäll feedback → **Nästa** låses upp. Ett `adult`-tips bygger bryggan till riktiga Edison.

**Det som håller det lugnt (designgränser):** högst två små programkolumner + en
resultatremsa + ett fåtal knappar, allt i ett kort. Ingen poäng, ingen synlig timer, inga
flera widgets/paneler, ingen fri canvas, ingen auto-spelande animation. Staplad som
standard; scen sida-vid-sida endast ≥1280 px. Resultatet är en lugn "läs & prova"-yta, inte
en spelplan.

---

## 6. A11y- och reduced-motion-krav (gäller hela passet och spiken)

- **Läsmått ≤ ~66 tecken** på alla bredder (kap i §4.3/§4.4) – stöd för låg syn/dyslexi.
- **Reflow (WCAG 1.4.10):** vid ~320 CSS-px / 400 %-ekvivalent reflow ska vyn vara **en
  kolumn utan horisontell scroll**. Railen är redan dold <900 px; verifiera att ≥1200-scenen
  **staplar** och att den vertikala centreringen använder `min-height` (inget innehåll klipps).
  Verklig browserzoom kontrolleras manuellt i Chrome; den automatiska QA:n testar smal
  viewport ned till ~320 CSS-px som proxy (se §8).
- **Sticky rail:** `max-height`+`overflow:auto` så den aldrig täcker innehåll eller blir
  onåbar vid zoom. Behåll DOM-ordning och `aria-current="step"`.
- **Synlig fokusring** (2 px orange + offset) på alla nya kontroller; alla interaktiva
  element är riktiga `<button>`/`<a>`, ≥44 px, tangentbordsnåbara.
- **Logisk fokusordning i spiken:** Predict-val → Kör/Visa → Ändra varv → Nästa.
- **Texten bär betydelsen, inte färg/rörelse:** resultatet anges i en **textrad**
  ("Båda gör samma sak: roboten kör framåt 3 steg."); loop-gränsen visas med ram + etikett
  ("×3"), inte enbart färg.
- **`aria-live="polite"`** på utfalls-/feedbacktexten så ändringar läses upp.
- **`prefers-reduced-motion: reduce`:** visa **slutläget direkt**, ingen auto-animation;
  erbjud en användarstyrd "visa steg"-knapp i stället för rörelse; utöka dagens
  reduced-motion-regel till spikens nya element (inga `transition`/`@keyframes`).
- **Ingen layout-tweening** vid fönsterändring; cleanup stoppar ev. timers före omrendering
  (enligt plugin-kontraktet).

---

## 7. Storyboard – 5 skärmtillstånd (för Claude Design)

Riktbredd ≥1200 px om inget annat anges. Använd designtokens i `docs/design.md`.

### S1 – Landningsvy (desktop)
- **Layout:** en centrerad kolumn (ingen rail), kapitellista som kort, vertikalt balanserad
  på lugn canvas. Ark ~760–880 px, centrerat i höjd.
- **Innehåll:** H1 "Edison Hemguide", kort intro, lista kapitel 1–5 med kicker/titel + ev.
  `Klart`/`Påbörjat`-badge.
- **A11y:** en `<h1>`, `<ol>` av länkkort ≥44 px, fokusring.

### S2 – Kapitelvy, text-steg
- **Layout:** rail (260 px, sticky) | centrerad läspelare (≤680 px) | balanserad sidoluft.
  Tunn progressstapel under headern.
- **Innehåll:** kapiteltitel, "Steg X av N", vitt barn-kort med 2–3 meningar, nav
  (Föregående/Nästa) i linje under kortet.
- **A11y:** läsmått kapat; rail `aria-current="step"`; fokus till `#step-card` vid stegbyte.

### S3 – Sekvens vs loop · Predict
- **Layout:** scen-stegkort. Scen staplad över text (eller sida-vid-sida ≥1280). Två
  programkolumner ("Tre steg" / "En loop ×3") + tom/placeholder resultatremsa.
- **Innehåll:** fråga "Vad tror du – ger de samma resultat?", knappar "Samma" / "Olika";
  Nästa **avstängd** med synlig hint.
- **A11y:** knappar `aria-pressed`; hint som text, inte bara avstängd knapp.

### S4 – Sekvens vs loop · Run/Investigate
- **Layout:** som S3 men resultatremsan avtäckt; textrad med utfallet + snäll ok-feedback.
- **Innehåll:** "Båda gör samma sak: roboten kör framåt 3 steg." Kort `adult`-fråga inbäddad
  som tips.
- **A11y:** utfallstext i `aria-live="polite"`; **reduced-motion = samma slutläge direkt**,
  ingen animation.

### S5 – Sekvens vs loop · Modify/Make
- **Layout:** som S4 med "Ändra antal varv" ändrat (t.ex. ×4): loop-etikett, resultatremsa
  och textrad uppdaterade samtidigt. Nästa **upplåst**.
- **Innehåll:** "Nu kör loopen 4 gånger – tre staplade steg skulle behöva en rad till."
  `adult`-tips: prova samma sak på riktiga Edison när ni är redo.
- **A11y:** − / + är ≥44 px riktiga knappar; fokus stannar på kontrollen efter ändring;
  ingen mening bärs enbart av färg.

---

## 8. Dev-only visual-QA (beslutad – byggs som eget roadmap-steg, INTE i detta pass)

Per `docs/architecture.md` AD-8: namnge gapet, varför nuvarande kontroller missar det,
vilket kommando som kör det och hur det hålls utanför runtime.

> **Beslutat 2026-06-21 (ägaren):** automatiserad visuell QA **ersätter den manuella
> Chrome-kontrollen som grind för statisk UI/CSS**. Verktyg: **Playwright som enbart
> dev-beroende**. Den täpper exakt luckan jsdom inte kan se (CSS, storlek, reflow, `file://`).
> WebUSB/robotflöde och en sista mänsklig blick förblir manuella. Detta byggs som ett eget,
> avgränsat roadmap-steg **före** desktoplayouten – inte i detta dokumentationspass.

- **Namngivet gap:** *visuell layout-/responsivitetsregression.* `npm test` (jsdom) har
  ingen layout-/CSS-motor, validatorn kollar bara data, och `file://` i Chrome är en
  **manuell** grind som ägaren inte kör vid varje UI-ändring. Därför fångas inte: (a) en
  additiv desktopregel som läcker ner i mobilen, (b) ett för brett textmått, (c) ett ark som
  "flyter" i tom canvas, (d) horisontell scroll/rail-överlapp vid smal viewport.
- **Verktyg:** ett **dev-only** Playwright-skript (`@playwright/test` som `devDependency`,
  `node_modules/` är git-ignorerat). Laddar `index.html` via `file://`. (Om Chromium-
  nedladdningen blir ett hinder är `puppeteer-core` mot redan installerad Chrome en lättare
  reserv – men Playwright är förstahandsvalet enligt beslutet ovan.)
- **Namngivna viewportar:** 390×844 (mobil), 768×1024 (surfplatta), 900×1000 (rail-tröskel),
  1280×900, 1440×900, **1718×920 (~skärmbildens CSS-px)**, samt **~320×800 (reflow-proxy)**.
- **Rutter:** landning (`index.html`), `?kapitel=1` (text+bild), samt framtida
  `?kapitel=N` (Sekvens vs loop).
- **Billiga, deterministiska assertions:** ingen horisontell scroll
  (`documentElement.scrollWidth <= clientWidth`); läspelarens beräknade bredd ≤ ~700 px;
  rail dold <900 / synlig ≥900; arket centrerat (vänster ≈ höger marginal) vid stora bredder;
  **en kolumn ned till ~320 CSS-px** (400 %-ekvivalent reflow – en headless-screenshot bevisar
  inte verklig browserzoom, men fångar att layouten håller på smal viewport).
- **Artefakter:** skärmdumpar till en **git-ignorerad** `artifacts/`-mapp. Pixel-diff-baslinjer
  committas bara om ägaren uttryckligen vill (annars enbart invariant-assertions → inga
  binärer i repo).
- **Kommando:** `npm run snap` (dev-only). Kan senare bli en valfri CI-job; skriptet refereras
  **aldrig** av `index.html`, lägger **ingen** runtime-beroende, och `file://`-/WebUSB-
  kontroll förblir den manuella grinden för det som inte är statisk UI/CSS.

---

## 9. Vad detta pass INTE gör
Ingen ändring i `style.css`, `js/`, `content/`, `index.html`, `package.json` eller tester.
Inga commits/pushar/PR. Måtten blir kanon i `docs/design.md` först när ägaren valt alternativ.
