# Notion UI documentation

This app uses React Router framework mode, Vite, Fumadocs MDX, and Fumadocs Story. The default Fumadocs layout provides three public sidebar tabs:

| Tab         | Route          | Source                           |
| ----------- | -------------- | -------------------------------- |
| Docs        | `/docs`        | `content/docs`                   |
| Registry    | `/registry`    | `packages/registry/src/index.ts` |
| Development | `/development` | `src/stories/development`        |

The original landing page remains at `/`, with its own Notion Kit styles. Documentation pages use Fumadocs defaults.

## Run the app

From the workspace root, build the workspace dependencies once, then start the docs app:

```sh
pnpm exec turbo run build --filter=@notion-kit/docs^...
pnpm --filter @notion-kit/docs dev
```

The app runs at `http://localhost:3000`. Build and serve the production app with:

```sh
pnpm --filter @notion-kit/docs build
pnpm --filter @notion-kit/docs start
```

Vercel uses the React Router preset. Existing `/registry/*.json` installation URLs remain available as static files.

## Add examples

Registry examples belong in `packages/registry`. Add the example to `registryIndex`, then run `pnpm --filter @notion-kit/docs build:stories`. The generator creates grouped MDX pages and Story definitions. These generated files are ignored by Git and regenerated before development, builds, and type checks.

Additional scenarios belong in `src/stories/development`. Export `defineStory(...)` calls from a `.story.tsx` file. Keep the component in an `.examples.tsx` file and load it lazily through `.lazy.tsx`, so a documentation page loads the Story controls without loading the preview component. The generator discovers these exports and creates Development pages.

Story frames use `/story/*` and load components in the browser. Each frame has Notion Kit styles, i18n, and toast providers. Document pages use the default Fumadocs styles. This keeps portals, full-page layouts, and CSS variables inside their examples.

Use an existing registry example when it already covers the scenario. `story-migration.json` records the destination of every former Storybook scenario. The generator checks that those destinations still exist. Storybook `play` tests were removed as part of the migration.

Stripe dialogs accept an optional `VITE_STRIPE_PUBLISHABLE_KEY` in an ignored `.env.local` file. Use a Stripe test publishable key. Without a key, the dialogs render without initializing Stripe.

## Write documentation

Use Fumadocs MDX components without style overrides. Import a registry Story and render `<story.WithControl />` for examples. Use Markdown code fences for code samples and the shared `Installation` component for installation instructions:

```mdx
<Installation packages="@notion-kit/ui" registryName="button-default" />
```

`Installation` uses Fumadocs tabs and code blocks to generate the package and registry commands. It is available in every documentation page through the shared MDX component map.

The built-in `TypeTable` supports required props:

```mdx
<TypeTable
  type={{
    icon: { type: "IconData", required: true, description: "The icon data." },
    fallback: { type: "string", description: "Fallback text." },
  }}
/>
```

See `content/docs/blocks/icon-block.mdx` for a complete example. Existing Markdown API tables continue to use Fumadocs defaults.

## Verify changes

```sh
pnpm --filter @notion-kit/docs typecheck
pnpm --filter @notion-kit/docs lint
pnpm --filter @notion-kit/docs format --write
pnpm --filter @notion-kit/docs build
```

Open all three tabs, exercise Story controls and frames, check search, and verify a registry JSON installation URL before shipping a migration.
