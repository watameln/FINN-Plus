# FINN+

FINN+ is a modular Manifest V3 browser extension for optional FINN.no appearance, cleanup, and quality-of-life features.

## Load locally

1. Open `chrome://extensions` in Chrome or another Chromium browser.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this repository.
4. Open the extension's details to reach the dedicated settings page, or use the FINN+ item injected into FINN's top navigation.

## Automated builds

Every push and pull request runs the **Build Chrome extension** GitHub Actions workflow. Successful runs provide a `finn-plus-chrome-<commit>` artifact containing the packaged extension ZIP. The workflow can also be started manually from the Actions tab.

## Architecture

- `src/shared/settings.js` owns typed defaults and synchronized persistence.
- `src/content/feature-manager.js` manages independent feature lifecycles.
- `src/content/features/` contains one independently toggleable module per feature.
- `src/content/navigation.js` owns the FINN navigation integration.
- `settings/` contains the extension settings page.

Dark Mode uses FINN's inspected semantic Warp design tokens and never uses whole-page filters or changes media. Remove AI remains a lifecycle framework until individual AI components have been inspected; it deliberately has no broad MutationObserver fallback.
