"use strict";

// Reproducerbar genomklick av ett kapitel (roadmap-steg 5 / dev-testverktyg).
// Kör med: npm test  (node --test). Använder jsdom som DEV-beroende – sajten själv
// är fortsatt beroendefri och laddas oförändrad via file:// och GitHub Pages.
//
// Testet driver den RIKTIGA renderaren (js/app.js) mot det RIKTIGA innehållet
// (content/kapitel-1.js), och lägger vid behov till fler kapitel direkt i
// window.KAPITEL. Genomklicken läser correctAnswer ur datan i stället för att
// hårdkoda svar.

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const contentSrc = fs.readFileSync(path.join(ROOT, "content", "kapitel-1.js"), "utf8");
const appSrc = fs.readFileSync(path.join(ROOT, "js", "app.js"), "utf8");

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
function bootstrap(options = {}) {
  const search = options.search || "";
  const extraChapters = options.extraChapters || [];
  const dom = new JSDOM(
    '<!DOCTYPE html><html lang="sv"><head><meta charset="UTF-8"></head>' +
      '<body><div id="app"></div></body></html>',
    { runScripts: "outside-only", url: "file:///workspace/index.html" + search }
  );
  const { window } = dom;
  window.eval(contentSrc); // sätter window.KAPITEL
  extraChapters.forEach((chapter) => {
    window.KAPITEL[chapter.id] = chapter;
  });
  window.eval(appSrc); // IIFE: kör initApp(document) och exponerar window.EdisonApp
  return window;
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
