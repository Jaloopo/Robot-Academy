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
Layout A: lugn, centrerad kolumn. "Ett steg i taget" behålls. Allt är ADDITIVT via
`@media (min-width: 720px)` – mobilens token-/klassvärden ändras inte. `#app` centreras
redan i basen via `margin: 0 auto`. Tillagt block i `style.css`:

```css
/* ADDITIVT — påverkar bara skärmar ≥ 720 px. Mobilen oförändrad. */
@media (min-width: 720px) {
  #app       { max-width: 680px; padding: 3.5rem 1.5rem 3rem; } /* smalt textmått + mer luft */
  body       { font-size: 1.125rem; }   /* additiv brödtext-bump ~18 px */
  .app-title { font-size: 1.75rem; }
  .btn       { min-height: 48px; }       /* lite större träffytor med mus */
  .nav       { gap: 1rem; }
}
```

Layout B (tvådelad vy med kontextspalt/chapter-rail) är FRAMTIDA – den kräver ett nytt
`<aside>`-element och tas först när fler kapitel finns. Implementeras inte nu.

## Designtokens (i synk med `style.css`)
- Bakgrund: `#FAF7F2` (varm off-white)
- Text: `#1F2933`
- Primär (Edison-orange; kanter/fokusring/maskot): `#F26B1D`, mörk (hover/aktiv): `#C8540F`
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
- **Framstegsindikator**: Alternativ A behålls — "Steg X av N" som text. Tydligare för
  barn och helt tillgängligt utan extra a11y-markup.
- **Animation/ljud**: Enbart den korta maskot-nudge-animationen vid rätt svar. Inget ljud.
