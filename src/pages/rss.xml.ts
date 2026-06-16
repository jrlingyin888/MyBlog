import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { getPublishedPosts, makeExcerpt } from '../lib/posts';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context: APIContext) {
  const posts = getPublishedPosts(await getCollection('posts'));
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: makeExcerpt(post, post.body ?? ''),
      link: `/posts/${post.id}/`,
      categories: [post.data.category, ...post.data.tags],
    })),
  });
}
