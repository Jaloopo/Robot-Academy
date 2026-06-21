(function (root) {
  "use strict";

  var app = root.EdisonApp;
  if (!app || typeof app.registerStepType !== "function") {
    throw new Error("EdisonApp registry måste laddas före ordningspluginet.");
  }

  function createState(step, ctx) {
    return {
      done: false,
      display: ctx.utils.shuffleDisplayOrder(step.options.length, step.correctAnswer),
      picks: [],
      feedback: null
    };
  }

  function restore(step, rec, ctx) {
    var st = createState(step, ctx);
    if (!rec || typeof rec !== "object") return st;
    if (rec.done) {
      st.done = true;
      if (Array.isArray(rec.picks)) st.picks = rec.picks.slice();
      st.feedback = { kind: "ok", msg: "Perfekt ordning! Edison är redo." };
    }
    return st;
  }

  function serialize(step, st) {
    var rec = { done: !!(st && st.done) };
    if (st && st.picks && st.picks.length) rec.picks = st.picks.slice();
    return rec;
  }

  app.registerStepType("ordering", {
    createState: createState,
    restore: restore,
    serialize: serialize,
    hasProgress: function (step, rec) {
      return !!(rec && (rec.done || (rec.picks && rec.picks.length)));
    },
    isDone: function (step, st) {
      return !!(st && st.done);
    },
    render: function (step, st, ctx) {
      var html = "<p class=\"step-text\">" + ctx.ui.escapeHtml(step.text) + "</p>";
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
          "\" aria-label=\"" + ctx.ui.escapeHtml(label) + "\"" + disabled + ">" +
          badge + "<span>" + ctx.ui.escapeHtml(step.options[oi]) + "</span></button></li>";
      });
      html += "</ul>";
      if (!st.done) {
        html += "<button type=\"button\" class=\"btn btn--ghost\" id=\"btn-reset\"" +
          (st.picks.length === 0 ? " disabled" : "") + ">Börja om</button>";
      }
      html += ctx.ui.feedbackHtml(st.feedback);
      return html;
    },
    bind: function (container, step, st, ctx) {
      var buttons = container.querySelectorAll(".option[data-oi]");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function () {
          if (st.done) return;
          var oi = parseInt(this.getAttribute("data-oi"), 10);
          if (st.picks.indexOf(oi) !== -1) return;
          st.picks.push(oi);
          if (st.picks.length === step.options.length) {
            if (ctx.utils.sequencesEqual(st.picks, step.correctAnswer)) {
              st.done = true;
              st.feedback = { kind: "ok", msg: "Perfekt ordning! Edison är redo." };
              ctx.requestRender({ focus: "next", celebrate: true });
            } else {
              st.feedback = { kind: "retry", msg: "Nästan! Tryck ”Börja om” och försök i en annan ordning." };
              ctx.requestRender({ focus: { selector: ".option:not(:disabled)" } });
            }
          } else {
            st.feedback = null;
            ctx.requestRender({ focus: { selector: ".option:not(:disabled)" } });
          }
        });
      }

      var resetBtn = container.ownerDocument.getElementById("btn-reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          if (st.done) return;
          st.picks = [];
          st.feedback = null;
          ctx.requestRender({ focus: { selector: ".option:not(:disabled)" } });
        });
      }
    }
  });
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
