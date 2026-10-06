import { catalog } from '~/domain/catalog'

import type { Rates } from '~/domain/money'

/** The European Central Bank's daily reference rates, served by Frankfurter with no key. */
const RATES_URL = 'https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,GBP'
const DATE_LENGTH = 'YYYY-MM-DD'.length

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null

const isRate = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

/** Picks the rates out of Frankfurter's reply; null if it is not the shape expected. */
const parseRates = (reply: unknown): Rates | null => {
  if (!isRecord(reply) || !isRecord(reply['rates']) || typeof reply['date'] !== 'string') {
    return null
  }
  const { USD, GBP } = reply['rates']
  return isRate(USD) && isRate(GBP) ? { USD, GBP, date: reply['date'], live: true } : null
}

interface RatesStore {
  readonly rates: Readonly<Ref<Rates>>
  /** Fetches today's rates; on any failure the ones the build shipped with stay. */
  readonly refresh: () => Promise<void>
}

/**
 * The exchange rates. They start as the ones Gamefound was showing when the catalogue was
 * captured, so the page is right enough before, or without, the network.
 */
export const useRates = (): RatesStore => {
  const rates = useState<Rates>('rates', () => ({
    ...catalog.rates,
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
