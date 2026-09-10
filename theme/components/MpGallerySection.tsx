/** @jsxImportSource @ox-content/vite-plugin */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { each, type JSXNode } from '@ox-content/vite-plugin';

type GallerySlide = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

const slides = JSON.parse(
  readFileSync(join(process.cwd(), 'src/data/generated/mp-gallery-manifest.json'), 'utf8'),
) as GallerySlide[];

export function MpGallerySection(): JSXNode {
  const initialCounter = slides.length > 0 ? '01' : '00';
  const totalCounter = String(slides.length).padStart(2, '0');

  return (
    <section class="MpGallery" id="gallery">
      <div class="MpGallery__header MpGrid">
        <div class="MpGallery__titleBg">GALLERY</div>
        <div class="MpGallery__titleWrap">
          <span class="MpGallery__titleBar"></span>
          <div class="MpGallery__titleGroup">
            <span class="MpGallery__titleEn">GALLERY</span>
            <h2 class="MpGallery__titleJa">画像展示室</h2>
          </div>
        </div>
        <p class="MpGallery__counter pc-only">
          <span class="MpGallery__counterLabel">ART</span>
          <span class="MpGallery__counterCurrent js-mp-gallery-current">{initialCounter}</span>
          <span class="MpGallery__counterSep">/</span>
          <span class="MpGallery__counterTotal">{totalCounter}</span>
        </p>
      </div>

      <div class="MpGallery__bgText pc-only">GALLERY</div>

      <div class="MpGallery__sliderWrap">
        <div class="MpGallery__slider splide js-mp-gallery-splide">
          <div class="splide__track">
            <ul class="splide__list">
              {each(slides, (slide, i) => (
                <li class="splide__slide MpGallery__slide">
                  <div class="MpGallery__slideShell">
                    <div class="MpGallery__slideInner">
                      <span class="MpGallery__slideKicker">MAYPROJECT</span>
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        class="MpGallery__slideImg"
                        width={slide.width}
                        height={slide.height}
                        loading="lazy"
                        decoding="async"
                      />
                      <div class="MpGallery__slideOverlay"></div>
                      <span class="MpGallery__slideNum">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div class="MpGallery__meta">
          <div class="MpGallery__metaGroup">
            <p class="MpGallery__counter MpGallery__counter--meta sp-only">
              <span class="MpGallery__counterLabel">ART</span>
              <span class="MpGallery__counterCurrent js-mp-gallery-current">{initialCounter}</span>
              <span class="MpGallery__counterSep">/</span>
              <span class="MpGallery__counterTotal">{totalCounter}</span>
            </p>

            <div class="MpGallery__autoplay" aria-hidden="true">
              <span class="MpGallery__autoplayLabel">AUTOPLAY</span>
              <span class="MpGallery__autoplayRail">
                <span class="MpGallery__autoplayFill js-mp-gallery-autoplay-fill"></span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
