# Modulspecifikation – "Sekvens vs loop" (första interaktiva modulen)

**Typ:** källbelagd pedagogisk spec för EN modul (Uppgift B). Ingen kursplan, ingen
produktkod. Målgrupp: barn ca **7–10 år tillsammans med en vuxen**. Den tekniska gränsen
för spiken finns i `docs/architecture.md`; den bredare riktningen i
`docs/reference/cs-curriculum.md`.

**Datum:** 2026-06-21 · **Status:** förslag. Bygg modulen först efter den verifierade
Fas 2-refaktorn (nu mergad) och enligt Fas 3.

> **Källprincip:** nedan skiljs **[KÄLLA]** (vad en primär-/förstahandskälla faktiskt
> säger) från **[DESIGNSLUTSATS]** (mitt designval för den här modulen). Inget kursmaterial
> kopieras; all text omskrivs med egna ord. Edison-specifika fakta tas enbart från
> Microbric/EdBlocks/meetedison.com och flaggas "att verifiera" när blocknamn varierar.

---

## 1. Källor (primär/förstahand)

1. **CSTA K-12 Computer Science Standards (Revised 2017).**
   <https://csteachers.org/k12standards/> · PDF:
   <https://csteachers.org/wp-content/uploads/2025/03/csta-k-12-computer-science-standards-revised.pdf>
   - **[KÄLLA]** **1A-AP-10** (åk K-2, begrepp *Control*): "Develop programs with sequences
     and simple loops, to express ideas or address a problem."
   - **[KÄLLA]** **1B-AP-10** (åk 3-5, *Control*): "Create programs that include sequences,
     events, loops, and conditionals."
   - **[KÄLLA]** Standardens förklaring: "Loops allow for the repetition of a sequence of
     code multiple times" och "Control structures specify the order in which instructions
     are executed within a program."
2. **K-12 Computer Science Framework.** <https://k12cs.org/>
   - **[KÄLLA]** Begreppet *Control* (under Algorithms & Programming) beskriver hur ordning,
     val och upprepning styr exekvering; progressionen går från sekvens till loopar/villkor.
3. **PRIMM – originalforskning.** Sentance, S., Waite, J., & Kallia, M. (2019). *Teaching
   computer programming with PRIMM: a sociocultural perspective.* Computer Science Education,
   29(2-3), 136–176. DOI: <https://doi.org/10.1080/08993408.2019.1608781>
   - **[KÄLLA]** PRIMM = **Predict, Run, Investigate, Modify, Make**, förankrat i Vygotskys
     sociokulturella teori (språk/dialog, mediering, närmaste utvecklingszon). Studien
     utvärderade PRIMM i 13 skolor med 493 elever **i åldern 11–14 år** och fann bättre
     resultat i eftertestet än kontrollgruppen.
   - **[DESIGNSLUTSATS]** Modulen lånar PRIMM:s **ordning och dialogfokus**, men målgruppen
     här är yngre (7–10) och arbetar med en vuxen. Att skala ned PRIMM dit är ett designval,
     inte ett fynd i artikeln; den vuxnes samtal (Investigate) bär därför extra vikt.
4. **Use–Modify–Create – ursprung.** Lee, I. m.fl. (2011). *Computational Thinking for Youth
   in Practice.* ACM Inroads, 2(1), 32–37. DOI: <https://doi.org/10.1145/1929887.1929902>
   - **[KÄLLA]** UMC beskriver en progression där eleven först **använder** något färdigt,
     sedan **ändrar** det och till sist **skapar** eget, för att stegvis ta ägarskap.
5. **Pedagogiköversikt (förstahands-sammanställning).** Raspberry Pi Foundation, *Teaching
   programming in schools: a review of the pedagogy* (2021).
   <https://www.raspberrypi.org/app/uploads/2021/11/Teaching-programming-in-schools-pedagogy-review-Raspberry-Pi-Foundation.pdf>
   · National Centre for Computing Education: <https://teachcomputing.org/pedagogy>
   - **[KÄLLA]** Sammanställer bl.a. PRIMM, Use–Modify–Create och vikten av att *läsa/spåra*
     kod innan man skriver egen.
6. **Yngre barns begreppsutveckling / missuppfattningar om kontrollstrukturer** (idébank i
   `docs/reference/cs-curriculum.md`): ACM-artikel
   <https://dl.acm.org/doi/full/10.1145/3702652.3744225> och programvisualisering
   <https://arxiv.org/html/2509.26466>.
   - **[KÄLLA]** Dokumenterar att loop-/villkorsbegrepp ofta missförstås och att
     visualiseringens abstraktionsnivå påverkar förståelsen.
7. **Edison-specifika fakta:** Microbric/EdBlocks och <https://meetedison.com/> +
   <https://www.edblocksapp.com/v3/>. Verifierade loop-fakta finns i `docs/status.md`
   ("Verifierade loop-fakta"). **[KÄLLA]** En loop läggs *runt* andra block och upprepar dem;
   det finns en oändlig loop ("kör för alltid"); ett program stoppas med den fyrkantiga
   stoppknappen. Exakta blocknamn varierar per version → hålls på begreppsnivå.

