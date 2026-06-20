"use strict";

// Reproducerbar genomklick av ett kapitel (roadmap-steg 5 / dev-testverktyg).
// Kör med: npm test  (node --test). Använder jsdom som DEV-beroende – sajten själv
// är fortsatt beroendefri och laddas oförändrad via file:// och GitHub Pages.
//
// Testet driver den RIKTIGA renderaren (js/app.js) mot det RIKTIGA innehållet.
// Två lägen:
//   - default: laddar content/kapitel-1.js + ett syntetiskt testkapitel (kontrollerar
//     routing/landningsvy/rail med minimal, kontrollerad data).
//   - allContent: laddar ALLA content/kapitel-*.js och genomklickar var och en, så att
//     nya kapitelfiler täcks AUTOMATISKT utan att testet ändras.
// Genomklicken läser correctAnswer ur datan i stället för att hårdkoda svar.

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const contentSrc = fs.readFileSync(path.join(CONTENT_DIR, "kapitel-1.js"), "utf8");
const appSrc = fs.readFileSync(path.join(ROOT, "js", "app.js"), "utf8");

// Alla riktiga kapitelfiler, sorterade på kapitelnummer (samma ordning som renderaren).
function chapterNumber(name) {
  var m = String(name).match(/\d+/);
  return m ? parseInt(m[0], 10) : NaN;
}
const realChapterFiles = fs
  .readdirSync(CONTENT_DIR)
  .filter((f) => /^kapitel-\d+\.js$/.test(f))
  .sort((a, b) => chapterNumber(a) - chapterNumber(b));
const realContentSrc = realChapterFiles
  .map((f) => fs.readFileSync(path.join(CONTENT_DIR, f), "utf8"))
  .join("\n");

const testChapter2 = {
  id: "kapitel-2",
  titel: "Testkapitel två",
  steps: [
    {
      role: "child",
      type: "text",
      text: "Det här är ett testkapitel som bara kontrollerar flerkapitelstödet."
    },
    {
      role: "child",
      type: "question_single_choice",
      text: "Vilket val är rätt i testet?",
      options: ["Första", "Andra", "Tredje"],
      correctAnswer: 2
    },
    {
      role: "child",
      type: "ordering",
      text: "Tryck teststegen i rätt ordning:",
      options: ["Efteråt", "Först"],
      correctAnswer: [1, 0]
    },
    {
      role: "adult",
      type: "text",
      text: "Det här vuxensteget finns bara för att testa sista steget."
    }
  ]
};

// Bygg en jsdom-värld med file://-URL, ladda innehåll + app och rendera.
// options.url byter bas-URL: file:// (default) saknar localStorage i jsdom – exakt
// degraderingsfallet – medan en http(s)-URL ger fungerande localStorage så att
// framstegssparandet kan testas. options.prepare(window) körs efter att innehållet
// laddats men innan appen körs (t.ex. för att seed:a localStorage).
function bootstrap(options = {}) {
  const search = options.search || "";
  const extraChapters = options.extraChapters || [];
  const base = options.url || "file:///workspace/index.html";
  const dom = new JSDOM(
    '<!DOCTYPE html><html lang="sv"><head><meta charset="UTF-8"></head>' +
      '<body><div id="app"></div></body></html>',
    { runScripts: "outside-only", url: base + search }
  );
  const { window } = dom;
  // allContent: ladda ALLA riktiga kapitel; annars bara kapitel-1 (+ ev. syntetiska).
  window.eval(options.allContent ? realContentSrc : contentSrc); // sätter window.KAPITEL
  extraChapters.forEach((chapter) => {
    window.KAPITEL[chapter.id] = chapter;
  });
  if (typeof options.prepare === "function") options.prepare(window);
  window.eval(appSrc); // IIFE: kör initApp(document) och exponerar window.EdisonApp
  return window;
}

// http(s)-bas: jsdom ger då en fungerande localStorage (file:// gör inte det).
const STORE_URL = "https://example.org/index.html";

// Simulera en sidomladdning: kör om renderaren i SAMMA fönster, så att fönstrets
// localStorage (och därmed sparat framsteg) finns kvar mellan körningarna.
function reload(window) {
  window.eval(appSrc);
}

function appEl(window) {
  return window.document.getElementById("app");
}

function nextBtn(window) {
  return window.document.getElementById("btn-next");
}

function finishLink(window) {
  return window.document.getElementById("link-finish");
}

