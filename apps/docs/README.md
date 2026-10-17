# Notion UI docs

React Router and Fumadocs serve the docs at `http://localhost:3000`.

| Route          | Content source                   |
| -------------- | -------------------------------- |
| `/docs`        | `content/docs`                   |
| `/registry`    | `packages/registry/src/index.ts` |
| `/development` | `src/stories/development`        |

## Run locally

Build the workspace dependencies, then start the app:

```sh
pnpm exec turbo run build --filter=@notion-kit/docs^...
pnpm --filter @notion-kit/docs dev
```

To build and serve production output:

```sh
pnpm --filter @notion-kit/docs build
pnpm --filter @notion-kit/docs start
```

## Add a registry example

Add the example to `packages/registry` and its name to `registryIndex`.
The docs generator creates the registry page and lazy import.
Use the example in MDX with:

```mdx
<RegistryStory name="button-default" />
```

Examples render in `/story/*` frames with Notion Kit styles, i18n, and toast support. Frames fit the page width without scaling the component.

## Add a development story

1. Put the example in `src/stories/development/<path>.examples.tsx`.
2. Add its lazy import to `src/stories/development.lazy.tsx`.
3. Export a `defineStory(...)` call from `<path>.story.tsx`. See `src/stories/development/ui/input.story.tsx` for an example with controls.

The generator reads the story exports and creates the development page. Run `pnpm --filter @notion-kit/docs build:stories` after adding or removing stories. Development startup, builds, and type checks run it automatically. Generated files are ignored by Git; unchanged files are kept in place.

For Stripe dialog examples, set `VITE_STRIPE_PUBLISHABLE_KEY` to a test publishable key in `.env.local`. Without a key, the dialogs skip Stripe initialization.

## Write docs

Use `Installation` for package and registry commands:

```mdx
<Installation packages="@notion-kit/ui" registryName="button-default" />
```

Use `TypeTable` for API references:

```mdx
<TypeTable
  type={{
    icon: {
      type: "IconData",
      required: true,
      description: "The icon to display.",
    },
    fallback: {
      type: "string",
      description: "Text shown if the image fails to load.",
    },
  }}
/>
```

Keep comparison and data tables in Markdown.

## Check changes

```sh
pnpm --filter @notion-kit/docs typecheck
pnpm --filter @notion-kit/docs lint
pnpm --filter @notion-kit/docs format --write
pnpm --filter @notion-kit/docs build
```

Check the affected pages and controls in the browser. Registry installation files are served at `/registry/<name>.json`.
