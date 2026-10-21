<script setup lang="ts">
import type { ExtraCategory, ExtraItem } from '~/domain/selection'

/**
 * One of the extras: a switch for the whole category, and beneath it, opened on
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
    return 'Nothing on sale'
  }
  return state === 'some' ? `${String(wantedCount)} of ${plural(size)}` : plural(size)
})

/**
 * The small print under an item: that a pledge brings it already; that only a pledge sells
 * it; and, for one the switch passes over, whose it is and that it can be had.
 */
const noteFor = (item: ExtraItem): { description?: string } => {
  if (item.included !== null) {
    return { description: `${item.included}.` }
  }
  const notes = [
    item.soldIn === null ? null : `${item.soldIn}.`,
    item.passedOver === null ? null : `${item.passedOver}. Tick it to take it anyway.`,
  ].filter((note) => note !== null)
  return notes.length === 0 ? {} : { description: notes.join(' ') }
}

const priceOf = (item: ExtraItem): string => {
  if (item.included !== null) {
    return 'Included'
  }
  if (item.soldIn !== null) {
    return 'Pledge only'
  }
  return item.price === 0 ? 'Free' : format(item.price)
}

/*
 * The picture of the item pointed at, beside the card: off its left side, level with the
 * item, as far from it as the cards are from each other, and framed as the card is. Where the
 * left has no room for it, it goes to the right. It is drawn outside the panel (in a portal),
 * whose cut corners would otherwise clip it.
 */

/** The gap between the cards (gap-2 in ChoicesExtras), kept between the card and the picture. */
const CARD_GAP_PX = 8
const IMAGE_SIZE = 640

const { app } = useRuntimeConfig()
const card = useTemplateRef<HTMLElement>('card')
const previewed = ref<{ readonly item: ExtraItem; readonly row: HTMLElement } | null>(null)

const showPreview = (item: ExtraItem, event: PointerEvent): void => {
  // Only for a pointer that hovers; a tap on a touch screen is for ticking.
  if (event.pointerType !== 'touch' && event.currentTarget instanceof HTMLElement) {
    previewed.value = { item, row: event.currentTarget }
  }
}

const hidePreview = (): void => {
  previewed.value = null
}

// A row that goes away with the list cannot be left by the pointer.
watch(isOpen, hidePreview)

/** The card's left and right, with the top and bottom of the row pointed at. */
const previewAnchor = computed(() => {
  const box = card.value
  const row = previewed.value?.row
  if (box === null || row === undefined) {
    return undefined
  }
  return {
    contextElement: box,
    getBoundingClientRect: (): DOMRect => {
      const outer = box.getBoundingClientRect()
      const inner = row.getBoundingClientRect()
      return new DOMRect(outer.left, inner.top, outer.width, inner.height)
    },
  }
})

const previewImage = computed<string | null>(() => {
  const image = previewed.value?.item.image
  return image === undefined || image === null ? null : `${app.baseURL}${image}`
})

/** The card's own border as it stands while pointed at. */
const previewBorder = computed<string>(() =>
  props.category.state === 'off' ? 'border-accented' : 'border-primary/60',
)
</script>

<template>
  <UPopover
    mode="hover"
    :open="previewImage !== null"
    :reference="previewAnchor"
    :content="{
      side: 'left',
      align: 'start',
      sideOffset: CARD_GAP_PX,
      collisionPadding: CARD_GAP_PX,
    }"
    :ui="{ content: 'pointer-events-none rounded-none bg-transparent shadow-none ring-0' }"
  >
    <div
      ref="card"
      class="@container border transition-colors"
      :class="[
        category.state === 'off'
          ? 'border-default bg-elevated/40 hover:border-accented'
          : 'border-primary/60 bg-primary/10',
        isEmpty ? 'opacity-55' : '',
      ]"
    >
      <!-- Every label fits on one line at the widths the cards normally come in, so they are
         all the same height: a label and its count. Only in a card too narrow for the longest
         label is room kept for a second line, so that the rest still match the one that wraps. -->
      <div class="flex items-start gap-1.5 px-3 py-2.5 @max-[16.5rem]:min-h-18">
        <label
          :for="switchId"
          class="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5"
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
          @pointerenter="showPreview(item, $event)"
          @pointerleave="hidePreview"
        >
          <UCheckbox
            :model-value="item.wanted"
            :disabled="item.included !== null"
            :label="item.name"
            v-bind="noteFor(item)"
            size="sm"
            class="min-w-0"
            @update:model-value="emit('pick', item.id, $event === true)"
          >
            <!-- The games it is for, where its name does not say. -->
            <template
              v-if="item.fits !== null"
              #label
            >
              {{ item.name }} <span class="font-normal text-muted">({{ item.fits }})</span>
            </template>
          </UCheckbox>
          <span class="shrink-0 text-xs text-muted">{{ priceOf(item) }}</span>
        </li>
      </ul>
    </div>

    <template #content>
      <img
        v-if="previewImage !== null"
        :src="previewImage"
        :alt="previewed?.item.name"
        :width="IMAGE_SIZE"
        :height="IMAGE_SIZE"
        decoding="async"
        class="block size-40 border bg-default object-cover sm:size-56"
        :class="previewBorder"
      />
    </template>
  </UPopover>
</template>
