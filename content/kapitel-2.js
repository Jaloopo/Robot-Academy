// Innehåll för Kapitel 2. Laddas via <script> före js/app.js (ingen fetch – funkar på file://).
window.KAPITEL = window.KAPITEL || {};
window.KAPITEL["kapitel-2"] = {
  "id": "kapitel-2",
  "titel": "Ditt första program",
  "steps": [
    { "role": "child", "type": "text",
      "text": "Nu ska du lära Edison att göra något själv. Du gör det med ett program – och programmet bygger du av block i en app som heter EdBlocks." },
    { "role": "adult", "type": "text",
      "text": "Öppna EdBlocks-appen för V3 på datorn och koppla in Edison med USB-sladden. Programmering sker via WebUSB, så använd Chrome, Edge eller Opera – inte Safari eller Firefox. Edisons sladd har en USB-A-kontakt – har datorn bara USB-C (t.ex. en MacBook) behövs en USB-C-till-USB-A-adapter." },
    { "role": "child", "type": "text",
      "text": "Ett block är en pusselbit med en order, till exempel ”kör framåt”. Du drar blocken till varandra så att de sitter ihop uppifrån och ner." },
    { "role": "child", "type": "text",
      "text": "När programmet startar läser Edison ett block i taget, uppifrån och ner. Den gör exakt det som står – i exakt den ordning du har lagt blocken." },
    { "role": "child", "type": "question_single_choice",
      "text": "I vilken ordning kör Edison blocken i ditt program?",
      "options": ["Uppifrån och ner, ett i taget", "Den väljer själv ett block", "Alla block på samma gång"],
      "correctAnswer": 0 },
    { "role": "child", "type": "text",
      "text": "Dags för ditt första program! Leta upp ett block som får Edison att köra framåt och dra in det i programmet. Bara ett block räcker för att börja." },
    { "role": "adult", "type": "text",
      "text": "Exakt namn och plats för blocken kan se olika ut i appen – utforska blockmenyn tillsammans och dubbelkolla stegen i EdBlocks (att verifiera) så att de stämmer med er version." },
    { "role": "child", "type": "text",
      "text": "Programmet byggs på datorn, men Edison kan inte se skärmen. Därför skickar du först över programmet till roboten med sladden, och sedan trycker du på play för att köra det." },
    { "role": "child", "type": "ordering",
      "text": "Sätt stegen i rätt ordning för att köra ditt första program:",
      "options": ["Bygg programmet med block", "Skicka programmet till Edison", "Tryck på play"],
      "correctAnswer": [0, 1, 2] },
    { "role": "child", "type": "text",
      "text": "Körde Edison framåt? Då har du gjort ditt allra första program! Prova nu att byta eller lägga till ett block och skicka över det igen – se vad som händer." },
    { "role": "adult", "type": "text",
      "text": "Fråga barnet vad roboten skulle göra om ni la till ett block som svänger. Låt barnet gissa först och testa sedan tillsammans." }
  ]
};
