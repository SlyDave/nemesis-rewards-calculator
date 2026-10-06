<script setup lang="ts" generic="T extends string">
/** An either/or choice, shown as a row of options with one lit. */
const props = defineProps<{
  options: readonly {
    readonly value: T
    readonly label: string
    readonly icon?: string
  }[]
  /** What the choice is, for screen readers; the visible label is the caller's. */
  label: string
  disabled?: boolean
}>()

const chosen = defineModel<T>({ required: true })

const choose = (option: T): void => {
  if (!props.disabled) {
    chosen.value = option
  }
}
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="label"
    :aria-disabled="disabled"
    class="flex gap-1 border border-default bg-elevated/40 p-1"
    :class="disabled ? 'opacity-50' : ''"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="option.value === chosen"
      :disabled="disabled"
      class="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 py-2 hud-label text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      :class="
        option.value === chosen
          ? 'bg-primary/20 text-primary hud-chevron'
          : 'cursor-pointer text-muted hover:text-highlighted disabled:cursor-not-allowed'
      "
      @click="choose(option.value)"
    >
      <UIcon
        v-if="option.icon !== undefined"
        :name="option.icon"
        class="size-4 shrink-0"
      />
      <span class="truncate">{{ option.label }}</span>
    </button>
  </div>
</template>
