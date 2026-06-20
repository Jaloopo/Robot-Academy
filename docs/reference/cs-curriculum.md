# CS-curriculum för barn – idébank och riktning

**Status:** utredning/idébank, inte beslutade roadmap-steg. Skapad 2026-06-20 och
anonymiserad för ett publikt repo. All text är omskriven med egna ord; materialet ska
anpassas och faktaverifieras i respektive framtida innehållspass.

## Vision i en mening

Bygg ut Edison Hemguide från läs-och-svara till ett litet CS-curriculum med korta
interaktiva moduler där barnet får **gissa → köra → ändra → se**, och sedan provar samma
idé med den riktiga roboten. Webben lär konceptet; Edison är labbet.

## Varför riktningen passar

Etablerade läroplaner för yngre barn blandar självgående digitala moment med konkreta
aktiviteter utan skärm. Här kan roboten göra kontrollstrukturer kroppsliga: en sekvens
blir en faktisk väg och en oändlig loop syns tills roboten stoppas.

Projektets nuvarande progression ligger nära en vanlig introduktion till programmering:

1. **Sekvens** – ordningen på instruktioner. Kapitel 2.
2. **Händelser** – när något händer startar en handling. Delvis berört i kapitel 4.
3. **Villkor** – om/då och sensorstyrda val. Kapitel 4.
4. **Loopar** – upprepa en sekvens. Kapitel 5.
5. **Nästlade loopar och sammansatta villkor** – loop i loop, flera villkor.
6. **Funktioner eller egna block** – namnge och återanvänd en programdel.
7. **Variabler** – spara och ändra ett värde, till exempel en räknare.

Stegen efter kapitel 5 är kandidater, inte beslut. Händelser kan behöva ett tydligare
eget pass innan svårare kombinationer introduceras.

## Anonym målgruppsprofil

Primär målgrupp är barn omkring sju år och uppåt som läser självständigt och arbetar
tillsammans med en vuxen. Gruppen kommer att variera mycket i läsflyt, matematisk vana,
abstraktionsförmåga, motorik och tidigare programmeringserfarenhet.

Designa därför kärnflödet så att det går att förstå genom kort text, tydlig visuell
förändring och samtal med en vuxen. Erbjud fördjupning som valfria utmaningar i stället
för att anta särskilda bokintressen, exakt skolnivå eller en viss räknefärdighet.
Kopplingen "upprepa fyra gånger" ↔ multiplikation kan användas som en möjlig brygga,
men konceptet måste även förklaras konkret utan krav på att barnet redan behärskar
multiplikation.

Blockbaserad programmering förblir huvudspåret. Textbaserad programmering kan utredas
senare om målgruppen och användartesterna ger ett konkret skäl.

## Pedagogiskt mönster för moduler

Två etablerade ramverk pekar mot samma lågtröskelflöde:

- **Use–Modify–Create:** använd något färdigt, ändra det och bygg sedan eget.
- **PRIMM:** Predict, Run, Investigate, Modify, Make – förutsäg, kör, undersök,
  ändra och skapa.

Översatt till Edison Hemguide:

1. **Gissa:** Vad tror du att blocken gör?
2. **Kör:** Modulen visar resultatet utan att straffa en felaktig gissning.
3. **Undersök:** Barn och vuxen pratar om vad som upprepades eller ändrades.
4. **Ändra:** Barnet justerar en sak, exempelvis antal varv.
5. **Bygg på riktigt:** Samma idé provas med Edison när det är säkert och praktiskt.

Barnet ska läsa och spåra ett litet program innan det förväntas skapa ett eget. Texten
ska vara kort och direkt; vuxensteget ger samtalsfrågor och hjälp utan att ta över.

## Missuppfattningar att designa mot

- En loop i en loop kan misstolkas som två loopar efter varandra. Visualiseringen bör
  tydligt visa vilken upprepning som ligger inuti vilken.
