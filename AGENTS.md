# AGENTS.md – gemensamma regler för AI-assistenter

Liten, statisk lärwebbplats på svenska för Edison-roboten V3.
Detta är projektets enda källa för gemensamma agentinstruktioner. Claude Code importerar
filen från `CLAUDE.md`, och Cursor kan läsa `AGENTS.md` direkt. Lägg bara verktygsspecifika
tillägg i respektive wrapper – duplicera inte dessa regler.

## Arbetsdelning (uppgiftstyp)
- Använd en stark resonemangsmodell för planering, dokumentation, datamodell, pedagogiskt
  innehåll, UI/UX, tillgänglighet och klurig renderingslogik (t.ex. ordering/feedback).
- Vid ny UI/UX, ny interaktion, visuell produktkänsla eller a11y-känsliga beslut: använd
  i första hand Opus 4.8 High eller motsvarande stark high-thinking-modell. För övergripande
  samordning av oklara/flerstegsuppgifter kan en stark GPT-koordinator (t.ex. GPT-5.5 Extra
  High om tillgänglig) vara rimlig, men använd den inte slentrianmässigt för alla delsteg.
- En snabbare modell passar rutinmässig, väldefinierad implementation utifrån en tydlig spec.
- Codex, Claude Code och Cursor får alla arbeta i projektet; uppgiftens risk och komplexitet
  styr modellvalet, inte ett hårdkodat verktygsnamn.
- En branch + en PR i taget. Aldrig parallellt arbete på samma filer.
  Namnge alltid berörda filer och sammanfatta diffen; visa hela filen om användaren ber om det.

## Subagenter & modellkostnad
- En koordinator får använda subagenter för tydligt avgränsad research/planering,
  implementation, review och verifiering. Ge varje subagent exakt scope, filgränser,
  acceptanskriterier och förväntad återrapport.
- Undvik parallell implementation på samma branch eller samma filer. Parallellism är främst
  för readonly-research, review, QA eller isolerade experiment.
- Anta inte att subagenter automatiskt väljer billigaste rimliga modell. Om verktyget låter
  subagenten ärva koordinatorns modell kan en dyr Extra High-session göra enkla delsteg
  onödigt dyra. Ange därför modell medvetet när uppgiften är mekanisk.
- Lämna modellvalet starkt när subagenten ska bedöma UI/UX, a11y, arkitektur, datamodell,
  komplex debug eller slutreview. Välj enklare/snabbare modell för smala, välbeskrivna
  kodflyttar, textändringar, testkörning och rutinmässig kapitel-/asset-implementation.
- Praktisk subagentmatris:
  - **Koordinator:** GPT-5.5 Extra High eller annan toppmodell bara när uppgiften är oklar,
    riskfylld eller flerstegsbetonad.
  - **UI/UX/a11y/design-review:** Opus 4.8 High / high-thinking Opus-klass.
  - **Mellannivå:** använd en stark standard-/high-modell (t.ex. GPT-5.x High om den finns)
    för integrationsarbete, medelsvår debug och review som är för riskfyllt för Composer
    men inte kräver Extra High.
  - **Implementerare för tydlig spec:** Composer 2.5 (inte Fast) eller motsvarande billigare
    kodmodell; håll scope till få filer och tydliga acceptanskriterier.
  - **Readonly research, sökning, testkörning, enkel QA:** enklare/snabbare modell räcker
    normalt; använd inte Extra High om inte resultatet kräver svår bedömning.

## Sessioner & handoff
- Källor till sanning: durabla regler i denna fil; **levande tillstånd i `docs/status.md`**;
  ordnad backlog i `docs/roadmap.md`.
- Vid start: läs `AGENTS.md`, `docs/plan.md`, `docs/design.md`, `docs/roadmap.md`,
  `docs/status.md`. Ange status + nästa åtgärd innan du kör verktyg.
- Vid implementation: gör ett roadmap-steg per session. Granskning, felsökning och
  processunderhåll får vara egna tydligt avgränsade pass.
- Vid produktändring: verifiera relevant syntax/test. När visual-QA-harnessen finns används
  `npm run snap` som grind för statisk UI/CSS, reflow och `file://`-resurser; utöka dess
  browserflöde när en ändrad interaktion behöver verifieras. Manuell Chrome-/hårdvarukontroll
  krävs bara för WebUSB/robotflöden eller ett uttryckligt ägarbeslut. Ren dokumentation kräver
  normalt inte visuell kontroll.
- Arbeta på en branch, aldrig direkt på `main`. Håll ändringar lokala som standard.
  Committa, pusha, öppna/stäng PR eller merga endast när användaren uttryckligen ber om det.
- Vid ett faktiskt roadmap-steg: uppdatera `docs/status.md` (nuläge, gjort, beslut,
  varningar och nästa steg) och bocka av i `docs/roadmap.md`. En ren granskning ska inte
  skapa dokumentbrus. Lägg bara en ny copy-paste-prompt när den behövs för en verklig handoff.

## Teknik
- Endast statisk HTML + CSS + vanilla JS. Inga ramverk, ingen build, inga bundlers.
- Måste fungera både via file:// och GitHub Pages. Använd relativa sökvägar (`./...`).
- Inga externa beroenden eller nätverksanrop **i sajten**. (`index.html` laddar bara lokala
  `./...`-filer.)
- GitHub Pages publiceras från `main` (root).

## Testverktyg (dev)
- `npm test` kör en jsdom-genomklick (`test/clickthrough.test.js`) mot den riktiga
  renderaren + innehållet: gating, fel→rätt, blandad ordning/"Börja om", bakåtnavigering.
