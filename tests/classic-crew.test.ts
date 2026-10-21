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
  test('is wanted for Retaliation when either classic game is missing', () => {
    expect(isWanted(['retaliation'])).toBe(true)
    expect(isWanted(['retaliation', 'og'])).toBe(true)
    expect(isWanted(['retaliation', 'lockdown'])).toBe(true)
    expect(isWanted(['legacy', 'retaliation', 'og'])).toBe(true)
  })

  // The owner's choice of 21 October 2026: Gamefound calls it "compatible with Nemesis
  // Retaliation", and the campaign's FAQ says earlier campaigns' content will not work with
  // Nemesis: Legacy.
  test('is not wanted for Legacy, which it does not work with', () => {
    expect(isWanted(['legacy'])).toBe(false)
    expect(isWanted(['legacy', 'og'])).toBe(false)
    expect(isWanted(['legacy', 'lockdown'])).toBe(false)
  })

  test('is not wanted once both classic games are included', () => {
    expect(isWanted(['retaliation', 'og', 'lockdown'])).toBe(false)
    expect(isWanted(['legacy', 'og', 'lockdown'])).toBe(false)
    expect(isWanted(ALL_LINES)).toBe(false)
  })

  test('is not wanted without Retaliation to play it in', () => {
    expect(isWanted(['og'])).toBe(false)
    expect(isWanted(['lockdown'])).toBe(false)
    expect(isWanted(['og', 'lockdown'])).toBe(false)
  })

  test('still waits for its switch', () => {
    const wanted = wantedRequirements(preferencesWith({ lines: ['retaliation', 'og'] }))
    expect(wanted.has(CLASSIC_CREW)).toBe(false)
  })

  test('is counted under its switch only when it is on offer', () => {
    // Legacy's own Alternative Character Sculpts and New Kings; not the Classic Crew.
    expect(describeExtra(preferencesWith({ lines: ['legacy'] }), 'sculpts').size).toBe(2)
    // Retaliation's Queen, its Kings and Queen, and the Classic Crew.
    expect(describeExtra(preferencesWith({ lines: ['retaliation'] }), 'sculpts').size).toBe(3)
    // Alien Kings, Lockdown Kings, Retaliation's Queen and Kings, Legacy's two: no Classic Crew.
    expect(describeExtra(preferencesWith({ lines: ALL_LINES }), 'sculpts').size).toBe(6)
  })

  test('can still be ticked for a Legacy order', () => {
    const item = describeExtra(preferencesWith({ lines: ['legacy'] }), 'sculpts').items.find(
      (candidate) => candidate.id === CLASSIC_CREW,
    )
    expect(item?.wanted).toBe(false)
    expect(item?.passedOver).toBe(
      'Only needed for Retaliation without both Nemesis OG and Lockdown',
    )

    const picked = buildQuote(
      preferencesWith({ lines: ['legacy'], overrides: { [CLASSIC_CREW]: true } }),
    )
    expect(picked.lines.map((line) => line.product.id)).toContain(CLASSIC_CREW)
  })

  test('goes in the cart as an add-on for Retaliation with one classic game', () => {
    const quote = buildQuote(preferencesWith({ lines: ['retaliation', 'og'], extras: ['sculpts'] }))
    expect(quote.lines.map((line) => line.product.id)).toContain(CLASSIC_CREW)
  })

  test('stays out of the cart with all four games', () => {
    const quote = buildQuote(preferencesWith({ lines: ALL_LINES, extras: ['sculpts'] }))
    const everything = quote.lines.flatMap((line) => line.contents.map((item) => item.product.id))
    expect(everything).not.toContain(CLASSIC_CREW)
  })
})
