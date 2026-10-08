# CONTEXT — Nemesis Rewards Calculator

A handover document. It records what was asked for, what was decided and why, and the things
that broke along the way, so that someone picking this up — a person or an agent — can carry on
without guessing at decisions already made.

It is a companion to two shorter files: [README.md](README.md) is the developer's how-to, and
[SECURITY.md](SECURITY.md) is the security posture. Where they overlap, this file has the
reasoning and they have the summary.

State described: 8 October 2026, after the catalogue was captured again for campaign Update #9
and the currencies and MSRP were added. Everything below is built, tested,
pushed and live unless it says otherwise.

## 1. Snapshot

|                  |                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------- |
| What it is       | A static site that works out the cheapest way to back Nemesis Legacy on Gamefound       |
| Live at          | <https://nemesis.slydave.com/>                                                          |
| Repository       | <https://github.com/SlyDave/nemesis-rewards-calculator> — public, default branch `main` |
| Hosting          | GitHub Pages, built by GitHub Actions, custom domain (DNS through Cloudflare)           |
| Stack            | Nuxt 4.5 + Nuxt UI 4 (Tailwind 4), TypeScript, Bun; pre-rendered, no server             |
| Campaign         | <https://gamefound.com/en/projects/awaken-realms/nemesis-legacy/rewards>                |
| Catalogue        | Captured 8 October 2026, 18:20 UTC. The campaign ends 27 October 2026, 19:00 UTC        |
| Catalogue size   | 98 products: 16 pledges (sets), 72 sold singly, 10 parts sold only inside pledges       |
| Classified items | 79 requirements in `app/domain/classification.ts`                                       |
| Tests            | 143, all passing (`bun test`)                                                           |

## 2. The brief

### The original request

Build a static, client-side-only website, hosted on GitHub Pages from a public repository
called `nemesis-rewards-calculator`:

- **Nuxt and Nuxt UI**, fully pre-rendered, all logic running in the browser.
- Iconography is **Font Awesome Pro**.
- **TypeScript, ESLint and Prettier each set to their strictest.**
- Themed to match <https://www.nemesisgames.eu/>, with a toggle between styles.
- A set of switches: Standard or Special Edition; Nemesis Retaliation; Nemesis Lockdown; Nemesis
  OG; Acrylic Packs; Playmat(s); Artbook(s); Synthetic Cards; Sleeves; Terrain Pack(s); Untold
  Stories; Promo Cards; BIG BOX(es); Alternative Sculpts; Cats; Hoodies; Dice Tray; Plushes.
- Take every product, price and bundle from the Gamefound rewards page, and for any combination
  of the switches work out the **best combination** of pledges, bundles and add-ons — including
  a bundle that contains switched-off things, when that is still cheaper.
- A toggle for **Split or Single shipping**, and a toggle for **Tax/VAT**.
- A **currency** choice: everything is based on euros, with current exchange rates for $ and £.
- Show the **total value of the rewards**, and the **items to add to the Gamefound cart**, with
  images that are stored locally.

### What was asked for afterwards, in order

1. Publish at `nemesis.slydave.com`.
2. Two more themes, Retaliation and Legacy, coloured from their box art as Gamefound shows it.
3. Fix the "Deliver to" menu, which opened with nothing in it.
4. Choosing £ switches VAT on and sets it to 20%.
5. The Classic Crew rule (section 7.3).
6. A full security sweep: nothing exposed in the public repository, `.env` never uploaded,
   tokens held as GitHub secrets.
7. Each extras switch opens to show its items, any of which can be picked or left; the switch
   gains a third, "some selected" state.
8. The cart is ordered Legacy, Retaliation, Lockdown, OG, everything else — and within each
   game by category, alphabetically within the category.
9. The extras cards are all the same height, with icon, switch and arrow aligned along the top.
10. Add-ons are not restricted by which games are selected: "you can get the dice tray without
    getting Nemesis OG".
11. The word "Include" is removed from the Games and Extras labels.
12. A returning-backer section at the top of the page (section 7.4).
13. Exact wording for the returning-backer paragraph and the cart badge (section 8.3).
14. Campaign Update #9: the "Secret Add-on" became Evolved Void Seeders. Capture the catalogue
    again, and double-check the existing items, prices, groups and conditions (sections 6 and
    7.1).
15. Every currency the campaign supports — those it lists, and those of the places it ships to
    — in a searchable menu, with EUR, USD and GBP at the top, EUR the default, and the correct
    symbol for each, looked up (section 7.8).
16. "MSRP" and "Saving vs MSRP" beside "Reward value" and "Saving": the MSRP read from the
    campaign's project page, which holds it in images; failing that from the earlier campaigns,
    raised by inflation in Wrocław since they were created; with a breakdown on hover that says
    where inflation was used, with the original figure, its date and the result (section 7.11).
17. Where no MSRP is published, assume one at 50% above this campaign's price, and say that it
    is an assumption and what it rests on (section 7.11).
18. Split shipping is not offered where the order has nothing to split, as the campaign's FAQ
    describes the two shipments (section 7.6).

### Where each decision came from

Sections 7 and 8 mark decisions **[owner]** where the owner asked for exactly that, and
**[reading]** where the request left room and a reading was chosen, reported to the owner, and
not objected to. The readings are settled, but they are the ones to raise first if the owner's
intent ever seems different.

## 3. Working agreements

These were set by the owner during the work, and still hold.

- **Do not push until told to.** Commit locally and wait: the owner's words were "Hold until I
  say". A push to `main` is a production deploy, so it is never a formality.
- **Verify before reporting.** Run `bun run check`, and look at a change in a browser if it can
  be seen there, before saying it is done.
- **Wording the owner dictates is used exactly**, not paraphrased.
- **Look up library documentation rather than recalling it** — Nuxt, Nuxt UI, Tailwind and the
  rest move quickly. The owner's standing rule is to use the Context7 documentation tool for
  any question about a library, framework or CLI.
- **Repository settings are the owner's to change.** Security settings on GitHub and Cloudflare
  were left alone and the commands handed over (section 13).
- **The Font Awesome token is never printed, logged or committed** (section 11).
- **Gamefound's bot protection is never worked around** (section 6).
- Commits have a short subject in plain words and a body that says why. Commits made by an
  agent end with a `Co-Authored-By` trailer naming it.
- The prose in the code and the page is plain British English: "catalogue", "colour".

## 4. Glossary

