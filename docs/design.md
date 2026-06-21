# Design – Edison Hemguide (v1)

Visuell spec och designsystem för guiden. Källa till sanning för utseende och
interaktion. Författas i Claude Code (UI/UX-ägare), kan importeras som designsystem i
Claude Design (JSON-tokens nedan), och ligger till grund för CSS:en som Cursor bygger.

> Status: Tokens, steg-tillstånd, maskot och ikonfeedback är IMPLEMENTERADE i
> `style.css`/`js/app.js` (PR 1, 3, 4 + design-deltas). Öppna frågor längst ned är stängda.

## Designprinciper
- Mobil-först, en sak per skärm. Lugnt och lekfullt, inte rörigt.
- Stort och tydligt: barnet ska kunna läsa och träffa knappar utan hjälp.
- Tydlig skillnad mellan "barnets text" och "tips till den vuxne".
- Feedback ska vara snäll och uppmuntrande – aldrig "fel/förlorat".

## Layout
- En kolumn, centrerad, max-bredd ~600 px, sidopadding 16–20 px.
- Vertikalt flöde: [titel/framsteg] → [stegets innehåll] → ["Nästa"-knapp].
- Minimera scroll: ett steg ska oftast få plats utan att scrolla på en telefon.
- Framstegsindikator högst upp (t.ex. "Steg 3 av 12" eller prickar).

### Desktop (≥720 px)
Layout A: lugn, centrerad kolumn, "ett steg i taget" behålls. För polish ramas vyn in som
ett **ark** (`#app`, bakgrund `#FAF7F2`, radie 24 px, mjuk skugga) som vilar på en lugnare
**canvas** (`body` `#e7e5df`) med luft över/under – samma visuella språk som mobil-mockupens
"enhet på canvas". Allt är ADDITIVT via `@media (min-width: 720px)`; mobilens token-/
klassvärden ändras inte. Kortets textmått hålls ~640–660 px. Tillagt block i `style.css`:

```css
@media (min-width: 720px) {
  body { background: #e7e5df; font-size: 1.125rem; }
  #app {
    max-width: 760px; margin: 3rem auto; padding: 2.75rem 3rem 2.25rem;
    background: var(--color-bg); border: 1px solid #ece5da;
    border-radius: 24px; box-shadow: 0 18px 48px rgba(31,41,51,.12);
  }
  .app-title { font-size: 1.75rem; }
  .btn { min-height: 48px; }
  .nav { gap: 1rem; }
}
```

### Desktop (≥900 px)
Layout B (tvådelad vy med kontextspalt/chapter-rail) är IMPLEMENTERAD. Ett nytt
`<aside class="chapter-rail">` renderas av `js/app.js` i kapitelvyn (inte på landningsvyn)
och `#app` får klassen `has-rail`. Spalten är ren KONTEXT – den listar kapitlen, markerar
det aktiva (`aria-current="step"`) och visar dess "Steg X av N", plus en "Alla kapitel"-länk.
Den primära steg-navigeringen (Föregående/Nästa) ligger kvar i `.nav` och dubbleras INTE.
Allt är ADDITIVT via `@media (min-width: 900px)`; mobilen och 720 px-arket är orörda. Under
900 px är `.chapter-rail { display: none }` så vyn förblir en kolumn. Tillagt block i
`style.css`:

```css
.chapter-rail { display: none; }            /* dold som standard */

@media (min-width: 900px) {
  #app.has-rail {
    max-width: 1060px; display: grid;
    grid-template-columns: 248px minmax(0, 1fr);
    column-gap: 2.75rem; align-items: start;
  }
  .has-rail .chapter-rail {
    display: block; position: sticky; top: 3rem;
    align-self: start; padding-right: 2rem; border-right: 1px solid #ece5da;
    max-height: calc(100vh - 8rem); overflow: auto;
  }
  .step-main { min-width: 0; }
  /* Läspelare kapad ≤680 px (direkta barn i .step-main – ingen extra wrapper) */
  .has-rail .step-main > .app-header,
  .has-rail .step-main > .progressbar,
  .has-rail .step-main > #step-card,
  .has-rail .step-main > .nav,
  .has-rail .step-main > .chapter-finish,
  .has-rail .step-main > .chapter-reset {
    max-width: 680px; margin-inline: auto;
  }
  /* .rail-link/.rail-link--current/.rail-kicker/.rail-title/.rail-progress/.rail-overview … */
}
```

### Desktop (≥1200 px)
Alternativ 1 – lugnt skalande ark. Landningsarket (`#app` utan `.has-rail`) växer till **860 px**
(visuellt QA:at mot storyboard – inte 760). Kapitelarket (`#app.has-rail`) växer till **1180 px**;
rail **260 px**, `column-gap: 3rem`, arkpaddning `3rem 3.5rem`, stegkortspadding `2rem`.
Typografi-tak: brödtext **1,1875 rem (19 px)**, `.app-title` **1,9 rem**, `line-height: 1,6` – växer
inte mer vid ≥1440.

**Vertikal balans:** `body` blir `display:flex; flex-direction:column; align-items:center` och
`#app` får `width:100%`, `margin-block:auto`, `margin-inline:0`. Använd **inte**
`place-content:center` / `justify-content:center` på `body` – det kollapsar `#app` till
innehållsbredd och ignorerar `max-width`. Flex + `margin-block:auto` centrerar arket
scroll-säkert (långt innehåll scrollar utan klipp).

Rail: `top: 4rem` (sticky); `max-height: calc(100vh - 8rem); overflow: auto` (satt redan ≥900).

