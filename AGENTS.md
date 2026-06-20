# AGENTS.md – gemensamma regler för AI-assistenter

Liten, statisk lärwebbplats på svenska för Edison-roboten V3.
Detta är projektets enda källa för gemensamma agentinstruktioner. Claude Code importerar
filen från `CLAUDE.md`, och Cursor kan läsa `AGENTS.md` direkt. Lägg bara verktygsspecifika
tillägg i respektive wrapper – duplicera inte dessa regler.

## Arbetsdelning (uppgiftstyp)
- Använd en stark resonemangsmodell för planering, dokumentation, datamodell, pedagogiskt
  innehåll, UI/UX, tillgänglighet och klurig renderingslogik (t.ex. ordering/feedback).
- En snabbare modell passar rutinmässig, väldefinierad implementation utifrån en tydlig spec.
- Codex, Claude Code och Cursor får alla arbeta i projektet; uppgiftens risk och komplexitet
  styr modellvalet, inte ett hårdkodat verktygsnamn.
- En branch + en PR i taget. Aldrig parallellt arbete på samma filer.
  Namnge alltid berörda filer och sammanfatta diffen; visa hela filen om användaren ber om det.

## Sessioner & handoff
- Källor till sanning: durabla regler i denna fil; **levande tillstånd i `docs/status.md`**;
  ordnad backlog i `docs/roadmap.md`.
- Vid start: läs `AGENTS.md`, `docs/plan.md`, `docs/design.md`, `docs/roadmap.md`,
  `docs/status.md`. Ange status + nästa åtgärd innan du kör verktyg.
- Vid implementation: gör ett roadmap-steg per session. Granskning, felsökning och
  processunderhåll får vara egna tydligt avgränsade pass.
- Vid produktändring: verifiera relevant syntax/test samt `file://` i Chrome och genomklick
  av berört kapitel. Ren dokumentation kräver normalt inte visuell kontroll.
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
- Kör `npm install` en gång, sedan `npm test`. Verifiera fortfarande även `file://` i Chrome.
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
