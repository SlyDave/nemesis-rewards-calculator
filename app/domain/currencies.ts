import type { CurrencyCode } from './types'

/**
 * The currencies a total can be read in.
 *
 * Gamefound charges in euros and nothing else. Its own currency menu offers a dozen more to
 * read the prices in, which are marked `listed` here; the rest are the currencies of the
 * other places the campaign ships to (destinations.ts), so that anyone it delivers to can
 * read the total in their own money. A test holds the list to exactly those two sources.
 *
 * The symbols are the ones in everyday use where the currency is spent, checked against
 * published lists (XE's currency symbols, Wikipedia's ISO 4217 table) and, for the listed
 * ones, against what Gamefound itself writes. Several are shared — four currencies write
 * "kr", two write "¥" — which is why the menu always shows the code beside the symbol.
 */

/** Where the symbol goes: before the figure, before it with a space, or after it. */
type Placement = 'before' | 'spaced' | 'after'

export interface Currency {
  readonly code: CurrencyCode
  readonly name: string
  readonly symbol: string
  readonly placement: Placement
  /** How many decimal places its amounts are written with. */
  readonly decimals: 0 | 2
  /** Whether Gamefound's own menu offers it; otherwise it is here for a destination. */
  readonly listed: boolean
}

const currency = (
  code: CurrencyCode,
  name: string,
  symbol: string,
  options: { placement?: Placement; decimals?: 0 | 2; listed?: boolean } = {},
): Currency => ({
  code,
  name,
  symbol,
  placement: options.placement ?? 'before',
  decimals: options.decimals ?? 2,
  listed: options.listed ?? false,
})

const LISTED = { listed: true } as const

/** The euro first, as what is charged; then the dollar and the pound; then the rest by name. */
export const CURRENCIES: readonly Currency[] = [
  currency('EUR', 'Euro', '€', LISTED),
  currency('USD', 'US Dollar', '$', LISTED),
  currency('GBP', 'Pound Sterling', '£', LISTED),

  currency('AUD', 'Australian Dollar', 'A$', LISTED),
  currency('CAD', 'Canadian Dollar', 'C$', LISTED),
  currency('CNY', 'Chinese Yuan', '¥'),
  currency('CZK', 'Czech Koruna', 'Kč', { placement: 'after' }),
  currency('DKK', 'Danish Krone', 'kr.', { placement: 'after', listed: true }),
  currency('HKD', 'Hong Kong Dollar', 'HK$', LISTED),
  currency('HUF', 'Hungarian Forint', 'Ft', { placement: 'after', decimals: 0 }),
  currency('ISK', 'Icelandic Króna', 'kr', { placement: 'after', decimals: 0 }),
  currency('IDR', 'Indonesian Rupiah', 'Rp', { placement: 'spaced', decimals: 0 }),
  currency('JPY', 'Japanese Yen', '¥', { decimals: 0 }),
  currency('MOP', 'Macanese Pataca', 'MOP$'),
  currency('MYR', 'Malaysian Ringgit', 'RM'),
  currency('TWD', 'New Taiwan Dollar', 'NT$', { decimals: 0 }),
  currency('NZD', 'New Zealand Dollar', 'NZ$', LISTED),
  currency('NOK', 'Norwegian Krone', 'kr', { placement: 'after', listed: true }),
  currency('PHP', 'Philippine Peso', '₱'),
  currency('PLN', 'Polish Zloty', 'zł', { placement: 'after', listed: true }),
  currency('RON', 'Romanian Leu', 'lei', { placement: 'after' }),
  currency('SGD', 'Singapore Dollar', 'S$', LISTED),
  currency('KRW', 'South Korean Won', '₩', { decimals: 0 }),
  currency('SEK', 'Swedish Krona', 'kr', { placement: 'after', listed: true }),
  currency('CHF', 'Swiss Franc', 'Fr.', { placement: 'spaced', listed: true }),
  currency('THB', 'Thai Baht', '฿'),
  currency('VND', 'Vietnamese Dong', '₫', { placement: 'after', decimals: 0 }),
]

/** How many currencies head the list, ahead of the alphabetical rest. */
export const LEADING_CURRENCIES = 3

export const BASE_CURRENCY: CurrencyCode = 'EUR'

const currenciesByCode: ReadonlyMap<string, Currency> = new Map(
  CURRENCIES.map((entry) => [entry.code, entry]),
)

export const isCurrencyCode = (value: string): value is CurrencyCode => currenciesByCode.has(value)

export const currencyFor = (code: CurrencyCode): Currency => {
  const found = currenciesByCode.get(code)
  if (found === undefined) {
    throw new Error(`No currency ${code}`)
  }
  return found
}

/** Every currency but the euro: the ones that need an exchange rate. */
export type ForeignCurrency = Exclude<CurrencyCode, 'EUR'>

export const FOREIGN_CURRENCIES: readonly ForeignCurrency[] = CURRENCIES.map(
  (entry) => entry.code,
).filter((code): code is ForeignCurrency => code !== BASE_CURRENCY)
