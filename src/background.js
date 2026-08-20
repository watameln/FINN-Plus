"use strict";

const SETTINGS_URL = "https://www.finn.no/#finn-plus-settings";

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "FINN_PLUS_OPEN_SETTINGS"
      });
      if (response?.opened) return;
    } catch {
      // The in-page panel is only available on FINN pages with the content script loaded.
    }
  }

  await chrome.tabs.create({ url: SETTINGS_URL });
});
