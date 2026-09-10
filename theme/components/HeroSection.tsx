/** @jsxImportSource @ox-content/vite-plugin */
import type { JSXNode } from '@ox-content/vite-plugin';

export function HeroSection(): JSXNode {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

  return (
    <section id="hero" class="Hero">
      <div class="Hero__inner">
        <div class="Hero__content">
          <p class="Hero__label Hero__fadeItem" style="--hero-order: 0;">// portfolio_v1.0</p>
          <h1 class="Hero__heading Hero__fadeItem" style="--hero-order: 1;">
            Code with AI,<br />
            Create for Someone.
          </h1>
          <p class="Hero__description Hero__fadeItem" style="--hero-order: 2;">
            AIの力をかりながら、<br />
            しずかで心地よいデジタル体験をつくっています。
          </p>
        </div>

        <div class="Hero__scroll Hero__fadeItem" style="--hero-order: 3;">
          <span class="Hero__scrollText">scroll</span>
          <span class="Hero__scrollLine"></span>
        </div>

        <p class="Hero__lang Hero__fadeItem" style="--hero-order: 3;">lang: ja-JP</p>

        <div class="Hero__status Hero__fadeItem" style="--hero-order: 3;">
          <p>[ status: online ]</p>
          <p>last_deploy: {today}</p>
          <p>version: 1.0.0</p>
        </div>
      </div>
    </section>
  );
}
