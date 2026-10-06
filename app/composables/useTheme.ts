import type { ThemeName } from '~/domain/types'

/** Also read by the script in nuxt.config.ts that sets the theme before the first paint. */
export const THEME_STORAGE_KEY = 'nemesis-rewards:theme'

const isTheme = (value: unknown): value is ThemeName => value === 'nemesis' || value === 'lockdown'

interface ThemeStore {
  readonly theme: Readonly<Ref<ThemeName>>
  readonly setTheme: (name: ThemeName) => void
}

/**
 * Nemesis or Lockdown. The theme is an attribute on the page's root element, which the
 * stylesheet keys its colours on (assets/css/main.css); this keeps it, the visitor's last
 * choice, and whatever shows the choice, in step.
 */
export const useTheme = (): ThemeStore => {
  const theme = useState<ThemeName>('theme', () => 'nemesis')

  const apply = (name: ThemeName): void => {
    theme.value = name
    document.documentElement.dataset['theme'] = name
  }

  // The last visit's theme is already on the page (nuxt.config.ts); this brings the state,
  // and so whatever shows it, into line.
  onMounted(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (isTheme(stored)) {
        apply(stored)
      }
    } catch {
      // Storage is unavailable; stay with the default.
    }
  })

  return {
    theme,
    setTheme: (name) => {
      apply(name)
      try {
        localStorage.setItem(THEME_STORAGE_KEY, name)
      } catch {
        // Storage is unavailable; the theme still applies for this visit.
      }
    },
  }
}
