(function registerRemoveAi(global) {
  "use strict";

  let observer;

  function removeKnownTargets() {
    // Intentionally empty until FINN components have been inspected and stable,
    // semantic selectors can be documented here.
  }

  const feature = {
    id: "remove-ai",
    settingKey: "removeAi",
    enable() {
      removeKnownTargets();

      // Observe only an identified content root once selector mappings exist.
      // Do not fall back to a whole-document observer.
      observer = undefined;
    },
    disable() {
      observer?.disconnect();
      observer = undefined;
    }
  };

  global.FinnPlus.features = global.FinnPlus.features || [];
  global.FinnPlus.features.push(feature);
})(globalThis);
