import { catalog } from '~/domain/catalog'
import { FOREIGN_CURRENCIES } from '~/domain/currencies'

import type { ForeignCurrency } from '~/domain/currencies'
import type { Rates } from '~/domain/money'

/**
 * Central banks' reference rates for every currency offered, served by Frankfurter with no
 * key. The same address is what the build fetches the starting rates from
 * (scripts/build-catalog.ts), and the one outside address the page is allowed to call
 * (nuxt.config.ts).
 */
const RATES_URL = `https://api.frankfurter.dev/v2/rates?base=EUR&quotes=${FOREIGN_CURRENCIES.join(',')}`
const DATE_LENGTH = 'YYYY-MM-DD'.length

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null

const isRate = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

const isDate = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

/**
 * Picks the rates out of Frankfurter's reply — a list of `{ date, base, quote, rate }` — and
 * returns null unless it has a sound rate for every currency: a partial answer would leave
 * some totals on today's rate and others on the build's.
 */
const parseRates = (reply: unknown): Rates | null => {
  if (!Array.isArray(reply)) {
    return null
  }
  const found = new Map<string, number>()
  let date = ''
  for (const entry of reply) {
    if (
      isRecord(entry) &&
      entry['base'] === 'EUR' &&
      typeof entry['quote'] === 'string' &&
      isRate(entry['rate']) &&
      isDate(entry['date'])
    ) {
      found.set(entry['quote'], entry['rate'])
      // Not every central bank has published by the same hour; the note carries the latest day.
      date = entry['date'] > date ? entry['date'] : date
    }
  }

  const perEuro: Partial<Record<ForeignCurrency, number>> = {}
  for (const code of FOREIGN_CURRENCIES) {
    const rate = found.get(code)
    if (rate === undefined) {
      return null
    }
    perEuro[code] = rate
  }
  // Every currency was filled in above, or this was left by the early return.
  return { perEuro: { ...catalog.rates, ...perEuro }, date, live: true }
}

interface RatesStore {
  readonly rates: Readonly<Ref<Rates>>
  /** Fetches today's rates; on any failure the ones the build shipped with stay. */
  readonly refresh: () => Promise<void>
}

/**
 * The exchange rates. They start as the reference rates of the day the catalogue was
 * captured, so the page is right enough before, or without, the network.
 */
export const useRates = (): RatesStore => {
  const rates = useState<Rates>('rates', () => ({
    perEuro: catalog.rates,
    date: catalog.capturedAt.slice(0, DATE_LENGTH),
    live: false,
  }))

  const refresh = async (): Promise<void> => {
    try {
      const response = await fetch(RATES_URL)
      const fresh = response.ok ? parseRates(await response.json()) : null
      if (fresh !== null) {
        rates.value = fresh
      }
    } catch {
      // Offline, or the service is down: keep what we have.
    }
  }

  return { rates, refresh }
}
