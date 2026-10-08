/** The four games the campaign sells. Everything in the catalogue belongs to one of them. */
export type GameLine = 'legacy' | 'og' | 'lockdown' | 'retaliation'

/** One per extras switch. */
export type ExtraTag =
  | 'gameplay'
  | 'acrylic'
  | 'playmat'
  | 'artbook'
  | 'synthetic'
  | 'sleeves'
  | 'terrain'
  | 'untold'
  | 'promo'
  | 'bigbox'
  | 'sculpts'
  | 'cats'
  | 'hoodie'
  | 'dicetray'
  | 'plush'

/** What a catalogue item is: part of its game's core pledge, or one of the extras. */
export type Tag = 'core' | ExtraTag

export type Edition = 'standard' | 'special'
export type ShippingMode = 'split' | 'single'
export type Finish = 'plain' | 'sundrop' | 'painted'
/** The euro, which is what Gamefound charges, and the currencies a total can be read in. */
export type CurrencyCode =
  | 'EUR'
  | 'USD'
  | 'GBP'
  | 'AUD'
  | 'CAD'
  | 'CHF'
  | 'CNY'
  | 'CZK'
  | 'DKK'
  | 'HKD'
  | 'HUF'
  | 'IDR'
  | 'ISK'
  | 'JPY'
  | 'KRW'
  | 'MOP'
  | 'MYR'
  | 'NOK'
  | 'NZD'
  | 'PHP'
  | 'PLN'
  | 'RON'
  | 'SEK'
  | 'SGD'
  | 'THB'
  | 'TWD'
  | 'VND'
export type ThemeName = 'nemesis' | 'lockdown' | 'retaliation' | 'legacy'

/** The rows of the campaign's shipping table. */
export type RegionId =
  | 'eu'
  | 'restOfEurope'
  | 'usa'
  | 'canada'
  | 'anzo'
  | 'asia1'
  | 'asia2'
  | 'restOfWorld'
  | 'poland'
  | 'uk'

/** Everything the visitor chooses. */
export interface Preferences {
  /** Whether the visitor has backed Nemesis before, which makes the SAM Robot Pack free. */
  readonly returningBacker: boolean
  readonly edition: Edition
  readonly lines: Readonly<Record<GameLine, boolean>>
  readonly extras: Readonly<Record<ExtraTag, boolean>>
  /**
   * Single items picked out against their category's switch, by Gamefound product id: true
   * to take one whose category is off, false to leave one whose category is on.
   */
  readonly overrides: Readonly<Record<number, boolean>>
  readonly finish: Finish
  readonly shipping: ShippingMode
  readonly includeTax: boolean
  /** A code from the destinations list. */
  readonly destination: string
  /** The tax rate in percent; null follows the destination's own. */
  readonly taxRate: number | null
  readonly currency: CurrencyCode
}

/** An amount of money in euro cents, the unit every sum is done in. */
export type Cents = number
