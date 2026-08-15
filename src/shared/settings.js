(function initialiseSettings(global) {
  "use strict";

  const DEFAULTS = Object.freeze({
    darkMode: false,
    darkModeFollowSystem: true,
    removeAi: false,
    showNavigationItem: true
  });

  const keys = Object.keys(DEFAULTS);

  function normalise(values) {
    const settings = { ...DEFAULTS };

    for (const key of keys) {
      if (typeof values?.[key] === typeof DEFAULTS[key]) {
        settings[key] = values[key];
      }
    }

    return settings;
  }

  async function get() {
    return normalise(await chrome.storage.sync.get(DEFAULTS));
  }

  async function set(changes) {
    const knownChanges = {};

    for (const [key, value] of Object.entries(changes)) {
      if (key in DEFAULTS && typeof value === typeof DEFAULTS[key]) {
        knownChanges[key] = value;
      }
    }

    await chrome.storage.sync.set(knownChanges);
    return get();
  }

  function subscribe(listener) {
    const handleChange = (changes, areaName) => {
      if (areaName !== "sync" || !keys.some((key) => key in changes)) return;
      get().then(listener).catch(console.error);
    };

    chrome.storage.onChanged.addListener(handleChange);
    return () => chrome.storage.onChanged.removeListener(handleChange);
  }

  global.FinnPlus = global.FinnPlus || {};
  global.FinnPlus.settings = { DEFAULTS, get, set, subscribe };
})(globalThis);
