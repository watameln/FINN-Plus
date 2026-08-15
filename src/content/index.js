(async function startFinnPlus(global) {
  "use strict";

  const manager = new global.FinnPlus.FeatureManager();
  for (const feature of global.FinnPlus.features || []) manager.register(feature);

  async function apply(settings) {
    await manager.apply(settings);
    if (settings.showNavigationItem) global.FinnPlus.navigation.startDiscovery();
    else global.FinnPlus.navigation.remove();
  }

  try {
    await apply(await global.FinnPlus.settings.get());
    global.FinnPlus.settings.subscribe((settings) => apply(settings).catch(console.error));
  } catch (error) {
    console.error("FINN+ failed to initialise", error);
  }
})(globalThis);
