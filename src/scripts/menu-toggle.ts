type MenuToggleOptions = {
  rootSelector: string;
  buttonSelector: string;
  panelSelector: string;
  linkSelector: string;
  openLabel: string;
  closeLabel: string;
  openClass?: string;
};

export function initMenuToggle({
  rootSelector,
  buttonSelector,
  panelSelector,
  linkSelector,
  openLabel,
  closeLabel,
  openClass = 'is-open',
}: MenuToggleOptions): void {
  const root = document.querySelector<HTMLElement>(rootSelector);
  const button = document.querySelector<HTMLButtonElement>(buttonSelector);
  const panel = document.querySelector<HTMLElement>(panelSelector);

  if (!root || !button || !panel) return;

  const menuLinks = root.querySelectorAll<HTMLAnchorElement>(linkSelector);

  const setOpenState = (isOpen: boolean) => {
    root.classList.toggle(openClass, isOpen);
    button.setAttribute('aria-expanded', String(isOpen));
    button.setAttribute('aria-label', isOpen ? closeLabel : openLabel);
    panel.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  const closeMenu = () => setOpenState(false);

  button.addEventListener('click', () => {
    setOpenState(!root.classList.contains(openClass));
  });

  menuLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('pagehide', closeMenu, { once: true });
}
