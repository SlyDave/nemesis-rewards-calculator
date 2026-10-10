import type { Product } from './catalog'
import type { Cents, Preferences } from './types'

/**
 * The gift for returning backers.
 *
 * Anyone who has pledged for Nemesis before — on Kickstarter or Gamefound, in a campaign, a
 * pledge manager or a late pledge — gets the SAM Robot Pack for nothing (campaign Update #6).
 * It is the same product everyone else buys as an add-on. By the campaign's FAQ a returning
 * backer adds it to the cart like any other, choosing the one Gamefound lists for them at
 * 0,00 €, one to an order; and though the pack is free its shipping is not, since it adds to
 * the weight of the order. Gamefound knows a returning backer by the email address of the
 * earlier pledge.
 */
export const RETURNING_BACKER_GIFT = 128018

export const GIFT_DETAILS_URL =
  'https://gamefound.com/en/projects/awaken-realms/nemesis-legacy/updates/6'

export const GIFT_FAQ_URL = 'https://gamefound.com/en/projects/awaken-realms/nemesis-legacy/faq'

/** Whether a product is the gift, for someone it is a gift to. */
export const isGift = (productId: number, preferences: Preferences): boolean =>
  preferences.returningBacker && productId === RETURNING_BACKER_GIFT

/** What a product costs this visitor: its price, or nothing if it is their gift. */
export const priceFor = (product: Product, preferences: Preferences): Cents =>
  isGift(product.id, preferences) ? 0 : product.effectivePrice
