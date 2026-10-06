<script setup lang="ts">
import type { Quote } from '~/domain/quote'

/**
 * On a phone the choices come first and the answer is a long way below them, so the total
 * rides along at the foot of the screen with a way down to the cart.
 */
defineProps<{
  quote: Quote
}>()

const { format } = useMoney()
</script>

<template>
  <div
    v-if="quote.lines.length > 0"
    class="fixed inset-x-0 bottom-0 z-40 border-t border-primary/40 bg-default/90 backdrop-blur lg:hidden"
  >
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
      <div>
        <p class="hud-label text-[0.65rem] text-muted">Total to pay</p>
        <p class="font-display text-2xl leading-none font-semibold text-primary hud-glow">
          {{ format(quote.total) }}
        </p>
      </div>
      <UButton
        to="#cart"
        external
        label="See the cart"
        icon="i-fa-cart"
        color="primary"
        variant="outline"
        class="hud-label text-xs"
      />
    </div>
  </div>
</template>
