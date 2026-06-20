# Roadmap & samordning – Edison Hemguide

Detta dokument är den **bestående riktningen** för projektet och definierar den
**samordnande rollen**. En ny session ska läsa detta + `CLAUDE.md`, `docs/plan.md` och
`docs/design.md` innan den börjar. Allt arbete sker mot `main` (containrar är flyktiga –
det som inte är committat och pushat försvinner).

## Var vi är (status)
- Kapitel 1 "Lär känna Edison" är **funktionellt komplett**: text-steg, vuxen-tips,
  flervalsfråga och ordningsfråga – med gating, snäll feedback och a11y.
- Designsystem implementerat (tokens, WCAG AA-fix, ikonfeedback, maskot).
- **Mobil + desktop** klart: mobil-först bas + additivt desktop-ark (≥720 px) på lugn
  canvas, samt tunn framstegsstapel. Desktop ≥900 px har dessutom en chapter-rail
  (kontextspalt) i kapitelvyn.
- Innehåll i `content/kapitel-1.js` och `content/kapitel-2.js` (`window.KAPITEL`).
- Flerkapitelstöd finns: utan query visas landningsvy; `?kapitel=N` väljer kapitel via
  redan laddade lokala script och fungerar på `file://`.

## Roller (vem gör vad)
- **Samordnare / planerare (Claude Code, Opus):** äger denna roadmap, granskar
  byggarbete, fattar datamodell- och a11y-beslut, skriver klurig logik (rendering,
  flerkapitels-routing, ordering/feedback), författar innehåll (pedagogik + Edison-fakta).
- **Byggare (Cursor / enklare modell):** väldefinierad rutinimplementation utifrån spec
  och mockup (CSS, skelett, ett nytt kapitel enligt mall).
- **Design (Claude Design):** mockups och A/B-beslut; levererar additiva token-/CSS-deltan.
- En branch + en PR i taget. Aldrig parallellt arbete på samma filer.

## Modellval (tumregel)
- **Opus** när uppgiften kräver omdöme/avvägning/säkerhet: samordning, granskning,
  renderings-/routing-logik, datamodell, innehåll med pedagogik och Edison-faktakänsla,
  a11y-bedömning.
- **Enklare/snabb modell** när uppgiften är "följ specen exakt": CSS från mockup,
  mekanisk refaktor, lägga till `content/kapitel-N.js` + en `<script>`-rad enligt mall,
  textjusteringar.
- Kort: *bedömning → Opus; mekanik → enklare.*

## Roadmap (ordnad)
0. **(✓ KLAR)** **Granska byggarbetet** (UI-grunden mobil + desktop) mot `docs/design.md`,
   a11y och `file://`. — Opus. Klar: inga regressioner, additivt, mobil <720 px oförändrad.
   Resultat: desktop-blocket är helt additivt (`@media (min-width: 720px)`), inga externa
   beroenden/fonter/fetch, riktiga `<button>`, fokusring, `lang="sv"` och ikon+text (inte
   enbart färg). Genomklick verifierad via committat jsdom-test (se steg 5).
1. **(✓ KLAR)** **Flerkapitelstöd:** avhårdkoda `CHAPTER_ID` i `js/app.js`; kapitelval via
   `?kapitel=N` (funkar på `file://`) + enkel landningsvy som listar `window.KAPITEL`;
   "klart → nästa/tillbaka". — Opus (logik). Resultat: landningsvy listar laddade kapitel,
   `?kapitel=N` route:ar utan fetch/server, sista steget länkar till nästa kapitel eller
   kapitelöversikt. Verifierat med jsdom-genomklick av två kapitel + Chrome `file://`.
2. **(✓ KLAR)** **Layout B – chapter-rail** på desktop (≥900 px): ny
   `<aside class="chapter-rail">` (kontext, ej dubblerad nav). — Claude Code/Claude Design.
   Resultat: railen renderas av `js/app.js` i kapitelvyn (`#app.has-rail`, steginnehåll i
   `.step-main`), listar kapitlen, markerar det aktiva (`aria-current="step"`) + dess "Steg X
   av N" och en "Alla kapitel"-länk. Den primära steg-nav:en (Föregående/Nästa) ligger kvar i
   `.nav` och dubbleras inte. Allt additivt via `@media (min-width: 900px)`; mobil + 720 px-arket
   orört (`.chapter-rail { display:none }` under 900 px). Verifierat: `node --check`, `npm test`
   (9 tester) och `file://`-genomklick i Chrome (mobilbredd + desktop ≥900 px).
