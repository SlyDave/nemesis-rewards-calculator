import type { Cents } from './types'

/**
 * Finds the cheapest set of offers that provides everything wanted.
 *
 * This is weighted set cover, which is hard in general but small and well-shaped here: most
 * offers are single items that provide one thing, and the few dozen bundles overlap only
 * within their own game. The search is exact. It never settles for "cheap enough", and it
 * will take a bundle that includes things nobody asked for whenever that is the cheaper way
 * to get what they did.
 *
 * It works by conditioning on one bundle at a time (the cheapest answer either includes it
 * or does not) and, after each such decision, splitting what is left into groups of bundles
 * that no longer share anything, which are solved separately. Deciding the bundle that ties
 * the most others together first — the four-game bundle, here — is what makes the rest
 * fall apart into one small problem per game.
 */

/** What a combination costs. Compared field by field, in this order. */
export interface Cost {
  /** The price of the items, which is what decides. */
  readonly price: Cents
  /** How many things go in the cart: at the same price, the one with fewer is the bundle. */
  readonly items: number
  /** The published shipping, as a last tie-break. */
  readonly shipping: Cents
}

/** Something that can be bought, and the requirements buying it satisfies. */
export interface Offer {
  readonly id: number
  readonly cost: Cost
  readonly provides: readonly number[]
}

export interface Solution {
  readonly offerIds: readonly number[]
  readonly cost: Cost
}

/** An offer seen through what is wanted right now. */
interface Candidate {
  readonly offer: Offer
  /** The wanted requirements it provides. */
  readonly cover: ReadonlySet<number>
}

const NOTHING: Solution = { offerIds: [], cost: { price: 0, items: 0, shipping: 0 } }

const add = (a: Cost, b: Cost): Cost => ({
  price: a.price + b.price,
  items: a.items + b.items,
  shipping: a.shipping + b.shipping,
})

/** Negative when `a` is the better cost, positive when `b` is, zero when they are the same. */
export const compareCosts = (a: Cost, b: Cost): number =>
  [a.price - b.price, a.items - b.items, a.shipping - b.shipping].find(
    (difference) => difference !== 0,
  ) ?? 0

const join = (a: Solution, b: Solution): Solution => ({
  offerIds: [...a.offerIds, ...b.offerIds],
  cost: add(a.cost, b.cost),
})

const only = (offer: Offer): Solution => ({ offerIds: [offer.id], cost: offer.cost })

const better = (a: Solution | null, b: Solution | null): Solution | null => {
  if (a === null || b === null) {
    return a ?? b
  }
  return compareCosts(a.cost, b.cost) <= 0 ? a : b
}

const isSubset = (inner: ReadonlySet<number>, outer: ReadonlySet<number>): boolean => {
  for (const id of inner) {
    if (!outer.has(id)) {
      return false
    }
  }
  return true
}

const overlaps = (a: ReadonlySet<number>, b: ReadonlySet<number>): boolean => {
  for (const id of a) {
    if (b.has(id)) {
      return true
    }
  }
  return false
}

/**
 * Whether a bundle is worth considering at all. It is not when another bundle provides at
 * least as much for no more, or when the items it provides cost no more bought one by one.
 */
const isWorthConsidering = (
  bundle: Candidate,
  index: number,
  bundles: readonly Candidate[],
  singles: ReadonlyMap<number, Offer>,
): boolean => {
  const beaten = bundles.some((other, otherIndex) => {
    if (otherIndex === index || !isSubset(bundle.cover, other.cover)) {
      return false
    }
    const difference = compareCosts(other.offer.cost, bundle.offer.cost)
    // Two bundles alike in cover and cost beat each other; the earlier one is the one kept.
    return (
      difference < 0 ||
      (difference === 0 && (other.cover.size > bundle.cover.size || otherIndex < index))
    )
  })
  if (beaten) {
    return false
  }

  let separately: Cost = NOTHING.cost
  for (const id of bundle.cover) {
    const single = singles.get(id)
    if (single === undefined) {
      return true
    }
    separately = add(separately, single.cost)
  }
  return compareCosts(separately, bundle.offer.cost) > 0
}

