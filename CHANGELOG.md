# Changelog

All notable changes to the Nemesis Rewards Calculator are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The project has
no version numbers, and so does not follow Semantic Versioning: the site is deployed from `main`
as changes are pushed, and each section here is a day, newest first, written year-month-day.
Each date links to that day's commits.

The "What's New?" list on the site is the short version of this file, with only what a visitor
would notice. It is kept in [`app/domain/changes.ts`](app/domain/changes.ts).

## [2026-10-21]

### Added

- Pointing at an item in an open extras category shows its picture beside the card, level with
  the item, framed like the card and twice the size of the cart's; for an item a pledge already
  includes too. It sits off the card's left side, or its right where the left has no room.
- The Alternative Sculpts say which game they are for where the name does not: Alien Kings
  (for Nemesis OG), the Alternative Queen miniature and the Classic Crew (for Nemesis
  Retaliation), as Gamefound describes them.

### Changed

- VAT is shown as two lines, one on the rewards and one on the shipping, where it was one. The
  finish surcharge counts with the rewards, and that line says so when there is one. Each is
  worked out and rounded to the cent by itself, so the lines add up to what is charged; no
  reference total moved.
- Shipping for the Vengeance and ULTIMATE pledges is the campaign's own, from its shipping
  table, reissued with a column for each: the ULTIMATE Pledge is €165 split or €145 sent at
  once to the EU or the UK, where the site had counted at least the 4 x Core Pledge's €97 or
  €76. The table has no column for the Vengeance pledge with BIG BOX, which is still counted at
  the least it can be, now the Vengeance pledge's.
- The catalogue was captured again, and the rest of the campaign page checked for changes to
  its text and graphics. Only the two Vengeance pledges' names had changed, to "Nemesis Legacy
  Vengeance Pledge" and "… Pledge with BIG BOX"; the site uses them. No price, bundle, picture
  or option changed, and the exchange rates the site falls back on are those of 21 October.
- `CONTEXT.md` records the reissued shipping table, read row by row against the old one, and
  the check of the campaign page.

## [2026-10-20]

### Added

- The catalogue gains campaign Update #15's products: three pledges — the Nemesis Legacy
  Vengeance pledge (€449), the Vengeance pledge with BIG BOX (€489) and the ULTIMATE Pledge
  (€1,350) — and six add-ons for Legacy: Alternative Character Sculpts, New Kings, New Cats,
  Metal Malfunction Markers, and the Space Bober Plushie and Hoodie. The Legacy Big Box comes
  with them, sold only inside its pledge.
- A sixteenth extras switch, Metal Markers, for the Metal Malfunction Markers, after Acrylic
  Packs. A link made before it reads it as off, and otherwise as it did.
- Each other add-on is under its switch: the cats under Cats, the kings and character sculpts
  under Alternative Sculpts, the Bober under Plushes and Hoodies, and the Big Box under BIG
  BOX(es). With Legacy on, those switches now reach Legacy's own rather than every game's.
- An item sold only inside a pledge says so under its switch, with "Pledge only" for a price.
- A pledge whose shipping the campaign has not priced is flagged as such: "Shipping not
  published" on its card, a warning under the shipping total, and a note under "Good to know".
- Tests for the new pledges: what each is the answer for, the Big Box's single shipping, and
  their unpriced shipping; and for the Metal Markers switch and the links made before it.

### Changed

- The pledges of Update #15 are not in the campaign's shipping table, which has not been
  reissued. Their shipping is not guessed: each is counted at the least it can be, the
  published shipping of the biggest pledge it holds the whole of — the 4 x Core Pledge's for
  the ULTIMATE Pledge, the Salvation Pledge's for the Vengeance pledges — and the page says so.
- An order holding the Vengeance pledge with BIG BOX cannot be split, since the campaign sends
  that pledge only in one shipment; the line under the choice says why.
- The "ADDITIONAL Recharge Pack for FREE" in the new pledges stands for a second Legacy
  Recharge Pack, and its MSRP is that pack's figure, not half as much again as nothing.
- A cart line is labelled a pledge for holding a game's core, not for having a shipping price.
- Several answers change with the new products. Asking for the Legacy Big Box brings the
  Vengeance pledge with BIG BOX (€489), so all four games with every extra now come to €1,727
  in rewards, where they were €1,599, and go as single shipping. Without the Big Boxes, the
  answer for all four games is the ULTIMATE Pledge and two add-ons (€1,378).
- The solver's two random brute-force checks may take a minute: three more pledges made the
  brute force eight times slower.
- `CONTEXT.md` records the new products, the readings taken, and the reference results that
  changed.

### Fixed

