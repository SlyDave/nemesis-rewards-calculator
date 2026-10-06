import type { Product } from './catalog'
import type { Cents, Preferences } from './types'

/**
 * The gift for returning backers.
 *
 * Anyone who has pledged for Nemesis before — on Kickstarter or Gamefound, in a campaign, a
 * pledge manager or a late pledge — gets the SAM Robot Pack for nothing (campaign Update #6).
 * It is the same product everyone else buys as an add-on; for a returning backer the pledge
 * manager adds it by itself, so it is not something to put in the cart, and it is taken to
 * ship free with the rest. Gamefound knows a returning backer by the email address of the
 * earlier pledge.
 */
export const RETURNING_BACKER_GIFT = 128018

export const GIFT_DETAILS_URL =
  'https://gamefound.com/en/projects/awaken-realms/nemesis-legacy/updates/6'

/** Whether a product is the gift, for someone it is a gift to. */
export const isGift = (productId: number, preferences: Preferences): boolean =>
  preferences.returningBacker && productId === RETURNING_BACKER_GIFT

/** What a product costs this visitor: its price, or nothing if it is their gift. */
export const priceFor = (product: Product, preferences: Preferences): Cents =>
  isGift(product.id, preferences) ? 0 : product.effectivePrice
