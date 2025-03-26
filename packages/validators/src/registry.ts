import { z } from "zod";

export const RegistryItemTypeSchema = z.enum([
  "registry:block",
  "registry:component",
  "registry:lib",
  "registry:hook",
  "registry:ui",
  "registry:page",
  "registry:file",
]);
export type RegistryItemType = z.infer<typeof RegistryItemTypeSchema>;

export const RegistryItemTailwindSchema = z.object({
  config: z.object({
    content: z.array(z.string()).optional(),
    theme: z.record(z.any()),
    plugins: z.array(z.string()).optional(),
  }),
});
export type RegistryItemTailwind = z.infer<typeof RegistryItemTailwindSchema>;

export const RegistryItemCssVarsSchema = z.object({
  light: z.record(z.string()).optional(),
  dark: z.record(z.string()).optional(),
});
export type RegistryItemCssVars = z.infer<typeof RegistryItemCssVarsSchema>;

export const RegistryItemSchema = z.object({
  $schema: z.literal("https://ui.shadcn.com/schema/registry-item.json"),
  name: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: RegistryItemTypeSchema,
  author: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(
    z.object({
      path: z.string(),
      type: RegistryItemTypeSchema,
      target: z.string().optional(),
    }),
  ),
  tailwind: RegistryItemTailwindSchema.optional(),
  cssVars: RegistryItemCssVarsSchema.optional(),
  meta: z.record(z.any()).optional(),
  docs: z.string().optional(),
  categories: z.array(z.string()).optional(),
});
export type RegistryItem = z.infer<typeof RegistryItemSchema>;

export const RegistryIndexSchema = z.object({
  $schema: z.literal("https://ui.shadcn.com/schema/registry.json"),
  name: z.string(),
  homepage: z.string(),
  items: z.array(RegistryItemSchema),
});
export type RegistryIndex = z.infer<typeof RegistryIndexSchema>;
