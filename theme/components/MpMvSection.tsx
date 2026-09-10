/** @jsxImportSource @ox-content/vite-plugin */
import type { JSXNode } from '@ox-content/vite-plugin';

export function MpMvSection(): JSXNode {
  return (
    <section class="MpMv" id="mv">
      <div class="MpMv__bg">
        <picture class="MpMv__bgPicture">
          <source media="(max-width: 767px)" srcset="/mayproject/img_mv_bg_sp.avif" />
          <img
            src="/mayproject/img_mv_bg.avif"
            alt=""
            class="MpMv__bgImg"
            width="1920"
            height="1080"
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
        </picture>
        <div class="MpMv__overlay"></div>
      </div>

      <h1 class="MpMv__heading">
        <img src="/mayproject/logo_mei.svg" alt="桜草メイプロジェクト" class="MpMv__logo" width="320" height="172" />
      </h1>

      <div class="MpMv__side pc-only">
        <span class="MpMv__sideLine"></span>
        <span class="MpMv__sideText">桜草メイプロジェクト</span>
        <span class="MpMv__sideLine"></span>
      </div>
    </section>
  );
}
