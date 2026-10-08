import { describe, expect, test } from 'bun:test'

import { buildQuote } from '../app/domain/quote'

import { ALL_EXTRAS, ALL_LINES, preferencesWith } from './support'

import type { Quote } from '../app/domain/quote'

const SPECIAL = 120364
const STANDARD = 125535
const COLLECTOR = 125557
const SALVATION = 125558
const FOUR_CORE = 125606
const OG_PLEDGE = 125507
const PROMO_BUNDLE = 125513
const SAM = 128018
const SLEEVES_WITH_ADDONS = 128437

const cart = (quote: Quote): readonly number[] => quote.lines.map((line) => line.product.id)

/** No tax and nothing but the items, to check the combination itself. */
const itemsOnly = { includeTax: false } as const

describe('the best combination', () => {
  test('is the Special Edition pledge by default', () => {
    const quote = buildQuote(preferencesWith(itemsOnly))
    expect(cart(quote)).toEqual([SPECIAL])
    expect(quote.itemsTotal).toBe(12900)
  })

  test('is the Standard Edition pledge for standees', () => {
    const quote = buildQuote(preferencesWith({ ...itemsOnly, edition: 'standard' }))
    expect(cart(quote)).toEqual([STANDARD])
    expect(quote.itemsTotal).toBe(8900)
  })

  test('is nothing when nothing is asked for', () => {
    const quote = buildQuote(preferencesWith({ lines: [] }))
    expect(quote.lines).toEqual([])
    expect(quote.total).toBe(0)
  })

  test('is the four-game bundle for all four games', () => {
    const quote = buildQuote(preferencesWith({ ...itemsOnly, lines: ALL_LINES }))
    expect(cart(quote)).toEqual([FOUR_CORE])
    expect(quote.itemsTotal).toBe(41900)
    expect(quote.listTotal).toBe(46200)
    expect(quote.savings).toBe(4300)
  })

  // 89 + 109 + 115 + 109 = 422 bought separately; the bundle is 419 and upgrades Legacy.
  test('is the four-game bundle even for a Standard backer, because it is cheaper', () => {
    const quote = buildQuote(
      preferencesWith({ ...itemsOnly, lines: ALL_LINES, edition: 'standard' }),
    )
    expect(cart(quote)).toEqual([FOUR_CORE])
    expect(quote.bonus).toEqual([])
  })

  test('is separate pledges for three of the four games', () => {
    const quote = buildQuote(preferencesWith({ ...itemsOnly, lines: ['legacy', 'og', 'lockdown'] }))
    expect(quote.lines).toHaveLength(3)
    expect(quote.itemsTotal).toBe(12900 + 10900 + 11500)
  })

  test("is the Collector's Pledge for exactly what it contains", () => {
    const quote = buildQuote(
      preferencesWith({ ...itemsOnly, extras: ['acrylic', 'terrain', 'playmat'] }),
    )
    expect(cart(quote)).toEqual([COLLECTOR])
    expect(quote.itemsTotal).toBe(20500)
    expect(quote.bonus).toEqual([])
  })

  // 129 + 17 + 7 + 39 = 192 beats the 205 pledge when the playmats are not wanted.
  test("is not the Collector's Pledge when its parts are cheaper", () => {
    const quote = buildQuote(preferencesWith({ ...itemsOnly, extras: ['acrylic', 'terrain'] }))
    expect(cart(quote)).not.toContain(COLLECTOR)
    expect(quote.itemsTotal).toBe(19200)
  })

  // Salvation (269) + SAM (8) = 277, against 289.50 for the same things one by one.
  test('is the Salvation Pledge for the gameplay expansions and terrain', () => {
    const quote = buildQuote(preferencesWith({ ...itemsOnly, extras: ['gameplay', 'terrain'] }))
    expect(cart(quote)).toEqual([SALVATION, SAM])
    expect(quote.itemsTotal).toBe(27700)
  })

  // Salvation with the Terrain Pack thrown in (277) still beats the expansions alone (250.50)?
  // No: 129 + 65 + 3.50 + 10 + 35 + 8 = 250.50, so it is bought one by one.
  test('does not take the Salvation Pledge when the Terrain Pack is not wanted', () => {
    const quote = buildQuote(preferencesWith({ ...itemsOnly, extras: ['gameplay'] }))
    expect(cart(quote)).not.toContain(SALVATION)
    expect(quote.itemsTotal).toBe(25050)
  })

  test('takes the promo bundle rather than four promo packs', () => {
    const quote = buildQuote(preferencesWith({ ...itemsOnly, lines: ['og'], extras: ['promo'] }))
    expect(cart(quote)).toEqual([OG_PLEDGE, PROMO_BUNDLE])
    expect(quote.itemsTotal).toBe(10900 + 1500)
  })

  test('takes the one larger sleeve set when the add-ons need sleeving too', () => {
    const quote = buildQuote(preferencesWith({ ...itemsOnly, extras: ['gameplay', 'sleeves'] }))
    const sleeves = cart(quote).filter((id) => id === 128436 || id === SLEEVES_WITH_ADDONS)
    expect(sleeves).toEqual([SLEEVES_WITH_ADDONS])
  })

  test('lists what a bundle brings that was not asked for', () => {
    // Everything for the original game except the dice tray: the all-in Intruder Pledge and
    // a Big Box (468) beat the Captain's Pledge topped up one item at a time (482).
    const quote = buildQuote(
      preferencesWith({
        ...itemsOnly,
        lines: ['og'],
        extras: ALL_EXTRAS.filter((tag) => tag !== 'dicetray'),
      }),
    )
    expect(cart(quote)).toEqual([125512, 125235])
    expect(quote.itemsTotal).toBe(46800)
    expect(quote.bonus.map((product) => product.id)).toEqual([125218])
  })

  // Without the hoodie as well, the Captain's Pledge and the rest one by one is 462.
  test('drops the all-in pledge once enough of it is unwanted', () => {
    const quote = buildQuote(
      preferencesWith({
        ...itemsOnly,
        lines: ['og'],
        extras: ALL_EXTRAS.filter((tag) => tag !== 'hoodie'),
      }),
    )
    expect(cart(quote)).toContain(125511)
    expect(quote.itemsTotal).toBe(46200)
    expect(quote.bonus).toEqual([])
  })
})

