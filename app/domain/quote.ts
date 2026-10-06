import { buyableProducts, getProduct, leavesOf } from './catalog'
import { findRequirement, lineOf, providedBy } from './classification'
import { destinationFor } from './destinations'
import { wantedRequirements } from './preferences'
import { describeWaves, shippingOf } from './shipping'
import { solve } from './solver'

import type { Product } from './catalog'
import type { Destination } from './destinations'
import type { Offer } from './solver'
import type { Cents, Finish, Preferences } from './types'

/** One item inside something in the cart. */
export interface ContentLine {
  readonly product: Product
  /** Whether it is something the visitor asked for, rather than something that came along. */
  readonly wanted: boolean
  /** The surcharge for the chosen miniatures finish; zero where it does not apply. */
  readonly finish: Cents
}

/** One thing to add to the Gamefound cart. */
export interface CartLine {
  readonly product: Product
  readonly contents: readonly ContentLine[]
  /** The published shipping price, or null for add-ons, which have none yet. */
  readonly shipping: Cents | null
  readonly finish: Cents
}

/** The best combination for a set of preferences, and what it comes to. All sums in euro cents. */
export interface Quote {
  readonly lines: readonly CartLine[]
  /** What the cart's contents list for, before the campaign's bundle discounts. */
  readonly listTotal: Cents
  /** What they cost. */
  readonly itemsTotal: Cents
  readonly savings: Cents
  readonly finishTotal: Cents
  /** The shipping the campaign has published a price for: the pledges'. */
  readonly shippingTotal: Cents
  /** The cart lines whose shipping will only be priced in the pledge manager. */
  readonly unpricedShipping: readonly Product[]
  readonly waves: string
  readonly destination: Destination
  /** The rate applied, in percent: zero when tax is switched off. */
  readonly taxRate: number
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
      price: product.effectivePrice,
      items: 1,
      shipping: shippingOf(product, region, preferences.shipping) ?? 0,
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

export const buildQuote = (preferences: Preferences): Quote => {
  const destination = destinationFor(preferences.destination)
  const wanted = wantedRequirements(preferences)
  const offers = offersFor(preferences)

  // Anything nothing provides is set aside, so the rest can still be priced.
  const obtainable = new Set(offers.flatMap((offer) => offer.provides))
  const unavailable = [...wanted].filter((id) => !obtainable.has(id))
  const solution = solve(new Set([...wanted].filter((id) => obtainable.has(id))), offers)

  const lines: readonly CartLine[] = (solution?.offerIds ?? [])
    .map((id) => getProduct(id))
    .sort((a, b) => a.listOrder - b.listOrder)
    .map((product) => {
      const contents = contentsOf(product, wanted, preferences)
      return {
        product,
        contents,
        shipping: shippingOf(product, destination.region, preferences.shipping),
        finish: sum(contents.map((content) => content.finish)),
      }
    })

  const listTotal = sum(lines.map((line) => line.product.price))
  const itemsTotal = sum(lines.map((line) => line.product.effectivePrice))
  const finishTotal = sum(lines.map((line) => line.finish))
  const shippingTotal = sum(lines.map((line) => line.shipping ?? 0))

  const taxRate = preferences.includeTax ? (preferences.taxRate ?? destination.taxRate) : 0
  const taxTotal = Math.round(((itemsTotal + finishTotal + shippingTotal) * taxRate) / PERCENT)

  const contents = lines.flatMap((line) => line.contents)
  const games = new Set(contents.map((content) => lineOf(content.product.id)))

  return {
    lines,
    listTotal,
    itemsTotal,
    savings: listTotal - itemsTotal,
    finishTotal,
    shippingTotal,
    unpricedShipping: lines.filter((line) => line.shipping === null).map((line) => line.product),
    waves: describeWaves(preferences.shipping, {
      legacy: games.has('legacy'),
      older: games.has('og') || games.has('lockdown') || games.has('retaliation'),
    }),
    destination,
    taxRate,
    taxTotal,
    total: itemsTotal + finishTotal + shippingTotal + taxTotal,
    bonus: contents.filter((content) => !content.wanted).map((content) => content.product),
    wantedCount: wanted.size,
    unavailable,
  }
}
