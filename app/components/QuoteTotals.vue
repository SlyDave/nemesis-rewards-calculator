<script setup lang="ts">
import { CURRENCY_SYMBOLS, rateFor } from '~/domain/money'

import type { Quote } from '~/domain/quote'

const props = defineProps<{
  quote: Quote
}>()

const { preferences } = usePreferences()
const { rates } = useRates()
const { format } = useMoney()

const RATE_DECIMALS = 4

const FINISH_NAMES = { plain: 'Plain', sundrop: 'Sundrop', painted: 'Fully painted' } as const

const itemCount = computed<number>(() =>
  props.quote.lines.reduce((count, line) => count + line.contents.length, 0),
)

const pledgeCount = computed<number>(
  () => props.quote.lines.filter((line) => line.shipping !== null).length,
)

const plural = (count: number, word: string): string =>
  `${String(count)} ${word}${count === 1 ? '' : 's'}`

const rateNote = computed<string | null>(() => {
  const { currency } = preferences.value
  if (currency === 'EUR') {
    return null
  }
  const rate = rateFor(currency, rates.value).toFixed(RATE_DECIMALS)
  const day = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(rates.value.date),
  )
  const source = rates.value.live ? 'ECB reference rate' : 'Gamefound’s rate'
  return `€1 = ${CURRENCY_SYMBOLS[currency]}${rate} · ${source}, ${day}. Gamefound charges in euros, so your bank sets the final figure.`
})
</script>

<template>
  <HudPanel
    title="Your best order"
    icon="i-fa-value"
  >
    <div
      v-if="quote.lines.length === 0"
      class="py-6 text-center text-sm text-muted"
    >
      Include at least one game to see what to order.
    </div>

    <template v-else>
      <div class="text-center sm:text-left">
        <p class="hud-label text-xs text-muted">Total to pay</p>
        <p
          class="mt-1 font-display text-5xl leading-none font-semibold text-primary hud-glow sm:text-6xl"
          data-testid="total"
        >
          {{ format(quote.total) }}
        </p>
        <p class="mt-3 text-sm text-muted">
          {{ plural(itemCount, 'item') }} in {{ plural(quote.lines.length, 'cart line') }} — the
          cheapest way to get everything you asked for.
        </p>
      </div>

      <dl class="mt-6 grid grid-cols-1 gap-x-4 gap-y-2.5 border-t border-default pt-5 text-sm">
        <div class="flex items-baseline justify-between gap-4">
          <dt class="text-toned">Rewards</dt>
          <dd class="font-semibold text-highlighted">
            <s
              v-if="quote.savings > 0"
              class="mr-2 font-normal text-dimmed"
              >{{ format(quote.listTotal) }}</s
            >{{ format(quote.itemsTotal) }}
          </dd>
        </div>

        <div
          v-if="quote.finishTotal > 0"
          class="flex items-baseline justify-between gap-4"
        >
          <dt class="text-toned">{{ FINISH_NAMES[preferences.finish] }} miniatures</dt>
          <dd class="font-semibold text-highlighted">{{ format(quote.finishTotal) }}</dd>
        </div>

        <div class="flex items-baseline justify-between gap-4">
          <dt class="text-toned">
            Shipping to {{ quote.destination.name }}
            <span class="text-muted">· {{ plural(pledgeCount, 'pledge') }}</span>
          </dt>
          <dd class="font-semibold text-highlighted">{{ format(quote.shippingTotal) }}</dd>
        </div>
        <div
          v-if="quote.unpricedShipping.length > 0"
          class="-mt-1 flex items-start gap-2 text-xs text-warning"
        >
          <UIcon
            name="i-fa-triangle-exclamation"
            class="mt-0.5 size-3.5 shrink-0"
          />
          <span
            >Plus shipping for {{ plural(quote.unpricedShipping.length, 'add-on') }}, which Awaken
            Realms will only price in the pledge manager.</span
          >
        </div>

        <div class="flex items-baseline justify-between gap-4">
          <dt class="text-toned">
            <template v-if="preferences.includeTax"
              >{{ quote.destination.taxName }}
              <span class="text-muted">· {{ quote.taxRate }}%</span></template
            >
            <template v-else>Tax</template>
          </dt>
          <dd class="font-semibold text-highlighted">
            <template v-if="preferences.includeTax">{{ format(quote.taxTotal) }}</template>
            <span
              v-else
              class="font-normal text-muted"
              >not included</span
            >
          </dd>
        </div>

        <div class="flex items-baseline justify-between gap-4 border-t border-default pt-3">
          <dt class="hud-label text-xs text-highlighted">Total</dt>
          <dd class="text-lg font-bold text-primary">{{ format(quote.total) }}</dd>
        </div>
      </dl>

      <div class="mt-5 grid grid-cols-2 gap-3">
        <div class="border border-default bg-elevated/40 p-3">
          <p class="flex items-center gap-2 hud-label text-[0.65rem] text-muted">
            <UIcon
              name="i-fa-value"
              class="size-4 text-primary"
            />
            Reward value
          </p>
          <p class="mt-1 text-xl font-semibold text-highlighted">
            {{ format(quote.listTotal) }}
          </p>
        </div>
        <div class="border border-default bg-elevated/40 p-3">
          <p class="flex items-center gap-2 hud-label text-[0.65rem] text-muted">
            <UIcon
              name="i-fa-savings"
              class="size-4 text-primary"
            />
            Bundle saving
          </p>
          <p
            class="mt-1 text-xl font-semibold"
            :class="quote.savings > 0 ? 'text-primary' : 'text-muted'"
          >
            {{ format(quote.savings) }}
          </p>
        </div>
      </div>

      <p
        v-if="rateNote !== null"
        class="mt-4 flex items-start gap-2 text-xs text-muted"
      >
        <UIcon
          name="i-fa-currency"
          class="mt-0.5 size-3.5 shrink-0"
        />
        <span>{{ rateNote }}</span>
      </p>
    </template>
  </HudPanel>
</template>