- Leaving extras out could raise the total. With every extra but the Big Boxes the answer was
  the ULTIMATE Pledge; leaving out Hoodies and Cats as well made it the 4 x Core Pledge and
  add-ons, €7.50 less in rewards but more in all, because the ULTIMATE Pledge's unpublished
  shipping had been counted as nothing while the 4 x Core Pledge's €97 was counted. Its
  shipping is now counted at the least it can be, and a test holds that leaving those extras
  out brings the total down.

## [2026-10-18]

### Changed

- The catalogue was captured again after campaign Update #14. Nothing in it had changed since
  16 October: no price, bundle, picture, category or option, and no finish priced differently
  inside a pledge. The footer's date follows the update, and the exchange rates the site falls
  back on are now those of 18 October.
- `CONTEXT.md` records Update #14: two free stretch goals for Infinity Mode, an Infinity Variety
  Pack and fifteen more TAC cards; the graphic stating the Legacy MSRPs, re-issued with the same
  figures; and the campaign's notice of new pledge options and cosmetic add-ons on 20 October,
  with what the site will need when they come.

## [2026-10-16]

### Changed

- The catalogue was captured again after campaign Update #13. Nothing in it had changed since
  14 October: no price, bundle, picture, category or option, and no finish priced differently
  inside a pledge. The footer's date follows the update, and the exchange rates the site falls
  back on are now those of 16 October.
- `CONTEXT.md` records Update #13: Infinity Mode's component list, and a narrated companion
  app as a free stretch goal; the graphic stating the Legacy MSRPs, re-issued with the same
  figures; and the campaign's correction that the creatures revealed in Update #12 are
  Shamblers, not Metagorgers, which `CONTEXT.md` had repeated.

## [2026-10-14]

### Changed

- The catalogue was captured again after campaign Update #12. Nothing in it had changed since
  12 October: no price, bundle, picture, category or option, and no finish priced differently
  inside a pledge. The footer's date follows the update, and the exchange rates the site falls
  back on are now those of 14 October.
- `CONTEXT.md` records Update #12: Sora as the Techie, twenty Metagorgers for the Evolved
  Carnomorphs, and an account of Infinity Mode — free stretch-goal content and explanation,
  none of it a product — and the two changes to the campaign's FAQ, neither of which touches
  what is sold or what it costs.

## [2026-10-12]

### Changed

- The catalogue was captured again after campaign Update #11. No price, bundle, picture,
  category or option changed, so no figure on the site moved. The one difference is a word in
  the Salvation Pledge's description on Gamefound, which the site does not show. The exchange
  rates the site falls back on are now those of 12 October.
- `CONTEXT.md` records Update #11: the Techie, a new crew member class that is a free stretch
  goal inside the Legacy pledges and not a product; and that the Legacy Recharge Pack and the
  Crew Logs add-on gain content with each new class, at the same price.

## [2026-10-10]

### Added

- A "What's New?" button at the top right of the header. It opens a list of the changes by date,
  newest first: the significant ones described, the small ones only counted. The list links
  here.
- This changelog.
- A line under "Miniatures finish": "Stretch goals take their Core Box's finish. Only
  Retaliation's are charged for it separately." Campaign Update #10 says a pledge's stretch
  goals come in the finish chosen for its Core Box. Gamefound's cart agrees for Legacy, the
  original game and Lockdown; Retaliation's Stretch Goals still carry a finish price of their
  own (€13 Sundrop, €59 painted), which the site goes on charging as the cart does.
- A link to the campaign's FAQ in the returning-backer panel, beside the one to Update #6.
- Tests that hold the "What's New?" list in order and in step with this file, and one that
  fails if any pledge's Stretch Goals gain or lose a finish price, so that the line above
  cannot go stale unnoticed.

### Changed

- The catalogue was captured again after campaign Update #10. The Salvation Pledge has a new
  picture, with the Evolved Void Seeders box where the Secret Add-on's placeholder was. No
  price, bundle, category or option changed, so no figure on the site moved. The exchange
  rates the site falls back on are now those of 10 October.
- The returning backer's SAM Robot Pack follows the campaign's FAQ, which differs from what was
  first built on two points:
  - The backer adds it to the cart, choosing the one Gamefound lists at €0.00. So it is now a
    numbered cart line, counted with the others, and says which listing to take. Before, the
    pledge manager was said to add it by itself, and it had no number.
  - Its shipping is charged, since it adds to the weight of the order. So it is counted among
    the add-ons whose shipping "Awaken Realms will only price in the pledge manager". Before,
    it was taken to ship free.
  - The paragraph in the returning-backer panel says both. No total changes: the pack is still
    free, and no add-on has a shipping price yet.
