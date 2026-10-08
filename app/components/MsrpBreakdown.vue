<script setup lang="ts">
import { LATEST_QUARTER } from '~/domain/inflation'
import { formatAmount } from '~/domain/money'

import type { ItemMsrp } from '~/domain/msrp'
import type { Cents } from '~/domain/types'

/**
 * How the MSRP is made up: every item in the cart with its retail price, and under each one
 * where that price comes from — above all, where it is an older price raised by inflation,
 * what it was, when, and what that comes to now.
 */
const props = defineProps<{
  items: readonly ItemMsrp[]
  total: Cents
}>()

const { format } = useMoney()

const CENTS_PER_UNIT = 100
const PERCENT = 100

// A fixed zone, so a date reads the same whoever is looking.
const DAY = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' })

const noteFor = (item: ItemMsrp): string => {
  const { basis, earlier, countedWith } = item
  if (earlier !== null) {
    const what = basis === 'earlierMsrp' ? 'Retail MSRP' : 'Price'
    const was = formatAmount(earlier.amount, earlier.campaign.currency)
    const day = DAY.format(new Date(`${earlier.campaign.date}T00:00:00Z`))
    const then = formatAmount(earlier.euros / CENTS_PER_UNIT, 'EUR')
    const rise = ((earlier.rise - 1) * PERCENT).toFixed(1)
    return `${what} ${was} on ${day}, in the ${earlier.campaign.name}: ${then} then, and ${format(item.amount)} now after ${rise}% inflation.`
  }
  switch (basis) {
    case 'stated':
      return 'The retail MSRP this campaign states.'
    case 'counted':
      return `Counted with the ${countedWith?.name ?? 'Core Box'}: they were one price.`
    case 'campaignPrice':
    case 'earlierMsrp':
    case 'earlierPrice':
      return 'No MSRP published: this campaign’s price.'
  }
}

const rows = computed(() =>
  props.items.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    amount: item.basis === 'counted' ? '—' : format(item.amount),
    isAdjusted: item.earlier !== null,
    note: noteFor(item),
  })),
)

const isAnyAdjusted = computed<boolean>(() => props.items.some((item) => item.earlier !== null))

const latestQuarter = `Q${String(LATEST_QUARTER.quarter)} ${String(LATEST_QUARTER.year)}`
</script>

<template>
  <div class="w-[min(27rem,calc(100vw-2rem))] text-xs">
    <p class="border-b border-default px-3 py-2 hud-label text-[0.65rem] text-toned">
      What these would cost at retail
    </p>

    <ul
      class="grid max-h-[min(22rem,55dvh)] hud-scroll grid-cols-1 gap-2.5 overflow-y-auto px-3 py-3"
    >
      <li
        v-for="row in rows"
        :key="row.id"
      >
        <p class="flex items-baseline justify-between gap-3">
          <span class="min-w-0 font-semibold text-highlighted">{{ row.name }}</span>
          <span class="shrink-0 font-semibold text-highlighted">{{ row.amount }}</span>
        </p>
        <p
          class="mt-0.5 flex items-start gap-1.5"
          :class="row.isAdjusted ? 'text-warning' : 'text-muted'"
        >
          <UIcon
            v-if="row.isAdjusted"
            name="i-fa-inflation"
            class="mt-0.5 size-3 shrink-0"
          />
          <span>{{ row.note }}</span>
        </p>
      </li>
    </ul>

    <div class="border-t border-default px-3 py-2">
      <p
        class="flex items-baseline justify-between gap-3 hud-label text-[0.65rem] text-highlighted"
      >
        <span>MSRP</span>
        <span class="text-sm text-primary">{{ format(total) }}</span>
      </p>
      <p
        v-if="isAnyAdjusted"
        class="mt-1.5 text-muted"
      >
        Older prices are turned into euros at the rate of their day, then raised by consumer-price
        inflation in Dolnośląskie, Wrocław’s region, up to {{ latestQuarter }} (Statistics Poland).
      </p>
    </div>
  </div>
</template>
