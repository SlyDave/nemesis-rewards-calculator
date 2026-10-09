import { getProduct } from './catalog'
import { REQUIREMENTS, boxOf, goesWith } from './classification'
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
 *
 * A few items are both: in every pledge for their game, and sold by themselves. With the game
 * they come regardless, and are shown under their switch as there already; without it they
 * are extras like the rest.
 */

/** Whether an item is in the order already, as part of an included game's pledge. */
export const comesWithPledge = (requirement: Requirement, preferences: Preferences): boolean =>
  requirement.withPledge === true && preferences.lines[requirement.line]

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
      // What comes with the pledge is not an add-on, so brings no accessories of its own.
      candidate.withPledge !== true &&
      (preferences.overrides[candidate.id] ??
        (preferences.extras[tag] && isInScope(candidate, preferences))),
  )

const isWaiting = (requirement: Requirement, preferences: Preferences): boolean =>
  requirement.needs !== undefined && !hasAny(requirement.line, requirement.needs, preferences)

/** Whether an extra follows from its category's switch alone, before any picking out. */
export const isOnByDefault = (requirement: Requirement, preferences: Preferences): boolean => {
  if (requirement.tag === 'core' || comesWithPledge(requirement, preferences)) {
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
  // What a pledge holds cannot be left out of it, whatever was picked while the game was off.
  if (comesWithPledge(requirement, preferences)) {
    return true
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
  /**
   * How this item is in the order already, for one that comes with an included game's pledge.
   * It is shown as there, cannot be left out, and is no part of what the switch counts. Null
   * for the rest.
   */
  readonly included: string | null
}

export interface ExtraCategory {
  /** Everything in the category, for every game. */
  readonly items: readonly ExtraItem[]
  readonly state: CategoryState
  /** How many are asked for, not counting what comes with a pledge anyway. */
  readonly wantedCount: number
  /** How many items the switch stands for: all, less those it passes over or a pledge holds. */
  readonly size: number
}

const gameName = (line: GameLine): string =>
  LINES.find((entry) => entry.line === line)?.label ?? line

const categoryName = (tag: ExtraTag): string =>
  (EXTRAS.find((entry) => entry.tag === tag)?.label ?? tag).toLowerCase()

const lineOrder = (line: GameLine): number => LINES.findIndex((entry) => entry.line === line)

/** Whose an item is, said of one whose game — or games, if it is played in two — is left out. */
const notIncluded = (requirement: Requirement): string =>
  requirement.alsoWith === undefined
    ? `For ${gameName(requirement.line)}, which is not included`
    : `For ${gameName(requirement.line)} or ${gameName(requirement.alsoWith)}, neither of which is included`

const reasonPassedOver = (requirement: Requirement, preferences: Preferences): string | null => {
  if (!isInScope(requirement, preferences)) {
    return requirement.whenNote ?? notIncluded(requirement)
  }
  if (requirement.needs !== undefined && isWaiting(requirement, preferences)) {
    return `For the ${categoryName(requirement.needs)}, which are not included`
  }
  return null
}

/** "Comes with the Nemesis OG pledge", and in which box of it, for one of several in a box. */
const howIncluded = (requirement: Requirement): string => {
  const box = boxOf(requirement.id)
  const where = box === undefined ? '' : `, in its ${getProduct(box).name}`
  return `Comes with the ${gameName(requirement.line)} pledge${where}`
}

/** A category as the page shows it: its items, and how much of it is asked for. */
export const describeExtra = (preferences: Preferences, tag: ExtraTag): ExtraCategory => {
  const items = REQUIREMENTS.filter((requirement) => requirement.tag === tag)
    .map((requirement) => {
      const product = getProduct(requirement.id)
      const isIncluded = comesWithPledge(requirement, preferences)
      return {
        line: requirement.line,
        item: {
          id: requirement.id,
          name: product.name,
          price: priceFor(product, preferences),
          wanted: isWanted(requirement, preferences),
          passedOver: isIncluded ? null : reasonPassedOver(requirement, preferences),
          included: isIncluded ? howIncluded(requirement) : null,
        },
      }
    })
    .sort((a, b) => {
      const games = lineOrder(a.line) - lineOrder(b.line)
      return games === 0 ? a.item.name.localeCompare(b.item.name, 'en') : games
    })
    .map(({ item }) => item)

  // What a pledge brings is neither the switch's to give nor a sign that it is on.
  const choices = items.filter((item) => item.included === null)
  const counted = choices.filter((item) => item.passedOver === null || item.wanted)
  const wantedCount = choices.filter((item) => item.wanted).length

  let state: CategoryState = 'some'
  if (wantedCount === 0) {
    state = 'off'
  } else if (counted.every((item) => item.wanted)) {
    state = 'on'
  }

  return { items, state, wantedCount, size: counted.length }
}
