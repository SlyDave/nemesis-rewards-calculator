import { toCents } from './catalog'

import type { Product } from './catalog'
import type { Cents, RegionId, ShippingMode } from './types'

/**
 * The campaign's shipping table, read off the "Estimated shipping" graphic on the project
 * page (it is published as an image, so there is nothing to scrape it from).
 *
 * It prices *pledges* only. The same graphic says "shipping prices for add-ons will be
 * calculated in pledge manager", so an add-on bought on its own has no shipping price yet,
 * and none is invented for it here.
 */

type Row = Readonly<Record<RegionId, Cents>>

/** In the order the table lists them, in euros. */
const row = (
  ...[eu, restOfEurope, usa, canada, anzo, asia1, asia2, restOfWorld, poland, uk]: readonly [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ]
): Row => ({
  eu: toCents(eu),
  restOfEurope: toCents(restOfEurope),
  usa: toCents(usa),
  canada: toCents(canada),
  anzo: toCents(anzo),
  asia1: toCents(asia1),
  asia2: toCents(asia2),
  restOfWorld: toCents(restOfWorld),
  poland: toCents(poland),
  uk: toCents(uk),
})

/**
 * What a pledge costs to ship. The Legacy pledges and the four-game bundle are cheaper sent
 * in one go; the three older games only ever ship once, so they have a single price.
 */
type Tier = Readonly<Record<ShippingMode, Row>>

const once = (prices: Row): Tier => ({ split: prices, single: prices })

const LEGACY_CORE: Tier = {
  split: row(38, 56, 39, 49, 49, 49, 99, 99, 18, 39),
  single: row(26, 38, 28, 35, 35, 35, 69, 69, 12, 27),
}
const LEGACY_COLLECTOR: Tier = {
  split: row(47, 69, 52, 65, 65, 65, 119, 119, 22, 49),
  single: row(32, 47, 35, 43, 43, 43, 85, 85, 15, 33),
}
const LEGACY_SALVATION: Tier = {
  split: row(55, 79, 59, 75, 75, 75, 129, 129, 25, 57),
  single: row(35, 51, 38, 47, 47, 47, 89, 89, 16, 36),
}
const FOUR_CORE: Tier = {
  split: row(93, 135, 99, 119, 119, 119, 239, 239, 39, 97),
  single: row(73, 107, 79, 99, 99, 99, 188, 188, 32, 76),
}

const CORE = once(row(23, 33, 25, 29, 29, 29, 59, 59, 9, 24))
const OG_COLLECTOR_CAPTAIN = once(row(32, 47, 35, 43, 43, 43, 85, 85, 15, 33))
const OG_INTRUDER = once(row(39, 57, 42, 52, 52, 52, 99, 99, 18, 40))
const LOCKDOWN_COLLECTOR = once(row(28, 41, 30, 38, 38, 38, 75, 75, 13, 29))
const LOCKDOWN_MARTIAN = once(row(31, 45, 33, 41, 41, 41, 79, 79, 14, 32))
const RETALIATION_COLLECTOR_MILITARY = once(row(31, 45, 33, 41, 41, 41, 79, 79, 14, 32))
const RETALIATION_VETERAN = once(row(39, 57, 42, 52, 52, 52, 99, 99, 18, 40))

/** Gamefound product id -> the table column that prices it. */
const TIERS: Readonly<Record<number, Tier>> = {
  125535: LEGACY_CORE, // Core Pledge (Standard Edition)
  120364: LEGACY_CORE, // Core Pledge (Special Edition)
  125557: LEGACY_COLLECTOR,
  125558: LEGACY_SALVATION,
  125606: FOUR_CORE,

  125507: CORE, // Nemesis OG pledge
  125510: OG_COLLECTOR_CAPTAIN, // Collector's
  125511: OG_COLLECTOR_CAPTAIN, // Captain's
  125512: OG_INTRUDER,

  125514: CORE, // Lockdown pledge
  125519: LOCKDOWN_COLLECTOR,
  125522: LOCKDOWN_MARTIAN,

  125523: CORE, // Retaliation pledge
  125527: RETALIATION_COLLECTOR_MILITARY, // Collector's
  125528: RETALIATION_COLLECTOR_MILITARY, // Military
  125529: RETALIATION_VETERAN,
}

/** A pledge's shipping price, or null for anything the table does not price (the add-ons). */
export const shippingOf = (product: Product, region: RegionId, mode: ShippingMode): Cents | null =>
  TIERS[product.id]?.[mode][region] ?? null

/** Whether a set is one of the pledges the shipping table names. */
export const hasShippingTier = (productId: number): boolean => productId in TIERS

export const WAVE_ONE = 'Q4 2027'
export const WAVE_TWO = 'Q3 2028'

/** When things arrive, which depends on what is ordered as well as on the mode chosen. */
export const describeWaves = (
  mode: ShippingMode,
  content: {
    /** Anything of Legacy's at all: its pledge, or only add-ons for it. */
    readonly legacy: boolean
    /** The Legacy pledge itself, whose Core Box goes out ahead of the rest of it. */
    readonly legacyCore: boolean
    readonly older: boolean
  },
): string => {
  if (!content.legacy) {
    return `Everything ships together in the 1st wave (${WAVE_ONE}).`
  }
  // Legacy add-ons with nothing to go ahead of them are a single shipment whatever the mode.
  if (mode === 'single' || (!content.legacyCore && !content.older)) {
    return `Everything ships together in the 2nd wave (${WAVE_TWO}).`
  }
  if (!content.legacyCore) {
    return `The older games ship in the 1st wave (${WAVE_ONE}); the Legacy add-ons follow in the 2nd (${WAVE_TWO}).`
  }
  const first = content.older
    ? 'The older games and the Legacy Core Box ship'
    : 'The Legacy Core Box ships'
  return `${first} in the 1st wave (${WAVE_ONE}); the Legacy stretch goals and add-ons follow in the 2nd (${WAVE_TWO}).`
}
