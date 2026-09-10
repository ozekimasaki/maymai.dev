export function initMpPageTop(): void {
  const btn = document.getElementById('js-page-top');
  if (!btn) return;

  const update = () => {
    const pastMv = window.scrollY > window.innerHeight;
    btn.classList.toggle('is-visible', pastMv);
  };

  window.addEventListener('scroll', update, { passive: true });
  update();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
