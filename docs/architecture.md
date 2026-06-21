# Arkitektur och plugin-kontrakt för stegtyper

**Status:** Fas 2 är implementerad i arbetsgrenen. Uppdaterad 2026-06-20 mot den
aktuella registry-refaktorn. Dokumentet beskriver det implementerade kontraktet och
sätter gränser inför framtida interaktiva stegtyper. Det ändrar inte produktens
datamodell eller beteende.

## Mål och icke-mål

Målet är att en ny stegtyp ska kunna läggas till som ett plugin utan nya typvillkor i
appkärnan. Kontraktet måste omfatta hela stegets livscykel: state, återställning,
serialisering, framstegsstatus, gating, HTML-rendering och event-bindning.

För den första refaktorn gäller samtidigt:

- Behåll statisk HTML, CSS och vanilla JS utan runtime-beroenden eller buildsteg.
- Behåll stöd för både `file://` och GitHub Pages.
- Behåll dagens `window.KAPITEL`-data och lagringsformatets yttre kapitel-envelope.
- Behåll dagens mönster: bygg en HTML-sträng, sätt `innerHTML`, bind sedan events.
- Behåll dagens UI, feedback, fokus, routing och `localStorage`-degradering.
- Bygg ingen interaktiv simulator och gör inget DOM-paradigmskifte i refaktorn.

## Varför ett renderar-registry inte räcker

Dagens `js/app.js` specialbehandlar `question_single_choice` och `ordering` på flera
ställen:

1. `makeStepState` skapar olika state.
2. `restoreProgress` tolkar sparade poster per typ.
3. `persistProgress` serialiserar och avgör `completed` per typ.
4. `chapterProgressStatus` och `hasResettableProgress` hittar framsteg per typ.
5. `renderStepContent` väljer typspecifik HTML.
6. `render` avgör navigeringsgating via state och bygger en typspecifik hint.
7. Event-bindningen väljer handlers och selektorer per typ.

Ett registry som bara ersätter `renderStepContent` lämnar därför merparten av
kopplingen kvar. Målbilden är ett **stegtyps-plugin-registry**, där kärnan känner till
kontraktet men inte de registrerade typnamnen.

## Ansvarsgränser

### Appkärnan äger

- kapitelrouting, numerisk kapitelordning, landningsvy och chapter-rail;
- aktuellt kapitel/steg och Föregående/Nästa/avslut;
- den yttre `localStorage`-envelopen: versionsnummer, kapitel-id, aktuellt steg,
  `completed` och en post per steg;
- feature-detection och tyst no-op när `localStorage` är blockerat på `file://`;
- uppslagning av plugin, anrop i rätt livscykelordning och cleanup före omrendering;
- gemensamt kortskal, vuxenetikett, framstegsstapel, nav, reset och maskot;
- gemensamma hjälpare för escaping, feedbackmarkup och avgränsad fokusåterställning;
- en säker, synlig felvy när en stegtyp saknas eller ett plugin bryter kontraktet.

Kärnan får inte innehålla `switch`, `if` eller selektorer som nämner en konkret
`step.type` efter refaktorn.

### Stegtypspluginet äger

- stegets interna state och defaultvärden;
- defensiv tolkning av sin sparade post och JSON-säker serialisering av den;
- vad som räknas som påbörjat och vad som låser upp Nästa/Klart;
- HTML inne i stegets kort, inklusive typspecifik feedback;
- events och stateövergångar inne i kortet;
- typspecifik fokuspunkt efter interaktion;
- typspecifik semantik, tangentbordsstöd och textalternativ;
- cleanup av egna timers, observers eller lyssnare, om sådana finns.

Ett plugin känner inte till routing, kapitel-listor, storage-nycklar eller
landningsvyn. Det får bara begära en omrendering genom det avgränsade context-API:t.

### Framtida domänlogik

