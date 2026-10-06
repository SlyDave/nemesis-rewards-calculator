<script setup lang="ts">
import { catalog } from '~/domain/catalog'

import type { Quote } from '~/domain/quote'

defineProps<{
  quote: Quote
}>()
</script>

<template>
  <HudPanel
    id="cart"
    title="Add to your Gamefound cart"
    icon="i-fa-cart"
  >
    <template #aside>
      <UButton
        :to="catalog.source"
        target="_blank"
        label="Rewards page"
        trailing-icon="i-fa-arrow-up-right-from-square"
        color="primary"
        variant="ghost"
        size="xs"
        class="hidden sm:inline-flex"
      />
    </template>

    <p
      v-if="quote.lines.length === 0"
      class="py-6 text-center text-sm text-muted"
    >
      Nothing to add yet.
    </p>

    <template v-else>
      <p class="mb-4 text-xs text-muted">
        Add exactly these, one of each, to reproduce the order. Pledges come first, then the add-ons
        to put on top.
      </p>
      <ol class="grid grid-cols-1 gap-3">
        <CartLineCard
          v-for="(line, index) in quote.lines"
          :key="line.product.id"
          :line="line"
          :position="index + 1"
        />
      </ol>
    </template>
  </HudPanel>
</template>
