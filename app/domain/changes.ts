/**
 * What has changed on the site, as a visitor would notice it: the list behind "What's New?".
 *
 * There are no version numbers. The site is deployed as changes are pushed, so they are
 * grouped by the day they were made, newest first.
 *
 * This is the short version. CHANGELOG.md, at the root of the repository, is the full one,
 * and has a section for every day here. A change belongs in `highlights` if a visitor will
 * see it or get a different answer because of it. A smaller thing they could see — a tweak
 * to the layout, a correction to the wording, a fix to something that was briefly wrong — is
 * only counted, in `minor`. What nobody using the site could see, such as tests, documents
 * and the build, is in the changelog alone.
 */
export interface ChangeDay {
  /** The day, as YYYY-MM-DD. */
  readonly date: string
  /** What a visitor will notice or be affected by, the most significant first. */
  readonly highlights: readonly string[]
  /** How many smaller changes went with them, which are counted and not described. */
  readonly minor: number
}

export const CHANGELOG_URL =
  'https://github.com/SlyDave/nemesis-rewards-calculator/blob/main/CHANGELOG.md'

export const CHANGES: readonly ChangeDay[] = [
  {
    date: '2026-10-26',
    highlights: [
      'Prices and bundles read again from Gamefound after campaign Update #17. No product or price has changed.',
    ],
    minor: 0,
  },
  {
    date: '2026-10-23',
    highlights: [
      'Campaign Update #16’s Legacy Big Box is a standalone €89 add-on. With the game and Big Box alone, the answer is now the €129 Core Pledge plus that add-on — €218 instead of the €489 Vengeance pledge with BIG BOX.',
      'All four games with every extra now costs €1,674 in rewards, down from €1,727.',
      'Each item in the Gamefound cart list shows its tax beneath its price.',
      'The Legacy Big Box’s shipping is not final. The campaign says it will cost less than shipping a Standard or Special Edition pledge, but more than a normal add-on.',
      'Prices and bundles read again from Gamefound. The standalone Big Box is the only product added; no existing product has changed.',
    ],
    minor: 1,
  },
  {
    date: '2026-10-21',
    highlights: [
      'VAT is shown in two lines: on the rewards, and on the shipping.',
      'Shipping for the Vengeance and ULTIMATE pledges, from the campaign’s reissued shipping table: the ULTIMATE Pledge is €145 to the EU or UK sent at once, €165 split.',
      'Prices and bundles read again from Gamefound, with the campaign page checked for changes. No price has changed.',
      'Point at an item in an open extras list to see its picture beside the card.',
      'The Alternative Sculpts say which game they are for, where the name does not.',
      'The Classic Crew is only added for Retaliation now: the campaign says earlier campaigns’ content does not work with Legacy.',
    ],
    minor: 1,
  },
  {
    date: '2026-10-20',
    highlights: [
      'Campaign Update #15’s three new pledges are in: the Legacy Vengeance pledge, the Vengeance pledge with BIG BOX, and the ULTIMATE Pledge.',
      'New Legacy add-ons under their switches: New Cats, New Kings, Alternative Character Sculpts, and the Space Bober Plushie and Hoodie.',
      'A new switch, Metal Markers, for the Metal Malfunction Markers.',
      'The campaign has not priced shipping for the new pledges yet. Each is counted at the least it can be — the shipping of the biggest published pledge it holds — and says so.',
      'The Legacy BIG BOX is only sold in the Vengeance pledge with it, which is sent as single shipping only. Asking for the Big Box brings that pledge.',
    ],
    minor: 2,
  },
  {
    date: '2026-10-18',
    highlights: [
      'Prices and bundles read again from Gamefound after campaign Update #14. No price has changed.',
    ],
    minor: 0,
  },
  {
    date: '2026-10-16',
    highlights: [
      'Prices and bundles read again from Gamefound after campaign Update #13. No price has changed.',
    ],
    minor: 0,
  },
  {
    date: '2026-10-14',
    highlights: [
      'Prices and bundles read again from Gamefound after campaign Update #12. No price has changed.',
    ],
    minor: 0,
  },
  {
    date: '2026-10-12',
    highlights: [
      'Prices and bundles read again from Gamefound after campaign Update #11. No price has changed.',
    ],
    minor: 0,
  },
  {
    date: '2026-10-10',
    highlights: [
      'This list: a “What’s New?” button at the top of the page.',
      'Prices and bundles read again from Gamefound after campaign Update #10. No price has changed.',
      'Returning backers: the free SAM Robot Pack is now a numbered line in the cart, since you add it yourself — the one Gamefound lists at €0.00. Its shipping is no longer taken to be free, as the campaign’s FAQ has it.',
      'A note under “Miniatures finish”: stretch goals take their Core Box’s finish, and only Retaliation’s are charged for it separately.',
    ],
    minor: 1,
  },
  {
    date: '2026-10-09',
    highlights: [
      'Aftermath, the Void Seeders Expansion, the Lockdown and Retaliation Stretch Goals and the Legacy Recharge Pack are now listed under Expansions. Each shows as included where your pledge already brings it, and can be added without its game.',
      'Expansions with only Lockdown switched on now adds Aftermath and Void Seeders, which Gamefound says also work with Lockdown.',
    ],
    minor: 0,
  },
  {
    date: '2026-10-08',
    highlights: [
      'Prices and bundles read again from Gamefound after campaign Update #9: the Secret Add-on is now Evolved Void Seeders.',
      'MSRP and “Saving vs MSRP”: what your order would cost at retail, with a breakdown item by item.',
      'Twenty-seven currencies in a searchable menu, with the euro as the default.',
      'Add-ons that are played in two games now follow either one: Evolved Void Seeders with Retaliation; the Carnomorphs, the Medic and the Constructs Pack with Lockdown.',
      'Split shipping is only offered where an order has something to split.',
      'A Donate link in the header.',
    ],
    minor: 3,
  },
  {
    date: '2026-10-06',
    highlights: [
      'The calculator goes live: switch on the games and extras you want, and it finds the cheapest combination of pledges, bundles and add-ons, with shipping, VAT and the list to add to your Gamefound cart.',
      'Open any extra to pick single items, with or without the game they belong to.',
      'A switch for returning backers, who get the SAM Robot Pack free.',
      'Four styles, one for each Nemesis game.',
    ],
    minor: 7,
  },
]
