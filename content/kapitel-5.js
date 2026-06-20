// Innehåll för Kapitel 5. Laddas via <script> före js/app.js (ingen fetch – funkar på file://).
window.KAPITEL = window.KAPITEL || {};
window.KAPITEL["kapitel-5"] = {
  "id": "kapitel-5",
  "titel": "Loopar – göra om och om igen",
  "steps": [
    { "role": "child", "type": "text",
      "text": "Nu kan din robot köra, känna av saker och följa villkor. I det här kapitlet lär du dig ett smart knep: att få Edison att göra samma sak om och om igen utan att du behöver upprepa alla block." },
    { "role": "adult", "type": "text",
      "text": "Loopar (att upprepa) är ett av de viktigaste begreppen i programmering. Ta det lugnt och låt barnet hitta egna exempel på saker som upprepas i vardagen, till exempel att borsta tänderna fram och tillbaka." },
    { "role": "child", "type": "text",
      "text": "En loop är ett block som du lägger runt andra block. Allt som hamnar inuti loopen körs igen och igen. Då slipper du bygga samma sak många gånger." },
    { "role": "child", "type": "text",
      "text": "Edison har två röda lampor som kan lysa. Lägg blocken \"tänd lampan\" och \"släck lampan\" inuti en loop, så blinkar roboten på och av hela tiden." },
    { "role": "child", "type": "question_single_choice",
      "text": "Vad gör en loop med blocken som ligger inuti den?",
      "options": ["Den hoppar över dem", "Den kör dem om och om igen", "Den raderar dem"],
      "correctAnswer": 1 },
    { "role": "child", "type": "text",
      "text": "Tänk dig att du vill att Edison kör en fyrkant. Då behöver roboten köra rakt fram och sedan svänga – fyra gånger. Med en loop bygger du bara \"kör fram, sväng\" en gång och låter loopen upprepa det." },
    { "role": "adult", "type": "text",
      "text": "I EdBlocks finns en hel grupp loop-block. Exakt hur de heter och ser ut kan skilja sig mellan versioner (att verifiera) – utforska blockmenyn tillsammans och prova att dra en loop runt en blockkedja." },
    { "role": "child", "type": "text",
      "text": "En del loopar kör för alltid. Då fortsätter roboten tills du trycker på stoppknappen (fyrkanten) eller stänger av den. Det är perfekt om du vill att Edison spelar musik ända tills någon stoppar den." },
    { "role": "child", "type": "question_single_choice",
      "text": "Du lägger Edisons musik i en loop som kör för alltid. När slutar roboten spela?",
      "options": ["Efter precis en sekund", "Aldrig av sig själv – först när du stoppar den", "Så fort musiken börjar"],
      "correctAnswer": 1 },
    { "role": "child", "type": "text",
      "text": "Nu kopplar vi ihop loopen med en sensor från förra kapitlet. Tänk dig ett program där Edison kör fram, väntar tills den känner ett hinder, svänger och sedan börjar om från början – om och om igen." },
    { "role": "child", "type": "ordering",
      "text": "Sätt blocken i ordning så att Edison kör runt och väjer för hinder, om och om igen:",
      "options": ["Kör rakt fram", "Vänta tills hinder känns", "Sväng åt sidan", "Loopen börjar om från början"],
      "correctAnswer": [0, 1, 2, 3] },
    { "role": "child", "type": "text",
      "text": "Bra jobbat! Nu vet du att en loop låter roboten upprepa saker utan att du bygger om allt. Prova själv att få Edison att blinka, dansa eller köra en fyrkant – om och om igen." }
  ]
};
