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

    <div class="flex flex-wrap items-end gap-3">
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
          class="w-full"
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