En framtida mini-runner, tidsregel eller sensorsimulering är inte en del av appkärnan
och inte heller en ny väg in i `window.KAPITEL`. När en aktivitet behöver sådan logik
ska den ligga i en liten, ren domänmodul med deklarativ indata och JSON-säker utdata.
Den får inte nå DOM, `localStorage`, `window`, timers eller events. Stegpluginet är då
den tunna adaptern mellan domänmodulen och stegets state, rendering, events och cleanup.

Fas 2 skapar ingen generell domän-API eller tom mappstruktur för detta; ett konkret
behov ska först motivera den. Det håller kärnan fri från aktivitetssemantik och
förhindrar kod-i-data även när en aktivitet senare blir mer avancerad.

### Frivilligt WebUSB-stöd

WebUSB är I/O, inte domänlogik. Om det senare behövs ska en separat hårdvaruadapter äga
feature-detection, uttryckligt användarinitiativ för anslutning, behörighet, session och
frånkoppling. Ett stegplugin får bara använda en liten, då uttryckligen införd capability
från contextet; det får aldrig anropa `navigator.usb` direkt. Kärnan får injicera den
valfria capabilityn men får inte låta en lyckad anslutning styra pedagogisk gating.

Aktiviteten måste alltså fungera utan hårdvara, på mobil och när WebUSB saknas. Riktigt
robotflöde verifieras manuellt i en Chromium-webbläsare med roboten ansluten; jsdom kan
endast testa adapterns ersättbara gränssnitt och den säkra otillgänglighetsvägen.

### Node-validatorn äger

- den publicerbara innehållsformen för varje `type`;
- krav på fält, typer, index/permutationer, lokala assets och kod-i-data-förbud;
- tydliga fel som gör CI röd innan okänd eller trasig data når webbläsaren.

Browserplugin och validator är parade men separata: DOM-kod ska inte laddas i Node och
validatorn ska inte försöka köra UI-pluginet. En ny stegtyp är inte klar förrän både
ett browserplugin och en typspecifik validatorpost finns. Validatorn kan använda ett
eget `type -> validateStep`-registry; appkärnan ska aldrig vara schemakälla.

## Additivt namespace och registry

Varje vanlig scriptfil måste tåla att andra delar redan har registrerat sig:

```js
window.EdisonApp = window.EdisonApp || {};
window.EdisonApp.stepTypes = window.EdisonApp.stepTypes || Object.create(null);
```

Namespace-filen definierar en enda registreringsfunktion, exempelvis:

```js
window.EdisonApp.registerStepType(type, plugin);
```

Registreringen ska:

- kräva ett icke-tomt typnamn och samtliga obligatoriska metoder;
- kasta ett tydligt fel vid dubbelregistrering, även om objektet är identiskt;
- aldrig skriva över ett befintligt plugin;
- lagra pluginet under exakt typnamn och erbjuda ett read-only-liknande uppslag till
  kärnan (ingen konsument ska mutera registryt direkt).

Dagens `root.EdisonApp = { ... }` får inte finnas kvar i målbilden, eftersom den
skriver över ett registry som laddats tidigare. App/bootstrap ska i stället addera
testbara funktioner på det befintliga objektet, exempelvis med explicita tilldelningar.

## Spikat plugin-kontrakt

Alla sju metoder är obligatoriska. Det ger ett enhetligt kontrakt även för enkla
`text`- och `image`-steg och håller fallbacklogik borta från kärnan.

```js
{
  createState: function (step, ctx) {},
  restore: function (step, savedRecord, ctx) {},
  serialize: function (step, state, ctx) {},
  hasProgress: function (step, savedRecord, ctx) {},
  isDone: function (step, state, ctx) {},
  render: function (step, state, ctx) {},
  bind: function (container, step, state, ctx) {}
}
```

### Metodsemantik

- `createState(step, ctx) -> state` skapar färskt runtime-state. Det får vara mer
  detaljerat än det som sparas, till exempel en ny blandad visningsordning.
