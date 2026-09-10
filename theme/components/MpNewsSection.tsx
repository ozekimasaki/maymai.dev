/** @jsxImportSource @ox-content/vite-plugin */
import { each, useSiteConfig, type JSXNode } from '@ox-content/vite-plugin';
import { asString, getNewsPages, isoFromDotDate, NEWS_CATEGORY_COLORS, pagePath } from '../lib/site.ts';

export function MpNewsSection(): JSXNode {
  const site = useSiteConfig();
  const newsItems = getNewsPages(site.pages).slice(0, 5);

  return (
    <section class="MpNews" id="news">
      <div class="MpNews__inner MpGrid">
        <div class="MpNews__header">
          <div class="MpNews__titleBg">NEWS</div>
          <div class="MpNews__titleWrap">
            <span class="MpNews__titleBar"></span>
            <div class="MpNews__titleGroup">
              <span class="MpNews__titleEn">NEWS</span>
              <h2 class="MpNews__titleJa">お知らせ</h2>
            </div>
          </div>
        </div>

        <ul class="MpNews__list">
          {each(newsItems, (item) => {
            const date = asString(item.frontmatter.date);
            const category = asString(item.frontmatter.category, 'INFO') as keyof typeof NEWS_CATEGORY_COLORS;
            const color = NEWS_CATEGORY_COLORS[category] ?? NEWS_CATEGORY_COLORS.INFO;
            return (
              <li class="MpNews__item">
                <a href={pagePath(item)} class="MpNews__link">
                  <time class="MpNews__date" datetime={isoFromDotDate(date)}>{date}</time>
                  <span class="MpNews__badge" style={`background-color: ${color}`}>
                    {category}
                  </span>
                  <span class="MpNews__title">{item.title}</span>
                  <span class="MpNews__arrow">&rarr;</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div class="MpNews__viewAll">
          <a href="/mayproject/news/" class="MpNews__viewAllLink">
            VIEW ALL <span>&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