describe('shipping', () => {
  test('is cheaper sent in one go', () => {
    const split = buildQuote(preferencesWith({ ...itemsOnly, destination: 'GB' }))
    const single = buildQuote(
      preferencesWith({ ...itemsOnly, destination: 'GB', shipping: 'single' }),
    )
    expect(split.shippingTotal).toBe(3900)
    expect(single.shippingTotal).toBe(2700)
  })

  test('follows the destination', () => {
    const quote = (destination: string): Quote =>
      buildQuote(preferencesWith({ ...itemsOnly, destination }))
    expect(quote('DE').shippingTotal).toBe(3800)
    expect(quote('PL').shippingTotal).toBe(1800)
    expect(quote('US').shippingTotal).toBe(3900)
    expect(quote('JP').shippingTotal).toBe(9900)
    expect(quote('NO').shippingTotal).toBe(5600)
  })

  test('has the four-game bundle at its own price', () => {
    const quote = buildQuote(preferencesWith({ ...itemsOnly, lines: ALL_LINES }))
    expect(quote.shippingTotal).toBe(9700)
  })

  test('adds up the pledges of a mixed order', () => {
    const quote = buildQuote(preferencesWith({ ...itemsOnly, lines: ['legacy', 'og'] }))
    expect(quote.shippingTotal).toBe(3900 + 2400)
    expect(quote.waves).toContain('1st wave')
    expect(quote.waves).toContain('2nd')
  })

  test('has no price yet for add-ons bought on their own', () => {
    const quote = buildQuote(preferencesWith({ ...itemsOnly, extras: ['artbook'] }))
    expect(quote.unpricedShipping.map((product) => product.id)).toEqual([125540])
    expect(quote.shippingTotal).toBe(3900)
  })

  test('sends the older games on their own in the first wave', () => {
    const quote = buildQuote(preferencesWith({ ...itemsOnly, lines: ['lockdown'] }))
    expect(quote.waves).toContain('1st wave')
    expect(quote.waves).not.toContain('2nd')
  })

  test('sends the Legacy Core Box ahead of the rest of Legacy', () => {
    const quote = buildQuote(preferencesWith({ ...itemsOnly, lines: ['legacy', 'lockdown'] }))
    expect(quote.waves).toBe(
      'The older games and the Legacy Core Box ship in the 1st wave (Q4 2027); the Legacy stretch goals and add-ons follow in the 2nd (Q3 2028).',
    )
  })

  // Evolved Void Seeders are a Legacy add-on that Retaliation's expansions switch takes.
  test('does not speak of a Legacy Core Box that is not in the order', () => {
    const order = { ...itemsOnly, lines: ['retaliation'], extras: ['gameplay'] } as const
    expect(buildQuote(preferencesWith(order)).waves).toBe(
      'The older games ship in the 1st wave (Q4 2027); the Legacy add-ons follow in the 2nd (Q3 2028).',
    )
    expect(buildQuote(preferencesWith({ ...order, shipping: 'single' })).waves).toBe(
      'Everything ships together in the 2nd wave (Q3 2028).',
    )
  })

  test('sends Legacy add-ons bought on their own in the second wave', () => {
    const quote = buildQuote(
      preferencesWith({ ...itemsOnly, lines: [], overrides: { [SAM]: true } }),
    )
    expect(cart(quote)).toEqual([SAM])
    expect(quote.waves).toBe('Everything ships together in the 2nd wave (Q3 2028).')
  })
})

