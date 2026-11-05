import DefaultTheme from 'vitepress/theme';
import { Fragment, h } from 'vue';
import CatalogSearch from './CatalogSearch.vue';
import CopyControls from './CopyControls.vue';
import CraftifyHome from './CraftifyHome.vue';
import './visual-polish.css';
import './home-experience.css';
import LeaderboardPlayground from './LeaderboardPlayground.vue';
import ScrollProgress from './ScrollProgress.vue';
import type { Theme } from 'vitepress';

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(Fragment, null, [h(ScrollProgress), h(CopyControls)]),
    }),
  enhanceApp({ app }) {
    app.component('CraftifyHome', CraftifyHome);
    app.component('CatalogSearch', CatalogSearch);
    app.component('LeaderboardPlayground', LeaderboardPlayground);
  },
} satisfies Theme;
