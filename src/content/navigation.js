(function initialiseNavigation(global) {
  "use strict";

  const ITEM_ID = "finn-plus-settings-item";
  let waitingForDom = false;

  function findNavigation() {
    const header = document.querySelector("header");
    if (!header) return null;
    return header.querySelector("nav, [role='navigation']");
  }

  function inject() {
    if (document.getElementById(ITEM_ID)) return true;

    const navigation = findNavigation();
    if (!navigation) return false;

    const button = document.createElement("button");
    button.id = ITEM_ID;
    button.className = "finn-plus-navigation-item";
    button.type = "button";
    button.textContent = "FINN+";
    button.setAttribute("aria-label", "Open FINN+ settings");
    button.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "FINN_PLUS_OPEN_SETTINGS" });
    });
    navigation.append(button);
    return true;
  }

  function startDiscovery() {
    if (inject() || waitingForDom || document.readyState !== "loading") return;
    waitingForDom = true;
    document.addEventListener("DOMContentLoaded", handleDomReady, { once: true });
  }

  function handleDomReady() {
    waitingForDom = false;
    inject();
  }

  function remove() {
    document.removeEventListener("DOMContentLoaded", handleDomReady);
    waitingForDom = false;
    document.getElementById(ITEM_ID)?.remove();
  }

  global.FinnPlus.navigation = { startDiscovery, remove };
})(globalThis);
