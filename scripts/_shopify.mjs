// Shared helper: run the Shopify CLI cross-platform (Windows/macOS/Linux).
// Args are passed as an array, so we don't rely on $VAR expansion in the shell.
import { spawn, spawnSync } from "node:child_process";

// shell:true is needed so that shopify.cmd is found on Windows.
const SHELL = true;

export function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    console.error(
      `\n✖ Не задана переменная ${name}.\n` +
        `  Скопируйте .env.example в .env и заполните значения.\n` +
        `  См. README.md → «Быстрый старт».\n`
    );
    process.exit(1);
  }
  return value.trim();
}

// Interactive run: stdio is inherited, the exit code is propagated.
export function runShopify(args) {
  const child = spawn("shopify", args, { stdio: "inherit", shell: SHELL });
  child.on("exit", (code) => process.exit(code ?? 0));
  child.on("error", (err) => {
    console.error("✖ Не удалось запустить Shopify CLI:", err.message);
    console.error("  Установите его: npm i -g @shopify/cli @shopify/theme");
    process.exit(1);
  });
}

// Silent run, returns { status }. Used to probe CLI feature support.
export function probeShopify(args) {
  return spawnSync("shopify", args, { stdio: "ignore", shell: SHELL });
}
