import { describe, expect, test } from 'bun:test'

import { decodePreferences, encodePreferences } from '../app/domain/preferences'
import { buildQuote } from '../app/domain/quote'
import { describeExtra } from '../app/domain/selection'

import { preferencesWith } from './support'

import type { Quote } from '../app/domain/quote'

const SAM = 128018
const SPECIAL_PLEDGE = 120364
const SALVATION_PLEDGE = 125558

const sam = (quote: Quote): Quote['lines'][number] | undefined =>
  quote.lines.find((line) => line.product.id === SAM)

/** No tax, to read the sums off directly. */
const plain = { includeTax: false } as const

describe('the returning backer’s gift', () => {
  test('is in the cart with Legacy, free, without being asked for', () => {
    const quote = buildQuote(preferencesWith({ ...plain, returningBacker: true }))
    expect(quote.lines.map((line) => line.product.id)).toEqual([SPECIAL_PLEDGE, SAM])
    expect(sam(quote)?.price).toBe(0)
    expect(sam(quote)?.isGift).toBe(true)
    // The pledge is paid for; the robot's €8 is value received and money saved.
    expect(quote.itemsTotal).toBe(12900)
    expect(quote.listTotal).toBe(12900 + 800)
    expect(quote.savings).toBe(800)
  })

  test('is an ordinary add-on for anyone else', () => {
    const without = buildQuote(preferencesWith(plain))
    expect(sam(without)).toBeUndefined()

    const bought = buildQuote(preferencesWith({ ...plain, overrides: { [SAM]: true } }))
    expect(sam(bought)?.price).toBe(800)
    expect(sam(bought)?.isGift).toBe(false)
    expect(bought.itemsTotal).toBe(12900 + 800)
  })

  test('stays free when the expansions are bought as well', () => {
    const quote = buildQuote(
      preferencesWith({ ...plain, returningBacker: true, extras: ['gameplay', 'terrain'] }),
    )
    expect(quote.lines.map((line) => line.product.id)).toEqual([SALVATION_PLEDGE, SAM])
    expect(quote.itemsTotal).toBe(26900)
  })

  test('is not added without Legacy, the game it is played in', () => {
    const quote = buildQuote(preferencesWith({ ...plain, returningBacker: true, lines: ['og'] }))
    expect(sam(quote)).toBeUndefined()
  })

  test('can be turned down', () => {
    const quote = buildQuote(
      preferencesWith({ ...plain, returningBacker: true, overrides: { [SAM]: false } }),
    )
    expect(sam(quote)).toBeUndefined()
  })

  test('shows as free under its switch', () => {
    const category = describeExtra(preferencesWith({ returningBacker: true }), 'gameplay')
    const item = category.items.find((candidate) => candidate.id === SAM)
    expect(item?.price).toBe(0)
    expect(item?.wanted).toBe(true)
    expect(category.state).toBe('some')
  })

  test('is remembered in the preferences string, and absent from older ones', () => {
    const preferences = preferencesWith({ returningBacker: true })
    expect(decodePreferences(encodePreferences(preferences))).toEqual(preferences)
    // A link made before there was such a switch.
    expect(decodePreferences('13-GB-EUR-')?.returningBacker).toBe(false)
  })
})