function progressText(window) {
  return appEl(window).querySelector(".progress").textContent;
}

function completeChapter(window, chapterId, expectedFinish) {
  const doc = window.document;
  const steps = window.KAPITEL[chapterId].steps;
  const total = steps.length;

  assert.ok(appEl(window).querySelector(".app-header"), "headern renderas");

  for (let s = 0; s < total; s++) {
    const step = steps[s];
    const isLast = s === total - 1;
    assert.match(
      progressText(window),
      new RegExp("Steg " + (s + 1) + " av " + total),
      "framstegstexten visar rätt steg"
    );

    if (step.type === "question_single_choice") {
      assert.strictEqual(nextBtn(window).disabled, true, "flerval: låst före svar");

      const wrong = step.options.findIndex((_, i) => i !== step.correctAnswer);
      if (wrong !== -1) {
        appEl(window).querySelector('.option[data-idx="' + wrong + '"]').click();
        assert.ok(appEl(window).querySelector(".feedback--retry"), "retry-feedback visas");
        assert.ok(appEl(window).querySelector(".option--wrong"), "fel-alternativ markeras");
        assert.strictEqual(nextBtn(window).disabled, true, "fortfarande låst efter fel");
      }

      appEl(window).querySelector('.option[data-idx="' + step.correctAnswer + '"]').click();
      assert.ok(appEl(window).querySelector(".feedback--ok"), "ok-feedback visas");
      assert.ok(appEl(window).querySelector(".option--correct"), "rätt alternativ markeras grönt");
    } else if (step.type === "ordering") {
      assert.strictEqual(nextBtn(window).disabled, true, "ordning: låst före svar");

      const displayed = Array.prototype.map.call(
        appEl(window).querySelectorAll(".option[data-oi]"),
        (b) => parseInt(b.getAttribute("data-oi"), 10)
      );
      assert.notDeepStrictEqual(displayed, step.correctAnswer, "visningsordning är blandad");

      if (step.correctAnswer.length >= 2) {
        const wrongOrder = step.correctAnswer.slice();
        const tmp = wrongOrder[0];
        wrongOrder[0] = wrongOrder[1];
        wrongOrder[1] = tmp;
        wrongOrder.forEach((oi) => {
          appEl(window).querySelector('.option[data-oi="' + oi + '"]').click();
        });
        assert.ok(appEl(window).querySelector(".feedback--retry"), "ordning: retry-feedback");
        assert.strictEqual(nextBtn(window).disabled, true, "ordning: låst efter fel");
        doc.getElementById("btn-reset").click();
      }

      step.correctAnswer.forEach((oi) => {
        appEl(window).querySelector('.option[data-oi="' + oi + '"]').click();
      });
      assert.ok(appEl(window).querySelector(".feedback--ok"), "ordning: ok-feedback");
    }

    if (isLast) {
      assert.strictEqual(nextBtn(window), null, "sista steget använder avslutslänk");
      assert.ok(finishLink(window), "avslutslänk finns");
      assert.strictEqual(finishLink(window).textContent, expectedFinish.label);
      assert.strictEqual(finishLink(window).getAttribute("href"), expectedFinish.href);
    } else {
      assert.strictEqual(nextBtn(window).disabled, false, "kan gå vidare från steg " + (s + 1));
      nextBtn(window).click();
    }
  }

  assert.match(progressText(window), new RegExp("Steg " + total + " av " + total), "nådde sista steget");
}

// ---- Rena hjälpfunktioner ----

test("sequencesEqual jämför element för element", () => {
  const { sequencesEqual } = bootstrap().EdisonApp;
  assert.strictEqual(sequencesEqual([0, 1, 2], [0, 1, 2]), true);
  assert.strictEqual(sequencesEqual([0, 1, 2], [0, 2, 1]), false);
  assert.strictEqual(sequencesEqual([0, 1], [0, 1, 2]), false);
  assert.strictEqual(sequencesEqual(null, [0]), false);
});

test("shuffleDisplayOrder returnerar aldrig den 'rätta' ordningen", () => {
  const { shuffleDisplayOrder } = bootstrap().EdisonApp;
  const correct = [0, 1, 2];
  for (let i = 0; i < 200; i++) {
    const order = shuffleDisplayOrder(3, correct);
    assert.strictEqual(order.length, 3);
    assert.deepStrictEqual([...order].sort(), [0, 1, 2]); // innehåller alla index
    assert.notDeepStrictEqual(order, correct); // aldrig i löst ordning
  }
});

