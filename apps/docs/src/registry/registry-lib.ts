import type {
  InternalRegistry,
  InternalRegistryItem,
} from "@notion-kit/validators";

export const lib: InternalRegistry = [
  {
    name: "utils",
    deps: ["clsx", "tailwind-merge"],
    files: [
      {
        type: "lib",
        source: "../../../../packages/cn/src/index.ts",
        target: "lib/utils.tsx",
      },
    ],
  },
].map(
  ({ name, ...rest }) =>
    ({ name, type: "lib", ...rest }) as InternalRegistryItem,
);