- `CONTEXT.md` and `README.md` record Update #10, the finish each pledge's cart charges, the
  gift's new rules, and how a campaign update is checked.

## [2026-10-09]

### Added

- Five items are listed under Expansions that were listed nowhere: Aftermath, the Void Seeders
  Expansion, the Lockdown Stretch Goals, the Retaliation Stretch Goals and the Legacy Recharge
  Pack. Each comes in every pledge for its game and is also sold by itself. With its game
  included it shows as "Included", names the pledge that brings it, cannot be left out and is
  no part of what the switch counts. Without its game it is an extra like any other.
- A test that every single item on sale is under some switch, so that nothing sold can go
  missing from the page again; and one that an item is only said to come with a pledge where
  every pledge for its game holds it.

### Changed

- Expansions with only Lockdown included now takes Aftermath and Void Seeders as well as the
  Carnomorphs and the Medic, since Gamefound describes both as working with Lockdown. The
  rewards for that order go from €161 to €217.

### Fixed

- Aftermath could not be found on the page, nor bought without the original game. It had been
  classed as part of that game and nothing more, and what is part of a game has no switch.

## [2026-10-08]

### Added

- Twenty-seven currencies, where there were three: the twelve Gamefound's own menu lists
  beside the euro, and the currency of every other place the campaign ships to. They are in a
  searchable menu with EUR, USD and GBP at the top, each written with its own symbol where its
  users put it.
- "MSRP" and "Saving vs MSRP" tiles beside "Reward value" and "Saving": what the cart would
  cost at retail, and how far under that it comes. Hovering over the MSRP, focusing it or
  tapping it lists every item with its figure and where the figure is from.
  - A retail MSRP the campaign states is used as it stands: the Legacy Core Box at €199 and
    its Stretch Goals at €99. Retaliation's campaign stated its own.
  - Otherwise the figure is the item's price in the earliest of the three older campaigns to
    have sold it, turned into euros at the rate of its day and raised by consumer-price
    inflation since. The inflation asked for was Wrocław's; Statistics Poland publishes none
    for a city, so it is that of its region, Dolnośląskie.
  - Where there is no figure anywhere, one is assumed: this campaign's price plus 50%. It is
    marked as an assumption, and a note says what the 50% rests on: the two times a campaign
    has put a retail MSRP beside its own price, which stand 54.3% and 73.4% above it.
- A Donate link in the header, to the right of Reset, opening the owner's GitHub Sponsors page
  in a new tab.
- Add-ons that are played in a second game, besides the one they are sold with, are recorded
  as such, and their switch takes them with either game included: Evolved Void Seeders with
  Retaliation as well as Legacy; the Carnomorph Expansion, the Medic Character Pack and the
  Nemesis Constructs Pack with Lockdown as well as the original game.
- The GNU General Public License, version 3.

### Changed

- The catalogue was captured again after campaign Update #9. The Secret Add-on is now Evolved
  Void Seeders, with a new description and picture. No price, bundle or category changed.
- The euro is the default currency. A first visit from the United Kingdom no longer starts in
  pounds; only the destination is guessed.
- Exchange rates come from the second version of Frankfurter's service, which has all
  twenty-seven currencies. The rates the site starts from are fetched with the catalogue, for
  the day it was captured.
- Expansions with only Lockdown included takes the expansions that work with Lockdown. Before,
  none being recorded as Lockdown's, it took every game's.
- Split shipping is only offered where the order has something for each of the campaign's two
  shipments. For an order that all goes out together — the older games alone, or Legacy
  add-ons alone — the option is faded and cannot be chosen, the order is priced and described
  as single shipping, and a line says why. The choice itself is kept for when the order has
  two parts. No total changed by it.
- The note on when an order arrives no longer speaks of a Legacy Core Box where the order has
  Legacy add-ons but no Legacy pledge.
- The currency menu and Reset are the same height as the style selector.
- The capture script lists products in order of id, so that one capture can be compared with
  the next line by line.

### Fixed

- The Donate link overhung the panels beneath it. The header row now ends where the right-hand
  column's panels end, and that column keeps room for its scrollbar always, so its panels no
  longer shift as the order grows.

## [2026-10-07]

### Added

- `CONTEXT.md`, the handover document: what was asked for, what was decided and by whom, the
  rules the calculator follows, and the things that broke along the way.

## [2026-10-06]

The first release.

### Added

