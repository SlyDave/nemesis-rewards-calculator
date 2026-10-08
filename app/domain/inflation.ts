/**
 * How much consumer prices have risen in Wrocław, where Awaken Realms is, since a given day.
 *
 * It is what brings a price from an earlier campaign up to today's money (msrp.ts).
 *
 * Statistics Poland does not publish a price index for a single city. The finest it goes is
 * the voivodeship, so this is the index for Dolnośląskie, of which Wrocław is the capital and
 * much the largest part, as published for the region by the Statistical Office in Wrocław.
 *
 * Source: Statistics Poland (GUS), Knowledge Databases — https://dbw.stat.gov.pl — variable
 * 305, "Wskaźniki cen towarów i usług konsumpcyjnych", total, for DOLNOŚLĄSKIE; the breakdown
 * by voivodeship for 2010–2025 (COICOP 1999), and its successor from 2026 (COICOP 2018).
 * Read on 8 October 2026, when the second quarter of 2026 was the latest published. A new
 * quarter is one more line at the end of the table.
 */

export interface Quarter {
  readonly year: number
  readonly quarter: 1 | 2 | 3 | 4
}

/** A quarter's prices against the quarter before, and against the same quarter a year before. */
type Indices = readonly [previousQuarter: number, yearBefore: number]

const FIRST_YEAR = 2018
const QUARTERS_PER_YEAR = 4
const MONTHS_PER_QUARTER = 3
const BASE = 100

/** Four quarters a year from the first of 2018, each as Statistics Poland prints it (= 100). */
const DOLNOSLASKIE: readonly Indices[] = [
  // 2018
  [100.3, 101.0],
  [100.4, 101.3],
  [100.0, 101.5],
  [100.2, 100.9],
  // 2019
  [100.3, 100.8],
  [101.5, 102.1],
  [100.3, 102.5],
  [100.4, 102.8],
  // 2020
  [101.8, 104.0],
  [100.5, 102.9],
  [100.1, 102.8],
  [100.3, 102.7],
  // 2021
  [102.0, 102.7],
  [101.6, 104.1],
  [100.7, 104.8],
  [102.6, 107.1],
  // 2022
  [103.7, 108.9],
  [105.5, 113.1],
  [102.8, 115.4],
  [103.3, 116.2],
  // 2023
  [104.3, 116.1],
  [101.7, 112.3],
  [99.6, 109.1],
  [100.4, 106.1],
  // 2024
  [101.1, 102.6],
  [101.3, 102.3],
  [101.5, 104.2],
  [100.4, 104.3],
  // 2025
  [101.4, 104.4],
  [100.5, 103.7],
  [100.4, 102.8],
  [100.0, 102.3],
  // 2026
  [101.2, 102.1],
  [101.0, 102.6],
]

/** A quarter's place in the table. */
const placeOf = ({ year, quarter }: Quarter): number =>
  (year - FIRST_YEAR) * QUARTERS_PER_YEAR + (quarter - 1)

const quarterAt = (place: number): Quarter => {
  const quarter = (place % QUARTERS_PER_YEAR) + 1
  if (quarter !== 1 && quarter !== 2 && quarter !== 3 && quarter !== 4) {
    throw new Error(`No quarter at ${String(place)}`)
  }
  return { year: FIRST_YEAR + Math.floor(place / QUARTERS_PER_YEAR), quarter }
}

const LATEST_PLACE = DOLNOSLASKIE.length - 1

/** The latest quarter there are figures for. */
export const LATEST_QUARTER: Quarter = quarterAt(LATEST_PLACE)

/** The quarter a day (YYYY-MM-DD) falls in. */
export const quarterOf = (day: string): Quarter => {
  const date = new Date(`${day}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Not a day: ${day}`)
  }
  return quarterAt(
    (date.getUTCFullYear() - FIRST_YEAR) * QUARTERS_PER_YEAR +
      Math.floor(date.getUTCMonth() / MONTHS_PER_QUARTER),
  )
}

const indicesAt = (place: number): Indices => {
  const indices = DOLNOSLASKIE[place]
  if (indices === undefined) {
    throw new Error(`No price index for ${JSON.stringify(quarterAt(place))}`)
  }
  return indices
}

export interface PriceRise {
  /** What a price then is multiplied by to give the same price now. */
  readonly factor: number
  readonly from: Quarter
  readonly to: Quarter
}

/**
 * The rise in prices from the quarter a day falls in to the latest quarter published.
 *
 * It goes back from the latest quarter a year at a time while a whole year fits, on the
 * year-on-year figures, and covers what is left a quarter at a time. Each figure is rounded to
 * a tenth of a point as published, so the fewer of them are multiplied together, the less the
 * rounding adds up to.
 */
export const priceRiseSince = (day: string): PriceRise => {
  const from = quarterOf(day)
  const start = placeOf(from)
  if (start < 0) {
    throw new Error(`The price index does not go back to ${day}`)
  }

  let factor = 1
  let place = LATEST_PLACE
  while (place - start >= QUARTERS_PER_YEAR) {
    factor *= indicesAt(place)[1] / BASE
    place -= QUARTERS_PER_YEAR
  }
  while (place > start) {
    factor *= indicesAt(place)[0] / BASE
    place -= 1
  }
  return { factor, from, to: LATEST_QUARTER }
}
