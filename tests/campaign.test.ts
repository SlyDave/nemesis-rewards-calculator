import { describe, expect, test } from 'bun:test'

import { catalog } from '../app/domain/catalog'
import {
  CAMPAIGN_BACKERS,
  CAMPAIGN_ENDED_AT,
  CAMPAIGN_FUNDS_EUR,
  CAMPAIGN_URL,
  ENDGAME_DURATION,
  ENDGAME_STARTED_AT,
  durationBetween,
  formatCampaignFunds,
  formatEndgameDuration,
} from '../app/domain/campaign'

describe('the ended campaign', () => {
  test('closed after the Endgame that followed the scheduled campaign end', () => {
    expect(Date.parse(CAMPAIGN_ENDED_AT)).toBeGreaterThan(Date.parse(ENDGAME_STARTED_AT))
    expect(catalog.campaignEnd).toBe(CAMPAIGN_ENDED_AT)
  })

  test('ran its Endgame for 8 days, 12 hours and 49 minutes', () => {
    expect(durationBetween(ENDGAME_STARTED_AT, CAMPAIGN_ENDED_AT)).toEqual({
      days: 8,
      hours: 12,
      minutes: 49,
    })
    expect(ENDGAME_DURATION).toEqual({ days: 8, hours: 12, minutes: 49 })
    expect(formatEndgameDuration(ENDGAME_DURATION)).toBe('8 days, 12 hours and 49 minutes')
  })

  test('names Gamefound’s final total, and links to the campaign', () => {
    expect(CAMPAIGN_BACKERS).toBe(34_789)
    expect(CAMPAIGN_FUNDS_EUR).toBe(13_229_316.31)
    expect(formatCampaignFunds(CAMPAIGN_FUNDS_EUR)).toBe('€13,229,316.31')
    expect(CAMPAIGN_URL).toBe('https://gamefound.com/en/projects/awaken-realms/nemesis-legacy')
  })
})