3. **(✓ KLAR)** **Kapitel 2-innehåll** (EdBlocks / första programmet). — Opus (pedagogik;
   Edison-fakta skrivs om med egna ord, osäkert flaggas "att verifiera"). Resultat: ny
   `content/kapitel-2.js` ("Ditt första program", 11 steg: text, vuxen-tips, en flervalsfråga
   om körordning, en ordningsfråga bygg→skicka→play) enligt datamodellen + ny `<script>`-rad i
   `index.html` före `js/app.js`. Renderare/datamodell/CSS orörda. Appspecifika osäkerheter
   (exakta blocknamn/placering) flaggade "att verifiera" i ett vuxen-tips. Verifierat:
   `node --check`, `npm test` (9 tester) och `file://`-genomklick i Chrome (kapitel 1 + 2,
   gating, fel→rätt, blandad ordning, avslutslänk "Till kapitelöversikt").
4. **(✓ KLAR)** **"Explore"-fördjupning:** korta avsnitt om robottyper (robotarmar, Roomba m.m.).
   Externa länkar ok; bilder MÅSTE vara lokala assets (inget CDN); fakta omskriven. — Opus.
   Resultat: nytt `content/kapitel-3.js` ("Robotar i världen", 13 steg: text, vuxen-tips, två
   flervalsfrågor och en ordningsfråga känna av→följa program→göra något) enligt datamodellen +
   ny `<script>`-rad i `index.html` före `js/app.js`. Renderare/datamodell/CSS orörda. Formbeslut:
   eget kapitel med BEFINTLIGA stegtyper, INGA bilder/inbäddade länkar (renderaren escapar text,
   så `<img>`/`<a>` kräver logikändring → flaggat som möjligt eget, additivt steg senare). Fakta
   hålls säker/allmängiltig och omskriven med egna ord. Verifierat: `node --check`, `npm test`
   (9 tester) och `file://`-genomklick i Chrome (landningsvy + kapitel 3, gating, fel→rätt,
   blandad ordning, avslutslänk "Till kapitelöversikt").
5. **Nice-to-have:** framstegssparande (`localStorage`; opålitligt på `file://`), lätt
   ljud/animation.
   **Framstegssparande (✓ KLAR):** `js/app.js` har en säker `localStorage`-wrapper
   (feature-detect + `try/catch` runt både åtkomst och `setItem`) som degraderar till en
   tyst no-op när storage saknas/blockeras (jsdom på `file://` saknar det helt; verifierat
   att riktiga Chrome på `file://` DÄREMOT sparar). Per-kapitel sparas besvarade frågor
   (`done`/`chosen`/`picks`) + senaste steg; vid omladdning återupptas kapitlet och sparade
   rätta svar visas gröna. Sparad data validerar version + stegantal (ändrat innehåll kastar
   stale-data i stället för att felmappa). Landningsvyn märker `Klart`/`Påbörjat`, rail
   (≥900 px) märker `Klart`, och en "Börja om kapitlet"-kontroll nollställer. Datamodellen
   orörd; sajten fortsatt beroendefri. Verifierat: `node --check`, `npm test` (**14 tester**)
   och `file://`-genomklick i Chrome (resume efter reload, badges, reset).
   **Committad dev-testharness (✓ KLAR):** `npm test` kör en jsdom-genomklick
   (`test/clickthrough.test.js`) mot den riktiga renderaren + innehållet och verifierar gating,
   fel→rätt-feedback, blandad ordning/"Börja om" och bakåtnavigering. `jsdom` är ett
   DEV-beroende (`package.json`, `node_modules/` är git-ignorerat) – **sajten själv är fortsatt
   beroendefri** och laddas oförändrad via `file://` och GitHub Pages.
   **Utbyggt:** testet genomklickar nu AUTOMATISKT alla riktiga `content/kapitel-*.js` (inte
   bara kapitel 1 + ett syntetiskt inline-kapitel). Nytt kapitel = bara ny fil, ingen
   teständring; trasig kapiteldata får `npm test` att faila. Möjligt nästa processteg:
   GitHub Actions-CI som kör `node --check` + `npm test` på varje PR.
   **CI-fix (✓ KLAR):** CI:n (tillagd i steg 4-PR:en) var i praktiken röd på varje körning –
   inklusive push till `main` – eftersom den var pinnad på Node 20 där `node --test
   "test/**/*.test.js"` inte expanderar globben ("Could not find …"). Lokalt (Node 22) såg
   testet grönt ut, så felet var osynligt. Åtgärd: CI bumpad till Node 22 (matchar devmiljön).
   `npm test` (14) verifierad grön både lokalt och i CI efter fixen.

