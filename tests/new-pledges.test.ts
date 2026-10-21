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
const RETALIATION_SYNTHETIC = 128009
const FOUR_CORE = 125606

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
        // The robot is not in it.
        overrides: { [SAM]: false },
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
    expect(item?.soldIn).toBe('Only sold in the Nemesis Legacy Vengeance Pledge with BIG BOX')
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
// The shipping table was published before these pledges, and has not been reissued. Each is
// counted at the least its shipping can be: that of the biggest priced pledge it holds whole.
// The shipping table was reissued after campaign Update #15, with the Vengeance and ULTIMATE
// pledges in it but not the Vengeance pledge with BIG BOX.
describe('the shipping of the new pledges', () => {
  const everythingButBigBoxes = ALL_EXTRAS.filter((tag) => tag !== 'bigbox')
  /** All four games and every extra the Ultimate holds, which is then the whole cart. */
  const ultimateAlone = {
    ...plain,
    lines: ALL_LINES,
    extras: everythingButBigBoxes,
    overrides: { [SAM]: false, [RETALIATION_SYNTHETIC]: false },
  }

  // "ULTIMATE PLEDGE … EU €145 … UK €145" under single shipping; €165 under split.
  test('is the table’s for the ULTIMATE Pledge: 145 sent at once, 165 split', () => {
    const single = buildQuote(preferencesWith({ ...ultimateAlone, shipping: 'single' }))
    expect(cart(single)).toEqual([ULTIMATE])
    expect(single.shippingTotal).toBe(14500)
    expect(single.unpricedPledges).toEqual([])
    expect(
      buildQuote(preferencesWith({ ...ultimateAlone, shipping: 'single', destination: 'DE' }))
        .shippingTotal,
    ).toBe(14500)
    expect(buildQuote(preferencesWith(ultimateAlone)).shippingTotal).toBe(16500)
  })

  test('is the table’s for the Vengeance pledge: 49 at once to the UK, 65 split', () => {
    const preferences = preferencesWith({
      ...plain,
      lines: ['legacy'],
      extras: [...LEGACY_EXTRAS],
      overrides: { [SAM]: false },
    })
    expect(buildQuote(preferences).shippingTotal).toBe(6500)
    expect(buildQuote({ ...preferences, shipping: 'single' }).shippingTotal).toBe(4900)
  })

  test('is counted at the least it can be for the one the table leaves out, and said to be', () => {
    // The Big Box pledge holds all of the Vengeance pledge, so costs no less to send: 49, single.
    const quote = buildQuote(preferencesWith({ ...plain, lines: ['legacy'], extras: ['bigbox'] }))
    expect(quote.unpricedPledges.map((pledge) => pledge.id)).toEqual([VENGEANCE_WITH_BIG_BOX])
    expect(quote.lines[0]?.isPledge).toBe(true)
    expect(quote.lines[0]?.shipping).toBeNull()
    expect(quote.lines[0]?.shippingFloor?.from.id).toBe(VENGEANCE)
    expect(quote.shippingTotal).toBe(4900)
  })

  // Reported on 20 October 2026: with every extra but the Big Boxes the answer was the Ultimate,
  // and leaving out the Hoodies and the Cats as well made the total go up. The rewards did
  // come down, by €7.50, but the Ultimate's shipping had been counted as nothing.
  test('lets leaving things out bring the total down, not up', () => {
    const everything = buildQuote(
      preferencesWith({ lines: ALL_LINES, extras: everythingButBigBoxes }),
    )
    const fewer = buildQuote(
      preferencesWith({
        lines: ALL_LINES,
        extras: everythingButBigBoxes.filter((tag) => tag !== 'hoodie' && tag !== 'cats'),
      }),
    )
    expect(cart(everything)[0]).toBe(ULTIMATE)
    expect(cart(fewer)[0]).toBe(FOUR_CORE)
    expect(fewer.itemsTotal).toBeLessThan(everything.itemsTotal)
    expect(fewer.total).toBeLessThan(everything.total)
  })
})
