(function () {
  "use strict";

  var CHAPTER_ID = "kapitel-1";
  var currentStepIndex = 0;

  var appEl = document.getElementById("app");
  var chapter = window.KAPITEL && window.KAPITEL[CHAPTER_ID];

  if (!chapter) {
    appEl.textContent = "Kunde inte ladda kapitel.";
    return;
  }

  var steps = chapter.steps;
  var totalSteps = steps.length;

  function renderStepContent(step) {
    switch (step.type) {
      case "text":
        return renderText(step);
      case "question_single_choice":
        return renderQuestionSingleChoiceStub(step);
      case "ordering":
        return renderOrderingStub(step);
      default:
        return "<p class=\"step-stub\">Okänd stegtyp: " + escapeHtml(step.type) + "</p>";
    }
  }

  function renderText(step) {
    return "<p class=\"step-text\">" + escapeHtml(step.text) + "</p>";
  }

  // TODO (PR 3): Implement question_single_choice interaction
  function renderQuestionSingleChoiceStub(step) {
    return (
      "<p class=\"step-text\">" + escapeHtml(step.text) + "</p>" +
      "<p class=\"step-stub\">Flervalsfrågor kommer i PR 3.</p>"
    );
  }

  // TODO (PR 4): Implement ordering interaction
  function renderOrderingStub(step) {
    return (
      "<p class=\"step-text\">" + escapeHtml(step.text) + "</p>" +
      "<p class=\"step-stub\">Ordningsspel kommer i PR 4.</p>"
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    var step = steps[currentStepIndex];
    var isAdult = step.role === "adult";
    var cardClass = "step-card" + (isAdult ? " step-card--adult" : "");
    var labelHtml = isAdult
      ? "<span class=\"step-label\">Tips till dig som hjälper</span>"
      : "";

    appEl.innerHTML =
      "<header class=\"app-header\">" +
        "<h1 class=\"app-title\">" + escapeHtml(chapter.titel) + "</h1>" +
        "<p class=\"progress\">Steg " + (currentStepIndex + 1) + " av " + totalSteps + "</p>" +
      "</header>" +
      "<article class=\"" + cardClass + "\">" +
        labelHtml +
        renderStepContent(step) +
      "</article>" +
      "<nav class=\"nav\" aria-label=\"Stegnavigering\">" +
        "<button type=\"button\" class=\"btn btn--secondary\" id=\"btn-prev\"" +
          (currentStepIndex === 0 ? " disabled" : "") + ">Föregående</button>" +
        "<button type=\"button\" class=\"btn btn--primary\" id=\"btn-next\"" +
          (currentStepIndex === totalSteps - 1 ? " disabled" : "") + ">Nästa</button>" +
      "</nav>";

    document.getElementById("btn-prev").addEventListener("click", goPrev);
    document.getElementById("btn-next").addEventListener("click", goNext);
  }

  function goPrev() {
    if (currentStepIndex > 0) {
      currentStepIndex--;
      render();
    }
  }

  function goNext() {
    if (currentStepIndex < totalSteps - 1) {
      currentStepIndex++;
      render();
    }
  }

  render();
})();
