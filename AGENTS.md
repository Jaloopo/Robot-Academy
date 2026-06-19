# AGENTS.md

Se `CLAUDE.md` för projektets regler (statisk svensk lärwebbplats för Edison V3).

## Cursor Cloud specific instructions

- This is a **static, no-build** site (plain HTML + CSS + vanilla JS). There are
  **no dependencies, no package manager, and no build step**. Do not add bundlers,
  frameworks, or a `package.json`.
- Runtime needed for local dev: a static file server + a browser (Chrome is
  preinstalled at `/usr/local/bin/google-chrome`). Python 3 is preinstalled.
- Run the dev server from the repo root:
  `python3 -m http.server 8000` then open `http://localhost:8000/`.
  The site must also keep working when opened directly via `file://`.
- There is no lint or test tooling configured in the repo. "Linting" for content
  is effectively JSON validity of `content/*.json` (e.g.
  `python3 -m json.tool content/kapitel-1.json`).
- App entry points (`index.html`, `style.css`, `js/app.js`) are documented in
  `README.md` but may not exist yet (v1 is under construction). Until they exist,
  the dev server only serves `content/*.json` and docs (directory listing).
