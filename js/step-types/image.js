(function (root) {
  "use strict";

  var app = root.EdisonApp;
  if (!app || typeof app.registerStepType !== "function") {
    throw new Error("EdisonApp registry måste laddas före image-pluginet.");
  }

  function createState() {
    return { done: true };
  }

  app.registerStepType("image", {
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
      var html = "<p class=\"step-text\">" + ctx.ui.escapeHtml(step.text) + "</p>";
      html += "<img class=\"step-image\" src=\"" + ctx.ui.escapeHtml(step.src) +
        "\" alt=\"" + ctx.ui.escapeHtml(step.alt || "") + "\">";
      return html;
    },
    bind: function () {}
  });
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
