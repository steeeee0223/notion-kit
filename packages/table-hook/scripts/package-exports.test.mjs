import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const entrySource = await readFile(
  new URL("../dist/index.mjs", import.meta.url),
  "utf8",
);

function stripCommentsAndStrings(source) {
  let state = "code";
  let result = "";

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (state === "code") {
      if (character === "/" && next === "/") {
        result += "  ";
        state = "line-comment";
        index += 1;
      } else if (character === "/" && next === "*") {
        result += "  ";
        state = "block-comment";
        index += 1;
      } else if (character === '"' || character === "'" || character === "`") {
        result += " ";
        state = character;
      } else {
        result += character;
      }
    } else if (state === "line-comment") {
      if (character === "\n") {
        result += character;
        state = "code";
      } else {
        result += " ";
      }
    } else if (state === "block-comment") {
      if (character === "*" && next === "/") {
        result += "  ";
        state = "code";
        index += 1;
      } else {
        result += character === "\n" ? character : " ";
      }
    } else if (character === "\\") {
      result += " ";
      if (next !== undefined) {
        result += next === "\n" ? next : " ";
        index += 1;
      }
    } else if (character === state) {
      result += " ";
      state = "code";
    } else {
      result += character === "\n" ? character : " ";
    }
  }

  return result;
}

function getNamedExports(source) {
  const names = new Set();
  const exportClauses = stripCommentsAndStrings(source).matchAll(
    /^[\t ]*export\s*\{([\s\S]*?)\}\s*;?\s*$/gm,
  );

  for (const [, clause] of exportClauses) {
    for (const specifier of clause.split(",")) {
      const parts = specifier.trim().split(/\s+as\s+/);
      const publicName = parts.at(-1)?.trim();
      if (publicName) names.add(publicName);
    }
  }

  assert.notEqual(names.size, 0, "expected a top-level named export clause");
  return names;
}

const namedExports = getNamedExports(entrySource);

test("export parser handles aliases without matching comments or strings", () => {
  const parsed = getNamedExports(`
    const marker = "export { stringOnly }";
    // export { lineCommentOnly }
    /*
    export { blockCommentOnly }
    */
    //# sourceMappingURL=export { sourceMapOnly }
    export {
      localName as publicName,
      directName,
    };
  `);

  assert.deepEqual([...parsed].sort(), ["directName", "publicName"]);
});

test("emitted package entry exposes filtering runtime APIs", () => {
  for (const name of [
    "AdvancedFilteringFeature",
    "evaluateTableFilter",
    "getAdvancedFilteredRowModel",
    "pluginTextIncludes",
    "validateTableFilterState",
  ]) {
    assert.equal(
      namedExports.has(name),
      true,
      `missing runtime export: ${name}`,
    );
  }
});

test("emitted package entry keeps row-model implementation helpers private", () => {
  for (const name of [
    "filterRowsFromRoot",
    "filterRowsFromLeafs",
    "getNativeFilteredRowModel",
    "filterRowsByTableOptions",
  ]) {
    assert.equal(
      namedExports.has(name),
      false,
      `private runtime export: ${name}`,
    );
  }
});
