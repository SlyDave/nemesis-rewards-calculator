/**
 * How the Nemesis Legacy campaign ended, as Gamefound's own page had it once orders closed.
 *
 * The main campaign ran to 19:00 UTC on 27 October 2026. The Endgame that followed was a
 * ten-minute countdown: each new backer, or an addition to a pledge, reset it once. It ran
 * out at 07:49 UTC on 5 November. These figures are from that page's `projectState` and
 * `projectContext` at the first capture after it closed, and the banner on the site reports
 * them. They do not change with a later catalogue refresh unless Gamefound restates them.
 */

export const CAMPAIGN_URL = 'https://gamefound.com/en/projects/awaken-realms/nemesis-legacy'

/** When the main campaign closed and the Endgame's countdown began. */
export const ENDGAME_STARTED_AT = '2026-10-27T19:00:00Z'

/** When the Endgame countdown ran out and Gamefound stopped taking orders. */
export const CAMPAIGN_ENDED_AT = '2026-11-05T07:49:42.443Z'

/** What Gamefound showed as raised, in euros, once the campaign had ended. */
export const CAMPAIGN_FUNDS_EUR = 13_229_316.31

/** How many backers Gamefound counted at that close. */
export const CAMPAIGN_BACKERS = 34_789

const MILLIS_PER_MINUTE = 60_000
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24

export interface DurationParts {
  readonly days: number
  readonly hours: number
  readonly minutes: number
}

/** Whole minutes between two instants, split into days, hours and leftover minutes. */
export const durationBetween = (start: string, end: string): DurationParts => {
  const totalMinutes = Math.floor((Date.parse(end) - Date.parse(start)) / MILLIS_PER_MINUTE)
  const days = Math.floor(totalMinutes / (HOURS_PER_DAY * MINUTES_PER_HOUR))
  const hours = Math.floor((totalMinutes % (HOURS_PER_DAY * MINUTES_PER_HOUR)) / MINUTES_PER_HOUR)
  const minutes = totalMinutes % MINUTES_PER_HOUR
  return { days, hours, minutes }
}

export const ENDGAME_DURATION: DurationParts = durationBetween(
  ENDGAME_STARTED_AT,
  CAMPAIGN_ENDED_AT,
)

export const formatEndgameDuration = (duration: DurationParts): string =>
  `${String(duration.days)} days, ${String(duration.hours)} hours and ${String(duration.minutes)} minutes`

/** The campaign total, always euros, with the thousands separators the rest of the page uses. */
export const formatCampaignFunds = (amount: number): string =>
  `€${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
