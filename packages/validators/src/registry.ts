import { z } from "zod/v4";

/**
 * @see https://ui.shadcn.com/docs/registry/registry-item-json#type
 */
export const RegistryItemTypeSchema = z.enum([
  "registry:block",
  "registry:component",
  "registry:lib",
  "registry:hook",
  "registry:ui",
  "registry:page",
  "registry:file",
  "registry:style",
  "registry:theme",
]);
export type RegistryItemType = z.infer<typeof RegistryItemTypeSchema>;

/**
 * @see https://ui.shadcn.com/docs/registry/registry-item-json#cssvars
 */
export const RegistryItemCssVarsSchema = z.object({
  theme: z.record(z.string(), z.string()).optional(),
  light: z.record(z.string(), z.string()).optional(),
  dark: z.record(z.string(), z.string()).optional(),
});
export type RegistryItemCssVars = z.infer<typeof RegistryItemCssVarsSchema>;

/**
 * @see https://ui.shadcn.com/docs/registry/registry-item-json
 */
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
  cssVars: RegistryItemCssVarsSchema.optional(),
  css: z.record(z.string(), z.any()).optional(),
  meta: z.record(z.string(), z.any()).optional(),
  docs: z.string().optional(),
  categories: z.array(z.string()).optional(),
  extends: z.literal("none").optional(),
});
export type RegistryItem = z.infer<typeof RegistryItemSchema>;

export const RegistryIndexSchema = z.object({
  $schema: z.literal("https://ui.shadcn.com/schema/registry.json"),
  name: z.string(),
  homepage: z.string(),
  items: z.array(RegistryItemSchema),
});
export type RegistryIndex = z.infer<typeof RegistryIndexSchema>;
