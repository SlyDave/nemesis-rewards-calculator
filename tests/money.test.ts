import { describe, expect, test } from 'bun:test'

import capture from '../data/gamefound.json'
import { catalog } from '../app/domain/catalog'
import { CURRENCIES, FOREIGN_CURRENCIES, isCurrencyCode } from '../app/domain/currencies'
import { DESTINATIONS } from '../app/domain/destinations'
import { formatAmount, formatMoney, formatRate } from '../app/domain/money'
import {
  DEFAULT_PREFERENCES,
  decodePreferences,
  encodePreferences,
} from '../app/domain/preferences'

import { preferencesWith } from './support'

import type { Rates } from '../app/domain/money'

const rates: Rates = { perEuro: catalog.rates, date: '2026-10-08', live: false }

describe('the currencies offered', () => {
  test('start with the euro, the dollar and the pound, then run by name', () => {
    expect(CURRENCIES.slice(0, 3).map(({ code }) => code)).toEqual(['EUR', 'USD', 'GBP'])
    const rest = CURRENCIES.slice(3).map(({ name }) => name)
    expect(rest).toEqual([...rest].sort((a, b) => a.localeCompare(b, 'en')))
  })

  test('are each listed once, with a symbol', () => {
    const codes = CURRENCIES.map(({ code }) => code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const { symbol, name } of CURRENCIES) {
      expect(symbol.trim()).not.toBe('')
      expect(name.trim()).not.toBe('')
    }
  })

  test('include every currency Gamefound’s own menu offers, and mark exactly those', () => {
    const offered = capture.displayCurrencies.map(({ code }) => code)
    for (const code of offered) {
      expect(isCurrencyCode(code)).toBe(true)
    }
    const marked: readonly string[] = CURRENCIES.filter(({ listed }) => listed).map(
      ({ code }) => code,
    )
    // The euro is not in Gamefound's list of alternatives: it is what the others stand in for.
    expect([...marked].sort()).toEqual(['EUR', ...offered].sort())
  })

  test('are otherwise the currencies of the places the campaign ships to, and no others', () => {
    const spentSomewhere = new Set(DESTINATIONS.map(({ currency }) => currency))
    for (const { code, listed } of CURRENCIES) {
      expect(listed || spentSomewhere.has(code)).toBe(true)
    }
    for (const code of spentSomewhere) {
      expect(isCurrencyCode(code)).toBe(true)
    }
  })

  test('each have a starting rate in the catalogue', () => {
    for (const code of FOREIGN_CURRENCIES) {
      expect(catalog.rates[code]).toBeGreaterThan(0)
    }
    expect(Object.keys(catalog.rates).sort()).toEqual([...FOREIGN_CURRENCIES].sort())
  })

  test('are the euro unless the visitor says otherwise', () => {
    expect(DEFAULT_PREFERENCES.currency).toBe('EUR')
  })

  test('survive the round trip in the preferences string, every one', () => {
    for (const { code } of CURRENCIES) {
      const preferences = preferencesWith({ currency: code })
      expect(decodePreferences(encodePreferences(preferences))).toEqual(preferences)
    }
    expect(decodePreferences('13-GB-XXX-')).toBeNull()
  })
})

describe('writing an amount out', () => {
  test('puts the symbol where the currency puts it', () => {
    expect(formatAmount(1234.5, 'EUR')).toBe('€1,234.50')
    expect(formatAmount(1234.5, 'GBP')).toBe('£1,234.50')
    expect(formatAmount(1234.5, 'AUD')).toBe('A$1,234.50')
    expect(formatAmount(1234.5, 'CHF')).toBe('Fr. 1,234.50')
    expect(formatAmount(1234.5, 'PLN')).toBe('1,234.50 zł')
    expect(formatAmount(1234.5, 'DKK')).toBe('1,234.50 kr.')
  })

  test('leaves the decimals off currencies that are not spent in them', () => {
    expect(formatAmount(1234.5, 'JPY')).toBe('¥1,235')
    expect(formatAmount(1234.5, 'HUF')).toBe('1,235 Ft')
    expect(formatAmount(25000, 'VND')).toBe('25,000 ₫')
  })

  test('keeps the sign ahead of the symbol', () => {
    expect(formatAmount(-5, 'USD')).toBe('-$5.00')
    expect(formatAmount(-5, 'SEK')).toBe('-5.00 kr')
  })

  test('converts euro cents at the rate given', () => {
    expect(formatMoney(12900, 'EUR', rates)).toBe('€129.00')
    const pounds = (129 * catalog.rates.GBP).toFixed(2)
    expect(formatMoney(12900, 'GBP', rates)).toBe(`£${pounds}`)
  })

  test('writes a rate to the places that tell one day from the next', () => {
    expect(formatRate('GBP', rates)).toMatch(/^£0\.\d{4}$/)
    expect(formatRate('JPY', rates)).toMatch(/^¥\d{3}\.\d{2}$/)
  })
})
