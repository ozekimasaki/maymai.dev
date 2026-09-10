/** @jsxImportSource @ox-content/vite-plugin */
import { each, raw, type JSXNode } from '@ox-content/vite-plugin';

const logoChars = 'Maymai.dev'.split('');

const loadingScript = `(function() {
  var KEY = 'maymai-loading-shown';
  var el = document.querySelector('.js-loading');
  if (!el) return;
  var skip = false;
  try { skip = !!sessionStorage.getItem(KEY); } catch(e) {}
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || skip) {
    el.remove();
    return;
  }
  document.body.style.overflow = 'hidden';
  try { sessionStorage.setItem(KEY, '1'); } catch(e) {}
  el.addEventListener('animationend', function(e) {
    if (e.animationName === 'loadingFadeOut') {
      el.remove();
      document.body.style.overflow = '';
    }
  });
})();`;

export function Loading(): JSXNode {
  return (
    <>
      <div class="Loading js-loading" aria-hidden="true">
        <div class="Loading__content">
          <p class="Loading__logo">
            {each(logoChars, (char, i) => (
              <span style={`--ci:${i}`}>{char}</span>
            ))}
          </p>
          <div class="Loading__line"></div>
          <p class="Loading__label">// initializing</p>
        </div>
      </div>
      {raw(`<script>${loadingScript}</script>`)}
    </>
  );
}
