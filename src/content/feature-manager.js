(function initialiseFeatureManager(global) {
  "use strict";

  class FeatureManager {
    #features = new Map();
    #enabled = new Set();

    register(feature) {
      if (!feature?.id || !feature?.settingKey || typeof feature.enable !== "function") {
        throw new TypeError("FINN+ feature modules require id, settingKey, and enable().");
      }
      if (this.#features.has(feature.id)) {
        throw new Error(`FINN+ feature already registered: ${feature.id}`);
      }
      this.#features.set(feature.id, feature);
      return this;
    }

    async apply(settings) {
      for (const feature of this.#features.values()) {
        const shouldEnable = settings[feature.settingKey] === true;
        const isEnabled = this.#enabled.has(feature.id);

        if (shouldEnable && !isEnabled) {
          await feature.enable(settings);
          this.#enabled.add(feature.id);
        } else if (!shouldEnable && isEnabled) {
          await feature.disable?.();
          this.#enabled.delete(feature.id);
        } else if (shouldEnable && isEnabled) {
          await feature.update?.(settings);
        }
      }
    }

    async disableAll() {
      for (const id of [...this.#enabled]) {
        await this.#features.get(id)?.disable?.();
        this.#enabled.delete(id);
      }
    }
  }

  global.FinnPlus = global.FinnPlus || {};
  global.FinnPlus.FeatureManager = FeatureManager;
})(globalThis);