| Term                   | Meaning                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| Awaken Realms          | The publisher running the campaign                                                                      |
| Gamefound              | The crowdfunding platform; it prices and charges in euros                                               |
| Pledge manager         | Gamefound's post-campaign stage, where add-on shipping and some taxes are settled                       |
| Game / line            | One of the four games. In code a `GameLine`: `legacy`, `retaliation`, `lockdown`, `og`                  |
| OG                     | The original Nemesis. The switch says "Nemesis OG"; the cart heading says "Nemesis"                     |
| Product                | Anything in Gamefound's catalogue, identified everywhere by its Gamefound product id                    |
| Pledge                 | A product that is a set containing a game's core box. The only products with a published shipping price |
| Add-on                 | A product bought on its own that is not a pledge. No published shipping price                           |
| Set / bundle           | A product made of other products (`isSet`, `setItems`)                                                  |
| Leaf / single item     | A product that is not a set; `leavesOf()` flattens a set to these                                       |
| Part                   | A leaf that cannot be bought alone (`buyable: false`), such as a core box                               |
| Requirement            | One single item a visitor can want, by product id (`REQUIREMENTS`)                                      |
| Core                   | The tag for a game's own contents: what its basic pledge holds                                          |
| Extra / category / tag | One of the fifteen add-on categories, each with a switch (`ExtraTag`)                                   |
| Stand-in               | A leaf that satisfies requirements other than its own id (`PROVIDES`)                                   |
| Edition                | Standard (standees) or Special (miniatures). Applies to Legacy only                                     |
| Finish                 | Plain, Sundrop or Painted miniatures; a surcharge per item that offers it                               |
| Split / Single         | Shipping in two waves, or everything at once in the second                                              |
| Wave                   | A shipping date: the first is Q4 2027, the second Q3 2028                                               |
| Region                 | A row of the campaign's shipping table (`RegionId`)                                                     |
| Destination            | A country or catch-all the visitor delivers to; it maps to a region and a tax                           |
| Preferences            | Everything the visitor has chosen (`Preferences`)                                                       |
| Pick / override        | A single item ticked or unticked against its category's switch (`Preferences.overrides`)                |
| In scope               | Reached by its category's switch (section 7.2)                                                          |
| Passed over            | Listed under a switch but not reached by it; shown with the reason                                      |
| Waiting                | An accessory whose `needs` category has nothing asked for in its game                                   |
| Goes with              | True of an item when a game it is played in is included: its own, or its `alsoWith` (section 7.1)       |
| Offer                  | A buyable product as the solver sees it: a cost and the requirements it provides                        |
| Solution               | The cheapest set of offers covering everything wanted                                                   |
| Quote                  | A solution priced in full: lines, shipping, tax, totals (`Quote`)                                       |
| Cart line              | One product to add to the Gamefound cart (`CartLine`)                                                   |
| Bonus                  | An item in the cart nobody asked for, there because a bundle was cheaper                                |
| Gift                   | The SAM Robot Pack, free to a returning backer                                                          |
| List price             | `Product.price`: before the campaign's bundle discount                                                  |
| Effective price        | `Product.effectivePrice`: what it actually costs                                                        |
| Capture                | `data/gamefound.json`: the catalogue as read from Gamefound                                             |
| Catalogue              | `app/data/catalog.json`: the trimmed capture the site ships with                                        |
| Code / share code      | The preferences as a short string, in `?c=` and in storage (section 7.9)                                |
| HUD                    | The look: framed console panels with cut corners (`hud-*` utilities in `main.css`)                      |
| Cents                  | Euro cents, the unit of every sum. Other currencies are for display only                                |
| MSRP                   | What an item would cost at retail: stated by a campaign, or the nearest figure there is (section 7.11)  |
| Earlier campaign       | One of the three older Gamefound projects: Nemesis (2018), Lockdown (2020), Retaliation (2023)          |
| Listed currency        | One Gamefound's own currency menu offers; the rest are there for a place the campaign ships to          |

## 5. Stack, versions and layout

### Versions that matter

| Thing            | Version   | Note                                                                                 |
| ---------------- | --------- | ------------------------------------------------------------------------------------ |
| Bun              | 1.4.2     | Package manager, script runner and test runner. Pinned in `package.json` and CI      |
| Nuxt             | `~4.5.2`  | **Held back on purpose.** 4.6.0 fails to render on Windows (section 12)              |
| Nuxt UI          | `^4.11.1` | Brings Tailwind 4, Reka UI, Nuxt Icon and Nuxt Fonts                                 |
| TypeScript       | 6.0.3     | Exact                                                                                |
| ESLint           | 10        | Flat config, through `@nuxt/eslint`                                                  |
| Prettier         | 3         | With `prettier-plugin-tailwindcss`                                                   |
| Font Awesome Pro | 7         | Optional dependencies; Free 7 (via `@iconify-json/fa7-solid`) when there is no token |
| sharp            | 0.35      | Only for `catalog:build`, to store the images                                        |

### Commands

| Command                  | What it does                                                               |
| ------------------------ | -------------------------------------------------------------------------- |
| `bun install`            | Installs, generates the icons, runs `nuxt prepare`, sets up the hook       |
| `bun run dev`            | Development server                                                         |
| `bun run build`          | `nuxt generate`: the static site, into `.output/public`                    |
| `bun run preview`        | Serves the built site                                                      |
| `bun run check`          | Lint, format check, type check and tests: everything CI runs but the build |
| `bun run catalog:build`  | Rebuilds the catalogue and images from the capture                         |
| `bun run icons:generate` | Rebuilds the icon collection                                               |

`.claude/launch.json` defines the development server on port 3210 for agent browser previews.

### Where things are

```text
app/
  app.vue, app.config.ts      Shell; Nuxt UI's colours and its internal icons
  assets/css/main.css         Palettes, the four themes, the hud-* utilities
  assets/icons/fa/            GENERATED and git-ignored: the icon SVGs
  components/                 The page, in pieces (section 8)
  composables/                usePreferences, useTheme, useRates, useMoney
  data/catalog.json           GENERATED: the catalogue the site ships with
  domain/                     All the logic. Plain TypeScript, no Vue, no Nuxt
    types.ts                  The vocabulary: GameLine, ExtraTag, Preferences…
    catalog.ts                Typed catalogue; getProduct, leavesOf, buyableProducts
    classification.ts         What every product is: REQUIREMENTS, PROVIDES
    selection.ts              Preferences -> the set of wanted requirement ids
    gift.ts                   The returning backer's gift
    solver.ts                 The search for the cheapest combination
    quote.ts                  A solution -> cart lines, shipping, tax, totals
    shipping.ts               The shipping table, typed out by hand
    destinations.ts           Countries -> shipping region and tax
    preferences.ts            Labels, defaults, and the share code
    currencies.ts             The currencies offered: code, name, symbol, where it goes
    money.ts                  Rates and writing amounts out
    msrp.ts                   Each item's retail price, and where the figure is from
    inflation.ts              Consumer prices in Wrocław's region, by quarter
  pages/index.vue             The one page
data/gamefound.json           The capture, committed
public/                       CNAME, .nojekyll, favicon.svg, images/products/*.webp
scripts/
  capture-gamefound.js        Pasted into the browser console on Gamefound
  build-catalog.ts            Capture -> catalogue and images
  generate-fa-icons.ts        Font Awesome packages -> local SVG collection
tests/                        bun:test; support.ts has the helpers
.github/workflows/            ci.yml, deploy.yml; dependabot.yml beside them
.githooks/pre-commit          Lint and format check
```

The rule that shapes it: **`app/domain/` knows nothing about Vue or Nuxt.** The tests import it
directly, and the components only arrange what it returns.

## 6. Where the data comes from

### Prices, products and bundle contents

Gamefound sits behind Cloudflare bot protection, which answers scripts with a 403. **It is not
to be bypassed**: no scripted requests, no headless tricks, no spoofed headers. The catalogue is
read from a real browser session instead, asking Gamefound's page for exactly what the page
itself asks for.

