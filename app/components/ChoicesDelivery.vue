<script setup lang="ts">
import { DESTINATIONS, REGION_NAMES, destinationFor } from '~/domain/destinations'

import type { Quote } from '~/domain/quote'
import type { ShippingMode } from '~/domain/types'

const props = defineProps<{
  /** The order as it stands: whether it can be split depends on what is in it. */
  quote: Quote
}>()

const { preferences, update } = usePreferences()

const DESTINATION_OPTIONS = DESTINATIONS.map(({ code, name }) => ({ label: name, value: code }))

/** Split shipping is only on offer for an order with something in each of the two shipments. */
const shippingModes = computed(() => [
  {
    value: 'split' as const,
    label: 'Split shipping',
    icon: 'i-fa-split',
    disabled: !props.quote.canSplit,
  },
  { value: 'single' as const, label: 'Single shipping', icon: 'i-fa-single' },
])

const MAX_TAX_RATE = 100
const TAX_RATE_STEP = 0.5

const destination = computed(() => destinationFor(preferences.value.destination))

const destinationCode = computed<string>({
  get: () => preferences.value.destination,
  set: (code) => {
    // A corrected rate belongs to the country it was corrected for.
    update({ destination: code, taxRate: null })
  },
})

// Shown as the order is priced: single where it cannot be split, whatever was last chosen. The
// choice itself is kept, and comes back into force once there is something to split.
const shipping = computed<ShippingMode>({
  get: () => props.quote.shipping,
  set: (value) => {
    update({ shipping: value })
  },
})

const shippingNote = computed<string>(() => {
  if (props.quote.canSplit) {
    return 'Split sends what is ready first and the rest later, for more. Single waits and sends it all at once.'
  }
  if (props.quote.lines.length === 0) {
    return 'Split shipping sends an order in two parts, so it needs something in each: nothing is ordered yet.'
  }
  return `Nothing here to split, so split shipping is not on offer. ${props.quote.waves}`
})

const includeTax = computed<boolean>({
  get: () => preferences.value.includeTax,
  set: (value) => {
    update({ includeTax: value })
  },
})

const taxRate = computed<number>({
  get: () => preferences.value.taxRate ?? destination.value.taxRate,
  set: (rate) => {
    update({ taxRate: rate === destination.value.taxRate ? null : rate })
  },
})

const taxTiming = computed<string>(() => {
  switch (destination.value.collection) {
    case 'checkout':
      return 'Added by Gamefound at checkout, on the rewards and the shipping.'
    case 'pledgeManager':
      return 'Added later, in the pledge manager.'
    case 'none':
      return 'Not collected by the campaign.'
  }
})
</script>

<template>
  <HudPanel
    title="Delivery & tax"
    icon="i-fa-shipping"
  >
    <div class="grid grid-cols-1 gap-5">
      <div>
        <p class="mb-2 flex items-center gap-2 hud-label text-xs text-toned">
          <UIcon
            name="i-fa-destination"
            class="size-4 text-primary"
          />
          Deliver to
        </p>
        <USelectMenu
          v-model="destinationCode"
          :items="DESTINATION_OPTIONS"
          value-key="value"
          :search-input="{ placeholder: 'Find a country…' }"
          aria-label="Deliver to"
          size="lg"
          class="w-full"
        />
        <p class="mt-2 text-xs text-muted">
          Shipping zone:
          <span class="text-toned">{{ REGION_NAMES[destination.region] }}</span>
        </p>
      </div>

      <div>
        <p class="mb-2 flex items-center gap-2 hud-label text-xs text-toned">
          <UIcon
            name="i-fa-shipping"
            class="size-4 text-primary"
          />
          Split or Single Shipping
        </p>
        <SegmentedChoice
          v-model="shipping"
          :options="shippingModes"
          label="Split or Single Shipping"
        />
        <p
          class="mt-2 text-xs text-muted"
          data-testid="shipping-note"
        >
          {{ shippingNote }}
        </p>
      </div>

      <div>
        <ChoiceSwitch
          v-model="includeTax"
          label="Include Tax / VAT"
          :hint="`${destination.taxName} for ${destination.name}`"
          icon="i-fa-tax"
        />
        <div
          v-if="includeTax"
          class="mt-3 flex flex-wrap items-center gap-3"
        >
          <label
            for="tax-rate"
            class="hud-label text-xs text-toned"
            >{{ destination.taxName }} rate</label
          >
          <UInputNumber
            id="tax-rate"
            v-model="taxRate"
            :min="0"
            :max="MAX_TAX_RATE"
            :step="TAX_RATE_STEP"
            :format-options="{ maximumFractionDigits: 2 }"
            class="w-32"
          />
          <span class="text-sm text-muted">%</span>
        </div>
        <p
          v-if="includeTax"
          class="mt-2 text-xs text-muted"
        >
          {{ taxTiming }}
          <template v-if="destination.note !== undefined">{{ destination.note }}</template>
        </p>
      </div>
    </div>
  </HudPanel>
</template>
