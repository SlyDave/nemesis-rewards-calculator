import { describe, expect, test } from 'bun:test'

import { REQUIREMENTS } from '../app/domain/classification'
import { wantedRequirements } from '../app/domain/selection'
import { offersFor } from '../app/domain/quote'
import { compareCosts, solve } from '../app/domain/solver'

import { ALL_EXTRAS, ALL_LINES, bruteForce, preferencesWith, seededRandom } from './support'

import type { Offer } from '../app/domain/solver'

const offer = (id: number, price: number, provides: readonly number[]): Offer => ({
  id,
  cost: { price, items: 1, shipping: 0 },
  provides,
})

describe('solve', () => {
  test('wanting nothing costs nothing', () => {
    expect(solve(new Set(), [offer(1, 500, [10])])).toEqual({
      offerIds: [],
      cost: { price: 0, items: 0, shipping: 0 },
    })
  })

  test('buys single items when no bundle helps', () => {
    const solution = solve(new Set([10, 11]), [offer(1, 500, [10]), offer(2, 700, [11])])
    expect(solution?.cost.price).toBe(1200)
    expect([...(solution?.offerIds ?? [])].sort((a, b) => a - b)).toEqual([1, 2])
  })

  test('takes a bundle that is cheaper than its parts', () => {
    const solution = solve(new Set([10, 11]), [
      offer(1, 500, [10]),
      offer(2, 700, [11]),
      offer(3, 1000, [10, 11]),
    ])
    expect(solution?.offerIds).toEqual([3])
  })

  test('takes a bundle with unwanted extras when that is still cheaper', () => {
    const solution = solve(new Set([10, 11]), [
      offer(1, 500, [10]),
      offer(2, 700, [11]),
      offer(3, 1100, [10, 11, 12, 13]),
    ])
    expect(solution?.offerIds).toEqual([3])
  })

  test('leaves a bundle alone when its parts are cheaper', () => {
    const solution = solve(new Set([10, 11]), [
      offer(1, 500, [10]),
      offer(2, 700, [11]),
      offer(3, 1300, [10, 11, 12]),
    ])
    expect([...(solution?.offerIds ?? [])].sort((a, b) => a - b)).toEqual([1, 2])
  })

  test('prefers the bundle when it costs the same as its parts', () => {
    const solution = solve(new Set([10, 11]), [
      offer(1, 500, [10]),
      offer(2, 700, [11]),
      offer(3, 1200, [10, 11]),
    ])
    expect(solution?.offerIds).toEqual([3])
  })

  test('weighs overlapping bundles against each other', () => {
    // Two bundles share requirement 11; the cheapest answer takes one and tops up.
    const solution = solve(new Set([10, 11, 12]), [
      offer(1, 400, [10]),
      offer(2, 400, [11]),
      offer(3, 400, [12]),
      offer(4, 700, [10, 11]),
      offer(5, 750, [11, 12]),
    ])
    expect(solution?.cost.price).toBe(1100)
    expect([...(solution?.offerIds ?? [])].sort((a, b) => a - b)).toEqual([3, 4])
  })

  test('combines two bundles when together they beat one bigger one', () => {
    const solution = solve(new Set([10, 11, 12, 13]), [
      offer(1, 1000, [10, 11]),
      offer(2, 1000, [12, 13]),
      offer(3, 2100, [10, 11, 12, 13]),
    ])
    expect([...(solution?.offerIds ?? [])].sort((a, b) => a - b)).toEqual([1, 2])
  })

  test('is null when something wanted is not for sale', () => {
    expect(solve(new Set([10, 99]), [offer(1, 500, [10])])).toBeNull()
  })

  test('breaks a tie on price by the published shipping', () => {
    const solution = solve(new Set([10]), [
      { id: 1, cost: { price: 500, items: 1, shipping: 300 }, provides: [10] },
      { id: 2, cost: { price: 500, items: 1, shipping: 200 }, provides: [10] },
    ])
    expect(solution?.offerIds).toEqual([2])
  })
})

describe('solve, against the real catalogue', () => {
  const check = (description: string, preferences: ReturnType<typeof preferencesWith>): void => {
    const wanted = wantedRequirements(preferences)
    const offers = offersFor(preferences)
    const solution = solve(wanted, offers)
    const reference = bruteForce(wanted, offers)

    if (solution === null || reference === null) {
      throw new Error(`${description}: no combination found`)
    }
    // It provides everything asked for …
    const provided = new Set(
      solution.offerIds.flatMap((id) => offers.find((candidate) => candidate.id === id)?.provides),
    )
    for (const id of wanted) {
      expect(provided.has(id), `${description}: provides ${String(id)}`).toBe(true)
    }
    // … and nothing found the slow way is cheaper.
    expect(compareCosts(solution.cost, reference), `${description}: cost`).toBe(0)
  }

  test('every game on its own and all together, with nothing and with everything', () => {
    for (const lines of [...ALL_LINES.map((line) => [line]), ALL_LINES]) {
      for (const extras of [[], ALL_EXTRAS]) {
        for (const edition of ['standard', 'special'] as const) {
          check(
            `${lines.join('+')} ${edition} ${extras.length === 0 ? 'bare' : 'everything'}`,
            preferencesWith({ lines, extras, edition }),
          )
        }
      }
    }
  })

  test('each extra on its own, across all four games', () => {
    for (const tag of ALL_EXTRAS) {
      check(`only ${tag}`, preferencesWith({ lines: ALL_LINES, extras: [tag] }))
    }
  })

  test('random combinations of the switches', () => {
    const random = seededRandom(20261006)
    const chance = (probability: number): boolean => random() < probability
    for (let run = 0; run < 120; run += 1) {
      const lines = ALL_LINES.filter(() => chance(0.6))
      const extras = ALL_EXTRAS.filter(() => chance(0.5))
      check(
        `run ${String(run)}: ${lines.join('+')} / ${extras.join('+')}`,
        preferencesWith({
          lines,
          extras,
          edition: chance(0.5) ? 'standard' : 'special',
          shipping: chance(0.5) ? 'split' : 'single',
        }),
      )
    }
  })

  test('random combinations with single items picked out against their switches', () => {
    const random = seededRandom(8524)
    const chance = (probability: number): boolean => random() < probability
    const extraIds = REQUIREMENTS.filter((requirement) => requirement.tag !== 'core').map(
      (requirement) => requirement.id,
    )
    for (let run = 0; run < 80; run += 1) {
      const lines = ALL_LINES.filter(() => chance(0.7))
      const overrides = Object.fromEntries(
        extraIds.filter(() => chance(0.15)).map((id) => [id, chance(0.5)]),
      )
      check(
        `picked run ${String(run)}: ${lines.join('+')}`,
        preferencesWith({ lines, extras: ALL_EXTRAS.filter(() => chance(0.4)), overrides }),
      )
    }
  })

  test('answers at once, even with every switch on', () => {
    const preferences = preferencesWith({ lines: ALL_LINES, extras: ALL_EXTRAS })
    const wanted = wantedRequirements(preferences)
    const offers = offersFor(preferences)
    const started = performance.now()
    for (let run = 0; run < 20; run += 1) {
      solve(wanted, offers)
    }
    expect((performance.now() - started) / 20).toBeLessThan(25)
  })
})