- `jsdom` är ett DEV-beroende i `package.json`; `node_modules/` är git-ignorerat och ingår
  ALDRIG i sajten. Testet använder Nodes inbyggda `node:test`/`node:assert` (inget ramverk).
- Kör `npm install` en gång, sedan `npm test`. När visual-QA-harnessen har lagts till körs även
  `npm run snap` för statisk UI/CSS och `file://`-resurser. WebUSB/robotflöden kan inte täckas
  fullt automatiskt och hålls därför utanför denna grind tills ett separat testupplägg finns.
- Testet läser `correctAnswer` ur `window.KAPITEL` (hårdkodar inga svar) – fungerar för nya
  kapitel utan ändring.
- Genomklicket laddar AUTOMATISKT alla `content/kapitel-*.js` och klickar igenom var och en
  (gating, fel→rätt, blandad ordning, rätt avslutslänk). Ett NYTT kapitel testas alltså bara
  genom att lägga till filen – ingen teständring behövs. Trasig kapiteldata (t.ex.
  `correctAnswer` utanför index) får `npm test` att faila. Manuell `file://`-koll behövs då
  främst för PR:ar som rör `js/app.js` eller `style.css` (logik/visuellt), inte rent innehåll.
- `npm run validate` (`tools/validate-content.js`) validerar datamodellen i alla
  `content/kapitel-*.js`: id matchar filnamn, `role`/`type` giltiga, `text` finns, `options`
  ≥2, `correctAnswer` i range (flerval) resp. permutation (ordering). Exit 1 vid fel. Körs i CI
  före `npm test`. Rent Node (ingen jsdom), inget sajtberoende.
- CI (`.github/workflows/ci.yml`) kör på **Node 22** (krävs för glob i `node --test`). Bör vara
  en **required check** i repo-inställningarna så att grönt faktiskt gatear merge.
- Nytt kapitel: utgå från mallen `content/_mall.js` (kopiera → `content/kapitel-N.js`, fyll i,
  lägg till `<script>`-rad i `index.html`). Mallen laddas aldrig av sajt/test/validator.

## Innehåll & laddning
- ALL UI-text på svenska. Kodkommentarer får vara på engelska.
- INGEN fetch/JSON – file:// blockerar fetch i Chrome (CORS).
- Innehåll ligger i `content/kapitel-N.js` som sätter:
    window.KAPITEL = window.KAPITEL || {};
    window.KAPITEL["kapitel-N"] = { id, titel, steps: [ ... ] };
- `index.html` laddar varje kapitel via `<script src="./content/kapitel-N.js"></script>`
  FÖRE `js/app.js`. `app.js` läser `window.KAPITEL`. Nytt kapitel = ny script-rad.
- Innehållet ska gå att redigera från GitHub-mobilappen utan att röra logiken.

## Datamodell
- Container: `{ "id": "kapitel-N", "titel": "...", "steps": [ <steg>, ... ] }`
- Steg:
    { "role": "child" | "adult",
      "type": "text" | "image" | "question_single_choice" | "ordering",
      "text": "...",
      "options": [ ... ],        // endast för question_single_choice och ordering
      "src": "./assets/...",     // endast för image (LOKAL sökväg, ingen CDN/fetch)
      "alt": "...",              // endast för image (text-alternativ, a11y)
      "correctAnswer": ... }     // se nedan
- correctAnswer:
    - question_single_choice: 0-baserat index i `options` (t.ex. `1`).
    - ordering: array av index i RÄTT ordning (t.ex. `[0, 1, 2]`).
- adult-steg: skriv INTE "Vuxen:" i texten – renderaren sätter etikett och avvikande
  stil via `role`.

## Rendering
- image: visa en lokal bild (`src`) med `alt`-text. Bilden är ett KOMPLEMENT – texten bär
  betydelsen. Inga externa bilder/CDN; lyft ALDRIG bilder/skärmdumpar ur EdBlocks-PDF/app
  (Microbrics upphovsrätt) – egna inline-SVG eller egna foton, lokalt i `assets/`.
- question_single_choice: visa knappval, ge snäll rätt/fel-feedback.
- ordering: renderaren MÅSTE blanda visningsordningen och jämföra klick-/pil-sekvensen
  mot `correctAnswer`. Visa aldrig alternativen i löst ordning. INGEN drag-and-drop –
  använd "klicka i ordning" eller upp/ner-pilar.

## Pedagogik
- Görs tillsammans (barn + vuxen). God läsnivå, men max 2–3 meningar per steg.
- Tilltala barnet direkt ("Du", "din robot"). adult-steg = korta tips till den vuxne.
- Lekfulla metaforer (t.ex. program = en slags instruktion eller profetia) är välkomna,
  men ska inte överanvändas eller byggas på en specifik bokserie.

## UX
- Mobil-först, responsiv upp till desktop (≥720 px breddar textmåttet additivt):
 en kolumn, inga sidopaneler. Touch-knappar minst 44 px.
- En "Nästa"-knapp per steg, minimera scroll.
- Visuell spec finns i `docs/design.md`.

## Edison V3-fakta
- EdBlocks-appen för V3: https://www.edblocksapp.com/v3/
- Programmering sker via WebUSB i en Chromium-webbläsare (Chrome, Edge eller Opera) –
  inte Safari/Firefox. Antag MacBook + USB-kabel för programmeringssteg.
- Hitta ALDRIG på Edison-fakta. Är du osäker: skriv inte ut det som sanning – flagga
  det som "att verifiera" och lyft till människan.

## Referensmaterial
- `docs/reference/` kan innehålla EdBlocks-lärarguiden som IDÉBANK.
  Kopiera ALDRIG text därifrån – skriv om allt med egna svenska ord.
- Stora binärer (PDF) committas inte – se `.gitignore`.
