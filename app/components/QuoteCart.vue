<script setup lang="ts">
import { catalog } from '~/domain/catalog'

import type { CartGroup, CartLine, Quote } from '~/domain/quote'

const props = defineProps<{
  quote: Quote
}>()

const GROUP_NAMES: Readonly<Record<CartGroup, string>> = {
  legacy: 'Nemesis Legacy',
  retaliation: 'Nemesis Retaliation',
  lockdown: 'Nemesis Lockdown',
  og: 'Nemesis',
  other: 'Everything else',
}

interface Section {
  readonly group: CartGroup
  readonly entries: { readonly line: CartLine; readonly position: number }[]
}

/** The lines as they come — by game, then category, then name — cut into one run per game. */
const sections = computed<readonly Section[]>(() => {
  const result: Section[] = []
  for (const [index, line] of props.quote.lines.entries()) {
    const entry = { line, position: index + 1 }
    const current = result.at(-1)
    if (current?.group === line.group) {
      current.entries.push(entry)
    } else {
      result.push({ group: line.group, entries: [entry] })
    }
  }
  return result
})
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
        Add exactly these, one of each, to reproduce the order. They are listed game by game: the
        pledge first, then the add-ons by category.
      </p>
      <div class="grid grid-cols-1 gap-5">
        <section
          v-for="section in sections"
          :key="section.group"
        >
          <h3 class="mb-2 flex items-center gap-3 hud-label text-xs text-toned">
            {{ GROUP_NAMES[section.group] }}
            <span
              class="h-px flex-1 bg-linear-to-r from-(--hud-line) to-transparent"
              aria-hidden="true"
            />
          </h3>
          <ol
            class="grid grid-cols-1 gap-3"
            :start="section.entries[0]?.position ?? 1"
          >
            <CartLineCard
              v-for="{ line, position } in section.entries"
              :key="line.product.id"
              :line="line"
              :position="position"
            />
          </ol>
        </section>
      </div>
    </template>
  </HudPanel>
</template>
