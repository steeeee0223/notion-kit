/**
 * Since the ecosystem hasn't fully migrated to ESLint's new FlatConfig system yet,
 * we "need" to type some of the plugins manually :(
 */

declare module "eslint-plugin-jsx-a11y" {
  import type { Linter, Rule } from "eslint";

  export const flatConfigs: {
    recommended: Linter.FlatConfig;
    strict: Linter.FlatConfig;
  };
  export const rules: Record<string, Rule.RuleModule>;
}
