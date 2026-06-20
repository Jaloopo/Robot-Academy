(function (root) {
  "use strict";

  // ---- Pure helpers (testable, no DOM) ----

  function sequencesEqual(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  // Shuffles display order of option indices. Avoids showing in "correct" order.
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

  function chapterNumberFromId(id) {
    var match = String(id).match(/^kapitel-(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  }

  function sortedChapterIds(chapters) {
    var ids = [];
    var key;
    for (key in chapters) {
      if (Object.prototype.hasOwnProperty.call(chapters, key) && chapters[key]) {
        ids.push(key);
      }
    }
    ids.sort(function (a, b) {
      var an = chapterNumberFromId(a);
      var bn = chapterNumberFromId(b);
      if (an !== null && bn !== null && an !== bn) return an - bn;
      if (an !== null && bn === null) return -1;
      if (an === null && bn !== null) return 1;
      return a.localeCompare(b, "sv");
    });
    return ids;
  }

  function queryValue(search, name) {
    var query = String(search || "").replace(/^\?/, "");
    if (!query) return null;
    var pairs = query.split("&");
    for (var i = 0; i < pairs.length; i++) {
      var parts = pairs[i].split("=");
      var key = decodeURIComponent((parts[0] || "").replace(/\+/g, " "));
      if (key === name) {
        return decodeURIComponent((parts.slice(1).join("=") || "").replace(/\+/g, " "));
      }
    }
    return null;
  }

  function chapterIdFromSearch(search) {
    var value = queryValue(search, "kapitel");
    if (!value) return null;
    if (/^\d+$/.test(value)) return "kapitel-" + value;
    if (/^kapitel-\d+$/.test(value)) return value;
    return null;
  }

  function chapterHref(id) {
    var nr = chapterNumberFromId(id);
    return "?kapitel=" + encodeURIComponent(nr === null ? id : nr);
  }

  function landingHref() {
    return "./index.html";
  }

  // ---- Progress persistence (localStorage, graceful on file://) ----
  // The site stays dependency-free; this only uses the platform localStorage and
  // degrades to a no-op when it is missing or blocked (e.g. some file:// setups,
  // private mode). The data model (window.KAPITEL) is never touched.

  var STORAGE_PREFIX = "edison-hemguide:";
  var STORAGE_VERSION = 1;
  var storageChecked = false;
  var storageRef = null;

  // Feature-detect a usable localStorage. Wrapped in try/catch because accessing
  // window.localStorage itself can throw (file://) and setItem can throw (quota /
  // private mode). Result is cached for the session.
  function getStorage() {
    if (storageChecked) return storageRef;
    storageChecked = true;
    try {
      var s = root.localStorage;
      var probeKey = STORAGE_PREFIX + "__probe__";
      s.setItem(probeKey, "1");
      s.removeItem(probeKey);
      storageRef = s;
    } catch (e) {
      storageRef = null; // unavailable / blocked → silently skip persistence
    }
    return storageRef;
  }

  function chapterStorageKey(chapterId) {
    return STORAGE_PREFIX + chapterId;
  }

  // Returns the saved payload for a chapter, or null. Validates version and that
  // the saved step count matches the current content (so editing a chapter's
  // steps safely discards stale progress instead of mis-restoring it).
  function loadChapterProgress(chapterId, expectedLen) {
    var s = getStorage();
    if (!s) return null;
    try {
      var raw = s.getItem(chapterStorageKey(chapterId));
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || data.v !== STORAGE_VERSION) return null;
      if (!Array.isArray(data.steps) || data.steps.length !== expectedLen) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function saveChapterProgress(chapterId, data) {
    var s = getStorage();
    if (!s) return;
    try {
      s.setItem(chapterStorageKey(chapterId), JSON.stringify(data));
    } catch (e) {
      // quota / serialization error → degrade silently
    }
  }

  function clearChapterProgress(chapterId) {
    var s = getStorage();
    if (!s) return;
    try {
      s.removeItem(chapterStorageKey(chapterId));
    } catch (e) {
      // ignore
    }
  }

  // "none" | "started" | "done" for the landing/rail badges.
  function chapterProgressStatus(chapterId, chapter) {
    var stepsArr = (chapter && chapter.steps) || [];
    var data = loadChapterProgress(chapterId, stepsArr.length);
    if (!data) return "none";
    if (data.completed) return "done";
    if (data.current > 0) return "started";
    for (var i = 0; i < data.steps.length; i++) {
      var rec = data.steps[i];
      var stp = stepsArr[i];
      if (!rec || !stp) continue;
      if ((stp.type === "question_single_choice" || stp.type === "ordering") && rec.done) return "started";
      if (stp.type === "ordering" && rec.picks && rec.picks.length) return "started";
    }
    return "none";
  }

  // ---- App (DOM) ----

  function initApp(doc) {
    var appEl = doc.getElementById("app");
    if (!appEl) return;
    var chapters = root.KAPITEL || {};
    var chapterIds = sortedChapterIds(chapters);

    // Inline SVG icons (aria-hidden – form+colour, text conveys meaning).
    // Check: used in correct option button and ok-feedback.
    var SVG_CHECK =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"' +
      ' stroke="#1E5E22" stroke-width="3" stroke-linecap="round"' +
      ' stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto">' +
      '<path d="M5 13l4 4L19 7"/></svg>';

    // Retry arrow: used inside wrong option buttons (matches border colour).
    var SVG_RETRY_BTN =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"' +
      ' stroke="#B26A00" stroke-width="2.4" stroke-linecap="round"' +
      ' stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto">' +
      '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v4h-4"/></svg>';

    // Retry arrow: used in retry-feedback paragraph (matches text colour).
    var SVG_RETRY_FEEDBACK =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"' +
      ' stroke="#7A4A00" stroke-width="2.4" stroke-linecap="round"' +
      ' stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto">' +
      '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v4h-4"/></svg>';

    // Mascot: small inline-SVG Edison, decorative, lives in .app-header corner.
    var MASCOT_HTML =
      '<div class="mascot" aria-hidden="true">' +
      '<svg width="48" height="48" viewBox="0 0 64 64" fill="none">' +
      '<line x1="32" y1="6" x2="32" y2="15" stroke="#C8540F" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="32" cy="5" r="3.5" fill="#F26B1D"/>' +
      '<rect x="9" y="14" width="46" height="40" rx="13" fill="#F26B1D"/>' +
      '<rect x="9" y="14" width="46" height="40" rx="13" fill="none" stroke="#C8540F" stroke-width="1.5"/>' +
      '<rect x="15" y="22" width="34" height="24" rx="9" fill="#1F2933"/>' +
      '<circle cx="25" cy="34" r="3.5" fill="#fff"/>' +
      '<circle cx="39" cy="34" r="3.5" fill="#fff"/>' +
      '<path d="M27 40 q5 4 10 0" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
      '</svg></div>';

    function renderLanding(message) {
      appEl.className = ""; // single-column landing (no chapter-rail)
      var html =
        "<header class=\"app-header app-header--landing\">" +
          "<div>" +
            "<p class=\"eyebrow\">Edison Hemguide</p>" +
            "<h1 class=\"app-title\">Välj kapitel</h1>" +
            "<p class=\"landing-intro\">Börja med ett kapitel. Allt laddas från filer som redan finns här.</p>" +
          "</div>" +
          MASCOT_HTML +
        "</header>";

      if (message) {
        html += "<p class=\"landing-message\" role=\"status\">" + escapeHtml(message) + "</p>";
      }

      if (chapterIds.length === 0) {
        html += "<p class=\"step-stub\">Inga kapitel är laddade ännu.</p>";
      } else {
        html += "<main class=\"landing\" aria-label=\"Kapitel\"><ol class=\"chapter-list\">";
        chapterIds.forEach(function (id) {
          var chapter = chapters[id];
          var nr = chapterNumberFromId(id);
          var status = chapterProgressStatus(id, chapter);
          var statusHtml = "";
          if (status === "done") {
            statusHtml = "<span class=\"chapter-status chapter-status--done\">Klart</span>";
          } else if (status === "started") {
            statusHtml = "<span class=\"chapter-status chapter-status--started\">Påbörjat</span>";
          }
          html += "<li><a class=\"chapter-link\" href=\"" + chapterHref(id) + "\">" +
            "<span class=\"chapter-kicker\">" + (nr === null ? "Kapitel" : "Kapitel " + nr) + "</span>" +
            "<span class=\"chapter-title\">" + escapeHtml(chapter.titel || id) + "</span>" +
            statusHtml +
          "</a></li>";
        });
        html += "</ol></main>";
      }

      appEl.innerHTML = html;
    }

    var requestedChapterId = chapterIdFromSearch(root.location && root.location.search);
    if (!requestedChapterId) {
      renderLanding(null);
      return;
    }

    var chapter = chapters[requestedChapterId];
    if (!chapter) {
      renderLanding("Kapitlet finns inte än. Välj ett kapitel i listan.");
      return;
    }

    var chapterIndex = chapterIds.indexOf(requestedChapterId);
    var nextChapterId = chapterIndex !== -1 ? chapterIds[chapterIndex + 1] : null;
    var steps = chapter.steps;
    var totalSteps = steps.length;
    var current = 0;
    var state = steps.map(makeStepState);
    var pendingMascotNudge = false;
    restoreProgress();

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

    // Restore saved per-step answers + resumed step from a previous session.
    // Display order for ordering steps is intentionally NOT restored (it is
    // reshuffled each load); picks map by option index so badges still line up.
    function restoreProgress() {
      var saved = loadChapterProgress(requestedChapterId, totalSteps);
      if (!saved) return;
      saved.steps.forEach(function (rec, i) {
        if (!rec) return;
        var step = steps[i];
        var st = state[i];
        if (step.type === "question_single_choice") {
          if (rec.done) {
            st.done = true;
            if (typeof rec.chosen === "number") st.chosen = rec.chosen;
            st.feedback = { kind: "ok", msg: "Rätt! Bra jobbat." };
          } else if (Array.isArray(rec.wrongTried)) {
            st.wrongTried = rec.wrongTried.slice();
          }
        } else if (step.type === "ordering") {
          if (rec.done) {
            st.done = true;
            if (Array.isArray(rec.picks)) st.picks = rec.picks.slice();
            st.feedback = { kind: "ok", msg: "Perfekt ordning! Edison är redo." };
          }
        }
      });
      if (typeof saved.current === "number" && saved.current >= 0 && saved.current < totalSteps) {
        current = saved.current;
      }
    }

    // Serialize current progress for this chapter. Only stores answer flags +
    // resumed step (never the data model). completed = all steps done AND the
    // last step reached, which drives the "Klart" badge on the landing/rail.
    function persistProgress() {
      var allDone = true;
      var stepRecords = steps.map(function (step, i) {
        var st = state[i];
        if (step.type === "question_single_choice") {
          if (!st.done) allDone = false;
          var qRec = { done: !!st.done };
          if (typeof st.chosen === "number") qRec.chosen = st.chosen;
          if (st.wrongTried && st.wrongTried.length) qRec.wrongTried = st.wrongTried.slice();
          return qRec;
        }
        if (step.type === "ordering") {
          if (!st.done) allDone = false;
          var oRec = { done: !!st.done };
          if (st.picks && st.picks.length) oRec.picks = st.picks.slice();
          return oRec;
        }
        return { done: true }; // text / adult
      });
      saveChapterProgress(requestedChapterId, {
        v: STORAGE_VERSION,
        current: current,
        completed: allDone && current === totalSteps - 1,
        steps: stepRecords
      });
    }

    function hasResettableProgress() {
      if (current > 0) return true;
      for (var i = 0; i < totalSteps; i++) {
        var step = steps[i];
        var st = state[i];
        if (step.type === "question_single_choice" && st.done) return true;
        if (step.type === "ordering" && (st.done || (st.picks && st.picks.length))) return true;
      }
      return false;
    }

    function resetChapter() {
      clearChapterProgress(requestedChapterId);
      state = steps.map(makeStepState);
      current = 0;
      render("card");
    }

    // ---- Rendering ----

    function feedbackHtml(st) {
      if (!st || !st.feedback) return "";
      var icon = st.feedback.kind === "ok" ? SVG_CHECK : SVG_RETRY_FEEDBACK;
      return "<p class=\"feedback feedback--" + st.feedback.kind + "\"" +
        " role=\"status\" aria-live=\"polite\">" +
        icon + "<span>" + escapeHtml(st.feedback.msg) + "</span></p>";
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
        var inner = "<span>" + escapeHtml(opt) + "</span>";
        if (st.done) {
          disabled = " disabled";
          if (i === step.correctAnswer) {
            cls += " option--correct";
            inner = SVG_CHECK + inner;
          }
        } else if (st.wrongTried.indexOf(i) !== -1) {
          cls += " option--wrong";
          inner = SVG_RETRY_BTN + inner;
        }
        var pressed = st.chosen === i ? "true" : "false";
        html += "<li><button type=\"button\" class=\"" + cls + "\" data-idx=\"" + i +
          "\" aria-pressed=\"" + pressed + "\"" + disabled + ">" +
          inner + "</button></li>";
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

    // Desktop-only context column (Layout B). Lists chapters and marks the
    // current one + its progress. NOT the primary step-nav (that stays in .nav).
    // Hidden below 900px via CSS, so it never duplicates the mobile flow.
    function chapterRailHtml() {
      var html = "<aside class=\"chapter-rail\" aria-label=\"Kapitelöversikt\">";
      html += "<p class=\"rail-eyebrow\">Edison Hemguide</p>";
      html += "<nav aria-label=\"Kapitel\"><ol class=\"rail-list\">";
      chapterIds.forEach(function (id) {
        var ch = chapters[id];
        var nr = chapterNumberFromId(id);
        var isCurrent = id === requestedChapterId;
        var cls = "rail-link" + (isCurrent ? " rail-link--current" : "");
        var ariaCurrent = isCurrent ? " aria-current=\"step\"" : "";
        html += "<li><a class=\"" + cls + "\" href=\"" + chapterHref(id) + "\"" + ariaCurrent + ">" +
          "<span class=\"rail-kicker\">" + (nr === null ? "Kapitel" : "Kapitel " + nr) + "</span>" +
          "<span class=\"rail-title\">" + escapeHtml(ch.titel || id) + "</span>";
        if (isCurrent) {
          html += "<span class=\"rail-progress\">Steg " + (current + 1) + " av " + totalSteps + "</span>";
        } else if (chapterProgressStatus(id, ch) === "done") {
          html += "<span class=\"rail-status\">Klart</span>";
        }
        html += "</a></li>";
      });
      html += "</ol></nav>";
      html += "<a class=\"rail-overview\" href=\"" + landingHref() + "\">Alla kapitel</a>";
      html += "</aside>";
      return html;
    }

    function render(focus) {
      var step = steps[current];
      var st = state[current];
      var isAdult = step.role === "adult";
      var cardClass = "step-card" + (isAdult ? " step-card--adult" : "");
      var labelHtml = isAdult
        ? "<span class=\"step-label\">Tips till dig som hjälper</span>"
        : "";
      var isLastStep = current === totalSteps - 1;
      var nextDisabled = !isLastStep && !st.done;
      var pct = Math.round(((current + 1) / totalSteps) * 100);
      var hintHtml = (!st.done && step.type !== "text")
        ? "<p class=\"nav-hint\">Svara först för att gå vidare.</p>"
        : "";
      var navHtml =
        "<nav class=\"nav\" aria-label=\"Stegnavigering\">" +
          "<button type=\"button\" class=\"btn btn--secondary\" id=\"btn-prev\"" +
            (current === 0 ? " disabled" : "") + ">Föregående</button>";

      if (isLastStep) {
        if (st.done) {
          navHtml += "<a class=\"btn btn--primary\" id=\"link-finish\" href=\"" +
            (nextChapterId ? chapterHref(nextChapterId) : landingHref()) + "\">" +
            (nextChapterId ? "Nästa kapitel" : "Till kapitelöversikt") + "</a>";
        } else {
          navHtml += "<button type=\"button\" class=\"btn btn--primary\" id=\"btn-next\" disabled>Klart</button>";
        }
      } else {
        navHtml += "<button type=\"button\" class=\"btn btn--primary\" id=\"btn-next\"" +
          (nextDisabled ? " disabled" : "") + ">Nästa</button>";
      }
      navHtml += "</nav>";
      if (isLastStep && st.done && nextChapterId) {
        navHtml += "<p class=\"chapter-finish\"><a href=\"" + landingHref() + "\">Till kapitelöversikt</a></p>";
      }
      if (hasResettableProgress()) {
        navHtml += "<p class=\"chapter-reset\">" +
          "<button type=\"button\" class=\"linklike\" id=\"btn-reset-chapter\">Börja om kapitlet</button></p>";
      }

      persistProgress(); // remember resumed step + answers for next visit

      appEl.className = "has-rail"; // enables two-column desktop layout (≥900px)
      appEl.innerHTML =
        chapterRailHtml() +
        "<div class=\"step-main\">" +
          "<header class=\"app-header\">" +
            "<div>" +
              "<h1 class=\"app-title\">" + escapeHtml(chapter.titel) + "</h1>" +
              "<p class=\"progress\">Steg " + (current + 1) + " av " + totalSteps + "</p>" +
            "</div>" +
            MASCOT_HTML +
          "</header>" +
          "<div class=\"progressbar\" aria-hidden=\"true\"><span style=\"width:" + pct + "%\"></span></div>" +
          "<article class=\"" + cardClass + "\" id=\"step-card\" tabindex=\"-1\">" +
            labelHtml +
            renderStepContent(step, st) +
          "</article>" +
          hintHtml +
          navHtml +
        "</div>";

      // Trigger mascot nudge on correct answer
      if (pendingMascotNudge) {
        pendingMascotNudge = false;
        var mascot = appEl.querySelector(".mascot");
        if (mascot) {
          void mascot.offsetWidth; // force reflow to restart animation
          mascot.classList.add("is-happy");
        }
      }

      // Re-attach handlers
      doc.getElementById("btn-prev").addEventListener("click", goPrev);
      var nextBtn = doc.getElementById("btn-next");
      if (nextBtn) nextBtn.addEventListener("click", goNext);
      var resetChapterBtn = doc.getElementById("btn-reset-chapter");
      if (resetChapterBtn) resetChapterBtn.addEventListener("click", resetChapter);

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
        if (!el) el = doc.getElementById("link-finish");
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
        pendingMascotNudge = true;
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
          pendingMascotNudge = true;
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

  // ---- Bootstrap (browser only) ----
  if (typeof document !== "undefined" && document.getElementById) {
    initApp(document);
  }

  // Expose testable pure functions for Node tests.
  root.EdisonApp = {
    sequencesEqual: sequencesEqual,
    shuffleDisplayOrder: shuffleDisplayOrder,
    chapterIdFromSearch: chapterIdFromSearch,
    sortedChapterIds: sortedChapterIds,
    getStorage: getStorage,
    loadChapterProgress: loadChapterProgress,
    chapterProgressStatus: chapterProgressStatus,
    initApp: initApp
  };

})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
