import { describe, expect, test } from 'bun:test'

import { catalog, findProduct, getProduct, leavesOf } from '../app/domain/catalog'
import { LATEST_QUARTER, priceRiseSince, quarterOf } from '../app/domain/inflation'
import { MSRP_SOURCE_IDS, msrpOf } from '../app/domain/msrp'
import { DEFAULT_PREFERENCES } from '../app/domain/preferences'
import { buildQuote } from '../app/domain/quote'

import { ALL_EXTRAS, ALL_LINES, preferencesWith } from './support'

const LEGACY_CORE_BOX = 120365
const LEGACY_STRETCH_GOALS = 125532
const INFINITY_MODE = 127879
const RETALIATION_CORE_BOX = 125525
const LOCKDOWN_CORE_BOX = 125515
const LOCKDOWN_STRETCH_GOALS = 125516
const CARNOMORPHS = 125204
const SAM = 128018

describe('inflation in Wrocław’s region', () => {
  test('places a day in its quarter', () => {
    expect(quarterOf('2018-09-12')).toEqual({ year: 2018, quarter: 3 })
    expect(quarterOf('2023-11-23')).toEqual({ year: 2023, quarter: 4 })
    expect(quarterOf('2026-01-01')).toEqual({ year: 2026, quarter: 1 })
  })

  test('runs to the latest quarter published', () => {
    expect(priceRiseSince('2020-08-25').to).toEqual(LATEST_QUARTER)
  })

  test('is nothing from the latest quarter on', () => {
    const { year, quarter } = LATEST_QUARTER
    const month = String((quarter - 1) * 3 + 1).padStart(2, '0')
    expect(priceRiseSince(`${String(year)}-${month}-15`).factor).toBe(1)
    expect(priceRiseSince('2026-10-08').factor).toBe(1)
  })

  test('is the year-on-year figures multiplied back, then the quarters left over', () => {
    // From Q4 2023 to Q2 2026: Q2 2026 and Q2 2025 on the year before; then Q2 and Q1 2024.
    expect(priceRiseSince('2023-11-23').factor).toBeCloseTo(1.026 * 1.037 * 1.013 * 1.011, 10)
  })

  test('grows the further back it starts', () => {
    const since2018 = priceRiseSince('2018-09-12').factor
    const since2020 = priceRiseSince('2020-08-25').factor
    const since2023 = priceRiseSince('2023-11-23').factor
    expect(since2018).toBeGreaterThan(since2020)
    expect(since2020).toBeGreaterThan(since2023)
    expect(since2023).toBeGreaterThan(1)
    // About a half more than in 2018, by the published figures.
    expect(since2018).toBeGreaterThan(1.45)
    expect(since2018).toBeLessThan(1.6)
  })

  test('does not go back before its table', () => {
    expect(() => priceRiseSince('2017-12-31')).toThrow()
  })
})

describe('the retail price of an item', () => {
  test('is the MSRP the campaign states, where it states one', () => {
    const coreBox = msrpOf(getProduct(LEGACY_CORE_BOX))
    expect(coreBox.basis).toBe('stated')
    expect(coreBox.amount).toBe(19900)
    expect(coreBox.earlier).toBeNull()
    expect(msrpOf(getProduct(LEGACY_STRETCH_GOALS)).amount).toBe(9900)
  })

  test('is an earlier campaign’s MSRP raised by inflation, where that is all there is', () => {
    const coreBox = msrpOf(getProduct(RETALIATION_CORE_BOX))
    expect(coreBox.basis).toBe('earlierMsrp')
    expect(coreBox.earlier?.amount).toBe(189)
    expect(coreBox.earlier?.campaign.currency).toBe('USD')
    expect(coreBox.earlier?.campaign.date).toBe('2023-11-23')
    // $189 at 1.09 to the euro, then the rise in prices since.
    expect(coreBox.earlier?.euros).toBe(Math.round((189 / 1.09) * 100))
    expect(coreBox.amount).toBe(
      Math.round(Math.round((189 / 1.09) * 100) * priceRiseSince('2023-11-23').factor),
    )
  })

  test('is otherwise the earliest campaign’s price, raised by inflation', () => {
    const carnomorphs = msrpOf(getProduct(CARNOMORPHS))
    expect(carnomorphs.basis).toBe('earlierPrice')
    expect(carnomorphs.earlier?.amount).toBe(30)
    expect(carnomorphs.earlier?.campaign.currency).toBe('GBP')
    expect(carnomorphs.earlier?.campaign.date).toBe('2018-09-12')
    expect(carnomorphs.amount).toBeGreaterThan(carnomorphs.earlier?.euros ?? 0)
  })

  test('is this campaign’s price where no figure exists', () => {
    for (const id of [INFINITY_MODE, SAM]) {
      const product = getProduct(id)
      const item = msrpOf(product)
      expect(item.basis).toBe('campaignPrice')
      expect(item.amount).toBe(product.price)
    }
  })

  test('is counted once where two items were sold at one price', () => {
    const stretchGoals = msrpOf(getProduct(LOCKDOWN_STRETCH_GOALS))
    expect(stretchGoals.basis).toBe('counted')
    expect(stretchGoals.amount).toBe(0)
    expect(stretchGoals.countedWith?.id).toBe(LOCKDOWN_CORE_BOX)
  })
})

