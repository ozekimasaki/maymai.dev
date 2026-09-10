/** @jsxImportSource @ox-content/vite-plugin */
import { each, type JSXNode } from '@ox-content/vite-plugin';

type MpHeaderProps = {
  currentPath?: string;
};

export function MpHeader({ currentPath = '/mayproject/' }: MpHeaderProps): JSXNode {
  const isMayprojectTop = currentPath === '/mayproject/';
  const toSectionHref = (sectionId: string) => (isMayprojectTop ? `#${sectionId}` : `/mayproject/#${sectionId}`);
  const navItems = [
    { en: 'MAYMAI.DEV', ja: 'ポートフォリオTOP', href: '/', isCurrent: false },
    { en: 'ABOUT', ja: 'プロジェクトについて', href: toSectionHref('about'), isCurrent: false },
    { en: 'GALLERY', ja: '画像展示室', href: toSectionHref('gallery'), isCurrent: false },
    { en: 'CHARACTER', ja: 'キャラクター紹介', href: toSectionHref('character'), isCurrent: false },
    { en: 'GUIDELINE', ja: 'ガイドライン', href: '/mayproject/guidelines/', isCurrent: currentPath === '/mayproject/guidelines/' },
    { en: 'CONTACT', ja: 'お問い合わせ', href: toSectionHref('contact'), isCurrent: false },
  ];

  return (
    <header
      class={`MpHeader js-mp-header${isMayprojectTop ? ' is-mv-active' : ''}`}
      data-first-view-header={isMayprojectTop ? 'true' : 'false'}
    >
      <div class="MpHeader__inner MpGrid">
        <a href="/mayproject/" class="MpHeader__logo">
          <img src="/mayproject/logo_mei.svg" alt="桜草メイプロジェクト" class="MpHeader__logoImg" width="160" height="86" />
        </a>

        <nav class="MpHeader__nav pc-only" aria-label="メインナビゲーション">
          <ul class="MpHeader__navList">
            {each(navItems, (item) => (
              <li class="MpHeader__navItem">
                <a
                  href={item.href}
                  class={`MpHeader__navLink ${item.isCurrent ? 'is-current' : ''}`}
                  aria-current={item.isCurrent ? 'page' : undefined}
                >
                  <span class="MpHeader__navEn">{item.en}</span>
                  <span class="MpHeader__navJa">{item.ja}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          class="MpHeader__burger sp-only js-mp-burger"
          type="button"
          aria-label="メニューを開く"
          aria-expanded="false"
          aria-controls="mp-sp-menu"
        >
          <span class="MpHeader__burgerLine"></span>
          <span class="MpHeader__burgerLine"></span>
          <span class="MpHeader__burgerLine"></span>
        </button>
      </div>

      <div class="MpHeader__menu sp-only" id="mp-sp-menu" aria-hidden="true">
        <nav aria-label="メインメニュー">
          <ul class="MpHeader__menuList">
            {each(navItems, (item) => (
              <li class="MpHeader__menuItem">
                <a
                  href={item.href}
                  class={`MpHeader__menuLink js-mp-menu-link ${item.isCurrent ? 'is-current' : ''}`}
                  aria-current={item.isCurrent ? 'page' : undefined}
                >
                  <span class="MpHeader__menuEn">{item.en}</span>
                  <span class="MpHeader__menuJa">{item.ja}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