## Meta-pass: backlog att utforska (kartlagt 2026-06-20)
Detta är en **idé-/utredningsbacklog**, inte beslutade steg. Tas EN i taget; varje post
utreds först (kort kartläggning + rekommendation) innan ev. implementation. Markera
✓ KLAR / pågående efter hand. Ordningen är inte huggen i sten.

### A. Innehåll & pedagogik
- **Pedagogik-research:** kort omvärldskoll (åldersanpassning 7–10 år, scaffolding,
  "gör tillsammans"-modellen) → konkreta riktlinjer i `docs/`. Påverkar ton/steglängd.
- **Edison-faktagranskning:** gå igenom kapitel 1–3 mot källa (EdBlocks V3), lyft allt som
  är "att verifiera". Hitta ALDRIG på fakta (se CLAUDE.md).
- **Innehållstäckning:** är 3 kapitel rätt scope? Kandidater till nytt kapitel/modul
  (t.ex. sensorer, loopar, felsökning) eller referenssida. Beslut om bredd vs djup.
- **Bilder/media:** kapitel 3 flaggade att `<img>`/inbäddade länkar kräver en additiv,
  escapad mediastegtyp – utred om det är värt det (lokala assets, ingen CDN).

### B. UI/UX- & a11y-granskning
- **Strukturerad genomgång av `docs/design.md` mot bygget:** responsivitet (mobil→desktop,
  rail ≥900 px), touch-mål ≥44 px, fokusring, "text bär betydelse"-principen.
- **WCAG-kontroll:** kontrast på nya badges (`Klart`/`Påbörjat`), tab-ordning, skärmläsar-
  genomgång av kapitelflödet. Ev. liten a11y-smoke i testet.
- **Reduced-motion:** maskot-nudge + ev. kommande animation ska respektera
  `prefers-reduced-motion`; verifiera.

### C. Författarflöde & grundfiler (effektivitet)
- **Kapitelmall + checklista:** en `content/_mall.js` + kort guide så nya kapitel kan
  skrivas snabbt (även från GitHub-mobilappen) utan att röra logiken.
- **Schema-validator i CI:** validera datamodellen (`correctAnswer` i range, `ordering` =
  permutation av index, `options` finns för rätt typer). Fångar trasig kapiteldata tidigt.
  ("Backend"-känslan utan server: ren Node-validering, inget nytt sajtberoende.)
- **Skärp `CLAUDE.md`/`.cursorrules`:** håll i synk, förtydliga sessionsprotokoll/handoff
  utifrån vad som faktiskt fungerat. Ev. kort PR-checklista.

### D. Test- & CI-robusthet
- **CI som verklig grind:** (Node-pinningen åtgärdad ovan.) Överväg att göra CI obligatorisk
  för merge och lägga till `node --check` på fler filer / länk-/sökvägskoll.
- **Fler tester:** schema-validering (se C), ev. liten a11y-/struktur-smoke. `file://`-
  genomklick förblir manuell grind för CSS/visuellt.
- **GitHub Pages-verifiering:** bekräfta att deploy från `main` (root) fungerar och att
  relativa sökvägar (`./…`) håller på Pages som på `file://`.

## Arbetsflöde & verifiering
- Utveckla på en branch, merga till `main`. **Öppna ingen PR om användaren inte ber om det.**
- Desktop-CSS ska vara **additiv** (`@media (min-width: …)`); rör inte mobilens värden.
- Verifiera före merge: öppna `index.html` via `file://` i Chrome (inga konsolfel, inga
  nätverksanrop), och klicka igenom kapitlet (gating, fel→rätt, ordning). `node --check js/app.js`.
- Håll `CLAUDE.md` och `.cursorrules` i synk.

## Hårda krav (sammanfattning – se CLAUDE.md)
Ren statisk HTML+CSS+vanilla JS, ingen build. Fungerar via `file://` och GitHub Pages.
Inga ramverk/CDN/externa fonter/nätverksanrop. All UI-text på svenska. Datamodellen
(`window.KAPITEL`, `correctAnswer`) rörs inte vid design-/UI-arbete. Hitta aldrig på
Edison-fakta.
