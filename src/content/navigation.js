(function initialiseNavigation(global) {
  "use strict";

  const ITEM_ID = "finn-plus-settings-item";
  let waitingForDom = false;
  let navigationObserver;
  let previousActiveState = [];
  let settingsActive = false;
  let discoveryTimer;

  function findNavigation() {
    const topbarNavigation = document.querySelector("finn-topbar")?.shadowRoot?.querySelector(
      "nav[aria-label='Topp']"
    );
    return topbarNavigation || null;
  }

  function inject() {
    const navigation = findNavigation();
    if (!navigation) return false;
    if (navigation.querySelector(`#${ITEM_ID}`)) {
      document.dispatchEvent(new CustomEvent("finn-plus:topbar-ready"));
      return true;
    }

    const profileLink = navigation.querySelector("[data-automation-id='profile-link']");
    const button = document.createElement("button");
    button.id = ITEM_ID;
    button.className = profileLink?.className || "finn-plus-navigation-item";
    button.type = "button";
    button.setAttribute("aria-label", "Open FINN+ settings");
    button.setAttribute("title", "FINN+ settings");
    button.setAttribute("data-automation-id", "finn-plus-settings-link");
    button.style.background = "inherit";
    button.style.cursor = "pointer";
    button.style.font = "inherit";
    button.style.gap = "6px";
    button.style.whiteSpace = "nowrap";

    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("width", "24");
    icon.setAttribute("height", "24");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("fill", "none");
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v10M7 12h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>';
    const label = document.createElement("span");
    label.textContent = "FINN+";
    button.append(icon, label);
    button.addEventListener("click", () => global.FinnPlus.settingsPanel.open());

    if (profileLink) profileLink.before(button);
    else navigation.append(button);

    navigationObserver?.disconnect();
    navigationObserver = new MutationObserver(() => inject());
    navigationObserver.observe(navigation.getRootNode(), { childList: true, subtree: true });
    document.dispatchEvent(new CustomEvent("finn-plus:topbar-ready"));
    if (settingsActive) setSettingsActive(true);
    return true;
  }

  function startDiscovery() {
    if (inject() || waitingForDom || discoveryTimer) return;
    if (document.readyState === "loading") {
      waitingForDom = true;
      document.addEventListener("DOMContentLoaded", handleDomReady, { once: true });
    } else {
      retryDiscovery();
    }
  }

  function handleDomReady() {
    waitingForDom = false;
    if (!inject()) retryDiscovery();
  }

  function retryDiscovery() {
    clearInterval(discoveryTimer);
    let attempts = 0;
    discoveryTimer = setInterval(() => {
      attempts += 1;
      if (inject() || attempts >= 25) {
        clearInterval(discoveryTimer);
        discoveryTimer = undefined;
      }
    }, 200);
  }

  function remove() {
    setSettingsActive(false);
    document.removeEventListener("DOMContentLoaded", handleDomReady);
    waitingForDom = false;
    clearInterval(discoveryTimer);
    discoveryTimer = undefined;
    navigationObserver?.disconnect();
    navigationObserver = undefined;
    findNavigation()?.querySelector(`#${ITEM_ID}`)?.remove();
  }

  function setSettingsActive(active) {
    settingsActive = active;
    const navigation = findNavigation();
    const settingsButton = navigation?.querySelector(`#${ITEM_ID}`);
    if (!navigation || !settingsButton) return;

    if (active) {
      if (settingsButton.getAttribute("aria-current") === "page") return;
      previousActiveState = [...navigation.querySelectorAll("[aria-current]")]
        .filter((item) => item !== settingsButton && item.getAttribute("aria-current") !== "false")
        .map((item) => ({
          item,
          ariaCurrent: item.getAttribute("aria-current"),
          style: item.getAttribute("style"),
          icons: [...item.querySelectorAll("svg, [class*='icon']")].map((icon) => ({
            icon,
            style: icon.getAttribute("style")
          }))
        }));

      for (const state of previousActiveState) {
        state.item.setAttribute("aria-current", "false");
        state.item.style.setProperty("border-bottom-color", "transparent", "important");
        for (const iconState of state.icons) {
          iconState.icon.style.setProperty(
            "color",
            "var(--w-s-color-icon-secondary, #d0d1d6)",
            "important"
          );
        }
      }
      settingsButton.setAttribute("aria-current", "page");
      settingsButton.style.setProperty(
        "border-bottom-color",
        "var(--w-color-navbar-border-selected, #0063fb)",
        "important"
      );
      settingsButton.querySelector("svg")?.style.setProperty("color", "#0063fb", "important");
    } else {
      settingsButton.setAttribute("aria-current", "false");
      settingsButton.style.removeProperty("border-bottom-color");
      settingsButton.querySelector("svg")?.style.removeProperty("color");
      for (const state of previousActiveState) {
        state.item.setAttribute("aria-current", state.ariaCurrent);
        if (state.style === null) state.item.removeAttribute("style");
        else state.item.setAttribute("style", state.style);
        for (const iconState of state.icons) {
          if (iconState.style === null) iconState.icon.removeAttribute("style");
          else iconState.icon.setAttribute("style", iconState.style);
        }
      }
      previousActiveState = [];
    }
  }

  global.FinnPlus.navigation = { startDiscovery, remove, setSettingsActive };
})(globalThis);
