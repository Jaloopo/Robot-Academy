(function (root) {
  "use strict";

  var app = root.EdisonApp = root.EdisonApp || {};
  var registry = app.stepTypes = app.stepTypes || Object.create(null);
  var REQUIRED_METHODS = [
    "createState",
    "restore",
    "serialize",
    "hasProgress",
    "isDone",
    "render",
    "bind"
  ];

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function registerStepType(type, plugin) {
    if (typeof type !== "string" || type.trim() === "") {
      throw new Error("Stegtyp måste ha ett icke-tomt namn.");
    }
    if (!plugin || typeof plugin !== "object") {
      throw new Error("Plugin för " + type + " saknas eller är ogiltigt.");
    }
    for (var i = 0; i < REQUIRED_METHODS.length; i++) {
      var method = REQUIRED_METHODS[i];
      if (typeof plugin[method] !== "function") {
        throw new Error("Plugin för " + type + " saknar obligatorisk metod: " + method + ".");
      }
    }
    if (hasOwn(registry, type)) {
      throw new Error("Stegtypen " + type + " är redan registrerad.");
    }
    registry[type] = plugin;
    return plugin;
  }

  function getStepType(type) {
    return hasOwn(registry, type) ? registry[type] : null;
  }

  app.registerStepType = registerStepType;
  app.getStepType = getStepType;
  app.requiredStepTypeMethods = REQUIRED_METHODS.slice();
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
