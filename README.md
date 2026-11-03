# Notion UI

A component registry inspired by Notion's clean design — modular, customizable, and built with modern React tooling.

## ✨ Features

- 📦 **Component Registry** — Prebuilt Notion-style UI components, ready to drop into your app
- 🎨 **Unstyled & Flexible** — Bring your own design system or extend with Tailwind
- 🧩 **Composable Primitives** — Components are built to be minimal, composable, and framework-agnostic
- ⚙️ **Type-Safe** — Written in TypeScript with first-class support for strict types
- 🧪 **Tested** — Unit and visual testing for confidence across changes

## 🎯 Showcases

- [`Notion Table`](https://notion-table-view.vercel.app/) - A Notion-style database table
- [`Notion Authn`](https://notion-authn.vercel.app/) - An auth server using `better-auth` under the hood
- [`Notion Clone`](https://notion-sass-demo.vercel.app/) - A Notion Sass starter using `better-auth` under the hood
- [`Storybook`](https://notion-ui-kit.vercel.app//) - A `Storybook` to demonstrate all Notion-style UIs

## 🚀 Installation

[Read the docs](https://notion-ui.vercel.app/)

## Development setup

Install the Node.js version in `.nvmrc` with nvm, then install the pnpm version
pinned in `package.json`:

```bash
nvm install
nvm use
npm install --global pnpm@12.4.2 --allow-scripts=pnpm
pnpm install --frozen-lockfile
```

CI uses the same Node.js and pnpm versions. After switching branches, run
`nvm use` before running pnpm commands.
