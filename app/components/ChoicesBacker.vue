<script setup lang="ts">
import { getProduct } from '~/domain/catalog'
import { GIFT_DETAILS_URL, RETURNING_BACKER_GIFT } from '~/domain/gift'

const { preferences, update } = usePreferences()
const { format } = useMoney()
const { app } = useRuntimeConfig()

const gift = getProduct(RETURNING_BACKER_GIFT)

const IMAGE_SIZE = 640

/** The stored images live under the site's base path, wherever it is deployed. */
const imageUrl = gift.image === null ? null : `${app.baseURL}${gift.image}`

const isReturning = computed<boolean>({
  get: () => preferences.value.returningBacker,
  set: (value) => {
    update({ returningBacker: value })
  },
})

/** What becomes of the gift, given the rest of the choices. */
const outcome = computed<string>(() => {
  if (!preferences.value.returningBacker) {
    return `Otherwise it is an add-on at ${format(gift.effectivePrice)}, under Expansions.`
  }
  return preferences.value.lines.legacy
    ? 'It is in your cart below, at no charge.'
    : 'It plays in Nemesis Legacy, so it is only added with Legacy — or tick it under Expansions to take it anyway.'
})
</script>

<template>
  <HudPanel
    title="Returning backer"
    icon="i-fa-robot"
  >
    <ChoiceSwitch
      v-model="isReturning"
      label="I’ve backed Nemesis before"
      hint="On Kickstarter or Gamefound: a campaign, pledge manager or late pledge"
      icon="i-fa-robot"
    />

    <div class="mt-4 flex items-start gap-4">
      <img
        v-if="imageUrl !== null"
        :src="imageUrl"
        :alt="gift.name"
        :width="IMAGE_SIZE"
        :height="IMAGE_SIZE"
        loading="lazy"
        decoding="async"
        class="size-20 shrink-0 border border-default object-cover"
      />
      <div class="min-w-0 text-xs text-muted">
        <p>
          <span class="font-semibold text-highlighted">Free gift: the SAM Robot Pack.</span>
          Returning Nemesis backers can add it to their pledge for nothing. {{ outcome }}
        </p>
        <p class="mt-2">
          Gamefound recognises you by the email address of your earlier pledge, so pledge with the
          same one.
          <ULink
            :to="GIFT_DETAILS_URL"
            target="_blank"
            class="text-primary hover:underline"
            >Details in campaign Update #6</ULink
          >.
        </p>
      </div>
    </div>
  </HudPanel>
</template>
