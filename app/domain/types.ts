/** The four games the campaign sells. Everything in the catalogue belongs to one of them. */
export type GameLine = 'legacy' | 'og' | 'lockdown' | 'retaliation'

/** One per "Include …" switch. */
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
export type CurrencyCode = 'EUR' | 'USD' | 'GBP'
export type ThemeName = 'nemesis' | 'lockdown'

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
  readonly edition: Edition
  readonly lines: Readonly<Record<GameLine, boolean>>
  readonly extras: Readonly<Record<ExtraTag, boolean>>
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
