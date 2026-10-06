<script setup lang="ts">
/** A framed console panel with a title bar: the container everything on the page sits in. */
defineProps<{
  title: string
  icon: string
}>()

defineSlots<{
  default: () => unknown
  /** Sits at the right-hand end of the title bar. */
  aside?: () => unknown
}>()
</script>

<template>
  <section class="hud-frame">
    <div class="hud-frame-body p-4 sm:p-6">
      <header class="mb-5 flex items-center gap-3">
        <UIcon
          :name="icon"
          class="size-5 shrink-0 text-primary"
        />
        <h2 class="hud-title text-sm text-primary">{{ title }}</h2>
        <span
          class="h-px min-w-4 flex-1 bg-linear-to-r from-(--hud-line) to-transparent"
          aria-hidden="true"
        />
        <slot name="aside" />
      </header>
      <slot />
    </div>
  </section>
</template>
