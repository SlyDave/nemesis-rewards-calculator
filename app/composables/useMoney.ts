import { formatMoney } from '~/domain/money'

import type { Cents } from '~/domain/types'

/** Writes euro amounts out in the currency the visitor chose, at the current rate. */
export const useMoney = (): { readonly format: (cents: Cents) => string } => {
  const { preferences } = usePreferences()
  const { rates } = useRates()

  return {
    format: (cents) => formatMoney(cents, preferences.value.currency, rates.value),
  }
}
