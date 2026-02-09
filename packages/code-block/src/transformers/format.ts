import type { Plugin } from "prettier";
import { format } from "prettier/standalone";

const PRETTIER_PARSERS: Record<
  string,
  { parser: string; plugins: () => Promise<Plugin[]> }
> = {
  javascript: {
    parser: "babel",
    plugins: () =>
      Promise.all([
        import("prettier/plugins/babel"),
        import("prettier/plugins/estree").then((m) => m.default),
      ]),
  },
  typescript: {
    parser: "typescript",
    plugins: () =>
      Promise.all([
        import("prettier/plugins/typescript"),
        import("prettier/plugins/estree").then((m) => m.default),
      ]),
  },
  json: {
    parser: "json",
    plugins: () =>
      Promise.all([
        import("prettier/plugins/babel"),
        import("prettier/plugins/estree").then((m) => m.default),
      ]),
  },
  html: {
    parser: "html",
    plugins: () => Promise.all([import("prettier/plugins/html")]),
  },
  css: {
    parser: "css",
    plugins: () => Promise.all([import("prettier/plugins/postcss")]),
  },
  less: {
    parser: "less",
    plugins: () => Promise.all([import("prettier/plugins/postcss")]),
  },
  scss: {
    parser: "scss",
    plugins: () => Promise.all([import("prettier/plugins/postcss")]),
  },
  markdown: {
    parser: "markdown",
    plugins: () => Promise.all([import("prettier/plugins/markdown")]),
  },
  yaml: {
    parser: "yaml",
    plugins: () => Promise.all([import("prettier/plugins/yaml")]),
  },
  graphql: {
    parser: "graphql",
    plugins: () => Promise.all([import("prettier/plugins/graphql")]),
  },
  xml: {
    parser: "html",
    plugins: () => Promise.all([import("prettier/plugins/html")]),
  },
  flow: {
    parser: "babel-flow",
    plugins: () =>
      Promise.all([
        import("prettier/plugins/babel"),
        import("prettier/plugins/estree").then((m) => m.default),
      ]),
  },
};

export function isFormattable(lang: string) {
  return lang in PRETTIER_PARSERS;
}

export async function formatCode(code: string, lang: string) {
  const config = PRETTIER_PARSERS[lang];
  if (!config) return code;

  try {
    const plugins = await config.plugins();
    const formatted = await format(code, { parser: config.parser, plugins });
    return formatted;
  } catch {
    return code;
  }
}
