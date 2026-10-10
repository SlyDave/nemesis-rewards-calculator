import { describe, expect, test } from 'bun:test'

import { CHANGES } from '../app/domain/changes'

const changelog = await Bun.file(new URL('../CHANGELOG.md', import.meta.url)).text()

/** The days CHANGELOG.md has a section for, in the order it has them. */
const sections = [...changelog.matchAll(/^## \[(?<date>[^\]]+)\]$/gmu)].map(
  (match) => match.groups?.['date'] ?? '',
)

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/u

/** Whether a string names a day that exists, and not, say, the 31st of June. */
const isRealDay = (date: string): boolean =>
  ISO_DAY.test(date) && new Date(`${date}T00:00:00Z`).toISOString().startsWith(date)

const isNewestFirst = (dates: readonly string[]): boolean =>
  dates.every((date, index) => index === 0 || date < (dates[index - 1] ?? ''))

describe('the “What’s New?” list', () => {
  test('is grouped by day, each one real, the latest first', () => {
    const dates = CHANGES.map((day) => day.date)
    expect(dates.length).toBeGreaterThan(0)
    for (const date of dates) {
      expect(isRealDay(date), date).toBe(true)
    }
    expect(isNewestFirst(dates)).toBe(true)
  })

  test('describes something for every day, in whole sentences', () => {
    for (const day of CHANGES) {
      expect(day.highlights.length, day.date).toBeGreaterThan(0)
      expect(new Set(day.highlights).size, day.date).toBe(day.highlights.length)
      for (const highlight of day.highlights) {
        expect(highlight, day.date).toMatch(/^\S.*\.$/u)
      }
    }
  })

  test('only counts the small changes', () => {
    for (const day of CHANGES) {
      expect(Number.isInteger(day.minor) && day.minor >= 0, day.date).toBe(true)
    }
  })
})

// CHANGELOG.md is the full account, and the list on the site the short one: a day on the site
// with no section in the changelog is a change described in one place and not the other.
describe('CHANGELOG.md', () => {
  test('has a section for every day the site lists', () => {
    for (const day of CHANGES) {
      expect(sections, `a section for ${day.date}`).toContain(day.date)
    }
  })

  test('has its days in order, the latest first, and each only once', () => {
    expect(sections.length).toBeGreaterThan(0)
    for (const date of sections) {
      expect(isRealDay(date), date).toBe(true)
    }
    expect(isNewestFirst(sections)).toBe(true)
  })

  test('groups changes under the headings Keep a Changelog names, and no others', () => {
    const allowed = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security']
    const headings = [...changelog.matchAll(/^### (?<type>.+)$/gmu)].map(
      (match) => match.groups?.['type'] ?? '',
    )
    expect(headings.length).toBeGreaterThan(0)
    for (const heading of headings) {
      expect(allowed, heading).toContain(heading)
    }
  })

  test('links every day to its commits', () => {
    for (const date of sections) {
      expect(changelog, `a link for ${date}`).toContain(
        `[${date}]: https://github.com/SlyDave/nemesis-rewards-calculator/commits/main/?since=${date}&until=${date}`,
      )
    }
  })
})
