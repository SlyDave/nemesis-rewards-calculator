<script setup lang="ts">
import { EXTRAS, countExtras } from '~/domain/preferences'

const { preferences, setExtra, setAllExtras } = usePreferences()

const counts = computed(() => countExtras(preferences.value))

const hintFor = (count: number): string => {
  if (count === 0) {
    return 'None for your games'
  }
  return count === 1 ? '1 item' : `${String(count)} items`
}
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

    <p class="mb-4 text-xs text-muted">Each switch applies to every game you’ve included.</p>

    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      <ChoiceSwitch
        v-for="{ tag, label, icon } in EXTRAS"
        :key="tag"
        :model-value="preferences.extras[tag]"
        :label="label"
        :hint="hintFor(counts[tag])"
        :icon="icon"
        :idle="counts[tag] === 0"
        @update:model-value="setExtra(tag, $event)"
      />
    </div>
  </HudPanel>
</template>
