/**
 * Captures the Nemesis Legacy catalogue from Gamefound: every pledge and add-on, its price,
 * and what each bundle contains.
 *
 * Gamefound sits behind bot protection that turns away scripts, so this is not run from the
 * command line. It runs in your own browser, on Gamefound's own page, and asks for exactly
 * what that page asks for:
 *
 *   1. Open https://gamefound.com/en/projects/awaken-realms/nemesis-legacy/rewards
 *   2. Open the browser's developer tools and paste this whole file into the Console.
 *   3. Wait about a minute. It downloads `gamefound.json`.
 *   4. Move that file to `data/gamefound.json` and run `bun run catalog:build`.
 *
 * Then run `bun test`: it fails if Gamefound has added a product that
 * app/domain/classification.ts does not know yet.
 *
 * The shipping table is not part of this. Awaken Realms publish it as an image on the
 * project page; it is typed out by hand in app/domain/shipping.ts.
 */
;(async () => {
  const state = window.__INITIAL_STATE__
  const projectId = state.projectContext.projectID
  const PAUSE_MS = 350 // Be polite: one product at a time, with a breath between them.

  const get = async (path) => {
    const response = await fetch(path, { credentials: 'include' })
    if (!response.ok) {
      throw new Error(`${response.status} from ${path}`)
    }
    return response.json()
  }
  const pause = () => new Promise((resolve) => setTimeout(resolve, PAUSE_MS))
  const text = (html) => {
    if (!html) {
      return null
    }
    const element = document.createElement('div')
    element.innerHTML = html
    return element.innerText.replace(/\s+/g, ' ').trim() || null
  }

  const [rewards, addons] = await Promise.all([
    get(`/api/projectContents/getRewards?projectID=${projectId}`),
    get(`/api/projectContents/getAddons?projectID=${projectId}`),
  ])
  const listed = [
    ...rewards.data.rewards,
    ...addons.data.addonCategories.flatMap((category) => category.cardModels),
  ].map((card) => card.productID)

  // Follow every bundle down to the items it is made of; some are never listed on their own.
  const details = new Map()
  const queue = [...listed]
  while (queue.length > 0) {
    const id = queue.shift()
    if (details.has(id)) {
      continue
    }
    const query = `productID=${id}&projectID=${projectId}`
    const detail = await get(`/api/products/getProductDetails?${query}`)
    const cart = await get(`/api/products/getProductAddToCartModel?${query}`)
    details.set(id, { detail, cart })
    queue.push(...(detail.setItems ?? []).map((item) => item.productID))
    console.log(`captured ${details.size}: ${detail.productName}`)
    await pause()
  }

  const capture = {
    capturedAt: new Date().toISOString(),
    source: location.origin + location.pathname,
    projectId,
    baseCurrency: 'EUR',
    campaignEnd: state.projectContext.project.campaignEnd,
    displayCurrencies: state.displayCurrencies.map((currency) => ({
      code: currency.shortName,
      symbol: currency.symbol.trim(),
      eurPerUnit: currency.relativeFactor,
      eurPerUnitWithCommission: currency.relativeFactorWithCommission,
    })),
    categories: [
      { id: rewards.data.rewards[0].categoryID, name: 'Rewards', parentId: null, sortOrder: 0 },
      ...addons.data.addonCategories.map(({ category }) => ({
        id: category.categoryID,
        name: category.name.trim(),
        parentId: category.parentID,
        sortOrder: category.sortOrder,
      })),
    ],
    products: [...details].map(([id, { detail, cart }]) => ({
      id,
      name: detail.productName.trim(),
      price: detail.price,
      effectivePrice: detail.effectivePrice,
      categoryId: detail.categoryID,
      isSet: detail.productType === 1,
      buyable: Boolean(detail.isBuyable),
      listed: listed.includes(id),
      listOrder: listed.indexOf(id),
      abstract: detail.abstract || null,
      description: text(detail.description),
      image: detail.mainImageUrl || detail.imageList?.[0]?.productImage || null,
      thumb: cart.imageUrl || null,
      images: (detail.imageList ?? []).map((image) => image.productImage),
      setItems: (detail.setItems ?? []).map((item) => ({
        id: item.productID,
        qty: item.quantity,
      })),
      options: (cart.options ?? []).map((option) => ({
        text: option.text,
        values: option.values
          .filter((value) => value.isEnabled)
          .map((value) => ({ text: value.text, priceModifier: value.priceModifier || 0 })),
      })),
      eta: detail.estimatedDeliveryAt || null,
      url: `https://gamefound.com${detail.productUrl}`,
    })),
  }

  const link = document.createElement('a')
  link.href = URL.createObjectURL(
    new Blob([JSON.stringify(capture, null, 2)], { type: 'application/json' }),
  )
  link.download = 'gamefound.json'
  link.click()
  URL.revokeObjectURL(link.href)
  console.log(`done: ${capture.products.length} products`)
})()
