# Edison Hemguide

En liten, interaktiv webbsida på svenska som hjälper barn (ca 7+) att komma
igång med Edison-roboten V3 och EdBlocks – tillsammans med en vuxen.

## Status
v1 under uppbyggnad: Kapitel 1 "Lär känna Edison".

## Köra lokalt
Öppna `index.html` i en webbläsare (Chrome rekommenderas). Ingen installation.

## Online
Publiceras via GitHub Pages (main) – testbar på telefon och surfplatta.

## Struktur
- `index.html`, `style.css` – sida och utseende
- `js/app.js` – render- och navigationslogik
- `content/kapitel-1.js` – allt innehåll (`window.KAPITEL`, redigerbart även från mobilen)
- `docs/plan.md` – kort PRD
- `docs/design.md` – visuell spec / designsystem
- `docs/roadmap.md` – ordnad backlog + roller/modellval
- `docs/status.md` – levande handoff mellan sessioner (uppdateras varje session)
- `CLAUDE.md` / `.cursorrules` – regler för AI-assistenter (hålls i synk)

## Bygg-arbetsflöde
Planering, dokumentation och känsligt/komplext arbete (UI/UX, a11y): Claude Code.
Rutinbygge utifrån spec: Cursor. Aldrig parallellt – en branch + en PR i taget.
