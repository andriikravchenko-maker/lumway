// npm run dev — starts the local dev server against YOUR personal theme.
// Values come from .env (via dotenv-cli). No manual --store / --theme.
// `shopify theme dev` syncs changes to the theme in real time —
// a separate `shopify theme push` is not needed.
//
// Pass --sync (npm run dev:sync) or set THEME_EDITOR_SYNC=1 to also pull
// Theme Editor (customizer) changes back into local JSON files, so customizer
// content ends up in Git and survives a PR into the dev branch.
import { requireEnv, runShopify } from "./_shopify.mjs";

const store = requireEnv("SHOPIFY_STORE");
const themeId = requireEnv("SHOPIFY_THEME_ID");

const editorSync =
  process.argv.includes("--sync") || process.env.THEME_EDITOR_SYNC === "1";

const args = ["theme", "dev", "--store", store, "--theme", themeId];
if (editorSync) args.push("--theme-editor-sync");

console.log(
  `▶ shopify theme dev → store=${store} theme=${themeId}` +
    (editorSync ? " (theme-editor-sync ON)" : "") +
    "\n"
);

runShopify(args);
