(async function initialiseSettingsPage() {
  "use strict";

  const form = document.getElementById("settings-form");
  const status = document.getElementById("save-status");
  const systemTheme = matchMedia("(prefers-color-scheme: dark)");
  let statusTimer;

  function render(settings) {
    const useDarkTheme = settings.darkMode && (
      !settings.darkModeFollowSystem || systemTheme.matches
    );
    document.documentElement.dataset.theme = useDarkTheme ? "dark" : "light";

    for (const [key, value] of Object.entries(settings)) {
      const input = form.elements.namedItem(key);
      if (input instanceof HTMLInputElement) input.checked = value;
    }

    for (const row of form.querySelectorAll("[data-requires]")) {
      const dependency = form.elements.namedItem(row.dataset.requires);
      const input = row.querySelector("input");
      const disabled = !dependency?.checked;
      row.classList.toggle("is-disabled", disabled);
      if (input) input.disabled = disabled;
    }
  }

  function showStatus(message) {
    clearTimeout(statusTimer);
    status.textContent = message;
    status.classList.add("is-visible");
    statusTimer = setTimeout(() => status.classList.remove("is-visible"), 1800);
  }

  form.addEventListener("change", async (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== "checkbox") return;

    try {
      const settings = await globalThis.FinnPlus.settings.set({ [input.name]: input.checked });
      render(settings);
      showStatus("Saved");
    } catch (error) {
      console.error("FINN+ could not save settings", error);
      showStatus("Could not save setting");
    }
  });

  try {
    render(await globalThis.FinnPlus.settings.get());
    globalThis.FinnPlus.settings.subscribe(render);
    systemTheme.addEventListener("change", async () => {
      render(await globalThis.FinnPlus.settings.get());
    });
  } catch (error) {
    console.error("FINN+ could not load settings", error);
    showStatus("Could not load settings");
  }
})();
