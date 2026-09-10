/** @jsxImportSource @ox-content/vite-plugin */
import { each, useSiteConfig, type JSXNode } from '@ox-content/vite-plugin';
import { asString, getBlogPages, isoFromDotDate, pagePath } from '../lib/site.ts';

export function BlogSection(): JSXNode {
  const site = useSiteConfig();
  const posts = getBlogPages(site.pages).slice(0, 3);

  return (
    <section id="blog" class="Blog">
      <div class="Blog__inner l-inner">
        <div class="Blog__header u-anime">
          <h2 class="Blog__heading">Blog</h2>
          <span class="Blog__label">{`// Blog.latest(${posts.length})`}</span>
        </div>

        <ul class="Blog__list">
          {each(posts, (post, i) => {
            const date = asString(post.frontmatter.date);
            return (
              <li class="Blog__item u-anime" style={`--delay: ${i * .08}s;`}>
                <a href={pagePath(post)} class="Blog__link">
                  <div class="Blog__thumb">
                    <img
                      src={asString(post.frontmatter.thumbnail, '/og-image.png')}
                      alt={post.title}
                      width="1200"
                      height="630"
                      loading="lazy"
                    />
                  </div>
                  <div class="Blog__content">
                    <time class="Blog__date" datetime={isoFromDotDate(date)}>{date}</time>
                    <span class="Blog__title">{post.title}</span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>

        <div class="Blog__more u-anime" style="--delay: .1s;">
          <a href="/blog/" class="Blog__moreLink">View More</a>
        </div>
      </div>
    </section>
  );
}
