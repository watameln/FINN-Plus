"use strict";

const extensionApi = globalThis.browser ?? globalThis.chrome;
const SETTINGS_URL = "https://www.finn.no/#finn-plus-settings";

extensionApi.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    try {
      const response = await extensionApi.tabs.sendMessage(tab.id, {
        type: "FINN_PLUS_OPEN_SETTINGS"
      });
      if (response?.opened) return;
    } catch {
      // The in-page panel is only available on FINN pages with the content script loaded.
    }
  }

  await extensionApi.tabs.create({ url: SETTINGS_URL });
});
