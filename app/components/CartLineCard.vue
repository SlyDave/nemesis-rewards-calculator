<script setup lang="ts">
import type { CartLine } from '~/domain/quote'

const props = defineProps<{
  line: CartLine
  /** Its place among the things to add, from 1; null for a gift, which is not added by hand. */
  position: number | null
}>()

const { format } = useMoney()
const { app } = useRuntimeConfig()

const IMAGE_SIZE = 640

/** The stored images live under the site's base path, wherever it is deployed. */
const imageUrl = computed<string | null>(() =>
  props.line.product.image === null ? null : `${app.baseURL}${props.line.product.image}`,
)

const isBundle = computed<boolean>(() => props.line.contents.length > 1)
const bonusCount = computed<number>(
  () => props.line.contents.filter((content) => !content.wanted).length,
)
const isDiscounted = computed<boolean>(() => props.line.price < props.line.product.price)
</script>

<template>
  <li class="border border-default bg-elevated/40 transition-colors hover:border-accented">
    <div class="flex gap-3 p-3 sm:gap-4">
      <div class="relative shrink-0">
        <img
          v-if="imageUrl !== null"
          :src="imageUrl"
          :alt="line.product.name"
          :width="IMAGE_SIZE"
          :height="IMAGE_SIZE"
          loading="lazy"
          decoding="async"
          class="size-20 border border-default object-cover sm:size-28"
        />
        <span
          class="absolute -top-1.5 -left-1.5 grid size-6 place-items-center bg-primary hud-label text-xs text-inverted"
          aria-hidden="true"
        >
          <UIcon
            v-if="position === null"
            name="i-fa-value"
            class="size-3.5"
          />
          <template v-else>{{ position }}</template>
        </span>
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <div class="flex items-start justify-between gap-3">
          <h4 class="text-sm leading-snug font-semibold text-highlighted sm:text-base">
            {{ line.product.name }}
          </h4>
          <p class="shrink-0 text-right text-base font-bold text-highlighted sm:text-lg">
            <s
              v-if="isDiscounted"
              class="block text-xs font-normal text-dimmed"
              >{{ format(line.product.price) }}</s
            >
            {{ line.price === 0 ? 'Free' : format(line.price) }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <UBadge
            :label="line.shipping === null ? 'Add-on' : 'Pledge'"
            :color="line.shipping === null ? 'neutral' : 'primary'"
            variant="subtle"
            size="sm"
          />
          <UBadge
            v-if="line.isGift"
            label="Returning backer gift · nothing to add"
            icon="i-fa-robot"
            color="primary"
            variant="subtle"
            size="sm"
          />
          <UBadge
            v-if="line.shipping !== null"
            :label="`Shipping ${format(line.shipping)}`"
            icon="i-fa-shipping"
            color="neutral"
            variant="outline"
            size="sm"
          />
          <UBadge
            v-if="line.finish > 0"
            :label="`Finish +${format(line.finish)}`"
            icon="i-fa-finish"
            color="neutral"
            variant="outline"
            size="sm"
          />
          <UBadge
            v-if="bonusCount > 0"
            :label="`${String(bonusCount)} bonus`"
            icon="i-fa-bonus"
            color="primary"
            variant="outline"
            size="sm"
          />
        </div>

        <div class="mt-auto flex flex-wrap items-center justify-between gap-2">
          <UCollapsible
            v-if="isBundle"
            class="min-w-0 flex-1"
            :ui="{ content: 'pt-2' }"
          >
            <UButton
              :label="`What’s inside (${String(line.contents.length)})`"
              color="neutral"
              variant="link"
              size="sm"
              trailing-icon="i-fa-chevron-down"
              class="group px-0"
              :ui="{
                trailingIcon: 'size-3 transition-transform group-data-[state=open]:rotate-180',
              }"
            />
            <template #content>
              <ul class="grid grid-cols-1 gap-1 text-xs">
                <li
                  v-for="content in line.contents"
                  :key="content.product.id"
                  class="flex items-start gap-2"
                >
                  <UIcon
                    :name="content.wanted ? 'i-fa-check' : 'i-fa-bonus'"
                    class="mt-0.5 size-3.5 shrink-0"
                    :class="content.wanted ? 'text-primary' : 'text-warning'"
                  />
                  <span :class="content.wanted ? 'text-toned' : 'text-muted'">
                    {{ content.product.name }}
                    <span
                      v-if="!content.wanted"
                      class="text-warning"
                      >— not asked for, comes with the bundle</span
                    >
                  </span>
                </li>
              </ul>
            </template>
          </UCollapsible>
          <span
            v-else
            class="flex-1"
          />

          <UButton
            :to="line.product.url"
            target="_blank"
            label="View on Gamefound"
            trailing-icon="i-fa-arrow-up-right-from-square"
            color="primary"
            variant="outline"
            size="xs"
            class="shrink-0 self-start"
          />
        </div>
      </div>
    </div>
  </li>
</template>
