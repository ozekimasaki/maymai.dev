import { initMenuToggle } from './menu-toggle';
import { initMpHeaderFirstView } from './mp-header-first-view';
import { initMpHeaderLogoVisibility } from './mp-header-logo-visibility';
import { initLikeButtons } from './likes';
import { initShareButtons } from './share-buttons';
import { initMpCharacterTabs } from './mp-character-tabs';
import { initMpPageTop } from './mp-page-top';

function boot(): void {
  if (document.querySelector('.js-header')) {
    initMenuToggle({
      rootSelector: '.js-header',
      buttonSelector: '.js-header-burger',
      panelSelector: '#sp-menu',
      linkSelector: '.js-menu-link',
      openLabel: 'メニューを開く',
      closeLabel: 'メニューを閉じる',
    });
  }

  if (document.querySelector('.js-mp-header')) {
    initMenuToggle({
      rootSelector: '.js-mp-header',
      buttonSelector: '.js-mp-burger',
      panelSelector: '#mp-sp-menu',
      linkSelector: '.js-mp-menu-link',
      openLabel: 'メニューを開く',
      closeLabel: 'メニューを閉じる',
    });

    initMpHeaderFirstView({
      rootSelector: '.js-mp-header',
      boundarySelector: '.MpSections',
    });

    initMpHeaderLogoVisibility({
      headingSelector: '.MpMv__heading',
      logoSelector: '.MpHeader__logoImg',
    });
  }

  initLikeButtons();
  initShareButtons();
  initMpCharacterTabs();
  initMpPageTop();

  if (document.querySelector('.js-mp-gallery-splide')) {
    void import('./init-mp-gallery');
  }

  void import('./layout-interactions');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
