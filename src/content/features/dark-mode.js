(function registerDarkMode(global) {
  "use strict";

  const root = document.documentElement;
  const systemTheme = matchMedia("(prefers-color-scheme: dark)");
  let currentSettings;

  function applyTheme() {
    if (!currentSettings) return;
    const dark = currentSettings.darkModeFollowSystem ? systemTheme.matches : true;
    root.dataset.finnPlusTheme = dark ? "dark" : "light";
  }

  const feature = {
    id: "dark-mode",
    settingKey: "darkMode",
    enable(settings) {
      currentSettings = settings;
      applyTheme();
      systemTheme.addEventListener("change", applyTheme);
    },
    update(settings) {
      currentSettings = settings;
      applyTheme();
    },
    disable() {
      systemTheme.removeEventListener("change", applyTheme);
      currentSettings = undefined;
      delete root.dataset.finnPlusTheme;
    }
  };

  global.FinnPlus.features = global.FinnPlus.features || [];
  global.FinnPlus.features.push(feature);
})(globalThis);
