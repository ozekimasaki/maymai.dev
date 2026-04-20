import Swiper from 'swiper';
import { Autoplay, EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

function initMpGallery(): void {
  const el = document.querySelector<HTMLElement>('.js-mp-gallery-swiper');

  if (!el || el.dataset.galleryReady === 'true') return;

  el.dataset.galleryReady = 'true';

  const counterEl = document.querySelector<HTMLElement>('.js-mp-gallery-current');
  const mql = window.matchMedia('(max-width: 767px)');
  const paginationEl = el.querySelector<HTMLElement>('.MpGallery__pagination');
  let swiper: Swiper | null = null;

  const shared: Swiper['params'] = {
    modules: [Autoplay, EffectCoverflow, Pagination, Navigation],
    centeredSlides: true,
    loop: true,
    speed: 700,
    autoplay: {
      delay: 4500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    navigation: {
      prevEl: '.js-mp-gallery-prev',
      nextEl: '.js-mp-gallery-next',
    },
  };

  const pcConfig: Swiper['params'] = {
    ...shared,
    effect: 'coverflow',
    slidesPerView: 'auto',
    grabCursor: true,
    coverflowEffect: {
      rotate: 0,
      stretch: 80,
      depth: 200,
      modifier: 1,
      slideShadows: false,
    },
    pagination: {
      el: '.MpGallery__pagination',
      type: 'progressbar',
    },
  };

  const spConfig: Swiper['params'] = {
    ...shared,
    effect: 'coverflow',
    slidesPerView: 'auto',
    grabCursor: false,
    coverflowEffect: {
      rotate: 0,
      stretch: 40,
      depth: 120,
      modifier: 1,
      slideShadows: false,
    },
    pagination: {
      el: '.MpGallery__pagination',
      type: 'bullets',
      clickable: true,
    },
  };

  const updateCounter = () => {
    if (counterEl && swiper) {
      counterEl.textContent = String(swiper.realIndex + 1).padStart(2, '0');
    }
  };

  const createSwiper = (isSp: boolean) => {
    if (swiper) {
      swiper.destroy(true, true);
      swiper = null;
    }

    if (paginationEl) {
      paginationEl.innerHTML = '';
      paginationEl.className = 'swiper-pagination MpGallery__pagination';
    }

    swiper = new Swiper(el, isSp ? spConfig : pcConfig);
    updateCounter();
    swiper.on('slideChange', updateCounter);
  };

  const handleMediaChange = (event: MediaQueryListEvent) => {
    createSwiper(event.matches);
  };

  createSwiper(mql.matches);
  mql.addEventListener('change', handleMediaChange);

  window.addEventListener('pagehide', () => {
    mql.removeEventListener('change', handleMediaChange);
    swiper?.destroy(true, true);
    swiper = null;
    delete el.dataset.galleryReady;
  }, { once: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMpGallery, { once: true });
} else {
  initMpGallery();
}
