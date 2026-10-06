import { describe, expect, test } from 'bun:test'

import { decodePreferences, encodePreferences } from '../app/domain/preferences'
import { buildQuote } from '../app/domain/quote'
import { describeExtra, wantedRequirements } from '../app/domain/selection'

import { ALL_EXTRAS, ALL_LINES, preferencesWith } from './support'

const LEGACY_ACRYLIC = 125550
const LEGACY_ACRYLIC_STRETCH_GOALS = 125551
const LEGACY_ACRYLIC_ADD_ONS = 125552
const LEGACY_PLAYMATS = 125555
const ZENITH_OF_RUIN = 125546

describe('picking single items out of a category', () => {
  test('takes one item from a category that is off', () => {
    const preferences = preferencesWith({ overrides: { [LEGACY_ACRYLIC]: true } })
    const wanted = wantedRequirements(preferences)
    expect(wanted.has(LEGACY_ACRYLIC)).toBe(true)
    expect(wanted.has(LEGACY_ACRYLIC_STRETCH_GOALS)).toBe(false)
    expect(describeExtra(preferences, 'acrylic').state).toBe('some')
  })

  test('leaves one item out of a category that is on', () => {
    const preferences = preferencesWith({
      extras: ['acrylic'],
      overrides: { [LEGACY_ACRYLIC_STRETCH_GOALS]: false },
    })
    const wanted = wantedRequirements(preferences)
    expect(wanted.has(LEGACY_ACRYLIC)).toBe(true)
    expect(wanted.has(LEGACY_ACRYLIC_STRETCH_GOALS)).toBe(false)

    const category = describeExtra(preferences, 'acrylic')
    expect(category.state).toBe('some')
    expect(category.wantedCount).toBe(1)
    expect(category.size).toBe(2)
  })

  test('shows a category as all, none or some', () => {
    expect(describeExtra(preferencesWith(), 'acrylic').state).toBe('off')
    expect(describeExtra(preferencesWith({ extras: ['acrylic'] }), 'acrylic').state).toBe('on')
    // Every item ticked by hand is as good as the switch.
    const byHand = preferencesWith({
      overrides: { [LEGACY_ACRYLIC]: true, [LEGACY_ACRYLIC_STRETCH_GOALS]: true },
    })
    expect(describeExtra(byHand, 'acrylic').state).toBe('on')
  })

  test('prices exactly what was picked', () => {
    // The pledge (129), one acrylic pack (17) and the playmats (20).
    const quote = buildQuote(
      preferencesWith({
        includeTax: false,
        overrides: { [LEGACY_ACRYLIC]: true, [LEGACY_PLAYMATS]: true },
      }),
    )
    expect(quote.itemsTotal).toBe(12900 + 1700 + 2000)
  })

  test('takes an item picked for a game that is not included', () => {
    const preferences = preferencesWith({ lines: ['og'], overrides: { [LEGACY_ACRYLIC]: true } })
    expect(wantedRequirements(preferences).has(LEGACY_ACRYLIC)).toBe(true)
    // The original game's own acrylics are untouched by it.
    expect(wantedRequirements(preferences).has(125232)).toBe(false)
  })
})

describe('accessories for the expansions', () => {
  test('wait until their game has an expansion asked for', () => {
    const without = describeExtra(preferencesWith({ extras: ['acrylic'] }), 'acrylic')
    const waiting = without.items.find((item) => item.id === LEGACY_ACRYLIC_ADD_ONS)
    expect(waiting?.wanted).toBe(false)
    expect(waiting?.passedOver).toContain('expansions')
    // Left waiting, it does not stop the category counting as all of it.
    expect(without.state).toBe('on')
  })

  test('follow from a single expansion picked out, not only from the whole category', () => {
    const preferences = preferencesWith({
      extras: ['acrylic'],
      overrides: { [ZENITH_OF_RUIN]: true },
    })
    expect(wantedRequirements(preferences).has(LEGACY_ACRYLIC_ADD_ONS)).toBe(true)
  })

  test('can be picked on their own all the same', () => {
    const preferences = preferencesWith({ overrides: { [LEGACY_ACRYLIC_ADD_ONS]: true } })
    expect(wantedRequirements(preferences).has(LEGACY_ACRYLIC_ADD_ONS)).toBe(true)
  })
})

describe('picks in the preferences string', () => {
  test('survive the round trip', () => {
    const preferences = preferencesWith({
      lines: ALL_LINES,
      extras: ['acrylic', 'playmat'],
      overrides: { [LEGACY_ACRYLIC]: false, [ZENITH_OF_RUIN]: true, 125217: false },
    })
    expect(decodePreferences(encodePreferences(preferences))).toEqual(preferences)
  })

  test('leave the string as it was when there are none', () => {
    expect(encodePreferences(preferencesWith()).split('-')).toHaveLength(4)
  })

  test('drop ids that are not extras, and refuse what is not a list', () => {
    // 2onx is 125517 in base 36: no such product. 2kss is 120364… a pledge, not an extra.
    expect(decodePreferences('13-GB-EUR--2onx.2kss-')?.overrides).toEqual({})
    expect(decodePreferences('13-GB-EUR--NOT A LIST-')).toBeNull()
  })
})

describe('the order of the cart', () => {
  test('is by game, then category, then name', () => {
    const quote = buildQuote(preferencesWith({ lines: ALL_LINES, extras: ALL_EXTRAS }))
    const groups = quote.lines.map((line) => line.group)
    const order = ['legacy', 'retaliation', 'lockdown', 'og', 'other']
    expect(groups).toEqual([...groups].sort((a, b) => order.indexOf(a) - order.indexOf(b)))

    // Within Legacy: the pledge, then the expansion left over, then acrylics in name order.
    const legacy = quote.lines
      .filter((line) => line.group === 'legacy')
      .map((line) => line.product.name)
    expect(legacy.slice(0, 5)).toEqual([
      'Nemesis Legacy Salvation Pledge',
      'SAM - Support and Maintenace Robot add-on',
      'Acrylic Pack for Nemesis Legacy',
      'Acrylic Pack for Nemesis Legacy (Add-ons)',
      'Acrylic Pack for Nemesis Legacy (Stretch Goals)',
    ])
  })

  test('puts merchandise bought on its own after the games', () => {
    const quote = buildQuote(preferencesWith({ lines: ['og'], extras: ['hoodie', 'playmat'] }))
    expect(quote.lines.map((line) => line.group)).toEqual(['og', 'og', 'other'])
    expect(quote.lines.at(-1)?.product.name).toBe('Space Cat Hoodie')
  })

  test('heads the list with the four-game bundle, under Legacy', () => {
    const quote = buildQuote(preferencesWith({ lines: ALL_LINES, extras: ['playmat'] }))
    expect(quote.lines[0]?.product.id).toBe(125606)
    expect(quote.lines[0]?.group).toBe('legacy')
  })
})
