import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './custom.css'
import BookBanner from './components/BookBanner.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('BookBanner', BookBanner)
  },
} satisfies Theme
