# Edison Hemguide

En liten, interaktiv webbsida på svenska som hjälper barn (ca 7+) att komma
igång med Edison-roboten V3 och EdBlocks – tillsammans med en vuxen.

## Status
Fem kapitel finns: lär känna Edison, första programmet, robotar i världen, sensorer och
villkor samt loopar. Kapitel 5 mergades till `main` via PR #18.

## Köra lokalt
Öppna `index.html` i en webbläsare (Chrome rekommenderas). Ingen installation.

## Online
Publiceras via GitHub Pages (main) – testbar på telefon och surfplatta.

## Struktur
- `index.html`, `style.css` – sida och utseende
- `js/app.js` – render- och navigationslogik
- `content/kapitel-N.js` – kapitelinnehåll (`window.KAPITEL`, redigerbart även från mobilen)
- `docs/plan.md` – kort PRD
- `docs/design.md` – visuell spec / designsystem
- `docs/roadmap.md` – ordnad backlog + roller/modellval
- `docs/status.md` – levande handoff som uppdateras vid implementation och viktiga beslut
- `AGENTS.md` – gemensamma regler för AI-assistenter
- `CLAUDE.md` – Claude Code-wrapper som importerar `AGENTS.md`
- `.cursorrules` – kort kompatibilitetshänvisning till `AGENTS.md`

## Bygg-arbetsflöde
Välj modell efter uppgiftens risk och komplexitet. Arbeta aldrig parallellt på samma filer:
en branch + en PR i taget, och ingen push eller merge utan uttrycklig begäran.
