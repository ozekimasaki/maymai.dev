import { createTheme } from '@ox-content/vite-plugin';
import { DefaultLayout } from './layouts/Default.tsx';
import { HomeLayout } from './layouts/Home.tsx';
import { WorksIndexLayout } from './layouts/WorksIndex.tsx';
import { WorkDetailLayout } from './layouts/WorkDetail.tsx';
import { BlogIndexLayout } from './layouts/BlogIndex.tsx';
import { BlogPostLayout } from './layouts/BlogPost.tsx';
import { MayprojectHomeLayout } from './layouts/MayprojectHome.tsx';
import { MayprojectGuidelinesLayout } from './layouts/MayprojectGuidelines.tsx';
import { MayprojectNewsIndexLayout } from './layouts/MayprojectNewsIndex.tsx';
import { MayprojectNewsLayout } from './layouts/MayprojectNews.tsx';

export const theme = createTheme({
  layouts: {
    default: DefaultLayout,
    home: HomeLayout,
    'works-index': WorksIndexLayout,
    work: WorkDetailLayout,
    'blog-index': BlogIndexLayout,
    blog: BlogPostLayout,
    mayproject: MayprojectHomeLayout,
    'mayproject-guidelines': MayprojectGuidelinesLayout,
    'mayproject-news-index': MayprojectNewsIndexLayout,
    'mayproject-news': MayprojectNewsLayout,
  },
  defaultLayout: 'home',
});