test("chapterIdFromSearch tolkar ?kapitel=N för file://", () => {
  const { chapterIdFromSearch, sortedChapterIds } = bootstrap().EdisonApp;
  assert.strictEqual(chapterIdFromSearch("?kapitel=1"), "kapitel-1");
  assert.strictEqual(chapterIdFromSearch("?foo=bar&kapitel=2"), "kapitel-2");
  assert.strictEqual(chapterIdFromSearch(""), null);
  assert.deepStrictEqual(Array.from(sortedChapterIds({ "kapitel-2": {}, "kapitel-1": {} })), [
    "kapitel-1",
    "kapitel-2"
  ]);
});

test("landningsvyn listar alla kapitel i window.KAPITEL", () => {
  const window = bootstrap({ extraChapters: [testChapter2] });
  const links = Array.from(appEl(window).querySelectorAll(".chapter-link"));

  assert.match(appEl(window).querySelector(".app-title").textContent, /Välj kapitel/);
  assert.strictEqual(links.length, 2);
  assert.strictEqual(links[0].getAttribute("href"), "?kapitel=1");
  assert.match(links[0].textContent, /Lär känna Edison/);
  assert.strictEqual(links[1].getAttribute("href"), "?kapitel=2");
  assert.match(links[1].textContent, /Testkapitel två/);
});

test("okänt ?kapitel=N går tillbaka till landningsvyn", () => {
  const window = bootstrap({ search: "?kapitel=99", extraChapters: [testChapter2] });
  assert.ok(appEl(window).querySelector(".landing-message"));
  assert.match(appEl(window).textContent, /Kapitlet finns inte än/);
  assert.strictEqual(appEl(window).querySelectorAll(".chapter-link").length, 2);
});

// ---- Full genomklick ----

test("genomklick av två kapitel: routing, gating, fel→rätt och ordning", () => {
  completeChapter(
    bootstrap({ search: "?kapitel=1", extraChapters: [testChapter2] }),
    "kapitel-1",
    { label: "Nästa kapitel", href: "?kapitel=2" }
  );

  completeChapter(
    bootstrap({ search: "?kapitel=2", extraChapters: [testChapter2] }),
    "kapitel-2",
    { label: "Till kapitelöversikt", href: "./index.html" }
  );
});

// ---- Datadriven genomklick av VARJE riktigt kapitel (content/kapitel-*.js) ----
// Täcker nya kapitelfiler automatiskt: inga hårdkodade svar, inget syntetiskt kapitel.

test("genomklick av varje riktigt kapitel: gating, fel→rätt, ordning, avslutslänk", () => {
  const probe = bootstrap({ allContent: true });
  const ids = Array.from(probe.EdisonApp.sortedChapterIds(probe.KAPITEL));
  assert.ok(ids.length >= 1, "minst ett riktigt kapitel laddat");

  ids.forEach((id, i) => {
    const window = bootstrap({ allContent: true, search: "?kapitel=" + chapterNumber(id) });
    const isLast = i === ids.length - 1;
    const expectedFinish = isLast
      ? { label: "Till kapitelöversikt", href: "./index.html" }
      : { label: "Nästa kapitel", href: "?kapitel=" + chapterNumber(ids[i + 1]) };
    completeChapter(window, id, expectedFinish);
  });
});

// ---- Chapter-rail (Layout B, desktop-kontext) ----

test("chapter-rail finns i kapitelvyn, markerar aktivt kapitel och dess steg", () => {
  const window = bootstrap({ search: "?kapitel=1", extraChapters: [testChapter2] });
  const app = appEl(window);

  assert.strictEqual(app.className, "has-rail", "#app får has-rail i kapitelvyn");
  const rail = app.querySelector(".chapter-rail");
  assert.ok(rail, "chapter-rail renderas");

  const railLinks = Array.from(rail.querySelectorAll(".rail-link"));
  assert.strictEqual(railLinks.length, 2, "railen listar alla kapitel");

  const current = rail.querySelector(".rail-link--current");
  assert.ok(current, "aktivt kapitel markeras i railen");
  assert.strictEqual(current.getAttribute("aria-current"), "step", "aktivt kapitel har aria-current");
  assert.strictEqual(current.getAttribute("href"), "?kapitel=1", "aktivt kapitel pekar på rätt kapitel");
  assert.match(current.textContent, /Steg 1 av/, "railen visar kapitlets progress");

  // Steg-navigeringen (Föregående/Nästa) får inte dubbleras in i railen.
  assert.strictEqual(rail.querySelector("#btn-next"), null, "railen dubblerar inte stegnavigeringen");
  assert.strictEqual(rail.querySelector("#btn-prev"), null, "railen dubblerar inte stegnavigeringen");
});

