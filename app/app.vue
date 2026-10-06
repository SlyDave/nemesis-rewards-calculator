<script setup lang="ts">
const { app } = useRuntimeConfig()

// Under the site's base path, wherever it is deployed.
useHead({
  link: [{ rel: 'icon', type: 'image/svg+xml', href: `${app.baseURL}favicon.svg` }],
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
