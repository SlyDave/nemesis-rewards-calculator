import type { Product } from './catalog'
import type { Cents, Preferences } from './types'

/**
 * The gift for returning backers.
 *
 * Anyone who has pledged for Nemesis before — on Kickstarter or Gamefound, in a campaign, a
 * pledge manager or a late pledge — can add the SAM Robot Pack to their Legacy pledge for
 * nothing; for everyone else it is an add-on at its listed price (campaign Update #6).
 * Gamefound knows a returning backer by the email address of the earlier pledge.
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
