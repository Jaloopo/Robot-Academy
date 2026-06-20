# Arkitektur & beroende-policy – planering INNAN det interaktiva bygget

**Status:** levande planeringsdokument + beslutslogg. Skapad 2026-06-20.
Syftet är att planera strukturen **innan** vi bygger interaktiva moduler, så vi slipper
hamna i en jättefil / spagettikod som måste refaktoreras i efterhand. Inga kodändringar
görs av detta dokument – det sätter ramarna och loggar besluten.

## Huvudprincip
**Additivt + tydliga gränser + plugin-mönster.** Nytt ska kunna läggas till utan att
röra kärnan (routing/state/storage). Varje del har ett litet, tydligt ansvar och ett
litet API mot resten. Vi bestämmer gränserna FÖRST, bygger sedan in i dem.

## Den stora risken och motmedlet
- **Risk:** `js/app.js` växer till en jättefil när varje ny stegtyp (inkl. interaktiva
  simulatorer) läggs in inline i samma `switch`. Det är precis så spagetti uppstår.
- **Motmedel – renderar-registry:** varje stegtyp blir en **egen renderare** som
  *registrerar sig* i en map (`type -> renderer`). Kärnan slår bara upp rätt renderare;
  den känner inte till detaljerna. En ny typ = en ny liten fil + en registrering, utan att
  röra routing/state. Dagens `renderStepContent`-switch refaktoreras mot detta.

## ⚠️ Kritisk teknisk begränsning (lätt att missa sent)
**ES-moduler (`<script type="module">` / `import`) fungerar INTE på `file://` i Chrome**
(modulskript blockeras av CORS lokalt). Det betyder: vi kan **inte** splittra `app.js` i
import/export-moduler utan att offra `file://` – en av produktens kärnkrav (förälder kan
öppna sajten direkt, redigera innehåll från mobilen, GitHub Pages).

**Två vägar att modularisera:**
- **(A) Namespace-script-filer (REKOMMENDERAS):** dela koden i flera *vanliga*
  `<script>`-filer som registrerar sig i ett namespace, t.ex.
  `window.EdisonApp.renderers["image"] = …`. Exakt samma beprövade mönster som
  `content/kapitel-N.js` redan använder mot `window.KAPITEL`. Behåller `file://`, ingen
  build, ingen ny komplexitet. Modularisering utan moduler.
- **(B) Build-steg + dev-server:** först då kan ES-moduler/import användas – men det
  **offrar `file://`** och inför en byggkedja. Tas bara vid ett *konkret* tvång vi inte
  kan lösa i (A). Idag finns inget sådant tvång.

## Beroende-policy (när är ett beroende värt det?)
Svar på "ska man lägga in andra beroenden": **default nej för sajten**, ja för rena
dev-verktyg. Beslutsram:

| Typ | Regel |
|-----|-------|
| **Runtime-beroende i sajten** (ramverk, lib som laddas av `index.html`) | **Nej** som default. Bryter `file://`, mobil-redigerbarhet, "ingen CDN/fetch", beroendefrihet. Kräver extraordinärt skäl. |
| **Dev-beroende** (jsdom, validator, ev. linter) | **Ja** om det *bara* är dev: git-ignorerat (`node_modules/`), laddas ALDRIG av sajten. (Som idag.) |
| **Build-steg/bundler** | Bara om interaktiva moduler bevisligen inte går i vanilla JS – de gör det. Revidera endast vid konkret blocker (väg B ovan). |

**Tumregel innan något beroende läggs till:** (1) löser det ett problem vi *faktiskt* har,
(2) går det inte rimligt i vanilla JS, (3) bryter det inte `file://`/mobil/Pages, (4) är
vinsten större än kostnaden (inlåsning, underhåll, attackyta)? Alla fyra → kanske. Annars nej.

## Gränssnitt vi bör definiera FÖRE första interaktiva typen
- **Stegtyp-kontrakt:** ett litet, stabilt API per renderare, t.ex.
  `render(step, ctx) -> { el, getState, isDone }` (eller liknande), så att gating/storage/
  navigation fungerar likadant för alla typer utan specialfall i kärnan. Definieras innan
  vi bygger den första interaktiva renderaren, så att alla framtida moduler passar in.
- **Simulator som isolerad enhet:** den interaktiva "program-köraren" (t.ex. Edison på ett
  rutnät/LED) byggs som en **fristående mini-modul**: deklarativt strängformat in
  (t.ex. `["drive","drive","drive"]` eller `{repeat:3, body:["drive"]}`), animation ut.
  Den känner INTE till routing/storage. Testbar isolerat; återanvändbar mellan moduler.
- **Deklarativ konfig i datan:** interaktiva steg konfigureras med strängar/listor i
  `content/kapitel-N.js` så innehållet förblir mobil-redigerbart. **Kod-i-data förbjudet** –
  logiken bor i renderaren/simulatorn, aldrig i kapitelfilen.

## Guardrails mot drift (billiga, gör skillnad)
- En renderare **per fil**; håll filer och funktioner små och enbenta.
- Validatorn (`tools/validate-content.js`) vaktar dataformen – utöka den när nya stegtyper
  tillkommer (kräv rätt fält, förbjud kod-i-data).
- **Beslutslogg nedan** hålls uppdaterad så beslut inte omförhandlas varje session
  (viktigt i den här fler-sessions-modellen).

## Beslutslogg (ADR-lätt – lägg till poster, ändra inte historik)
- **AD-1 – Beroendefri statisk sajt, `file://` + GitHub Pages.** Bekräftad, behålls.
  Drivs av produktkravet: öppna direkt, redigera innehåll från mobilen, ingen byggkedja.
- **AD-2 – Ingen ES-modul-split utan build.** `file://`-CORS blockerar modulskript.
  Modularisera via **namespace-script-filer** (väg A), inte `import`/`export`.
- **AD-3 – Renderar-registry för stegtyper.** Planerad liten refaktor av `renderStepContent`
  innan interaktiva typer, så `app.js` inte blir en jättefil.
- **AD-4 – Deklarativ, strängvänlig konfig för interaktiva steg.** Kod-i-data förbjudet;
  simulatorn är en isolerad enhet med ett litet API.

## Föreslagen ordning (en roadmap-step i taget – ingen big-bang)
1. **Arkitektur-/kontraktssession (planering, ingen kod):** skärp detta dokument; spika
   stegtyp-kontraktet och namespace-layouten (`window.EdisonApp.*`). → Opus.
2. **Liten säker refaktor:** `app.js` → renderar-registry. Befintliga typer **oförändrade i
   beteende**, alla tester gröna. Bevisar mönstret och sänker redan dagens risk. → Opus.
3. **Första interaktiva spik:** "Sekvens vs loop"-renderaren mot kontraktet + en isolerad
   mini-runner (Edison på rutnät/LED). → Opus.
4. **Utvärdera, sedan skala:** fler interaktiva moduler som plugins; återbesök beroende-/
   build-frågan bara om en konkret blocker dyker upp.

> Koppling: den pedagogiska riktningen och konceptstegen ligger i
> `docs/reference/cs-curriculum.md`. Detta dokument är dess *tekniska* motsvarighet.