- `restore(step, savedRecord, ctx) -> state` skapar ett komplett runtime-state från
  en opålitlig JSON-post. Saknade eller ogiltiga fält faller tillbaka säkert; metoden
  muterar inte kapiteldata eller den inlästa posten.
- `serialize(step, state, ctx) -> savedRecord` returnerar en ny, JSON-säker post utan
  DOM-noder, funktioner, timer-id:n eller cirkulära referenser. Kärnan äger envelope
  och version; pluginet äger vid behov en liten egen postversion och dess säkra fallback.
- `hasProgress(step, savedRecord, ctx) -> boolean` avgör om posten ska ge statusen
  Påbörjat och om kapitlet har något att nollställa. Metoden arbetar på pluginets
  serialiserade form, så kärnan kan använda samma regel för lagrat och levande state.
- `isDone(step, state, ctx) -> boolean` är enda källan för navigeringsgating och för
  beräkningen av kapitelstatusen Klart. Enkla informationssteg returnerar `true`.
- `render(step, state, ctx) -> htmlString` returnerar endast innehållet inne i
  stegkortet. Pluginet använder kärnans escaping-/feedbackhjälpare och får inte skapa
  appnav, chapter-rail eller skriva direkt i DOM.
- `bind(container, step, state, ctx) -> cleanup | undefined` binder events efter att
  HTML-strängen satts. `container` är det aktuella stegkortet. En returnerad cleanup-
  funktion anropas före nästa render eller när kapitelvyn lämnas. Den ska vara
  idempotent, inte mutera det logiska state:t och frigöra egna lyssnare, timers,
  observers, animationsramar och andra externa resurser.

`hasProgress` får inte härleda avslut från typnamn, och `isDone` får inte ersättas av
ett gemensamt `state.done`-antagande. Plugins får gärna använda `done` internt, men det
är inte ett kärnkontrakt.

## Context-API

Kärnan skickar ett litet contextobjekt. Första refaktorn ska endast innehålla behov som
redan finns:

```js
{
  ui: {
    escapeHtml: function (value) {},
    feedbackHtml: function (feedback) {}
  },
  utils: {
    sequencesEqual: function (a, b) {},
    shuffleDisplayOrder: function (length, avoid) {}
  },
  requestRender: function ({ focus, celebrate }) {},
  prefersReducedMotion: function () {}
}
```

`requestRender` är pluginets enda väg tillbaka till appflödet. `focus` får vara
`"next"`, `"step"` eller `{ selector: "..." }`; en selector söks endast inne i det
aktuella stegkortet och faller tillbaka till kortet. `celebrate` ber kärnan aktivera
maskotens befintliga, reduced-motion-säkra respons. Contextet ger inte direkt åtkomst
till `localStorage`, kapitel-state eller globala DOM-sökningar.

Kärnan kopplar varje `bind` till den aktuella rendergenerationen och invaliderar den
innan cleanup körs. Ett sent anrop från en städad timer, observer eller callback får
alltså inte orsaka en ny render eller skriva över nyare state.

## Livscykel och dataflöde

1. Kärnan slår upp pluginet för varje steg innan kapitelvyn startar.
2. Utan sparad post anropas `createState`; med post anropas `restore`.
3. Vid render validerar kärnan status och serialisering före innehållet byggs, så ett
   fel kan visa den låsta felvyn i samma render.
4. Kärnan anropar `bind` med stegkortet och sparar eventuell cleanup.
5. Pluginets event ändrar sitt state och kallar `requestRender`.
6. Före omrendering invaliderar kärnan rendergenerationen och kör cleanup. Ett
   cleanup-fel fångas och låser dess ägande steg; sena callbacks från den gamla
   bindningen ignoreras. Därefter avgörs framsteg med `hasProgress` och vyn byggs på nytt.
7. Kapitelstatusen Klart är sann endast när alla plugins rapporterar `isDone` och
   användaren har nått sista steget, precis som idag.

Kärnan får kasta en enskild trasig sparad post och använda `createState` för det
steget. Om hela envelopen har fel version eller steglängd behålls dagens beteende:
hela kapitlets sparning ignoreras.

