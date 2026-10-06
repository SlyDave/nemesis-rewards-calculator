import { describe, expect, test } from 'bun:test'

import {
  DEFAULT_PREFERENCES,
  countExtras,
  decodePreferences,
  encodePreferences,
  wantedRequirements,
} from '../app/domain/preferences'

import { ALL_EXTRAS, ALL_LINES, preferencesWith, seededRandom } from './support'

describe('what is wanted', () => {
  test('is the core of each included game', () => {
    expect([...wantedRequirements(DEFAULT_PREFERENCES)].sort((a, b) => a - b)).toEqual([
      120365, 125532, 125536, 127879,
    ])
    expect(wantedRequirements(preferencesWith({ lines: [] })).size).toBe(0)
  })

  test('swaps miniatures for standees with the edition', () => {
    const wanted = wantedRequirements(preferencesWith({ edition: 'standard' }))
    expect(wanted.has(125533)).toBe(true)
    expect(wanted.has(120365)).toBe(false)
  })

  test('adds an extra only for the games that are included', () => {
    const wanted = wantedRequirements(preferencesWith({ lines: ['legacy'], extras: ['playmat'] }))
    expect(wanted.has(125555)).toBe(true)
    expect(wanted.has(125217)).toBe(false)
  })

  test('wants add-on acrylics and sleeves only alongside the expansions they are for', () => {
    const without = wantedRequirements(preferencesWith({ extras: ['acrylic', 'sleeves'] }))
    const withExpansions = wantedRequirements(
      preferencesWith({ extras: ['acrylic', 'sleeves', 'gameplay'] }),
    )
    expect(without.has(125552)).toBe(false)
    expect(without.has(128437)).toBe(false)
    expect(withExpansions.has(125552)).toBe(true)
    expect(withExpansions.has(128437)).toBe(true)
  })
})

describe('counting what a switch stands for', () => {
  test('counts across the included games', () => {
    expect(countExtras(preferencesWith({ lines: ['legacy'] })).hoodie).toBe(0)
    expect(countExtras(preferencesWith({ lines: ALL_LINES })).hoodie).toBe(3)
    expect(countExtras(preferencesWith({ lines: ALL_LINES })).playmat).toBe(4)
  })
})

describe('the preferences as a string', () => {
  test('survive the round trip', () => {
    const random = seededRandom(7)
    for (let run = 0; run < 200; run += 1) {
      const preferences = preferencesWith({
        lines: ALL_LINES.filter(() => random() < 0.5),
        extras: ALL_EXTRAS.filter(() => random() < 0.5),
        edition: random() < 0.5 ? 'standard' : 'special',
        shipping: random() < 0.5 ? 'split' : 'single',
        finish: (['plain', 'sundrop', 'painted'] as const)[Math.floor(random() * 3)] ?? 'plain',
        includeTax: random() < 0.5,
        destination: random() < 0.5 ? 'DE' : 'US',
        currency: random() < 0.5 ? 'GBP' : 'USD',
        taxRate: random() < 0.5 ? null : 25.5,
      })
      expect(decodePreferences(encodePreferences(preferences))).toEqual(preferences)
    }
  })

  test('are refused when they are not ours', () => {
    for (const code of [
      '',
      'nonsense',
      'zz-GB',
      '1-ZZ-EUR-',
      '1-GB-XXX-',
      '1-GB-EUR-900',
      '1-GB-EUR--',
    ]) {
      expect(decodePreferences(code), code).toBeNull()
    }
  })
})
