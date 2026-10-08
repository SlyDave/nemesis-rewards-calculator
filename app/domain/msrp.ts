import { getProduct } from './catalog'
import { priceRiseSince } from './inflation'

import type { Product } from './catalog'
import type { Cents } from './types'

/**
 * What each item would cost at retail: its MSRP, or the nearest thing to one there is.
 *
 * Gamefound's catalogue has no such figure, so this is put together by hand, in this order:
 *
 * 1. The retail MSRP the Nemesis Legacy campaign states. It does so in a graphic on its
 *    project page, and only for the Core Box and the Stretch Goals.
 * 2. Failing that, what an earlier campaign said of the item, brought up to today's money
 *    (inflation.ts): a retail MSRP where that campaign stated one — Retaliation's did, for
 *    its own Core Box and Stretch Goals — and otherwise the price it sold the item at. The
 *    campaign taken is the first of the three to have sold the item by itself.
 * 3. Failing that too — for everything that is new with Legacy, and the few older items no
 *    earlier campaign priced — an assumption: the price in this campaign, before any bundle
 *    discount, and half as much again (ASSUMED_UPLIFT). It is always shown as an assumption.
 *
 * An earlier figure is turned into euros at the European Central Bank's reference rate of
 * the day it dates from, and only then raised by inflation.
 */

/** An earlier Gamefound project, as far as its prices are concerned. */
export interface EarlierCampaign {
  readonly name: string
  readonly url: string
  /**
   * The day its prices date from: for a crowdfunding campaign, the day it opened; for a
   * pledge manager, which has no opening day, the day Gamefound published it.
   */
  readonly date: string
  readonly currency: 'GBP' | 'USD'
  /** Units of that currency to the euro on that day (ECB reference rate). */
  readonly perEuro: number
}

type CampaignId = 'nemesis' | 'lockdown' | 'retaliation'

const CAMPAIGNS: Readonly<Record<CampaignId, EarlierCampaign>> = {
  nemesis: {
    name: 'Nemesis pledge manager',
    url: 'https://gamefound.com/en/projects/awaken-realms/nemesis',
    date: '2018-09-12',
    currency: 'GBP',
    perEuro: 0.89028,
  },
  lockdown: {
    name: 'Nemesis Lockdown pledge manager',
    url: 'https://gamefound.com/en/projects/awaken-realms/nemesis-lockdown',
    date: '2020-08-25',
    currency: 'GBP',
    perEuro: 0.89945,
  },
  retaliation: {
    name: 'Nemesis Retaliation campaign',
    url: 'https://gamefound.com/en/projects/awaken-realms/nemesis-retaliation',
    date: '2023-11-23',
    currency: 'USD',
    perEuro: 1.09,
  },
}

type Source =
  /** A retail MSRP in euros, stated by this campaign. */
  | { readonly kind: 'stated'; readonly euros: number }
  /** A figure from an earlier campaign, in its own currency. */
  | {
      readonly kind: 'earlier'
      readonly campaign: CampaignId
      readonly amount: number
      /** Whether that campaign gave it as a retail MSRP, rather than as its own price. */
      readonly isMsrp: boolean
    }
  /** Nothing of its own: the earlier figure for another item already covers it. */
  | { readonly kind: 'with'; readonly id: number }

const stated = (euros: number): Source => ({ kind: 'stated', euros })

const price = (campaign: CampaignId, amount: number): Source => ({
  kind: 'earlier',
  campaign,
  amount,
  isMsrp: false,
})

const msrp = (campaign: CampaignId, amount: number): Source => ({
  kind: 'earlier',
  campaign,
  amount,
  isMsrp: true,
})

const countedWith = (id: number): Source => ({ kind: 'with', id })

/**
 * By Gamefound product id. An item not listed has no figure anywhere but this campaign's
 * price. The name each figure was found under is noted where it differs from today's.
 */
