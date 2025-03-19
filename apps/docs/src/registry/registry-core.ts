import type {
  InternalRegistry,
  InternalRegistryItem,
} from "@notion-kit/validators";

export const core: InternalRegistry = [
  {
    name: "button",
    files: [
      {
        type: "core",
        source: "../../../../packages/shadcn/src/button.tsx",
        target: "core/button.tsx",
      },
    ],
  },
  // {
  //   name: "button",
  //   variants: ["basic", "brutalist", "ripple"],
  // },
  // {
  //   name: "button_basic",
  //   registryDeps: ["loader", "focus-styles"],
  //   files: [
  //     {
  //       type: "core",
  //       source: "core/button_basic.tsx",
  //       target: "core/button.tsx",
  //     },
  //   ],
  // },
  // {
  //   name: "button_brutalist",
  //   registryDeps: ["loader", "focus-styles"],
  //   files: [
  //     {
  //       type: "core",
  //       source: "core/button_brutalist.tsx",
  //       target: "core/button.tsx",
  //     },
  //   ],
  // },
  // {
  //   name: "button_ripple",
  //   registryDeps: ["loader", "focus-styles"],
  //   files: [
  //     {
  //       type: "core",
  //       source: "core/button_ripple.tsx",
  //       target: "core/button.tsx",
  //     },
  //     {
  //       type: "core",
  //       source: "core/ripple.tsx",
  //       target: "core/ripple.tsx",
  //     },
  //     {
  //       type: "hook",
  //       source: "hooks/use-ripple.ts",
  //       target: "hooks/use-ripple.ts",
  //     },
  //   ],
  // },
].map(
  ({ name, ...rest }) =>
    ({ name, type: "core", ...rest }) as InternalRegistryItem,
);
