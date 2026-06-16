import type { Category } from '../consts';

export type PostLike = {
  id: string;
  body?: string;
  data: {
    title: string;
    date: Date;
    category: Category;
    tags: string[];
    excerpt?: string;
    draft: boolean;
  };
};

export function getPublishedPosts<T extends PostLike>(posts: T[]): T[] {
  return posts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function getPostsByCategory<T extends PostLike>(posts: T[], category: Category): T[] {
  return posts.filter((p) => p.data.category === category);
}

export function getPostsByTag<T extends PostLike>(posts: T[], tag: string): T[] {
  return posts.filter((p) => p.data.tags.includes(tag));
}

export function getAllTags(posts: PostLike[]): string[] {
  const set = new Set<string>();
  for (const p of posts) for (const t of p.data.tags) set.add(t);
  return [...set].sort();
}

export function groupByYear<T extends PostLike>(posts: T[]): { year: number; posts: T[] }[] {
  const map = new Map<number, T[]>();
  for (const p of posts) {
    const year = p.data.date.getFullYear();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(p);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, posts]) => ({ year, posts }));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function makeExcerpt(post: PostLike, fallbackBody = '', maxLen = 80): string {
  if (post.data.excerpt) return post.data.excerpt;
  const plain = fallbackBody
    .replace(/```[\s\S]*?```/g, ' ')            // strip fenced code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')      // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')    // links -> text
    .replace(/^\s{0,3}([*+-]|\d+\.)\s+/gm, '')  // list markers (per line)
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')         // heading markers (per line)
    .replace(/^\s{0,3}>\s?/gm, '')              // blockquote markers (per line)
    .replace(/[*_`~]/g, '')                      // inline emphasis/code marks
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + '…' : plain;
}
