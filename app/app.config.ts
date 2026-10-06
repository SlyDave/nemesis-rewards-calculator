/**
 * Nuxt UI addresses its internal icons by name, so pointing them at the Font Awesome
 * collection keeps ticks, chevrons and spinners in the same family as everything else.
 */
export default defineAppConfig({
  ui: {
    // The palettes are in assets/css/main.css. `signal` is the Nemesis teal; the Lockdown
    // theme swaps the same steps for its red there, so nothing here changes with the theme.
    colors: {
      primary: 'signal',
      neutral: 'void',
    },

    icons: {
      arrowLeft: 'i-fa-arrow-left',
      arrowRight: 'i-fa-arrow-right',
      check: 'i-fa-check',
      chevronDoubleLeft: 'i-fa-angles-left',
      chevronDoubleRight: 'i-fa-angles-right',
      chevronDown: 'i-fa-chevron-down',
      chevronLeft: 'i-fa-chevron-left',
      chevronRight: 'i-fa-chevron-right',
      chevronUp: 'i-fa-chevron-up',
      close: 'i-fa-xmark',
      ellipsis: 'i-fa-ellipsis',
      external: 'i-fa-arrow-up-right-from-square',
      folder: 'i-fa-folder',
      folderOpen: 'i-fa-folder-open',
      loading: 'i-fa-spinner-third',
      minus: 'i-fa-minus',
      plus: 'i-fa-plus',
      search: 'i-fa-magnifying-glass',
      upload: 'i-fa-arrow-up-from-bracket',
    },
  },
})
