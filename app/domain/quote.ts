import { buyableProducts, getProduct, leavesOf } from './catalog'
import { LEGACY_CORE_BOXES, findRequirement, lineOf, providedBy } from './classification'
import { destinationFor } from './destinations'
import { isGift, priceFor } from './gift'
import { msrpOf } from './msrp'
import { EXTRAS } from './preferences'
import { wantedRequirements } from './selection'
import { SINGLE_SHIPPING_ONLY, describeWaves, shippingFloorOf, shippingOf } from './shipping'
import { solve } from './solver'

import type { Product } from './catalog'
import type { Destination } from './destinations'
import type { ItemMsrp } from './msrp'
import type { ShippingFloor } from './shipping'
import type { Offer } from './solver'
import type { Cents, Finish, GameLine, Preferences, ShippingMode, Tag } from './types'

/** One item inside something in the cart. */
export interface ContentLine {
  readonly product: Product
  /** Whether it is something the visitor asked for, rather than something that came along. */
  readonly wanted: boolean
  /** The surcharge for the chosen miniatures finish; zero where it does not apply. */
  readonly finish: Cents
}

/** One thing to add to the Gamefound cart. */
/** Where a cart line is listed: under one of the games, or after them all. */
export type CartGroup = GameLine | 'other'

export interface CartLine {
  readonly product: Product
  /** What this visitor pays for it, which for a returning backer's gift is nothing. */
  readonly price: Cents
  /** A returning backer's gift: added like the rest, as the one Gamefound lists at nothing. */
  readonly isGift: boolean
  /** Whether it is a pledge — it holds a game's core — rather than an add-on. */
  readonly isPledge: boolean
  readonly group: CartGroup
  readonly contents: readonly ContentLine[]
  /**
   * The published shipping price, or null where there is none yet: for the add-ons, and for
   * the pledges that came after the shipping table.
   */
  readonly shipping: Cents | null
  /**
   * For a pledge the table does not price: the least its shipping can be, which the total
   * counts in its place (shipping.ts). Null for the rest.
   */
  readonly shippingFloor: ShippingFloor | null
  readonly finish: Cents
  /** This line's share of the tax on rewards and finish; all lines add to `rewardsTax`. */
  readonly tax: Cents
}

/** The best combination for a set of preferences, and what it comes to. All sums in euro cents. */
export interface Quote {
  readonly lines: readonly CartLine[]
  /** What the cart's contents list for, before bundle discounts and any gift. */
  readonly listTotal: Cents
  /** What they cost. */
  readonly itemsTotal: Cents
  readonly savings: Cents
  /** What each item in the cart would cost at retail, asked for or not (msrp.ts). */
  readonly msrp: readonly ItemMsrp[]
  readonly msrpTotal: Cents
  /** How far under that the rewards come. Shipping, finish and tax are in neither figure. */
  readonly msrpSavings: Cents
  readonly finishTotal: Cents
  /** The shipping the campaign has published a price for: the pledges'. */
  readonly shippingTotal: Cents
  /** The add-ons in the cart, whose shipping will only be priced in the pledge manager. */
  readonly unpricedShipping: readonly Product[]
  /** The pledges in the cart that the shipping table does not price, having come after it. */
  readonly unpricedPledges: readonly Product[]
  /** A pledge in the cart that is only ever sent as single shipping; null where there is none. */
  readonly singleOnly: Product | null
  /**
   * Whether the order can be sent in two parts: whether it has something for each of the
   * campaign's two shipments, and nothing that must go as one. An order that all goes out
   * together has nothing to split.
   */
  readonly canSplit: boolean
  /** The mode the order is priced in: the one chosen, or single where it cannot be split. */
  readonly shipping: ShippingMode
  readonly waves: string
  readonly destination: Destination
  /** The rate applied, in percent: zero when tax is switched off. */
  readonly taxRate: number
  /** The tax on the rewards, and on the miniatures finish where there is one. */
  readonly rewardsTax: Cents
  /** The tax on the shipping counted. */
  readonly shippingTax: Cents
  /** The two together. */
  readonly taxTotal: Cents
  readonly total: Cents
  /** Items in the cart that nobody asked for, because a bundle was the cheaper way. */
  readonly bonus: readonly Product[]
  /** How many separate items were asked for. */
  readonly wantedCount: number
  /** Wanted items nothing on sale provides. Empty unless the catalogue and the switches disagree. */
  readonly unavailable: readonly number[]
}

const PERCENT = 100

const unique = <T>(values: readonly T[]): readonly T[] => [...new Set(values)]

const finishSurcharge = (product: Product, finish: Finish): Cents => {
  if (product.finish === null || finish === 'plain') {
    return 0
  }
  return product.finish[finish]
}

