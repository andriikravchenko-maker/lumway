# Lumway — Shopify theme (local development)

Each developer works on **their own personal theme** (a duplicate of
`develop`). You start with a single command — no manual `--store` / `--theme`:
they are read from a local `.env`, which is **not committed** to Git.

File changes are synced to your theme in real time via `shopify theme dev` —
a separate `shopify theme push` is not used.

## Requirements

- [Node.js](https://nodejs.org/) 18+
- Shopify CLI: `npm i -g @shopify/cli @shopify/theme`
- Access to the store in Shopify (an invite from the admin)

## Quick start — 3 steps

```bash
# 1. Install dependencies and prepare local config
npm install
cp .env.example .env        # Windows: copy .env.example .env
#   open .env and set SHOPIFY_STORE (the .myshopify.com domain)

# 2. Create YOUR theme (a duplicate of develop) and get its ID
npm run theme:init
#   follow the prompts, then put the resulting ID into .env → SHOPIFY_THEME_ID

# 3. Start development on your theme
npm run dev
```

After `npm run dev` the CLI prints a local preview URL. Any edits to theme
files are automatically pushed to your personal theme.

## Commands

| Command              | What it does                                                       |
| -------------------- | ------------------------------------------------------------------ |
| `npm run dev`        | `shopify theme dev` on your theme (store + ID from `.env`), live-sync |
| `npm run dev:sync`   | Same as `dev` + `--theme-editor-sync`: pulls customizer changes back into local JSON |
| `npm run theme:init` | Helper: list themes → duplicate `develop` → `.env` hint            |
| `npm run theme:list` | Lists the store's themes with their IDs                            |

## Saving customizer content to Git (`dev:sync`)

Plain `npm run dev` is **one-way** (local → theme): edits you make in the
Theme Editor (customizer) live on the remote theme and are **not** written to
your local files, so they won't reach Git or the dev branch.

To keep customizer content, run:

```bash
npm run dev:sync          # or: THEME_EDITOR_SYNC=1 npm run dev
```

This adds `--theme-editor-sync`, so changes you make in the customizer are
downloaded into your local JSON files (`config/settings_data.json`,
`templates/*.json`, section/template JSON). Commit those files, open a PR, and
after merge the content stays in the dev branch.

> ⚠️ With `--theme-editor-sync` the JSON files are two-way synced. If the same
> JSON changes both locally and in the customizer, the CLI may prompt to resolve
> a conflict (keep local / keep remote). Commit often and avoid editing the same
> template in the editor and in code at the same time.

## Configuration (`.env`)

| Variable            | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `SHOPIFY_STORE`     | Store domain, e.g. `lumway.myshopify.com`            |
| `SHOPIFY_THEME_ID`  | ID of your personal theme (a duplicate of `develop`) |

Everyone has their own `.env` and it is not committed to Git (see `.gitignore`).
The template is `.env.example`.

> **Note on `theme:init`.** If your Shopify CLI supports
> `shopify theme duplicate`, the duplicate is created automatically. If not,
> the script tells you how to duplicate `develop` via the Shopify Admin
> (Online Store → Themes → "…" → Duplicate); `shopify theme push` is not needed anywhere.
