import rawCatalog from '../data/catalog.json'

import type { Cents } from './types'

/** A product as Gamefound lists it: a pledge, an add-on, or a part that only comes in a set. */
export interface Product {
  readonly id: number
  readonly name: string
  /** The list price, before any campaign discount. */
  readonly price: Cents
  /** What it actually costs. */
  readonly effectivePrice: Cents
  readonly categoryId: number
  readonly isSet: boolean
  /** Whether it can be put in a cart on its own. */
  readonly buyable: boolean
  /** Its position on Gamefound's rewards page; -1 for parts that are never listed. */
  readonly listOrder: number
  readonly abstract: string | null
  /** Path of the locally stored image, relative to the site root. */
  readonly image: string | null
  readonly url: string
  /** The ids of the products a set is made of. */
  readonly setItems: readonly number[]
  /** The surcharge for upgraded miniatures, where the product offers them. */
  readonly finish: { readonly sundrop: Cents; readonly painted: Cents } | null
}

export interface Catalog {
  readonly capturedAt: string
  readonly source: string
  readonly campaignEnd: string
  /** Units of each currency per euro when the catalogue was captured. */
  readonly rates: { readonly USD: number; readonly GBP: number }
  readonly products: readonly Product[]
}

const CENTS_PER_EURO = 100

export const toCents = (euros: number): Cents => Math.round(euros * CENTS_PER_EURO)

export const catalog: Catalog = {
  capturedAt: rawCatalog.capturedAt,
  source: rawCatalog.source,
  campaignEnd: rawCatalog.campaignEnd,
  rates: rawCatalog.rates,
  products: rawCatalog.products.map((product) => ({
    id: product.id,
    name: product.name,
    price: toCents(product.price),
    effectivePrice: toCents(product.effectivePrice),
    categoryId: product.categoryId,
    isSet: product.isSet,
    buyable: product.buyable,
    listOrder: product.listOrder,
    abstract: product.abstract,
    image: product.image,
    url: product.url,
    setItems: product.setItems.map((item) => item.id),
    finish:
      product.finish === null
        ? null
        : { sundrop: toCents(product.finish.sundrop), painted: toCents(product.finish.painted) },
  })),
}

const productsById: ReadonlyMap<number, Product> = new Map(
  catalog.products.map((product) => [product.id, product]),
)

export const findProduct = (id: number): Product | undefined => productsById.get(id)

export const getProduct = (id: number): Product => {
  const product = productsById.get(id)
  if (product === undefined) {
    throw new Error(`The catalogue has no product ${String(id)}`)
  }
  return product
}

/** The single items a product comes down to: itself, or everything in the set it is. */
export const leavesOf = (product: Product): readonly Product[] =>
  product.isSet ? product.setItems.flatMap((id) => leavesOf(getProduct(id))) : [product]

/** Everything that can be put in a cart, in the order Gamefound lists it. */
export const buyableProducts: readonly Product[] = catalog.products
  .filter((product) => product.buyable)
  .sort((a, b) => a.listOrder - b.listOrder)
