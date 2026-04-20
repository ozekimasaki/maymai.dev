type MpHeaderLogoVisibilityOptions = {
  headingSelector: string;
  logoSelector: string;
  hiddenClass?: string;
};

export function initMpHeaderLogoVisibility({
  headingSelector,
  logoSelector,
  hiddenClass = 'is-hidden',
}: MpHeaderLogoVisibilityOptions): void {
  const logo = document.querySelector<HTMLElement>(logoSelector);

  if (!logo) return;

  const heading = document.querySelector<HTMLElement>(headingSelector);

  if (!heading) {
    logo.classList.remove(hiddenClass);
    return;
  }

  const isHeadingVisible = (): boolean => {
    const rect = heading.getBoundingClientRect();
    const left = Math.max(rect.left, 0);
    const top = Math.max(rect.top, 0);
    const right = Math.min(rect.right, window.innerWidth);
    const bottom = Math.min(rect.bottom, window.innerHeight);

    if (left >= right || top >= bottom) {
      return false;
    }

    const xPoints = [0.25, 0.5, 0.75].map((ratio) => left + (right - left) * ratio);
    const yPoints = [0.25, 0.5, 0.75].map((ratio) => top + (bottom - top) * ratio);

    return yPoints.some((y) => xPoints.some((x) => {
      const topElement = document.elementFromPoint(x, y);
      return !!topElement && (topElement === heading || heading.contains(topElement));
    }));
  };

  let animationFrameId = 0;

  const update = () => {
    animationFrameId = 0;
    logo.classList.toggle(hiddenClass, isHeadingVisible());
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
