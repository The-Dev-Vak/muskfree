# MUSK-FREE CERTIFIED™

*Is there Elon in your index fund?* A static, zero-dependency site that checks any
ETF / mutual fund / stock for Elon Musk exposure (Tesla weight + disclosed SpaceX /
xAI / Neuralink / Boring Co. stakes) and issues an official-looking verdict stamp.

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

## Features

- **Single-fund check** (`#/f/TICKER`) — certificate page with stamp, Musk Facts
  label, alternatives, share-on-X.
- **Form MF-2 full portfolio audit** (`#/portfolio`) — paste `TICKER amount`
  lines (amounts optional → equal weight), get a blended verdict, ranked
  contribution table, and share text. Runs entirely client-side; input persists
  in localStorage.
- **Musk Index** stats, empire table, leaderboards, methodology, FAQ.

## Nice-to-haves for v2

- Pre-render per-fund pages (`/f/SPY.html`) so each verdict gets its own OG card.
- Canvas-drawn downloadable verdict image ("save your certificate").
- Live TSLA/SPCX index weights via a nightly data refresh script.
