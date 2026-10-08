/**
 * Builds what the site ships from the Gamefound capture.
 *
 * data/gamefound.json is the campaign's catalogue as Gamefound's own page reads it
 * (scripts/capture-gamefound.js). This trims it to what the calculator needs, writes that
 * to app/data/catalog.json, and stores every product image locally as a small WebP so the
 * site never loads anything from Gamefound. It also fetches the exchange rates for the day of
 * the capture, which the site starts from.
 *
 * Run with `bun run catalog:build` after a new capture; add `--force` to fetch every image
 * again rather than only the missing ones.
 */

import { mkdir } from 'node:fs/promises'

import sharp from 'sharp'

import { FOREIGN_CURRENCIES, isCurrencyCode } from '../app/domain/currencies'

interface CapturedOptionValue {
  readonly text: string
  readonly priceModifier: number
}

interface CapturedOption {
  readonly text: string
  readonly values: readonly CapturedOptionValue[]
}

interface CapturedProduct {
  readonly id: number
  readonly name: string
  readonly price: number
  readonly effectivePrice: number
  readonly categoryId: number
  readonly isSet: boolean
  readonly buyable: boolean
  readonly listed: boolean
  readonly listOrder: number
  readonly abstract: string | null
  readonly image: string | null
  readonly thumb: string | null
  readonly setItems: readonly { id: number; qty: number }[]
  readonly options: readonly CapturedOption[]
  readonly url: string
}

interface CapturedCurrency {
  readonly code: string
  readonly eurPerUnit: number
}

interface Capture {
  readonly capturedAt: string
  readonly source: string
  readonly campaignEnd: string
  readonly displayCurrencies: readonly CapturedCurrency[]
  readonly categories: readonly {
    id: number
    name: string
    parentId: number | null
    sortOrder: number
  }[]
  readonly products: readonly CapturedProduct[]
}

const CAPTURE = 'data/gamefound.json'
const CATALOG = 'app/data/catalog.json'
const IMAGE_DIR = 'public/images/products'
const IMAGE_WIDTH = 640
const IMAGE_QUALITY = 78
const MINIATURES_OPTION = 'Miniatures version'
const RATES_URL = 'https://api.frankfurter.dev/v2/rates'
/** Significant figures: enough for a rate of 0.8475 and of 20,060 alike. */
const RATE_PRECISION = 5
const DATE_LENGTH = 'YYYY-MM-DD'.length

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null

const isCapturedProduct = (value: unknown): value is CapturedProduct =>
  isRecord(value) &&
  typeof value['id'] === 'number' &&
  typeof value['name'] === 'string' &&
  typeof value['price'] === 'number' &&
  typeof value['effectivePrice'] === 'number' &&
  typeof value['url'] === 'string' &&
  // The page links to these; nothing but a Gamefound address may come out of a capture.
  value['url'].startsWith('https://gamefound.com/') &&
  Array.isArray(value['setItems']) &&
  Array.isArray(value['options'])

/** Whether a file is a capture, so that a wrong or half-written one fails here and not later. */
const isCapture = (value: unknown): value is Capture =>
  isRecord(value) &&
  typeof value['capturedAt'] === 'string' &&
  typeof value['source'] === 'string' &&
  typeof value['campaignEnd'] === 'string' &&
  Array.isArray(value['displayCurrencies']) &&
  Array.isArray(value['categories']) &&
  Array.isArray(value['products']) &&
  value['products'].every(isCapturedProduct)

const force = process.argv.includes('--force')
const capture: unknown = await Bun.file(CAPTURE).json()
if (!isCapture(capture)) {
  throw new Error(`${CAPTURE} is not a Gamefound capture; see scripts/capture-gamefound.js`)
}

/** The surcharge for a miniatures finish, where the product offers one. */
const finishOf = (product: CapturedProduct): { sundrop: number; painted: number } | null => {
  const option = product.options.find((candidate) => candidate.text === MINIATURES_OPTION)
  if (option === undefined) {
    return null
  }
  const modifier = (label: string): number =>
    option.values.find((value) => value.text === label)?.priceModifier ?? 0
  return { sundrop: modifier('Sundrop'), painted: modifier('Fully painted') }
}

const storeImage = async (product: CapturedProduct): Promise<string | null> => {
  const source = product.image ?? product.thumb
  if (source === null) {
    return null
  }
  const file = `${IMAGE_DIR}/${String(product.id)}.webp`
  const published = `images/products/${String(product.id)}.webp`
  if (!force && (await Bun.file(file).exists())) {
    return published
  }
  const response = await fetch(source)
  if (!response.ok) {
    throw new Error(`${String(response.status)} fetching the image for ${product.name}`)
  }
  await sharp(await response.arrayBuffer())
    .resize({ width: IMAGE_WIDTH, withoutEnlargement: true })
    .webp({ quality: IMAGE_QUALITY })
    .toFile(file)
  return published
}

/**
 * The exchange rates the site starts with, until the browser has fetched the day's own
 * (app/composables/useRates.ts): central banks' reference rates for the day of the capture,
 * from Frankfurter. Gamefound's own rates would do for the dozen currencies its menu offers,
 * but the site also offers those of the other places the campaign ships to.
 */
const ratesOn = async (day: string): Promise<Record<string, number>> => {
  const codes = FOREIGN_CURRENCIES.join(',')
  const response = await fetch(`${RATES_URL}?base=EUR&quotes=${codes}&date=${day}`)
  if (!response.ok) {
    throw new Error(`${String(response.status)} fetching the exchange rates for ${day}`)
  }
  const reply: unknown = await response.json()
  const found = new Map<string, number>()
  if (Array.isArray(reply)) {
    for (const entry of reply) {
      if (
        isRecord(entry) &&
        typeof entry['quote'] === 'string' &&
        typeof entry['rate'] === 'number' &&
        entry['rate'] > 0
      ) {
        found.set(entry['quote'], entry['rate'])
      }
    }
  }
  return Object.fromEntries(
    FOREIGN_CURRENCIES.map((code) => {
      const rate = found.get(code)
      if (rate === undefined) {
        throw new Error(`no ${code} rate for ${day}`)
      }
      return [code, Number(rate.toPrecision(RATE_PRECISION))]
    }),
  )
}

/** Gamefound's menu must not have gained a currency the site does not offer. */
const unknownCurrencies = capture.displayCurrencies
  .map((candidate) => candidate.code)
  .filter((code) => !isCurrencyCode(code))
if (unknownCurrencies.length > 0) {
  throw new Error(
    `Gamefound lists currencies app/domain/currencies.ts does not: ${unknownCurrencies.join(', ')}`,
  )
}

await mkdir(IMAGE_DIR, { recursive: true })

const products = []
for (const product of [...capture.products].sort((a, b) => a.id - b.id)) {
  products.push({
    id: product.id,
    name: product.name,
    price: product.price,
    effectivePrice: product.effectivePrice,
    categoryId: product.categoryId,
    isSet: product.isSet,
    buyable: product.buyable && product.listed,
    listOrder: product.listOrder,
    abstract: product.abstract,
    image: await storeImage(product),
    url: product.url,
    setItems: product.setItems,
    finish: finishOf(product),
  })
}

const catalog = {
  capturedAt: capture.capturedAt,
  source: capture.source,
  campaignEnd: capture.campaignEnd,
  rates: await ratesOn(capture.capturedAt.slice(0, DATE_LENGTH)),
  categories: capture.categories,
  products,
}

await Bun.write(CATALOG, `${JSON.stringify(catalog, null, 2)}\n`)
console.log(`wrote ${String(products.length)} products to ${CATALOG}, images in ${IMAGE_DIR}`)