/** Sorts the offers into the cheapest single way to get each requirement, and the bundles. */
const classify = (
  wanted: ReadonlySet<number>,
  offers: readonly Offer[],
): { singles: ReadonlyMap<number, Offer>; bundles: readonly Candidate[] } => {
  const singles = new Map<number, Offer>()
  const bundles: Candidate[] = []

  for (const offer of offers) {
    const cover = new Set(offer.provides.filter((id) => wanted.has(id)))
    const [first] = cover
    if (first === undefined) {
      continue
    }
    if (cover.size > 1) {
      bundles.push({ offer, cover })
      continue
    }
    const current = singles.get(first)
    if (current === undefined || compareCosts(offer.cost, current.cost) < 0) {
      singles.set(first, offer)
    }
  }

  return {
    singles,
    bundles: bundles.filter((bundle, index) => isWorthConsidering(bundle, index, bundles, singles)),
  }
}

/** Groups the bundles so that no two groups provide any requirement in common. */
const groupByOverlap = (bundles: readonly Candidate[]): readonly (readonly Candidate[])[] => {
  const groups: Candidate[][] = []
  for (const bundle of bundles) {
    const touching = groups.filter((group) =>
      group.some((member) => overlaps(member.cover, bundle.cover)),
    )
    const merged = [...touching.flat(), bundle]
    for (const group of touching) {
      groups.splice(groups.indexOf(group), 1)
    }
    groups.push(merged)
  }
  return groups
}

/** The bundle that overlaps the most others: deciding it first splits the group soonest. */
const pickPivot = (group: readonly Candidate[]): Candidate => {
  let pivot: Candidate | undefined
  let pivotLinks = -1
  for (const bundle of group) {
    const links = group.filter(
      (other) => other !== bundle && overlaps(other.cover, bundle.cover),
    ).length
    const isBetter =
      links > pivotLinks ||
      (links === pivotLinks && pivot !== undefined && bundle.cover.size > pivot.cover.size)
    if (isBetter) {
      pivot = bundle
      pivotLinks = links
    }
  }
  if (pivot === undefined) {
    throw new Error('Cannot pick a pivot from an empty group')
  }
  return pivot
}

/**
 * The cheapest combination of offers providing every wanted requirement, or null when no
 * combination can.
 */
export const solve = (wanted: ReadonlySet<number>, offers: readonly Offer[]): Solution | null => {
  if (wanted.size === 0) {
    return NOTHING
  }

  const { singles, bundles } = classify(wanted, offers)
  const bundled = new Set(bundles.flatMap((bundle) => [...bundle.cover]))

  /** Solves one group of overlapping bundles: the answer includes its pivot, or does not. */
  const solveGroup = (group: readonly Candidate[]): Solution | null => {
    const requirements = new Set(group.flatMap((bundle) => [...bundle.cover]))
    const pivot = pickPivot(group)

    const others: Offer[] = group.filter((bundle) => bundle !== pivot).map((bundle) => bundle.offer)
    for (const id of requirements) {
      const single = singles.get(id)
      if (single !== undefined) {
        others.push(single)
      }
    }

    const without = solve(requirements, others)

    const remaining = new Set([...requirements].filter((id) => !pivot.cover.has(id)))
    const rest = solve(remaining, others)
    const withPivot = rest === null ? null : join(only(pivot.offer), rest)

    return better(withPivot, without)
  }

  let solution = NOTHING
  // Whatever no bundle provides can only be bought on its own.
  for (const id of wanted) {
    if (bundled.has(id)) {
      continue
    }
    const single = singles.get(id)
    if (single === undefined) {
      return null
    }
    solution = join(solution, only(single))
  }

  for (const group of groupByOverlap(bundles)) {
    const part = solveGroup(group)
    if (part === null) {
      return null
    }
    solution = join(solution, part)
  }

  return solution
}
