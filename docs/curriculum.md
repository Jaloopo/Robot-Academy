# Curriculum – Edison Hemguide

**Status:** beslutad riktning för kommande interaktiva moduler, 2026-06-21.
Källunderlag och osäkerheter finns i `docs/reference/curriculum-evidence-map.md`.
`docs/reference/cs-curriculum.md` är fortsatt idébank, inte källa till beslut.

## Mål

Edison Hemguide ska hjälpa barn cirka 7–10 år att förstå grundläggande datavetenskap genom
korta interaktiva moduler tillsammans med en vuxen. Barnet kan ha stark läsning och god
matematik, men kärnflödet ska fungera utan att de förmågorna används som urval eller grind.

Webben lär och synliggör begreppet. Den riktiga Edison-roboten är ett frivilligt laboratorium
och får inte vara nödvändig för att slutföra en webbmodul.

## Pedagogiskt grundmönster

Varje interaktiv modul använder så mycket av detta flöde som uppgiften behöver:

1. **Förutsäg:** Vad tror du händer?
2. **Kör eller visa:** Se utfallet utan bestraffning för gissningen.
3. **Undersök:** Peka, spåra och jämför tillsammans med en vuxen.
4. **Ändra en sak:** Se vilken effekt ändringen får.
5. **Skapa eller prova:** Gör en liten egen variant, i webben eller frivilligt med roboten.

Det är en nedskalad kombination av PRIMM och Use–Modify–Create. Exakt användning för
7–10-åringar i hemmet är ett designval och ska följas upp genom observation, inte poäng.

## Beslutad progression

| Ordning | Modul | Barnet ska kunna | Förkunskap | Edison-/matematikbrygga |
|---:|---|---|---|---|
| 1 | **Kort robotorientering** | Skilja mellan vad roboten känner av, vad programmet anger och vad roboten gör | Ingen programmering | Edison som konkret exempel; ingen matematik krävs |
| 2 | **Sekvens och förutsägelse** | Säga vad som händer först/sedan/sist och förutsäga en kort kedja | Vardaglig ordningsförståelse | Ljus, ljud eller rörelse; ordningstal valfritt |
| 3 | **Spåra och felsöka** | Hitta första skillnaden mellan plan och utfall och föreslå en liten ändring | Kort sekvens | Kör ett ”nästan rätt” program; räkna steg valfritt |
| 4 | **Sekvens kontra räknad loop** | Peka ut loopkroppen, räkna varv och förklara när ett mönster upprepas | Sekvens + enkel spårning | `loop number of times`; upprepad addition valfritt |
| 5 | **Sensorer som begränsad input** | Säga vad en sensor kan och inte kan märka | Input/output-språk från orienteringen | Hinder, ljus, linje/yta, knapp eller klapp; mer/mindre valfritt |
| 6 | **Vänta tills något händer** | Skilja ”gör nu” från att programmet väntar innan nästa instruktion | Sekvens + sensorbegrepp | `wait until`; tid i sekunder valfritt |
| 7 | **Sensor–beslut–handling** | Beskriva kedjan input → programregel → handling utan att ge sensorn mänskliga avsikter | Sensorer + väntan | Väl avgränsade sensorreaktioner; enkel tabell valfri |
| 8 | **Rörelse, riktning och geometri** | Planera, prova och justera en enkel bana | Sekvens, loop och felsökning | Höger/vänster, 90°/180°, längd och tid som fördjupning |
| 9 | **Dela upp och skapa** | Dela ett större uppdrag i små testbara delar och återanvända kända mönster | Flera tidigare byggstenar | Edison-projekt sammansatt av tidigare block |
| 10 | **Robotar, data och ansvar** | Ge exempel på robotars begränsningar och människors ansvar | Konkret erfarenhet av program och sensorer | Kort reflektion; inget nytt teknik- eller mattekrav |

### Fördjupning, inte kärna ännu

- riktiga `start events` och samtidighetsliknande beteende,
- meddelanden mellan flera robotar,
- nästlade loopar och sammansatta reaktiva beteenden,
- linjeföljning/optimering,
- byte till EdScratch för procedurer/funktioner och variabler.

`Wait until` är linjär väntan i programflödet och ska inte etiketteras som samma sak som
EdBlocks separata `start events`.

## Hur detta förhåller sig till dagens fem kapitel

Dagens kapitel är introducerande läs- och frågeinnehåll. Tabellen ovan styr **framtida
interaktiva moduler**, inte en omedelbar omnumrering av befintliga kapitel.

| Befintligt kapitel | Användning framåt |
|---|---|
| Kapitel 1: Lär känna Edison | Behåll som onboarding; återanvänd centrala input/output-ord |
| Kapitel 2: Ditt första program | Behåll som sekvensgrund; fördjupa senare med förutsägelse/spårning |
| Kapitel 3: Robotar i världen | Behåll tills vidare; återanvänd/refaktorera senare som ansvarsmodul |
| Kapitel 4: Roboten som känner | Behåll som orientering; framtida interaktiv sensorlogik följer progressionen ovan |
| Kapitel 5: Loopar | Behåll som läskapitel; första interaktiva loopmodulen får en tydligare felsöknings- och loopkroppsdel |

Ingen produktkod eller kapitelordning ändras enbart på grund av researchrapporten. En sådan
ändring kräver ett eget avgränsat innehållsbeslut och testning.

## Nästa produktbeslut

Nästa interaktiva bygge är fortsatt **Sekvens vs loop**. För att uppfylla progressionens
debuggingkrav innehåller det en kort inbyggd spårningskontroll före loopjämförelsen; vi bygger
inte först ett helt separat kapitel eller plugin.

Modulen ska:

- jämföra en upprepad sekvens med en räknad loop,
- göra loopkroppens början och slut synliga,
- låta barnet flytta eller jämföra ett block **inuti och utanför** loopramen,
- fråga ”Vad är det som Edison upprepar?”,
- fungera utan robot, animation eller nätverk,
- följas av arkitektureftergranskning innan nästa interaktiva modul.

Den närmast planerade modulen därefter är **Sensorer som begränsad input**. Observation från
Fas 3 får ändra utformning och tempo, men inte skapa nya abstraktioner eller ett helt nytt
curriculum utan ett separat beslut.