Sparning innehåller bara logiskt, återställbart tillstånd. En framtida tidsaktivitet
kan spara exempelvis fas och konfigurerad varaktighet, men aldrig ett handtag till en
pågående timer; `restore` avgör alltid säkert och deterministiskt vilket läge som ska
återskapas.

## Framtida förgrening (utanför fas 2)

Fas 2 behåller den linjära `steps`-listan och dagens numeriska Föregående/Nästa. Ett
plugin får inte välja stegindex, skriva en route eller gömma förgreningslogik i sin
sparade post. Om innehåll senare behöver val ska det vara en egen, deklarativ
datamodellsmigrering: pluginet avger endast ett semantiskt utfall via ett då tillagt,
avgränsat context-anrop, medan kärnan validerar och löser utfallet mot deklarerade
övergångar.

Den migreringen behöver samtidigt definiera historik för Föregående, persistence av
aktuell nod och Node-validering av mål, nåbar avslutning och tillåtna cykler. Den får
inte smygas in som ett extra fält eller specialfall i fas 2.

## Scriptordning och målfilstruktur

Klassiska scriptfiler körs i dokumentordning och fungerar på `file://`. Använd inte
`type="module"`, `import`, `fetch`, `async` eller en runtime-bundler.

```text
js/
  edison-app.js                 # additivt namespace, registry, register/get
  step-types/
    text.js                     # text-plugin
    image.js                    # image-plugin
    question-single-choice.js   # flervalsplugin
    ordering.js                 # ordningsplugin
  app.js                        # kärna, routing, storage, skal och bootstrap
content/
  kapitel-1.js ...              # oförändrad window.KAPITEL-data
tools/
  validate-content.js           # Node-registry för innehållsscheman
```

Föreslagen ordning i `index.html`:

```html
<script src="./js/edison-app.js"></script>
<script src="./js/step-types/text.js"></script>
<script src="./js/step-types/image.js"></script>
<script src="./js/step-types/question-single-choice.js"></script>
<script src="./js/step-types/ordering.js"></script>
<script src="./content/kapitel-1.js"></script>
<!-- övriga kapiteldata -->
<script src="./js/app.js"></script>
```

Ordningen är alltså **namespace/registry → stegtypsplugins → kapiteldata → app/bootstrap**.
Appen startar sist, när både plugins, data och `#app` finns. Samma ordning ska användas
i jsdom-testharnessen.

## Felhantering

- **Dubbelregistrerad typ:** kasta synkront vid den andra registreringen. Det är ett
  programmeringsfel som ska upptäckas direkt, inte lösas med last-write-wins.
- **Okänd typ i kapiteldata:** validatorn fäller CI. Om den ändå når webbläsaren visar
  kärnan ett svenskt, textbärande fel i stegkortet, loggar typ och kapitel i konsolen
  och håller Nästa/Klart låst. Steget får inte behandlas som färdigt eller sparas som
  lyckat.
- **Pluginmetod eller cleanup kastar:** kärnan fångar felet vid livscykelgränsen,
  knyter cleanup-felet till dess ägande steg och använder samma låsta felvy. Ett trasigt
  steg får inte krascha landningsvyn eller andra kapitel.
- **Trasig sparad post:** pluginet återgår till säkert färskt state. Lagringsproblem
  fortsätter degradera tyst enligt dagens `file://`-policy.

## Tillgänglighet och reduced motion

Kärnan ansvarar för dokumentstruktur, rubriker, vuxenetikett, framsteg, nav, generell
fokusring, felvy och ett säkert fokusfallback till stegkortet. Pluginet ansvarar för
semantiken i sitt innehåll: riktiga knappar, tangentbordsflöde, `aria-*`, live-feedback,
textalternativ och att betydelse aldrig bärs enbart av färg eller rörelse.

Animation är ett komplement. Ett plugin med rörelse måste fråga
`ctx.prefersReducedMotion()` och omedelbart visa samma slutläge och text när reducerad
rörelse önskas. Cleanup måste stoppa pågående timers/animationer före omrendering.

