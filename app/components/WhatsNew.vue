<script setup lang="ts">
import { CHANGELOG_URL, CHANGES } from '~/domain/changes'

// A fixed locale and zone, so the page rendered at build time and the visitor's browser say
// the same.
const DAY = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' })

/** The small changes of a day, counted and not described; nothing where there were none. */
const smaller = (count: number): string | null => {
  if (count === 0) {
    return null
  }
  return count === 1
    ? 'Plus 1 smaller fix or tweak.'
    : `Plus ${String(count)} smaller fixes and tweaks.`
}

const DAYS = CHANGES.map(({ date, highlights, minor }) => ({
  date,
  label: DAY.format(new Date(`${date}T00:00:00Z`)),
  highlights,
  smaller: smaller(minor),
}))
</script>

<template>
  <UModal
    title="What’s new"
    description="What has changed on the site, day by day, the latest first."
    :ui="{
      content: 'max-w-2xl ring-accented',
      // Clear of the close button, which sits over this corner.
      header: 'pe-14 sm:pe-16',
      title: 'hud-title text-sm font-normal text-primary',
      body: 'hud-scroll',
      footer: 'justify-end',
    }"
  >
    <!-- On a phone there is only room beside the logo for the icon. -->
    <UButton
      label="What’s New?"
      aria-label="What’s New?"
      icon="i-fa-news"
      color="neutral"
      variant="outline"
      class="hud-control shrink-0 hud-label text-xs"
      :ui="{ label: 'hidden sm:inline' }"
    />

    <template #body>
      <ol class="grid grid-cols-1 gap-6">
        <li
          v-for="day in DAYS"
          :key="day.date"
          class="min-w-0"
        >
          <h3 class="mb-3 flex items-center gap-3 hud-label text-xs text-primary">
            <time :datetime="day.date">{{ day.label }}</time>
            <span
              class="h-px flex-1 bg-linear-to-r from-(--hud-line) to-transparent"
              aria-hidden="true"
            />
          </h3>
          <ul class="grid grid-cols-1 gap-2.5 text-sm text-toned">
            <li
              v-for="highlight in day.highlights"
              :key="highlight"
              class="flex items-start gap-2.5"
            >
              <UIcon
                name="i-fa-chevron-right"
                class="mt-1 size-3 shrink-0 text-primary"
              />
              <span class="min-w-0">{{ highlight }}</span>
            </li>
          </ul>
          <p
            v-if="day.smaller !== null"
            class="mt-2.5 pl-5.5 text-xs text-muted"
          >
            {{ day.smaller }}
          </p>
        </li>
      </ol>
    </template>

    <template #footer>
      <UButton
        :to="CHANGELOG_URL"
        target="_blank"
        label="The full changelog"
        trailing-icon="i-fa-arrow-up-right-from-square"
        color="primary"
        variant="ghost"
        size="xs"
      />
    </template>
  </UModal>
</template>
