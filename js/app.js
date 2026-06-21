(function (root) {
  "use strict";

  var app = root.EdisonApp = root.EdisonApp || {};

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
      storageRef = null; // unavailable / blocked -> silently skip persistence
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
      // quota / serialization error -> degrade silently
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

  function utilityPluginContext() {
    return {
      ui: {
        escapeHtml: escapeHtml,
        feedbackHtml: function () { return ""; }
      },
      utils: {
        sequencesEqual: sequencesEqual,
        shuffleDisplayOrder: shuffleDisplayOrder
      },
      requestRender: function () {},
      prefersReducedMotion: function () { return false; }
    };
  }

  // "none" | "started" | "done" for tests and non-rendering status checks.
  function chapterProgressStatus(chapterId, chapter) {
    var stepsArr = (chapter && chapter.steps) || [];
    var data = loadChapterProgress(chapterId, stepsArr.length);
    if (!data) return "none";
    if (data.completed) return "done";
    if (data.current > 0) return "started";
    for (var i = 0; i < data.steps.length; i++) {
      var rec = data.steps[i];
      var step = stepsArr[i];
      var plugin = app.getStepType && step ? app.getStepType(step.type) : null;
      if (!rec || !step || !plugin) continue;
      try {
        if (plugin.hasProgress(step, rec, utilityPluginContext())) return "started";
      } catch (e) {
        return "started";
      }
    }
    return "none";
  }

  // ---- App (DOM) ----

  function initApp(doc) {
    var appEl = doc.getElementById("app");
    if (!appEl) return;

    if (typeof app.cleanupActiveView === "function") {
      app.cleanupActiveView();
    }
    app.cleanupActiveView = null;

    var chapters = root.KAPITEL || {};
    var chapterIds = sortedChapterIds(chapters);

    // Inline SVG icons (aria-hidden - form+colour, text conveys meaning).
    // Check: used in ok-feedback.
    var SVG_CHECK =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"' +
      ' stroke="#1E5E22" stroke-width="3" stroke-linecap="round"' +
      ' stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto">' +
      '<path d="M5 13l4 4L19 7"/></svg>';

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

    function feedbackHtml(feedback) {
      if (!feedback) return "";
      var icon = feedback.kind === "ok" ? SVG_CHECK : SVG_RETRY_FEEDBACK;
      return "<p class=\"feedback feedback--" + feedback.kind + "\"" +
        " role=\"status\" aria-live=\"polite\">" +
        icon + "<span>" + escapeHtml(feedback.msg) + "</span></p>";
    }

    function prefersReducedMotion() {
      return !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }

    function createPluginContext(generation) {
      return {
        ui: {
          escapeHtml: escapeHtml,
          feedbackHtml: feedbackHtml
        },
        utils: {
          sequencesEqual: sequencesEqual,
          shuffleDisplayOrder: shuffleDisplayOrder
        },
        requestRender: function (request) {
          if (viewDisposed || generation !== renderGeneration) return;
          request = request || {};
          if (request.celebrate) pendingMascotNudge = true;
          render(request.focus || null);
        },
        prefersReducedMotion: prefersReducedMotion
      };
    }

    function getStepPlugin(step) {
      if (!app.getStepType || !step) return null;
      return app.getStepType(step.type);
    }

    function logPluginError(step, error) {
      if (root.console && typeof root.console.error === "function") {
        root.console.error("Edison Hemguide stegfel", {
          chapter: requestedChapterId,
          type: step && step.type,
          error: error
        });
      }
    }

    function lockedErrorMessage(step) {
      return "Okänd stegtyp: " + String(step && step.type ? step.type : "saknas") +
        ". Steget är låst tills det rättas.";
    }

    function makeErrorEntry(step, error) {
      if (error) logPluginError(step, error);
      return {
        plugin: null,
        state: null,
        errorMessage: lockedErrorMessage(step)
      };
    }

    function markEntryError(entry, step, error) {
      if (error) logPluginError(step, error);
      entry.plugin = null;
      entry.state = null;
      entry.errorMessage = lockedErrorMessage(step);
    }

    function makeStepEntry(step, savedRecord) {
      var plugin = getStepPlugin(step);
      if (!plugin) return makeErrorEntry(step, new Error("Saknat plugin"));
      try {
        return {
          plugin: plugin,
          state: savedRecord ? plugin.restore(step, savedRecord, createPluginContext(0)) :
            plugin.createState(step, createPluginContext(0)),
          errorMessage: null
        };
      } catch (e) {
        return makeErrorEntry(step, e);
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
        var plugin = getStepPlugin(stp);
        if (!rec || !stp || !plugin) continue;
        try {
          if (plugin.hasProgress(stp, rec, createPluginContext(0))) return "started";
        } catch (e) {
          logPluginError(stp, e);
        }
      }
      return "none";
    }

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
    var entries = [];
    var pendingMascotNudge = false;
    var currentCleanup = null;
    var renderGeneration = 0;
    var viewDisposed = false;

    restoreProgress();
    app.cleanupActiveView = disposeView;

    // Restore saved per-step answers + resumed step from a previous session.
    // Runtime display details are intentionally owned by plugins; saved records
    // only contain logical, restorable state.
    function restoreProgress() {
      var saved = loadChapterProgress(requestedChapterId, totalSteps);
      entries = steps.map(function (step, i) {
        return makeStepEntry(step, saved && saved.steps ? saved.steps[i] : null);
      });
      if (saved && typeof saved.current === "number" && saved.current >= 0 && saved.current < totalSteps) {
        current = saved.current;
      }
    }

    function entryIsDone(entry, step) {
      if (!entry || entry.errorMessage || !entry.plugin) return false;
      try {
        return !!entry.plugin.isDone(step, entry.state, createPluginContext(renderGeneration));
      } catch (e) {
        markEntryError(entry, step, e);
        return false;
      }
    }

    function serializeEntry(entry, step) {
      if (!entry || entry.errorMessage || !entry.plugin) return null;
      try {
        return entry.plugin.serialize(step, entry.state, createPluginContext(renderGeneration));
      } catch (e) {
        markEntryError(entry, step, e);
        return null;
      }
    }

    // Serialize current progress for this chapter. Only stores plugin-owned
    // logical records + resumed step (never the data model). completed = all
    // steps done AND the last step reached, which drives badges on landing/rail.
    function persistProgress() {
      var allDone = true;
      var stepRecords = steps.map(function (step, i) {
        var entry = entries[i];
        if (!entryIsDone(entry, step)) allDone = false;
        var record = serializeEntry(entry, step);
        if (entry && entry.errorMessage) allDone = false;
        return record;
      });
      saveChapterProgress(requestedChapterId, {
        v: STORAGE_VERSION,
        current: current,
        completed: allDone && current === totalSteps - 1,
        steps: stepRecords
      });
    }

    function entryHasProgress(entry, step) {
      if (!entry || entry.errorMessage || !entry.plugin) return false;
      var rec = serializeEntry(entry, step);
      if (!rec) return false;
      try {
        return !!entry.plugin.hasProgress(step, rec, createPluginContext(renderGeneration));
      } catch (e) {
        markEntryError(entry, step, e);
        return false;
      }
    }

    function hasResettableProgress() {
      if (current > 0) return true;
      for (var i = 0; i < totalSteps; i++) {
        if (entryHasProgress(entries[i], steps[i])) return true;
      }
      return false;
    }

    function resetChapter() {
      clearChapterProgress(requestedChapterId);
      entries = steps.map(function (step) {
        return makeStepEntry(step, null);
      });
      current = 0;
      render("card");
    }

    function cleanupCurrent() {
      if (!currentCleanup) return;
      var cleanupRecord = currentCleanup;
      currentCleanup = null;
      try {
        cleanupRecord.cleanup();
      } catch (e) {
        markEntryError(cleanupRecord.entry, cleanupRecord.step, e);
      }
    }

    function disposeView() {
      viewDisposed = true;
      cleanupCurrent();
      if (app.cleanupActiveView === disposeView) app.cleanupActiveView = null;
    }

    // ---- Rendering ----

    function renderStepEntry(entry, step) {
      if (!entry || entry.errorMessage || !entry.plugin) return renderErrorStep(entry, step);
      try {
        return entry.plugin.render(step, entry.state, createPluginContext(renderGeneration));
      } catch (e) {
        markEntryError(entry, step, e);
        return renderErrorStep(entry, step);
      }
    }

    function renderErrorStep(entry, step) {
      var message = entry && entry.errorMessage ? entry.errorMessage : lockedErrorMessage(step);
      return "<p class=\"step-stub\" role=\"alert\">" + escapeHtml(message) + "</p>";
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
      renderGeneration += 1;
      cleanupCurrent();

      var step = steps[current];
      var entry = entries[current];
      var resettableProgress = hasResettableProgress();
      var done = entry && !entry.errorMessage && entryIsDone(entry, step);
      persistProgress(); // remember resumed step + answers for next visit
      if (entry && entry.errorMessage) done = false;
      var contentHtml = renderStepEntry(entry, step);
      if (entry && entry.errorMessage) done = false;
      var isAdult = step.role === "adult";
      var cardClass = "step-card" + (isAdult ? " step-card--adult" : "");
      var labelHtml = isAdult
        ? "<span class=\"step-label\">Tips till dig som hjälper</span>"
        : "";
      var isLastStep = current === totalSteps - 1;
      var nextDisabled = !isLastStep && !done;
      var pct = Math.round(((current + 1) / totalSteps) * 100);
      var hintHtml = !done
        ? "<p class=\"nav-hint\">Svara först för att gå vidare.</p>"
        : "";
      var navHtml =
        "<nav class=\"nav\" aria-label=\"Stegnavigering\">" +
          "<button type=\"button\" class=\"btn btn--secondary\" id=\"btn-prev\"" +
            (current === 0 ? " disabled" : "") + ">Föregående</button>";

      if (isLastStep) {
        if (done) {
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
      if (isLastStep && done && nextChapterId) {
        navHtml += "<p class=\"chapter-finish\"><a href=\"" + landingHref() + "\">Till kapitelöversikt</a></p>";
      }
      if (resettableProgress) {
        navHtml += "<p class=\"chapter-reset\">" +
          "<button type=\"button\" class=\"linklike\" id=\"btn-reset-chapter\">Börja om kapitlet</button></p>";
      }

      appEl.className = "has-rail"; // enables two-column desktop layout (>=900px)
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
            contentHtml +
          "</article>" +
          hintHtml +
          navHtml +
        "</div>";

      // Trigger mascot nudge on correct answer.
      if (pendingMascotNudge) {
        pendingMascotNudge = false;
        var mascot = appEl.querySelector(".mascot");
        if (mascot) {
          void mascot.offsetWidth; // force reflow to restart animation
          mascot.classList.add("is-happy");
        }
      }

      // Re-attach shell handlers.
      doc.getElementById("btn-prev").addEventListener("click", goPrev);
      var nextBtn = doc.getElementById("btn-next");
      if (nextBtn) nextBtn.addEventListener("click", goNext);
      var resetChapterBtn = doc.getElementById("btn-reset-chapter");
      if (resetChapterBtn) resetChapterBtn.addEventListener("click", resetChapter);

      bindCurrentStep(entry, step);
      applyFocus(focus);
    }

    function bindCurrentStep(entry, step) {
      if (!entry || entry.errorMessage || !entry.plugin) return;
      var card = doc.getElementById("step-card");
      try {
        var cleanup = entry.plugin.bind(card, step, entry.state, createPluginContext(renderGeneration));
        if (typeof cleanup === "function") {
          var didCleanup = false;
          currentCleanup = {
            entry: entry,
            step: step,
            cleanup: function () {
              if (didCleanup) return;
              didCleanup = true;
              cleanup();
            }
          };
        }
      } catch (e) {
        markEntryError(entry, step, e);
        render("card");
      }
    }

    function applyFocus(focus) {
      if (!focus) return;
      var el = null;
      var card = doc.getElementById("step-card");
      if (focus === "next") {
        el = doc.getElementById("btn-next");
        if (!el) el = doc.getElementById("link-finish");
        if (el && el.disabled) el = null;
      } else if (focus === "step" || focus === "card") {
        el = card;
      } else if (focus && typeof focus.selector === "string" && card) {
        el = card.querySelector(focus.selector);
        if (el && el.disabled) el = null;
      }
      if (!el) el = card;
      if (el && typeof el.focus === "function") el.focus();
    }

    // ---- Navigation ----

    function goPrev() {
      if (current > 0) { current--; render("card"); }
    }

    function goNext() {
      if (current < totalSteps - 1 && entryIsDone(entries[current], steps[current])) {
        current++;
        render("card");
      }
    }

    render(null);
  }

  // ---- Bootstrap (browser only) ----
  if (typeof document !== "undefined" && document.getElementById) {
    initApp(document);
  }

  // Expose testable pure functions without replacing the additive registry.
  app.sequencesEqual = sequencesEqual;
  app.shuffleDisplayOrder = shuffleDisplayOrder;
  app.chapterIdFromSearch = chapterIdFromSearch;
  app.sortedChapterIds = sortedChapterIds;
  app.getStorage = getStorage;
  app.loadChapterProgress = loadChapterProgress;
  app.chapterProgressStatus = chapterProgressStatus;
  app.initApp = initApp;

})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
