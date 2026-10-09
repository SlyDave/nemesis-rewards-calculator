import { describe, expect, test } from 'bun:test'

import { buyableProducts, leavesOf } from '../app/domain/catalog'
import { REQUIREMENTS, findRequirement, providedBy } from '../app/domain/classification'
import { buildQuote } from '../app/domain/quote'
import { describeExtra, wantedRequirements } from '../app/domain/selection'

import { preferencesWith } from './support'

import type { Quote } from '../app/domain/quote'
import type { ExtraItem } from '../app/domain/selection'
import type { Preferences } from '../app/domain/types'

const AFTERMATH = 125198
const VOID_SEEDERS = 125203
const CARNOMORPHS = 125204
const MEDIC = 125205
const OG_PLEDGE = 125507
const LOCKDOWN_PLEDGE = 125514
const LOCKDOWN_STRETCH_GOALS = 125236
const LEGACY_PLEDGE = 120364
const RECHARGE_PACK = 125536

const cart = (quote: Quote): readonly number[] => quote.lines.map((line) => line.product.id)

const expansion = (preferences: Preferences, id: number): ExtraItem | undefined =>
  describeExtra(preferences, 'gameplay').items.find((item) => item.id === id)

// Aftermath is in the Stretch Goals box of every pledge for the original game, and is sold by
// itself as well. It was once classed as part of that game and nothing more, which kept it
// out of the Expansions list and out of reach of anyone not buying the game.
describe('an expansion that comes with a pledge and is also sold on its own', () => {
  test('is listed under Expansions as there already, when its game is included', () => {
    const preferences = preferencesWith({ lines: ['og'] })
    for (const id of [AFTERMATH, VOID_SEEDERS]) {
      const item = expansion(preferences, id)
      expect(item?.wanted).toBe(true)
      expect(item?.passedOver).toBeNull()
      expect(item?.included).toBe(
        'Comes with the Nemesis OG pledge, in its Nemesis Stretch Goals (Special Edition)',
      )
    }
    expect(expansion(preferences, AFTERMATH)?.name).toBe('Aftermath Expansion 2.0')
  })

  test('is no part of what the switch counts, nor a sign that it is on', () => {
    const off = describeExtra(preferencesWith({ lines: ['og'] }), 'gameplay')
    expect(off.state).toBe('off')
    expect(off.wantedCount).toBe(0)
    // The Carnomorphs and the Medic: the two expansions the switch has to give for this game.
    expect(off.size).toBe(2)

    const on = describeExtra(preferencesWith({ lines: ['og'], extras: ['gameplay'] }), 'gameplay')
    expect(on.state).toBe('on')
    expect(on.wantedCount).toBe(2)
  })

  test('adds nothing to the order with its game: it is in the pledge', () => {
    const quote = buildQuote(preferencesWith({ lines: ['og'], includeTax: false }))
    expect(cart(quote)).toEqual([OG_PLEDGE])
    expect(quote.itemsTotal).toBe(10900)
    expect(quote.bonus).toEqual([])
  })

  test('cannot be left out of a pledge that holds it', () => {
    const preferences = preferencesWith({ lines: ['og'], overrides: { [AFTERMATH]: false } })
    expect(wantedRequirements(preferences).has(AFTERMATH)).toBe(true)
    expect(cart(buildQuote(preferences))).toEqual([OG_PLEDGE])
  })

  test('is an add-on for Lockdown, which it is also played in, without the original', () => {
    const preferences = preferencesWith({
      lines: ['lockdown'],
      extras: ['gameplay'],
      includeTax: false,
    })
    const wanted = wantedRequirements(preferences)
    expect(wanted.has(AFTERMATH)).toBe(true)
    expect(wanted.has(VOID_SEEDERS)).toBe(true)
    expect(expansion(preferences, AFTERMATH)?.included).toBeNull()

    const quote = buildQuote(preferences)
    expect([...cart(quote)].sort((a, b) => a - b)).toEqual(
      [LOCKDOWN_PLEDGE, AFTERMATH, VOID_SEEDERS, CARNOMORPHS, MEDIC].sort((a, b) => a - b),
    )
    expect(quote.itemsTotal).toBe(11500 + 2400 + 3200 + 3700 + 900)
  })

  test('is passed over with neither game, and can be ticked all the same', () => {
    const preferences = preferencesWith({ lines: ['legacy'], extras: ['gameplay'] })
    const item = expansion(preferences, AFTERMATH)
    expect(item?.wanted).toBe(false)
    expect(item?.passedOver).toBe(
      'For Nemesis OG or Nemesis Lockdown, neither of which is included',
    )

    const picked = preferencesWith({ lines: ['legacy'], overrides: { [AFTERMATH]: true } })
    expect(cart(buildQuote(picked))).toEqual([LEGACY_PLEDGE, AFTERMATH])
  })
})

describe('the other things a pledge holds that are sold on their own', () => {
  test('are listed under Expansions too, as there already with their game', () => {
    const lockdown = expansion(preferencesWith({ lines: ['lockdown'] }), LOCKDOWN_STRETCH_GOALS)
    expect(lockdown?.included).toBe('Comes with the Nemesis Lockdown pledge')
    const legacy = expansion(preferencesWith({ lines: ['legacy'] }), RECHARGE_PACK)
    expect(legacy?.included).toBe('Comes with the Nemesis Legacy pledge')
  })

  test('can be bought without their game', () => {
    const preferences = preferencesWith({
      lines: ['legacy'],
      overrides: { [LOCKDOWN_STRETCH_GOALS]: true },
    })
    expect(cart(buildQuote(preferences))).toEqual([LEGACY_PLEDGE, LOCKDOWN_STRETCH_GOALS])
  })

  test('are still wanted with their game, whatever the switches say', () => {
    expect([...wantedRequirements(preferencesWith({ lines: ['legacy'] }))]).toContain(RECHARGE_PACK)
    expect([...wantedRequirements(preferencesWith({ lines: ['lockdown'] }))]).toContain(
      LOCKDOWN_STRETCH_GOALS,
    )
  })
})

describe('the classification, against what is on sale', () => {
  // The guard against an item on sale going missing from the page again.
  test('puts every single item on sale under a switch', () => {
    const hidden = buyableProducts
      .filter((product) => !product.isSet)
      .filter((product) =>
        providedBy(product.id).some((id) => {
          const requirement = findRequirement(id)
          return requirement === undefined || requirement.tag === 'core'
        }),
      )
      .map((product) => `${String(product.id)} ${product.name}`)
    expect(hidden).toEqual([])
  })

  test('says an item comes with a pledge only where every pledge for its game holds it', () => {
    const pledged = REQUIREMENTS.filter((requirement) => requirement.withPledge === true)
    expect(pledged.map(({ id }) => id).sort((a, b) => a - b)).toEqual([
      125198, 125203, 125236, 125526, 125536,
    ])

    for (const requirement of pledged) {
      const pledges = buyableProducts.filter(
        (product) =>
          product.isSet &&
          leavesOf(product).some((leaf) =>
            providedBy(leaf.id).some((id) => {
              const held = findRequirement(id)
              return held?.tag === 'core' && held.line === requirement.line
            }),
          ),
      )
      expect(pledges.length).toBeGreaterThan(0)
      for (const pledge of pledges) {
        const holds = leavesOf(pledge).flatMap((leaf) => providedBy(leaf.id))
        expect(holds, `${pledge.name} holds ${String(requirement.id)}`).toContain(requirement.id)
      }
    }
  })
})