1. Open the rewards page in a browser.
2. Paste `scripts/capture-gamefound.js` into the console. It reads `window.__INITIAL_STATE__`,
   calls the page's own endpoints (`getRewards`, `getAddons`, then `getProductDetails` and
   `getProductAddToCartModel` per product, one at a time with a 350 ms pause), follows every
   bundle down to its parts, and downloads `gamefound.json`.
3. Move it to `data/gamefound.json` and run `bun run catalog:build`. That validates the file
   (every product URL must start `https://gamefound.com/`), writes `app/data/catalog.json`, and
   stores each product image as a 640 px WebP in `public/images/products/<id>.webp`.
4. Run `bun test`. It fails if Gamefound has a product `classification.ts` does not know.
5. Read `git diff data/gamefound.json`. The capture lists products in order of id, so the diff
   is exactly what Gamefound changed: act on each line of it.

A product is buyable in the catalogue only if Gamefound says so **and** it is listed on the
rewards page.

**An image that already exists is kept**, even when Gamefound has replaced the picture. If the
diff shows a product's `image` has changed, delete its file in `public/images/products/` before
building, or build with `--force` to fetch every image again.

An agent driving a browser pane can run the same capture without the download, by keeping the
result on the page and reading it back. In a pane that is not on screen Gamefound's page never
mounts and `innerText` is empty, but `window.__INITIAL_STATE__` and the page's endpoints still
answer, and an update's text is in the props of its `ProjectUpdateContent` script.

What the 8 October capture changed, against the 6 October one: product 125545 was renamed from
"Secret Add-on" to "Evolved Void Seeders", with a new description and picture, and it swapped
places with the Crew Logs in the listing. No price, bundle or category changed. Evolved
Carnomorphs and the new Scope crew member, from the same update, are free stretch goals inside
the Legacy pledges and are not products.

### Shipping

The campaign publishes its shipping table as an image, so `app/domain/shipping.ts` is typed out
by hand from it. It prices pledges only. The same image says add-on shipping "will be calculated
in pledge manager", so an add-on has no shipping price and none is invented.

The table typed out is the image under the "Estimated shipping" heading of the project page,
whose file is `richtext/c1e9f274-85d9-43af-92ab-071d32f91c44.png`. Gamefound gives a replaced
image a new file name, so a different name there means the table has changed and must be typed
out again. It was still that file on 8 October 2026.

### What is hand-maintained

| File                           | Why it cannot be generated                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `app/domain/classification.ts` | Gamefound does not say what a product _is_, or what equals what                                                           |
| `app/domain/shipping.ts`       | Published as an image                                                                                                     |
| `app/domain/destinations.ts`   | Tax rates and which taxes the campaign collects, from its own notes                                                       |
| `app/domain/gift.ts`           | Announced in campaign Update #6, not in the catalogue                                                                     |
| `app/domain/currencies.ts`     | Symbols and where they go are convention, looked up; which are offered follows from Gamefound's menu and the destinations |
| `app/domain/msrp.ts`           | Read off graphics on the campaign pages, and off the earlier projects' price lists                                        |
| `app/domain/inflation.ts`      | Statistics Poland's quarterly figures, copied in; one line more each quarter                                              |

### The pledges at capture

Prices are euros, list then effective where they differ. The tier is the shipping column.

| Id     | Pledge                           | Price        | Shipping tier                    |
| ------ | -------------------------------- | ------------ | -------------------------------- |
| 125535 | Legacy Core Pledge (Standard)    | 89           | `LEGACY_CORE`                    |
| 120364 | Legacy Core Pledge (Special)     | 129          | `LEGACY_CORE`                    |
| 125557 | Legacy Collector's Pledge        | 212 → 205    | `LEGACY_COLLECTOR`               |
| 125558 | Legacy Salvation Pledge          | 281.50 → 269 | `LEGACY_SALVATION`               |
| 125606 | 4 x Core Pledge (all four games) | 462 → 419    | `FOUR_CORE`                      |
| 125507 | Nemesis OG pledge                | 109          | `CORE`                           |
| 125510 | OG Collector's Pledge            | 201 → 195    | `OG_COLLECTOR_CAPTAIN`           |
| 125511 | OG Captain's Pledge              | 241 → 229    | `OG_COLLECTOR_CAPTAIN`           |
| 125512 | OG Intruder Pledge               | 435 → 399    | `OG_INTRUDER`                    |
| 125514 | Lockdown pledge                  | 115          | `CORE`                           |
| 125519 | Lockdown Collector's Pledge      | 149 → 145    | `LOCKDOWN_COLLECTOR`             |
| 125522 | Lockdown Martian Pledge          | 253 → 235    | `LOCKDOWN_MARTIAN`               |
| 125523 | Retaliation pledge               | 109          | `CORE`                           |
| 125527 | Retaliation Collector's Pledge   | 182 → 175    | `RETALIATION_COLLECTOR_MILITARY` |
| 125528 | Retaliation Military Pledge      | 223 → 209    | `RETALIATION_COLLECTOR_MILITARY` |
| 125529 | Retaliation Veteran Pledge       | 401 → 369    | `RETALIATION_VETERAN`            |

A test holds the invariant: every set containing a core box has a shipping tier, and nothing
else has one.

## 7. How it decides — the rules

### 7.1 Classification

- Every single item is one `Requirement`: an id, the game it belongs to, and a tag (`core` or
  one of the fifteen extras).
