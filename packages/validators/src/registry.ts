import { z } from "zod";

export const RegistryItemTypeSchema = z.enum([
  "base",
  "core",
  "component",
  "lib",
  "hook",
  "theme",
  "icon-library",
]);
export type RegistryItemType = z.infer<typeof RegistryItemTypeSchema>;

export const RegistryItemFileSchema = z.object({
  type: RegistryItemTypeSchema,
  content: z.string(),
  path: z.string(),
});
export type RegistryItemFile = z.infer<typeof RegistryItemFileSchema>;

export const RegistryItemCssSchema = z.object({
  colors: z
    .object({
      light: z.record(z.string(), z.string()).optional(),
      dark: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  themeVars: z.record(z.string(), z.string()).optional(),
  keyframes: z.record(z.string(), z.string()).optional(),
});
export type RegistryItemCss = z.infer<typeof RegistryItemCssSchema>;

export const RegistryItemSchema = z.object({
  name: z.string(),
  type: RegistryItemTypeSchema.optional(),
  label: z.string().optional(),
  variants: z.array(z.string()).optional(),
  description: z.string().optional(),
  deps: z.array(z.string()).optional(),
  devDeps: z.array(z.string()).optional(),
  registryDeps: z.array(z.string()).optional(),
  files: z.array(RegistryItemFileSchema).optional(),
  css: RegistryItemCssSchema.optional(),
});
export type RegistryItem = z.infer<typeof RegistryItemSchema>;

export const RegistrySchema = z.array(RegistryItemSchema);
export type Registry = z.infer<typeof RegistrySchema>;

export const RegistryResolvedItemsTreeSchema = RegistryItemSchema.pick({
  deps: true,
  devDeps: true,
  files: true,
  css: true,
});
export type RegistryResolvedItemsTree = z.infer<
  typeof RegistryResolvedItemsTreeSchema
>;

export const RegistryIndexSchema = z.array(
  z.object({
    name: z.string(),
    type: RegistryItemTypeSchema,
    deps: z.array(z.string()).optional(),
    registryDeps: z.array(z.string()).optional(),
    variants: z.array(z.string()).optional(),
  }),
);
export type RegistryIndex = z.infer<typeof RegistryIndexSchema>;

export const RegistryIconLibrarySchema = z.object({
  name: z.string(),
  label: z.string(),
  dependency: z.string(),
  import: z.string(),
});

export const IconLibrarySchema = z.enum(["lucide-icons", "remix-icons"]);
export type IconLibrary = z.infer<typeof IconLibrarySchema>;

export const PrimitivesSchema = z.object({
  button: z.enum(["basic", "ripple", "brutalist"]).optional(),
  "toggle-button": z.enum(["basic"]).optional(),
  input: z.enum(["basic"]).optional(),
  modal: z.enum(["basic"]).optional(),
  popover: z.enum(["basic"]).optional(),
  tooltip: z.enum(["basic"]).optional(),
  calendar: z.enum(["basic", "cal"]).optional(),
  alert: z.enum(["basic"]).optional(),
  loader: z.enum(["basic"]).optional(),
  tabs: z.enum(["basic"]).optional(),
});
export type Primitives = z.infer<typeof PrimitivesSchema>;

export const RegistryThemeSchema = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string().optional(),
  css: RegistryItemCssSchema,
  iconLibrary: IconLibrarySchema,
  primitives: PrimitivesSchema.optional(),
});
export type RegistryTheme = z.infer<typeof RegistryThemeSchema>;

// ----------------------------------------------
//                   Config
// ----------------------------------------------

// we list all the possible primitives here so we can offer autocomplete in the config file

export const AliasesSchema = z.object({
  core: z.string(),
  components: z.string(),
  hooks: z.string(),
  lib: z.string(),
});
export type Aliases = z.infer<typeof AliasesSchema>;

export const RawConfigSchema = z.object({
  $schema: z.string().optional(),
  css: z.string(),
  aliases: z.object({
    components: z.string(),
    core: z.string(),
    hooks: z.string(),
    lib: z.string(),
  }),
  iconLibrary: z.string().optional(),
  primitives: PrimitivesSchema.optional(),
});
export type RawConfig = z.infer<typeof RawConfigSchema>;

export const ExtendedConfigSchema = RawConfigSchema.extend({
  resolvedPaths: z.object({
    cwd: z.string(),
    css: z.string(),
    core: z.string(),
    components: z.string(),
    hooks: z.string(),
    lib: z.string(),
    utils: z.string(),
  }),
});
export type ExtendedConfig = z.infer<typeof ExtendedConfigSchema>;

// ------------------------------------------------
//                   Internal
// ------------------------------------------------

export const InternalRegistryItemSchema = RegistryItemSchema.omit({
  files: true,
}).extend({
  files: z.array(
    z.object({
      type: RegistryItemTypeSchema,
      source: z.string(),
      target: z.string(),
    }),
  ),
});
export type InternalRegistryItem = z.infer<typeof InternalRegistryItemSchema>;

export const InternalRegistrySchema = z.array(InternalRegistryItemSchema);
export type InternalRegistry = z.infer<typeof InternalRegistrySchema>;
