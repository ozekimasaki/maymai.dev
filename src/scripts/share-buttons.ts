export function initShareButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('.js-copy-url').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const url = btn.dataset.url;
      if (!url) return;
      try {
        await navigator.clipboard.writeText(url);
        btn.classList.add('is-copied');
        setTimeout(() => btn.classList.remove('is-copied'), 1500);
      } catch {
        // clipboard API unavailable — silent fail
      }
    });
  });
}
