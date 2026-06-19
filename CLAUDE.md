# CLAUDE.md – regler för AI-assistenter

Liten, statisk lärwebbplats på svenska för Edison-roboten V3.
OBS: `CLAUDE.md` och `.cursorrules` ska hållas i synk – ändra alltid båda.

## Arbetsdelning (verktyg/modell)
- Claude Code (Opus): planering, dokumentation (denna fil, `docs/plan.md`,
  `docs/design.md`), datamodell och innehåll (`content/*.js`), samt känsligt/komplext
  arbete – UI/UX-design, tillgänglighet (a11y) och klurig renderingslogik
  (t.ex. ordering/feedback).
- Cursor: rutinmässig, väldefinierad implementation utifrån spec (skelett, CSS enligt
  `docs/design.md`, enkel stegrendering).
- En branch + en PR i taget. Aldrig parallellt arbete på samma filer.
  Visa hela filen när du ändrar den.

## Teknik
- Endast statisk HTML + CSS + vanilla JS. Inga ramverk, ingen build, inga bundlers.
- Måste fungera både via file:// och GitHub Pages. Använd relativa sökvägar (`./...`).
- Inga externa beroenden eller nätverksanrop.
- GitHub Pages publiceras från `main` (root).

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
      "type": "text" | "question_single_choice" | "ordering",
      "text": "...",
      "options": [ ... ],        // endast för question_single_choice och ordering
      "correctAnswer": ... }     // se nedan
- correctAnswer:
    - question_single_choice: 0-baserat index i `options` (t.ex. `1`).
    - ordering: array av index i RÄTT ordning (t.ex. `[0, 1, 2]`).
- adult-steg: skriv INTE "Vuxen:" i texten – renderaren sätter etikett och avvikande
  stil via `role`.

## Rendering
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
