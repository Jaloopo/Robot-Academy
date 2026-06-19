// Innehåll för Kapitel 1. Laddas via <script> före js/app.js (ingen fetch – funkar på file://).
window.KAPITEL = window.KAPITEL || {};
window.KAPITEL["kapitel-1"] = {
  "id": "kapitel-1",
  "titel": "Lär känna Edison",
  "steps": [
    { "role": "child", "type": "text",
      "text": "Det här är Edison – en liten robot som du kan styra själv. En robot är en maskin som gör saker, men bara om någon talar om exakt vad den ska göra." },
    { "role": "adult", "type": "text",
      "text": "Ta fram roboten nu. Låt barnet hålla i den och titta på hjulen och knapparna innan ni går vidare." },
    { "role": "child", "type": "text",
      "text": "Edison kan köra framåt och bakåt, känna av ljus, höra ljud och se hinder framför sig." },
    { "role": "child", "type": "text",
      "text": "Att roboten är programmerbar betyder att du bestämmer vad den ska göra. Ett program är som en profetia som roboten måste följa – steg för steg, i exakt rätt ordning." },
    { "role": "adult", "type": "text",
      "text": "Fråga barnet vad som händer om man kastar om två steg i en profetia. Roboten gör precis det du säger – inte det du menar." },
    { "role": "child", "type": "text",
      "text": "På Edison finns några knappar. Den runda knappen laddar in ett program. Triangel-knappen (play) startar programmet, och fyrkant-knappen stoppar det." },
    { "role": "child", "type": "question_single_choice",
      "text": "Vilken knapp tror du att du trycker på för att STARTA programmet?",
      "options": ["Den runda knappen", "Triangel-knappen (play)", "Fyrkant-knappen"],
      "correctAnswer": 1 },
    { "role": "child", "type": "text",
      "text": "Edison svarar med ljud och små lampor. Det är robotens sätt att visa att den hör dig och att den förstått ditt program." },
    { "role": "child", "type": "text",
      "text": "En sak till innan vi börjar: kör Edison på golvet eller mitt på ett stort bord, aldrig nära en kant. Plocka undan små saker så att hjulen inte fastnar." },
    { "role": "child", "type": "ordering",
      "text": "Sätt stegen i rätt ordning för att göra roboten redo:",
      "options": ["Sätt på Edison", "Lägg roboten på golvet", "Tryck på play"],
      "correctAnswer": [0, 1, 2] },
    { "role": "child", "type": "text",
      "text": "Bra jobbat! Nu vet du vad Edison är och hur du startar och stoppar den. Nästa gång lär vi roboten att göra något – med riktiga block." },
    { "role": "adult", "type": "text",
      "text": "Avsluta med en fråga – varför måste roboten få veta exakt hur länge den ska köra? Låt barnet gissa." }
  ]
};