- The calculator: a static site, running wholly in the browser, that finds the cheapest
  combination of Nemesis Legacy pledges, bundles and add-ons on Gamefound for a chosen set of
  games and extras, prices it, and lists what to add to the Gamefound cart.
  - Switches for the four games, for Standard or Special Edition, for the miniatures finish,
    and for fifteen kinds of extra.
  - The catalogue as captured from Gamefound: 98 products, what each bundle contains, and
    their pictures, which the site stores itself.
  - An exact search for the cheapest combination, checked in the tests against a brute-force
    one. A bundle that brings things not asked for wins where it is cheaper, and those things
    are shown as bonuses.
  - The campaign's shipping table for ten regions, split or single; VAT by destination, which
    can be switched off or corrected.
  - The total in euros, dollars or pounds, at central-bank reference rates.
  - The choices are remembered in the browser and carried in the page's address, so an order
    can be shared as a link.
- Four styles, one for each game: Nemesis and Lockdown from the Nemesis games site,
  Retaliation and Legacy from their box art.
- Each extra opens to list its items with their prices, to be ticked one by one. The switch
  still takes the whole category, and rests in a third, halfway position where only some
  items are ticked. Picks win over the switch, travel in the link and are remembered.
- The cart is listed game by game — Legacy, Retaliation, Lockdown, the original, then whatever
  belongs to none — with the pledge first, then by category, then by name.
- A switch for returning backers, who get the SAM Robot Pack free (campaign Update #6). With
  it on, the pack is added to a Legacy order at no charge, counted in the value of the rewards
  and in the saving, and marked as a gift in the cart.
- The site's own address, `nemesis.slydave.com`.
- Font Awesome Pro icons, with Font Awesome Free standing in wherever there is no licence
  token, so that a fork still builds.
- TypeScript, ESLint and Prettier at their strictest, a pre-commit hook, and GitHub Actions
  that check every push and deploy the site to GitHub Pages.
- `SECURITY.md`.

### Changed

- An add-on is no longer withheld because its game is not included: a dice tray can be had
  without the original Nemesis. A switch takes what goes with the included games, or its whole
  category where nothing in it belongs to one of them. Items it passes over say why, and can
  be ticked all the same.
- Accessories made for a game's expansions follow that game's expansions, and can be ticked
  regardless.
- The Classic Crew is wanted for Retaliation or Legacy only where the original game and
  Lockdown are not both included, since together those two already provide every character.
- Choosing pounds switches VAT on, at the United Kingdom's 20%.
- "Include" is gone from the labels of the games and the extras, and "Gameplay Expansions" is
  "Expansions".
- The extras cards are all one height, with the icon, the arrow and the switch along the top
  of each.
- The returning backer's gift was listed without a number, as something the pledge manager
  adds by itself, and taken to ship free. Both were reversed on 10 October.
- The gift's panel says what it is plainly, and its badge in the cart is "Returning backer
  gift".
- The icon script fails if a Pro icon it names does not exist, where it used to draw the Free
  stand-in without a word.

### Fixed

- The "Deliver to" list opened underneath the page.

### Security

- Every built page carries a Content Security Policy that names its own inline scripts by
  hash.
- The workflows pin each action to a commit, grant the least permissions each job needs and do
  not keep the checkout's credentials. Dependabot keeps the pins current.
- An install with no Font Awesome token — a fork, Dependabot — falls back to Font Awesome Free
  where it used to fail.
- A capture may only contain Gamefound addresses.

[2026-10-21]: https://github.com/SlyDave/nemesis-rewards-calculator/commits/main/?since=2026-10-21&until=2026-10-21
[2026-10-20]: https://github.com/SlyDave/nemesis-rewards-calculator/commits/main/?since=2026-10-20&until=2026-10-20
[2026-10-18]: https://github.com/SlyDave/nemesis-rewards-calculator/commits/main/?since=2026-10-18&until=2026-10-18
[2026-10-16]: https://github.com/SlyDave/nemesis-rewards-calculator/commits/main/?since=2026-10-16&until=2026-10-16
[2026-10-14]: https://github.com/SlyDave/nemesis-rewards-calculator/commits/main/?since=2026-10-14&until=2026-10-14
[2026-10-12]: https://github.com/SlyDave/nemesis-rewards-calculator/commits/main/?since=2026-10-12&until=2026-10-12
[2026-10-10]: https://github.com/SlyDave/nemesis-rewards-calculator/commits/main/?since=2026-10-10&until=2026-10-10
[2026-10-09]: https://github.com/SlyDave/nemesis-rewards-calculator/commits/main/?since=2026-10-09&until=2026-10-09
[2026-10-08]: https://github.com/SlyDave/nemesis-rewards-calculator/commits/main/?since=2026-10-08&until=2026-10-08
[2026-10-07]: https://github.com/SlyDave/nemesis-rewards-calculator/commits/main/?since=2026-10-07&until=2026-10-07
[2026-10-06]: https://github.com/SlyDave/nemesis-rewards-calculator/commits/main/?since=2026-10-06&until=2026-10-06
