"use strict";

// Schema-validator för innehållsdatan (content/kapitel-*.js).
// Kör: npm run validate  (eller: node tools/validate-content.js)
//
// Laddar varje kapitelfil i en sandlåda med SAMMA window.KAPITEL-mönster som sajten
// (ingen jsdom behövs) och kontrollerar datamodellen i CLAUDE.md:
//   - id matchar filnamnet, titel finns, steps är en icke-tom array
//   - role ∈ {child, adult}, type ∈ {text, question_single_choice, ordering}, text finns
//   - question_single_choice: options (≥2 strängar), correctAnswer = heltal i [0, options.length)
//   - ordering: options (≥2 strängar), correctAnswer = permutation av [0..options.length-1]
// Fel -> exit 1 (CI blir röd). Varningar (t.ex. "Vuxen:"-prefix) loggas men fäller inte bygget.
//
// Detta är ett DEV-verktyg; det laddas aldrig av sajten och lägger inget sajtberoende.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");

const VALID_ROLES = ["child", "adult"];
const VALID_TYPES = ["text", "image", "question_single_choice", "ordering"];

function chapterNumber(name) {
  const m = String(name).match(/\d+/);
  return m ? parseInt(m[0], 10) : NaN;
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

// true om arr är en permutation av [0..n-1] (varje index exakt en gång).
function isPermutation(arr, n) {
  if (!Array.isArray(arr) || arr.length !== n) return false;
  const seen = new Array(n).fill(false);
  for (const x of arr) {
    if (!Number.isInteger(x) || x < 0 || x >= n || seen[x]) return false;
    seen[x] = true;
  }
  return true;
}

// Ladda alla kapitelfiler i EN delad sandlåda – exakt som index.html ackumulerar window.KAPITEL.
function loadChapters() {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => /^kapitel-\d+\.js$/.test(f))
    .sort((a, b) => chapterNumber(a) - chapterNumber(b));
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  files.forEach((f) => {
    const src = fs.readFileSync(path.join(CONTENT_DIR, f), "utf8");
    vm.runInContext(src, sandbox, { filename: f });
  });
  return { files, kapitel: sandbox.window.KAPITEL || {} };
}

function validateStep(step, at, errors, warnings) {
  if (!VALID_ROLES.includes(step.role)) {
    errors.push(at + ': ogiltig role "' + step.role + '" (ska vara child|adult).');
  }
  if (!VALID_TYPES.includes(step.type)) {
    errors.push(at + ': ogiltig type "' + step.type + '" (text|question_single_choice|ordering).');
    return;
  }
  if (!isNonEmptyString(step.text)) {
    errors.push(at + ': "text" saknas eller är tom.');
  }
  if (step.role === "adult" && /^\s*vuxen\s*:/i.test(step.text || "")) {
    warnings.push(at + ': adult-steg ska INTE inleda texten med "Vuxen:" (renderaren sätter etiketten).');
  }

  if (step.type === "text" || step.type === "image") {
    if (step.type === "image") {
      if (!isNonEmptyString(step.src)) {
        errors.push(at + ': "image" kräver en "src" (lokal sökväg till bild).');
      } else if (/^(https?:)?\/\//i.test(step.src)) {
        errors.push(at + ': "src" måste vara en lokal sökväg (ingen http(s)/CDN).');
      }
      if (typeof step.alt !== "string") {
        errors.push(at + ': "image" kräver "alt" (text-alternativ; "" om bilden är rent dekorativ).');
      } else if (step.alt.trim() === "") {
        warnings.push(at + ': tom "alt" – använd bara om bilden är rent dekorativ.');
      }
    }
    if ("options" in step) warnings.push(at + ": " + step.type + '-steg bör inte ha "options".');
    if ("correctAnswer" in step) warnings.push(at + ": " + step.type + '-steg bör inte ha "correctAnswer".');
    return;
  }

  // question_single_choice + ordering kräver options.
  if (!Array.isArray(step.options) || step.options.length < 2) {
    errors.push(at + ': "' + step.type + '" kräver minst 2 "options".');
    return;
  }
  step.options.forEach((opt, j) => {
    if (!isNonEmptyString(opt)) errors.push(at + ": option " + (j + 1) + " är tom eller inte en sträng.");
  });

  const n = step.options.length;
  if (step.type === "question_single_choice") {
    if (!Number.isInteger(step.correctAnswer) || step.correctAnswer < 0 || step.correctAnswer >= n) {
      errors.push(at + ": correctAnswer (" + JSON.stringify(step.correctAnswer) + ") måste vara ett heltal 0.." + (n - 1) + ".");
    }
  } else if (step.type === "ordering") {
    if (!isPermutation(step.correctAnswer, n)) {
      errors.push(at + ": correctAnswer (" + JSON.stringify(step.correctAnswer) + ") måste vara en permutation av [0.." + (n - 1) + "].");
    }
  }
}

function validate() {
  const errors = [];
  const warnings = [];
  const { files, kapitel } = loadChapters();

  files.forEach((file) => {
    const expectedId = file.replace(/\.js$/, "");
    const ch = kapitel[expectedId];
    if (!ch) {
      errors.push(file + ': hittade inget window.KAPITEL["' + expectedId + '"] (id måste matcha filnamnet).');
      return;
    }
    if (ch.id !== expectedId) {
      errors.push(file + ': id "' + ch.id + '" matchar inte filnamnet ("' + expectedId + '").');
    }
    if (!isNonEmptyString(ch.titel)) {
      errors.push(file + ': "titel" saknas eller är tom.');
    }
    if (!Array.isArray(ch.steps) || ch.steps.length === 0) {
      errors.push(file + ': "steps" saknas eller är en tom array.');
      return;
    }
    ch.steps.forEach((step, i) => validateStep(step, file + " steg " + (i + 1), errors, warnings));
  });

  return { files, errors, warnings };
}

function main() {
  let result;
  try {
    result = validate();
  } catch (e) {
    console.error("Innehållsvalidering KRASCHADE vid inläsning:");
    console.error(e && e.stack ? e.stack : String(e));
    process.exit(1);
  }
  const { files, errors, warnings } = result;
  warnings.forEach((w) => console.warn("VARNING: " + w));
  if (errors.length) {
    console.error("\nInnehållsvalidering MISSLYCKADES (" + errors.length + " fel i " + files.length + " kapitelfiler):");
    errors.forEach((e) => console.error("  ✗ " + e));
    process.exit(1);
  }
  console.log(
    "Innehållsvalidering OK: " + files.length + " kapitelfiler, schema giltigt" +
    (warnings.length ? " (" + warnings.length + " varning(ar))" : "") + "."
  );
}

main();
