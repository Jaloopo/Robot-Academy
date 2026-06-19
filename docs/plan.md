# PRD – Edison Hemguide (v1)

## Syfte
Hjälpa mina barn att komma igång med Edison-roboten V3 och EdBlocks hemma,
på svenska. Vi gör aktiviteterna tillsammans (barn + vuxen).

## Målgrupp
Barn ca 7+ med god läsnivå som läser självständigt. Vuxen är co-pilot.
Används mest på MacBook med Chrome; ska även fungera på telefon/surfplatta.

## Lärandemål v1 (Kapitel 1: Lär känna Edison)
- Barnet kan med egna ord säga vad en robot är.
- Barnet vet vad Edison kan göra (köra, känna ljus/ljud, se hinder).
- Barnet förstår vad "programmerbar" betyder.
- Barnet känner igen knapparna och vet hur man startar/stoppar.
- Barnet vet de viktigaste säkerhetsreglerna.

## Innehåll v1
Endast Kapitel 1, helt klart och testat med barnet.
Kapitel 2–3 (EdBlocks, Första programmet) planeras senare.

## Teknisk scope
Statisk HTML+CSS+JS, inga ramverk, ingen build. Fungerar via file:// och GitHub Pages.
Innehåll ligger i `content/kapitel-N.js` (`window.KAPITEL`) – ingen fetch/JSON, eftersom
file:// blockerar fetch i Chrome. Visuell spec i `docs/design.md`.

## Pedagogiska riktlinjer
- Max 2–3 meningar per steg.
- Varje steg kan ha en barn-del och en kort vuxen-tips-del (styrs av `role`, inte av
  ett prefix i texten).
- Tilltala barnet direkt ("Du", "din robot").
- Lekfulla metaforer ok, men inte överanvända och inte bundna till en specifik bokserie.
- Inga drag-and-drop i v1.

## Arbetsdelning
Claude Code planerar/dokumenterar och äger känsligt/komplext arbete (UI/UX, a11y,
klurig renderingslogik). Cursor bygger väldefinierade PR:er. En branch + en PR i taget.

## Icke-mål (v1)
Ingen översättning av hela lärarguiden, ingen EdCreate/EdScratch/EdPy, ingen backend.
