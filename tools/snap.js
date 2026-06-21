"use strict";

// Visual QA harness – dev-only layout assertions via file:// + system Chrome.
// Kör: npm run snap  (eller: node tools/snap.js)
//
// Laddas aldrig av sajten; lägger inget runtime-beroende på den publicerade webbplatsen.

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

const ROOT = path.resolve(__dirname, "..");
const INDEX_HTML = path.resolve(ROOT, "index.html");
const ARTIFACTS_DIR = path.resolve(ROOT, "artifacts");

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 900, height: 1000 },
  { width: 1280, height: 900 },
  { width: 1440, height: 900 },
  { width: 1718, height: 920 },
];

function toFileUrl(filePath) {
  return "file://" + path.resolve(filePath).replace(/\\/g, "/");
}

const ROUTES = [
  { name: "landning", url: toFileUrl(INDEX_HTML), isChapter: false },
  { name: "kapitel-1", url: `${toFileUrl(INDEX_HTML)}?kapitel=1`, isChapter: true },
  // Framtida rutt "Sekvens vs loop" kan läggas till här när modulen finns.
];

const ALLOWED_REQUEST_PREFIXES = ["file:", "data:", "about:"];

function recordResult(results, name, pass, detail) {
  results.push({ name, pass, detail });
}

async function runScenario(browser, route, viewport) {
  const label = `${route.name} @ ${viewport.width}×${viewport.height}`;
  const results = [];
  const requests = [];
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];

  const page = await browser.newPage();
  await page.setViewportSize(viewport);

  page.on("request", (request) => {
    requests.push(request.url());
  });
  // En tillåten resurs som ändå MISSLYCKAS (t.ex. saknad lokal CSS/JS/bild) får
  // inte räknas som grön. Ignorera bara favicon, som Chrome ibland efterfrågar utan <link>.
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (/\/favicon\.ico(\?|$)/.test(url)) return;
    const reason = request.failure() ? request.failure().errorText : "okänt fel";
    failedRequests.push(`${url} (${reason})`);
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message || String(error));
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto(route.url, { waitUntil: "load" });

  const scroll = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  const noHorizontalScroll = scroll.scrollWidth <= scroll.clientWidth + 1;
  recordResult(
    results,
    "horisontell scroll",
    noHorizontalScroll,
    `scrollWidth=${scroll.scrollWidth}, clientWidth=${scroll.clientWidth}`
  );

  if (route.isChapter) {
    const railDisplay = await page.evaluate(() => {
      const rail = document.querySelector(".chapter-rail");
      return rail ? getComputedStyle(rail).display : null;
    });

    const expectedRailDisplay = viewport.width < 900 ? "none" : "block";
    const railOk = railDisplay === expectedRailDisplay;
    recordResult(
      results,
      "rail-synlighet",
      railOk,
      `display="${railDisplay}" (förväntat "${expectedRailDisplay}" vid bredd ${viewport.width})`
    );

    if (viewport.width >= 900) {
      const stepCardWidth = await page.evaluate(() => {
        const card = document.querySelector("#step-card");
        return card ? card.getBoundingClientRect().width : null;
      });
      const readingOk = stepCardWidth !== null && stepCardWidth <= 700;
      recordResult(
        results,
        "läsmått",
        readingOk,
        stepCardWidth === null
          ? "#step-card saknas"
          : `step-card bredd=${stepCardWidth.toFixed(1)}px (max 700)`
      );
    }

    if (viewport.width === 320) {
      const reflowOk =
        railDisplay === "none" && noHorizontalScroll;
      recordResult(
        results,
        "en kolumn vid reflow",
        reflowOk,
        `rail display="${railDisplay}", horisontell scroll=${noHorizontalScroll ? "nej" : "ja"}`
      );
    }

    // Skalkontroll (Alternativ 1): kapitelarket MÅSTE växa förbi ≥900-baslinjen
    // (~1060) vid breda skärmar och kapas vid ~1280-sluttaket. Detta gör snap till
    // en verklig grind för desktoplayouten – inte bara ett icke-regressionstest.
    if (viewport.width >= 1280) {
      const arkWidth = await page.evaluate(() => {
        const app = document.querySelector("#app");
        return app ? app.getBoundingClientRect().width : null;
      });
      const minArk = viewport.width >= 1440 ? 1240 : 1150;
      const maxArk = 1320; // honour the ~1280 sluttak (lite slack för border/avrundning)
      const arkOk = arkWidth !== null && arkWidth >= minArk && arkWidth <= maxArk;
      recordResult(
        results,
        "arket växer (skal)",
        arkOk,
        arkWidth === null
          ? "#app saknas"
          : `ark bredd=${arkWidth.toFixed(1)}px (krav ${minArk}–${maxArk})`
      );
    }
  }

  if (viewport.width >= 1200) {
    const box = await page.evaluate(() => {
      const app = document.querySelector("#app");
      if (!app) return null;
      const r = app.getBoundingClientRect();
      const de = document.documentElement;
      return {
        left: r.left, right: r.right, top: r.top, bottom: r.bottom,
        width: r.width, height: r.height,
        clientWidth: de.clientWidth, clientHeight: de.clientHeight,
      };
    });

    if (!box) {
      recordResult(results, "appskal mätbart", false, "#app saknas");
    } else {
      // Landningsarket får inte regressa till 760 px (eller breddas okontrollerat).
      if (!route.isChapter) {
        const landingOk = box.width >= 850 && box.width <= 872;
        recordResult(
          results,
          "landningsark 860",
          landingOk,
          `#app bredd=${box.width.toFixed(1)}px (krav 850–872)`
        );
      }

      // Vertikal balans: när arket får plats i höjd ska det centreras (ingen
      // toppankring). Är innehållet högre än fönstret scrollar det – då hoppas kravet över.
      const topMargin = box.top;
      const bottomMargin = box.clientHeight - box.bottom;
      if (box.height <= box.clientHeight + 1) {
        const vDiff = Math.abs(topMargin - bottomMargin);
        const verticalOk = vDiff <= 2;
        recordResult(
          results,
          "vertikal balans",
          verticalOk,
          `topp=${topMargin.toFixed(1)}px, botten=${bottomMargin.toFixed(1)}px, diff=${vDiff.toFixed(1)}px`
        );
      } else {
        recordResult(
          results,
          "vertikal balans",
          true,
          `innehåll ${box.height.toFixed(0)}px > fönster ${box.clientHeight}px – scrollar, centreringskrav hoppas över`
        );
      }

      // Horisontell symmetri (avsiktlig, lika ram på båda sidor).
      const hDiff = Math.abs(box.left - (box.clientWidth - box.right));
      const symmetricOk = hDiff <= 2;
      recordResult(
        results,
        "symmetrisk placering",
        symmetricOk,
        `vänster=${box.left.toFixed(1)}px, höger=${(box.clientWidth - box.right).toFixed(1)}px, diff=${hDiff.toFixed(1)}px`
      );
    }
  }

  const disallowed = requests.filter(
    (url) => !ALLOWED_REQUEST_PREFIXES.some((prefix) => url.startsWith(prefix))
  );
  const resourcesOk = disallowed.length === 0;
  recordResult(
    results,
    "inga externa resurser",
    resourcesOk,
    resourcesOk
      ? `${requests.length} request(s), alla tillåtna`
      : `otillåtna: ${disallowed.join(", ")}`
  );

  // En tillåten URL räcker inte – resursen måste faktiskt laddas. Saknade lokala
  // filer (CSS/JS/bild) ger requestfailed; trasig JS ger pageerror/konsolfel.
  recordResult(
    results,
    "inga laddningsfel",
    failedRequests.length === 0,
    failedRequests.length === 0
      ? "inga misslyckade resursanrop"
      : `misslyckade: ${failedRequests.join(", ")}`
  );
  recordResult(
    results,
    "inga sidfel (pageerror)",
    pageErrors.length === 0,
    pageErrors.length === 0 ? "inga okastade fel" : `fel: ${pageErrors.join(" | ")}`
  );
  recordResult(
    results,
    "inga konsolfel",
    consoleErrors.length === 0,
    consoleErrors.length === 0 ? "inga console.error" : `console.error: ${consoleErrors.join(" | ")}`
  );

  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  const screenshotPath = path.join(
    ARTIFACTS_DIR,
    `${route.name}__${viewport.width}x${viewport.height}.png`
  );
  await page.screenshot({ path: screenshotPath, fullPage: false });
  await page.close();

  return { label, results };
}

function printScenario({ label, results }) {
  console.log(`\n${label}`);
  for (const { name, pass, detail } of results) {
    console.log(`  ${pass ? "PASS" : "FAIL"}  ${name}: ${detail}`);
  }
}

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    console.error("Kunde inte starta Google Chrome – krävs för npm run snap");
    process.exit(1);
  }

  let passCount = 0;
  let failCount = 0;

  try {
    for (const route of ROUTES) {
      for (const viewport of VIEWPORTS) {
        const scenario = await runScenario(browser, route, viewport);
        printScenario(scenario);
        for (const { pass } of scenario.results) {
          if (pass) passCount++;
          else failCount++;
        }
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\nTotalt: ${passCount} pass, ${failCount} fail`);
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
