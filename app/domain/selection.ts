import { getProduct } from './catalog'
import { REQUIREMENTS, isOffered } from './classification'
import { LINES } from './preferences'

import type { Requirement } from './classification'
import type { Cents, ExtraTag, GameLine, Preferences } from './types'

/**
 * What the preferences come to, item by item.
 *
 * A category's switch asks for everything in it. Beneath that, any single item can be picked
 * out — taken though its category is off, or left though it is on — and those picks win over
 * the switch (`Preferences.overrides`).
 */

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
      isOffered(candidate, preferences.lines) &&
      (preferences.overrides[candidate.id] ?? preferences.extras[tag]),
  )

/** Whether an extra follows from its category's switch alone, before any picking out. */
export const isOnByDefault = (requirement: Requirement, preferences: Preferences): boolean => {
  if (requirement.tag === 'core') {
    return true
  }
  return (
    preferences.extras[requirement.tag] &&
    (requirement.needs === undefined || hasAny(requirement.line, requirement.needs, preferences))
  )
}

const isWanted = (requirement: Requirement, preferences: Preferences): boolean =>
  requirement.tag === 'core' ||
  (preferences.overrides[requirement.id] ?? isOnByDefault(requirement, preferences))

/** The ids of everything the preferences ask for. */
export const wantedRequirements = (preferences: Preferences): ReadonlySet<number> =>
  new Set(
    REQUIREMENTS.filter(
      (requirement) =>
        isOffered(requirement, preferences.lines) &&
        (requirement.edition === undefined || requirement.edition === preferences.edition) &&
        isWanted(requirement, preferences),
    ).map((requirement) => requirement.id),
  )

/** All of a category, none of it, or some. */
export type CategoryState = 'on' | 'off' | 'some'

/** One item under a category's switch. */
export interface ExtraItem {
  readonly id: number
  readonly name: string
  readonly price: Cents
  readonly wanted: boolean
  /**
   * The category this item is an accessory to, when nothing in that is asked for. Such an
   * item stays out unless it is picked, and does not count against its category being "all".
   */
  readonly waitsFor: ExtraTag | null
}

export interface ExtraCategory {
  /** Everything in the category for the games that are included. */
  readonly items: readonly ExtraItem[]
  readonly state: CategoryState
  readonly wantedCount: number
  /** How many items the switch stands for: all of them, less any still waiting. */
  readonly size: number
}

const lineOrder = (line: GameLine): number => LINES.findIndex((entry) => entry.line === line)

/** A category as the page shows it: its items, and how much of it is asked for. */
export const describeExtra = (preferences: Preferences, tag: ExtraTag): ExtraCategory => {
  const items = REQUIREMENTS.filter(
    (requirement) => requirement.tag === tag && isOffered(requirement, preferences.lines),
  )
    .map((requirement) => {
      const product = getProduct(requirement.id)
      const isWaiting =
        requirement.needs !== undefined && !hasAny(requirement.line, requirement.needs, preferences)
      return {
        line: requirement.line,
        item: {
          id: requirement.id,
          name: product.name,
          price: product.effectivePrice,
          wanted: isWanted(requirement, preferences),
          waitsFor: isWaiting ? (requirement.needs ?? null) : null,
        },
      }
    })
    .sort((a, b) => {
      const games = lineOrder(a.line) - lineOrder(b.line)
      return games === 0 ? a.item.name.localeCompare(b.item.name, 'en') : games
    })
    .map(({ item }) => item)

  const counted = items.filter((item) => item.waitsFor === null || item.wanted)
  const wantedCount = items.filter((item) => item.wanted).length

  let state: CategoryState = 'some'
  if (wantedCount === 0) {
    state = 'off'
  } else if (counted.every((item) => item.wanted)) {
    state = 'on'
  }

  return { items, state, wantedCount, size: counted.length }
}
