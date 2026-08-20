(function initialiseSettingsPanel(global) {
  "use strict";

  const HOST_ID = "finn-plus-settings-panel";
  const OPEN_SETTINGS_HASH = "#finn-plus-settings";
  let host;
  let shadowRoot;

  function create() {
    if (host) return;

    host = document.createElement("div");
    host.id = HOST_ID;
    host.hidden = true;
    shadowRoot = host.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = `
      <style>
        :host { color: var(--w-s-color-text, #303038); font-family: inherit; }
        .backdrop { background: var(--w-s-color-background, #fff); inset: 50px 0 0; overflow-y: auto; position: fixed; z-index: 19; }
        main { margin: 0 auto; max-width: 1010px; padding: 48px 24px 80px; }
        .heading { align-items: flex-start; border-bottom: 1px solid var(--w-s-color-border, #c7c7cc); display: flex; gap: 24px; justify-content: space-between; margin-bottom: 36px; padding-bottom: 28px; }
        h1, h2, p { margin-top: 0; } h1 { font-size: 38px; line-height: 46px; margin-bottom: 8px; } h2 { font-size: 22px; line-height: 28px; margin-bottom: 8px; }
        p, small { color: var(--w-s-color-text-subtle, #606168); line-height: 1.45; } .heading > div > p:last-child { line-height: 24px; margin-bottom: 0; }
        .close { background: transparent; border: 1px solid var(--w-s-color-border, #c7c7cc); border-radius: 4px; color: inherit; cursor: pointer; font: inherit; padding: 10px 16px; }
        .close:hover { background: var(--w-s-color-background-hover, #eee); }
        form { display: grid; gap: 38px; }
        section { display: grid; gap: 44px; grid-template-columns: minmax(200px, .75fr) minmax(360px, 1.25fr); }
        .eyebrow { color: var(--w-s-color-text-link, #0063fb); display: block; font-size: 12px; font-weight: 700; letter-spacing: .08em; line-height: 16px; margin-bottom: 7px; text-transform: uppercase; }
        .copy > p:last-child { font-size: 14px; margin-bottom: 0; }
        .controls { border: 1px solid var(--w-s-color-border, #c7c7cc); border-radius: 8px; overflow: hidden; }
        label { align-items: center; border-bottom: 1px solid var(--w-s-color-border, #ddd); cursor: pointer; display: flex; gap: 20px; justify-content: space-between; min-height: 74px; padding: 14px 18px; }
        label:last-child { border-bottom: 0; } label > span { display: grid; gap: 3px; } label.nested { padding-left: 34px; } label.disabled { opacity: .45; }
        input { appearance: none; background: #a4a5ab; border: 0; border-radius: 999px; cursor: pointer; flex: 0 0 auto; height: 28px; margin: 0; padding: 3px; width: 48px; }
        input::after { background: #fff; border-radius: 50%; box-shadow: 0 1px 3px #0005; content: ""; display: block; height: 22px; transition: transform 150ms ease; width: 22px; }
        input:checked { background: #0063fb; } input:checked::after { transform: translateX(20px); } input:focus-visible { outline: 3px solid #65b9ff; outline-offset: 3px; }
        @media (max-width: 700px) { main { padding: 30px 18px 60px; } section { gap: 15px; grid-template-columns: 1fr; } h1 { font-size: 30px; } }
      </style>
      <div class="backdrop">
        <main aria-labelledby="finn-plus-panel-title">
          <div class="heading">
            <div><p class="eyebrow">FINN+</p><h1 id="finn-plus-panel-title">Innstillinger</h1><p>Velg hvilke funksjoner du vil bruke på FINN.</p></div>
            <button class="close" type="button" aria-label="Lukk FINN+ innstillinger">Lukk</button>
          </div>
          <form>
            <section><div class="copy"><p class="eyebrow">Utseende</p><h2>Mørk modus</h2><p>Gjør FINN mer behagelig å bruke når det er mørkt.</p></div><div class="controls">
              <label><span><strong>Slå på mørk modus</strong><small>Bruk et mørkt tema på FINN.</small></span><input type="checkbox" name="darkMode" role="switch"></label>
              <label class="nested" data-requires="darkMode"><span><strong>Følg systeminnstillingene</strong><small>Bruk samme tema som enheten din.</small></span><input type="checkbox" name="darkModeFollowSystem" role="switch"></label>
            </div></section>
            <section><div class="copy"><p class="eyebrow">Opprydding</p><h2>Fjern KI</h2><p>Skjul KI-funksjoner du ikke ønsker å se.</p></div><div class="controls">
              <label><span><strong>Skjul KI-innhold</strong><small>Skjul KI-forslag, anbefalinger og kampanjer.</small></span><input type="checkbox" name="removeAi" role="switch"></label>
              <label><span><strong>Skjul reklame</strong><small>Skjul betalte plasseringer i søkeresultatene.</small></span><input type="checkbox" name="hideAds" role="switch"></label>
            </div></section>
            <section><div class="copy"><p class="eyebrow">Tilgang</p><h2>Toppmeny</h2><p>Legg FINN+ ved siden av de andre valgene i toppmenyen.</p></div><div class="controls">
              <label><span><strong>Vis FINN+ i toppmenyen</strong><small>Åpne innstillingene direkte fra toppmenyen.</small></span><input type="checkbox" name="showNavigationItem" role="switch"></label>
            </div></section>
          </form>
        </main>
      </div>`;

    shadowRoot.querySelector(".close").addEventListener("click", close);
    shadowRoot.querySelector("form").addEventListener("change", async (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      render(await global.FinnPlus.settings.set({ [input.name]: input.checked }));
    });
    document.body.append(host);
  }

  function render(settings) {
    if (!shadowRoot) return;
    for (const [key, value] of Object.entries(settings)) {
      const input = shadowRoot.querySelector(`input[name="${key}"]`);
      if (input) input.checked = value;
    }
    for (const row of shadowRoot.querySelectorAll("[data-requires]")) {
      const dependency = shadowRoot.querySelector(`input[name="${row.dataset.requires}"]`);
      const input = row.querySelector("input");
      input.disabled = !dependency?.checked;
      row.classList.toggle("disabled", input.disabled);
    }
  }

  async function open() {
    if (!document.body) {
      await new Promise((resolve) => {
        document.addEventListener("DOMContentLoaded", resolve, { once: true });
      });
    }

    create();
    render(await global.FinnPlus.settings.get());
    host.hidden = false;
    document.documentElement.style.overflow = "hidden";
    global.FinnPlus.navigation?.setSettingsActive(true);
    shadowRoot.querySelector(".close").focus();
  }

  function close() {
    if (!host) return;
    host.hidden = true;
    document.documentElement.style.removeProperty("overflow");
    global.FinnPlus.navigation?.setSettingsActive(false);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && host && !host.hidden) close();
  });
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "FINN_PLUS_OPEN_SETTINGS") return;

    open().then(
      () => sendResponse({ opened: true }),
      (error) => {
        console.error("FINN+ could not open settings", error);
        sendResponse({ opened: false });
      }
    );
    return true;
  });
  global.FinnPlus.settings.subscribe(render);
  global.FinnPlus.settingsPanel = { open, close };

  if (global.location.hash === OPEN_SETTINGS_HASH) {
    global.history.replaceState(
      global.history.state,
      "",
      `${global.location.pathname}${global.location.search}`
    );
    open().catch((error) => console.error("FINN+ could not open settings", error));
  }
})(globalThis);
