// https://nuxt.com/docs/api/configuration/nuxt-config

import { createHash } from 'node:crypto'

const SITE_NAME = 'Nemesis Rewards Calculator'
const SITE_URL = 'https://nemesis.slydave.com/'
const SITE_DESCRIPTION =
  'Find the cheapest combination of Nemesis Legacy pledges and add-ons on Gamefound for exactly what you want — with shipping, VAT and currency.'

/** The one place besides this site the page talks to: the exchange rates (useRates). */
const RATES_ORIGIN = 'https://api.frankfurter.dev'

/** Inline scripts that run, as opposed to the JSON data blocks Nuxt also writes inline. */
const INLINE_SCRIPT =
  /<script(?![^>]*\ssrc=)(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g

/**
 * Adds a Content Security Policy to a generated page.
 *
 * GitHub Pages cannot send response headers of our choosing, so the policy travels in the
 * page as a meta tag. It allows this site's own files, the exchange-rate service, and exactly
 * the inline scripts the page was built with, each named by its hash — so a script that
 * was not there at build time does not run, whatever put it there. Styles are allowed inline
 * because the component library sets them on elements as it positions things.
 */
const withContentSecurityPolicy = (html: string): string => {
  const hashes = new Set(
    [...html.matchAll(INLINE_SCRIPT)].map(
      ([, script = '']) => `'sha256-${createHash('sha256').update(script).digest('base64')}'`,
    ),
  )
  const policy = [
    "default-src 'self'",
    ["script-src 'self'", ...hashes].join(' '),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self' ${RATES_ORIGIN}`,
    "base-uri 'self'",
    "form-action 'none'",
    "object-src 'none'",
  ].join('; ')
  // First in the head: a policy only governs what comes after it.
  return html.replace(
    '<head>',
    `<head><meta http-equiv="Content-Security-Policy" content="${policy}">`,
  )
}

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
      // Lockdown visitor never sees a flash of teal. The key and the names are useTheme's.
      script: [
        {
          key: 'theme',
          tagPosition: 'head',
          innerHTML:
            "try{var t=localStorage.getItem('nemesis-rewards:theme');if(t==='lockdown'||t==='retaliation'||t==='legacy')document.documentElement.dataset.theme=t}catch{}",
        },
      ],
    },
  },

  compatibilityDate: '2026-10-01',

  // The Nemesis site is dark and nothing else; the toggle here is between the games' themes,
  // which is ours (useTheme), so the light/dark machinery is left out altogether.
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
    hooks: {
      // Only the built pages get the policy; the dev server's own scripts would not pass it.
      'prerender:generate': (route) => {
        if (route.fileName?.endsWith('.html') === true && route.contents !== undefined) {
          // eslint-disable-next-line no-param-reassign -- Nitro hands the page over to be changed in place.
          route.contents = withContentSecurityPolicy(route.contents)
        }
      },
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
