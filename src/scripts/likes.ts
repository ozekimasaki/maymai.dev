export function initLikeButtons(): void {
  document.querySelectorAll<HTMLElement>('.js-like-button').forEach((el) => {
    const type = el.dataset.type;
    const slug = el.dataset.slug;
    if (!type || !slug) return;

    const btn = el.querySelector<HTMLButtonElement>('.js-like-btn');
    const countEl = el.querySelector<HTMLElement>('.js-like-count');
    if (!btn || !countEl) return;

    const storageKey = `liked:${type}:${slug}`;

    let isLiked = false;
    try {
      isLiked = localStorage.getItem(storageKey) === '1';
    } catch {
      // localStorage unavailable
    }

    if (isLiked) {
      el.classList.add('is-liked');
    }

    fetch(`/api/likes?type=${type}&slug=${slug}`)
      .then((r) => r.json())
      .then((data: { count: number }) => {
        countEl.textContent = String(data.count);
      })
      .catch(() => {
        countEl.textContent = '-';
      });

    btn.addEventListener('click', async () => {
      if (el.classList.contains('is-liked')) return;

      try {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, slug }),
        });
        const data: { count: number } = await res.json();
        countEl.textContent = String(data.count);
        el.classList.add('is-liked', 'is-animating');

        el.addEventListener('animationend', () => {
          el.classList.remove('is-animating');
        }, { once: true });

        try {
          localStorage.setItem(storageKey, '1');
        } catch {
          // localStorage unavailable
        }
      } catch {
        // API error — keep current state
      }
    });
  });
}
