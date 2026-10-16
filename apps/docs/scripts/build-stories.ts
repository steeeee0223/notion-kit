import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { z } from "zod";

import { registryIndex } from "../../../packages/registry/src/index";

const groups = [
  "autocomplete",
  "badge",
  "button",
  "calendar",
  "checkbox",
  "code-block",
  "combobox",
  "command",
  "context-menu",
  "cover",
  "dropdown-menu",
  "icon-block",
  "icon-menu",
  "input",
  "kanban",
  "login-form",
  "map",
  "meter",
  "navbar",
  "resizable",
  "select",
  "separator",
  "settings-panel",
  "sidebar",
  "single-image-dropzone",
  "skeleton",
  "sortable",
  "spinner",
  "switch",
  "table-view",
  "tabs",
  "tags-input",
  "timeline",
  "tooltip",
  "tree",
  "unsplash",
];
const title = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
const write = async (file: string, content: string) => {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${content.trim()}\n`);
};

for (const dir of [
  "content/registry",
  "content/development",
  "src/stories/registry",
]) {
  await rm(dir, { recursive: true, force: true });
}

const assigned = new Set<string>();
for (const group of groups) {
  const names = registryIndex.filter(
    (name) => name === group || name.startsWith(`${group}-`),
  );
  if (names.length === 0) throw new Error(`Empty registry group: ${group}`);
  for (const name of names) {
    if (assigned.has(name))
      throw new Error(`Duplicate registry story: ${name}`);
    assigned.add(name);
    const height =
      /^(calendar|settings-panel|sidebar|table-view|timeline|kanban)/.test(name)
        ? 800
        : name.startsWith("map-")
          ? 600
          : 320;
    await write(
      `src/stories/registry/${name}.lazy.tsx`,
      `import { lazy } from 'react';\nexport const Example = lazy(() => import('@notion-kit/registry/${name}'));`,
    );
    await write(
      `src/stories/registry/${name}.story.tsx`,
      `import { defineStory } from '@/lib/story';\nimport { Example } from './${name}.lazy';\nexport const story = defineStory({Component: Example, displayName: ${JSON.stringify(title(name))}, args: {initial: {}}, frame: {src: '/story/registry/${name}/story', width: 1280, height: ${height}}});`,
    );
  }
  await write(
    `content/registry/${group}.mdx`,
    `---\ntitle: ${title(group)}\n---\n\n${names.map((name, index) => `import { story as Example${index} } from '@/stories/registry/${name}.story';`).join("\n")}\n\n${names.map((name, index) => `## ${title(name)}\n\n<Example${index}.WithControl />\n\n\`\`\`sh\npnpm dlx shadcn@latest add https://notion-ui.vercel.app/registry/${name}.json\n\`\`\``).join("\n\n")}`,
  );
}
if (assigned.size !== registryIndex.length)
  throw new Error(
    `Ungrouped registry entries: ${registryIndex.filter((name) => !assigned.has(name)).join(", ")}`,
  );
await write(
  "content/registry/index.mdx",
  "---\ntitle: Registry\ndescription: Installable Notion Kit component examples.\n---\n\nChoose a component in the sidebar to explore its examples.",
);
await write(
  "content/registry/meta.json",
  JSON.stringify(
    { title: "Registry", root: true, pages: ["index", ...groups] },
    null,
    2,
  ),
);

const directory = "src/stories/development";
const files = (await readdir(directory, { recursive: true }))
  .filter((file) => file.endsWith(".story.tsx"))
  .sort();
let count = 0;
const developmentStories = new Set<string>();
for (const file of files) {
  const source = ts.createSourceFile(
    file,
    await readFile(path.join(directory, file), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const names: string[] = [];
  for (const statement of source.statements) {
    if (
      !ts.isVariableStatement(statement) ||
      !statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      )
    )
      continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.initializer &&
        ts.isCallExpression(declaration.initializer) &&
        declaration.initializer.expression.getText(source) === "defineStory"
      )
        names.push(declaration.name.text);
    }
  }
  if (names.length === 0)
    throw new Error(`No Fumadocs stories exported by ${file}`);
  count += names.length;
  const slug = file.replace(/\.story\.tsx$/, "");
  for (const name of names) developmentStories.add(`${slug}/${name}`);
  await write(
    `content/development/${slug}.mdx`,
    `---\ntitle: ${title(path.basename(slug))}\n---\n\nimport { ${names.join(", ")} } from '@/stories/development/${slug}.story';\n\n${names.map((name) => `## ${title(name)}\n\n<${name}.WithControl />`).join("\n\n")}`,
  );
}
await write(
  "content/development/index.mdx",
  "---\ntitle: Development\ndescription: Component scenarios beyond the registry examples.\n---\n\nChoose a component in the sidebar to explore its development scenarios.",
);
await write(
  "content/development/meta.json",
  JSON.stringify(
    { title: "Development", root: true, pages: ["index", "..."] },
    null,
    2,
  ),
);
const migration = z
  .record(
    z.string(),
    z.record(
      z.string(),
      z.union([
        z.object({ registry: z.enum(registryIndex) }),
        z.object({ development: z.string() }),
      ]),
    ),
  )
  .parse(JSON.parse(await readFile("story-migration.json", "utf8")));
for (const [file, stories] of Object.entries(migration)) {
  for (const [name, destination] of Object.entries(stories)) {
    if (
      "development" in destination &&
      !developmentStories.has(destination.development)
    )
      throw new Error(`Missing migrated scenario: ${file}/${name}`);
  }
}
console.log(
  `Generated ${assigned.size} registry examples in ${groups.length} groups and ${count} development scenarios.`,
);
