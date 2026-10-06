<script setup lang="ts">
import { buildQuote } from '~/domain/quote'

const { preferences } = usePreferences()
const { refresh } = useRates()

useRestoredPreferences()

// Worked out afresh on every change; the search takes about a millisecond.
const quote = computed(() => buildQuote(preferences.value))

onMounted(() => {
  void refresh()
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:pb-10">
    <AppHeader />

    <main class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <div class="grid min-w-0 grid-cols-1 gap-6 lg:col-span-6">
        <ChoicesBacker />
        <ChoicesGames />
        <ChoicesExtras />
        <ChoicesDelivery />
      </div>

      <!-- Beside the choices on a wide screen, and scrolling on its own, so the total stays in
           view while switches further down the page are flipped. -->
      <div
        class="grid min-w-0 hud-scroll grid-cols-1 gap-6 lg:sticky lg:top-4 lg:col-span-6 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto lg:pr-2"
      >
        <QuoteTotals :quote="quote" />
        <QuoteCart :quote="quote" />
        <QuoteNotes :quote="quote" />
      </div>
    </main>

    <AppFooter />
    <MobileTotalBar :quote="quote" />
  </div>
</template>
