export function initMpCharacterTabs(): void {
  const tabs = document.querySelectorAll<HTMLButtonElement>('.js-mp-char-tab');
  const panels = document.querySelectorAll<HTMLDivElement>('.js-mp-char-panel');
  if (tabs.length === 0) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = Number(tab.dataset.index);

      tabs.forEach((item, i) => {
        const isActive = i === idx;
        item.classList.toggle('MpCharacter__tab--active', isActive);
        item.setAttribute('aria-selected', String(isActive));
      });

      panels.forEach((panel, i) => {
        const isActive = i === idx;
        panel.classList.toggle('is-active', isActive);
        panel.setAttribute('aria-hidden', String(!isActive));
      });
    });
  });
}
