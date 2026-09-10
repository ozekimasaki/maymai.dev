/** @jsxImportSource @ox-content/vite-plugin */
import { each, type JSXNode } from '@ox-content/vite-plugin';

const navItems = [
  { label: 'About', href: '/#about' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Products', href: '/#works' },
  { label: 'Blog', href: '/#blog' },
  { label: '桜草メイPJ', href: '/mayproject/' },
  { label: 'Contact', href: '/#contact' },
];

export function Header(): JSXNode {
  return (
    <header class="Header js-header">
      <div class="Header__inner">
        <a href="/" class="Header__logo">Maymai.dev</a>

        <nav class="Header__nav pc-only" aria-label="メインナビゲーション">
          <ul class="Header__navList">
            {each(navItems, (item) => (
              <li class="Header__navItem">
                <a href={item.href} class="Header__navLink">{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          class="Header__burger sp-only js-header-burger"
          type="button"
          aria-label="メニューを開く"
          aria-expanded="false"
          aria-controls="sp-menu"
        >
          <span class="Header__burgerLine"></span>
          <span class="Header__burgerLine"></span>
          <span class="Header__burgerLine"></span>
        </button>
      </div>

      <div class="Header__menu sp-only" id="sp-menu" aria-hidden="true">
        <nav aria-label="メインメニュー">
          <ul class="Header__menuList">
            {each(navItems, (item) => (
              <li class="Header__menuItem">
                <a href={item.href} class="Header__menuLink js-menu-link">{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
