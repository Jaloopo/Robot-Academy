(function (root) {
  "use strict";

  // ---- Pure helpers (testbara, ingen DOM) ----

  function sequencesEqual(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  // Blandad visningsordning av optionsindex. Undviker att visa i "löst" ordning.
  function shuffleDisplayOrder(n, avoid) {
    var arr = [];
    for (var i = 0; i < n; i++) arr.push(i);
    if (n < 2) return arr;
    for (var attempt = 0; attempt < 20; attempt++) {
      for (var k = arr.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1));
        var t = arr[k]; arr[k] = arr[j]; arr[j] = t;
      }
      if (!avoid || !sequencesEqual(arr, avoid)) return arr;
    }
    return arr;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---- App (DOM) ----

  function initApp(doc) {
    var CHAPTER_ID = "kapitel-1";
    var appEl = doc.getElementById("app");
    var chapter = root.KAPITEL && root.KAPITEL[CHAPTER_ID];

    if (!chapter) {
      appEl.textContent = "Kunde inte ladda kapitel.";
      return;
    }

    var steps = chapter.steps;
    var totalSteps = steps.length;
    var current = 0;
    var state = steps.map(makeStepState);

    function makeStepState(step) {
      if (step.type === "question_single_choice") {
        return { done: false, chosen: null, wrongTried: [], feedback: null };
      }
      if (step.type === "ordering") {
        return {
          done: false,
          display: shuffleDisplayOrder(step.options.length, step.correctAnswer),
          picks: [],
          feedback: null
        };
      }
      return { done: true }; // text / adult
    }

    // ---- Rendering ----

    function feedbackHtml(st) {
      if (!st || !st.feedback) return "";
      return "<p class=\"feedback feedback--" + st.feedback.kind + "\" " +
        "role=\"status\" aria-live=\"polite\">" + escapeHtml(st.feedback.msg) + "</p>";
    }

    function renderText(step) {
      return "<p class=\"step-text\">" + escapeHtml(step.text) + "</p>";
    }

    function renderSingleChoice(step, st) {
      var html = "<p class=\"step-text\">" + escapeHtml(step.text) + "</p>";
      html += "<ul class=\"options\" role=\"list\">";
      step.options.forEach(function (opt, i) {
        var cls = "option";
        var disabled = "";
        if (st.done) {
          disabled = " disabled";
          if (i === step.correctAnswer) cls += " option--correct";
        } else if (st.wrongTried.indexOf(i) !== -1) {
          cls += " option--wrong";
        }
        var pressed = st.chosen === i ? "true" : "false";
        html += "<li><button type=\"button\" class=\"" + cls + "\" data-idx=\"" + i +
          "\" aria-pressed=\"" + pressed + "\"" + disabled + ">" +
          escapeHtml(opt) + "</button></li>";
      });
      html += "</ul>";
      html += feedbackHtml(st);
      return html;
    }

    function renderOrdering(step, st) {
      var html = "<p class=\"step-text\">" + escapeHtml(step.text) + "</p>";
      html += "<ul class=\"options options--ordering\" role=\"list\">";
      st.display.forEach(function (oi) {
        var pos = st.picks.indexOf(oi);
        var picked = pos !== -1;
        var cls = "option" + (picked ? " option--picked" : "");
        var disabled = (st.done || picked) ? " disabled" : "";
        var badge = picked
          ? "<span class=\"option-badge\" aria-hidden=\"true\">" + (pos + 1) + "</span>"
          : "";
        var label = picked
          ? "Vald som nummer " + (pos + 1) + ": " + step.options[oi]
          : step.options[oi];
        html += "<li><button type=\"button\" class=\"" + cls + "\" data-oi=\"" + oi +
          "\" aria-pressed=\"" + (picked ? "true" : "false") +
          "\" aria-label=\"" + escapeHtml(label) + "\"" + disabled + ">" +
          badge + "<span>" + escapeHtml(step.options[oi]) + "</span></button></li>";
      });
      html += "</ul>";
      if (!st.done) {
        html += "<button type=\"button\" class=\"btn btn--ghost\" id=\"btn-reset\"" +
          (st.picks.length === 0 ? " disabled" : "") + ">Börja om</button>";
      }
      html += feedbackHtml(st);
      return html;
    }

    function renderStepContent(step, st) {
      switch (step.type) {
        case "text":
          return renderText(step);
        case "question_single_choice":
          return renderSingleChoice(step, st);
        case "ordering":
          return renderOrdering(step, st);
        default:
          return "<p class=\"step-stub\">Okänd stegtyp: " + escapeHtml(step.type) + "</p>";
      }
    }

    function render(focus) {
      var step = steps[current];
      var st = state[current];
      var isAdult = step.role === "adult";
      var cardClass = "step-card" + (isAdult ? " step-card--adult" : "");
      var labelHtml = isAdult
        ? "<span class=\"step-label\">Tips till dig som hjälper</span>"
        : "";
      var nextDisabled = (current === totalSteps - 1) || !st.done;
      var hintHtml = (!st.done && step.type !== "text")
        ? "<p class=\"nav-hint\">Svara först för att gå vidare.</p>"
        : "";

      appEl.innerHTML =
        "<header class=\"app-header\">" +
          "<h1 class=\"app-title\">" + escapeHtml(chapter.titel) + "</h1>" +
          "<p class=\"progress\">Steg " + (current + 1) + " av " + totalSteps + "</p>" +
        "</header>" +
        "<article class=\"" + cardClass + "\" id=\"step-card\" tabindex=\"-1\">" +
          labelHtml +
          renderStepContent(step, st) +
        "</article>" +
        hintHtml +
        "<nav class=\"nav\" aria-label=\"Stegnavigering\">" +
          "<button type=\"button\" class=\"btn btn--secondary\" id=\"btn-prev\"" +
            (current === 0 ? " disabled" : "") + ">Föregående</button>" +
          "<button type=\"button\" class=\"btn btn--primary\" id=\"btn-next\"" +
            (nextDisabled ? " disabled" : "") + ">Nästa</button>" +
        "</nav>";

      // Re-attach handlers
      doc.getElementById("btn-prev").addEventListener("click", goPrev);
      doc.getElementById("btn-next").addEventListener("click", goNext);

      if (step.type === "question_single_choice") {
        forEachEl(appEl.querySelectorAll(".option[data-idx]"), function (btn) {
          btn.addEventListener("click", function () {
            onChoice(parseInt(btn.getAttribute("data-idx"), 10));
          });
        });
      } else if (step.type === "ordering") {
        forEachEl(appEl.querySelectorAll(".option[data-oi]"), function (btn) {
          btn.addEventListener("click", function () {
            onPick(parseInt(btn.getAttribute("data-oi"), 10));
          });
        });
        var resetBtn = doc.getElementById("btn-reset");
        if (resetBtn) resetBtn.addEventListener("click", onReset);
      }

      applyFocus(focus);
    }

    function forEachEl(list, fn) {
      for (var i = 0; i < list.length; i++) fn(list[i]);
    }

    function applyFocus(focus) {
      if (!focus) return;
      var el = null;
      if (focus === "next") {
        el = doc.getElementById("btn-next");
        if (el && el.disabled) el = null;
      } else if (focus === "options") {
        el = appEl.querySelector(".option:not(:disabled)");
      }
      if (!el) el = doc.getElementById("step-card");
      if (el && typeof el.focus === "function") el.focus();
    }

    // ---- Interaction ----

    function onChoice(i) {
      var step = steps[current];
      var st = state[current];
      if (st.done) return;
      st.chosen = i;
      if (i === step.correctAnswer) {
        st.done = true;
        st.feedback = { kind: "ok", msg: "Rätt! Bra jobbat." };
        render("next");
      } else {
        if (st.wrongTried.indexOf(i) === -1) st.wrongTried.push(i);
        st.feedback = { kind: "retry", msg: "Inte riktigt – prova en annan knapp." };
        render("options");
      }
    }

    function onPick(oi) {
      var step = steps[current];
      var st = state[current];
      if (st.done || st.picks.indexOf(oi) !== -1) return;
      st.picks.push(oi);
      if (st.picks.length === step.options.length) {
        if (sequencesEqual(st.picks, step.correctAnswer)) {
          st.done = true;
          st.feedback = { kind: "ok", msg: "Perfekt ordning! Edison är redo." };
          render("next");
        } else {
          st.feedback = { kind: "retry", msg: "Nästan! Tryck ”Börja om” och försök i en annan ordning." };
          render("options");
        }
      } else {
        st.feedback = null;
        render("options");
      }
    }

    function onReset() {
      var st = state[current];
      if (st.done) return;
      st.picks = [];
      st.feedback = null;
      render("options");
    }

    function goPrev() {
      if (current > 0) { current--; render("card"); }
    }

    function goNext() {
      if (current < totalSteps - 1 && state[current].done) { current++; render("card"); }
    }

    render(null);
  }

  // ---- Bootstrap (endast i webbläsare) ----
  if (typeof document !== "undefined" && document.getElementById) {
    initApp(document);
  }

  // Exponera testbara rena funktioner för Node-tester.
  root.EdisonApp = { sequencesEqual: sequencesEqual, shuffleDisplayOrder: shuffleDisplayOrder, initApp: initApp };

})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
