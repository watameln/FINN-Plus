"use strict";

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "FINN_PLUS_OPEN_SETTINGS") {
    chrome.runtime.openOptionsPage();
  }
});
