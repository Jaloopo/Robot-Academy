# Curriculum-evidenskarta – Edison Hemguide

**Status:** kuraterat beslutsunderlag, 2026-06-21. Den fullständiga Deep Research-exporten
är arbetsmaterial och ingår inte i repot. Den här filen innehåller de källor och slutsatser
som får påverka produktbeslut. Beslutad progression finns i `docs/curriculum.md`.

## Omfattning och målgrupp

- Barn cirka **7–10 år** tillsammans med en vuxen medutforskare i hemmet.
- Barnet kan läsa självständigt, eventuellt på ungefär 10–12-årsnivå, och kan de fyra
  räknesätten. Det möjliggör fördjupning men får inte bli en grind i kärnflödet.
- Ingen tidigare systematisk programmeringsundervisning förutsätts.
- Webben ska bära begreppet utan ansluten robot; Edison är ett konkret laboratorium.

## Så läses evidensen

- **[KÄLLA]** återger vad en källa faktiskt stödjer.
- **[EVIDENSSTYRKA]** bedömer stödet för just vårt beslut, inte källans allmänna kvalitet.
- **[DESIGNSLUTSATS]** är en avvägning för Edison Hemguide, inte ett forskningsresultat.
- **[OSÄKERHET]** kräver observation med barn, robot eller aktuell EdBlocks-version.

Officiella standarder används för begrepp och progression, forskning för pedagogiska
principer och Microbric/Meet Edison enbart för produktfakta. Ingen enskild källa bevisar
den exakta modulordningen för ett hemcurriculum med Edison.

## Centrala källor