- Loopgränser är osynliga i en blockrad: när börjar nästa varv och när slutar loopen?
- Villkor kan misstolkas om det är oklart när sensorn läses och när villkoret prövas.
- En rad-för-rad-animation kan skapa mer brus än förståelse. Visa det höga mönstret
  och låt barnet se enskilda steg först när det hjälper frågan.

Feedbacken ska vara snäll och informativ. Felaktiga gissningar är data för samtalet,
inte misslyckanden.

## Minsta första interaktiva spik

**Sekvens vs loop:** visa tre staplade kör-instruktioner bredvid en loop som upprepar en
kör-instruktion tre gånger. Båda ger samma slutresultat på ett litet rutnät eller med
en enkel LED-visualisering. Barnet gissar först och kan sedan ändra antalet varv.

Spiken ska vara liten och deterministisk:

- samma input ger samma visuella förlopp;
- texten beskriver resultatet även utan animation;
- tangentbord och touch fungerar;
- reduced motion visar slutläget direkt;
- konfigurationen i kapitelfilen består bara av strängar, tal och listor;
- ingen simulatorlogik eller kod lagras i innehållsdatan.

Den tekniska gränsen för spiken finns i `docs/architecture.md`. Bygg inte spiken innan
den beteendebevarande plugin-refaktorn är verifierad.

## Teknisk spänning

En interaktiv modul är mer än en bild: den får eget state, events, återställning,
persistence, a11y och eventuellt animation. Det är projektets största funktionella
tillskott hittills, även om det kan byggas i lokal vanilla JS utan beroenden.

Håll därför programformatet deklarativt och mobil-redigerbart. Browserpluginet äger
logik och rendering; Node-validatorn äger dataformen; appkärnan äger routing, storage-
envelope och navigering. Lägg aldrig funktioner, HTML eller exekverbar kod i
`content/kapitel-N.js`.

## Rekommenderad process

1. Behåll denna riktning som epos; den är inte en order att bygga en motor.
2. Genomför först den beteendebevarande stegtyps-plugin-refaktorn.
3. Bygg därefter endast Sekvens vs loop som en avgränsad spik.
4. Testa begripligheten med barn och vuxen innan fler interaktiva moduler planeras.
5. Fortsätt gärna med vanliga innehållskapitel oberoende av det interaktiva spåret.

## Frågor för framtida research

- Hur mappar relevanta delar av Code.orgs kurser bäst mot befintliga kapitel utan att
  guiden blir en kopia eller för bred?
- Vilka konkreta aktiviteter från CS Unplugged eller Bebras kan omskrivas till korta
  vuxentips och egna Edison-övningar?
- Vilket minsta deklarativa programformat stödjer sekvens och loop utan att bli en
  generell programspråksmotor?
- Hur fångas Predict/gissningen utan poäng, skam eller onödig lagring?
- Vilka observationer i användartest avgör om nästa koncept bör vara händelser,
  nästlade loopar eller felsökning?

## Källor från research-passet 2026-06-20

- CSTA K-12 Computer Science Standards (Revised 2017), progression och
  kontrollstrukturer: <https://csteachers.org/k12standards/>
- Code.org CS Fundamentals, digitala och unplugged-aktiviteter:
  <https://code.org/en-US/curriculum/computer-science-fundamentals>
- PRIMM och pedagogiköversikt, National Centre for Computing Education:
  <https://teachcomputing.org/pedagogy>
- Raspberry Pi Foundation, pedagogiköversikt om bland annat Use–Modify–Create:
  <https://www.raspberrypi.org/app/uploads/2021/11/Teaching-programming-in-schools-pedagogy-review-Raspberry-Pi-Foundation.pdf>
- Studie om missuppfattningar kring kontrollstrukturer hos yngre elever:
  <https://dl.acm.org/doi/full/10.1145/3702652.3744225>
- Research om programvisualisering och abstraktionsnivå:
  <https://arxiv.org/html/2509.26466>
