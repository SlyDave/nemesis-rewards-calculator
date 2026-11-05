<script setup lang="ts">
import {
  CAMPAIGN_BACKERS,
  CAMPAIGN_ENDED_AT,
  CAMPAIGN_FUNDS_EUR,
  CAMPAIGN_URL,
  ENDGAME_DURATION,
  ENDGAME_STARTED_AT,
  formatCampaignFunds,
  formatEndgameDuration,
} from '~/domain/campaign'

// A fixed locale and zone, so the page rendered at build time and the visitor's browser agree.
const DAY = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' })
const TIME = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
})

const endedOn = DAY.format(new Date(CAMPAIGN_ENDED_AT))
const endedAt = TIME.format(new Date(CAMPAIGN_ENDED_AT))
const endgameStartedOn = DAY.format(new Date(ENDGAME_STARTED_AT))
const endgameStartedAt = TIME.format(new Date(ENDGAME_STARTED_AT))
const raised = formatCampaignFunds(CAMPAIGN_FUNDS_EUR)
const backers = CAMPAIGN_BACKERS.toLocaleString('en-GB')
const lasted = formatEndgameDuration(ENDGAME_DURATION)
</script>

<template>
  <div class="hud-banner">
    <HudPanel
      title="Campaign ended"
      icon="i-fa-flag-checkered"
    >
      <p
        class="max-w-none text-sm text-toned"
        data-testid="campaign-ended"
      >
        The Nemesis Legacy campaign ended on {{ endedOn }} at {{ endedAt }} UTC, when the Endgame’s
        ten-minute countdown ran out. {{ backers }} backers raised {{ raised }}. The Endgame itself
        ran for {{ lasted }}, from the main campaign’s close at {{ endgameStartedAt }} UTC on
        {{ endgameStartedOn }}. Further details are on
        <ULink
          :to="CAMPAIGN_URL"
          target="_blank"
          class="text-primary hover:underline"
          >the campaign page</ULink
        >.
      </p>
    </HudPanel>
  </div>
</template>
