# Prompt till Claude Design — Desktop-mockup för Edison Hemguide

Det här dokumentet är en färdig **prompt** att klistra in i Claude Design
(claude.ai/design) för att ta fram en **desktop-version** av guiden. Vi har redan
en mobil-mockup; nu vill vi ha samma sak fast designad för stor skärm
(MacBook + Chrome är primär enhet enligt `docs/plan.md`).

## Så här använder du prompten
1. Öppna ett nytt projekt i Claude Design.
2. Bifoga (ladda upp) dessa filer från repot så att designen bygger på rätt
   underlag i stället för gissningar:
   - `docs/design.md` — visuell spec och designtokens (källa till sanning).
   - `style.css` — implementerade tokens och komponent-CSS.
   - `content/kapitel-1.js` — de riktiga texterna och datamodellen per steg.
   - `js/app.js` — render-/interaktionslogiken (steg-tillstånd, feedback).
   - `docs/plan.md` — kort PRD (målgrupp, enheter, scope).
   - **Den befintliga mobil-mockupen**: packa upp
     `Edison Hemguide design chat-handoff.zip` och bifoga
     `edison-hemguide-design-chat/project/Edison Hemguide - Mockup.dc.html`.
     Den är vår referens för utseende och de A/B-val som redan är gjorda.
3. Klistra in allt under linjen ("PROMPT" nedan) som meddelande.

---

## PROMPT

Du designar en **desktop-version** av "Edison Hemguide", en liten statisk
lärwebbplats på svenska. Barn (ca 7+ med god läsnivå) gör aktiviteterna
tillsammans med en vuxen. Det finns redan en mobil-mockup (bifogad) — din uppgift
är att översätta samma innehåll, tokens och komponenter till en layout som mår bra
på stor skärm. Återanvänd allt befintligt; inför inget nytt designsystem.

### Kontext och underlag (bifogade filer)
- `docs/design.md` är källa till sanning för färger, radie, typografi och
  steg-tillstånd. Följ den.
- `style.css` innehåller de implementerade tokens och CSS-klasserna.
- `content/kapitel-1.js` har de exakta svenska texterna — använd dem i skärmarna,
  hitta inte på egen text.
- `Edison Hemguide - Mockup.dc.html` är den befintliga mobil-mockupen och visar de
  beslut som redan tagits (se "Redan beslutat" nedan).

### Hårda tekniska krav (måste hållas)
- Endast statisk **HTML + CSS + vanilla JS**. Inga ramverk, ingen build, inga
  bundlers.
- Måste fungera både via `file://` och GitHub Pages. **Inga externa beroenden,
  inga CDN, inga nätverksanrop, inga externa fonter.**
- Ikoner och maskot som **inline-SVG** (lokalt). System-font-stack:
  `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
- **All UI-text på svenska.**

### Designtokens (återanvänd exakt — inför inga nya färger)
- Bakgrund `#FAF7F2`, text `#1F2933`, dämpad text `#5c5c5c`.
- Primär orange `#F26B1D`, mörk `#C8540F`.
- **Fylld orange för knapp-/badge-ytor: `#BD4E0A`** (ger vit text ~4.9:1, klarar
  WCAG AA). Behåll `#F26B1D` för kanter, fokusring och maskot. (Detta är ett
  redan beslutat delta från mobil-mockupen.)
- Kort: bakgrund `#FFFFFF`, kant `#e0dbd3`.
- Vuxen-tips: bakgrund `#e3edf7`, kant `#4a7ab5`, etikett-text `#2d5a8e`.
- Rätt svar: kant `#2E7D32`, bakgrund `#E7F3E8`, text `#1E5E22`.
- Försök igen (varnande, ej rött/negativt): kant `#B26A00`, bakgrund `#FBF0DD`,
  text `#7A4A00`.
- Valt (ordning): kant orange, bakgrund `#FFF3E9`.
- Radie 12 px. Brödtext ~17 px, rubrik ~24 px, line-height ~1.55.
- Touch/klick-target min 44×44 px, min 8 px mellanrum.

### Komponenter och steg-tillstånd (samma som mobil — designa alla)
1. **Text-steg (barn)** — vitt kort med stor läsbar text.
2. **Vuxen-tips** — ljusblått kort med etikett "Tips till dig som hjälper".
3. **Flervalsfråga** i tre tillstånd: obesvarad, fel-försök (varnande, ✓/↻-ikon –
   inte bara färg), rätt (rätt alternativ blir grönt, alla låses, "Nästa" aktiveras).
4. **Ordningsfråga** ("klicka i ordning", ingen drag-and-drop): pågående (siffer-
   badge på valda) och rätt sekvens. "Börja om"-knapp.
- Genomgående: rubrik + framsteg högst upp, och **Föregående / Nästa** längst ned.
  "Nästa" är avstängd tills steget är klart/rätt besvarat.

### Redan beslutat i mobil-mockupen (behåll på desktop)
- **Framstegsindikator: text "Steg X av N"** (vald framför 12 prickar) — tydligt
  och a11y-vänligt. Valfri tunn framstegsstapel ok som komplement, men texten ska
  finnas kvar.
- **Liten Edison-maskot** i headern (inline-SVG, ~44–50 px, `aria-hidden`,
  dekorativ). Kort, enstaka reaktion vid rätt svar (`edisonNudge`), aldrig loop, och
  respektera `prefers-reduced-motion`.
- Rätt/försök-igen bärs av **ikon + text + form**, inte enbart färg.

### Vad som är NYTT för desktop (det här vill vi att du löser)
- Mobilen är "en sak per skärm" i en smal kolumn (~600 px). På desktop finns mer
  yta — använd den **medvetet och lugnt**, inte rörigt. Behåll känslan av ett steg
  i taget.
- **Läsbredden får inte sträckas ut**: håll själva steg-kortets textmått runt
  ~600–680 px även om sidan är bred.
- Centrera innehållet på den varma bakgrunden (`#FAF7F2`) med generös luft. Större
  maskot och tydligare rubrik får gärna ta plats när ytan finns.
- Desktop har **hover-tillstånd** och tangentbordsnavigering (MacBook) — visa
  tydlig hover på knappar/alternativ och en synlig fokusring (`#F26B1D`).
- Föreslå gärna ett **A/B-val för desktop-layouten** och rekommendera ett:
  - **A — Lugn centrerad kolumn:** ett brett, luftigt fält med kortet centrerat,
    maskot och "Steg X av N" i toppen. Minimalt, nära mobilen men skalat upp.
  - **B — Tvådelad vy:** en stillsam vänsterspalt med kapiteltitel och
    framsteg/steglista, och huvudytan till höger med det aktiva steget. Mer
    "appkänsla" för en MacBook.
  - Motivera valet utifrån målgrupp (barn + vuxen tillsammans), lugn och a11y.

### Tillgänglighet (måste)
- Kontrast minst WCAG AA. `lang="sv"`. Synlig fokusring. Allt klickbart nåbart med
  tangentbord; riktiga `<button>`. Ingen info enbart via färg.

### Leverans
- Designa **alla skärmar/tillstånd ovan** vid en typisk desktop-bredd (visa t.ex.
  ~1280 px). Använd de riktiga texterna från `content/kapitel-1.js`.
- Visa de valfria A/B-alternativen för desktop-layouten sida vid sida med en kort
  rekommendation.
- Lista till sist eventuella **token-/CSS-deltan** som behövs (helst additiva, inga
  borttagna tokens), så att en kodagent kan föra in dem i `style.css` utan att
  bryta mobilen.
