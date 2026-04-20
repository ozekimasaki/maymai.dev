function normalizePathname(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function hasSamePageHashLinks(): boolean {
  const currentPath = normalizePathname(window.location.pathname);

  return Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')).some((anchor) => {
    try {
      const url = new URL(anchor.href, window.location.origin);
      return normalizePathname(url.pathname) === currentPath && url.hash.length > 1;
    } catch {
      return false;
    }
  });
}

const imports: Promise<unknown>[] = [];

if (document.querySelector('.u-anime')) {
  imports.push(import('./scroll-fade.ts'));
}

if (hasSamePageHashLinks()) {
  imports.push(import('./dissolve-scroll.ts'));
}

if (imports.length > 0) {
  void Promise.all(imports);
}
