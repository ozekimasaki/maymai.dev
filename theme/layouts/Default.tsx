/** @jsxImportSource @ox-content/vite-plugin */
import { usePageProps, type JSXNode, type ThemeProps } from '@ox-content/vite-plugin';
import { SiteShell } from '../components/SiteShell.tsx';
import { canonicalUrl } from '../lib/site.ts';

export function DefaultLayout({ children }: ThemeProps): JSXNode {
  const page = usePageProps();
  return (
    <SiteShell
      title={page.title || 'Maymai.dev'}
      description={page.description}
      canonical={canonicalUrl(page)}
    >
      {children}
    </SiteShell>
  );
}
