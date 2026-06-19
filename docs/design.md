# Design – Edison Hemguide (v1)

Visuell spec och designsystem för guiden. Källa till sanning för utseende och
interaktion. Författas i Claude Code (UI/UX-ägare), kan importeras som designsystem i
Claude Design (JSON-tokens nedan), och ligger till grund för CSS:en som Cursor bygger.

> Status: Tokens och steg-tillstånd nedan är IMPLEMENTERADE i `style.css`/`js/app.js`
> (PR 1, 3 och 4). Öppna frågor längst ned kvarstår för en Claude Design-runda.

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

## Designtokens (i synk med `style.css`)
- Bakgrund: `#FAF7F2` (varm off-white)
- Text: `#1F2933`
- Primär (Edison-orange; knappar/accent): `#F26B1D`, mörk (hover/aktiv): `#C8540F`
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
- Ingen information enbart via färg (lägg till ikon/text för rätt/fel).

## Att besluta (öppet)
- Maskot/illustration av Edison? (måste i så fall vara lokal asset, inget CDN.)
- Framstegsindikator: text vs. prickar.
- Ljud/animation vid rätt svar? (håll lätt; ska funka utan nät.)
