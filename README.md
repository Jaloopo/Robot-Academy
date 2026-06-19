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
- `content/kapitel-1.json` – allt innehåll (redigerbart, även från mobilen)
- `docs/plan.md` – kort PRD
- `CLAUDE.md` – regler för AI-assistenter (Claude Code / Cursor)

## Bygg-arbetsflöde
Planering: Claude Code. Byggande: Cursor. Aldrig parallellt – en branch + en PR i taget.
