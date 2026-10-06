// https://nuxt.com/docs/api/configuration/nuxt-config

const SITE_NAME = 'Nemesis Rewards Calculator'
const SITE_URL = 'https://nemesis.slydave.com/'
const SITE_DESCRIPTION =
  'Find the cheapest combination of Nemesis Legacy pledges and add-ons on Gamefound for exactly what you want — with shipping, VAT and currency.'

/** The strictest the compiler goes: `strict`, plus every check `strict` leaves out. */
const strictest = {
  allowUnreachableCode: false,
  allowUnusedLabels: false,
  exactOptionalPropertyTypes: true,
  noFallthroughCasesInSwitch: true,
  noImplicitOverride: true,
  noImplicitReturns: true,
  noPropertyAccessFromIndexSignature: true,
  noUncheckedIndexedAccess: true,
  noUncheckedSideEffectImports: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
} as const

export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/eslint'],

  // Rendered to HTML at build time (`nuxt generate`) and hydrated: there is no server, so
  // everything the page works out, it works out in the browser.
  ssr: true,

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  app: {
    // Served from the root of its own domain. The base path can still be moved with
    // NUXT_APP_BASE_URL (the deploy workflow sets it), and everything follows.
    head: {
      // No `data-theme` here: anything listed is put back to this value when the page
      // hydrates, which would undo the script below. No attribute means Nemesis.
      htmlAttrs: { lang: 'en', class: 'dark' },
      title: SITE_NAME,
      meta: [
        { name: 'description', content: SITE_DESCRIPTION },
        { name: 'theme-color', content: '#000000' },
        { property: 'og:title', content: SITE_NAME },
        { property: 'og:description', content: SITE_DESCRIPTION },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: SITE_URL },
      ],
      // Puts back the theme chosen on the last visit before anything is painted, so a
      // Lockdown visitor never sees a flash of teal. The key is useTheme's.
      script: [
        {
          key: 'theme',
          tagPosition: 'head',
          innerHTML:
            "try{if(localStorage.getItem('nemesis-rewards:theme')==='lockdown')document.documentElement.dataset.theme='lockdown'}catch{}",
        },
      ],
    },
  },

  compatibilityDate: '2026-10-01',

  // The Nemesis site is dark and nothing else; the toggle here is Nemesis or Lockdown, which
  // is ours (useTheme), so the light/dark machinery is left out altogether.
  ui: {
    colorMode: false,
  },

  // Nuxt writes one tsconfig per place code runs, and each has to be told separately.
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: strictest,
    },
    sharedTsConfig: {
      compilerOptions: strictest,
    },
    // The scripts and tests are plain Bun programs; they are checked with the Nuxt config.
    nodeTsConfig: {
      include: ['../scripts/**/*.ts', '../tests/**/*.ts'],
      compilerOptions: {
        ...strictest,
        types: ['bun'],
      },
    },
  },

  nitro: {
    typescript: {
      tsConfig: {
        compilerOptions: strictest,
      },
    },
    prerender: {
      routes: ['/'],
      crawlLinks: true,
      failOnError: true,
    },
  },

  eslint: {
    config: {
      stylistic: false,
      // A tsconfig path turns on the type-aware rules, and with `strict` the type-checked
      // strict set; eslint.config.mjs adds the rest.
      typescript: { strict: true, tsconfigPath: './tsconfig.json' },
    },
  },

  // Font Awesome Pro, generated into a local collection by `bun run icons:generate`. There
  // is no server to fetch icons from at runtime, so every one is bundled with the page.
  icon: {
    provider: 'none',
    customCollections: [{ prefix: 'fa', dir: './app/assets/icons/fa' }],
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
  },
})