test("chapter-rail visas inte på landningsvyn (en kolumn)", () => {
  const window = bootstrap({ extraChapters: [testChapter2] });
  const app = appEl(window);
  assert.strictEqual(app.querySelector(".chapter-rail"), null, "ingen rail på landningsvyn");
  assert.notStrictEqual(app.className, "has-rail", "#app saknar has-rail på landningsvyn");
});

// ---- Bakåtnavigering bevarar tillstånd ----

test("Föregående bevarar besvarad fråga (rätt alternativ kvar grönt)", () => {
  const window = bootstrap({ search: "?kapitel=1" });
  const doc = window.document;
  const steps = window.KAPITEL["kapitel-1"].steps;
  const qIndex = steps.findIndex((s) => s.type === "question_single_choice");
  assert.ok(qIndex > 0, "det finns en flervalsfråga att testa");

  for (let i = 0; i < qIndex; i++) nextBtn(window).click();
  appEl(window).querySelector('.option[data-idx="' + steps[qIndex].correctAnswer + '"]').click();
  nextBtn(window).click(); // till steget efter frågan
  doc.getElementById("btn-prev").click(); // tillbaka till frågan

  assert.ok(appEl(window).querySelector(".option--correct"), "rätt svar är fortfarande markerat");
  assert.strictEqual(nextBtn(window).disabled, false, "Nästa är fortfarande aktiverat");
});

// ---- Framstegssparande (localStorage) ----

const PROGRESS_KEY = "edison-hemguide:kapitel-1";

test("localStorage saknas på file:// → degraderar snällt (ingen krasch, inget sparande)", () => {
  const window = bootstrap({ search: "?kapitel=1" }); // file:// – jsdom saknar localStorage
  assert.strictEqual(window.EdisonApp.getStorage(), null, "getStorage() är null när storage saknas");

  // Genomklick fungerar ändå (täcks även av andra tester) och en simulerad omladdning
  // återställer INGET (inget sparas), dvs vi börjar om från steg 1.
  const steps = window.KAPITEL["kapitel-1"].steps;
  const qIndex = steps.findIndex((s) => s.type === "question_single_choice");
  for (let i = 0; i < qIndex; i++) nextBtn(window).click();
  appEl(window).querySelector('.option[data-idx="' + steps[qIndex].correctAnswer + '"]').click();
  assert.ok(appEl(window).querySelector(".option--correct"), "svar markeras i sessionen");

  reload(window); // omladdning utan fungerande storage
  assert.match(progressText(window), /Steg 1 av/, "utan storage börjar man om från steg 1");
  assert.strictEqual(appEl(window).querySelector(".option--correct"), null, "inget sparat svar återställs");
});

test("sparar svar + steg och återupptar efter omladdning (localStorage)", () => {
  const window = bootstrap({ search: "?kapitel=1", url: STORE_URL });
  assert.ok(window.EdisonApp.getStorage(), "storage finns på http(s)");

  const steps = window.KAPITEL["kapitel-1"].steps;
  const qIndex = steps.findIndex((s) => s.type === "question_single_choice");

  for (let i = 0; i < qIndex; i++) nextBtn(window).click();
  appEl(window).querySelector('.option[data-idx="' + steps[qIndex].correctAnswer + '"]').click();
  nextBtn(window).click(); // gå vidare ett steg efter frågan
  const resumedStep = qIndex + 2; // 1-baserat steg vi nu står på

  reload(window); // simulerad sidomladdning – storage finns kvar
  assert.match(
    progressText(window),
    new RegExp("Steg " + resumedStep + " av "),
    "återupptar på samma steg efter omladdning"
  );

  // Bakåt till frågan: det sparade rätta svaret ska vara kvar grönt och Nästa aktiv.
  window.document.getElementById("btn-prev").click();
  assert.match(progressText(window), new RegExp("Steg " + (qIndex + 1) + " av "));
  assert.ok(appEl(window).querySelector(".option--correct"), "sparat rätt svar återställs grönt");
  assert.strictEqual(nextBtn(window).disabled, false, "Nästa är aktiv för det sparade svaret");
});

