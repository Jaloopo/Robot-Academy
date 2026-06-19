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
  canvas, samt tunn framstegsstapel.
- En enda kanonisk innehållskälla: `content/kapitel-1.js` (`window.KAPITEL`).

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
1. **Flerkapitelstöd:** avhårdkoda `CHAPTER_ID` i `js/app.js`; kapitelval via `?kapitel=N`
   (funkar på `file://`) + enkel landningsvy som listar `window.KAPITEL`; "klart →
   nästa/tillbaka". — Opus (logik). Klar: kan växla kapitel, funkar `file://` + Pages.
2. **Layout B – chapter-rail** på desktop (≥900 px): ny `<aside class="chapter-rail">`
   (kontext, ej dubblerad nav). Tas först när steg 1 finns. — Claude Code/Claude Design.
3. **Kapitel 2-innehåll** (EdBlocks / första programmet). — Opus (pedagogik; Edison-fakta
   skrivs om med egna ord, osäkert flaggas "att verifiera").
4. **"Explore"-fördjupning:** korta avsnitt/länkar om robottyper (robotarmar, Roomba m.m.).
   Externa länkar ok; bilder MÅSTE vara lokala assets (inget CDN); fakta omskriven. — Opus.
5. **Nice-to-have:** framstegssparande (`localStorage`; opålitligt på `file://`), lätt
   ljud/animation. **Committad dev-testharness (✓ KLAR):** `npm test` kör en jsdom-genomklick
   (`test/clickthrough.test.js`) mot den riktiga renderaren + innehållet och verifierar gating,
   fel→rätt-feedback, blandad ordning/"Börja om" och bakåtnavigering. `jsdom` är ett
   DEV-beroende (`package.json`, `node_modules/` är git-ignorerat) – **sajten själv är fortsatt
   beroendefri** och laddas oförändrad via `file://` och GitHub Pages.

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
