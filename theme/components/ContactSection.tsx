/** @jsxImportSource @ox-content/vite-plugin */
import { each, type JSXNode } from '@ox-content/vite-plugin';

const links = [
  { label: 'X (Twitter)', href: 'https://x.com/mei_999_' },
  { label: 'GitHub', href: 'https://github.com/ozekimasaki' },
];

export function ContactSection(): JSXNode {
  return (
    <section id="contact" class="Contact">
      <div class="Contact__inner l-inner">
        <h2 class="Contact__heading u-anime">Contact</h2>
        <p class="Contact__description u-anime" style="--delay: .1s;">連絡ははお気軽にどうぞ。</p>

        <div class="Contact__links u-anime" style="--delay: .2s;">
          {each(links, (link) => (
            <a
              href={link.href}
              class="Contact__link"
              target="_blank"
              rel="noopener nofollow"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
