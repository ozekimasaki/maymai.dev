/** @jsxImportSource @ox-content/vite-plugin */
import type { JSXNode } from '@ox-content/vite-plugin';

export function Footer(): JSXNode {
  const year = new Date().getFullYear();
  const rendered = new Date().toISOString().slice(0, 10);

  return (
    <footer class="Footer">
      <div class="Footer__inner">
        <p class="Footer__copyright">
          &copy; {year} Maymai.dev All rights reserved.
        </p>
        <nav class="Footer__links" aria-label="フッターリンク">
          <a href="/mayproject/" class="Footer__link">桜草メイPJ</a>
        </nav>
        <p class="Footer__meta">
          built_with: ox-content + TypeScript | rendered: {rendered}
        </p>
      </div>
    </footer>
  );
}
