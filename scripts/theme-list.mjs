// npm run theme:list — lists the store's themes with their IDs.
import { requireEnv, runShopify } from "./_shopify.mjs";

const store = requireEnv("SHOPIFY_STORE");

runShopify(["theme", "list", "--store", store]);
