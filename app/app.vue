<script setup lang="ts">
const { app } = useRuntimeConfig()

// Under the site's base path, which GitHub Pages sets to the repository name.
useHead({
  link: [{ rel: 'icon', type: 'image/svg+xml', href: `${app.baseURL}favicon.svg` }],
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