```css
@media (min-width: 1200px) {
  body {
    min-height: 100vh; display: flex; flex-direction: column; align-items: center;
    font-size: 1.1875rem; line-height: 1.6;
  }
  #app {
    width: 100%; margin-block: auto; margin-inline: 0;
    max-width: 860px; padding: 3rem 3.5rem;
  }
  #app.has-rail {
    max-width: 1180px; grid-template-columns: 260px minmax(0, 1fr);
    column-gap: 3rem; padding: 3rem 3.5rem;
  }
  .has-rail .chapter-rail { top: 4rem; }
  .step-card { padding: 2rem; }
  .app-title { font-size: 1.9rem; }
}
```

### Desktop (≥1440 px)
Kapitelarkets **sluttak 1280 px**; rail **280 px**, `column-gap: 3,5rem`, arkpaddning
`3,25rem 4rem`. Landningsarket stannar på **860 px**. Typografin ändras inte.

```css
@media (min-width: 1440px) {
  #app.has-rail {
    max-width: 1280px; grid-template-columns: 280px minmax(0, 1fr);
    column-gap: 3.5rem; padding: 3.25rem 4rem;
  }
}
```

## Designtokens (i synk med `style.css`)
- Bakgrund: `#FAF7F2` (varm off-white)
- Text: `#1F2933`
- Primär (Edison-orange; kanter/fokusring/maskot): `#F26B1D`, mörk (hover/aktiv + rubriktext
  `.app-title`): `#C8540F`. Obs: `#F26B1D` som *text* på `#FAF7F2` når bara ~2,85:1 (under
  WCAG AA), så rubriker använder den mörka varianten (~4,1:1). `#F26B1D` är ok för kanter/
  fokusring/maskot (dekor, ej textbärande).
- **Fylld yta** (`--color-edison-orange-fill: #BD4E0A`): används för `.btn--primary` (bakgrund +
  kant) och `.option-badge` (bakgrund). Vit text på denna ger 4,9:1 → WCAG AA godkänt.
  Behåll `#F26B1D` för kanter, fokusring, hover-outline och maskoten.
- Barn-kort bakgrund: `#FFFFFF`, kant `#e0dbd3`
- Vuxen-tips: bakgrund `#e3edf7`, kant `#4a7ab5`, etikett-text `#2d5a8e`
- Rätt-svar: kant `#2E7D32`, bakgrund `#E7F3E8`, text `#1E5E22`
- Försök-igen (varnande, inte rött/negativt): kant `#B26A00`, bakgrund `#FBF0DD`, text `#7A4A00`
- Valt (ordning): kant orange, bakgrund `#FFF3E9`
- Radie: 12 px (mjuka hörn).
- Typografi: system-font-stack (inga externa fonter – funkar offline/file://).
  Brödtext ~17 px, rubrik ~24 px, line-height ~1.55.
- Touch-target: min 44×44 px, min 8 px mellanrum.

## Komponenter / steg-tillstånd
### 1. Text-steg (role: child)
- Innehåll i ett vitt "barn-kort" med mjuka hörn. Stor läsbar text.
- Primär "Nästa"-knapp längst ner.

### 2. Vuxen-tips (role: adult)
- Avvikande stil: ljusblått kort med liten etikett "Tips till dig som hjälper".
- Etiketten sätts av renderaren via `role` – ingen "Vuxen:" i texten.

### 3. Flervalsfråga (question_single_choice) — implementerad
- Frågetext + en knapp per alternativ (staplade, fullbredd, ≥44 px).
- States per alternativ: normal / fel-försökt (varnande) / rätt (grön).
- Fel svar: snäll retry-feedback, alternativet markeras, man kan försöka igen.
- Rätt svar: ok-feedback, rätt alternativ blir grönt, alla låses, "Nästa" aktiveras.
- "Nästa" är avstängd tills frågan är rätt besvarad.

### 4. Ordningsfråga (ordering) — implementerad
- Alternativen visas i BLANDAD ordning (aldrig i löst ordning).
- Interaktion: "klicka i ordning" – en siffra (badge) visar vald position; valt
  alternativ låses. "Börja om" nollställer. Ingen drag-and-drop.
- Hela sekvensen jämförs mot `correctAnswer`. Rätt → ok-feedback + "Nästa" på.
  Fel → snäll retry-feedback, "Börja om" och försök igen.

## Tillgänglighet (a11y)
- Kontrast minst WCAG AA. Synlig fokusring. `lang="sv"`.
- Allt klickbart nåbart med tangentbord. Knappar är riktiga `<button>`.
- Ingen information enbart via färg: rätt svar leds av en grön ✓-SVG, fel/retry av en
  amber ↻-SVG. Feedback-paragrafen är `role="status" aria-live="polite"`. Alla ikoner är
  `aria-hidden="true"` – texten bär betydelsen.

## Beslutade frågor (stängda)
- **Maskot**: Alternativ B valt — liten (~48 px) inline-SVG-Edison i headerns övre högra
  hörn, `aria-hidden="true"`, dekorativ. Togglar `.is-happy` (CSS `@keyframes edisonNudge`,
  0,9 s, en gång) vid rätt svar. `prefers-reduced-motion: reduce` stänger av animationen.
- **Framstegsindikator**: "Steg X av N" som text (Alternativ A) + en tunn ifylld
  framstegsstapel (`.progressbar`) under headern som komplement. Texten bär a11y; stapeln
  är `aria-hidden`. Inga 12 prickar.
- **Animation/ljud**: Enbart den korta maskot-nudge-animationen vid rätt svar. Inget ljud.
