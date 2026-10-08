<script setup lang="ts">
import { LATEST_QUARTER } from '~/domain/inflation'
import { formatAmount } from '~/domain/money'
import { ASSUMED_UPLIFT, STATED_UPLIFTS } from '~/domain/msrp'

import type { ItemMsrp } from '~/domain/msrp'
import type { Cents } from '~/domain/types'

/**
 * How the MSRP is made up: every item in the cart with its retail price, and under each one
 * where that price comes from. Two kinds of figure are worked out rather than published, and
 * are marked: an older price raised by inflation, which says what it was, when, and what that
 * comes to now; and one assumed from this campaign's price, which says so.
 */
const props = defineProps<{
  items: readonly ItemMsrp[]
  total: Cents
}>()

const { format } = useMoney()

const CENTS_PER_UNIT = 100
const PERCENT = 100

/** How a figure was worked out, where it was: it decides the mark beside its note. */
type Working = 'inflation' | 'assumption' | null

const WORKING_ICONS = { inflation: 'i-fa-inflation', assumption: 'i-fa-assumption' } as const

// A fixed zone, so a date reads the same whoever is looking.
const DAY = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' })

/** "50%", or "54.3%" where the places are asked for. */
const percent = (share: number, decimals = 0): string => `${(share * PERCENT).toFixed(decimals)}%`

const assumed = percent(ASSUMED_UPLIFT)

const noteFor = (item: ItemMsrp): string => {
  const { basis, earlier, countedWith } = item
  if (earlier !== null) {
    const what = basis === 'earlierMsrp' ? 'Retail MSRP' : 'Price'
    const was = formatAmount(earlier.amount, earlier.campaign.currency)
    const day = DAY.format(new Date(`${earlier.campaign.date}T00:00:00Z`))
    const then = formatAmount(earlier.euros / CENTS_PER_UNIT, 'EUR')
    const rise = percent(earlier.rise - 1, 1)
    return `${what} ${was} on ${day}, in the ${earlier.campaign.name}: ${then} then, and ${format(item.amount)} now after ${rise} inflation.`
  }
  switch (basis) {
    case 'stated':
      return 'The retail MSRP this campaign states.'
    case 'counted':
      return `Counted with the ${countedWith?.name ?? 'Core Box'}: they were one price.`
    case 'assumed':
    case 'earlierMsrp':
    case 'earlierPrice':
      return `No MSRP published. Assumed: this campaign’s price of ${format(item.product.price)}, plus ${assumed}.`
  }
}

const workingOf = (item: ItemMsrp): Working => {
  if (item.earlier !== null) {
    return 'inflation'
  }
  return item.basis === 'assumed' ? 'assumption' : null
}

const rows = computed(() =>
  props.items.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    amount: item.basis === 'counted' ? '—' : format(item.amount),
    working: workingOf(item),
    note: noteFor(item),
  })),
)

const isAnyAdjusted = computed<boolean>(() => rows.value.some((row) => row.working === 'inflation'))
const isAnyAssumed = computed<boolean>(() => rows.value.some((row) => row.working === 'assumption'))

const latestQuarter = `Q${String(LATEST_QUARTER.quarter)} ${String(LATEST_QUARTER.year)}`

/** What the assumption rests on: the least and the most a stated MSRP has stood above its price. */
const statedUplifts = STATED_UPLIFTS.map(({ uplift }) => uplift)
const leastStated = percent(Math.min(...statedUplifts), 1)
const mostStated = percent(Math.max(...statedUplifts), 1)
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
          :class="row.working === null ? 'text-muted' : 'text-warning'"
        >
          <UIcon
            v-if="row.working !== null"
            :name="WORKING_ICONS[row.working]"
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
      <p
        v-if="isAnyAssumed"
        class="mt-1.5 text-muted"
        data-testid="assumption-note"
      >
        The {{ assumed }} uplift is an assumption. It is based on the retail MSRPs the campaigns do
        state, which stand between {{ leastStated }} and {{ mostStated }} above their campaign
        price.
      </p>
    </div>
  </div>
</template>
