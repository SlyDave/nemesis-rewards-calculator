import { currencyFor } from './currencies'

import type { ForeignCurrency } from './currencies'
import type { Cents, CurrencyCode } from './types'

/**
 * Units of each currency per euro. Gamefound prices and charges in euros; the other
 * currencies are only ever a way of reading the same sum.
 */
export interface Rates {
  readonly perEuro: Readonly<Record<ForeignCurrency, number>>
  /** The day the rates are from, as YYYY-MM-DD. */
  readonly date: string
  /** Whether they were fetched just now, rather than being the ones the build shipped with. */
  readonly live: boolean
}

const CENTS_PER_UNIT = 100

// One locale for everyone, so the server-rendered page and the browser agree to the character.
const LOCALE = 'en-GB'

const NO_BREAK_SPACE = ' '

const formatters = new Map<number, Intl.NumberFormat>()

const formatterFor = (decimals: number): Intl.NumberFormat => {
  const existing = formatters.get(decimals)
  if (existing !== undefined) {
    return existing
  }
  const created = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  formatters.set(decimals, created)
  return created
}

export const rateFor = (currency: CurrencyCode, rates: Rates): number =>
  currency === 'EUR' ? 1 : rates.perEuro[currency]

/**
 * An amount of a currency, written out with its own symbol where that currency puts it:
 * "€12.50", "Fr. 12.50", "12.50 zł". The symbol is ours rather than the browser's, which
 * differs from one browser to the next and would write "$" for five of these.
 */
export const formatAmount = (
  amount: number,
  code: CurrencyCode,
  decimals: number = currencyFor(code).decimals,
): string => {
  const { symbol, placement } = currencyFor(code)
  const figure = formatterFor(decimals).format(Math.abs(amount))
  const sign = amount < 0 ? '-' : ''
  switch (placement) {
    case 'before':
      return `${sign}${symbol}${figure}`
    case 'spaced':
      return `${sign}${symbol}${NO_BREAK_SPACE}${figure}`
    case 'after':
      return `${sign}${figure}${NO_BREAK_SPACE}${symbol}`
  }
}

/** Euro cents as an amount of the chosen currency, written out. */
export const formatMoney = (cents: Cents, currency: CurrencyCode, rates: Rates): string =>
  formatAmount((cents * rateFor(currency, rates)) / CENTS_PER_UNIT, currency)

const RATE_DECIMALS = 4
const LARGE_RATE = 100
const LARGE_RATE_DECIMALS = 2

/** What one euro is in a currency, to enough places to tell one day's rate from the next. */
export const formatRate = (currency: CurrencyCode, rates: Rates): string => {
  const rate = rateFor(currency, rates)
  return formatAmount(rate, currency, rate >= LARGE_RATE ? LARGE_RATE_DECIMALS : RATE_DECIMALS)
}