describe('the retail prices, against the catalogue', () => {
  test('name only single items that exist', () => {
    for (const id of MSRP_SOURCE_IDS) {
      const product = findProduct(id)
      expect(product, `product ${String(id)}`).toBeDefined()
      expect(product?.isSet).toBe(false)
    }
  })

  test('never count an item with one that is not in the same box', () => {
    const counted = catalog.products
      .filter((product) => !product.isSet)
      .map((product) => msrpOf(product))
      .filter((item) => item.basis === 'counted')
    expect(counted.length).toBeGreaterThan(0)

    for (const item of counted) {
      // It cannot be bought by itself, and every set that holds it holds its other half too.
      expect(item.product.buyable).toBe(false)
      const otherHalf = item.countedWith?.id ?? Number.NaN
      const holders = catalog.products.filter(
        (product) => product.isSet && leavesOf(product).some((leaf) => leaf.id === item.product.id),
      )
      expect(holders.length).toBeGreaterThan(0)
      for (const holder of holders) {
        expect(leavesOf(holder).map((leaf) => leaf.id)).toContain(otherHalf)
      }
    }
  })

  test('are never below nothing, and in whole cents', () => {
    for (const product of catalog.products.filter((candidate) => !candidate.isSet)) {
      const { amount } = msrpOf(product)
      expect(Number.isInteger(amount)).toBe(true)
      expect(amount).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('the MSRP of an order', () => {
  test('is the sum of what is in the cart', () => {
    const quote = buildQuote(DEFAULT_PREFERENCES)
    // Core Box 199 and Stretch Goals 99 as stated; Recharge Pack 5 and Infinity Mode 24 as priced.
    expect(quote.msrp).toHaveLength(4)
    expect(quote.msrpTotal).toBe(19900 + 9900 + 500 + 2400)
    expect(quote.msrpSavings).toBe(quote.msrpTotal - 12900)
  })

  test('has a line for every item in the cart, asked for or not', () => {
    const quote = buildQuote(preferencesWith({ lines: ALL_LINES, extras: ALL_EXTRAS }))
    const items = quote.lines.flatMap((line) => line.contents)
    expect(quote.msrp.map((item) => item.product.id)).toEqual(
      items.map((content) => content.product.id),
    )
    expect(quote.msrpTotal).toBe(quote.msrp.reduce((total, item) => total + item.amount, 0))
  })

  test('is nothing for an empty cart', () => {
    const quote = buildQuote(preferencesWith({ lines: [] }))
    expect(quote.msrp).toEqual([])
    expect(quote.msrpTotal).toBe(0)
    expect(quote.msrpSavings).toBe(0)
  })

  test('leaves shipping, finish and tax out of the comparison', () => {
    const plain = buildQuote(preferencesWith({ includeTax: false }))
    const dressed = buildQuote(
      preferencesWith({ includeTax: true, finish: 'painted', shipping: 'single' }),
    )
    expect(dressed.msrpTotal).toBe(plain.msrpTotal)
    expect(dressed.msrpSavings).toBe(plain.msrpSavings)
  })

  test('counts a returning backer’s gift at its price, though it costs nothing', () => {
    const quote = buildQuote(preferencesWith({ returningBacker: true }))
    const gift = quote.msrp.find((item) => item.product.id === SAM)
    expect(gift?.amount).toBe(800)
    expect(quote.msrpSavings).toBe(quote.msrpTotal - 12900)
  })
})
