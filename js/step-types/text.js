(function (root) {
  "use strict";

  var app = root.EdisonApp;
  if (!app || typeof app.registerStepType !== "function") {
    throw new Error("EdisonApp registry måste laddas före text-pluginet.");
  }

  function createState() {
    return { done: true };
  }

  app.registerStepType("text", {
    createState: createState,
    restore: createState,
    serialize: function () {
      return { done: true };
    },
    hasProgress: function () {
      return false;
    },
    isDone: function () {
      return true;
    },
    render: function (step, state, ctx) {
      return "<p class=\"step-text\">" + ctx.ui.escapeHtml(step.text) + "</p>";
    },
    bind: function () {}
  });
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
