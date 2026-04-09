import { defineConfig } from 'vitepress'
import { generateSidebar } from './sidebar'

export default defineConfig({
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => {
          // Treat ALL unknown tags as custom elements instead of erroring
          const htmlTags = new Set(['a','abbr','address','area','article','aside','audio','b','base','bdi','bdo','blockquote','body','br','button','canvas','caption','cite','code','col','colgroup','data','datalist','dd','del','details','dfn','dialog','div','dl','dt','em','embed','fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','head','header','hgroup','hr','html','i','iframe','img','input','ins','kbd','label','legend','li','link','main','map','mark','menu','meta','meter','nav','noscript','object','ol','optgroup','option','output','p','param','picture','pre','progress','q','rp','rt','ruby','s','samp','script','section','select','slot','small','source','span','strong','style','sub','summary','sup','table','tbody','td','template','textarea','tfoot','th','thead','time','title','tr','track','u','ul','var','video','wbr'])
          if (htmlTags.has(tag.toLowerCase())) return false
          if (tag === 'BookBanner') return false
          // VitePress internal
          if (tag.startsWith('VP') || tag.startsWith('vp-')) return false
          if (tag === 'Content' || tag === 'ClientOnly') return false
          return true
        },
      },
    },
  },
  title: 'OpenClaw 한국어 문서',
  description: 'OpenClaw - AI 에이전트용 멀티채널 게이트웨이 한국어 문서. 이게 되네? 오픈클로 미친 활용법 50제 공식 가이드.',
  lang: 'ko-KR',
  base: '/openclaw-docs-ko/',
  cleanUrls: true,
  ignoreDeadLinks: true,

  head: [
    // Basic SEO
    ['meta', { name: 'author', content: '한준구' }],
    ['meta', { name: 'keywords', content: 'OpenClaw, 오픈클로, AI 에이전트, 자동화, 멀티채널, 게이트웨이, 한국어 문서, 오픈클로 활용법, AI 비서' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { name: 'geo.region', content: 'KR' }],
    ['meta', { name: 'geo.placename', content: 'South Korea' }],
    ['meta', { name: 'content-language', content: 'ko' }],

    // Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'ko_KR' }],
    ['meta', { property: 'og:site_name', content: 'OpenClaw 한국어 문서' }],
    ['meta', { property: 'og:title', content: 'OpenClaw 한국어 문서 - 오픈클로 공식 가이드' }],
    ['meta', { property: 'og:description', content: 'AI 에이전트용 멀티채널 게이트웨이 OpenClaw 한국어 문서. Discord, Telegram, WhatsApp 등을 AI 코딩 에이전트에 연결하세요.' }],

    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'OpenClaw 한국어 문서' }],
    ['meta', { name: 'twitter:description', content: 'AI 에이전트용 멀티채널 게이트웨이 OpenClaw 한국어 문서' }],

    // Structured Data - Book
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: '이게 되네? 오픈클로 미친 활용법 50제',
      author: { '@type': 'Person', name: '한준구' },
      publisher: { '@type': 'Organization', name: '골든래빗' },
      isbn: '9791124516034',
      datePublished: '2026-05-04',
      numberOfPages: 304,
      inLanguage: 'ko',
      bookFormat: 'https://schema.org/Paperback',
      offers: {
        '@type': 'Offer',
        url: 'https://www.yes24.com/product/goods/185166276',
        priceCurrency: 'KRW',
        price: '21600',
        availability: 'https://schema.org/InStock',
      },
      about: {
        '@type': 'SoftwareApplication',
        name: 'OpenClaw',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'All',
      },
    })],

    // Structured Data - WebSite
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'OpenClaw 한국어 문서',
      inLanguage: 'ko-KR',
      about: {
        '@type': 'SoftwareApplication',
        name: 'OpenClaw',
        description: 'AI 에이전트용 멀티채널 게이트웨이',
      },
    })],

    // Naver verification placeholder
    // ['meta', { name: 'naver-site-verification', content: 'YOUR_CODE' }],
    // Google verification placeholder
    // ['meta', { name: 'google-site-verification', content: 'YOUR_CODE' }],
  ],

  sitemap: {
    hostname: 'https://jkf87.github.io/openclaw-docs-ko/',
  },

  themeConfig: {
    nav: [
      { text: '홈', link: '/' },
      { text: '시작하기', link: '/start/getting-started' },
      { text: '개념', link: '/concepts/architecture' },
      { text: 'CLI', link: '/cli/memory' },
      { text: '플러그인', link: '/plugins/memory-wiki' },
      {
        text: '📖 책 구매',
        link: 'https://www.yes24.com/product/goods/185166276',
      },
    ],

    sidebar: generateSidebar(),

    socialLinks: [
      { icon: 'github', link: 'https://github.com/openclaw/openclaw' },
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '검색', buttonAriaLabel: '검색' },
          modal: {
            noResultsText: '결과를 찾을 수 없습니다',
            resetButtonTitle: '초기화',
            footer: { selectText: '선택', navigateText: '이동', closeText: '닫기' },
          },
        },
      },
    },

    outline: { label: '목차', level: [2, 3] },
    lastUpdated: { text: '마지막 수정' },
    docFooter: { prev: '이전', next: '다음' },
    returnToTopLabel: '맨 위로',

    footer: {
      message: '📖 <a href="https://www.yes24.com/product/goods/185166276" target="_blank" rel="noopener">이게 되네? 오픈클로 미친 활용법 50제</a> — 한준구 저 | 골든래빗 출판',
      copyright: 'OpenClaw 한국어 문서 — MIT License',
    },
  },

  markdown: {
    image: { lazyLoading: true },
  },

  vite: {
    build: {
      // Don't fail on Vue template compilation warnings from markdown
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.message?.includes('Element is missing end tag')) return
          warn(warning)
        },
      },
    },
  },
})
