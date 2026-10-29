# Security

## Reporting a problem

Please report anything security-related privately, through
[GitHub's private vulnerability reporting](https://github.com/SlyDave/nemesis-rewards-calculator/security/advisories/new),
rather than in a public issue.

## What there is to attack

Very little, by design:

- The site is static files. There is no server, no database, no accounts and no cookies: a
  visitor's choices stay in their own browser (`localStorage`) and in the address bar.
- Visits are counted with [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/).
  Its beacon sets no cookies, keeps nothing in the browser and does not fingerprint visitors,
  and Cloudflare does not log query strings, where the address bar keeps the choices. The site
  collects nothing else.
- Beyond its own files, the page makes two kinds of request: it loads that beacon from
  Cloudflare, which reports the visit to Cloudflare, and it fetches exchange rates from
  [Frankfurter](https://frankfurter.dev). The rates are checked before they are used, and a bad
  or missing reply falls back to the rates the site was built with.
- Everything read from the address bar or from storage is decoded against a fixed list of
  known values; anything else is ignored. Nothing a visitor supplies is ever written into the
  page as HTML.
- Each built page carries a Content Security Policy that allows this site's own files, those
  two services, and exactly the inline scripts it was built with (`nuxt.config.ts`).

## Secrets

The one secret is the Font Awesome Pro package token, used only to download the icon packages
at install time. It is never in the repository, the lockfile or the built site:

- locally it lives in `.env`, which is git-ignored;
- in GitHub Actions it is the repository secret `FONTAWESOME_PACKAGE_TOKEN`, which pull
  requests from forks are not given;
- `.npmrc` refers to it by name only.

The Pro icon files themselves are generated at install time and never committed.

## Supply chain

- Dependencies are locked (`bun.lock`) and installed with `--frozen-lockfile` in CI.
- GitHub Actions are pinned to commit hashes, with least-privilege `permissions` per job.
- `bun audit` reports known advisories. Those open at the time of writing are in development
  and build tools only (the dev server and its tooling); none of that code is in the site.