---

## 2. Lärandemål

Efter modulen ska barnet (tillsammans med vuxen) kunna:

1. Säga med egna ord att en **sekvens** är *ordningen* på instruktioner. **[KÄLLA: CSTA
   Control]**
2. Säga att en **loop** *upprepar* en eller flera instruktioner flera gånger. **[KÄLLA:
   CSTA 1A-AP-10 + förklaring]**
3. Känna igen att **tre staplade KÖR-steg** och **en loop som kör KÖR ×3** kan ge **samma
   resultat** – samma sak uttryckt på två sätt. **[DESIGNSLUTSATS, ur projektets riktning i
   `cs-curriculum.md`]**
4. Förutsäga ("gissa") ett litet utfall och sedan **ändra antal varv** och säga hur
   resultatet ändras. **[KÄLLA: PRIMM Predict/Modify; UMC Use→Modify]**

Avgränsning: målet är **inte** att skriva ett eget program, förstå villkor/förgrening eller
nästlade loopar. Det är begreppen *sekvens* och *upprepning* samt idén "samma resultat,
olika uttryck".

---

## 3. Två vanliga missuppfattningar (att designa mot)

1. **"Loop = trolleri / annat resultat."** Barn antar att loopen gör något *annat* än de
   staplade stegen, i stället för *samma sak färre block*. **[KÄLLA: dokumenterade
   loop-missuppfattningar, källa 6]**
   → **[DESIGNSLUTSATS]** Visa båda programmens utfall på **samma** resultatremsa så
   likheten blir konkret; säg den i text.
2. **"Var börjar/slutar upprepningen?"** Loopgränsen är osynlig i en blockrad – det är oklart
   när ett varv slutar och nästa börjar. **[KÄLLA: loopgränser, källa 6 +
   `cs-curriculum.md`]**
   → **[DESIGNSLUTSATS]** Rita en tydlig **ram** runt det som upprepas + en synlig etikett
   "×N", och låt "Ändra antal varv" visa att bara siffran (inte blocken inuti) ändras.
3. **"En loop är bara en genväg."** Barnet kan se loopen som en magisk knapp som "når målet"
   utan att förstå att det är **blocket inuti ramen** som upprepas. Då fastnar fokus på att
   båda programmen *når fram*, inte på själva innebörden (upprepning).
   → **[DESIGNSLUTSATS]** Lägg en enkel **kontrollfråga** som testar innebörden, inte bara
   slutmålet: *"Vad är det som Edison upprepar?"* (se §4 Investigate och §7).

(Nästlade loopar vs två loopar efter varandra är en känd missuppfattning **[KÄLLA: källa 6]**
men ligger **utanför** denna modul – se §8.)

---

## 4. Flöde 3–5 minuter (Predict / Run / Investigate / Modify / Make)

Ramverket är PRIMM **[KÄLLA: Sentance, Waite & Kallia 2019]**; nedskalat till 7–10 år med
vuxen är **[DESIGNSLUTSATS]**. Varje steg är max 2–3 meningar (projektets skrivregel,
`docs/pedagogik.md`).

1. **Predict (~45 s) – gissa.** Visa två små program sida vid sida: "Tre steg" (tre staplade
   KÖR) och "En loop" (KÖR ramad, etikett "×3"). Fråga: *"Tror du de gör samma sak eller
   olika?"* Två knappar. Ingen bestraffning av gissningen.
2. **Run (~30 s) – kör/visa.** En "Visa"-knapp avtäcker **en** resultatremsa (3 rutor/3
   LED-prickar) för båda programmen + en textrad: *"Båda gör samma sak: roboten kör framåt
   tre steg."*
3. **Investigate (~60 s) – undersök tillsammans.** En kort `child`-text + ett `adult`-tips
   med samtalsfrågan (§6). Här bär den vuxnes dialog förståelsen (PRIMM:s sociokulturella
   kärna). **[KÄLLA: dialogfokus]** Lägg in en enkel **kontrollfråga** som testar innebörden,
   inte bara att målet nås: *"Vad är det som Edison upprepar?"* (rätt svar pekar på blocket
   inuti loop-ramen, inte på "hela programmet" eller "knappen"). Motverkar missuppfattning 3.
4. **Modify (~60 s) – ändra en sak.** "Ändra antal varv" (− / +, t.ex. 2–5). Loop-etiketten,
   resultatremsan och textraden uppdateras. Poäng: bara **siffran** ändras i loopen, medan de
   staplade stegen skulle behöva *en rad till* per varv. **[KÄLLA: UMC Modify]**
5. **Make (~30 s) – gör på riktigt (utanför webben).** Ett `adult`-tips uppmuntrar att prova
   samma idé med riktiga Edison när det är säkert och praktiskt: kör framåt tre gånger, sedan
   en loop. **Webben lär konceptet; roboten är labbet.** **[DESIGNSLUTSATS, ur
   `cs-curriculum.md`]** Ingen robotanslutning i appen (se §8).

