/** @jsxImportSource @ox-content/vite-plugin */
import type { JSXNode } from '@ox-content/vite-plugin';

export function MpAboutSection(): JSXNode {
  return (
    <section class="MpAbout" id="about">
      <div class="MpAbout__radial"></div>
      <div class="MpAbout__inner MpGrid">
        <div class="MpAbout__header">
          <div class="MpAbout__titleBg">ABOUT</div>
          <div class="MpAbout__titleCenter">
            <div class="MpAbout__titleAccent"></div>
            <div class="MpAbout__titleGroup">
              <span class="MpAbout__titleEn">ABOUT</span>
              <h2 class="MpAbout__titleJa">プロジェクトについて</h2>
            </div>
          </div>
        </div>

        <div class="MpAbout__body">
          <p class="MpAbout__text">
            桜草メイプロジェクトは、<br />
            ロンドン郊外のカントリー・ハウスを舞台にした、ほのぼのキャラクターIPです。
          </p>
          <p class="MpAbout__text">
            古い屋敷の静けさに、手仕事の温かさが重なるとき——<br />
            土の匂い、ティーカップの音、庭の新芽。暮らしは、手をかけたぶんだけやさしくなる。
          </p>
          <div class="MpAbout__divider"></div>
        </div>
      </div>
    </section>
  );
}
