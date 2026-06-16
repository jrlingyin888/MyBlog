import { describe, it, expect } from 'vitest';
import {
  getPublishedPosts,
  getPostsByCategory,
  getPostsByTag,
  getAllTags,
  groupByYear,
  makeExcerpt,
  type PostLike,
} from './posts';

function post(over: Partial<PostLike['data']> & { id?: string; body?: string } = {}): PostLike {
  const { id = 'x', body = '', ...data } = over;
  return {
    id,
    body,
    data: {
      title: 'T',
      date: new Date('2026-01-01'),
      category: '技术',
      tags: [],
      draft: false,
      ...data,
    },
  };
}

describe('getPublishedPosts', () => {
  it('drops drafts and sorts by date descending', () => {
    const input = [
      post({ id: 'old', date: new Date('2025-01-01') }),
      post({ id: 'draft', draft: true, date: new Date('2030-01-01') }),
      post({ id: 'new', date: new Date('2026-06-01') }),
    ];
    const result = getPublishedPosts(input);
    expect(result.map((p) => p.id)).toEqual(['new', 'old']);
  });
});

describe('getPostsByCategory', () => {
  it('keeps only the requested category', () => {
    const input = [
      post({ id: 'a', category: '技术' }),
      post({ id: 'b', category: '随笔' }),
    ];
    expect(getPostsByCategory(input, '随笔').map((p) => p.id)).toEqual(['b']);
  });
});

describe('getPostsByTag', () => {
  it('keeps only posts containing the tag', () => {
    const input = [
      post({ id: 'a', tags: ['astro', 'blog'] }),
      post({ id: 'b', tags: ['life'] }),
    ];
    expect(getPostsByTag(input, 'astro').map((p) => p.id)).toEqual(['a']);
  });
});

describe('getAllTags', () => {
  it('returns a sorted unique list', () => {
    const input = [post({ tags: ['b', 'a'] }), post({ tags: ['a', 'c'] })];
    expect(getAllTags(input)).toEqual(['a', 'b', 'c']);
  });
});

describe('groupByYear', () => {
  it('groups by year, years descending', () => {
    const input = getPublishedPosts([
      post({ id: 'y2025', date: new Date('2025-03-01') }),
      post({ id: 'y2026', date: new Date('2026-02-01') }),
    ]);
    const groups = groupByYear(input);
    expect(groups.map((g) => g.year)).toEqual([2026, 2025]);
    expect(groups[0].posts.map((p) => p.id)).toEqual(['y2026']);
  });
});

describe('makeExcerpt', () => {
  it('uses the explicit excerpt when present', () => {
    const p = post({ excerpt: '手写摘要' });
    expect(makeExcerpt(p, 'body text')).toBe('手写摘要');
  });

  it('falls back to stripped, truncated body', () => {
    const body = '# 标题\n\n这是**正文**内容，应该被截断。'.repeat(10);
    const out = makeExcerpt(post(), body, 20);
    expect(out.length).toBeLessThanOrEqual(21);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toContain('#');
    expect(out).not.toContain('**');
  });
});