/** Everything that can go in a cart, as the solver sees it for this destination and mode. */
export const offersFor = (preferences: Preferences): readonly Offer[] => {
  const { region } = destinationFor(preferences.destination)
  return buyableProducts.map((product) => ({
    id: product.id,
    cost: {
      price: priceFor(product, preferences),
      items: 1,
      shipping:
        shippingOf(product, region, preferences.shipping) ??
        shippingFloorOf(product, region, preferences.shipping)?.cents ??
        0,
    },
    provides: unique(leavesOf(product).flatMap((leaf) => providedBy(leaf.id))),
  }))
}

const contentsOf = (
  product: Product,
  wanted: ReadonlySet<number>,
  preferences: Preferences,
): readonly ContentLine[] =>
  leavesOf(product).map((leaf) => {
    const isWanted = providedBy(leaf.id).some((id) => wanted.has(id))
    // Someone who chose standees and got miniatures through a bundle did not ask for them
    // to be upgraded.
    const isOwnEdition =
      findRequirement(leaf.id)?.edition !== 'special' || preferences.edition === 'special'
    return {
      product: leaf,
      wanted: isWanted,
      finish: isWanted && isOwnEdition ? finishSurcharge(leaf, preferences.finish) : 0,
    }
  })

const sum = (values: readonly Cents[]): Cents => values.reduce((total, value) => total + value, 0)

/**
 * Rounds tax per cart line without making the cards disagree with the rewards-tax total.
 * Whole cents go to the largest fractional remainders first, as on an apportioned invoice.
 */
const taxByLine = (amounts: readonly Cents[], rate: number, total: Cents): readonly Cents[] => {
  const exact = amounts.map((amount) => (amount * rate) / PERCENT)
  const taxes = exact.map(Math.floor)
  const pennies = total - sum(taxes)
  const order = exact
    .map((amount, index) => ({ index, remainder: amount - Math.floor(amount) }))
    .sort((a, b) => {
      const byRemainder = b.remainder - a.remainder
      return byRemainder !== 0 ? byRemainder : a.index - b.index
    })
  for (let index = 0; index < pennies; index += 1) {
    const line = order[index]
    if (line !== undefined) {
      taxes[line.index] = (taxes[line.index] ?? 0) + 1
    }
  }
  return taxes
}

/** The games in the order the cart lists them, then whatever belongs to none of them. */
const CART_GROUPS: readonly CartGroup[] = ['legacy', 'retaliation', 'lockdown', 'og', 'other']

/** Within a game: the pledge first, then the extras in the order of their switches. */
const CATEGORY_ORDER: readonly Tag[] = ['core', ...EXTRAS.map(({ tag }) => tag)]

const MERCHANDISE: ReadonlySet<Tag> = new Set<Tag>(['hoodie', 'plush'])

/** The category of a single item, whether it is a requirement itself or stands in for some. */
const tagOf = (leaf: Product): Tag | undefined =>
  providedBy(leaf.id)
    .map((id) => findRequirement(id)?.tag)
    .find((tag) => tag !== undefined)

/**
 * Which of the campaign's two shipments a single item goes out in. By its FAQ and its shipping
 * graphic, the first takes everything from the older games and the Legacy Core Box; the
 * second, the rest of Legacy: its stretch goals and its add-ons.
 */
const waveOf = (leaf: Product): 1 | 2 =>
  lineOf(leaf.id) === 'legacy' && !LEGACY_CORE_BOXES.has(leaf.id) ? 2 : 1

/** Whether a single item is part of the Legacy pledge, rather than an add-on for it. */
const isLegacyCore = (leaf: Product): boolean =>
  lineOf(leaf.id) === 'legacy' && tagOf(leaf) === 'core'

/**
 * The game a product is listed under: the first one it has anything of, so the four-game
 * bundle heads the list with Legacy. Merchandise bought on its own belongs to none.
 */
const groupOf = (product: Product): CartGroup => {
  const leaves = leavesOf(product)
  const isAllMerchandise = leaves.every((leaf) => {
    const tag = tagOf(leaf)
    return tag !== undefined && MERCHANDISE.has(tag)
  })
  if (isAllMerchandise) {
    return 'other'
  }
  const games = new Set(leaves.map((leaf) => lineOf(leaf.id)))
  return CART_GROUPS.find((group) => group !== 'other' && games.has(group)) ?? 'other'
}

/** A product's category: a pledge if it holds any core item, else that of its contents. */
const categoryOf = (product: Product): number => {
  const tags = leavesOf(product).map(tagOf)
  const tag = tags.includes('core') ? 'core' : tags.find((candidate) => candidate !== undefined)
  return tag === undefined ? CATEGORY_ORDER.length : CATEGORY_ORDER.indexOf(tag)
}

/** By game, then by category, then by name. */
const byCartOrder = (a: Product, b: Product): number => {
  const steps = [
    CART_GROUPS.indexOf(groupOf(a)) - CART_GROUPS.indexOf(groupOf(b)),
    categoryOf(a) - categoryOf(b),
    a.name.localeCompare(b.name, 'en', { numeric: true }),
  ]
  return steps.find((step) => step !== 0) ?? 0
}

