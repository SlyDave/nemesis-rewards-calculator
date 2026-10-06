# Nemesis Rewards Calculator

Works out the cheapest way to back
[Nemesis Legacy on Gamefound](https://gamefound.com/en/projects/awaken-realms/nemesis-legacy/rewards)
for exactly what you want.

Switch on the games and extras you are after and it finds the best combination of pledges,
bundles and single add-ons — including a bigger bundle with things you did not ask for, when
that is still the cheaper way to get what you did. It then prices the order with shipping, VAT
and your currency, and lists what to put in your Gamefound cart, with pictures.

An unofficial fan-made tool. Not affiliated with, or endorsed by, Awaken Realms or Gamefound.

## How it works

It is a static site: every page is rendered to HTML at build time, and all the working-out
happens in the browser. There is no server.

| Part                                       | Where                                                    |
| ------------------------------------------ | -------------------------------------------------------- |
| The catalogue, as captured                 | `data/gamefound.json`                                    |
| The catalogue, as shipped, and images      | `app/data/catalog.json`, `public/images/products/`       |
| What each product _is_ (which switch)      | `app/domain/classification.ts`                           |
| What the switches and single picks ask for | `app/domain/selection.ts`                                |
| The shipping table                         | `app/domain/shipping.ts`                                 |
| Destinations and tax rates                 | `app/domain/destinations.ts`                             |
| The search for the best combination        | `app/domain/solver.ts`                                   |
| Turning a combination into a full quote    | `app/domain/quote.ts`                                    |
| The page                                   | `app/pages/index.vue`, `app/components/`                 |
| The four themes, one per game              | `app/assets/css/main.css`, `app/composables/useTheme.ts` |

### The search

Choosing what to buy is a weighted set-cover problem: each switch stands for some items, each
product on sale provides some items at a price, and the cheapest set of products providing
everything is wanted. `solver.ts` solves it exactly. It decides one bundle at a time (the best
answer either includes it or does not), and after each decision splits what is left into
groups of bundles that no longer overlap, which fall apart into one small problem per game. It
takes about a millisecond, so it simply runs again on every change.

The tests check it against a brute-force search over random combinations of the switches.

Combinations are ranked on the price of the rewards. Shipping is added afterwards and is not
part of the ranking, because the campaign only publishes shipping for pledges — add-on
shipping “will be calculated in pledge manager” — so counting it would wrongly favour buying
everything separately.

### What the numbers are

- **Prices and bundle contents** are Gamefound's, captured on the date shown in the site's
  footer. They change while the campaign runs; see below for refreshing them.
- **Shipping** is the campaign's shipping table, typed out from the image it is published as.
- **VAT** is charged on rewards and shipping at the destination's standard rate, for the
  places the campaign collects it. The rate can be corrected on the page.
- **Currency**: everything is in euros, as Gamefound charges it. Dollars and pounds use the
  European Central Bank's daily reference rate, fetched by the browser from
  [Frankfurter](https://frankfurter.dev), falling back to the rate captured with the catalogue.

## Security

There is no server, no accounts and nothing collected; the one secret, the Font Awesome token,
never reaches the repository or the built site. [SECURITY.md](SECURITY.md) has the detail and
how to report a problem.

## Development

Needs [Bun](https://bun.sh).

```bash
bun install
```

```bash
bun run dev
```

| Command                  | What it does                                           |
| ------------------------ | ------------------------------------------------------ |
| `bun run dev`            | Development server                                     |
| `bun run build`          | The static site, into `.output/public`                 |
| `bun run preview`        | Serves the built site                                  |
| `bun run check`          | Lint, formatting, types and tests — what CI runs       |
| `bun run catalog:build`  | Rebuilds the shipped catalogue and images from capture |
| `bun run icons:generate` | Rebuilds the icon collection                           |

TypeScript, ESLint and Prettier are all set as strict as they go (`nuxt.config.ts`,
`eslint.config.mjs`, `.prettierrc.json`), and CI fails on a single warning.

Nuxt is held at 4.5 (`~4.5.2` in `package.json`). 4.6.0 failed to render any page on Windows
when this was set up — “Either manifest or precomputed data must be provided”, in both
`dev` and `build` — so try a newer version deliberately rather than by accident.

### Font Awesome Pro

The icons are Font Awesome Pro, which needs a licence token to install. Copy `.env.example` to
`.env` and put your
[package token](https://fontawesome.com/account/general#tokens) in it, then run `bun install`.

Without a token the Pro packages are skipped and the icons are drawn from Font Awesome Free
instead, so the project still installs, builds and passes CI — it just looks a little
heavier. The generated icon files are never committed: this repository is public, and the Pro
icons are licensed, not open.

For GitHub Actions, add the token as a repository secret named `FONTAWESOME_PACKAGE_TOKEN`.

## Refreshing the prices

Gamefound sits behind bot protection that turns scripts away, so the catalogue is captured
from a real browser session rather than scraped from the command line:

1. Open the [rewards page](https://gamefound.com/en/projects/awaken-realms/nemesis-legacy/rewards).
2. Paste `scripts/capture-gamefound.js` into the browser console. It downloads `gamefound.json`.
3. Move that to `data/gamefound.json`, then:

```bash
bun run catalog:build
```

```bash
bun test
```

The tests fail if Gamefound has added a product that `app/domain/classification.ts` does not
know about yet — classify it there. If the shipping table on the project page has changed,
update `app/domain/shipping.ts` to match.

## Deployment

The site is at [nemesis.slydave.com](https://nemesis.slydave.com/).

Pushing to `main` builds it and publishes it to GitHub Pages
(`.github/workflows/deploy.yml`). The repository's Pages source is set to **GitHub Actions**,
with `nemesis.slydave.com` as its custom domain; the domain's DNS has a `CNAME` record
pointing at `slydave.github.io`.
