import type { Edition, ExtraTag, GameLine, Tag } from './types'

/**
 * How the catalogue maps onto the switches.
 *
 * Gamefound says what each product costs and what each bundle contains, but not what any of
 * it *is*: that a playmat is a playmat, or that the Lockdown Stretch Goals sold on their own
 * are the same thing as the ones inside the Lockdown pledge. This file says so, by hand. A
 * test (tests/catalog.test.ts) fails when the catalogue gains a product this file has not
 * heard of, which is the cue to classify it here.
 */

/** Which of the games are included. */
export type LineSelection = Readonly<Record<GameLine, boolean>>

/** Something a visitor can want: one single item, identified by its Gamefound product id. */
export interface Requirement {
  readonly id: number
  readonly line: GameLine
  readonly tag: Tag
  /**
   * A second game the item is played in, by Gamefound's own description of it. With either
   * game included it goes with the order. Without this, an item goes with exactly its own game.
   */
  readonly alsoWith?: GameLine
  /** For the rare item whose usefulness depends on more than which game it is played in. */
  readonly when?: (lines: LineSelection) => boolean
  /** Said beside such an item when its switch passes it over, in place of naming its game. */
  readonly whenNote?: string
  /** A second switch that must also be on, for extras that only serve other extras. */
  readonly needs?: ExtraTag
  /** For the Legacy core, which comes with standees or with miniatures. */
  readonly edition?: Edition
}

const core = (line: GameLine, ...ids: readonly number[]): readonly Requirement[] =>
  ids.map((id) => ({ id, line, tag: 'core' }))

const extra = (line: GameLine, tag: ExtraTag, ...ids: readonly number[]): readonly Requirement[] =>
  ids.map((id) => ({ id, line, tag }))

/** An extra sold with one game that Gamefound says is played in a second one as well. */
const shared = (
  line: GameLine,
  alsoWith: GameLine,
  tag: ExtraTag,
  ...ids: readonly number[]
): readonly Requirement[] => ids.map((id) => ({ id, line, tag, alsoWith }))

/** An extra for the gameplay expansions: pointless, so unwanted, without them. */
const forExpansions = (
  line: GameLine,
  tag: ExtraTag,
  ...ids: readonly number[]
): readonly Requirement[] => ids.map((id) => ({ id, line, tag, needs: 'gameplay' }))

/**
 * The Classic Crew is the twelve characters of the original game and of Lockdown, as
 * miniatures to play them in the newer games. Whoever includes both of those games has all
 * twelve already; anyone with only one of them, or neither, is short of some.
 */
const needsClassicCrew = (lines: LineSelection): boolean =>
  (lines.retaliation || lines.legacy) && !(lines.og && lines.lockdown)

