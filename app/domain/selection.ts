import { getProduct } from './catalog'
import { REQUIREMENTS, goesWith } from './classification'
import { isGift, priceFor } from './gift'
import { EXTRAS, LINES } from './preferences'

import type { Requirement } from './classification'
import type { Cents, ExtraTag, GameLine, Preferences } from './types'

/**
 * What the preferences come to, item by item.
 *
 * A game's switch asks for its core pledge. An extra's switch asks for everything in its
 * category that goes with the games included — or for all of the category, where nothing in
 * it does: a dice tray needs no game. Beneath the switch, any single item can be picked out,
 * whatever game it belongs to: taken though the switch would not, or left though it would.
 * Those picks win (`Preferences.overrides`).
 */

/**
 * Whether a category's switch reaches an item. It reaches what goes with the included games,
 * and failing any such item in the category, everything in it.
 */
const isInScope = (requirement: Requirement, preferences: Preferences): boolean =>
  goesWith(requirement, preferences.lines) ||
  !REQUIREMENTS.some((other) => other.tag === requirement.tag && goesWith(other, preferences.lines))

/**
 * Whether a game has anything asked for in a category. It is what the accessories wait on:
 * acrylic tokens for the add-ons are only worth having with an add-on to use them in.
 */
const hasAny = (line: GameLine, tag: ExtraTag, preferences: Preferences): boolean =>
  REQUIREMENTS.some(
    (candidate) =>
      candidate.line === line &&
      candidate.tag === tag &&
      candidate.needs === undefined &&
      (preferences.overrides[candidate.id] ??
        (preferences.extras[tag] && isInScope(candidate, preferences))),
  )

const isWaiting = (requirement: Requirement, preferences: Preferences): boolean =>
  requirement.needs !== undefined && !hasAny(requirement.line, requirement.needs, preferences)

/** Whether an extra follows from its category's switch alone, before any picking out. */
export const isOnByDefault = (requirement: Requirement, preferences: Preferences): boolean => {
  if (requirement.tag === 'core') {
    return true
  }
  // A returning backer's gift is taken without being asked for, where its game is.
  if (isGift(requirement.id, preferences) && goesWith(requirement, preferences.lines)) {
    return true
  }
  return (
    preferences.extras[requirement.tag] &&
    isInScope(requirement, preferences) &&
    !isWaiting(requirement, preferences)
  )
}

const isWanted = (requirement: Requirement, preferences: Preferences): boolean => {
  if (requirement.tag === 'core') {
    // A game's own contents come with the game, in the edition chosen, and not otherwise.
    return (
      goesWith(requirement, preferences.lines) &&
      (requirement.edition === undefined || requirement.edition === preferences.edition)
    )
  }
  return preferences.overrides[requirement.id] ?? isOnByDefault(requirement, preferences)
}

/** The ids of everything the preferences ask for. */
export const wantedRequirements = (preferences: Preferences): ReadonlySet<number> =>
  new Set(
    REQUIREMENTS.filter((requirement) => isWanted(requirement, preferences)).map(
      (requirement) => requirement.id,
    ),
  )

/** All of a category, none of it, or some. */
export type CategoryState = 'on' | 'off' | 'some'

/** One item under a category's switch. */
export interface ExtraItem {
  readonly id: number
  readonly name: string
  /** What it costs this visitor: nothing, for a returning backer's gift. */
  readonly price: Cents
  readonly wanted: boolean
  /**
   * Why the switch passes this item over, for one it does: it belongs to a game that is not
   * included, or serves a category with nothing asked for. Such an item stays out unless it
   * is picked, and does not count against its category being "all". Null for the rest.
   */
  readonly passedOver: string | null
}

export interface ExtraCategory {
  /** Everything in the category, for every game. */
  readonly items: readonly ExtraItem[]
  readonly state: CategoryState
  readonly wantedCount: number
  /** How many items the switch stands for: all of them, less those it passes over. */
  readonly size: number
}

const gameName = (line: GameLine): string =>
  LINES.find((entry) => entry.line === line)?.label ?? line

const categoryName = (tag: ExtraTag): string =>
  (EXTRAS.find((entry) => entry.tag === tag)?.label ?? tag).toLowerCase()

const lineOrder = (line: GameLine): number => LINES.findIndex((entry) => entry.line === line)

const reasonPassedOver = (requirement: Requirement, preferences: Preferences): string | null => {
  if (!isInScope(requirement, preferences)) {
    return requirement.whenNote ?? `For ${gameName(requirement.line)}, which is not included`
  }
  if (requirement.needs !== undefined && isWaiting(requirement, preferences)) {
    return `For the ${categoryName(requirement.needs)}, which are not included`
  }
  return null
}

/** A category as the page shows it: its items, and how much of it is asked for. */
export const describeExtra = (preferences: Preferences, tag: ExtraTag): ExtraCategory => {
  const items = REQUIREMENTS.filter((requirement) => requirement.tag === tag)
    .map((requirement) => {
      const product = getProduct(requirement.id)
      return {
        line: requirement.line,
        item: {
          id: requirement.id,
          name: product.name,
          price: priceFor(product, preferences),
          wanted: isWanted(requirement, preferences),
          passedOver: reasonPassedOver(requirement, preferences),
        },
      }
    })
    .sort((a, b) => {
      const games = lineOrder(a.line) - lineOrder(b.line)
      return games === 0 ? a.item.name.localeCompare(b.item.name, 'en') : games
    })
    .map(({ item }) => item)

  const counted = items.filter((item) => item.passedOver === null || item.wanted)
  const wantedCount = items.filter((item) => item.wanted).length

  let state: CategoryState = 'some'
  if (wantedCount === 0) {
    state = 'off'
  } else if (counted.every((item) => item.wanted)) {
    state = 'on'
  }

  return { items, state, wantedCount, size: counted.length }
}
