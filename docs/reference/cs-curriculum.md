# CS-curriculum för barn – idébank & riktning (research-pass)

**Status:** utredning/idébank, INTE beslutade steg. Sparad som referens att anpassa.
Skapad 2026-06-20. Detta är en kort kartläggning – djupdyk görs i en egen session /
deep research (se "Att utforska vidare" sist). Allt här är omskrivet med egna ord;
inget kopierat ur källorna.

## Vision i en mening
Bygg ut "Edison Hemguide" från ren läs-och-svara till ett **litet, eget CS-curriculum**:
korta **interaktiva moduler** i webbläsaren där barnet får *gissa → köra → ändra* och
**se** hur t.ex. en loop skiljer sig från staplade block – och sedan **applicera samma
koncept på den riktiga roboten**. Webben lär konceptet; Edison är "labbet".

## Varför detta är en bra riktning (validering mot etablerad praktik)
Den modellen är i princip exakt hur de stora barn-CS-läroplanerna är byggda:

- **Code.org CS Fundamentals** (K–5, en kurs per årskurs, alignad mot CSTA) blandar
  medvetet **självgående online-moduler** med **"unplugged"-aktiviteter utan dator**
  (papper/fysiska manipulativ, kroppsliga övningar) för att smälta svåra koncept.
  → Vår variant: online-modulen + **roboten** som det fysiska/"plugged"-lagret.
  Edison är ett ovanligt bra unplugged-komplement eftersom konceptet blir kroppsligt
  (roboten kör fysiskt en fyrkant; en oändlig loop *syns* tills man trycker stopp).
- Konceptordningen vi redan följer (sekvens → första program → villkor → loop) är den
  **kanoniska** progressionen i CSTA och code.org. Vi ligger rätt.

## Konceptstege (CSTA-grade-bands + code.org) – var vi är och vad som kommer
CSTA delar in i band (K-2 / 3-5 / 6-8 / 9-12). Kärnkontrollstrukturerna introduceras
så här, ungefär i denna ordning:

1. **Sekvens** – ordningen på instruktioner.  ✅ kap 2
2. **Händelser/events** – "när X händer, gör Y" (knapptryck, klapp).  *(delvis i kap 4)*
3. **Loopar** – upprepa en sekvens.  ✅ kap 5 (annan branch)
4. **Villkor** – om/då, och *medan*-villkor.  ✅ kap 4
5. **Nästlade loopar & sammansatta villkor** – loop i loop; AND/OR/NOT.  ← naturlig fortsättning
6. **Funktioner / "egna block"** – namnge och återanvänd en bit program.  ← senare
7. **Variabler** – spara/ändra ett värde (t.ex. en räknare).  ← senare

**Naturligt nästa innehåll** efter loopar: *events* (om inte täckt), sedan *nästlade
loopar* (kraftfull, men se missuppfattning nedan) och *funktioner/egna block*.

## Pedagogik (forskningsförankrad) – hur modulerna bör fungera
Två väletablerade ramverk, och de pekar åt samma håll:

- **Use–Modify–Create**: börja med färdig kod barnet *använder*, låt det *ändra* den,
  bygg sedan *eget*. Trappar upp tryggt.
- **PRIMM** = **Predict – Run – Investigate – Modify – Make**. Kärn-insikten ur
  forskningen: **låt barnet läsa, spåra och FÖRUTSÄGA kod innan det skriver egen.**
  Att kunna förklara vad ett program gör ger självförtroendet att skriva eget.

Det mappar rakt på det du efterfrågar ("testa vad som händer med olika delar"):
> **Predict** (gissa vad blocken gör) → **Run** (modulen animerar/visualiserar) →
> **Investigate/Modify** (ändra en del – t.ex. repetera 3× istället för 2× – och se
> skillnaden) → **Make** (bygg det på riktigt med Edison).

Detta passar också vår redan dokumenterade linje i `docs/pedagogik.md`
(gör-tillsammans, konkret före abstrakt, gissa→testa→prata).

## Vanliga missuppfattningar att designa MOT (ur forskning)
Att känna till fällorna gör modulerna vassa:

- **Nästlade loopar** misstolkas oftast som *två loopar i sekvens* (största enskilda
  felkällan i studier). En bra visualisering bör göra "loop-i-loop" tydligt fysiskt.
- Loop-**gränser** (hur många varv, var den börjar om) och villkor (vad som testas, när)
  är notoriskt svaga punkter – de är inte synliga i koden, så barnet bygger en felaktig
  mental modell av exekveringen ("notional machine").
- **Varning från visualiserings-forskningen:** drunkna INTE i rad-för-rad-detalj. Bra
  verktyg hjälper barnet *abstrahera bort* oväsentligt och se det **höga mönstret**
  (själva upprepningen), inte varje mikrosteg. Designa visualiseringen kring mönstret.

## Anpassning till barnet i fråga
Profil: stark läsare (läser Percy Jackson / Roald Dahl självständigt), trygg på alla fyra
räknesätt inkl. multiplikation/division och lättare tvåsiffrigt (14×4). Det betyder:

- **Över medianen i abstrakt resonemang** för åldern → vi kan gå lite snabbare och
  djupare än en generisk K-5-kurs, och luta oss mot text (barnet läser gärna).
