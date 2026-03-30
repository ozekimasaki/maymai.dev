const DURATION = 400;

function dissolveScroll(targetId: string): void {
  const target = document.getElementById(targetId);
  if (!target) return;

  const main = document.querySelector('main');
  if (!main) return;

  main.style.transition = `opacity ${DURATION}ms ease`;
  main.style.opacity = '0';

  setTimeout(() => {
    const headerH = document.querySelector('.js-header')?.getBoundingClientRect().height ?? 60;
    const y = target.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });

    requestAnimationFrame(() => {
      main.style.opacity = '1';
    });

    setTimeout(() => {
      main.style.transition = '';
    }, DURATION);
  }, DURATION);
}

function extractHash(href: string): string | null {
  try {
    const url = new URL(href, location.origin);
    if (url.pathname !== location.pathname) return null;
    return url.hash.slice(1) || null;
  } catch {
    return null;
  }
}

document.addEventListener('click', (e) => {
  const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
  if (!anchor) return;

  const id = extractHash(anchor.href);
  if (!id) return;

  e.preventDefault();
  dissolveScroll(id);
});