## Fasad migration

### Fas 1 – kontrakt (detta dokument, klart)

Spika ansvar, plugin-API, namespace, loadordning, felhantering och acceptanskriterier
utan produktkod.

### Fas 2 – beteendebevarande registry-refaktor (implementerad 2026-06-20)

Införde namespace/registry och fyra plugins för dagens typer. Typkunskapen flyttades ur
kärnan utan att ändra kapiteldata, storage-envelope, markup/klassnamn, text, CSS eller
interaktion. Testharnessen laddar filerna i produktionsordning och täcker registryt,
okänd/dubbelregistrerad typ, cleanup vid omrendering och när kapitelvyn lämnas, sena
cleanup-callbacks samt cleanup- och statusfel.

Binära acceptanskriterier:

- ingen konkret stegtyp nämns i appkärnans state, restore, serialize, progress,
  gating, rendering eller event-bindning;
- befintlig UI-markup, feedback, fokus, routing och persistence beter sig oförändrat;
- `window.EdisonApp` byggs additivt och plugins överlever appens bootstrap;
- jsdom laddar exakt produktionsordningen; kontraktstester täcker obligatoriska
  pluginmetoder, dubbelregistrering, okänd typ, låst svensk felvy och att cleanup körs
  en gång före omrendering och när vyn lämnas;
- validatorn är grön, fäller en okänd typ utan att ladda browser-DOM-kod och `npm test`
  visar dagens **25 tester** gröna;
- `node --check` är grön för alla nya/ändrade JS-filer;
- manuell `file://`-genomklick i Chrome täcker landning, text, bild, fel→rätt,
  ordering, bakåtnavigering, omladdad progress, reset och avslutslänk;
- inga nätverksanrop, ES-moduler, runtime-beroenden eller buildsteg har tillkommit.

### Fas 3 – första interaktiva spiken

Bygg en enda deklarativ stegtyp för "Sekvens vs loop" mot kontraktet, med en isolerad
mini-runner och utan kod-i-data. Lägg den inte i kärnan. Verifiera tangentbord,
textalternativ, cleanup, persistence och reduced motion.

### Fas 4 – utvärdera före skalning

Testa spiken med barn och vuxen. Bedöm begriplighet, komplexitet och underhåll innan
fler plugins eller ett rikare programformat planeras. Återöppna beroende-/buildfrågan
endast om ett konkret, dokumenterat hinder inte går att lösa i vanilla JS.

## Beroende-policy och beslut

- **AD-1:** Sajten förblir beroendefri, statisk och körbar via `file://` och Pages.
- **AD-2:** Modularisering sker med klassiska namespace-script, inte ES-moduler.
- **AD-3:** Hela stegtypen är ett plugin; ett rent renderar-registry är otillräckligt.
- **AD-4:** HTML-sträng → `innerHTML` → `bind` behålls i första refaktorn.
- **AD-5:** Innehåll är deklarativt och strängvänligt; kod-i-data är förbjudet.
- **AD-6:** Runtime-plugin och Node-validator har separata registryer och ansvar.
- **AD-7:** Migrationen sker fasvis och måste bevisa oförändrat beteende före ny funktion.
- **AD-8:** Ett nytt dev-verktyg får föreslås först när ett namngivet, reproducerbart
  verifieringsgap inte täcks av befintlig Node/jsdom-testning och manuell `file://`-
  kontroll. Förslaget ska beskriva vilket fel det fångar, varför nuvarande kontroll inte
  räcker, vilket lokalt/CI-kommando som kör det och hur verktyget hålls utanför
  `index.html` och produktens runtime. Ett verktyg av bekvämlighetsskäl räcker inte;
  visuell `file://`- och framtida WebUSB-kontroll är fortsatt manuella grinden.

Den pedagogiska riktningen bakom den första interaktiva spiken finns i
`docs/reference/cs-curriculum.md`.