const SOURCES: Readonly<Record<number, Source>> = {
  // --- Nemesis Legacy: "RETAIL MSRP: €199" and "SAVE €99 [RETAIL MSRP]" on the project page.
  120365: stated(199), // Core Box (Special Edition)
  125532: stated(99), // Stretch Goals (Special Edition)

  // --- Nemesis (the original) ---------------------------------------------------------------
  // "Core Box Pledge: Nemesis Core Box including all unlocked Stretch Goals" — one price for
  // the box and what has since become the Stretch Goals box inside the pledges.
  125508: price('nemesis', 70),
  125509: countedWith(125508),
  125198: price('lockdown', 23), // Aftermath Expansion
  125203: price('lockdown', 31), // Voidseeders Expansion
  125204: price('nemesis', 30), // Carnomorph Expansion
  125205: price('nemesis', 7.5), // Medic Character Pack
  125206: price('nemesis', 20), // Terrain Expansion
  125233: price('retaliation', 35), // Nemesis Constructs Pack
  125215: price('lockdown', 6.5), // Untold Stories #1
  125216: price('lockdown', 6.5), // Untold Stories #2
  125224: price('lockdown', 3.93), // "Nemesis: Dice Tower 2019 Promo Cards"
  125225: price('retaliation', 5), // "Nemesis: Feat Promo Cards"
  125226: price('retaliation', 5), // "Nemesis: Blood Tests Deck"
  125227: price('retaliation', 5), // "Nemesis: Achievements"
  125513: price('retaliation', 20), // "Nemesis: Promos Bundle"
  125214: price('nemesis', 30), // "Alien Kings set"
  125213: price('nemesis', 15), // Space Cats collection
  125217: price('lockdown', 20), // Nemesis Playmat
  125218: price('lockdown', 9.5), // Dice Tray
  125220: price('nemesis', 15), // "Artbook"
  125221: price('nemesis', 11), // "Card protectors (Core box only)"
  125222: price('lockdown', 10), // "Nemesis Addons Sleeves"
  125232: price('retaliation', 19), // "Acrylic Pack for original Nemesis"
  125230: price('lockdown', 15), // "Plush Cat"
  125234: price('lockdown', 30), // "Nemesis Hoodie Space Cat"

  // --- Nemesis Lockdown ---------------------------------------------------------------------
  // "Nemesis Lockdown Pledge … including all unlocked Stretch Goals": again one price for both.
  125515: price('lockdown', 95),
  125516: countedWith(125515),
  125236: price('retaliation', 49), // Nemesis Lockdown Stretch Goals, sold on their own
  125239: price('lockdown', 20), // Nemesis Lockdown Playmat
  125244: price('retaliation', 16), // "Acrylic Pack for Nemesis Lockdown"
  125237: price('lockdown', 8), // "Nemesis Lockdown New Cats"
  125238: price('lockdown', 13), // "Nemesis Lockdown New Kings"
  125240: price('lockdown', 15), // Nemesis Lockdown Artbook
  125241: price('retaliation', 5), // "Nemesis Lockdown Dice Tower 2021 Promo Cards"
  125242: price('lockdown', 15.5), // "Nemesis Lockdown Sleeves"
  125245: price('lockdown', 30), // "Nemesis Hoodie Space Racoon"

  // --- Nemesis Retaliation: "RETAIL MSRP: $189" and "SAVE $109 [RETAIL MSRP]" on its page.
  125525: msrp('retaliation', 189), // Core Box (Special Edition)
  125526: msrp('retaliation', 109), // Stretch Goals (Special Edition)
  125249: price('retaliation', 45), // The Sangrevores
  125250: price('retaliation', 17), // The Xyrians
  125251: price('retaliation', 16), // Support Squad Expansion
  125260: price('retaliation', 9), // Untold Stories #4
  125252: price('retaliation', 39), // Terrain Pack for Nemesis Retaliation
  125253: price('retaliation', 9), // Alternative Queen miniature
  125255: price('retaliation', 25), // New Kings & Queen
  125256: price('retaliation', 15), // The Classic Crew Expansion
  125254: price('retaliation', 19), // Nemesis Retaliation Cats
  125257: price('retaliation', 14), // Acrylic Pack
  125258: price('retaliation', 8), // Acrylic Pack (Stretch Goals)
  125259: price('retaliation', 8), // Acrylic Pack (Add-ons)
  125263: price('retaliation', 23), // Playmat
  125264: price('retaliation', 16), // Artbook
  125261: price('retaliation', 12), // Sleeves
  125262: price('retaliation', 4), // Sleeves (add-ons)
  125265: price('retaliation', 15), // Space Platypus Plushie
  125266: price('retaliation', 35), // Space Platypus Hoodie
}

