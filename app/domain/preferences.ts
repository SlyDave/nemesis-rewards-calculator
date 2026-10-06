import { findRequirement } from './classification'
import { DEFAULT_DESTINATION, findDestination } from './destinations'

import type {
  CurrencyCode,
  Edition,
  ExtraTag,
  Finish,
  GameLine,
  Preferences,
  ShippingMode,
} from './types'

/** The games, in the order they are offered. Legacy is the campaign; the rest are reprints. */
export const LINES: readonly {
  readonly line: GameLine
  readonly label: string
  readonly description: string
  readonly icon: string
}[] = [
  {
    line: 'legacy',
    label: 'Nemesis Legacy',
    description: 'The new campaign game this crowdfunding is for.',
    icon: 'i-fa-legacy',
  },
  {
    line: 'retaliation',
    label: 'Nemesis Retaliation',
    description: 'Core Box and Stretch Goals, with miniatures.',
    icon: 'i-fa-retaliation',
  },
  {
    line: 'lockdown',
    label: 'Nemesis Lockdown',
    description: 'Core Box and Stretch Goals, with miniatures.',
    icon: 'i-fa-lockdown',
  },
  {
    line: 'og',
    label: 'Nemesis OG',
    description: 'The original, with Aftermath and Void Seeders.',
    icon: 'i-fa-og',
  },
]

/** The extras, one switch each. Each applies to every game that is included. */
export const EXTRAS: readonly {
  readonly tag: ExtraTag
  readonly label: string
  readonly icon: string
}[] = [
  { tag: 'gameplay', label: 'Expansions', icon: 'i-fa-gameplay' },
  { tag: 'acrylic', label: 'Acrylic Packs', icon: 'i-fa-acrylic' },
  { tag: 'playmat', label: 'Playmat(s)', icon: 'i-fa-playmat' },
  { tag: 'artbook', label: 'Artbook(s)', icon: 'i-fa-artbook' },
  { tag: 'synthetic', label: 'Synthetic Cards', icon: 'i-fa-synthetic' },
  { tag: 'sleeves', label: 'Sleeves', icon: 'i-fa-sleeves' },
  { tag: 'terrain', label: 'Terrain Pack(s)', icon: 'i-fa-terrain' },
  { tag: 'untold', label: 'Untold Stories', icon: 'i-fa-untold' },
  { tag: 'promo', label: 'Promo Cards', icon: 'i-fa-promo' },
  { tag: 'bigbox', label: 'BIG BOX(es)', icon: 'i-fa-bigbox' },
  { tag: 'sculpts', label: 'Alternative Sculpts', icon: 'i-fa-sculpts' },
  { tag: 'cats', label: 'Cats', icon: 'i-fa-cats' },
  { tag: 'hoodie', label: 'Hoodies', icon: 'i-fa-hoodie' },
  { tag: 'dicetray', label: 'Dice Tray', icon: 'i-fa-dicetray' },
  { tag: 'plush', label: 'Plushes', icon: 'i-fa-plush' },
]

const EDITIONS: readonly Edition[] = ['standard', 'special']
const FINISHES: readonly Finish[] = ['plain', 'sundrop', 'painted']
const SHIPPING_MODES: readonly ShippingMode[] = ['split', 'single']
export const CURRENCIES: readonly CurrencyCode[] = ['EUR', 'USD', 'GBP']

export const DEFAULT_PREFERENCES: Preferences = {
  returningBacker: false,
  edition: 'special',
  lines: { legacy: true, retaliation: false, lockdown: false, og: false },
  extras: {
    gameplay: false,
    acrylic: false,
    playmat: false,
    artbook: false,
    synthetic: false,
    sleeves: false,
    terrain: false,
    untold: false,
    promo: false,
    bigbox: false,
    sculpts: false,
    cats: false,
    hoodie: false,
    dicetray: false,
    plush: false,
  },
  overrides: {},
  finish: 'plain',
  shipping: 'split',
  includeTax: true,
  destination: DEFAULT_DESTINATION,
  taxRate: null,
  currency: 'EUR',
}

/*
 * The preferences as a short string, for the address bar and for remembering between visits:
 * the on/off and either/or choices packed into one number, then the destination, the currency
 * and any corrected tax rate — "9x2k-GB-GBP-20". Where single items have been picked out
 * against their category, two more parts list them, taken then left — "…-2oo8.2onz-2oo4".
 */

const SEPARATOR = '-'
const LIST_SEPARATOR = '.'
const RADIX = 36
const MAX_TAX_RATE = 100