- **[reading]** Two switches exist that the brief did not list, because the catalogue needs
  them: **Nemesis Legacy** (on by default; it is the campaign's own game) and **Expansions**
  (tag `gameplay`: the gameplay add-ons, such as Carnomorphs or Zenith of Ruin).
- **[reading]** Legacy's core comes in two editions. Its Special items stand in for the
  Standard ones (`PROVIDES`), because miniatures do everything standees do. That is what lets
  the four-game bundle be the answer for a Standard backer, and it is: it is cheaper.
- The older three games only come with miniatures, so the edition choice is disabled unless
  Legacy is included.
- Other stand-ins: the OG "Stretch Goals" box inside the pledges equals Aftermath and Void
  Seeders, which are sold separately; the Lockdown one equals the Lockdown Stretch Goals sold
  separately; the All Promos Bundle equals the four promo packs; the larger Legacy sleeve set
  covers the smaller.
- **[reading]** Four accessories are for the _add-ons_ of their game (`needs: 'gameplay'`):
  the Legacy and Retaliation "Add-ons" acrylic packs and sleeve sets. Their switch does not
  reach them until that game has an expansion asked for.
- **[reading]** Four add-ons are played in a second game besides the one they are sold with
  (`alsoWith`), by Gamefound's own description. With either game included, their switch takes
  them; with neither, it passes them over and names both. They stay listed in the cart under
  the game they are sold with.

  | Add-on                           | Sold with | Also goes with | Gamefound's words                                             |
  | -------------------------------- | --------- | -------------- | ------------------------------------------------------------- |
  | Evolved Void Seeders (125545)    | Legacy    | Retaliation    | "content for both the Infinity Mode and Nemesis: Retaliation" |
  | Carnomorph Expansion (125204)    | OG        | Lockdown       | "will work with classic Nemesis, Aftermath, and Lockdown"     |
  | Medic Character Pack (125205)    | OG        | Lockdown       | "the original Nemesis crew … or one of the Mars survivors"    |
  | Nemesis Constructs Pack (125233) | OG        | Lockdown       | "for Nemesis and Nemesis Lockdown with all expansions"        |

  So Expansions with only Lockdown included means the Carnomorphs and the Medic, and Terrain
  with only Lockdown means the Constructs Pack — not every game's, as it was before these were
  recorded.

- **Not modelled:** Aftermath and the Void Seeders Expansion also "work with Lockdown", but
  they are part of OG's core, and core items come only with their game. They cannot be chosen
  for a Lockdown-only order.
- Every other item was checked against Gamefound's category and description on 8 October 2026
  and is classified as Gamefound has it.

### 7.2 What the switches ask for

- A game's switch asks for its core, in the edition chosen. Core items cannot be picked or left
  one by one.
- **[owner]** An add-on is never restricted by which games are included.
- **[reading]** So an extras switch reaches (`isInScope`) the items of its category that go
  with the included games — **or the whole category, where none of it does.** Playmats with
  only Legacy on means the Legacy playmat; the Dice Tray, which only exists for OG, is taken
  with any games or none.
- **[owner]** Under each switch, every item of the category is listed for all four games, and
  any one can be ticked or unticked. A pick wins over the switch.
- Items the switch does not reach are shown with the reason ("For Nemesis Lockdown, which is
  not included") and "Tick it to take it anyway." They do not count against the category being
  fully on.
- **[owner]** The switch has three states: `on`, `off`, `some`. It is `off` with nothing
  wanted, `on` when everything it reaches is wanted, otherwise `some`. Pressing it turns the
  category fully on unless it already is, and forgets the picks inside it.
- A pick is stored only when it disagrees with what the switch would do anyway
  (`setItem`). "All" and "None" clear every pick.
- **Reset** returns the order to its defaults but keeps destination and currency, which are
  about the visitor and not the order.
- Quantities are always one of each.

### 7.3 The Classic Crew

**[owner]** "The Classic Crew is not needed if both Nemesis and Nemesis Lockdown are enabled,
but is needed if only one is and any combination of Retaliation and/or Legacy."

As built (`needsClassicCrew`): wanted when Retaliation or Legacy is included **and not both**
OG and Lockdown are.

- **[reading]** That includes the case where neither OG nor Lockdown is included.
- **[reading]** It still sits behind the Alternative Sculpts switch, like any other sculpt.
- With no newer game to play it in, the switch passes it over; it can still be ticked.
- It is a Retaliation product, so the cart lists it under Retaliation.

### 7.4 The returning backer's gift

From campaign Update #6: anyone who has backed Nemesis before gets the SAM Robot Pack free.

- **[owner]** The gift is the ordinary €8 add-on (product 128018). The pledge manager adds it
  by itself; it is not something to put in the cart.
- **[owner]** It ships free with the rest, so it never raises the "Plus shipping for…" warning.
- **[owner]** The switch, "I’ve backed Nemesis before", is the first panel on the page and is
  **off by default**.
- **[reading]** With the switch on, the pack is listed automatically only when Legacy is
  included, since it is played in Legacy. Otherwise it can be ticked under Expansions, and is
  free there too. It can also be unticked.
- In the cart it shows "Free", carries the badge "Returning backer gift", has a gift icon
  where the others have a number, and is not counted among the cart lines to add.
- Its list price still counts in "Reward value", so it shows as an €8 saving.
- With the switch off it is an ordinary Expansions add-on.

### 7.5 The search

Choosing what to buy is weighted set cover. `solver.ts` solves it **exactly**; nothing is
approximated.

- An offer's cost is `[price, items, shipping]`, compared in that order.
  - **Price** of the rewards decides.
  - **Fewer cart items** breaks a tie, so a bundle beats its own parts at the same price.
  - **Published shipping** is only the last tie-break.
- **[reading]** Shipping is deliberately not part of the ranking. Only pledges have a shipping
  price, so counting it would wrongly favour buying everything as separate add-ons. The page
  says so under "Good to know".
- **[owner]** A bundle with unwanted things in it wins whenever it is cheaper. Those things are
  reported as bonuses.
- Method: offers covering one wanted item are singles (the cheapest is kept); the rest are
  bundles. Bundles that another bundle or their own singles beat are dropped. The search then
  takes the bundle overlapping most others, tries the answer with and without it, and splits
  what remains into groups that share nothing — which fall apart into one small problem per
  game.
- It runs in about a millisecond, so the page simply recomputes on every change.
- The tests check it against a brute-force search over random switch and pick combinations.
  Keep that test: it is the proof that the solver is exact.
- Something wanted that nothing sells is set aside (`Quote.unavailable`) and reported, rather
  than failing the whole quote.

### 7.6 The quote

All sums are in euro cents.

| Figure          | Definition                                                                    |
| --------------- | ----------------------------------------------------------------------------- |
| `listTotal`     | The cart lines' list prices. Shown as "Reward value"                          |
| `itemsTotal`    | What the lines cost: effective prices, nothing for a gift. Shown as "Rewards" |
| `savings`       | `listTotal − itemsTotal`: bundle discounts plus any gift. Shown as "Saving"   |
| `finishTotal`   | The miniatures surcharge (below)                                              |
| `shippingTotal` | The pledges' published shipping for the destination and mode                  |
| `taxTotal`      | `round((items + finish + shipping) × rate ÷ 100)`                             |
| `total`         | `items + finish + shipping + tax`. Shown as "Total to pay"                    |

- **Finish** **[reading]**: an addition to the brief. Each wanted item that offers Sundrop or
  Painted adds its own surcharge. It is not charged on bonus items, nor on Special-edition
  items that a Standard backer only received through a bundle.
- **Shipping modes**: only the Legacy pledges and the four-game bundle are cheaper sent at
  once. The older games ship once either way, at one price.
- **[owner] Split shipping is only offered where there is something to split.** By the
  campaign's FAQ and shipping graphic, the first shipment is everything from the older games
  and the Legacy Core Box; the second is the rest of Legacy. An order can be split only if it
  has something in each (`Quote.canSplit`). So it is offered for any Legacy pledge, and for
  an older game with a Legacy add-on; not for the older games alone, which all go in the
  first; nor for Legacy add-ons alone, which all go in the second; nor for an empty order.
- **[reading]** Where it is not offered, the option is shown faded and cannot be chosen, the
  order is priced and described as single shipping, and a line beneath says why.
  `Preferences.shipping` is left as it was — the share code too — so the choice applies again
  as soon as the order has two parts. Nothing costs more or less for it: the pledges that
  cannot be split have one shipping price either way.
- **Waves**: without Legacy, everything is in the first wave. With Legacy and Single, everything
  waits for the second. With Legacy and Split, the older games and the Legacy core box come
  first, and the Legacy stretch goals and add-ons follow. Where the order has Legacy add-ons
  but no Legacy pledge — Evolved Void Seeders for Retaliation, say — the wording leaves the
  core box out: the older games first, the Legacy add-ons second.
- **Unpriced shipping**: add-ons in the cart, gift excepted, are counted and flagged: "Plus
  shipping for N add-ons, which Awaken Realms will only price in the pledge manager."

### 7.7 Tax and destinations

- Campaign prices are net of tax. **[reading]** Tax is charged on rewards, finish and shipping,
  at the destination's standard rate.
- The EU, the UK and Monaco are charged VAT at checkout. The US (sales tax, 0% by default) and
  Canada (GST 5%) are collected later in the pledge manager. Everywhere else the campaign
  collects nothing, and a note warns of import charges.
- **[reading]** The rate can be corrected on the page. A corrected rate is stored only if it
  differs from the destination's own (`taxRate: null` means "follow the destination"), and is
  dropped when the destination changes.
- The default destination is the United Kingdom. On a first visit the destination is guessed
  from the browser's language, with £ for the UK, $ for the US and € otherwise.
- **[owner]** "If currency is set to £ auto turn on VAT and set it to 20%." Choosing £ switches
  tax on at 20%, whatever the destination.

### 7.8 Currency

- **[owner]** Euros are the base, and the default. Every other currency is a way of reading
  the same sum.
- **[owner]** The currencies are all those the campaign supports: the twelve its own menu
  lists beside the euro (AUD, CAD, CHF, DKK, GBP, HKD, NOK, NZD, PLN, SEK, SGD, USD), and the
  currency of every place it ships to that is not among them (CNY, CZK, HUF, IDR, ISK, JPY,
  KRW, MOP, MYR, PHP, RON, THB, TWD, VND). Twenty-seven in all. Each destination records its
  currency, and a test holds the list to exactly those two sources.
- **[owner]** They are chosen from a searchable menu, with EUR, USD and GBP at the top and the
  rest by name. It searches the code, the symbol and the name.
- **[owner]** The symbols were looked up — XE's list of currency symbols, the ISO 4217 tables
  — and checked against what Gamefound itself writes for the ones it lists. **[reading]** The
  site writes them itself rather than leaving it to the browser, which would write a bare "$"
  for five of them and differs between browsers. Each goes where its own users put it:
  "€12.50", "Fr. 12.50", "12.50 zł". Seven currencies that are not spent in decimals are
  written without them.
- **[reading]** The first-visit guess no longer touches the currency: a British visitor used to
  be started in pounds, which is not "EUR the default". It still guesses the destination.
- Rates are central banks' reference rates from Frankfurter, fetched by the browser from
  `https://api.frankfurter.dev/v2/rates?base=EUR&quotes=…` — no key, and still the only
  outside request the page makes. Version 2 is needed: version 1 is the ECB's rates alone,
  which have no TWD, VND or MOP.
- A reply is used only if it has a sound rate for every currency. Otherwise the rates the site
  was built with stay: `catalog:build` fetches them from the same service for the day of the
  capture. They replaced Gamefound's own display rates, which cover only its twelve.
- Figures are written with one fixed locale (`en-GB`) so that the pre-rendered page and the
  browser agree to the character.

### 7.9 Remembering and sharing the choices

- The preferences are encoded as a short code, kept in the address bar (`?c=…`) and in
  `localStorage` (`nemesis-rewards:preferences`). On load a link wins over storage, and storage
  over the first-visit guess.
- With everything at its defaults the address carries no code at all.
- The theme is separate (`nemesis-rewards:theme`) and is not part of a shared link.

The format, for example `13-GB-EUR-` (the defaults) or `af-GB-EUR-` (all four games):

```text
<packed>-<destination>-<currency>-<tax rate or empty>[-<taken ids>-<left ids>]
```

- `packed` is a base-36 number: the on/off choices as bits, times three, plus the finish
  (0 plain, 1 sundrop, 2 painted).
- The bits, lowest first: Special edition; Single shipping; tax included; the four games in
  `LINES` order; the fifteen extras in `EXTRAS` order; returning backer.
- The two optional lists are the picks, as base-36 product ids joined by `.`: first those
  taken against their switch, then those left. They come together or not at all.
- Decoding is strict. Anything that is not a well-formed code is ignored. Picked ids that the
  classification no longer knows as extras are dropped rather than refused, so an old link
  outlives a withdrawn product.

**Do not reorder the bits.** Old links must keep working, so a new flag is appended at the end
of `flags()` and read last; a code written before it existed then reads it as off. Note that
the games' and extras' bits come from the `LINES` and `EXTRAS` arrays. Reordering either one
breaks every existing link, and so does adding to one — even at its end, since the
returning-backer bit sits after them and would move. A new game or extra therefore needs its
bit placed explicitly after the last one, not picked up from the array.

### 7.10 The order of the cart

**[owner]** Legacy, Retaliation, Lockdown, OG, everything else; within each, by category;
within a category, alphabetically.

- A product is listed under the first of those games it holds anything of, so the four-game
  bundle heads the list under Legacy.
- **[reading]** "Everything else" is merchandise bought on its own: hoodies and plushes.
- Within a game: the pledge first, then add-ons in the order of the extras switches, then by
  name.
- The numbers beside the lines count the things to add, so a gift has none.

### 7.11 MSRP

What the cart would cost at retail, item by item (`msrp.ts`), and how far under it the
rewards come. Shipping, finish and tax are in neither figure.

**[owner]** The source is the campaign's project page, where the figures are in images; failing
that, the earlier campaigns, raised by inflation in Wrocław since each was created.

What the pages turned out to hold, read by OCR and then by eye:

| Page                      | Stated as retail MSRP                                        |
| ------------------------- | ------------------------------------------------------------ |
| Nemesis Legacy            | Core Box (Special Edition) €199; Stretch Goals €99           |
| Nemesis Retaliation       | Core Box (Special Edition) $189; Stretch Goals $109          |
| Nemesis, Nemesis Lockdown | Nothing. They are pledge managers: price lists with no story |

That is four figures for some eighty items, so the rest needed a rule. **[reading]**, all of it:

1. **A stated MSRP wins**: this campaign's as it stands, an earlier campaign's raised by
   inflation.
2. **Otherwise the item's price in an earlier campaign, raised by inflation.** The campaign
   taken is the first of the three to have sold the item by itself — so the price is the
   oldest there is, and the inflation the longest. Twenty-five items get the Nemesis or
   Lockdown pledge manager's price in pounds, twenty-seven Retaliation's in dollars.
3. **[owner] Otherwise an assumption: this campaign's own list price plus 50%**
   (`ASSUMED_UPLIFT`). That is everything new with Legacy except its two stated figures, and
   the few older items no earlier campaign sold: the BIG BOXes, the Premium Synthetic Cards,
   Retaliation's promo cards. Twenty-four items in all. Each says in the breakdown that it is
   assumed, and from what price.
4. **Two core boxes were only ever priced together with their stretch goals** (OG's "Core Box
   Pledge", Lockdown's "Lockdown Pledge"). The figure is given to the core box, and the stretch
   goals inside the pledges are counted with it, at nothing. A test holds that such a pair is
   never sold apart.

How an earlier figure is brought up to date:

- Its day is the campaign's opening day (Retaliation: 23 November 2023), or for a pledge
  manager, which has none, the day Gamefound published it (Nemesis: 12 September 2018;
  Lockdown: 25 August 2020).
- It is turned into euros at the ECB reference rate of that day, then multiplied by the rise
  in consumer prices from that quarter to the latest one published.
- **[owner]** The inflation is Wrocław's. **Statistics Poland publishes no price index for a
  city**; the finest it goes is the voivodeship. So it is Dolnośląskie's, of which Wrocław is
  the capital. By it prices have risen 51.1% since Q3 2018, 43.7% since Q3 2020 and 9.0% since
  Q4 2023, to Q2 2026.
- The rise is worked back from the latest quarter a year at a time on the year-on-year
  figures, then a quarter at a time. The published figures are rounded, and fewer of them
  multiplied together means less rounding.

On the page:

- **[owner]** Two more tiles, "MSRP" and "Saving vs MSRP", beside "Reward value" and "Saving".
- **[owner]** The MSRP figure opens a breakdown: every item, its retail price, and where it is
  from. An item raised by inflation says so in the warning colour, with the original figure,
  its date, its campaign, the euros then and the amount now. An assumed one says so in the
  same colour.
- **[owner]** Where any figure in the breakdown is assumed, a note under it says what the 50%
  rests on: the two times a campaign has put a retail MSRP beside its own price. Legacy sets
  €129 against €199, which is 54.3% more; Retaliation set $109 against $189, which is 73.4%
  more. Both set the whole pledge's price against the Core Box alone. The note's range is
  worked out from `STATED_UPLIFTS` in `msrp.ts`, and a test holds that the assumption stays
  under both.
- **[reading]** It opens on hover, on keyboard focus, and on a tap, since a phone has no hover.

The figures are estimates and say so. The older a price, the more of it is inflation: the OG
Core Box is £70 from 2018, which comes to €118.78 now.

## 8. The page

### 8.1 Layout

One page. On a wide screen two columns: the choices on the left, the answer on the right,
which stays in view and scrolls on its own. On a phone the choices come first and a bar fixed
to the bottom carries the total and a link down to the cart.

| Order | Left: choices    | Component         | Holds                                                      |
| ----- | ---------------- | ----------------- | ---------------------------------------------------------- |
| 1     | Returning backer | `ChoicesBacker`   | The switch, the pack's picture, the explanation            |
| 2     | Games            | `ChoicesGames`    | Four game switches; Standard or Special; miniatures finish |
| 3     | Extras           | `ChoicesExtras`   | Fifteen `ExtraChoice` cards; "All" and "None"              |
| 4     | Delivery & tax   | `ChoicesDelivery` | Deliver to; Split or Single; Include Tax / VAT and rate    |

| Order | Right: answer              | Component     | Holds                                                                                |
| ----- | -------------------------- | ------------- | ------------------------------------------------------------------------------------ |
| 1     | Your best order            | `QuoteTotals` | Total, breakdown, four tiles (reward value, saving, MSRP, saving vs MSRP), rate note |
| 2     | Add to your Gamefound cart | `QuoteCart`   | `CartLineCard`s in sections per game                                                 |
| 3     | Good to know               | `QuoteNotes`  | Waves, bonuses, unpriced shipping, the method                                        |

The header (`AppHeader`) has the Style and Currency choices and Reset. The footer says when the
prices were read, that the tool is unofficial, and links to the source.

### 8.2 Decisions

- **[owner]** Labels in Games and Extras do not say "Include". "Include Tax / VAT" keeps it.
- Labels as shipped — games: Nemesis Legacy, Nemesis Retaliation, Nemesis Lockdown, Nemesis OG.
  Extras, in order: Expansions, Acrylic Packs, Playmat(s), Artbook(s), Synthetic Cards, Sleeves,
  Terrain Pack(s), Untold Stories, Promo Cards, BIG BOX(es), Alternative Sculpts, Cats, Hoodies,
  Dice Tray, Plushes.
- **[owner]** Extras cards are all the same height, with the icon, the arrow and the switch
  aligned along the top. Every label fits one line at normal widths; a container query keeps
  room for a second line only in a card too narrow for the longest label.
- The three-state switch (`TriSwitch`) is a `role="checkbox"` button with `aria-checked` of
  `true`, `false` or `mixed`, since a switch has no mixed state to announce.
- Either/or choices (`SegmentedChoice`) are a `radiogroup`.
- **[owner]** Product images are stored locally and served by the site; nothing is loaded from
  Gamefound. Each cart line links out to its Gamefound page.
- Every grid states `grid-cols-1` and its children `min-w-0`; without both, long product names
  push the page sideways on a phone.

### 8.3 Wording the owner dictated

Use these exactly.

- The returning-backer paragraph: "**Free gift: the SAM Robot Pack.** Returning Nemesis backers
  get it for free: the pledge manager will add it to your pledge automatically, and it ships
  with the rest at no extra cost."
- The cart badge: "Returning backer gift".
- The switch: "I’ve backed Nemesis before" (with a typographic apostrophe, as in the code).

One sentence is the builder's, not the owner's: with the switch off, the paragraph ends
"Otherwise it is an add-on at €8.00, under Expansions." The owner was asked whether to keep it
and has not yet said (section 13).

### 8.4 Themes

**[owner]** Four styles, one per game, chosen in the header.

| Theme       | Palette  | Taken from                                               | Key colour            |
| ----------- | -------- | -------------------------------------------------------- | --------------------- |
| Nemesis     | `signal` | nemesisgames.eu, the Nemesis half                        | `#398273` at step 600 |
| Lockdown    | `breach` | nemesisgames.eu, the Lockdown half                       | `#990500` at step 700 |
| Retaliation | `frost`  | Its box art on Gamefound: pale blue mist                 | `#a0d3ea` at step 300 |
| Legacy      | `ember`  | Its box art on Gamefound: fire and rust under a grey sky | `#df8a54` at step 400 |

- The neutral is `void`, from the site's lavender-grey text (`#74758a`).
- There is no light mode; the Nemesis site has none. `ui.colorMode` is off and `<html>` always
  carries `class="dark"`.
- A theme is the `data-theme` attribute on `<html>`. No attribute means Nemesis. The stylesheet
  overrides Nuxt UI's `--ui-color-primary-*` variables for the other three, so no component
  knows there are themes.
- An inline script in the head restores the last theme before the first paint.
- The site's own typefaces are not redistributable. Jura and Josefin Sans stand in, downloaded
  at build time and served from the site.

### 8.5 Icons

- Components use semantic names — `i-fa-legacy`, `i-fa-dicetray`, `i-fa-cart`. The mapping to
  Font Awesome icons is the `ICONS` table in `scripts/generate-fa-icons.ts`.
- That script writes each of the 65 icons to `app/assets/icons/fa/` as an SVG. Nuxt Icon loads the folder
  as a local collection (`provider: 'none'`) and bundles what the page uses, because there is
  no server to fetch icons from.
- Nuxt UI's own internal icons are pointed at the same collection in `app.config.ts`.
- To add one: add a line to `ICONS` with the Pro export and a Free fallback, then run
  `bun run icons:generate`. The script fails if a named Pro icon does not exist, so a typo is
  not hidden by its fallback.

## 9. Strictness and quality gates

**[owner]** TypeScript, ESLint and Prettier at their strictest. In practice:

- **TypeScript**: `strict`, plus every check `strict` leaves out — `exactOptionalPropertyTypes`,
  `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`,
  `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`,
  `noUncheckedSideEffectImports`, and no unreachable code or unused labels. Nuxt writes four
  tsconfigs (app, shared, node, server) and **each must be given the options separately** in
  `nuxt.config.ts`. Scripts and tests are checked under the node config.
- **ESLint**: typescript-eslint's `strict-type-checked` and `stylistic-type-checked`, Vue's
  `recommended`, and a long list of further rules in `eslint.config.mjs`. Run with
  `--max-warnings 0`. `no-console` is relaxed for `scripts/` only.
- **Prettier**: no semicolons, single quotes, 100 columns, one attribute per line, strict HTML
  whitespace, Tailwind class sorting. It also checks Markdown, this file included.
- **Suppressions are rare and explained.** There is one `eslint-disable` in the project, with
  its reason beside it. Prefer a type guard to a type assertion; `no-unsafe-type-assertion` is on.
- **Pre-commit hook** (`.githooks/pre-commit`): lint and format check. Installed by
  `bun install`.
- **CI** (`ci.yml`): lint, format check, type check, tests, and a full static build, on every
  push and pull request to `main`.

Patterns the strict settings force, worth knowing before fighting them:

- An optional prop cannot be passed `undefined`. Build an object and `v-bind` it instead of
  writing `:prop="condition ? value : undefined"`.
- Index access yields `T | undefined`: destructure and check, or use `.find()` / `.at()`.
- Conditions must be real booleans: `x !== null`, `count > 0`, never a bare string or number.
- Sorts need a comparator; functions need explicit return types; functions are defined before
  they are used, which is why `solveGroup` is nested inside `solve`.

## 10. Build and deployment

- `nuxt generate` pre-renders `/` and anything it links to. A page that fails to render fails
  the build.
- The page is rendered at build time **with the default preferences** and hydrated in the
  browser. Everything personal is applied after hydration (section 12).
- `deploy.yml` runs on every push to `main`: install with a frozen lockfile, test, build,
  publish `.output/public` to GitHub Pages.
- Pages is set to build from **GitHub Actions**, with the custom domain `nemesis.slydave.com`.
  `public/CNAME` holds the domain and `public/.nojekyll` stops Pages treating the output as
  Jekyll. DNS is a `CNAME` to `slydave.github.io`, through Cloudflare.
- The site is served from the domain's root, so `NUXT_APP_BASE_URL` is `/`. Image and favicon
  paths are built from `app.baseURL`, so it could move to a sub-path without code changes.
- Actions are pinned to commit hashes, with the version in a comment. Dependabot proposes
  updates weekly.

## 11. Security

The repository and the site are both public. The rules:

- **One secret exists: the Font Awesome Pro package token.** Locally it is in `.env`, which is
  git-ignored. In GitHub Actions it is the repository secret `FONTAWESOME_PACKAGE_TOKEN`.
  `.npmrc` refers to it by name only. It is used at install time and never reaches the built
  site.
- **Never print the token's value**, in a terminal, a log, a commit or a reply. Before
  committing, check the staged diff does not contain it.
- **Never commit `.env`, or the generated icons** in `app/assets/icons/fa/`. The Pro icons are
  licensed, not open, and the repository is public.
- **The project must build without the token.** The Pro packages are optional dependencies,
  and without them the icons come from Font Awesome Free. A fork's pull request gets no
  secrets and still passes CI. Keep it that way.
- **No server, accounts, cookies or analytics.** Choices live in the visitor's browser.
- **Nothing a visitor supplies is written into the page as HTML.** The address-bar code and
  the stored values are decoded against fixed lists. `v-html` is forbidden by lint.
- **Content Security Policy**: GitHub Pages cannot send custom headers, so each built page
  carries the policy as a `<meta>` tag, added in a Nitro `prerender:generate` hook. It allows
  the site's own files, the exchange-rate origin, and the inline scripts present at build time,
  each by its SHA-256 hash. A new outside origin must be added to the policy in
  `nuxt.config.ts` or the browser will block it. The dev server has no policy, so test
  anything that touches it with `bun run build` and `bun run preview`.
- **Workflows** use least-privilege `permissions` and `persist-credentials: false`.
- A sweep of the whole history, the lockfile, the data and the live site found no secret.

## 12. Things that broke, and must not be undone

Each of these cost time once. The fix is in the code; this is why it is there.

| Symptom                                                                 | Cause                                                                                              | Fix, and where                                                                                                  |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Nothing renders: "Either manifest or precomputed data must be provided" | Nuxt 4.6.0 on Windows, in both `dev` and `build`                                                   | Nuxt is held at `~4.5.2`. Upgrade deliberately and test both                                                    |
| The theme snaps back to Nemesis after loading                           | Anything in `htmlAttrs` is re-applied when the page hydrates                                       | `data-theme` is **not** in `htmlAttrs`; the inline head script and `useTheme` set it                            |
| Menus and tooltips open underneath the page                             | The app was lifted above the background grid, and so above Nuxt UI's overlays on `<body>`          | The grid is `body::before` at `z-index: -1`; `#__nuxt` has no stacking context                                  |
| A shared `?c=` link is ignored on the built site                        | While hydrating a pre-rendered page, Nuxt strips the query to match the HTML                       | The code is read at module load (`linkedAtLoad`), applied in `onNuxtReady`, written with `history.replaceState` |
| Hydration mismatches in dates or prices                                 | The build machine's locale and time zone differ from the visitor's                                 | One fixed locale (`en-GB`) and UTC for anything rendered at build time                                          |
| Lint errors in `scripts/` about index signatures                        | The strict options were only on the app's tsconfig                                                 | They are applied to all four (section 9)                                                                        |
| Lint fails to start, or reports nonsense                                | `.nuxt/` is missing or stale; `eslint.config.mjs` imports from it                                  | Run `bunx nuxt prepare`                                                                                         |
| `bun install` fails without the token                                   | Every `@fortawesome/*` package goes through the token's registry, including the Free ones          | The Free fallback is `@iconify-json/fa7-solid`; `fontawesome-common-types` is optional too                      |
| Pro packages are not picked up after adding the token                   | Bun kept an earlier failed resolution                                                              | Delete `bun.lock`, reinstall, and commit the new lockfile                                                       |
| A phone scrolls sideways                                                | Grid children default to `min-width: auto`                                                         | `grid-cols-1` on grids and `min-w-0` on children                                                                |
| Gamefound returns 403 to scripts                                        | Cloudflare bot protection                                                                          | Capture from a real browser (section 6). Do not work around it                                                  |
| A base path such as `/x/` turns into a Windows path                     | Git Bash rewrites arguments that look like paths                                                   | Prefix the command with `MSYS_NO_PATHCONV=1`                                                                    |
| The preview shows odd defaults                                          | An earlier session's choices are still in `localStorage`                                           | Clear `nemesis-rewards:preferences` before judging the defaults                                                 |
| A renamed product keeps its old picture                                 | `catalog:build` only fetches images that are missing                                               | Delete the product's file in `public/images/products/`, or build with `--force` (section 6)                     |
| The regional price index cannot be fetched                              | Statistics Poland's Local Data Bank API (bdl.stat.gov.pl) refuses anonymous list requests on quota | Its Knowledge Databases API (api-dbw.stat.gov.pl) has the same series and answers                               |
| The MSRP is not in the page's data                                      | The campaign states it only inside story images                                                    | Fetch the images from the image CDN, find the text with OCR, then read the figures by eye                       |
| A new capture differs from the last on every line                       | The products were in the order Gamefound listed them, which shifts                                 | The capture script sorts them by id                                                                             |

Two facts about the data that are easy to assume wrong:

- "Everything for OG except the hoodie" is **not** the Intruder Pledge. The Captain's Pledge
  plus single add-ons is €462, against €468.
- For all four games with every extra on, the answer is the four biggest per-game pledges, not
  the four-game bundle.

## 13. Open, and the owner's to decide

Nothing requested is outstanding. These were raised and left with the owner:

1. **The "Otherwise it is an add-on at…" sentence** in the returning-backer panel (section 8.3):
   keep or remove.
2. **HTTPS is not enforced.** Plain `http://nemesis.slydave.com` answers instead of
   redirecting. In Cloudflare, turn on "Always Use HTTPS" and consider HSTS and the usual
   security headers; a Cloudflare header could also carry the Content Security Policy.
3. **Dependabot alerts are off.** To turn them on:
   `gh api -X PUT repos/SlyDave/nemesis-rewards-calculator/vulnerability-alerts`
4. **Private vulnerability reporting is off**, and `SECURITY.md` links to it. To turn it on:
   `gh api -X PUT repos/SlyDave/nemesis-rewards-calculator/private-vulnerability-reporting`
5. **Advisories in development tools** reported by `bun audit`. None of that code is in the
   built site.
6. **A branch ruleset** on `main` is optional. Only the owner can push to the repository as it
   is; strangers can only open pull requests.
7. **The author's name and email are public** in the commit history, as with any public
   repository.
8. **The prices go stale.** They are a snapshot from 8 October 2026, and the campaign runs to
   27 October. Capture again (section 6) whenever Gamefound changes something. The pledge
   manager will later publish add-on shipping, which the site does not have.
9. **The MSRP rule** (section 7.11) is largely a reading. The points most worth a second
   look: taking the oldest campaign's price rather than the latest; the region standing in
   for the city; and the range quoted beside the assumed uplift.
10. **Inflation goes stale too.** It runs to Q2 2026. Statistics Poland publishes Q3 in late
    October 2026: add the line to `inflation.ts`.

## 14. Reference results

From the catalogue as captured, delivering to the UK with Split shipping and VAT at 20% unless
stated. Use them to check that a rebuild or a refactor still agrees. They change when the
catalogue is captured again.

| Choices                             | Code            | Cart                                                           | Rewards | Shipping | Total   |
| ----------------------------------- | --------------- | -------------------------------------------------------------- | ------- | -------- | ------- |
| Defaults: Legacy, Special           | `13-GB-EUR-`    | Legacy Core Pledge (Special)                                   | 129.00  | 39.00    | 201.60  |
| Legacy, Standard                    | `10-GB-EUR-`    | Legacy Core Pledge (Standard)                                  | 89.00   | 39.00    | 153.60  |
| Defaults, Single shipping           | `19-GB-EUR-`    | Legacy Core Pledge (Special)                                   | 129.00  | 27.00    | 187.20  |
| Defaults, Painted                   | `15-GB-EUR-`    | Legacy Core Pledge (Special), plus 124.00 finish               | 129.00  | 39.00    | 350.40  |
| All four games, either edition      | `af-GB-EUR-`    | 4 x Core Pledge                                                | 419.00  | 97.00    | 619.20  |
| Legacy and the Dice Tray            | `1vfaf-GB-EUR-` | Legacy Core Pledge, Nemesis Dice Tray                          | 139.00  | 39.00    | 213.60  |
| No game, the Dice Tray              | `1vf9r-GB-EUR-` | Nemesis Dice Tray                                              | 10.00   | 0.00     | 12.00   |
| Legacy, returning backer            | `7hp2f-GB-EUR-` | Legacy Core Pledge, SAM (free)                                 | 129.00  | 39.00    | 201.60  |
| Legacy and OG, Alternative Sculpts  | `8fl3-GB-EUR-`  | Two core pledges, Classic Crew, Alien Kings                    | 282.00  | 63.00    | 414.00  |
| All four games, Alternative Sculpts | `8fp3-GB-EUR-`  | 4 x Core Pledge and four sculpt add-ons; no Classic Crew       | 493.00  | 97.00    | 708.00  |
| All four games, every extra         | `7hp13-GB-EUR-` | Salvation, Veteran, Martian, Intruder and 11 add-ons           | 1599.00 | 169.00   | 2121.60 |
| Retaliation, Expansions             | `cf-GB-EUR-`    | Retaliation pledge, its three expansions, Evolved Void Seeders | 212.00  | 24.00    | 283.20  |
| Lockdown, Expansions                | `dr-GB-EUR-`    | Lockdown pledge, Carnomorph Expansion, Medic                   | 161.00  | 24.00    | 222.00  |
| Lockdown, Terrain Pack(s)           | `j1r-GB-EUR-`   | Lockdown pledge, Nemesis Constructs Pack                       | 145.00  | 24.00    | 202.80  |

## 15. Working on it

For any change:

1. Change the rule in `app/domain/` and its test in `tests/` together. Put logic in the domain,
   not in a component.
2. `bun run check`.
3. Look at it in the browser at phone and desktop widths, in more than one theme.
4. If it touches loading, storage, the address bar or the security policy, check the built site
   too: `bun run build`, then `bun run preview`.
5. Commit. **Do not push until the owner says to** (section 3).

For common jobs:

| Job                           | Touch                                                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Prices changed on Gamefound   | Capture, `bun run catalog:build`, `bun test` (section 6)                                                                             |
| Gamefound added a product     | Classify it in `classification.ts`; add a `PROVIDES` entry if it equals something else, `alsoWith` if it is played in a second game  |
| A new pledge                  | Also give it a tier in `shipping.ts`                                                                                                 |
| The shipping table changed    | `shipping.ts`, by hand from the campaign's image                                                                                     |
| A new extras switch           | `ExtraTag`, `EXTRAS`, `DEFAULT_PREFERENCES`, an icon — and its bit in the share code, placed by hand (section 7.9)                   |
| A new destination or tax rate | `destinations.ts`                                                                                                                    |
| A new theme                   | A palette and a `:root[data-theme]` block in `main.css`; `ThemeName`; `useTheme`; `AppHeader`; the inline script in `nuxt.config.ts` |
| A new icon                    | `ICONS` in `generate-fa-icons.ts`, then `bun run icons:generate`                                                                     |
| A new currency                | `CurrencyCode`, an entry in `currencies.ts`, then `bun run catalog:build` for its starting rate                                      |
| A new quarter of inflation    | One more line at the end of the table in `inflation.ts`, from dbw.stat.gov.pl (variable 305, Dolnośląskie)                           |
| An MSRP for a product         | An entry in `msrp.ts`: `stated`, or `price`/`msrp` with the earlier campaign it is from                                              |
| A new outside request         | Add its origin to the security policy in `nuxt.config.ts`                                                                            |

To rebuild the project from nothing, the order that worked was: scaffold Nuxt with Nuxt UI and
the strict tooling; capture the catalogue; classify it; write the solver with its brute-force
test; build the quote; then the page, the themes, persistence, and deployment. Sections 5 to 10
have the decisions for each step, and section 12 the traps.
