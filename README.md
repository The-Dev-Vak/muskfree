# MUSK-FREE CERTIFIED™

*Is there Elon in your index fund?* A static, zero-dependency site that checks any
ETF / mutual fund / stock for Elon Musk exposure (Tesla weight + disclosed SpaceX /
xAI / Neuralink / Boring Co. stakes) and issues an official-looking verdict stamp.

## Launch checklist

1. Pick a domain, then bake it into the share assets and SEO files:
   `SITE_URL=https://yourdomain.com node scripts/build-sharepages.mjs && bash scripts/build-og-pngs.sh`
2. Push this repo to GitHub (private or public), set the `SITE_URL` repository
   variable, and confirm the "Nightly exposure refresh" Action is enabled —
   that's the self-updating data + SPCX Watch feed.
3. Connect the repo to Netlify or Vercel (auto-deploy on push). Done: nightly
   Action commits → host redeploys → data stays fresh with zero maintenance.
4. Tweet it (drafts below). The share links (`/f/TICKER.html`) unfurl with each
   fund's own stamp card.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

No build step. Four files do everything:

| File | Purpose |
|---|---|
| `index.html` | Shell, meta/OG tags, fonts |
| `styles.css` | The whole "federal document" design system |
| `data.js` | The dataset — ~120 funds/stocks with exposure %s |
| `app.js` | Hash router, search/autocomplete, certificate renderer |
| `og.png` / `og.svg` | Twitter/OG share card (SVG is the editable source) |

## Deploy (pick one, all free)

- **Netlify**: drag the folder into app.netlify.com/drop. Done.
- **Vercel**: `npx vercel --prod` in this folder.
- **GitHub Pages**: push to a repo, enable Pages on main.
- **Cloudflare Pages**: wrangler or dashboard upload.

Static files = it will not fall over when the tweet takes off.

After deploying, update the absolute OG image URL if needed — some crawlers want a
full URL in `og:image` (`https://yourdomain.com/og.png`).

## Domain ideas

`muskfree.money` · `doesithavemusk.com` · `elonfree.fund` · `muskfreecertified.com`
· `ismyfundmuskfree.com`

## Updating the data

Everything lives in `data.js`. Each entry:

```js
{ t:"SPY", n:"SPDR S&P 500 ETF Trust", type:"ETF", cat:"S&P 500 index",
  tsla:1.7,            // % of assets in Tesla
  spacex:0,            // % in SPCX (SpaceX+xAI+X, public since 6/12/26)
  note:"…",            // inspector's remarks (optional, jokes welcome)
  alts:["DIA","RSP"],  // musk-free alternatives shown on the cert
  aliases:["sp500"] }  // extra search terms
```

Update `ASOF` at the top when you refresh numbers. Sources: fund issuers' official
holdings pages (search "`TICKER` full holdings"). Index weights drift daily — being
roughly right and clearly labeled beats being precisely stale.

Verdict tiers (in `app.js → verdict()`): 0% MUSK-FREE · <0.5% TRACE MUSK · <5%
CONTAINS MUSK · <15% HIGH MUSK CONTENT · <60% EXTREMELY MUSKY · ≤100% PURE UNCUT
MUSK · >100% LEVERAGED MUSK · negative = ANTI-MUSK.

## Launch tweet drafts

> SpaceX joined the Nasdaq-100 this week, which means QQQ holders now own it
> whether they wanted to or not. I built a site that checks any ticker for
> Musk exposure — Tesla AND SpaceX. Type a ticker, get a stamp. [link]

> Your S&P 500 fund is 1.7% Elon. Your total-market fund quietly bought SPCX
> in June. Your tech fund (VGT)? Somehow ZERO Elon — because the GICS
> committee says Tesla isn't a tech company. Check any ticker: [link]

> Baron Partners: 53% Musk. ARKK: ~18% Musk. QQQ: 4.3%. The Dow: 0% Musk
> since 1896. I made a website that stamps your fund: [link]

> Fun fact: the S&P 500 is the last major index with ZERO SpaceX — the GAAP
> earnings rule is doing more Musk-screening than any ESG fund. Check your
> ticker: [link]

## Regenerating the OG card (macOS)

```bash
qlmanage -t -s 1200 -o . og.svg && sips -c 630 1200 og.svg.png --out og.png && rm og.svg.png
```

## Architecture: two data layers

1. **Verified registry** (`data.js`, ~250 funds/stocks) — hand-checked exposure
   figures; the stamp's default basis.
