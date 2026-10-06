<script setup lang="ts">
import { LINES } from '~/domain/preferences'

import type { Edition, Finish } from '~/domain/types'

const { preferences, update, setLine } = usePreferences()

const EDITIONS: readonly { value: Edition; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'special', label: 'Special' },
]

const FINISHES: readonly { value: Finish; label: string }[] = [
  { value: 'plain', label: 'Plain' },
  { value: 'sundrop', label: 'Sundrop' },
  { value: 'painted', label: 'Painted' },
]

const edition = computed<Edition>({
  get: () => preferences.value.edition,
  set: (value) => {
    update({ edition: value })
  },
})

const finish = computed<Finish>({
  get: () => preferences.value.finish,
  set: (value) => {
    update({ finish: value })
  },
})
</script>

<template>
  <HudPanel
    title="Games"
    icon="i-fa-og"
  >
    <div class="grid grid-cols-1 gap-2">
      <ChoiceSwitch
        v-for="{ line, label, description, icon } in LINES"
        :key="line"
        :model-value="preferences.lines[line]"
        :label="label"
        :hint="description"
        :icon="icon"
        @update:model-value="setLine(line, $event)"
      />
    </div>

    <div class="mt-5 grid grid-cols-1 gap-5">
      <div>
        <p class="mb-2 flex items-center gap-2 hud-label text-xs text-toned">
          <UIcon
            name="i-fa-edition"
            class="size-4 text-primary"
          />
          Standard or Special Edition
        </p>
        <SegmentedChoice
          v-model="edition"
          :options="EDITIONS"
          label="Standard or Special Edition"
          :disabled="!preferences.lines.legacy"
        />
        <p class="mt-2 text-xs text-muted">
          Nemesis Legacy with standees, or with miniatures. The older games only come with
          miniatures.
        </p>
      </div>

      <div>
        <p class="mb-2 flex items-center gap-2 hud-label text-xs text-toned">
          <UIcon
            name="i-fa-finish"
            class="size-4 text-primary"
          />
          Miniatures finish
        </p>
        <SegmentedChoice
          v-model="finish"
          :options="FINISHES"
          label="Miniatures finish"
        />
        <p class="mt-2 text-xs text-muted">
          Sundrop wash or full paint, added to everything you ask for that offers it.
        </p>
      </div>
    </div>
  </HudPanel>
</template>
