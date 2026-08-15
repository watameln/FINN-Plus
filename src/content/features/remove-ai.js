(function registerRemoveAi(global) {
  "use strict";

  const AI_TEXT_MARKERS = [
    "finn flere varer ved hjelp av ai",
    "ta en titt på disse ai-genererte temaene"
  ];
  const AI_BANNER_MARKERS = new Set([
    "søk etter et tema og la ai hjelpe deg å finne ditt neste torget-kupp"
  ]);
  const removedSections = new Map();
  const observers = [];

  function normaliseText(value) {
    return value.replace(/\s+/g, " ").trim().toLocaleLowerCase("nb");
  }

  function hideAiSections(rootNode) {
    const paragraphs = [...rootNode.querySelectorAll("p")];
    if (rootNode.nodeType === Node.ELEMENT_NODE && rootNode.matches("p")) {
      paragraphs.unshift(rootNode);
    }
    for (const paragraph of paragraphs) {
      if (!AI_BANNER_MARKERS.has(normaliseText(paragraph.textContent))) continue;
      const section = paragraph.closest("section");
      const banner = section?.closest(".col-span-full") || section;
      if (!banner || removedSections.has(banner)) continue;

      const bounds = banner.getBoundingClientRect();
      if (bounds.height <= 0 || bounds.height > 600) continue;
      removedSections.set(banner, banner.hasAttribute("hidden"));
      banner.hidden = true;
      banner.setAttribute("data-finn-plus-removed-ai", "");
    }

    const headingSelector = "h1, h2, h3, h4, h5, h6";
    const headings = [...rootNode.querySelectorAll(headingSelector)];
    if (rootNode.nodeType === Node.ELEMENT_NODE && rootNode.matches(headingSelector)) {
      headings.unshift(rootNode);
    }

    for (const heading of headings) {
      if (!normaliseText(heading.textContent).startsWith("utforsk")) continue;
      const section = heading.closest("section");
      if (!section || removedSections.has(section)) continue;
      const sectionText = normaliseText(section.textContent);
      if (!AI_TEXT_MARKERS.some((marker) => sectionText.includes(marker))) continue;

      const bounds = section.getBoundingClientRect();
      const headingCount = section.querySelectorAll("h1, h2, h3, h4, h5, h6").length;
      const isCompactFeature = bounds.height > 0 && bounds.height <= 900 && headingCount <= 3;
      if (!isCompactFeature) continue;

      removedSections.set(section, section.hasAttribute("hidden"));
      section.hidden = true;
      section.setAttribute("data-finn-plus-removed-ai", "");
    }
  }

  function getContentRoots() {
    const roots = new Set(document.querySelectorAll("main, [role='main']"));
    for (const podium of document.querySelectorAll("podium-layout")) {
      const shadowMain = podium.shadowRoot?.querySelector("main, [role='main']");
      if (shadowMain) roots.add(shadowMain);
    }
    return roots;
  }

  function startObservers() {
    for (const observer of observers) observer.disconnect();
    observers.length = 0;

    for (const contentRoot of getContentRoots()) {
      hideAiSections(contentRoot);
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) hideAiSections(node);
            else if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
              hideAiSections(node.parentElement);
            }
          }
        }
      });
      observer.observe(contentRoot, { childList: true, subtree: true });
      observers.push(observer);
    }
  }

  const feature = {
    id: "remove-ai",
    settingKey: "removeAi",
    enable() {
      startObservers();
      document.addEventListener("DOMContentLoaded", startObservers);
    },
    disable() {
      document.removeEventListener("DOMContentLoaded", startObservers);
      for (const observer of observers) observer.disconnect();
      observers.length = 0;

      for (const [section, wasHidden] of removedSections) {
        section.removeAttribute("data-finn-plus-removed-ai");
        if (!wasHidden) section.hidden = false;
      }
      removedSections.clear();
    }
  };

  global.FinnPlus.features = global.FinnPlus.features || [];
  global.FinnPlus.features.push(feature);
})(globalThis);
