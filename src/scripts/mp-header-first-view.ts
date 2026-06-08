type MpHeaderFirstViewOptions = {
  rootSelector: string;
  boundarySelector: string;
  activeClass?: string;
};

export function initMpHeaderFirstView({
  rootSelector,
  boundarySelector,
  activeClass = 'is-mv-active',
}: MpHeaderFirstViewOptions): void {
  const root = document.querySelector<HTMLElement>(rootSelector);

  if (!root) return;

  if (root.dataset.firstViewHeader !== 'true') {
    root.classList.remove(activeClass);
    return;
  }

  const boundary = document.querySelector<HTMLElement>(boundarySelector);

  if (!boundary) {
    root.classList.remove(activeClass);
    return;
  }

  let animationFrameId = 0;

  const update = () => {
    animationFrameId = 0;

    const headerHeight = root.getBoundingClientRect().height;
    const boundaryTop = boundary.getBoundingClientRect().top;
    const isFirstView = boundaryTop > headerHeight;

    root.classList.toggle(activeClass, isFirstView);
  };

  const scheduleUpdate = () => {
    if (animationFrameId !== 0) return;

    animationFrameId = window.requestAnimationFrame(update);
  };

  const cleanup = () => {
    if (animationFrameId !== 0) {
      window.cancelAnimationFrame(animationFrameId);
    }

    window.removeEventListener('scroll', scheduleUpdate);
    window.removeEventListener('resize', scheduleUpdate);
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate, { once: true });
  window.addEventListener('pagehide', cleanup, { once: true });

  scheduleUpdate();
}
