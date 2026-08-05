import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog posts live under src/content/blog/<lang>/<slug>/index.md, with the
// post's images beside it in the same folder.
// The language folder (en | zh) determines the language; the `slug` frontmatter
// field pairs translations so the language switcher can find counterparts.
const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
    // Keep the language folder in the id, e.g. "en/babel-polyfill/index",
    // so translations that share a slug don't collide.
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    slug: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
