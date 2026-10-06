<script setup lang="ts">
/** One of the "Include …" switches: an icon, what it includes, and the switch itself. */
defineProps<{
  label: string
  icon: string
  /** A line of small print under the label. */
  hint?: string | undefined
  /** Shown faded, for a switch that has nothing to add just now. It can still be set. */
  idle?: boolean
}>()

const included = defineModel<boolean>({ required: true })
</script>

<template>
  <label
    class="flex cursor-pointer items-center gap-3 border px-3 py-2.5 transition-colors"
    :class="[
      included
        ? 'border-primary/60 bg-primary/10'
        : 'border-default bg-elevated/40 hover:border-accented',
      idle ? 'opacity-55' : '',
    ]"
  >
    <UIcon
      :name="icon"
      class="size-5 shrink-0 transition-colors"
      :class="included ? 'text-primary' : 'text-dimmed'"
    />
    <span class="min-w-0 flex-1">
      <span class="block text-sm leading-tight font-semibold text-highlighted">{{ label }}</span>
      <span
        v-if="hint !== undefined"
        class="mt-0.5 block text-xs leading-tight text-muted"
        >{{ hint }}</span
      >
    </span>
    <USwitch v-model="included" />
  </label>
</template>
