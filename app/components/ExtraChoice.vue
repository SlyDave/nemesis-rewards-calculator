<script setup lang="ts">
import { EXTRAS } from '~/domain/preferences'

import type { ExtraCategory, ExtraItem } from '~/domain/selection'

/**
 * One of the "Include …" extras: a switch for the whole category, and beneath it, opened on
 * request, every item in the category to be picked or left one by one.
 */
const props = defineProps<{
  label: string
  icon: string
  category: ExtraCategory
}>()

const emit = defineEmits<{
  /** The switch was pressed: everything in the category, or nothing. */
  toggle: []
  /** One item was ticked or unticked. */
  pick: [id: number, wanted: boolean]
}>()

const { format } = useMoney()

const isOpen = ref<boolean>(false)
const switchId = useId()
const listId = useId()

const isEmpty = computed<boolean>(() => props.category.items.length === 0)

const plural = (count: number): string => (count === 1 ? '1 item' : `${String(count)} items`)

const hint = computed<string>(() => {
  const { state, wantedCount, size } = props.category
  if (isEmpty.value) {
    return 'None for your games'
  }
  return state === 'some' ? `${String(wantedCount)} of ${plural(size)}` : plural(size)
})

/** "Include Gameplay Expansions" -> "gameplay expansions", to name what an accessory waits on. */
const nameOf = (tag: string): string =>
  (EXTRAS.find((extra) => extra.tag === tag)?.label ?? tag).replace(/^Include /, '').toLowerCase()

/** The small print under an item that is only there for another category's sake. */
const noteFor = (item: ExtraItem): { description?: string } =>
  item.waitsFor === null
    ? {}
    : { description: `For the ${nameOf(item.waitsFor)}, so left out unless you tick it` }
</script>

<template>
  <div
    class="border transition-colors"
    :class="[
      category.state === 'off'
        ? 'border-default bg-elevated/40 hover:border-accented'
        : 'border-primary/60 bg-primary/10',
      isEmpty ? 'opacity-55' : '',
    ]"
  >
    <!-- Tall enough for a label that runs to two lines, so every card is the same height
         whether its own does or not. Where the cards sit in one wide column no label wraps,
         and they are left at their natural height. -->
    <div class="flex min-h-18 items-start gap-2 px-3 py-2.5 lg:min-h-0 xl:min-h-18">
      <label
        :for="switchId"
        class="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
      >
        <UIcon
          :name="icon"
          class="size-5 shrink-0 transition-colors"
          :class="category.state === 'off' ? 'text-dimmed' : 'text-primary'"
        />
        <span class="min-w-0 flex-1">
          <span class="block text-sm leading-tight font-semibold text-highlighted">{{
            label
          }}</span>
          <span class="mt-0.5 block text-xs leading-tight text-muted">{{ hint }}</span>
        </span>
      </label>

      <UButton
        v-if="!isEmpty"
        :icon="isOpen ? 'i-fa-chevron-up' : 'i-fa-chevron-down'"
        :aria-label="isOpen ? `Hide the items in ${label}` : `Choose the items in ${label}`"
        :aria-expanded="isOpen"
        :aria-controls="listId"
        color="neutral"
        variant="ghost"
        size="xs"
        class="-mt-0.5 shrink-0"
        @click="isOpen = !isOpen"
      />

      <TriSwitch
        :id="switchId"
        :state="category.state"
        @toggle="emit('toggle')"
      />
    </div>

    <ul
      v-if="isOpen && !isEmpty"
      :id="listId"
      class="grid grid-cols-1 gap-2 border-t border-default px-3 py-3"
    >
      <li
        v-for="item in category.items"
        :key="item.id"
        class="flex items-start justify-between gap-3"
      >
        <UCheckbox
          :model-value="item.wanted"
          :label="item.name"
          v-bind="noteFor(item)"
          size="sm"
          class="min-w-0"
          @update:model-value="emit('pick', item.id, $event === true)"
        />
        <span class="shrink-0 text-xs text-muted">{{ format(item.price) }}</span>
      </li>
    </ul>
  </div>
</template>
