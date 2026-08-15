(function registerDarkMode(global) {
  "use strict";

  const root = document.documentElement;
  const systemTheme = matchMedia("(prefers-color-scheme: dark)");
  const TOPBAR_STYLE_ID = "finn-plus-topbar-dark-style";
  const PODIUM_STYLE_ID = "finn-plus-podium-dark-style";
  const SEARCH_CONTEXT_STYLE_ID = "finn-plus-search-context-dark-style";
  let currentSettings;
  let contrastObserver;
  let topbarRetryTimer;
  let searchContextRetryTimer;
  const searchContextObservers = new Map();
  const NEUTRAL_TOKENS = [
    "--w-s-color-background", "--w-s-color-background-default",
    "--w-s-color-background-subtle", "--w-s-color-background-subtle-hover",
    "--w-s-color-background-subtle-active", "--w-s-color-background-secondary",
    "--w-s-color-background-secondary-hover", "--w-s-color-background-secondary-active",
    "--w-s-color-background-hover", "--w-s-color-background-active",
    "--w-s-color-background-disabled", "--w-s-color-background-disabled-subtle",
    "--w-s-color-background-selected", "--w-s-color-background-selected-hover",
    "--w-s-color-background-selected-active", "--w-s-color-background-primary-subtle",
    "--w-s-color-background-primary-subtle-hover", "--w-s-color-background-primary-subtle-active",
    "--w-s-color-background-info-subtle", "--w-s-color-background-info-subtle-hover",
    "--w-s-color-background-info-subtle-active",
    "--w-s-color-surface-sunken",
    "--w-s-color-surface-elevated-100", "--w-s-color-surface-elevated-100-hover",
    "--w-s-color-surface-elevated-100-active", "--w-s-color-surface-elevated-200",
    "--w-s-color-surface-elevated-200-hover", "--w-s-color-surface-elevated-200-active",
    "--w-s-color-surface-elevated-300", "--w-s-color-surface-elevated-300-hover",
    "--w-s-color-surface-elevated-300-active", "--w-s-color-border",
    "--w-s-color-border-hover", "--w-s-color-border-active", "--w-s-color-border-strong",
    "--w-s-color-border-strong-hover", "--w-s-color-border-disabled", "--w-s-color-text",
    "--w-s-color-text-subtle", "--w-s-color-text-link", "--w-s-color-text-placeholder",
    "--w-s-color-text-disabled", "--w-s-color-icon", "--w-s-color-icon-default",
    "--w-s-color-icon-secondary", "--w-s-color-icon-secondary-hover",
    "--w-s-color-icon-secondary-active", "--w-s-color-icon-subtle",
    "--w-s-color-icon-hover", "--w-s-color-icon-active", "--w-s-color-icon-disabled",
    "--w-color-pill-suggestion-background", "--w-color-pill-suggestion-background-hover",
    "--w-color-pill-suggestion-background-active"
  ];

  const LIGHT_BADGE_LABELS = new Set(["fiks ferdig", "solgt"]);

  function markKnownLightBadges(rootNode = document) {
    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = walker.nextNode())) {
      const label = textNode.nodeValue.trim().toLocaleLowerCase("nb");
      if (!LIGHT_BADGE_LABELS.has(label)) continue;
      if (textNode.parentElement?.closest("button")) continue;
      const target = textNode.parentElement?.closest(".w-badge, [class*='badge']");
      target?.setAttribute("data-finn-plus-light-badge", "");
    }
  }

  function observeKnownContrastTargets(dark) {
    contrastObserver?.disconnect();
    contrastObserver = undefined;
    if (!dark) return;

    const contentRoot = document.querySelector("main, [role='main']");
    if (!contentRoot) return;
    markKnownLightBadges(contentRoot);
    contrastObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) markKnownLightBadges(node);
          else if (node.nodeType === Node.TEXT_NODE && node.parentElement) markKnownLightBadges(node.parentElement);
        }
      }
    });
    contrastObserver.observe(contentRoot, { childList: true, subtree: true });
  }

  function updateTopbar(dark) {
    const shadowRoot = document.querySelector("finn-topbar")?.shadowRoot;
    if (!shadowRoot) return false;

    const existingStyle = shadowRoot.getElementById(TOPBAR_STYLE_ID);
    if (!dark) {
      existingStyle?.remove();
      shadowRoot.querySelector("messaging-icon")?.shadowRoot
        ?.getElementById(TOPBAR_STYLE_ID)?.remove();
      return true;
    }
    if (!existingStyle) {
      const style = document.createElement("style");
      style.id = TOPBAR_STYLE_ID;
      style.textContent = `
        :host {
          --w-s-color-text-link: #f2f2f4;
          --w-s-color-icon-secondary: #d0d1d6;
          --w-s-color-icon-secondary-hover: #ffffff;
          --w-s-color-icon-secondary-active: #ffffff;
        }
        nav[aria-label="Topp"] a:not([data-automation-id="frontpage-link"]),
        nav[aria-label="Topp"] button {
          color: #f2f2f4 !important;
        }
        nav[aria-label="Topp"] a:not([data-automation-id="frontpage-link"]) span,
        nav[aria-label="Topp"] button span {
          color: #f2f2f4 !important;
        }
      `;
      shadowRoot.append(style);
    }

    const messagingRoot = shadowRoot.querySelector("messaging-icon")?.shadowRoot;
    if (messagingRoot && !messagingRoot.getElementById(TOPBAR_STYLE_ID)) {
      const messagingStyle = document.createElement("style");
      messagingStyle.id = TOPBAR_STYLE_ID;
      messagingStyle.textContent = `
        :host { --w-s-color-icon-subtle: #d0d1d6; }
        span, w-icon-messages-24 { color: #f2f2f4 !important; }
      `;
      messagingRoot.append(messagingStyle);
    }
    return Boolean(messagingRoot?.getElementById(TOPBAR_STYLE_ID));
  }

  function retryNestedTopbar() {
    clearInterval(topbarRetryTimer);
    let attempts = 0;
    topbarRetryTimer = setInterval(() => {
      attempts += 1;
      if (!currentSettings || updateTopbar(true) || attempts >= 25) {
        clearInterval(topbarRetryTimer);
        topbarRetryTimer = undefined;
      }
    }, 200);
  }

  function updatePodiumShell(dark) {
    const computedRoot = getComputedStyle(root);
    for (const podium of document.querySelectorAll("podium-layout")) {
      for (const token of NEUTRAL_TOKENS) {
        if (dark) podium.style.setProperty(token, computedRoot.getPropertyValue(token), "important");
        else podium.style.removeProperty(token);
      }

      const podiumRoot = podium.shadowRoot;
      const existingStyle = podiumRoot?.getElementById(PODIUM_STYLE_ID);
      if (!dark) {
        existingStyle?.remove();
      } else if (podiumRoot && !existingStyle) {
        const style = document.createElement("style");
        style.id = PODIUM_STYLE_ID;
        style.textContent = `
          .badge--warning, .badge--negative,
          .w-badge:not(.w-badge--price):not(.w-badge--disabled),
          [class*="--w-color-badge-"][class~="s-text"] {
            --color: #303038;
            color: #303038 !important;
          }
          w-badge[variant="warning"] {
            --color: #303038;
            --w-s-color-text: #303038;
            color: #303038 !important;
          }
        `;
        podiumRoot.append(style);
      }
    }
  }

  function updateSearchContext(dark) {
    const computedRoot = getComputedStyle(root);
    const podlets = new Set(document.querySelectorAll("search-in-context-podlet"));
    for (const podium of document.querySelectorAll("podium-layout")) {
      for (const podlet of podium.shadowRoot?.querySelectorAll("search-in-context-podlet") || []) {
        podlets.add(podlet);
      }
    }
    let ready = podlets.size > 0;
    for (const podlet of podlets) {
      for (const token of NEUTRAL_TOKENS) {
        if (dark) podlet.style.setProperty(token, computedRoot.getPropertyValue(token), "important");
        else podlet.style.removeProperty(token);
      }

      const podletRoot = podlet.shadowRoot;
      if (!podletRoot) ready = false;
      const existingStyle = podletRoot?.getElementById(SEARCH_CONTEXT_STYLE_ID);
      if (!dark) {
        existingStyle?.remove();
      } else if (podletRoot && !existingStyle) {
        const style = document.createElement("style");
        style.id = SEARCH_CONTEXT_STYLE_ID;
        style.textContent = `
          #search-in-context-podlet {
            background-color: #202126 !important;
            color: var(--w-s-color-text) !important;
          }
          #search-in-context-podlet > div:not(.modalOverlay) {
            background-color: #202126 !important;
          }
          .podletcard, #search-in-context-podlet .modalContent {
            background-color: #27292f !important;
            border-color: var(--w-s-color-border) !important;
            color: var(--w-s-color-text) !important;
          }
          .podletcard > div {
            background-color: #27292f !important;
          }
          .podletcard *, #search-in-context-podlet .modalContent * {
            color: var(--w-s-color-text) !important;
          }
          .podletcard svg text {
            fill: var(--w-s-color-text) !important;
          }
          .podletcard svg,
          .podletcard .highcharts-container,
          .podletcard .highcharts-root {
            background-color: #27292f !important;
          }
          .podletcard .highcharts-background,
          .podletcard .highcharts-plot-background {
            fill: #27292f !important;
          }
          .podletcard .highcharts-area {
            fill: #223447 !important;
            fill-opacity: 1 !important;
          }
          #search-in-context-podlet .naviFader {
            background: linear-gradient(to right, transparent, #27292f 72%) !important;
          }
          .podletcard button,
          .podletcard .stats-tooltip {
            background-color: #343740 !important;
            color: var(--w-s-color-text) !important;
          }
        `;
        podletRoot.append(style);
      }

      if (dark && podletRoot && !searchContextObservers.has(podletRoot)) {
        const observer = new MutationObserver(() => updateSearchContext(true));
        observer.observe(podletRoot, { childList: true });
        searchContextObservers.set(podletRoot, observer);
      }
    }
    if (!dark) {
      for (const observer of searchContextObservers.values()) observer.disconnect();
      searchContextObservers.clear();
    }
    return ready;
  }

  function retrySearchContext() {
    clearInterval(searchContextRetryTimer);
    let attempts = 0;
    searchContextRetryTimer = setInterval(() => {
      attempts += 1;
      updateSearchContext(true);
      if (!currentSettings || attempts >= 25) {
        clearInterval(searchContextRetryTimer);
        searchContextRetryTimer = undefined;
      }
    }, 200);
  }

  function applyTheme() {
    if (!currentSettings) return;
    const dark = currentSettings.darkModeFollowSystem ? systemTheme.matches : true;
    root.dataset.finnPlusTheme = dark ? "dark" : "light";
    updatePodiumShell(dark);
    const searchContextReady = updateSearchContext(dark);
    if (dark && !searchContextReady) retrySearchContext();
    else {
      clearInterval(searchContextRetryTimer);
      searchContextRetryTimer = undefined;
    }
    const topbarReady = updateTopbar(dark);
    if (dark && !topbarReady) retryNestedTopbar();
    else {
      clearInterval(topbarRetryTimer);
      topbarRetryTimer = undefined;
      clearInterval(searchContextRetryTimer);
      searchContextRetryTimer = undefined;
    }
    observeKnownContrastTargets(dark);
  }

  const feature = {
    id: "dark-mode",
    settingKey: "darkMode",
    enable(settings) {
      currentSettings = settings;
      applyTheme();
      systemTheme.addEventListener("change", applyTheme);
      document.addEventListener("DOMContentLoaded", applyTheme);
      document.addEventListener("finn-plus:topbar-ready", applyTheme);
      if (global.customElements?.whenDefined) {
        global.customElements.whenDefined("finn-topbar").then(applyTheme).catch(console.error);
      }
    },
    update(settings) {
      currentSettings = settings;
      applyTheme();
    },
    disable() {
      systemTheme.removeEventListener("change", applyTheme);
      document.removeEventListener("DOMContentLoaded", applyTheme);
      document.removeEventListener("finn-plus:topbar-ready", applyTheme);
      contrastObserver?.disconnect();
      contrastObserver = undefined;
      clearInterval(topbarRetryTimer);
      topbarRetryTimer = undefined;
      updateTopbar(false);
      updatePodiumShell(false);
      updateSearchContext(false);
      currentSettings = undefined;
      delete root.dataset.finnPlusTheme;
    }
  };

  global.FinnPlus.features = global.FinnPlus.features || [];
  global.FinnPlus.features.push(feature);
})(globalThis);