describe('tax', () => {
  test('is charged on the items and the shipping at the destination’s rate', () => {
    const quote = buildQuote(preferencesWith({ destination: 'GB' }))
    expect(quote.taxRate).toBe(20)
    expect(quote.taxTotal).toBe(Math.round((12900 + 3900) * 0.2))
    expect(quote.total).toBe(12900 + 3900 + quote.taxTotal)
  })

  test('can be switched off', () => {
    const quote = buildQuote(preferencesWith({ destination: 'GB', includeTax: false }))
    expect(quote.taxTotal).toBe(0)
    expect(quote.total).toBe(12900 + 3900)
  })

  test('uses a corrected rate over the destination’s own', () => {
    const quote = buildQuote(preferencesWith({ destination: 'US', taxRate: 8.25 }))
    expect(quote.taxTotal).toBe(Math.round((12900 + 3900) * 0.0825))
  })

  test('is nothing where the campaign collects none', () => {
    expect(buildQuote(preferencesWith({ destination: 'AU' })).taxTotal).toBe(0)
  })
})

describe('the miniatures finish', () => {
  test('adds each wanted item’s surcharge', () => {
    const quote = buildQuote(preferencesWith({ ...itemsOnly, finish: 'sundrop' }))
    expect(quote.finishTotal).toBe(3300)
    expect(quote.total).toBe(12900 + 3300 + quote.shippingTotal)
  })

  test('costs nothing on the Standard Edition, which has no miniatures', () => {
    const quote = buildQuote(
      preferencesWith({ ...itemsOnly, edition: 'standard', finish: 'painted' }),
    )
    expect(quote.finishTotal).toBe(0)
  })

  test('is not charged on a bundle’s uninvited items', () => {
    const everythingButTerrain = preferencesWith({
      ...itemsOnly,
      lines: ['og'],
      extras: ALL_EXTRAS.filter((tag) => tag !== 'terrain'),
      finish: 'sundrop',
    })
    const quote = buildQuote(everythingButTerrain)
    const terrain = quote.lines
      .flatMap((line) => line.contents)
      .filter((content) => content.product.id === 125206)
    for (const content of terrain) {
      expect(content.wanted).toBe(false)
      expect(content.finish).toBe(0)
    }
  })
})
