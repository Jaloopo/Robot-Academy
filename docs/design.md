# Design – Edison Hemguide (v1)

Visuell spec och designsystem för guiden. Källa till sanning för utseende och
interaktion. Författas i Claude Code (UI/UX-ägare), kan importeras som designsystem i
Claude Design (JSON-tokens nedan), och ligger till grund för CSS:en som Cursor bygger.

> Status: UTKAST för diskussion. Värdena nedan (färger, typografi) är sensibla
> startpunkter – justera fritt innan PR 1.

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

## Designtokens (startvärden)
- Bakgrund: `#FAF7F2` (varm off-white)
- Text: `#1F2933`
- Primär (Edison-orange; knappar/accent): `#F26B1D`
- Primär mörk (hover/aktiv): `#C8540F`
- Barn-kort bakgrund: `#FFFFFF`
- Vuxen-tips: bakgrund `#EAF2FB`, kant `#B9D4F2`, text `#234E78`
- Rätt-svar: `#2E7D32`. Försök-igen: `#B26A00` (varnande, inte rött/negativt)
- Radie: 16 px (mjuka hörn). Skugga: subtil.
- Typografi: system-font-stack (inga externa fonter – funkar offline/file://).
  Brödtext ~18–20 px, rubrik ~24–28 px, line-height ~1.5.
- Touch-target: min 44×44 px, min 8 px mellanrum.

## Komponenter / steg-tillstånd
### 1. Text-steg (role: child)
- Innehåll i ett vitt "barn-kort" med mjuka hörn. Stor läsbar text.
- Primär "Nästa"-knapp längst ner.

### 2. Vuxen-tips (role: adult)
- Avvikande stil: ljusblått kort med liten etikett "Tips till dig som hjälper".
- Etiketten sätts av renderaren via `role` – ingen "Vuxen:" i texten.

### 3. Flervalsfråga (question_single_choice)
- Frågetext + en knapp per alternativ (staplade, fullbredd, ≥44 px).
- States per alternativ: normal / vald / rätt (grön) / fel (varnande gul-orange).
- Efter svar: kort uppmuntrande feedback; rätt svar kan visas. "Nästa" aktiveras.
- Tangentbord: alternativen nåbara via Tab/Enter.

### 4. Ordningsfråga (ordering)
- Alternativen visas i BLANDAD ordning (aldrig i löst ordning).
- Interaktion: "klicka i ordning" (siffra dyker upp när man valt) ELLER upp/ner-pilar.
  Ingen drag-and-drop i v1.
- Kontroll: jämför vald sekvens mot `correctAnswer`. Snäll feedback + möjlighet att
  försöka igen.

## Tillgänglighet (a11y)
- Kontrast minst WCAG AA. Synlig fokusring. `lang="sv"`.
- Allt klickbart nåbart med tangentbord. Knappar är riktiga `<button>`.
- Ingen information enbart via färg (lägg till ikon/text för rätt/fel).

## Att besluta (öppet)
- Maskot/illustration av Edison? (måste i så fall vara lokal asset, inget CDN.)
- Framstegsindikator: text vs. prickar.
- Ljud/animation vid rätt svar? (håll lätt; ska funka utan nät.)
