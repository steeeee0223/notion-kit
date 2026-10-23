import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";

import { registryIndex } from "@notion-kit/registry";

import { storyTitle } from "@/lib/story";

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
  "dialog",
  "dropdown-menu",
  "icon-block",
  "icon-menu",
  "input",
  "kanban",
  "login-form",
  "map",
  "meter",
  "navbar",
  "radio-group",
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

const output = new Map<string, string>();
const page = (title: string, body: string) =>
  `---\ntitle: ${title}\n---\n\n${body}`;
const exportName = (name: string) =>
  name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

output.set(
  "src/stories/registry.story.tsx",
  `import { lazy } from 'react';
import type { Story } from '@fumadocs/story/vite/client';
import type { RegistryIndex } from '@notion-kit/registry';
import { defineStory } from '@/lib/story';

${registryIndex
  .map((name) => {
    const height =
      /^(calendar|settings-panel|sidebar|table-view|timeline|kanban)/.test(name)
        ? 800
        : name.startsWith("map-")
          ? 600
          : 320;
    return `export const ${exportName(name)} = defineStory({
  Component: lazy(() => import('@notion-kit/registry/${name}')),
  displayName: ${JSON.stringify(storyTitle(name))},
  args: { initial: {} },
  frame: { src: '/story/registry/${name}/story', height: ${height} },
});`;
  })
  .join("\n\n")}

export const registryStories = {
${registryIndex.map((name) => `  '${name}': ${exportName(name)},`).join("\n")}
} satisfies Record<RegistryIndex, Story>;`,
);

const ungrouped = new Set<string>(registryIndex);
for (const group of groups) {
  const names = registryIndex.filter(
    (name) => name === group || name.startsWith(`${group}-`),
  );
  if (!names.length) throw new Error(`Empty registry group: ${group}`);
  for (const name of names) ungrouped.delete(name);
  output.set(
    `content/registry/${group}.mdx`,
    page(
      storyTitle(group),
      names
        .map(
          (name) => `## ${storyTitle(name)}

<RegistryStory name="${name}" />

\`\`\`sh
pnpm dlx shadcn@latest add https://notion-ui.vercel.app/registry/${name}.json
\`\`\``,
        )
        .join("\n\n"),
    ),
  );
}
if (ungrouped.size)
  throw new Error(`Ungrouped registry entries: ${[...ungrouped].join(", ")}`);

const storyExports = z
  .object({})
  .catchall(z.object({ WithControl: z.function(), Frame: z.function() }));
const directory = "src/stories/development";
const files = (await readdir(directory, { recursive: true }))
  .filter((file) => file.endsWith(".story.tsx"))
  .sort();
let count = 0;
for (const file of files) {
  const exports = storyExports.parse(
    await import(pathToFileURL(path.resolve(directory, file)).href),
  );
  const names = Object.keys(exports);
  if (!names.length) throw new Error(`No stories exported by ${file}`);
  count += names.length;
  const slug = file.replace(/\.story\.tsx$/, "");
  output.set(
    `content/development/${slug}.mdx`,
    page(
      storyTitle(path.basename(slug)),
      `import { ${names.join(", ")} } from '@/stories/development/${slug}.story';

${names.map((name) => `## ${storyTitle(name)}\n\n<${name}.WithControl />`).join("\n\n")}`,
    ),
  );
}

for (const section of ["registry", "development"]) {
  const title = storyTitle(section);
  output.set(
    `content/${section}/index.mdx`,
    page(title, "Choose an example from the sidebar."),
  );
  output.set(
    `content/${section}/meta.json`,
    JSON.stringify(
      {
        title,
        root: true,
        pages: section === "registry" ? ["index", ...groups] : ["index", "..."],
      },
      null,
      2,
    ),
  );
}

// Keep unchanged files in place so rerunning this command does not reload pages.
for (const [file, content] of output) {
  const next = `${content.trim()}\n`;
  if (existsSync(file) && (await readFile(file, "utf8")) === next) continue;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, next);
}
for (const directory of ["content/registry", "content/development"]) {
  for (const file of await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  })) {
    const name = path.join(file.parentPath, file.name);
    if (file.isFile() && !output.has(name.split(path.sep).join("/")))
      await rm(name);
  }
}
console.log(
  `Generated ${registryIndex.length} registry examples and ${count} development stories.`,
);
