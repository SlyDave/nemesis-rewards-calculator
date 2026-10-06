<script setup lang="ts">
import { catalog } from '~/domain/catalog'

const REPOSITORY = 'https://github.com/SlyDave/nemesis-rewards-calculator'

// A fixed zone, so the page rendered at build time and the visitor's browser say the same.
const capturedAt = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'UTC',
}).format(new Date(catalog.capturedAt))
</script>

<template>
  <footer class="mt-10 grid grid-cols-1 gap-3 border-t border-default py-8 text-xs text-muted">
    <p>
      Prices and bundle contents were read from the
      <ULink
        :to="catalog.source"
        target="_blank"
        class="text-primary hover:underline"
        >Nemesis Legacy rewards page on Gamefound</ULink
      >
      on {{ capturedAt }} UTC; shipping is from the campaign’s shipping table. Both can change while
      the campaign runs, and Gamefound’s checkout is always the final word.
    </p>
    <p>
      An unofficial fan-made tool. Not affiliated with, or endorsed by, Awaken Realms or Gamefound.
      Nemesis and all product names and images belong to their owners.
    </p>
    <p>
      <ULink
        :to="REPOSITORY"
        target="_blank"
        class="text-primary hover:underline"
        >Source on GitHub</ULink
      >
    </p>
  </footer>
</template>
