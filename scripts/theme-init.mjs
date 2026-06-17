// npm run theme:init — helper to create your PERSONAL theme (a duplicate of develop).
//
// What it does:
//   1) lists the store's themes (shopify theme list);
//   2) duplicates the develop theme under your own name
//      (shopify theme duplicate, if your CLI supports it; otherwise it shows
//       how to duplicate via Shopify Admin, without `shopify theme push`);
//   3) lists themes again and tells you which ID to put into .env.
import { spawnSync } from "node:child_process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { requireEnv, probeShopify } from "./_shopify.mjs";

const SHELL = true;
const store = requireEnv("SHOPIFY_STORE");

function shopifySync(args) {
  return spawnSync("shopify", args, { stdio: "inherit", shell: SHELL });
}

function hr(title) {
  console.log(`\n${"─".repeat(64)}\n${title}\n${"─".repeat(64)}`);
}

const rl = readline.createInterface({ input, output });

try {
  // ── Step 1: list themes ────────────────────────────────────────────
  hr("Шаг 1/3 · Темы магазина");
  shopifySync(["theme", "list", "--store", store]);

  // ── Step 2: duplicate the develop theme ────────────────────────────
  hr("Шаг 2/3 · Создание персональной темы (дубликат develop)");

  // Check whether the installed CLI supports `theme duplicate`.
  const canDuplicate =
    probeShopify(["theme", "duplicate", "--help"]).status === 0;

  const defaultName = `dev/${process.env.USER || process.env.USERNAME || "me"}`;

  if (canDuplicate) {
    const source =
      (await rl.question(
        "ID или имя develop-темы для дублирования [develop]: "
      )).trim() || "develop";
    const name =
      (await rl.question(`Имя новой персональной темы [${defaultName}]: `)).trim() ||
      defaultName;

    console.log(`\n▶ shopify theme duplicate (источник: ${source})\n`);
    const res = shopifySync([
      "theme",
      "duplicate",
      "--store",
      store,
      "--theme",
      source,
      "--name",
      name,
    ]);
    if (res.status !== 0) {
      console.error("\n✖ Дублирование не удалось. Создайте тему через Admin (см. ниже).");
    }
  } else {
    console.log(
      "\nВаш Shopify CLI не поддерживает `theme duplicate`.\n" +
        "Продублируйте develop-тему вручную (без push) через Shopify Admin:\n\n" +
        `  https://${store}/admin/themes\n\n` +
        "  → найдите тему «develop» → меню «…» → «Duplicate».\n" +
        "  → переименуйте копию, например в: " +
        `${defaultName}\n`
    );
    await rl.question("Нажмите Enter, когда дубликат создан… ");
  }

  // ── Step 3: where to get the ID ────────────────────────────────────
  hr("Шаг 3/3 · Обновлённый список тем");
  shopifySync(["theme", "list", "--store", store]);

  console.log(
    "\n✔ Готово. Скопируйте ID вашей новой темы из колонки выше и впишите в .env:\n\n" +
      "    SHOPIFY_THEME_ID=<ваш_id>\n\n" +
      "Затем запустите:  npm run dev\n"
  );
} finally {
  rl.close();
}
