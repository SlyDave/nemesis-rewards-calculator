import { findDestination } from '~/domain/destinations'
import {
  DEFAULT_PREFERENCES,
  EXTRAS,
  decodePreferences,
  encodePreferences,
} from '~/domain/preferences'

import type { CurrencyCode, ExtraTag, GameLine, Preferences } from '~/domain/types'

const STORAGE_KEY = 'nemesis-rewards:preferences'
const QUERY_KEY = 'c'

interface PreferencesStore {
  readonly preferences: Readonly<Ref<Preferences>>
  readonly update: (changes: Partial<Preferences>) => void
  readonly setLine: (line: GameLine, included: boolean) => void
  readonly setExtra: (tag: ExtraTag, included: boolean) => void
  readonly setAllExtras: (included: boolean) => void
  readonly reset: () => void
}

/** The visitor's choices, shared by every component that reads or changes them. */
export const usePreferences = (): PreferencesStore => {
  const preferences = useState<Preferences>('preferences', () => DEFAULT_PREFERENCES)

  const update = (changes: Partial<Preferences>): void => {
    preferences.value = { ...preferences.value, ...changes }
  }

  return {
    preferences,
    update,
    setLine: (line, included) => {
      update({ lines: { ...preferences.value.lines, [line]: included } })
    },
    setExtra: (tag, included) => {
      update({ extras: { ...preferences.value.extras, [tag]: included } })
    },
    setAllExtras: (included) => {
      const extras = { ...preferences.value.extras }
      for (const { tag } of EXTRAS) {
        extras[tag] = included
      }
      update({ extras })
    },
    reset: () => {
      // The destination and currency are about the visitor, not the order, so they stay.
      const { destination, currency } = preferences.value
      preferences.value = { ...DEFAULT_PREFERENCES, destination, currency }
    },
  }
}

const CURRENCY_BY_REGION: Readonly<Record<string, CurrencyCode>> = { GB: 'GBP', US: 'USD' }

/** A first guess at where the visitor is, from the language their browser asks for. */
const guessFromLocale = (): Partial<Preferences> => {
  try {
    const { region } = new Intl.Locale(navigator.language)
    if (region === undefined || findDestination(region) === undefined) {
      return {}
    }
    return { destination: region, currency: CURRENCY_BY_REGION[region] ?? 'EUR' }
  } catch {
    return {}
  }
}

const readStored = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

const writeStored = (code: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    // Private browsing, or storage switched off: the address bar still carries the choices.
  }
}

/**
 * The code in the link the visitor followed, if it carried one. Read as this script loads,
 * because it is not there for long: while it takes over a pre-rendered page, Nuxt strips the
 * query from the address to match the HTML it was built with, and only puts it back once the
 * page is running.
 */
const linkedAtLoad: string | null = import.meta.client
  ? new URLSearchParams(window.location.search).get(QUERY_KEY)
  : null

/**
 * Puts the code in the address bar, so the address is always a link to the current choices.
 * Done on the history directly: nothing navigates, and the router has no say in it.
 */
const writeLinked = (code: string | null): void => {
  const url = new URL(window.location.href)
  if (code === null) {
    url.searchParams.delete(QUERY_KEY)
  } else {
    url.searchParams.set(QUERY_KEY, code)
  }
  window.history.replaceState(window.history.state, '', url)
}

/**
 * Brings back the choices from the link the visitor followed, or else from their last visit,
 * and from then on keeps both the address bar and the browser's storage up to date. Called
 * once, by the page.
 *
 * It waits until the app is fully running: the HTML was rendered at build time with the
 * defaults and has to be taken over as it is before anything in it changes, and the address
 * is only Nuxt's to rewrite until then (see linkedAtLoad).
 */
export const useRestoredPreferences = (): void => {
  const { preferences, update } = usePreferences()

  onNuxtReady(() => {
    const stored = readStored()
    const restored =
      (linkedAtLoad === null ? null : decodePreferences(linkedAtLoad)) ??
      (stored === null ? null : decodePreferences(stored))
    update(restored ?? guessFromLocale())

    const defaults = encodePreferences(DEFAULT_PREFERENCES)
    watch(
      preferences,
      (current) => {
        const code = encodePreferences(current)
        writeStored(code)
        writeLinked(code === defaults ? null : code)
      },
      { immediate: true },
    )
  })
}
