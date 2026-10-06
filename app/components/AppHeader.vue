<script setup lang="ts">
import { CURRENCY_SYMBOLS } from '~/domain/money'
import { CURRENCIES } from '~/domain/preferences'

import type { CurrencyCode, ThemeName } from '~/domain/types'

const { theme, setTheme } = useTheme()
const { preferences, update, reset } = usePreferences()

const THEMES: readonly { value: ThemeName; label: string; icon: string }[] = [
  { value: 'nemesis', label: 'Nemesis', icon: 'i-fa-alien' },
  { value: 'lockdown', label: 'Lockdown', icon: 'i-fa-planet-ringed' },
]

const CURRENCY_OPTIONS = CURRENCIES.map((code) => ({
  value: code,
  label: `${CURRENCY_SYMBOLS[code]} ${code}`,
}))

const chosenTheme = computed<ThemeName>({
  get: () => theme.value,
  set: setTheme,
})

const currency = computed<CurrencyCode>({
  get: () => preferences.value.currency,
  set: (value) => {
    update({ currency: value })
  },
})
</script>

<template>
  <header class="flex flex-col gap-5 py-6 sm:py-8 lg:flex-row lg:items-end lg:justify-between">
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

    <div class="flex flex-wrap items-end gap-3">
      <div class="min-w-72 flex-1 sm:flex-none">
        <p class="mb-1.5 hud-label text-[0.65rem] text-muted">Style</p>
        <SegmentedChoice
          v-model="chosenTheme"
          :options="THEMES"
          label="Style"
        />
      </div>
      <div class="min-w-56 flex-1 sm:flex-none">
        <p class="mb-1.5 hud-label text-[0.65rem] text-muted">Currency</p>
        <SegmentedChoice
          v-model="currency"
          :options="CURRENCY_OPTIONS"
          label="Currency"
        />
      </div>
      <UButton
        label="Reset"
        icon="i-fa-arrow-rotate-left"
        color="neutral"
        variant="outline"
        class="hud-label text-xs"
        @click="reset"
      />
    </div>
  </header>
</template>