/** The either/or and on/off choices, in the order their bits are packed. Append, never reorder. */
const flags = (preferences: Preferences): readonly boolean[] => [
  preferences.edition === 'special',
  preferences.shipping === 'single',
  preferences.includeTax,
  ...LINES.map(({ line }) => preferences.lines[line]),
  ...EXTRAS.map(({ tag }) => preferences.extras[tag]),
  preferences.returningBacker,
]

const FINISH_BASE = FINISHES.length

export const encodePreferences = (preferences: Preferences): string => {
  let bits = 0
  for (const flag of [...flags(preferences)].reverse()) {
    bits = bits * 2 + (flag ? 1 : 0)
  }
  const packed = bits * FINISH_BASE + FINISHES.indexOf(preferences.finish)
  const parts = [
    packed.toString(RADIX),
    preferences.destination,
    preferences.currency,
    preferences.taxRate === null ? '' : String(preferences.taxRate),
  ]

  const picks = Object.entries(preferences.overrides)
  if (picks.length > 0) {
    const list = (wanted: boolean): string =>
      picks
        .filter(([, value]) => value === wanted)
        .map(([id]) => Number(id))
        .sort((a, b) => a - b)
        .map((id) => id.toString(RADIX))
        .join(LIST_SEPARATOR)
    parts.push(list(true), list(false))
  }
  return parts.join(SEPARATOR)
}

/**
 * Reads one of the lists of picked-out items; null if it is not a list of numbers. Ids the
 * catalogue no longer has, or that are not extras, are dropped rather than refused: a link
 * should outlive a product being withdrawn.
 */
const decodeList = (text: string | undefined): readonly number[] | null => {
  if (text === undefined || text === '') {
    return []
  }
  const parts = text.split(LIST_SEPARATOR)
  if (!parts.every((part) => /^[0-9a-z]+$/.test(part))) {
    return null
  }
  return parts
    .map((part) => Number.parseInt(part, RADIX))
    .filter((id) => {
      const requirement = findRequirement(id)
      return requirement !== undefined && requirement.tag !== 'core'
    })
}

const isCurrency = (value: string): value is CurrencyCode =>
  (CURRENCIES as readonly string[]).includes(value)

/** Reads a string written by encodePreferences; null for anything else. */
export const decodePreferences = (code: string): Preferences | null => {
  const [packedText, destination, currency, taxText, takenText, leftText, ...surplus] =
    code.split(SEPARATOR)
  if (
    packedText === undefined ||
    destination === undefined ||
    currency === undefined ||
    taxText === undefined ||
    // The two lists of picked-out items come together or not at all.
    (takenText === undefined) !== (leftText === undefined) ||
    surplus.length > 0
  ) {
    return null
  }

  const packed = Number.parseInt(packedText, RADIX)
  if (!/^[0-9a-z]+$/.test(packedText) || !Number.isSafeInteger(packed)) {
    return null
  }
  const finish = FINISHES[packed % FINISH_BASE]
  let bits = Math.floor(packed / FINISH_BASE)
  const next = (): boolean => {
    const flag = bits % 2 === 1
    bits = Math.floor(bits / 2)
    return flag
  }

  const edition = EDITIONS[next() ? 1 : 0]
  const shipping = SHIPPING_MODES[next() ? 1 : 0]
  const includeTax = next()
  const lines = { ...DEFAULT_PREFERENCES.lines }
  for (const { line } of LINES) {
    lines[line] = next()
  }
  const extras = { ...DEFAULT_PREFERENCES.extras }
  for (const { tag } of EXTRAS) {
    extras[tag] = next()
  }
  const returningBacker = next()

  const taken = decodeList(takenText)
  const left = decodeList(leftText)
  const taxRate = taxText === '' ? null : Number(taxText)
  if (
    taken === null ||
    left === null ||
    finish === undefined ||
    edition === undefined ||
    shipping === undefined ||
    bits !== 0 ||
    findDestination(destination) === undefined ||
    !isCurrency(currency) ||
    (taxRate !== null && !(taxRate >= 0 && taxRate <= MAX_TAX_RATE))
  ) {
    return null
  }

  const overrides: Record<number, boolean> = {}
  for (const id of left) {
    overrides[id] = false
  }
  for (const id of taken) {
    overrides[id] = true
  }

  return {
    returningBacker,
    edition,
    lines,
    extras,
    overrides,
    finish,
    shipping,
    includeTax,
    destination,
    taxRate,
    currency,
  }
}
