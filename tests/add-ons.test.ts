import { describe, expect, test } from 'bun:test'

import { buildQuote } from '../app/domain/quote'
import { describeExtra, wantedRequirements } from '../app/domain/selection'

import { preferencesWith } from './support'

const DICE_TRAY = 125218
const LEGACY_PLAYMATS = 125555
const OG_PLAYMAT = 125217
const SPACE_CAT_HOODIE = 125234
const RACOON_HOODIE = 125245
const EVOLVED_VOID_SEEDERS = 125545
const ZENITH_OF_RUIN = 125546
const SANGREVORES = 125249
const CARNOMORPHS = 125204
const MEDIC = 125205
const CONSTRUCTS_PACK = 125233
const TERRAIN_EXPANSION = 125206

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

// Gamefound describes a few add-ons as played in a second game besides the one they are sold with.
describe('add-ons that are played in two games', () => {
  test('Evolved Void Seeders go with Legacy, and with Retaliation', () => {
    const forLegacy = wantedRequirements(
      preferencesWith({ lines: ['legacy'], extras: ['gameplay'] }),
    )
    expect(forLegacy.has(EVOLVED_VOID_SEEDERS)).toBe(true)

    const forRetaliation = wantedRequirements(
      preferencesWith({ lines: ['retaliation'], extras: ['gameplay'] }),
    )
    expect(forRetaliation.has(EVOLVED_VOID_SEEDERS)).toBe(true)
    expect(forRetaliation.has(SANGREVORES)).toBe(true)
    // The rest of Legacy's expansions are for Legacy alone.
    expect(forRetaliation.has(ZENITH_OF_RUIN)).toBe(false)
  })

  test('are passed over with neither game, and say whose they are', () => {
    const preferences = preferencesWith({ lines: ['og'], extras: ['gameplay'] })
    expect(wantedRequirements(preferences).has(EVOLVED_VOID_SEEDERS)).toBe(false)

    const item = describeExtra(preferences, 'gameplay').items.find(
      (candidate) => candidate.id === EVOLVED_VOID_SEEDERS,
    )
    expect(item?.name).toBe('Evolved Void Seeders')
    expect(item?.passedOver).toBe(
      'For Nemesis Legacy or Nemesis Retaliation, neither of which is included',
    )
  })

  test('the Carnomorphs and the Medic go with Lockdown as well as the original', () => {
    const wanted = wantedRequirements(
      preferencesWith({ lines: ['lockdown'], extras: ['gameplay'] }),
    )
    expect(wanted.has(CARNOMORPHS)).toBe(true)
    expect(wanted.has(MEDIC)).toBe(true)
    // Lockdown has expansions to take, so its switch stops at those.
    expect(wanted.has(SANGREVORES)).toBe(false)
    expect(wanted.has(EVOLVED_VOID_SEEDERS)).toBe(false)
  })

  test('the Constructs Pack goes with Lockdown; the Terrain Expansion is the original’s alone', () => {
    const wanted = wantedRequirements(preferencesWith({ lines: ['lockdown'], extras: ['terrain'] }))
    expect(wanted.has(CONSTRUCTS_PACK)).toBe(true)
    expect(wanted.has(TERRAIN_EXPANSION)).toBe(false)
  })

  test('are listed in the cart under the game they are sold with', () => {
    const quote = buildQuote(
      preferencesWith({ lines: ['retaliation'], extras: ['gameplay'], includeTax: false }),
    )
    const line = quote.lines.find((candidate) => candidate.product.id === EVOLVED_VOID_SEEDERS)
    expect(line?.group).toBe('legacy')
    expect(line?.price).toBe(3500)
    expect(line?.shipping).toBeNull()
  })
})
