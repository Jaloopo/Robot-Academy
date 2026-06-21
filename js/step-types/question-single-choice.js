(function (root) {
  "use strict";

  var app = root.EdisonApp;
  if (!app || typeof app.registerStepType !== "function") {
    throw new Error("EdisonApp registry måste laddas före flervalspluginet.");
  }

  var SVG_CHECK =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"' +
    ' stroke="#1E5E22" stroke-width="3" stroke-linecap="round"' +
    ' stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto">' +
    '<path d="M5 13l4 4L19 7"/></svg>';

  var SVG_RETRY_BTN =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"' +
    ' stroke="#B26A00" stroke-width="2.4" stroke-linecap="round"' +
    ' stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto">' +
    '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v4h-4"/></svg>';

  function createState() {
    return { done: false, chosen: null, wrongTried: [], feedback: null };
  }

  function restore(step, rec) {
    var st = createState();
    if (!rec || typeof rec !== "object") return st;
    if (rec.done) {
      st.done = true;
      if (typeof rec.chosen === "number") st.chosen = rec.chosen;
      st.feedback = { kind: "ok", msg: "Rätt! Bra jobbat." };
    } else if (Array.isArray(rec.wrongTried)) {
      st.wrongTried = rec.wrongTried.slice();
    }
    return st;
  }

  function serialize(step, st) {
    var rec = { done: !!(st && st.done) };
    if (st && typeof st.chosen === "number") rec.chosen = st.chosen;
    if (st && st.wrongTried && st.wrongTried.length) rec.wrongTried = st.wrongTried.slice();
    return rec;
  }

  app.registerStepType("question_single_choice", {
    createState: createState,
    restore: restore,
    serialize: serialize,
    hasProgress: function (step, rec) {
      return !!(rec && rec.done);
    },
    isDone: function (step, st) {
      return !!(st && st.done);
    },
    render: function (step, st, ctx) {
      var html = "<p class=\"step-text\">" + ctx.ui.escapeHtml(step.text) + "</p>";
      html += "<ul class=\"options\" role=\"list\">";
      step.options.forEach(function (opt, i) {
        var cls = "option";
        var disabled = "";
        var inner = "<span>" + ctx.ui.escapeHtml(opt) + "</span>";
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
      html += ctx.ui.feedbackHtml(st.feedback);
      return html;
    },
    bind: function (container, step, st, ctx) {
      var buttons = container.querySelectorAll(".option[data-idx]");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function () {
          if (st.done) return;
          var choice = parseInt(this.getAttribute("data-idx"), 10);
          st.chosen = choice;
          if (choice === step.correctAnswer) {
            st.done = true;
            st.feedback = { kind: "ok", msg: "Rätt! Bra jobbat." };
            ctx.requestRender({ focus: "next", celebrate: true });
          } else {
            if (st.wrongTried.indexOf(choice) === -1) st.wrongTried.push(choice);
            st.feedback = { kind: "retry", msg: "Inte riktigt – prova en annan knapp." };
            ctx.requestRender({ focus: { selector: ".option:not(:disabled)" } });
          }
        });
      }
    }
  });
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
