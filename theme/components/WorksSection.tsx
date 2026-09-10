/** @jsxImportSource @ox-content/vite-plugin */
import { each, useSiteConfig, type JSXNode } from '@ox-content/vite-plugin';
import { asString, getWorkPages, pagePath } from '../lib/site.ts';

export function WorksSection(): JSXNode {
  const site = useSiteConfig();
  const works = getWorkPages(site.pages).slice(0, 2);

  return (
    <section id="works" class="Works">
      <div class="Works__inner l-inner">
        <div class="Works__header u-anime">
          <h2 class="Works__heading">Products</h2>
          <span class="Works__label">// Products.shipped()</span>
        </div>

        <div class="Works__grid">
          {each(works, (work, i) => (
            <a href={pagePath(work)} class="Works__card u-anime" style={`--delay: ${i * .1}s;`}>
              <div class="Works__cardImage">
                <img
                  src={asString(work.frontmatter.thumbnail)}
                  alt={work.title}
                  width="580"
                  height="360"
                  loading="lazy"
                />
              </div>
              <div class="Works__cardInfo">
                <h3 class="Works__cardTitle">{work.title}</h3>
                <p class="Works__cardCategory">{asString(work.frontmatter.category)}</p>
                <p class="Works__cardDescription">{asString(work.frontmatter.description)}</p>
              </div>
            </a>
          ))}
        </div>

        <div class="Works__more u-anime" style="--delay: .1s;">
          <a href="/works/" class="Works__moreLink">View More</a>
        </div>
      </div>
    </section>
  );
}
