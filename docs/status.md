# Status & handoff – Edison Hemguide

Levande arbetsdokument. **Uppdateras i slutet av varje session.** Nästa session läser detta
först (efter `CLAUDE.md`, `docs/plan.md`, `docs/design.md`, `docs/roadmap.md`), gör EXAKT
ett roadmap-steg, uppdaterar detta dokument + roadmap, committar till `main`, och skriver
en ny copy-paste längst ned.

Senast uppdaterad: 2026-06-20 · roadmap-steg 1 (flerkapitelstöd)

## Nuläge (fakta)
- Kapitel 1 komplett: text, vuxen-tips, flerval, ordning – med gating, snäll feedback, a11y.
- Designsystem + mobil + desktop-ark (≥720 px) + tunn framstegsstapel ligger på `main`.
- Innehåll i `content/kapitel-1.js` (`window.KAPITEL`). `js/app.js` väljer nu kapitel via
  `?kapitel=N`; utan query visas en landningsvy som listar alla laddade kapitel.
- Sista steget i ett kapitel visar en avslutslänk: nästa kapitel om det finns, annars
  tillbaka till kapitelöversikten.
- **Committat testverktyg finns nu:** `npm test` kör en jsdom-genomklick
  (`test/clickthrough.test.js`). `jsdom` är DEV-beroende; `node_modules/` är git-ignorerat.
  Sajten själv är fortsatt beroendefri.

## Vad senaste sessionen gjorde
- **Genomförde roadmap-steg 1:** tog bort hårdkodad `CHAPTER_ID`, lade till query-routing
  `?kapitel=N`, landningsvy från `window.KAPITEL` och avslutslänk från sista steget.
- Lade till små, additiva CSS-regler för landningsvy/kapitellänkar/avslutslänk. Befintliga
  mobilvärden och desktop-`@media` ändrades inte.
- Utökade `test/clickthrough.test.js`: landningsvy, okänt kapitel, query-hjälpare och en
  genomklick-driver som kör både riktiga kapitel 1 och ett syntetiskt kapitel 2 via
  `window.KAPITEL` utan hårdkodade svar.
- Verifierade: `node --check js/app.js` ✓, `npm install && npm test` ✓ (7 tester), samt
  Chrome `file://`-genomklick ✓.

## Beslut (varför)
- Framsteg = "Steg X av N"-text + tunn stapel (inte 12 prickar).
- Desktop = Layout A (ark på canvas). Layout B (chapter-rail) är nästa roadmap-steg.
- **Testverktyget körs via Nodes inbyggda `node:test` + `node:assert`** (inget extra
  test-ramverk) och använder bara `jsdom` som DEV-beroende. Det laddar `content/*.js` och
  `js/app.js` oförändrade via `window.eval` i jsdom – sajtens beroendefrihet bevaras.
- **Testet hårdkodar inte svar:** det läser `correctAnswer` från `window.KAPITEL` och läser
  blandad ordning från DOM, så det fungerar för framtida kapitel utan ändring.
- Query-parametern är numerisk (`?kapitel=N`) och mappas till datamodellens id
  `kapitel-N`; landningslänkar använder samma form för att fungera via både `file://` och
  GitHub Pages utan router.

## Varningar / blockers
- Bara kapitel 1 finns som riktigt innehåll ännu. Flerkapitelstödet är testat med ett
  syntetiskt kapitel 2 i jsdom, men inget nytt innehållskapitel committades.
- Fjärrgrenar går inte att radera härifrån (git-proxy 403) – radera i GitHub-UI.
- `node_modules/` committas aldrig: kör `npm install` en gång innan `npm test`.
- Denna körning gjordes som Cloud-agent → arbetet ligger på `cursor/flerkapitelstod-a6db`
  med draft-PR i stället för direkt push till `main` (miljön tillåter inte push till
  `main`). PR är vägen in till `main` här.

## Nästa steg (exakt ETT)
Roadmap-steg 2: **Layout B – chapter-rail** på desktop (≥900 px). Lägg till ett nytt
`<aside class="chapter-rail">` som kontextspalt när fler kapitel kan listas, utan att
dubblera mobilnavigeringen. CSS ska vara additiv och mobilens värden ska vara orörda.

## Modellrekommendation för nästa steg
Chapter-rail är UI/UX + a11y + responsiv layout → **Opus/Claude Design** för beslut och
spec, därefter kan enkel CSS-implementation köras i Cursor om specen är exakt.

## Copy-paste för nästa session
```text
Du tar över samordnar-/byggrollen för "Edison Hemguide" (repo Jaloopo/Robot-Academy, main).
Läs FÖRST: CLAUDE.md, docs/plan.md, docs/design.md, docs/roadmap.md, docs/status.md.
Ange kort nuläge + din planerade åtgärd innan du kör verktyg.

UPPGIFT (ett steg): Roadmap-steg 2 – Layout B / chapter-rail på desktop (≥900 px).
- Lägg till ett nytt aside-element för chapter-rail som visar kapitellistan/kontext på desktop.
- CSS ska vara helt additiv via ny media query; rör inte mobilens värden.
- Dubblera inte mobilens primära steg-navigering. Behåll en kolumn på mobil.
- All UI-text på svenska. Rör inte datamodellen och hitta inte på Edison-fakta.

VERIFIERA: node --check js/app.js, npm test (kör npm install först), samt genomklick via
file:// i Chrome inklusive mobilbredd och desktop ≥900 px.

AVSLUTA enligt handoff: uppdatera docs/status.md (nuläge, gjort, beslut, varningar, nästa
steg, modellrek) + bocka av roadmap-steg 2 i docs/roadmap.md, committa och pusha. I Cloud:
jobba på `cursor/...`-branch och öppna/uppdatera PR. Skriv en ny copy-paste för nästa session
i status.md.
```
