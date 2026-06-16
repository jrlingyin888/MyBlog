import { describe, it, expect } from 'vitest';
import { CATEGORIES, slugToCategory, SITE_TITLE } from './consts';

describe('consts', () => {
  it('exposes the site title', () => {
    expect(SITE_TITLE).toBe('慢一点');
  });

  it('maps every category to a unique english slug', () => {
    const slugs = Object.values(CATEGORIES).map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toEqual(expect.arrayContaining(['tech', 'essay', 'note']));
  });

  it('resolves a slug back to its Chinese category', () => {
    expect(slugToCategory('tech')).toBe('技术');
    expect(slugToCategory('essay')).toBe('随笔');
    expect(slugToCategory('note')).toBe('笔记');
  });

  it('throws on an unknown slug', () => {
    expect(() => slugToCategory('nope')).toThrow();
  });
});
