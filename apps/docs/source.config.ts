import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import { z } from "zod/v4";

export const { docs, meta } = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      links: z
        .array(
          z.object({
            label: z.string(),
            href: z.string(),
          }),
        )
        .optional(),
    }),
  },
  meta: {
    schema: metaSchema.extend({
      description: z.string().optional(),
    }),
  },
});

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
});
