import { describe, expect, test } from 'bun:test'

import { buildQuote } from '../app/domain/quote'
import { describeExtra, wantedRequirements } from '../app/domain/selection'

import { preferencesWith } from './support'

const DICE_TRAY = 125218
const LEGACY_PLAYMATS = 125555
const OG_PLAYMAT = 125217
const SPACE_CAT_HOODIE = 125234
const RACOON_HOODIE = 125245

describe('add-ons and the games they belong to', () => {
  // The dice tray is sold with the original game, and wanted by people who are not buying it.
  test('a switch takes its whole category when none of it belongs to an included game', () => {
    const preferences = preferencesWith({ lines: ['legacy'], extras: ['dicetray'] })
    expect(wantedRequirements(preferences).has(DICE_TRAY)).toBe(true)

    const category = describeExtra(preferences, 'dicetray')
    expect(category.state).toBe('on')
    expect(category.size).toBe(1)
    expect(category.items.every((item) => item.passedOver === null)).toBe(true)
  })

  test('the dice tray goes in the cart beside a Legacy pledge', () => {
    const quote = buildQuote(
      preferencesWith({ lines: ['legacy'], extras: ['dicetray'], includeTax: false }),
    )
    expect(quote.lines.map((line) => line.product.id)).toEqual([120364, DICE_TRAY])
    expect(quote.itemsTotal).toBe(12900 + 1000)
  })

  test('a switch keeps to the included games when the category has something for them', () => {
    const preferences = preferencesWith({ lines: ['legacy'], extras: ['playmat'] })
    const wanted = wantedRequirements(preferences)
    expect(wanted.has(LEGACY_PLAYMATS)).toBe(true)
    expect(wanted.has(OG_PLAYMAT)).toBe(false)
  })

  test('the rest of the category is listed, passed over, and can be ticked', () => {
    const preferences = preferencesWith({ lines: ['legacy'], extras: ['playmat'] })
    const category = describeExtra(preferences, 'playmat')
    expect(category.items).toHaveLength(4)
    expect(category.state).toBe('on')
    expect(category.size).toBe(1)

    const other = category.items.find((item) => item.id === OG_PLAYMAT)
    expect(other?.wanted).toBe(false)
    expect(other?.passedOver).toContain('Nemesis OG')

    const ticked = { ...preferences, overrides: { [OG_PLAYMAT]: true } }
    expect(wantedRequirements(ticked).has(OG_PLAYMAT)).toBe(true)
    // Both are now asked for and both count: the category is still all there.
    expect(describeExtra(ticked, 'playmat').state).toBe('on')
    expect(describeExtra(ticked, 'playmat').size).toBe(2)
  })

  test('an add-on can be ordered with no game at all', () => {
    const quote = buildQuote(preferencesWith({ lines: [], extras: ['dicetray'] }))
    expect(quote.lines.map((line) => line.product.id)).toEqual([DICE_TRAY])
    // Nothing in the order is a pledge, so nothing in it has a published shipping price.
    expect(quote.shippingTotal).toBe(0)
    expect(quote.unpricedShipping).toHaveLength(1)
  })

  test('hoodies follow the included games, or come as a set where none has one', () => {
    const withOriginal = wantedRequirements(preferencesWith({ lines: ['og'], extras: ['hoodie'] }))
    expect(withOriginal.has(SPACE_CAT_HOODIE)).toBe(true)
    expect(withOriginal.has(RACOON_HOODIE)).toBe(false)

    const legacyOnly = wantedRequirements(
      preferencesWith({ lines: ['legacy'], extras: ['hoodie'] }),
    )
    expect(legacyOnly.has(SPACE_CAT_HOODIE)).toBe(true)
    expect(legacyOnly.has(RACOON_HOODIE)).toBe(true)
  })
})