Totalt ~3,5–4,5 min. Allt fungerar utan animation, på mobil och utan hårdvara.

---

## 5. Textbärande alternativ till animation

Animation är ett **komplement**; betydelsen måste finnas i text och tydlig statisk form
**[KÄLLA: a11y/"text bär betydelsen", `docs/pedagogik.md` + `docs/a11y.md`]**.

- **Statisk slutbild + textrad:** resultatremsan visar slutläget och en mening anger det
  ("Roboten kör framåt tre steg. Samma sak händer i båda."). Inget rörligt krävs.
- **Loopens upprepning i ord:** "Loopen tar blocket inuti ramen och gör om det 3 gånger."
- **Användarstyrd stegning i stället för auto-animation:** en "Visa nästa varv"-knapp som
  barnet trycker själv (ingen tidsstyrd rörelse) – bra vid reduced motion och för långsam
  takt.
- **`prefers-reduced-motion: reduce`:** visa slutläget direkt, ingen rörelse; textraden är
  identisk oavsett rörelseinställning. **[KÄLLA: `docs/architecture.md` reduced motion]**
- **Form + funktion, inte färg:** loop-ramen och etiketten "×N" bär gränsen; rutor/prickar
  beskrivs i text, inte enbart via färg.

---

## 6. Vuxenfråga (`adult`-steg)

En öppen fråga, inte en föreläsning **[KÄLLA: `docs/pedagogik.md`]**:

> *"Titta på de två programmen. Vad är samma och vad är olika? Om roboten skulle köra framåt
> tio gånger – vilket sätt vore minst jobbigt att bygga?"*

Syftet är att få barnet att sätta ord på *upprepning* och inse att loopen skalar bättre än
att stapla fler block. Den vuxne lyssnar och speglar, rättar inte.

---

## 7. Vad vi observerar för att avgöra om modulen fungerar

Observationer (inga poäng, ingen skam, minimal lagring **[KÄLLA: PRIMM Predict utan
bestraffning; `cs-curriculum.md`]**):

- **Begriplighet:** kan barnet, efter Run/Investigate, med egna ord säga att de två
  programmen gör *samma sak*? (Vuxen noterar informellt; appen lagrar bara "klart".)
- **Predict→omvärdering:** ändrar barnet sin förståelse efter att ha sett utfallet, utan att
  känna att gissningen var ett "fel"?
- **Innebörd, inte bara mål (kontrollfrågan):** svarar barnet på *"Vad är det som Edison
  upprepar?"* med blocket inuti loop-ramen – inte "hela programmet" eller "knappen"? Det
  skiljer verklig förståelse från "loopen är bara en genväg".
- **Modify-insikt:** säger barnet att man bara ändrar *siffran* i loopen, medan staplade steg
  kräver fler block?
- **Genomförbarhet:** klaras modulen på ~3–5 min utan att den vuxne måste förklara hela
  gränssnittet? Fastnar någon på interaktionen (knappar, "Ändra varv")?
- **A11y i praktiken:** fungerar flödet med enbart tangentbord och med reduced motion, och
  bär texten betydelsen utan animationen?

Dessa signaler avgör (i Fas 4) om nästa koncept bör vara händelser, nästlade loopar eller
felsökning **[öppen fråga i `cs-curriculum.md`]**.

---

## 8. Tydlig gräns (vad modulen INTE gör)

- **Ingen robotanslutning.** Ingen WebUSB, ingen `navigator.usb`, ingen hårdvaruberoende
  gating. Modulen fungerar fullt ut utan Edison; "gör på riktigt" sker offline med roboten,
  inte i appen. **[KÄLLA: `docs/architecture.md` "Frivilligt WebUSB-stöd"]**
- **Ingen förgrening/villkor.** Inga om-då-val, inga grenval, ingen rutt som hoppar mellan
  steg. Flödet är linjärt. **[KÄLLA: `docs/architecture.md` "Framtida förgrening (utanför
  fas 2)"]**
- **Ingen generell programspråksmotor.** Ingen tolk, ingen kod i `content/`-data; programmet
  är **deklarativ** indata (strängar, tal, listor) och en liten, isolerad, ren mini-runner i
  pluginet ger JSON-säkert utfall. Inga funktioner/HTML/exekverbar kod i kapitelfilen.
  **[KÄLLA: `docs/architecture.md` AD-5 + `cs-curriculum.md`]**
- **Inga nästlade loopar / sammansatta villkor / variabler.** De är kandidater för senare
  moduler, inte denna. **[KÄLLA: `cs-curriculum.md` progression]**

---

## 9. Inga produktändringar i detta pass
Detta är en spec. Ingen kod, ingen ny stegtyp, inget `content/`-innehåll och inga tester
skapas här. Modulen byggs som Fas 3 mot plugin-kontraktet, efter ägarens beslut.
