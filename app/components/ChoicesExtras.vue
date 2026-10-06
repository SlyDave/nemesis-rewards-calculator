<script setup lang="ts">
import { EXTRAS } from '~/domain/preferences'
import { describeExtra } from '~/domain/selection'

const { preferences, setExtra, setItem, setAllExtras } = usePreferences()

const categories = computed(() =>
  EXTRAS.map((extra) => ({ ...extra, category: describeExtra(preferences.value, extra.tag) })),
)
</script>

<template>
  <HudPanel
    title="Extras"
    icon="i-fa-sliders"
  >
    <template #aside>
      <UButton
        size="xs"
        variant="ghost"
        color="primary"
        label="All"
        @click="setAllExtras(true)"
      />
      <UButton
        size="xs"
        variant="ghost"
        color="neutral"
        label="None"
        @click="setAllExtras(false)"
      />
    </template>

    <p class="mb-4 text-xs text-muted">
      Each switch takes what goes with the games you’ve included — or its whole category, where
      nothing in it belongs to one of them. Open a switch to pick any single item, with or without
      its game.
    </p>

    <div class="grid grid-cols-1 items-start gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      <ExtraChoice
        v-for="{ tag, label, icon, category } in categories"
        :key="tag"
        :label="label"
        :icon="icon"
        :category="category"
        @toggle="setExtra(tag, category.state !== 'on')"
        @pick="setItem"
      />
    </div>
  </HudPanel>
</template>
