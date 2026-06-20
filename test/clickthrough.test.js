"use strict";

// Reproducerbar genomklick av ett kapitel (roadmap-steg 5 / dev-testverktyg).
// Kör med: npm test  (node --test). Använder jsdom som DEV-beroende – sajten själv
// är fortsatt beroendefri och laddas oförändrad via file:// och GitHub Pages.
//
// Testet driver den RIKTIGA renderaren (js/app.js) mot det RIKTIGA innehållet
// (content/kapitel-1.js) och verifierar gating, fel→rätt-feedback och ordning –
// så att varje "granska"-steg blir reproducerbart utan manuell klickning.

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const contentSrc = fs.readFileSync(path.join(ROOT, "content", "kapitel-1.js"), "utf8");
const appSrc = fs.readFileSync(path.join(ROOT, "js", "app.js"), "utf8");

// Bygg en jsdom-värld, ladda innehåll + app och rendera kapitlet i #app.
function bootstrap() {
  const dom = new JSDOM(
    '<!DOCTYPE html><html lang="sv"><head><meta charset="UTF-8"></head>' +
      '<body><div id="app"></div></body></html>',
    { runScripts: "outside-only" }
  );
  const { window } = dom;
  window.eval(contentSrc); // sätter window.KAPITEL
  window.eval(appSrc); // IIFE: kör initApp(document) och exponerar window.EdisonApp
  return window;
}

function appEl(window) {
  return window.document.getElementById("app");
}

function nextBtn(window) {
  return window.document.getElementById("btn-next");
}

function progressText(window) {
  return appEl(window).querySelector(".progress").textContent;
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

// ---- Full genomklick ----

test("genomklick av kapitel-1: gating, fel→rätt och ordning", () => {
  const window = bootstrap();
  const doc = window.document;
  const steps = window.KAPITEL["kapitel-1"].steps;
  const total = steps.length;

  assert.ok(appEl(window).querySelector(".app-header"), "headern renderas");

  for (let s = 0; s < total; s++) {
    const step = steps[s];
    assert.match(
      progressText(window),
      new RegExp("Steg " + (s + 1) + " av " + total),
      "framstegstexten visar rätt steg"
    );

    if (step.type === "question_single_choice") {
      // Gating: "Nästa" är låst tills frågan är rätt besvarad.
      assert.strictEqual(nextBtn(window).disabled, true, "flerval: låst före svar");

      // Fel svar → snäll retry-feedback, alternativet markeras, fortsatt låst.
      const wrong = step.options.findIndex((_, i) => i !== step.correctAnswer);
      if (wrong !== -1) {
        appEl(window).querySelector('.option[data-idx="' + wrong + '"]').click();
        assert.ok(appEl(window).querySelector(".feedback--retry"), "retry-feedback visas");
        assert.ok(appEl(window).querySelector(".option--wrong"), "fel-alternativ markeras");
        assert.strictEqual(nextBtn(window).disabled, true, "fortfarande låst efter fel");
      }

      // Rätt svar → ok-feedback, rätt alternativ blir grönt, "Nästa" aktiveras.
      appEl(window).querySelector('.option[data-idx="' + step.correctAnswer + '"]').click();
      assert.ok(appEl(window).querySelector(".feedback--ok"), "ok-feedback visas");
      assert.ok(appEl(window).querySelector(".option--correct"), "rätt alternativ markeras grönt");
      assert.strictEqual(nextBtn(window).disabled, false, "Nästa aktiveras efter rätt");
    } else if (step.type === "ordering") {
      assert.strictEqual(nextBtn(window).disabled, true, "ordning: låst före svar");

      // Visningsordningen MÅSTE vara blandad (aldrig den lösta ordningen).
      const displayed = Array.prototype.map.call(
        appEl(window).querySelectorAll(".option[data-oi]"),
        (b) => parseInt(b.getAttribute("data-oi"), 10)
      );
      assert.notDeepStrictEqual(displayed, step.correctAnswer, "visningsordning är blandad");

      // Fel ordning (byt plats på de två första) → retry-feedback, sedan "Börja om".
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

      // Rätt ordning → ok-feedback + "Nästa" på.
      step.correctAnswer.forEach((oi) => {
        appEl(window).querySelector('.option[data-oi="' + oi + '"]').click();
      });
      assert.ok(appEl(window).querySelector(".feedback--ok"), "ordning: ok-feedback");
      assert.strictEqual(nextBtn(window).disabled, false, "ordning: Nästa aktiveras");
    } else {
      // text / adult: redan klart, "Nästa" är på (utom sista steget).
      const expectDisabled = s === total - 1;
      assert.strictEqual(
        nextBtn(window).disabled,
        expectDisabled,
        "text/adult-steg har rätt Nästa-tillstånd"
      );
    }

    // Gå vidare (sista steget har låst Nästa – då stannar vi).
    if (s < total - 1) {
      assert.strictEqual(nextBtn(window).disabled, false, "kan gå vidare från steg " + (s + 1));
      nextBtn(window).click();
    } else {
      assert.strictEqual(nextBtn(window).disabled, true, "sista steget: Nästa låst");
    }
  }

  assert.match(progressText(window), new RegExp("Steg " + total + " av " + total), "nådde sista steget");
});

// ---- Bakåtnavigering bevarar tillstånd ----

test("Föregående bevarar besvarad fråga (rätt alternativ kvar grönt)", () => {
  const window = bootstrap();
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
