export const SITE_TITLE = '慢一点';
export const SITE_TAGLINE = '慢慢写，慢慢想 · by Jerry';
export const SITE_DESCRIPTION = '慢一点 —— Jerry 的个人博客，记录技术、随笔与笔记。';

export const CATEGORIES = {
  '技术': { slug: 'tech',  label: '技术', bg: '#f4e4d4', fg: '#b5542f' },
  '随笔': { slug: 'essay', label: '随笔', bg: '#e8ead6', fg: '#6b7a3a' },
  '笔记': { slug: 'note',  label: '笔记', bg: '#dfe6ec', fg: '#3a5e7a' },
} as const;

export type Category = keyof typeof CATEGORIES;

export function slugToCategory(slug: string): Category {
  const found = (Object.keys(CATEGORIES) as Category[]).find(
    (c) => CATEGORIES[c].slug === slug,
  );
  if (!found) throw new Error(`Unknown category slug: ${slug}`);
  return found;
}
