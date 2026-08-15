(function registerHideAds(global) {
  "use strict";

  const SPONSORED_AD_SELECTOR = "article.sponsored-product-ad";
  const SEARCH_AD_SELECTOR = "article.sf-search-ad";
  const DISPLAY_AD_SELECTOR = "advt-component";
  const PAID_PLACEMENT_LABELS = new Set(["betalt plassering", "ukens bolig"]);
  const hiddenAds = new Map();
  const observers = [];

  function hideAd(ad) {
    if (hiddenAds.has(ad)) return;
    hiddenAds.set(ad, ad.hasAttribute("hidden"));
    ad.hidden = true;
    ad.setAttribute("data-finn-plus-hidden-ad", "");
  }

  function isPaidPlacement(ad) {
    return [...ad.querySelectorAll(
      ".badge--info, [class*='--w-color-badge-info-background']"
    )].some(
      (badge) => PAID_PLACEMENT_LABELS.has(
        badge.textContent.replace(/\s+/g, " ").trim().toLocaleLowerCase("nb")
      )
    );
  }

  function hideAdsIn(rootNode) {
    const candidates = new Set();
    if (rootNode.nodeType === Node.ELEMENT_NODE) {
      const containingAd = rootNode.closest(
        `${SPONSORED_AD_SELECTOR}, ${SEARCH_AD_SELECTOR}, ${DISPLAY_AD_SELECTOR}`
      );
      if (containingAd) candidates.add(containingAd);
    }
    for (const ad of rootNode.querySelectorAll(
      `${SPONSORED_AD_SELECTOR}, ${SEARCH_AD_SELECTOR}, ${DISPLAY_AD_SELECTOR}`
    )) {
      candidates.add(ad);
    }

    for (const ad of candidates) {
      if (ad.matches(`${SPONSORED_AD_SELECTOR}, ${DISPLAY_AD_SELECTOR}`) || isPaidPlacement(ad)) {
        hideAd(ad);
      }
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
      hideAdsIn(contentRoot);
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) hideAdsIn(node);
          }
        }
      });
      observer.observe(contentRoot, { childList: true, subtree: true });
      observers.push(observer);
    }
  }

  const feature = {
    id: "hide-ads",
    settingKey: "hideAds",
    enable() {
      startObservers();
      document.addEventListener("DOMContentLoaded", startObservers);
    },
    disable() {
      document.removeEventListener("DOMContentLoaded", startObservers);
      for (const observer of observers) observer.disconnect();
      observers.length = 0;
      for (const [ad, wasHidden] of hiddenAds) {
        ad.removeAttribute("data-finn-plus-hidden-ad");
        if (!wasHidden) ad.hidden = false;
      }
      hiddenAds.clear();
    }
  };

  global.FinnPlus.features = global.FinnPlus.features || [];
  global.FinnPlus.features.push(feature);
})(globalThis);