/** Where a figure comes from, from the surest to the least. */
export type MsrpBasis =
  /** A retail MSRP this campaign states. */
  | 'stated'
  /** A retail MSRP an earlier campaign stated, raised by inflation. */
  | 'earlierMsrp'
  /** The price in an earlier campaign, raised by inflation. */
  | 'earlierPrice'
  /** No figure anywhere: this campaign's own price with an assumed uplift on it. */
  | 'assumed'
  /** Counted in another item's figure. */
  | 'counted'

/** An earlier figure, and how it was brought up to date. */
export interface EarlierFigure {
  readonly campaign: EarlierCampaign
  /** As it was given, in that campaign's currency. */
  readonly amount: number
  /** In euros, at the rate of the day. */
  readonly euros: Cents
  /** What inflation since has multiplied it by. */
  readonly rise: number
}

/** One item's retail price, and how it was arrived at. */
export interface ItemMsrp {
  readonly product: Product
  /** In today's euros. */
  readonly amount: Cents
  readonly basis: MsrpBasis
  readonly earlier: EarlierFigure | null
  /** The item whose figure covers this one, for one that has none of its own. */
  readonly countedWith: Product | null
}

const CENTS_PER_UNIT = 100

/**
 * What is added to this campaign's price to stand for a retail price, where none is published
 * anywhere: half as much again. An assumption, and the page says so wherever it is used.
 */
export const ASSUMED_UPLIFT = 0.5

/** A time a campaign put a retail MSRP beside its own price for the same thing. */
export interface StatedUplift {
  readonly campaign: string
  /** How far the retail MSRP stood above the campaign's price: 0.5 is half as much again. */
  readonly uplift: number
}

const upliftOf = (campaignPrice: number, retail: number): number => retail / campaignPrice - 1

/**
 * What the assumption rests on, and all it rests on: the only two times a campaign has done
 * so. Both are for a Core Box, and both set the whole pledge's price against it, the Stretch
 * Goals being called free. Half as much again is a little under either.
 */
export const STATED_UPLIFTS: readonly StatedUplift[] = [
  // "CORE BOX SPECIAL EDITION €129 … RETAIL MSRP: €199", on the Legacy project page.
  { campaign: 'Nemesis Legacy', uplift: upliftOf(129, 199) },
  // "CORE BOX SPECIAL EDITION $109 … RETAIL MSRP: $189", on the Retaliation project page.
  { campaign: 'Nemesis Retaliation', uplift: upliftOf(109, 189) },
]

const fromSource = (product: Product, source: Source | undefined): ItemMsrp => {
  if (source === undefined) {
    return {
      product,
      amount: Math.round(product.price * (1 + ASSUMED_UPLIFT)),
      basis: 'assumed',
      earlier: null,
      countedWith: null,
    }
  }
  switch (source.kind) {
    case 'stated':
      return {
        product,
        amount: Math.round(source.euros * CENTS_PER_UNIT),
        basis: 'stated',
        earlier: null,
        countedWith: null,
      }
    case 'with':
      return {
        product,
        amount: 0,
        basis: 'counted',
        earlier: null,
        countedWith: getProduct(source.id),
      }
    case 'earlier': {
      const campaign = CAMPAIGNS[source.campaign]
      const euros = Math.round((source.amount / campaign.perEuro) * CENTS_PER_UNIT)
      const rise = priceRiseSince(campaign.date).factor
      return {
        product,
        amount: Math.round(euros * rise),
        basis: source.isMsrp ? 'earlierMsrp' : 'earlierPrice',
        earlier: { campaign, amount: source.amount, euros, rise },
        countedWith: null,
      }
    }
  }
}

/** The ids this file has a figure for; for the tests, which hold them to the catalogue. */
export const MSRP_SOURCE_IDS: readonly number[] = Object.keys(SOURCES).map(Number)

/** What a single item would cost at retail. */
export const msrpOf = (product: Product): ItemMsrp => fromSource(product, SOURCES[product.id])
