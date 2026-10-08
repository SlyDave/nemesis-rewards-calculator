<script setup lang="ts">
import { CURRENCIES, LEADING_CURRENCIES } from '~/domain/currencies'

import type { CurrencyCode, ThemeName } from '~/domain/types'

const { theme, setTheme } = useTheme()
const { preferences, setCurrency, reset } = usePreferences()

const THEMES: readonly { value: ThemeName; label: string; icon: string }[] = [
  { value: 'nemesis', label: 'Nemesis', icon: 'i-fa-alien' },
  { value: 'lockdown', label: 'Lockdown', icon: 'i-fa-planet-ringed' },
  { value: 'retaliation', label: 'Retaliation', icon: 'i-fa-retaliation' },
  { value: 'legacy', label: 'Legacy', icon: 'i-fa-legacy' },
]

const CURRENCY_OPTIONS = CURRENCIES.map(({ code, name, symbol }) => ({
  value: code,
  label: `${symbol} ${code}`,
  description: name,
}))

/** The euro, the dollar and the pound in a group of their own, ahead of the rest. */
const CURRENCY_GROUPS = [
  CURRENCY_OPTIONS.slice(0, LEADING_CURRENCIES),
  CURRENCY_OPTIONS.slice(LEADING_CURRENCIES),
]

/** GitHub Sponsors, opened on a one-time donation of three dollars, which can be changed there. */
const DONATE_URL = 'https://github.com/sponsors/SlyDave?frequency=one-time&sponsor=SlyDave&amount=3'

const DONATE_HINT =
  'Hi! If you find this useful, please consider a small donation to fuel more creations and help me pay for the hosting - you’re the best, cheers!'

const chosenTheme = computed<ThemeName>({
  get: () => theme.value,
  set: setTheme,
})

const currency = computed<CurrencyCode>({
  get: () => preferences.value.currency,
  set: setCurrency,
})
</script>

<template>
  <header class="flex flex-col gap-5 py-6 sm:py-8">
    <div>
      <p
        class="font-display text-3xl leading-none font-light tracking-[0.5em] text-highlighted uppercase sm:text-4xl"
      >
        Nemesis
      </p>
      <h1 class="mt-3 hud-title text-sm text-primary hud-glow sm:text-base">
        Rewards calculator
      </h1>
      <p class="mt-3 max-w-xl text-sm text-muted">
        Switch on what you want from the Nemesis Legacy campaign. This finds the cheapest
        combination of pledges and add-ons that gets you all of it.
      </p>
    </div>

    <div class="flex flex-wrap items-end gap-3 lg:pr-2">
      <div class="w-full md:w-auto md:min-w-[40rem]">
        <p class="mb-1.5 hud-label text-[0.65rem] text-muted">Style</p>
        <SegmentedChoice
          v-model="chosenTheme"
          :options="THEMES"
          label="Style"
          wrap
        />
      </div>
      <div class="min-w-56 flex-1 sm:w-64 sm:flex-none">
        <p class="mb-1.5 hud-label text-[0.65rem] text-muted">Currency</p>
        <USelectMenu
          v-model="currency"
          :items="CURRENCY_GROUPS"
          value-key="value"
          :filter-fields="['label', 'description']"
          :search-input="{ placeholder: 'Find a currency…' }"
          aria-label="Currency"
          size="lg"
          class="hud-control w-full"
        />
      </div>
      <UButton
        label="Reset"
        icon="i-fa-arrow-rotate-left"
        color="neutral"
        variant="outline"
        class="hud-control hud-label text-xs"
        @click="reset"
      />
      <!-- Takes whatever of the row is left, and is lit like the total to be noticed. Where the
           row is too narrow to keep it, it drops to a line of its own, and is held to a
           sensible width there rather than stretching across the page. -->
      <UTooltip
        :delay-duration="150"
        :ui="{ content: 'h-auto max-w-80 py-2' }"
      >
        <UButton
          :to="DONATE_URL"
          target="_blank"
          label="Donate"
          icon="i-fa-donate"
          color="primary"
          variant="subtle"
          class="hud-control min-w-36 flex-1 justify-center hud-label text-xs hud-glow sm:max-w-80"
        />
        <template #content>
          <span class="leading-snug">{{ DONATE_HINT }}</span>
        </template>
      </UTooltip>
      <!-- The column beneath this end of the row keeps a gap and a scrollbar's width clear of
           the page's edge (pages/index.vue). The row's padding is the gap; this, a scrollbar
           with nothing to scroll, is the width — whatever that is on the system in use — so
           the row ends exactly where that column's panels do. Its margin undoes the row's gap. -->
      <span
        aria-hidden="true"
        class="invisible -ml-3 hidden hud-scroll overflow-y-scroll lg:block"
      />
    </div>
  </header>
</template>
