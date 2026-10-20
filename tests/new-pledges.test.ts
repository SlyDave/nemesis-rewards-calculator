import { describe, expect, test } from 'bun:test'

import { getProduct } from '../app/domain/catalog'
import { msrpOf } from '../app/domain/msrp'
import { buildQuote } from '../app/domain/quote'
import { describeExtra, wantedRequirements } from '../app/domain/selection'
import { WAVE_TWO } from '../app/domain/shipping'

import { ALL_EXTRAS, ALL_LINES, preferencesWith } from './support'

import type { Quote } from '../app/domain/quote'

const VENGEANCE = 125604
const VENGEANCE_WITH_BIG_BOX = 129737
const ULTIMATE = 129738
const LEGACY_BIG_BOX = 125556
const RECHARGE_PACK = 125536
const ADDITIONAL_RECHARGE_PACK = 125605
const METAL_MARKERS = 129736
const SAM = 128018
const CLASSIC_CREW = 125256
const RETALIATION_SYNTHETIC = 128009

const cart = (quote: Quote): readonly number[] => quote.lines.map((line) => line.product.id)

/** No tax, to read the sums off directly. */
const plain = { includeTax: false } as const

/** Every switch Legacy has items under, so that none of them reaches for another game's. */
const LEGACY_EXTRAS = [
  'gameplay',
  'acrylic',
  'markers',
  'terrain',
  'playmat',
  'artbook',
  'sleeves',
  'sculpts',
  'cats',
  'hoodie',
  'plush',
] as const

// Campaign Update #15 added three pledges, six add-ons and a Big Box that is only in a pledge.
describe('the Vengeance pledge', () => {
  test('is everything Legacy sells, but the Big Box and the SAM Robot Pack', () => {
    const quote = buildQuote(
      preferencesWith({
        ...plain,
        lines: ['legacy'],
        extras: [...LEGACY_EXTRAS],
        // The robot is not in it, and the Classic Crew is Retaliation's.
        overrides: { [SAM]: false, [CLASSIC_CREW]: false },
      }),
    )
    expect(cart(quote)).toEqual([VENGEANCE])
    expect(quote.itemsTotal).toBe(44900)
    expect(quote.bonus).toEqual([])
  })

  test('holds a second Recharge Pack, free, worth what the first is', () => {
    const contents = getProduct(VENGEANCE).setItems
    expect(contents).toContain(RECHARGE_PACK)
    expect(contents).toContain(ADDITIONAL_RECHARGE_PACK)

    const second = msrpOf(getProduct(ADDITIONAL_RECHARGE_PACK))
    expect(second.copyOf?.id).toBe(RECHARGE_PACK)
    expect(second.amount).toBe(msrpOf(getProduct(RECHARGE_PACK)).amount)
    expect(second.amount).toBeGreaterThan(0)
  })
})

// The owner's choice: a switch of their own, which makes sixteen, an even number of cards.
describe('the Metal Malfunction Markers', () => {
  test('have a switch of their own, and are not among the acrylics', () => {
    const preferences = preferencesWith({ lines: ['legacy'] })
    expect(describeExtra(preferences, 'markers').items.map((item) => item.id)).toEqual([
      METAL_MARKERS,
    ])
    expect(describeExtra(preferences, 'acrylic').items.map((item) => item.id)).not.toContain(
      METAL_MARKERS,
    )
  })

  test('come with that switch alone', () => {
    const acrylic = wantedRequirements(preferencesWith({ lines: ['legacy'], extras: ['acrylic'] }))
    expect(acrylic.has(METAL_MARKERS)).toBe(false)
    const markers = wantedRequirements(preferencesWith({ lines: ['legacy'], extras: ['markers'] }))
    expect(markers.has(METAL_MARKERS)).toBe(true)
  })
})

describe('the Legacy Big Box', () => {
  test('is only sold in the Vengeance pledge with it, and says so', () => {
    const item = describeExtra(preferencesWith({ lines: ['legacy'] }), 'bigbox').items.find(
      (candidate) => candidate.id === LEGACY_BIG_BOX,
    )
    expect(item?.soldIn).toBe('Only sold in the Nemesis Legacy Vengeance pledge with BIG BOX')
  })

  test('brings that pledge, and everything in it, when asked for', () => {
    const quote = buildQuote(preferencesWith({ ...plain, lines: ['legacy'], extras: ['bigbox'] }))
    expect(cart(quote)).toEqual([VENGEANCE_WITH_BIG_BOX])
    expect(quote.itemsTotal).toBe(48900)
    expect(quote.bonus.map((product) => product.id)).toContain(METAL_MARKERS)
  })

  // "This pledge is available only in the SINGLE shipping option."
  test('rules out split shipping, since everything is packed into it', () => {
    const quote = buildQuote(
      preferencesWith({ ...plain, lines: ['legacy'], extras: ['bigbox'], shipping: 'split' }),
    )
    expect(quote.canSplit).toBe(false)
    expect(quote.singleOnly?.id).toBe(VENGEANCE_WITH_BIG_BOX)
    expect(quote.shipping).toBe('single')
    expect(quote.waves).toBe(`Everything ships together in the 2nd wave (${WAVE_TWO}).`)
  })
})

describe('the Ultimate Pledge', () => {
  test('is the answer for all four games with nearly every extra', () => {
    const quote = buildQuote(
      preferencesWith({
        ...plain,
        lines: ALL_LINES,
        extras: ALL_EXTRAS.filter((tag) => tag !== 'bigbox'),
      }),
    )
    // It leaves out the robot and Retaliation's synthetic cards; nothing else is needed.
    expect(cart(quote)).toEqual([ULTIMATE, SAM, RETALIATION_SYNTHETIC])
    expect(quote.itemsTotal).toBe(135000 + 800 + 2000)
  })
})

// The shipping table was published before these pledges, and has not been reissued.
describe('the shipping of the new pledges', () => {
  test('is not invented, but left out and said to be', () => {
    const quote = buildQuote(
      preferencesWith({
        ...plain,
        lines: ALL_LINES,
        extras: ALL_EXTRAS.filter((tag) => tag !== 'bigbox'),
      }),
    )
    expect(quote.unpricedPledges.map((pledge) => pledge.id)).toEqual([ULTIMATE])
    expect(quote.shippingTotal).toBe(0)
    // The add-ons are counted apart from it, as before.
    expect(quote.unpricedShipping.map((product) => product.id)).toEqual([
      SAM,
      RETALIATION_SYNTHETIC,
    ])
  })

  test('leaves the pledge a pledge in the cart', () => {
    const quote = buildQuote(preferencesWith({ ...plain, lines: ['legacy'], extras: ['bigbox'] }))
    expect(quote.lines[0]?.isPledge).toBe(true)
    expect(quote.lines[0]?.shipping).toBeNull()
  })
})