2. **Live layer** (`live.js`) — the browser queries `api.stockanalysis.com`
   (public, CORS-open, keyless) for real-time quotes, AUM, expense ratios, and
   each ETF's top-25 holdings, then scans holdings for Tesla/SpaceX by ticker
   AND name (catches "SPV Exposure to SpaceX LP"-style rows). If the live scan
   reads higher than the registry, the stamp is re-issued as LIVE-ADJUSTED.
   Unknown tickers get a fully live provisional certificate (classification via
   the search endpoint). Everything degrades gracefully to registry-only if the
   API is unreachable. Results cache in sessionStorage for 10 min.

Known limits (also stated on-site): holdings feed is top-25 only (a floor, not
a ceiling), mutual funds have no machine-readable live holdings, and SPCX index
adds are tracked manually in `SPCX_TRACKER`.

## Build & pipeline scripts

- `node scripts/build-sharepages.mjs` — regenerates `f/*.html` share stubs (one
  per registry ticker, with fund-specific OG meta) and OG card SVGs. Set
  `SITE_URL=https://yourdomain.com` before running for correct absolute OG URLs.
- `bash scripts/build-og-pngs.sh` — rasterizes the OG SVGs to `og/*.png`
  (qlmanage on macOS, rsvg-convert on Linux).
- `node scripts/expand-registry.mjs` — auto-registration: pulls the full US ETF
  universe with AUM, takes the top N (default 700) not already curated, scans
  each one's holdings, and writes `data.gen.js`. The site merges these at boot
  (marked "auto-registered"), taking searchable coverage to ~1,000 funds.
- `node scripts/expand-intl.mjs` — auto-registration for Canada + Europe: reads
  the iShares CA and UCITS product catalogs (ticker, name, AUM), scans every
  fund's complete daily holdings file (look-through for wraps), writes
  `data.gen.intl.js`. Issuer-grade data for ~1,000 international tickers.
- `node scripts/scan-issuers.mjs` — issuer verification for the *curated* CA/EU
  funds → `data.intl.json` overlay.
- `node scripts/refresh-data.mjs` — the nightly pipeline: re-scans every ETF's
  visible holdings (curated + auto-registered), writes `data.live.json` (overlay
  the site loads at boot), `changelog.json` (diffed exposure events), and
  `feed.xml` (RSS "SPCX Watch").
- `.github/workflows/refresh.yml` — nightly GitHub Action (09:23 UTC). Runs the
  full pipeline above and commits the results (set the `SITE_URL` repo variable).
  Pushing this repo to GitHub + any auto-deploying host (GitHub Pages, Netlify,
  Vercel) makes the whole site self-updating: Action commits fresh data → host
  redeploys. NOTE: pushing this file requires git credentials with the `workflow`
  OAuth scope (a normal `gh auth login` or SSH key has it).
- `.nojekyll` — tells GitHub Pages to serve files raw instead of running Jekyll.

Overlay semantics: a scan *detection* is affirmative evidence and overrides the
registry number (up or down); a scan *miss* never zeroes a registry number
(top-25 cutoff means absence isn't proof). Funds show a "✓ verified by daily
scan" chip when covered.

## Features

- **Single-fund check** (`#/f/TICKER`) — certificate with stamp, Musk Facts
  label, live readout panel (price/AUM/ER + top-25 holdings scan, LIVE-ADJUSTED
  re-stamping), alternatives, share-on-X (unfurls the fund's own OG card via
  `f/TICKER.html`), and a downloadable verdict card.
- **Any-ticker live lookups** — tickers outside the registry get a provisional
  certificate built from live classification + holdings scan.
- **Form MF-2 full portfolio audit** (`#/portfolio`) — paste `TICKER amount`
  lines or **drop a brokerage positions CSV** (Fidelity/Schwab/Vanguard/
  Robinhood formats auto-detected). Blended verdict, ranked contribution table,
  live resolution of unknown tickers, and **Form MF-3: the De-Musk Plan** —
  concrete same-lane swaps with dollars-of-Musk-removed and a before/after
  blended number. All client-side; nothing is uploaded.
- **SPCX Watch** (`#/watch`) — nightly-diffed exposure changelog + RSS feed,
  plus the index-inclusion tracker.
- **Analytics Annex** (`#/analytics`) — inline SVG charts: Tesla's S&P weight
  over time, cumulative forced passive buying of SPCX, Musk exposure by index.
  Hover tooltips + data-table fallbacks.
- **Musk Index** stats, live TSLA/SPCX quote cards, empire table, leaderboards,
  methodology, FAQ.
