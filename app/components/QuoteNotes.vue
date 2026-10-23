<script setup lang="ts">
import { LEGACY_BIG_BOX_ID } from '~/domain/classification'

import type { Quote } from '~/domain/quote'

const props = defineProps<{
  quote: Quote
}>()

const bonusNames = computed<string>(() =>
  props.quote.bonus.map((product) => product.name).join(', '),
)

const unpricedPledgeNames = computed<string>(() =>
  props.quote.unpricedPledges.map((pledge) => pledge.name).join(' or the '),
)

// Update #16 says this add-on's shipping will be high, though it gives no final figure.
const hasLegacyBigBox = computed<boolean>(() =>
  props.quote.unpricedShipping.some((product) => product.id === LEGACY_BIG_BOX_ID),
)
</script>

<template>
  <HudPanel
    v-if="quote.lines.length > 0"
    title="Good to know"
    icon="i-fa-circle-info"
  >
    <ul class="grid grid-cols-1 gap-4 text-sm">
      <li class="flex items-start gap-3">
        <UIcon
          name="i-fa-clock"
          class="mt-0.5 size-4 shrink-0 text-primary"
        />
        <p class="text-toned">
          <span class="font-semibold text-highlighted">When it arrives.</span>
          {{ quote.waves }} Language editions other than English ship 6–7 months later.
        </p>
      </li>

      <li
        v-if="quote.bonus.length > 0"
        class="flex items-start gap-3"
      >
        <UIcon
          name="i-fa-bonus"
          class="mt-0.5 size-4 shrink-0 text-warning"
        />
        <p class="text-toned">
          <span class="font-semibold text-highlighted">You get more than you asked for.</span>
          A bundle that includes {{ bonusNames }} is cheaper than buying only what you asked for, so
          {{ quote.bonus.length === 1 ? 'it comes' : 'they come' }} along at no extra cost.
        </p>
      </li>

      <li
        v-if="quote.unpricedPledges.length > 0"
        class="flex items-start gap-3"
      >
        <UIcon
          name="i-fa-shipping"
          class="mt-0.5 size-4 shrink-0 text-warning"
        />
        <p class="text-toned">
          <span class="font-semibold text-highlighted">Some shipping is not published.</span>
          The campaign’s shipping table does not price the {{ unpricedPledgeNames }}, so
          {{ quote.unpricedPledges.length === 1 ? 'it is' : 'each is' }} counted at the least it can
          be: the shipping of the biggest published pledge whose contents it holds, since sending
          more cannot cost less. The real figure may be higher.
        </p>
      </li>

      <li
        v-if="quote.unpricedShipping.length > 0"
        class="flex items-start gap-3"
      >
        <UIcon
          name="i-fa-shipping"
          class="mt-0.5 size-4 shrink-0 text-warning"
        />
        <p class="text-toned">
          <span class="font-semibold text-highlighted">Add-on shipping is not final.</span>
          The campaign publishes shipping for pledges only, and says shipping for add-ons “will be
          calculated in pledge manager”.
          <template v-if="hasLegacyBigBox">
            It specifically says the Legacy Big Box will cost less to send than a Standard or
            Special Edition pledge, but more than a normal add-on.
          </template>
          <template v-else> Expect a little more on top for the add-ons in this order. </template>
        </p>
      </li>

      <li class="flex items-start gap-3">
        <UIcon
          name="i-fa-list"
          class="mt-0.5 size-4 shrink-0 text-primary"
        />
        <p class="text-toned">
          <span class="font-semibold text-highlighted">How this is worked out.</span>
          Every combination of pledges, bundles and single add-ons that covers your choices is
          weighed, and the one with the lowest price for the rewards wins — even where a bundle
          brings things you switched off. Shipping is left out of that comparison because add-ons
          have no shipping price yet: counting it would unfairly favour buying everything
          separately.
        </p>
      </li>

      <li
        v-if="quote.unavailable.length > 0"
        class="flex items-start gap-3"
      >
        <UIcon
          name="i-fa-triangle-exclamation"
          class="mt-0.5 size-4 shrink-0 text-error"
        />
        <p class="text-toned">
          <span class="font-semibold text-highlighted">Something is missing.</span>
          {{ quote.unavailable.length }} of the things you asked for
          {{ quote.unavailable.length === 1 ? 'is' : 'are' }} not on sale in the captured catalogue,
          and {{ quote.unavailable.length === 1 ? 'is' : 'are' }} left out of the total.
        </p>
      </li>
    </ul>
  </HudPanel>
</template>
