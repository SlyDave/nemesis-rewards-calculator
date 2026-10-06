import { describe, expect, test } from 'bun:test'

import { describeExtra, wantedRequirements } from '../app/domain/selection'
import { buildQuote } from '../app/domain/quote'

import { ALL_LINES, preferencesWith } from './support'

import type { GameLine } from '../app/domain/types'

const CLASSIC_CREW = 125256

/** Whether the Classic Crew is asked for, with the Alternative Sculpts switch on. */
const isWanted = (lines: readonly GameLine[]): boolean =>
  wantedRequirements(preferencesWith({ lines, extras: ['sculpts'] })).has(CLASSIC_CREW)

describe('the Classic Crew', () => {
  test('is wanted for a newer game when either classic game is missing', () => {
    expect(isWanted(['retaliation'])).toBe(true)
    expect(isWanted(['legacy'])).toBe(true)
    expect(isWanted(['legacy', 'og'])).toBe(true)
    expect(isWanted(['legacy', 'lockdown'])).toBe(true)
    expect(isWanted(['retaliation', 'og'])).toBe(true)
    expect(isWanted(['retaliation', 'lockdown'])).toBe(true)
    expect(isWanted(['legacy', 'retaliation', 'og'])).toBe(true)
  })

  test('is not wanted once both classic games are included', () => {
    expect(isWanted(['retaliation', 'og', 'lockdown'])).toBe(false)
    expect(isWanted(['legacy', 'og', 'lockdown'])).toBe(false)
    expect(isWanted(ALL_LINES)).toBe(false)
  })

  test('is not wanted without a newer game to play it in', () => {
    expect(isWanted(['og'])).toBe(false)
    expect(isWanted(['lockdown'])).toBe(false)
    expect(isWanted(['og', 'lockdown'])).toBe(false)
  })

  test('still waits for its switch', () => {
    const wanted = wantedRequirements(preferencesWith({ lines: ['legacy', 'og'] }))
    expect(wanted.has(CLASSIC_CREW)).toBe(false)
  })

  test('is counted under its switch only when it is on offer', () => {
    expect(describeExtra(preferencesWith({ lines: ['legacy'] }), 'sculpts').size).toBe(1)
    // Alien Kings, Lockdown Kings, and Retaliation's Queen and Kings: no Classic Crew.
    expect(describeExtra(preferencesWith({ lines: ALL_LINES }), 'sculpts').size).toBe(4)
  })

  test('goes in the cart as an add-on for Legacy with one classic game', () => {
    const quote = buildQuote(preferencesWith({ lines: ['legacy', 'og'], extras: ['sculpts'] }))
    expect(quote.lines.map((line) => line.product.id)).toContain(CLASSIC_CREW)
  })

  test('stays out of the cart with all four games', () => {
    const quote = buildQuote(preferencesWith({ lines: ALL_LINES, extras: ['sculpts'] }))
    const everything = quote.lines.flatMap((line) => line.contents.map((item) => item.product.id))
    expect(everything).not.toContain(CLASSIC_CREW)
  })
})
