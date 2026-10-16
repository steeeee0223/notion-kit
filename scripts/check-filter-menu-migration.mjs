import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const menus = [
  "select-group-menu",
  "sort-menu",
  "types-menu",
  "props-menu",
  "row-action-menu",
];
for (const menu of menus) {
  const path = `packages/table-view/src/menus/${menu}.tsx`;
  const source = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
  assert.doesNotMatch(
    source,
    /\bAutocomplete\w*\b/,
    `${path}: autocomplete composition remains`,
  );
  assert.doesNotMatch(
    source,
    /\b(?:autoHighlight|openOnInputClick)\b|role=["'](?:option|combobox|menuitem)["']/,
    `${path}: native menu behavior is overridden`,
  );
  assert.match(source, /<DropdownMenuInput\b/, `${path}: filter input missing`);
  assert.match(
    source,
    /<DropdownMenuList\b/,
    `${path}: native menu list missing`,
  );
}
for (const path of [
  "packages/ui/src/icon-menu/icon-menu.tsx",
  "packages/ui/src/icon-menu/icon-grid-menu/icon-grid-menu.tsx",
  "apps/globe/src/plugins/common/transit-entity-search.tsx",
]) {
  const source = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
  assert.doesNotMatch(
    source,
    /\b(?:searchQuery|setSearchQuery|setSearch|onSearchClear)\b/,
    `${path}: redundant controlled search remains`,
  );
}
console.log(
  "Five menus use native filtering; input-only search state is removed.",
);
