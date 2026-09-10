/** @jsxImportSource @ox-content/vite-plugin */
import { each, type JSXNode } from '@ox-content/vite-plugin';

type MpFooterProps = {
  currentPath?: string;
};

export function MpFooter({ currentPath = '/mayproject/' }: MpFooterProps): JSXNode {
  const isMayprojectTop = currentPath === '/mayproject/';
  const toSectionHref = (sectionId: string) => (isMayprojectTop ? `#${sectionId}` : `/mayproject/#${sectionId}`);
  const navItems = [
    { label: 'ABOUT', href: toSectionHref('about') },
    { label: 'GALLERY', href: toSectionHref('gallery') },
    { label: 'CHARACTER', href: toSectionHref('character') },
    { label: 'GUIDELINE', href: '/mayproject/guidelines/' },
    { label: 'CONTACT', href: toSectionHref('contact') },
  ];
  const year = new Date().getFullYear();

  return (
    <footer class="MpFooter">
      <div class="MpFooter__accent"></div>
      <div class="MpFooter__inner MpGrid">
        <div class="MpFooter__top">
          <div class="MpFooter__brand">
            <img src="/mayproject/logo_mei.svg" alt="桜草メイプロジェクト" class="MpFooter__brandLogo" width="160" height="86" />
            <p class="MpFooter__brandSub">Sakurakusa May Project</p>
          </div>
          <nav class="MpFooter__nav" aria-label="フッターナビゲーション">
            <ul class="MpFooter__navList">
              {each(navItems, (item) => (
                <li>
                  <a href={item.href} class="MpFooter__navLink">{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div class="MpFooter__bottom">
          <p class="MpFooter__copyright">
            &copy; {year} Sakurakusa May Project. All rights reserved.
          </p>
          <p class="MpFooter__meta">This is a fictional project.</p>
        </div>
      </div>
    </footer>
  );
}
