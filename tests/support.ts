import { DEFAULT_PREFERENCES, EXTRAS, LINES } from '../app/domain/preferences'
import { compareCosts } from '../app/domain/solver'

import type { Cost, Offer } from '../app/domain/solver'
import type { ExtraTag, GameLine, Preferences } from '../app/domain/types'

type Overrides = Omit<Partial<Preferences>, 'lines' | 'extras'> & {
  readonly lines?: readonly GameLine[]
  readonly extras?: readonly ExtraTag[]
}

export const ALL_LINES: readonly GameLine[] = LINES.map(({ line }) => line)
export const ALL_EXTRAS: readonly ExtraTag[] = EXTRAS.map(({ tag }) => tag)

/** The extras switches with just the given ones on. */
const only = (included: readonly ExtraTag[]): Preferences['extras'] => {
  const extras = { ...DEFAULT_PREFERENCES.extras }
  for (const tag of ALL_EXTRAS) {
    extras[tag] = included.includes(tag)
  }
  return extras
}

/** The default preferences with some changed; games and extras are given as the ones to include. */
export const preferencesWith = (overrides: Overrides = {}): Preferences => {
  const { lines, extras, ...rest } = overrides
  return {
    ...DEFAULT_PREFERENCES,
    ...rest,
    lines:
      lines === undefined
        ? DEFAULT_PREFERENCES.lines
        : {
            legacy: lines.includes('legacy'),
            og: lines.includes('og'),
            lockdown: lines.includes('lockdown'),
            retaliation: lines.includes('retaliation'),
          },
    extras: extras === undefined ? DEFAULT_PREFERENCES.extras : only(extras),
  }
}

/** A small repeatable random number generator (mulberry32), so a failure can be re-run. */
export const seededRandom = (seed: number): (() => number) => {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

const ZERO: Cost = { price: 0, items: 0, shipping: 0 }

const plus = (a: Cost, b: Cost): Cost => ({
  price: a.price + b.price,
  items: a.items + b.items,
  shipping: a.shipping + b.shipping,
})

/**
 * The cheapest cost of providing everything wanted, found the slow and obvious way: try
 * every subset of the bundles, and fill whatever each leaves with the cheapest single items.
 * It shares nothing with the solver but the definition of "cheaper".
 */
export const bruteForce = (wanted: ReadonlySet<number>, offers: readonly Offer[]): Cost | null => {
  const singles = new Map<number, Cost>()
  const bundles: { readonly cost: Cost; readonly cover: readonly number[] }[] = []
  for (const offer of offers) {
    const cover = offer.provides.filter((id) => wanted.has(id))
    const [first] = cover
    if (first === undefined) {
      continue
    }
    if (cover.length > 1) {
      bundles.push({ cost: offer.cost, cover })
      continue
    }
    const current = singles.get(first)
    if (current === undefined || compareCosts(offer.cost, current) < 0) {
      singles.set(first, offer.cost)
    }
  }

  const covered = new Map<number, number>([...wanted].map((id) => [id, 0]))
  let best: Cost | null = null

  const finish = (cost: Cost): void => {
    let total = cost
    for (const [id, count] of covered) {
      if (count > 0) {
        continue
      }
      const single = singles.get(id)
      if (single === undefined) {
        return
      }
      total = plus(total, single)
    }
    if (best === null || compareCosts(total, best) < 0) {
      best = total
    }
  }

  const visit = (index: number, cost: Cost): void => {
    const bundle = bundles[index]
    if (bundle === undefined) {
      finish(cost)
      return
    }
    visit(index + 1, cost)
    for (const id of bundle.cover) {
      covered.set(id, (covered.get(id) ?? 0) + 1)
    }
    visit(index + 1, plus(cost, bundle.cost))
    for (const id of bundle.cover) {
      covered.set(id, (covered.get(id) ?? 0) - 1)
    }
  }

  visit(0, ZERO)
  return best
}
