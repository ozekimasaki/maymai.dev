import Splide from '@splidejs/splide';
import '@splidejs/splide/css';

const AUTOPLAY_DELAY = 4200;

function initMpGallery(): void {
  const el = document.querySelector<HTMLElement>('.js-mp-gallery-splide');

  if (!el || el.dataset.galleryReady === 'true') return;

  const section = el.closest<HTMLElement>('.MpGallery');

  if (!section) return;

  el.dataset.galleryReady = 'true';

  const counterEls = Array.from(section.querySelectorAll<HTMLElement>('.js-mp-gallery-current'));
  const reduceMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
  const slideCount = el.querySelectorAll('.splide__slide').length;
  const hasMultipleSlides = slideCount > 1;

  let splide: Splide | null = null;

  const updateCounter = (index: number) => {
    const counter = String(index + 1).padStart(2, '0');
    counterEls.forEach((counterEl) => {
      counterEl.textContent = counter;
    });
  };

  const setAutoplayState = (enabled: boolean) => {
    section.dataset.autoplay = String(enabled);
    section.dataset.autoplayPaused = 'false';
  };

  const resetProgressAnimation = () => {
    const fill = section.querySelector<HTMLElement>('.MpGallery__autoplayFill');
    if (!fill) return;
    fill.style.animation = 'none';
    void fill.offsetHeight;
    fill.style.animation = '';
  };

  const createSplide = () => {
    const reducedMotion = reduceMotionMql.matches;
    const autoplayEnabled = hasMultipleSlides && !reducedMotion;

    setAutoplayState(autoplayEnabled);

    splide = new Splide(el as HTMLElement, {
      type: hasMultipleSlides ? 'loop' : 'slide',
      perPage: 3,
      perMove: 1,
      focus: 'center',
      gap: 0,
      speed: reducedMotion ? 320 : 760,
      arrows: hasMultipleSlides,
      pagination: hasMultipleSlides,
      keyboard: hasMultipleSlides ? 'global' : false,
      drag: hasMultipleSlides,
      snap: true,
      autoplay: autoplayEnabled,
      interval: AUTOPLAY_DELAY,
      pauseOnHover: true,
      trimSpace: false,
      breakpoints: {
        767: {
          perPage: 1,
          padding: { left: '8%', right: '8%' },
        },
      },
    });

    // Counter update
    splide.on('move', () => {
      updateCounter(splide!.index);
    });

    // Progress bar: reset on every slide change
    splide.on('move', () => {
      resetProgressAnimation();
    });

    if (autoplayEnabled) {
      // Sync CSS animation play-state with Splide autoplay
      splide.on('autoplay:play', () => {
        section.dataset.autoplayPaused = 'false';
      });

      splide.on('autoplay:pause', () => {
        section.dataset.autoplayPaused = 'true';
      });
    }

    splide.mount();

    updateCounter(splide.index);
  };

  const handleReduceMotionChange = () => {
    splide?.destroy();
    createSplide();
  };
  reduceMotionMql.addEventListener('change', handleReduceMotionChange);

  window.addEventListener(
    'pagehide',
    () => {
      reduceMotionMql.removeEventListener('change', handleReduceMotionChange);
      splide?.destroy();
      splide = null;
      delete el.dataset.galleryReady;
    },
    { once: true },
  );

  createSplide();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMpGallery, { once: true });
} else {
  initMpGallery();
}
