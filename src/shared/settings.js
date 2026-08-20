(function initialiseSettings(global) {
  "use strict";

  const DEFAULTS = Object.freeze({
    darkMode: true, // whole point is to have dark mode enabled by default
    darkModeFollowSystem: false, // shouldnt be enabled by default, as it would override the darkMode setting if the user has explicitly set system dark mode off
    removeAi: false,
    hideAds: false,
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
