import type { Cents, CurrencyCode } from './types'

/**
 * Units of each currency per euro. Gamefound prices and charges in euros; the other
 * currencies are only ever a way of reading the same sum.
 */
export interface Rates {
  readonly USD: number
  readonly GBP: number
  /** The day the rates are from, as YYYY-MM-DD. */
  readonly date: string
  /** Whether they were fetched just now, rather than being the ones the build shipped with. */
  readonly live: boolean
}

const CENTS_PER_UNIT = 100

// One locale for everyone, so the server-rendered page and the browser agree to the character.
const LOCALE = 'en-GB'

const formatters = new Map<CurrencyCode, Intl.NumberFormat>()

const formatterFor = (currency: CurrencyCode): Intl.NumberFormat => {
  const existing = formatters.get(currency)
  if (existing !== undefined) {
    return existing
  }
  // The bare symbol: "$", not the "US$" a British locale would otherwise write.
  const created = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  })
  formatters.set(currency, created)
  return created
}

export const rateFor = (currency: CurrencyCode, rates: Rates): number =>
  currency === 'EUR' ? 1 : rates[currency]

/** Euro cents as an amount of the chosen currency, written out. */
export const formatMoney = (cents: Cents, currency: CurrencyCode, rates: Rates): string =>
  formatterFor(currency).format((cents * rateFor(currency, rates)) / CENTS_PER_UNIT)

export const CURRENCY_SYMBOLS: Readonly<Record<CurrencyCode, string>> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
}