- **Loop = multiplikation-brygga.** "Repetera 4× { kör framåt }" är bokstavligen
  4 × stegen. Den kopplingen till något barnet redan äger (multiplikation) är guld och
  bör utnyttjas explicit i loop-modulen.
- Klarar troligen **variabler (en räknare)**, **nästlade loopar** och **enkla
  sammansatta villkor** (AND/OR) tidigare än normalt. Håll det konkret/visuellt ändå.
- **Block-först är fortfarande rätt** (forskning: block före text). Text-baserat (EdPy o.d.)
  kan vara ett *senare* spår om intresset håller – flagga, planera inte in nu.

## Konkret minsta prototyp (krok för en framtida session/spik)
Om/när vi vill testa det interaktiva spåret – börja med EN liten sak, inte en motor för allt:

> **"Sekvens vs loop"-visualiseraren.** En liten, deterministisk vanilla-JS-modul som
> animerar Edison på ett litet rutnät (eller en LED som blinkar). Visa **sida vid sida**:
> *3 staplade "kör"-block* mot *repetera 3× { kör }* – samma resultat, och barnet ser att
> loopen är "samma sak, kortare". Lägg till en knapp som ändrar antalet varv (gissa först).

Det träffar exakt din fråga (hur flödet skiljer sig mellan staplade block och loopar),
är litet nog att bygga utan att spränga arkitekturen, och blir en mall för fler moduler.

## Teknisk spänning att vara medveten om (viktigt)
Sajten är medvetet **beroendefri** statisk HTML+CSS+vanilla JS, datamodellen är **bara
strängar** (mobil-redigerbar), ingen fetch. En interaktiv modul innebär:

- En **ny stegtyp** med **riktig renderingslogik** (en liten simulator/animation), eget
  **state** och **a11y** (tangentbord, reduced-motion, text bär fortfarande betydelsen).
  Det är "klurig renderingslogik" → Claude Code/Opus-arbete, inte rutinjobb.
- Den **bryter inte** beroendefriheten (allt går att göra i vanilla JS, lokalt), MEN det
  är det **största nya tillskottet** projektet skulle ta på sig hittills.
- **Designkrav:** håll konfigurationen i datan deklarativ och strängvänlig (t.ex. en liten
  lista "drive, drive, drive" eller "repeat:3 -> drive") så innehållet förblir
  mobil-redigerbart. Lägg ALDRIG kod-i-data; logiken bor i renderaren.

## Rekommendation (process)
1. **Ja till riktningen** – den är pedagogiskt välgrundad och matchar etablerade läroplaner.
2. **Bygg INTE motorn nu.** Lägg riktningen som ett epos i `docs/roadmap.md` (gjort) och
   spara denna referens (gjort).
3. **Nästa innehållssteg kan fortsätta som vanligt** (events / nästlade loopar / egna block)
   med befintliga stegtyper – det blockeras inte av det interaktiva spåret.
4. **När vi vill testa interaktivt:** kör en egen, avgränsad session (eller deep research för
   detaljerad curriculum-design) och börja med "Sekvens vs loop"-spiken ovan.

## Att utforska vidare (deep-research-frågor till en framtida session)
- Detaljerad konceptmappning code.org Course A–F ↔ våra kapitel (vad hoppa över/komprimera).
- Konkreta unplugged-övningar (CS Unplugged, Bebras "computational thinking"-uppgifter) som
  kan bli adult-tips eller egna steg.
- Spec för ett litet deklarativt "block-program"-format som är både mobil-redigerbart och
  körbart av en mini-simulator – datamodell + a11y + reduced-motion.
- Bedömning/återkoppling: hur "Predict" bäst fångas (gissa-knapp före Run) utan att straffa.

## Källor (research-pass 2026-06-20)
- CSTA K-12 Computer Science Standards (Revised 2017) – grade-band-progression, kontrollstrukturer:
  <https://csteachers.org/k12standards/> och PDF: <https://csteachers.org/wp-content/uploads/2025/03/csta-k-12-computer-science-standards-revised.pdf>
- Code.org CS Fundamentals (online + unplugged, K-5): <https://code.org/en-US/curriculum/computer-science-fundamentals> · Unplugged: <https://code.org/curriculum/unplugged>
- PRIMM – pedagogik (Predict-Run-Investigate-Modify-Make), Raspberry Pi Foundation:
  <https://static.raspberrypi.org/files/curriculum/quickreads/11-Pedagogy_Summary_PRIMM_V4_2023.pdf> · översikt: <https://teachcomputing.org/pedagogy>
- Raspberry Pi Foundation – pedagogy review (Use-Modify-Create, läs/spåra före skriv):
  <https://www.raspberrypi.org/app/uploads/2021/11/Teaching-programming-in-schools-pedagogy-review-Raspberry-Pi-Foundation.pdf>
- Missuppfattningar (nästlade loopar, villkor) hos primary-elever, code-tracing:
  <https://dl.acm.org/doi/full/10.1145/3702652.3744225>
- Program-visualisering – lyft mönster, inte bara rad-för-rad-trace:
  <https://arxiv.org/html/2509.26466>