export const REQUIREMENTS: readonly Requirement[] = [
  // --- Nemesis Legacy ---------------------------------------------------------------------
  { id: 120365, line: 'legacy', tag: 'core', edition: 'special' }, // Core Box, miniatures
  { id: 125532, line: 'legacy', tag: 'core', edition: 'special' }, // Stretch Goals, miniatures
  { id: 125533, line: 'legacy', tag: 'core', edition: 'standard' }, // Core Box, standees
  { id: 125534, line: 'legacy', tag: 'core', edition: 'standard' }, // Stretch Goals, standees
  ...core('legacy', 125536, 127879), // Recharge Pack, Infinity Mode
  // Zenith of Ruin and its Recharge Pack, Crew Logs, SAM
  ...extra('legacy', 'gameplay', 125546, 125537, 125547, 128018),
  // Evolved Void Seeders — the "Secret Add-on" until campaign Update #9 — which has "content
  // for both the Infinity Mode and Nemesis: Retaliation".
  ...shared('legacy', 'retaliation', 'gameplay', 125545),
  ...extra('legacy', 'acrylic', 125550, 125551), // Core Box, Stretch Goals
  ...forExpansions('legacy', 'acrylic', 125552), // Add-ons
  ...extra('legacy', 'terrain', 125548),
  ...extra('legacy', 'playmat', 125555),
  ...extra('legacy', 'artbook', 125540),
  ...extra('legacy', 'sleeves', 128436), // Core Box + Stretch Goals
  ...forExpansions('legacy', 'sleeves', 128437), // … + Add-ons

  // --- Nemesis (the original) -------------------------------------------------------------
  ...core('og', 125508, 125198, 125203), // Core Box, Aftermath, Void Seeders
  // Carnomorphs "will work with classic Nemesis, Aftermath, and Lockdown"; the Medic can be
  // "one of the Mars survivors".
  ...shared('og', 'lockdown', 'gameplay', 125204, 125205),
  ...extra('og', 'untold', 125215, 125216),
  ...extra('og', 'promo', 125224, 125225, 125226, 125227),
  ...extra('og', 'terrain', 125206), // Terrain Expansion: "for the original Nemesis game"
  ...shared('og', 'lockdown', 'terrain', 125233), // Constructs Pack: "for Nemesis and Lockdown"
  ...extra('og', 'cats', 125213),
  ...extra('og', 'sculpts', 125214), // Alien Kings
  ...extra('og', 'playmat', 125217),
  ...extra('og', 'dicetray', 125218),
  ...extra('og', 'artbook', 125220),
  // The add-on sleeves cover Aftermath and Void Seeders, which the core pledge includes.
  ...extra('og', 'sleeves', 125221, 125222),
  ...extra('og', 'acrylic', 125232),
  ...extra('og', 'bigbox', 125235),
  ...extra('og', 'synthetic', 128007),
  ...extra('og', 'plush', 125230),
  ...extra('og', 'hoodie', 125234),

  // --- Nemesis Lockdown -------------------------------------------------------------------
  ...core('lockdown', 125515, 125236), // Core Box, Stretch Goals
  ...extra('lockdown', 'playmat', 125239),
  ...extra('lockdown', 'acrylic', 125244),
  ...extra('lockdown', 'cats', 125237),
  ...extra('lockdown', 'sculpts', 125238), // Kings
  ...extra('lockdown', 'artbook', 125240),
  ...extra('lockdown', 'promo', 125241),
  ...extra('lockdown', 'sleeves', 125242),
  ...extra('lockdown', 'synthetic', 128008),
  ...extra('lockdown', 'bigbox', 125246),
  ...extra('lockdown', 'hoodie', 125245),

  // --- Nemesis Retaliation ----------------------------------------------------------------
  ...core('retaliation', 125525, 125526), // Core Box, Stretch Goals
  ...extra('retaliation', 'gameplay', 125249, 125250, 125251), // Sangrevores, Xyrians, Squad
  ...extra('retaliation', 'untold', 125260),
  ...extra('retaliation', 'promo', 125267),
  ...extra('retaliation', 'terrain', 125252),
  ...extra('retaliation', 'sculpts', 125253, 125255), // Alternative Queen, Kings & Queen
  {
    id: 125256, // Classic Crew
    line: 'retaliation',
    tag: 'sculpts',
    when: needsClassicCrew,
    whenNote: 'Only needed for Retaliation or Legacy without both Nemesis OG and Lockdown',
  },
  ...extra('retaliation', 'cats', 125254),
  ...extra('retaliation', 'acrylic', 125257, 125258), // Core Box, Stretch Goals
  ...forExpansions('retaliation', 'acrylic', 125259), // Add-ons
  ...extra('retaliation', 'playmat', 125263),
  ...extra('retaliation', 'artbook', 125264),
  ...extra('retaliation', 'sleeves', 125261),
  ...forExpansions('retaliation', 'sleeves', 125262), // Add-ons
  ...extra('retaliation', 'synthetic', 128009),
  ...extra('retaliation', 'bigbox', 125268),
  ...extra('retaliation', 'plush', 125265),
  ...extra('retaliation', 'hoodie', 125266),
]

/**
 * Items that stand in for others. An item not listed here satisfies only the requirement
 * with its own id.
 */
export const PROVIDES: Readonly<Record<number, readonly number[]>> = {
  // Miniatures do everything standees do, so the Special Edition satisfies a wish for the
  // Standard one. It is what makes the four-game bundle a candidate for a Standard backer.
  120365: [120365, 125533],
  125532: [125532, 125534],
  // "Nemesis Stretch Goals (Special Edition)", sold only inside pledges, is the two
  // expansions that are also sold separately.
  125509: [125198, 125203],
  // The Lockdown Stretch Goals inside the pledges are a separate product from the same box
  // sold on its own.
  125516: [125236],
  // The All Promos Bundle is the four promo packs.
  125513: [125224, 125225, 125226, 125227],
  // The larger sleeve set covers what the smaller one does.
  128437: [128436, 128437],
}

/**
 * The Legacy Core Box, with miniatures and with standees. It is the one part of Legacy that
 * goes out in the first of the campaign's two shipments, with the older games (quote.ts).
 */
export const LEGACY_CORE_BOXES: ReadonlySet<number> = new Set([120365, 125533])

const requirementsById: ReadonlyMap<number, Requirement> = new Map(
  REQUIREMENTS.map((requirement) => [requirement.id, requirement]),
)

export const findRequirement = (id: number): Requirement | undefined => requirementsById.get(id)

/**
 * Whether an item goes with the games that are included. For a game's own contents that
 * decides whether they are wanted at all; for an extra it is only what its switch reaches
 * for by default, since any extra can be bought without its game.
 */
export const goesWith = (requirement: Requirement, lines: LineSelection): boolean =>
  requirement.when?.(lines) ??
  (lines[requirement.line] || (requirement.alsoWith !== undefined && lines[requirement.alsoWith]))

/** The requirements one single item satisfies. */
export const providedBy = (leafId: number): readonly number[] => PROVIDES[leafId] ?? [leafId]

/** The game a single item belongs to, whether it is a requirement itself or stands in for some. */
export const lineOf = (leafId: number): GameLine | undefined =>
  providedBy(leafId)
    .map((id) => requirementsById.get(id)?.line)
    .find((line) => line !== undefined)
