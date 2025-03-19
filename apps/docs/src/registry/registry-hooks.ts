import type {
  InternalRegistry,
  InternalRegistryItem,
} from "@notion-kit/validators";

export const hooks: InternalRegistry = [
  {
    name: "use-is-mobile",
    files: [
      {
        type: "hook",
        source: "../hooks/use-is-mobile.ts",
        target: "hooks/use-is-mobile.ts",
      },
    ],
  },
].map(
  ({ name, ...rest }) =>
    ({ name, type: "hook", ...rest }) as InternalRegistryItem,
);
