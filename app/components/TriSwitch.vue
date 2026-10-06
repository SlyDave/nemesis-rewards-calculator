<script setup lang="ts">
import type { CategoryState } from '~/domain/selection'

/**
 * A switch with a third position, for a group that is only partly on. It looks like the
 * library's switch beside it, with the thumb stopped halfway; to a screen reader it is a
 * checkbox, the control that has a "mixed" state to announce.
 */
defineProps<{
  state: CategoryState
  /** For a label elsewhere to point at. */
  id: string
}>()

const emit = defineEmits<{
  toggle: []
}>()

const ARIA_CHECKED = { on: 'true', off: 'false', some: 'mixed' } as const
</script>

<template>
  <button
    :id="id"
    type="button"
    role="checkbox"
    :aria-checked="ARIA_CHECKED[state]"
    class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    :class="{
      'bg-primary': state === 'on',
      'bg-primary/45': state === 'some',
      'bg-accented': state === 'off',
    }"
    @click="emit('toggle')"
  >
    <span
      class="pointer-events-none block size-4 rounded-full bg-default shadow-lg transition-transform"
      :class="{
        'translate-x-4': state === 'on',
        'translate-x-2': state === 'some',
        'translate-x-0': state === 'off',
      }"
    />
  </button>
</template>
