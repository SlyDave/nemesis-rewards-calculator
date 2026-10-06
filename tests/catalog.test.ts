import { describe, expect, test } from 'bun:test'

import { buyableProducts, catalog, findProduct, leavesOf } from '../app/domain/catalog'
import { PROVIDES, REQUIREMENTS, findRequirement, providedBy } from '../app/domain/classification'
import { hasShippingTier } from '../app/domain/shipping'

describe('the catalogue', () => {
  test('has products, and every set is made of products it knows', () => {
    expect(catalog.products.length).toBeGreaterThan(50)
    for (const product of catalog.products) {
      for (const id of product.setItems) {
        expect(findProduct(id), `${product.name} contains ${String(id)}`).toBeDefined()
      }
    }
  })

  test('has a stored image for every product', async () => {
    for (const product of catalog.products) {
      expect(product.image, product.name).not.toBeNull()
      expect(
        await Bun.file(`public/${product.image ?? ''}`).exists(),
        `${product.name}: ${product.image ?? ''}`,
      ).toBe(true)
    }
  })

  test('prices everything in whole cents, never above list price', () => {
    for (const product of catalog.products) {
      expect(Number.isInteger(product.price), product.name).toBe(true)
      expect(Number.isInteger(product.effectivePrice), product.name).toBe(true)
      expect(product.effectivePrice, product.name).toBeLessThanOrEqual(product.price)
      expect(product.effectivePrice, product.name).toBeGreaterThan(0)
    }
  })
})

describe('the classification', () => {
  const leaves = catalog.products.filter((product) => !product.isSet)

  // The cue to edit app/domain/classification.ts after a new capture.
  test('knows every single item Gamefound sells', () => {
    const unknown = leaves
      .filter((leaf) => findRequirement(leaf.id) === undefined && !(leaf.id in PROVIDES))
      .map((leaf) => `${String(leaf.id)} ${leaf.name}`)
    expect(unknown).toEqual([])
  })

  test('names only products that exist', () => {
    const ids = [
      ...REQUIREMENTS.map((requirement) => requirement.id),
      ...Object.keys(PROVIDES).map(Number),
      ...Object.values(PROVIDES).flat(),
    ]
    for (const id of ids) {
      expect(findProduct(id), String(id)).toBeDefined()
    }
  })

  test('lists no requirement twice', () => {
    const ids = REQUIREMENTS.map((requirement) => requirement.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('maps every stand-in onto real requirements', () => {
    for (const leaf of leaves) {
      for (const id of providedBy(leaf.id)) {
        expect(findRequirement(id), `${leaf.name} provides ${String(id)}`).toBeDefined()
      }
    }
  })

  test('can buy every requirement somehow', () => {
    const obtainable = new Set(
      buyableProducts.flatMap((product) =>
        leavesOf(product).flatMap((leaf) => providedBy(leaf.id)),
      ),
    )
    for (const requirement of REQUIREMENTS) {
      expect(obtainable.has(requirement.id), String(requirement.id)).toBe(true)
    }
  })

  test('prices shipping for every pledge that contains a core box, and nothing else', () => {
    const coreBoxes = new Set(
      REQUIREMENTS.filter(
        (requirement) =>
          requirement.tag === 'core' && findProduct(requirement.id)?.buyable === false,
      ).map((requirement) => requirement.id),
    )
    for (const product of buyableProducts) {
      const isPledge = leavesOf(product).some((leaf) =>
        providedBy(leaf.id).some((id) => coreBoxes.has(id)),
      )
      expect(hasShippingTier(product.id), product.name).toBe(isPledge)
    }
  })
})