test("avklarat kapitel visar 'Klart' på landningsvyn; påbörjat visar 'Påbörjat'", () => {
  // Klart: genomför hela kapitel 1 i ett fönster och flytta sparningen till ett
  // landningsfönster (samma localStorage-format, ingen hårdkodning av formatet).
  const playthrough = bootstrap({ search: "?kapitel=1", url: STORE_URL, allContent: true });
  completeChapter(playthrough, "kapitel-1", {
    label: "Nästa kapitel",
    href: "?kapitel=2"
  });
  const doneRaw = playthrough.localStorage.getItem(PROGRESS_KEY);
  assert.ok(doneRaw, "framsteg sparades för det avklarade kapitlet");

  const landingDone = bootstrap({
    url: STORE_URL,
    allContent: true,
    prepare: (w) => w.localStorage.setItem(PROGRESS_KEY, doneRaw)
  });
  const doneLink = landingDone.document.querySelector('.chapter-link[href="?kapitel=1"]');
  assert.match(doneLink.textContent, /Klart/, "avklarat kapitel märks 'Klart' på landningsvyn");

  // Påbörjat: navigera bara en bit in i kapitlet (inget avklarat).
  const partial = bootstrap({ search: "?kapitel=1", url: STORE_URL, allContent: true });
  nextBtn(partial).click();
  nextBtn(partial).click();
  const partialRaw = partial.localStorage.getItem(PROGRESS_KEY);

  const landingStarted = bootstrap({
    url: STORE_URL,
    allContent: true,
    prepare: (w) => w.localStorage.setItem(PROGRESS_KEY, partialRaw)
  });
  const startedLink = landingStarted.document.querySelector('.chapter-link[href="?kapitel=1"]');
  assert.match(startedLink.textContent, /Påbörjat/, "påbörjat kapitel märks 'Påbörjat'");
});

test("'Börja om kapitlet' nollställer sparat framsteg", () => {
  const window = bootstrap({ search: "?kapitel=1", url: STORE_URL });
  const steps = window.KAPITEL["kapitel-1"].steps;
  const qIndex = steps.findIndex((s) => s.type === "question_single_choice");

  for (let i = 0; i < qIndex; i++) nextBtn(window).click();
  appEl(window).querySelector('.option[data-idx="' + steps[qIndex].correctAnswer + '"]').click();
  assert.ok(window.localStorage.getItem(PROGRESS_KEY), "framsteg sparat innan nollställning");

  const resetBtn = window.document.getElementById("btn-reset-chapter");
  assert.ok(resetBtn, "'Börja om kapitlet' visas när det finns framsteg");
  resetBtn.click();

  assert.match(progressText(window), /Steg 1 av/, "nollställning hoppar till steg 1");
  assert.strictEqual(appEl(window).querySelector(".option--correct"), null, "inget svar kvar efter reset");
  assert.strictEqual(
    window.EdisonApp.chapterProgressStatus("kapitel-1", window.KAPITEL["kapitel-1"]),
    "none",
    "sparat framsteg är nollställt (status 'none')"
  );

  reload(window); // omladdning efter reset → fortfarande färskt
  assert.match(progressText(window), /Steg 1 av/, "efter omladdning är kapitlet färskt igen");
  assert.strictEqual(window.document.getElementById("btn-reset-chapter"), null,
    "ingen 'Börja om'-knapp på ett färskt steg 1");
});

// ---- Bild-steg (media) ----

test("bild-steg renderar lokal bild med alt-text och låser inte Nästa", () => {
  const window = bootstrap({ search: "?kapitel=1" });
  const steps = window.KAPITEL["kapitel-1"].steps;
  const imgIndex = steps.findIndex((s) => s.type === "image");
  assert.ok(imgIndex !== -1, "kapitel 1 har ett bild-steg");

  for (let i = 0; i < imgIndex; i++) nextBtn(window).click();

  const img = appEl(window).querySelector("img.step-image");
  assert.ok(img, "bilden renderas");
  assert.strictEqual(img.getAttribute("src"), steps[imgIndex].src, "rätt lokal src");
  assert.strictEqual(img.getAttribute("alt"), steps[imgIndex].alt, "alt-text finns");
  assert.ok(!/^(https?:)?\/\//.test(img.getAttribute("src")), "src är lokal (ingen CDN/fetch)");
  assert.strictEqual(nextBtn(window).disabled, false, "bild-steg blockerar inte Nästa");
});
