import { REQUIREMENTS, isOffered } from './classification'
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
    label: 'Include Nemesis Legacy',
    description: 'The new campaign game this crowdfunding is for.',
    icon: 'i-fa-legacy',
  },
  {
    line: 'retaliation',
    label: 'Include Nemesis Retaliation',
    description: 'Core Box and Stretch Goals, with miniatures.',
    icon: 'i-fa-retaliation',
  },
  {
    line: 'lockdown',
    label: 'Include Nemesis Lockdown',
    description: 'Core Box and Stretch Goals, with miniatures.',
    icon: 'i-fa-lockdown',
  },
  {
    line: 'og',
    label: 'Include Nemesis OG',
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
  { tag: 'gameplay', label: 'Include Gameplay Expansions', icon: 'i-fa-gameplay' },
  { tag: 'acrylic', label: 'Include Acrylic Packs', icon: 'i-fa-acrylic' },
  { tag: 'playmat', label: 'Include Playmat(s)', icon: 'i-fa-playmat' },
  { tag: 'artbook', label: 'Include Artbook(s)', icon: 'i-fa-artbook' },
  { tag: 'synthetic', label: 'Include Synthetic Cards', icon: 'i-fa-synthetic' },
  { tag: 'sleeves', label: 'Include Sleeves', icon: 'i-fa-sleeves' },
  { tag: 'terrain', label: 'Include Terrain Pack(s)', icon: 'i-fa-terrain' },
  { tag: 'untold', label: 'Include Untold Stories', icon: 'i-fa-untold' },
  { tag: 'promo', label: 'Include Promo Cards', icon: 'i-fa-promo' },
  { tag: 'bigbox', label: 'Include BIG BOX(es)', icon: 'i-fa-bigbox' },
  { tag: 'sculpts', label: 'Include Alternative Sculpts', icon: 'i-fa-sculpts' },
  { tag: 'cats', label: 'Include Cats', icon: 'i-fa-cats' },
  { tag: 'hoodie', label: 'Include Hoodies', icon: 'i-fa-hoodie' },
  { tag: 'dicetray', label: 'Include Dice Tray', icon: 'i-fa-dicetray' },
  { tag: 'plush', label: 'Include Plushes', icon: 'i-fa-plush' },
]

const EDITIONS: readonly Edition[] = ['standard', 'special']
const FINISHES: readonly Finish[] = ['plain', 'sundrop', 'painted']
const SHIPPING_MODES: readonly ShippingMode[] = ['split', 'single']
export const CURRENCIES: readonly CurrencyCode[] = ['EUR', 'USD', 'GBP']

export const DEFAULT_PREFERENCES: Preferences = {
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
  finish: 'plain',
  shipping: 'split',
  includeTax: true,
  destination: DEFAULT_DESTINATION,
  taxRate: null,
  currency: 'EUR',
}

/** The ids of everything the preferences ask for. */
export const wantedRequirements = (preferences: Preferences): ReadonlySet<number> =>
  new Set(
    REQUIREMENTS.filter(
      (requirement) =>
        isOffered(requirement, preferences.lines) &&
        (requirement.tag === 'core' || preferences.extras[requirement.tag]) &&
        (requirement.needs === undefined || preferences.extras[requirement.needs]) &&
        (requirement.edition === undefined || requirement.edition === preferences.edition),
    ).map((requirement) => requirement.id),
  )

const NONE_OF_EACH: Readonly<Record<ExtraTag, number>> = {
  gameplay: 0,
  acrylic: 0,
  playmat: 0,
  artbook: 0,
  synthetic: 0,
  sleeves: 0,
  terrain: 0,
  untold: 0,
  promo: 0,
  bigbox: 0,
  sculpts: 0,
  cats: 0,
  hoodie: 0,
  dicetray: 0,
  plush: 0,
}

/**
 * How many items each extra's switch stands for, given the games that are included — and,
 * for the extras that only serve the gameplay expansions, whether those are.
 */
export const countExtras = (preferences: Preferences): Readonly<Record<ExtraTag, number>> => {
  const counts: Record<ExtraTag, number> = { ...NONE_OF_EACH }
  for (const requirement of REQUIREMENTS) {
    if (
      requirement.tag !== 'core' &&
      isOffered(requirement, preferences.lines) &&
      (requirement.needs === undefined || preferences.extras[requirement.needs])
    ) {
      counts[requirement.tag] += 1
    }
  }
  return counts
}

/*
 * The preferences as a short string, for the address bar and for remembering between visits:
 * the on/off and either/or choices packed into one number, then the destination, the currency
 * and any corrected tax rate — "9x2k-GB-GBP-20".
 */

const SEPARATOR = '-'
const RADIX = 36
const MAX_TAX_RATE = 100

/** The either/or and on/off choices, in the order their bits are packed. Append, never reorder. */
const flags = (preferences: Preferences): readonly boolean[] => [
  preferences.edition === 'special',
  preferences.shipping === 'single',
  preferences.includeTax,
  ...LINES.map(({ line }) => preferences.lines[line]),
  ...EXTRAS.map(({ tag }) => preferences.extras[tag]),
]

const FINISH_BASE = FINISHES.length

export const encodePreferences = (preferences: Preferences): string => {
  let bits = 0
  for (const flag of [...flags(preferences)].reverse()) {
    bits = bits * 2 + (flag ? 1 : 0)
  }
  const packed = bits * FINISH_BASE + FINISHES.indexOf(preferences.finish)
  return [
    packed.toString(RADIX),
    preferences.destination,
    preferences.currency,
    preferences.taxRate === null ? '' : String(preferences.taxRate),
  ].join(SEPARATOR)
}

const isCurrency = (value: string): value is CurrencyCode =>
  (CURRENCIES as readonly string[]).includes(value)

/** Reads a string written by encodePreferences; null for anything else. */
export const decodePreferences = (code: string): Preferences | null => {
  const [packedText, destination, currency, taxText, ...surplus] = code.split(SEPARATOR)
  if (
    packedText === undefined ||
    destination === undefined ||
    currency === undefined ||
    taxText === undefined ||
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

  const taxRate = taxText === '' ? null : Number(taxText)
  if (
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

  return { edition, lines, extras, finish, shipping, includeTax, destination, taxRate, currency }
}