/** The best combination priced as the preferences stand, split shipping or no. */
const priceOrder = (preferences: Preferences): Quote => {
  const destination = destinationFor(preferences.destination)
  const wanted = wantedRequirements(preferences)
  const offers = offersFor(preferences)

  // Anything nothing provides is set aside, so the rest can still be priced.
  const obtainable = new Set(offers.flatMap((offer) => offer.provides))
  const unavailable = [...wanted].filter((id) => !obtainable.has(id))
  const solution = solve(new Set([...wanted].filter((id) => obtainable.has(id))), offers)

  const untaxedLines = (solution?.offerIds ?? [])
    .map((id) => getProduct(id))
    .sort(byCartOrder)
    .map((product) => {
      const contents = contentsOf(product, wanted, preferences)
      return {
        product,
        price: priceFor(product, preferences),
        isGift: isGift(product.id, preferences),
        isPledge: categoryOf(product) === CATEGORY_ORDER.indexOf('core'),
        group: groupOf(product),
        contents,
        shipping: shippingOf(product, destination.region, preferences.shipping),
        shippingFloor: shippingFloorOf(product, destination.region, preferences.shipping),
        finish: sum(contents.map((content) => content.finish)),
      }
    })

  const listTotal = sum(untaxedLines.map((line) => line.product.price))
  const itemsTotal = sum(untaxedLines.map((line) => line.price))
  const finishTotal = sum(untaxedLines.map((line) => line.finish))
  const shippingTotal = sum(
    untaxedLines.map((line) => line.shipping ?? line.shippingFloor?.cents ?? 0),
  )

  // Shown as two lines, so worked out as two, each rounded to the cent: what is listed adds up.
  const taxRate = preferences.includeTax ? (preferences.taxRate ?? destination.taxRate) : 0
  const taxOn = (amount: Cents): Cents => Math.round((amount * taxRate) / PERCENT)
  const rewardsTax = taxOn(itemsTotal + finishTotal)
  const shippingTax = taxOn(shippingTotal)
  const taxTotal = rewardsTax + shippingTax
  const lineTaxes = taxByLine(
    untaxedLines.map((line) => line.price + line.finish),
    taxRate,
    rewardsTax,
  )
  const lines: readonly CartLine[] = untaxedLines.map((line, index) => ({
    ...line,
    tax: lineTaxes[index] ?? 0,
  }))

  const contents = lines.flatMap((line) => line.contents)
  const msrp = contents.map((content) => msrpOf(content.product))
  const msrpTotal = sum(msrp.map((item) => item.amount))
  const games = new Set(contents.map((content) => lineOf(content.product.id)))
  const shipments = new Set(contents.map((content) => waveOf(content.product)))
  const singleOnly = lines.find((line) => SINGLE_SHIPPING_ONLY.has(line.product.id))?.product
  const unpriced = lines.filter((line) => line.shipping === null)

  return {
    lines,
    listTotal,
    itemsTotal,
    savings: listTotal - itemsTotal,
    msrp,
    msrpTotal,
    msrpSavings: msrpTotal - itemsTotal,
    finishTotal,
    shippingTotal,
    // A gift is one of these too: it is free, but by the FAQ its shipping is not.
    unpricedShipping: unpriced.filter((line) => !line.isPledge).map((line) => line.product),
    unpricedPledges: unpriced.filter((line) => line.isPledge).map((line) => line.product),
    singleOnly: singleOnly ?? null,
    canSplit: shipments.has(1) && shipments.has(2) && singleOnly === undefined,
    shipping: preferences.shipping,
    waves: describeWaves(preferences.shipping, {
      legacy: games.has('legacy'),
      legacyCore: contents.some((content) => isLegacyCore(content.product)),
      older: games.has('og') || games.has('lockdown') || games.has('retaliation'),
    }),
    destination,
    taxRate,
    rewardsTax,
    shippingTax,
    taxTotal,
    total: itemsTotal + finishTotal + shippingTotal + taxTotal,
    bonus: contents.filter((content) => !content.wanted).map((content) => content.product),
    wantedCount: wanted.size,
    unavailable,
  }
}

/**
 * The best combination for a set of preferences, and what it comes to.
 *
 * Split shipping is only a choice where there is something to split. An order that all goes
 * out in one shipment — the older games alone, or Legacy add-ons alone — is priced and
 * described as single shipping, whichever was asked for. The preference itself is left as
 * it is, so that it applies again as soon as the order has two parts.
 */
export const buildQuote = (preferences: Preferences): Quote => {
  const quote = priceOrder(preferences)
  return quote.canSplit || preferences.shipping === 'single'
    ? quote
    : priceOrder({ ...preferences, shipping: 'single' })
}
