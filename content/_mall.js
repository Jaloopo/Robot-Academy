// MALL för ett nytt kapitel – KOPIERA, byt namn och fyll i.
//
// Så här gör du (går att göra från GitHub-mobilappen, utan att röra logiken):
//   1. Kopiera denna fil till content/kapitel-N.js (N = nästa lediga nummer).
//   2. Byt ut id, titel och steg nedan. id MÅSTE matcha filnamnet ("kapitel-N").
//   3. Lägg till en rad i index.html FÖRE js/app.js:
//        <script src="./content/kapitel-N.js"></script>
//
// Denna _mall.js laddas ALDRIG av sajten, testet eller validatorn (bara kapitel-<siffra>.js).
//
// Datamodell (se CLAUDE.md för detaljer):
//   role:          "child" | "adult"   (adult = kort tips till den vuxne)
//   type:          "text" | "question_single_choice" | "ordering"
//   type:          ... eller "image" – en lokal illustration (komplement, texten bär betydelsen)
//   text:          svensk text, max 2–3 meningar. Tilltala barnet direkt ("Du", "din robot").
//                  adult-steg: skriv INTE "Vuxen:" – renderaren sätter etiketten automatiskt.
//   options:       endast för question_single_choice och ordering (minst 2 alternativ)
//   correctAnswer: question_single_choice = 0-baserat index i options (t.ex. 1)
//                  ordering = array av index i RÄTT ordning, en permutation (t.ex. [0, 1, 2])
//   src/alt:       endast för "image". src = LOKAL sökväg (./assets/...), ingen CDN/fetch.
//                  alt = text-alternativ (a11y). Lyft ALDRIG bilder ur EdBlocks-PDF/app – egna SVG/foton.
//
// Checklista innan commit:
//   [ ] id matchar filnamnet ("kapitel-N")
//   [ ] <script>-rad tillagd i index.html före js/app.js
//   [ ] All UI-text på svenska; max 2–3 meningar per steg
//   [ ] Edison-fakta verifierad mot källa eller flaggad "att verifiera" (hitta ALDRIG på)
//   [ ] npm run validate  -> "Innehållsvalidering OK"
//   [ ] npm test          -> grönt (nya kapitlet genomklickas automatiskt)
//   [ ] file:// i Chrome   -> genomklick (gating, fel->rätt, blandad ordning, avslutslänk)

window.KAPITEL = window.KAPITEL || {};
window.KAPITEL["kapitel-N"] = {
  "id": "kapitel-N",
  "titel": "Kapitlets titel",
  "steps": [
    { "role": "child", "type": "text",
      "text": "Inledande text som tilltalar barnet direkt och förklarar vad ni ska göra." },
    // Exempel på ett bild-steg (egen lokal SVG/bild – avkommentera och byt src/alt/text):
    // { "role": "child", "type": "image",
    //   "src": "./assets/din-bild.svg",
    //   "alt": "Kort beskrivning av bilden för skärmläsare.",
    //   "text": "Bildtext som förklarar vad barnet ser." },
    { "role": "adult", "type": "text",
      "text": "Kort tips till den vuxne (utan \"Vuxen:\"-prefix)." },
    { "role": "child", "type": "question_single_choice",
      "text": "En fråga med exakt ett rätt svar?",
      "options": ["Ett fel alternativ", "Det rätta alternativet", "Ett annat fel"],
      "correctAnswer": 1 },
    { "role": "child", "type": "ordering",
      "text": "Sätt stegen i rätt ordning:",
      "options": ["Gör det här först", "Sedan det här", "Sist det här"],
      "correctAnswer": [0, 1, 2] },
    { "role": "child", "type": "text",
      "text": "Avslutande text som sammanfattar vad barnet lärt sig." }
  ]
};
