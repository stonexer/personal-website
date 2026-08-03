import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './ui';

export type Post = CollectionEntry<'blog'>;

// Entry id looks like "en/hello-world", where the first segment is the language.
export function postLang(post: Post): Lang {
  return post.id.split('/')[0] as Lang;
}

// All published posts for a language, newest first.
export async function getPosts(lang: Lang): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data, id }) => {
    return !data.draft && id.startsWith(`${lang}/`);
  });
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

// Rough reading time in whole minutes. CJK is counted per character and
// Latin per word, because 400 Chinese characters and 220 English words take
// about the same time to read.
export function readingMinutes(post: Post): number {
  const body = post.body ?? '';
  const cjk = (body.match(/[一-鿿㐀-䶿]/g) ?? []).length;
  const latin = (body.replace(/[一-鿿㐀-䶿]/g, ' ').match(/\b\w+\b/g) ?? [])
    .length;
  return Math.max(1, Math.round(cjk / 400 + latin / 220));
}

// The same post in the other language, matched by the shared `slug` field.
export async function getTranslation(
  post: Post,
  target: Lang,
): Promise<Post | undefined> {
  const all = await getCollection('blog', ({ data, id }) => {
    return id.startsWith(`${target}/`) && data.slug === post.data.slug;
  });
  return all[0];
}