| Källa | Typ och population | Vad den får stödja | Viktig begränsning |
|---|---|---|---|
| [K–12 Computer Science Framework](https://k12cs.org/) och [Early Childhood-vägledningen](https://k12cs.org/pre-k/) | Officiellt ramverk | Tidig sekvensering, kontroll, problemlösning, representation och frågor som synliggör tänkande | Inte en effektstudie och inte Edison-specifik |
| [CSTA K–12 CS Standards, Revised 2017](https://csteachers.org/k12standards/) | Officiell standard, nivåerna K–2 och 3–5 | Sekvenser och enkla loopar tidigt; senare kombinationer med händelser och villkor | Bevisar inte en viss hemaktivitet eller exakt ordning |
| Anwar m.fl. (2019), [*A Systematic Review of Studies on Educational Robotics*](https://doi.org/10.7771/2157-9288.1223) | Systematisk översikt av 147 studier | Att utbildningsrobotik kan bära programmering, problemlösning och tvärdisciplinärt lärande | Heterogena åldrar, miljöer, robotar och utfall; ger inte Edison-specifik effekt |
| Bers m.fl. (2014), [*Computational thinking and tinkering*](https://doi.org/10.1016/j.compedu.2013.10.020) | Primärstudie, 53 kindergartenbarn, TangibleK/CHERP | Att yngre barn kan arbeta med sekvens, robotik och gradvis ökande kontrollstrukturer | Yngre målgrupp, annan plattform och skolkontext |
| Sentance, Waite & Kallia (2019), [PRIMM](https://doi.org/10.1080/08993408.2019.1608781) | Primärstudie, 493 elever 11–14 år i 13 skolor | Predict–Run–Investigate–Modify–Make och dialog kring program | Äldre elever; nedskalning till 7–10 år i hemmet är en designinferens |
| Lee m.fl. (2011), [Use–Modify–Create](https://doi.org/10.1145/1929887.1929902) | Praktik-/ramverksartikel för unga | Progression från att använda till att ändra och skapa | Bevisar inte exakt modulordning eller Edison-effekt |
| Du, Luxton-Reilly & Denny (2020), [översikt om Parsons-problem](https://doi.org/10.1145/3373165.3373187) | Forskningsöversikt, blandade åldrar | Ordningsuppgifter som en möjlig scaffold | Ensam ordningsträning garanterar inte djup begreppsförståelse |
| [Meet Edison: EdBlocks](https://meetedison.com/robot-programming-software/edblocks/) | Officiell produktinformation | Att EdBlocks är en introduktionsmiljö för Edison och riktar sig till ungefär **7–10 år** enligt aktuell sida | Produktkälla, ingen lärandeeffekt; målålder kan ändras och kontrollerades 2026-06-21 |
| [EdBlocks block guide for Edison V3](https://meetedison.com/teaching-resources/Edison-V3-robot/EdBlocks-block-guide-Edison-V3.pdf) | Officiell funktionsguide | Exakta blockkategorier: bland annat `wait until`, räknade/oändliga loopar och separata `start events` | Versionskänslig; blocknamn och ikoner ska verifieras före Edison-specifik text |
| [Meet Edison: inputs, outputs and sensors](https://meetedison.com/edison-robots-sensors/) | Officiell produktinformation | Vilka sensor- och outputtyper Edison har | Säger inte när begreppen bör undervisas |

## Evidensvägda beslut

| Beslut | Bedömning |
|---|---|
| Sekvens och förutsägelse ska komma före loopar. | **[EVIDENSSTYRKA: stark för begreppsordningen]** Stöds av standarder och närliggande robotikforskning. |
| Barnet ska spåra och jämföra tänkt mot faktiskt utfall före eller i början av första loopmodulen. | **[EVIDENSSTYRKA: medel]** Debugging är en central praktik; exakt placering före loop är en välgrundad designslutsats. |
| Första loopen ska vara räknad och ha tydligt markerad loopkropp. | **[EVIDENSSTYRKA: medel]** Counted loops passar mål och EdBlocks, men exakt aktivitet är ett designval. |
| Webbaktiviteten ska använda Predict/Run/Investigate/Modify och därefter erbjuda frivillig robotprovning. | **[EVIDENSSTYRKA: medel]** PRIMM/UMC stödjer flödet; överföringen till yngre hembruk är en designinferens. |
| Sensorer introduceras först som begränsad input, därefter som del av sensor–beslut–handling. | **[EVIDENSSTYRKA: medel]** Stark Edison-faktagrund, men ordningen är inte direkt effektprövad. |
| `wait until` och formella `start events` ska inte behandlas som samma sak. | **[EVIDENSSTYRKA: stark för produktdistinktionen]** Blockguiden dokumenterar dem separat. När de undervisas är ett designbeslut. |
| Riktiga `start events`, meddelanden och samtidighetsliknande beteende väntar till fördjupning. | **[EVIDENSSTYRKA: medel]** EdBlocks beskriver start-events som avancerade; exakt senare placering återstår att observera. |
| Matematik används som valfri brygga, aldrig som grind. | **[DESIGNSLUTSATS]** Exempel: upprepad addition, vinklar och mätning för den som vill. |

## Edison-/EdBlocks-mappning

| Begrepp | Lämplig Edison-yta | Avgränsning |
|---|---|---|
| Sekvens | Korta kedjor av rörelse, ljus eller ljud | Undvik långa program och hårdvarukrav i webbkärnan |
| Räknad loop | `loop number of times` kring ett eller två tydliga block | Börja inte med oändlig eller nästlad loop |
| Sensor som input | Hinder, ljus, linje/yta, knapp eller klapp | Beskriv vad sensorn kan upptäcka, inte att roboten ”förstår” |
| Vänta tills något händer | `wait until` för exempelvis tid, knapp eller hinder | Detta är blockerande väntan i programflödet, inte samma sak som ett start-event |
| Sensor–beslut–handling | `wait until`, sensorberoende körblock och senare väl avgränsade reaktiva exempel | Använd inte påhittad generell `if/else`-syntax |
| Formella händelser | Gula `start events` | Fördjupning efter stabil sekvens, loop och sensorförståelse |
| Rörelse/geometri | Körning för tid/sträcka och svängning i grader där aktuell guide stödjer det | Praktiskt utfall påverkas av underlag, batteri och miljö |
| Meddelanden/samtidighet | Sända/ta emot mellan robotar | Frivillig fördjupning; kräver mer hårdvara och större felsökningsyta |
| Variabler och funktioner | Inte verifierad EdBlocks-kärna | Utred EdScratch som senare plattformsbyte i stället för att hitta på EdBlocks-stöd |

## Missuppfattningar att designa mot

- **Ordningen spelar ingen roll:** låt barnet peka ut första instruktionen som ändrar utfallet.
- **Fel betyder misslyckande:** jämför förutsägelse och utfall och ändra bara en sak.
- **Loopen är en magisk genväg:** fråga vilket block som upprepas och visa loopkroppens gräns.
- **Allt efter loopen upprepas:** flytta samma block in i och ut ur loopramen.
- **Sensorn vet eller bestämmer:** skilj uttryckligen på input, programregel och handling.
- **`wait until` är samma sak som start-event:** visa först linjär väntan; introducera start-events separat senare.

## Formativ observation utan poäng

Den vuxne kan lyssna efter om barnet kan:

1. förutsäga nästa steg och sedan ompröva utan att skämmas,
2. peka ut första skillnaden mellan plan och utfall,
3. markera vad som ligger inuti loopkroppen,
4. säga vad som ändras när antal varv eller blockplacering ändras,
5. skilja mellan vad en sensor märker och vad programmet gör med informationen.

Appen ska bara spara logiskt modulstate och genomförande, inte poäng, personprofil eller
forskningsliknande bedömningar.

## Kvarvarande osäkerheter

- Den exakta ordningen mellan sensorintroduktion och `wait until` är ett produktbeslut som
  ska prövas med verklig användning; källorna avgör den inte.
- Hemmiljön och vuxenrollen är svagt direkt beforskade jämfört med klassrum.
- Sensoraktiviteters robusthet beror på ljus, yta, hinder och aktuell Edison V3-/EdBlocks-version.
- Första Fas 3-modulen ska därför vara liten. Utvärdera begriplighet och arkitektur innan
  nästa interaktiva modul byggs.
