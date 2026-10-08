import type { CurrencyCode, RegionId } from './types'

/**
 * Where an order can go: which row of the shipping table it falls in, and what tax the
 * campaign adds for it.
 *
 * Every campaign price is net of tax. Awaken Realms publish the territories they collect VAT
 * for at checkout (the EU and the UK), and say that Canadian GST/HST and US sales tax are
 * collected later, in the pledge manager. The rates themselves are each country's standard
 * rate, which is what a board game is charged at; the visitor can correct the rate, since
 * rates change and a few places (US states, Canadian provinces) have more than one.
 */

export type TaxCollection =
  /** Added by Gamefound when pledging. */
  | 'checkout'
  /** Added later, when the pledge manager opens. */
  | 'pledgeManager'
  /** Not collected by the campaign at all. */
  | 'none'

export interface Destination {
  readonly code: string
  readonly name: string
  readonly region: RegionId
  /**
   * The money spent there. It is why the currency is offered at all (currencies.ts); the
   * catch-alls, which are no one place, are given the euro the campaign charges in.
   */
  readonly currency: CurrencyCode
  readonly taxName: string
  /** Percent. */
  readonly taxRate: number
  readonly collection: TaxCollection
  readonly note?: string
}

const vat = (
  code: string,
  name: string,
  taxRate: number,
  currency: CurrencyCode = 'EUR',
  region: RegionId = 'eu',
): Destination => ({
  code,
  name,
  region,
  currency,
  taxName: 'VAT',
  taxRate,
  collection: 'checkout',
})

const IMPORT_NOTE =
  'The campaign collects no tax for this destination. Import VAT, GST or duty may be charged on delivery.'

const untaxed = (
  code: string,
  name: string,
  region: RegionId,
  currency: CurrencyCode = 'EUR',
): Destination => ({
  code,
  name,
  region,
  currency,
  taxName: 'Tax',
  taxRate: 0,
  collection: 'none',
  note: IMPORT_NOTE,
})

export const DESTINATIONS: readonly Destination[] = [
  vat('GB', 'United Kingdom', 20, 'GBP', 'uk'),
  vat('PL', 'Poland', 23, 'PLN', 'poland'),

  vat('AT', 'Austria', 20),
  vat('BE', 'Belgium', 21),
  vat('BG', 'Bulgaria', 20),
  vat('HR', 'Croatia', 25),
  vat('CY', 'Cyprus', 19),
  vat('CZ', 'Czech Republic', 21, 'CZK'),
  vat('DK', 'Denmark', 25, 'DKK'),
  vat('EE', 'Estonia', 24),
  vat('FI', 'Finland', 25.5),
  vat('FR', 'France', 20),
  vat('DE', 'Germany', 19),
  vat('GR', 'Greece', 24),
  vat('HU', 'Hungary', 27, 'HUF'),
  vat('IE', 'Ireland', 23),
  vat('IT', 'Italy', 22),
  vat('LV', 'Latvia', 21),
  vat('LT', 'Lithuania', 21),
  vat('LU', 'Luxembourg', 17),
  vat('MT', 'Malta', 18),
  vat('MC', 'Monaco', 20),
  vat('NL', 'Netherlands', 21),
  vat('PT', 'Portugal', 23),
  vat('RO', 'Romania', 21, 'RON'),
  vat('SK', 'Slovakia', 23),
  vat('SI', 'Slovenia', 22),
  vat('ES', 'Spain', 21),
  vat('SE', 'Sweden', 25, 'SEK'),

  untaxed('NO', 'Norway', 'restOfEurope', 'NOK'),
  untaxed('CH', 'Switzerland', 'restOfEurope', 'CHF'),
  untaxed('IS', 'Iceland', 'restOfEurope', 'ISK'),
  untaxed('XE', 'Rest of Europe', 'restOfEurope'),

  {
    code: 'US',
    name: 'United States',
    region: 'usa',
    currency: 'USD',
    taxName: 'Sales tax',
    taxRate: 0,
    collection: 'pledgeManager',
    note: 'Sales tax is collected in the pledge manager for most states, at your state’s rate — enter it here to include it. US prices do not allow for import tariffs.',
  },
  {
    code: 'CA',
    name: 'Canada',
    region: 'canada',
    currency: 'CAD',
    taxName: 'GST/HST',
    taxRate: 5,
    collection: 'pledgeManager',
    note: 'GST/HST is collected in the pledge manager: 5% GST, or 13–15% HST in the provinces that have it.',
  },

  untaxed('AU', 'Australia', 'anzo', 'AUD'),
  untaxed('NZ', 'New Zealand', 'anzo', 'NZD'),
  untaxed('XO', 'Rest of Oceania', 'anzo'),

  untaxed('CN', 'China', 'asia1', 'CNY'),
  untaxed('HK', 'Hong Kong', 'asia1', 'HKD'),
  untaxed('MO', 'Macau', 'asia1', 'MOP'),

  untaxed('JP', 'Japan', 'asia2', 'JPY'),
  untaxed('KR', 'South Korea', 'asia2', 'KRW'),
  untaxed('TW', 'Taiwan', 'asia2', 'TWD'),
  untaxed('SG', 'Singapore', 'asia2', 'SGD'),
  untaxed('MY', 'Malaysia', 'asia2', 'MYR'),
  untaxed('TH', 'Thailand', 'asia2', 'THB'),
  untaxed('VN', 'Vietnam', 'asia2', 'VND'),
  untaxed('PH', 'Philippines', 'asia2', 'PHP'),
  untaxed('ID', 'Indonesia', 'asia2', 'IDR'),

  untaxed('XW', 'Rest of the world', 'restOfWorld'),
]

export const DEFAULT_DESTINATION = 'GB'

export const REGION_NAMES: Readonly<Record<RegionId, string>> = {
  eu: 'EU',
  restOfEurope: 'Rest of Europe',
  usa: 'USA',
  canada: 'Canada',
  anzo: 'Australia, New Zealand & Oceania',
  asia1: 'Asia 1',
  asia2: 'Asia 2',
  restOfWorld: 'Rest of the world',
  poland: 'Poland',
  uk: 'UK',
}

const destinationsByCode: ReadonlyMap<string, Destination> = new Map(
  DESTINATIONS.map((destination) => [destination.code, destination]),
)

export const findDestination = (code: string): Destination | undefined =>
  destinationsByCode.get(code)

/** The destination for a code, or the default one for a code this list does not have. */
export const destinationFor = (code: string): Destination => {
  const destination = destinationsByCode.get(code) ?? destinationsByCode.get(DEFAULT_DESTINATION)
  if (destination === undefined) {
    throw new Error('The destinations list has lost its default')
  }
  return destination
}
