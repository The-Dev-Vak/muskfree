/* ============================================================
   MUSK-FREE CERTIFIED, dataset
   Exposure figures are % of fund assets, approximate, compiled
   July 7, 2026 from public fund disclosures and index data.
   Holdings drift daily, verify with the issuer before acting.

   THE BIG ONE: SpaceX (which absorbed xAI and X in Feb 2026)
   IPO'd June 12, 2026 as NASDAQ: SPCX, the largest IPO in
   history (~$1.75T). It entered the CRSP total-market index
   (VTI) June 18, the Russell 1000 June 29, and the Nasdaq-100
   July 7. The S&P 500 still excludes it (GAAP-earnings rule).

   tsla   = direct Tesla (TSLA) weight
   spacex = SpaceX/SpaceXAI (SPCX) weight, includes xAI, X, Grok
   other  = Neuralink / The Boring Company / misc Musk assets
   Negative numbers = short (inverse) exposure.
   ============================================================ */

const ASOF = "July 7, 2026";

const MUSK_EMPIRE = [
  { name: "Tesla, Inc.", ticker: "TSLA", status: "Public (NASDAQ)", value: "~$1.5T market cap", how: "Held by nearly every U.S. large-cap index fund since 2020" },
  { name: "SpaceX (incl. xAI, X & Grok)", ticker: "SPCX", status: "Public (NASDAQ) since 6/12/26", value: "~$2.0T, largest IPO in history", how: "Entered VTI June 18, Russell 1000 June 29, Nasdaq-100 July 7. Not in the S&P 500 yet." },
  { name: "Neuralink", ticker: "-", status: "Private", value: "~$9B", how: "Venture funds only; effectively unreachable via funds" },
  { name: "The Boring Company", ticker: "-", status: "Private", value: "~$7B", how: "Venture funds only" },
];

const KEY_STATS = [
  { big: "$1.71", label: "of every $100 in an S&P 500 index fund is Tesla", sub: "≈1.7% index weight, and zero SpaceX, for now" },
  { big: "7/7/26", label: "SpaceX (SPCX) joined the Nasdaq-100, it's in QQQ as of this week", sub: "~1% weight · ~$4.3B in forced passive buying" },
  { big: "$2.0T", label: "SpaceX's market cap weeks after the largest IPO in history, xAI, X and Grok included", sub: "listed June 12, 2026 · raised ~$75B" },
  { big: "0%", label: "Musk content in tech-sector funds. Tesla is 'Consumer Discretionary' and SPCX isn't in the S&P at all", sub: "VGT & XLK are accidentally Musk-free" },
];

/* SPCX index-inclusion tracker, answers "will my index fund add SpaceX?"
   status: in | out | pending */
const SPCX_TRACKER = [
  { index: "CRSP US Total Market", funds: "VTI, VTSAX, VV, VUG, MGK", status: "in", when: "June 18, 2026", note: "Fast-tracked five trading days after listing; an estimated $4–7B of automatic passive buying." },
  { index: "Russell 1000 / 3000", funds: "IWB, IWF, VONG, VONE", status: "in", when: "June 27–29, 2026", note: "Added at the annual reconstitution, straight into large-cap growth, skipping small caps entirely." },
  { index: "MSCI USA / ACWI", funds: "ACWI, URTH, MSCI-based 401(k) funds", status: "in", when: "June 2026", note: "MSCI's fast-entry rule for mega-cap IPOs kicked in within days." },
  { index: "Nasdaq-100", funds: "QQQ, QQQM, ONEQ, TQQQ", status: "in", when: "July 7, 2026", note: "New fast-track rule admits eligible stocks on their 15th trading day. ~$4.3B of forced buying at ~1% weight." },
  { index: "S&P 500", funds: "SPY, VOO, IVV, FXAIX", status: "out", when: "Blocked. GAAP rule", note: "Requires positive GAAP earnings (SPCX trailing net income: −$9.4B) plus committee approval. Realistic earliest entry: 2027+. The S&P's accountants are currently the most effective Musk screen in finance." },
  { index: "S&P Total Market / Completion", funds: "ITOT, SPTM, VXF-adjacent", status: "pending", when: "Sept 2026 rebalance (expected)", note: "S&P family adds IPOs at quarterly updates. When it lands, the completion index inherits what the S&P 500 refuses." },
  { index: "Dow Jones Industrial Average", funds: "DIA", status: "out", when: "Committee discretion", note: "30 hand-picked, price-weighted stocks. A ~$150 share price with no profits is not the committee's type. Tesla never made it in either." },
];

/* alts: musk-free (or near-free) alternatives in a similar lane */
const FUNDS = [
  /* ---------- S&P 500 / total market index ---------- */
  { t: "SPY",   n: "SPDR S&P 500 ETF Trust", type: "ETF", cat: "S&P 500 index", aumB: 640, tsla: 1.7, alts: ["DIA","RSP","SCHD"], aliases: ["sp500","s&p 500","spdr"], note: "Tesla at index weight, but zero SpaceX. The S&P 500 requires GAAP profits, which SPCX doesn't have, so the biggest IPO in history is locked out of the world's biggest index. For now." },
  { t: "VOO",   n: "Vanguard S&P 500 ETF", type: "ETF", cat: "S&P 500 index", aumB: 700, tsla: 1.7, alts: ["DIA","RSP","VTV"], aliases: ["vanguard 500","vanguard s&p"] },
  { t: "IVV",   n: "iShares Core S&P 500 ETF", type: "ETF", cat: "S&P 500 index", aumB: 620, tsla: 1.7, alts: ["DIA","RSP","VTV"] },
  { t: "SPLG",  n: "SPDR Portfolio S&P 500 ETF", type: "ETF", cat: "S&P 500 index", aumB: 75, tsla: 1.7, alts: ["DIA","RSP"] },
  { t: "FXAIX", n: "Fidelity 500 Index Fund", type: "Mutual fund", cat: "S&P 500 index", aumB: 660, tsla: 1.7, alts: ["DIA","SCHD","VTV"], aliases: ["fidelity 500"] },
  { t: "VFIAX", n: "Vanguard 500 Index Fund Admiral", type: "Mutual fund", cat: "S&P 500 index", aumB: 1350, tsla: 1.7, alts: ["DIA","VTV"], aliases: ["vanguard 500 index"] },
  { t: "SWPPX", n: "Schwab S&P 500 Index Fund", type: "Mutual fund", cat: "S&P 500 index", aumB: 120, tsla: 1.7, alts: ["DIA","SCHD"] },
  { t: "VTI",   n: "Vanguard Total Stock Market ETF", type: "ETF", cat: "Total US market index", aumB: 495, tsla: 1.5, spacex: 0.25, alts: ["VTV","SCHD","DIA"], aliases: ["total stock market","total market"], note: "The total market now includes SPCX. CRSP fast-tracked it in on June 18, five trading days after the IPO. Your 'boring' fund bought rockets without asking you." },
  { t: "VTSAX", n: "Vanguard Total Stock Market Index Admiral", type: "Mutual fund", cat: "Total US market index", aumB: 1500, tsla: 1.5, spacex: 0.25, alts: ["VTV","SCHD"], aliases: ["vanguard total stock"] },
  { t: "ITOT",  n: "iShares Core S&P Total US Stock Market ETF", type: "ETF", cat: "Total US market index", aumB: 70, tsla: 1.5, unverified: true, alts: ["VTV","DIA"], note: "Tracks the S&P Total Market Index, which adds IPOs quarterly. SPCX is expected at the September 2026 rebalance, not yet in. The live scan below is the tiebreaker." },
  { t: "SCHB",  n: "Schwab US Broad Market ETF", type: "ETF", cat: "Total US market index", aumB: 32, tsla: 1.5, unverified: true, alts: ["SCHD","VTV"], note: "Dow Jones US Broad Market index. SPCX addition pending its quarterly update. Run the live scan." },
  { t: "SCHX",  n: "Schwab US Large-Cap ETF", type: "ETF", cat: "Large-cap index", aumB: 60, tsla: 1.6, unverified: true, alts: ["SCHD","VTV"] },
  { t: "FSKAX", n: "Fidelity Total Market Index Fund", type: "Mutual fund", cat: "Total US market index", aumB: 110, tsla: 1.5, unverified: true, alts: ["VTV","SCHD"], note: "Tracks the Dow Jones US Total Stock Market index. SPCX addition pending its quarterly update. Check the latest holdings." },
  { t: "FZROX", n: "Fidelity ZERO Total Market Index Fund", type: "Mutual fund", cat: "Total US market index", aumB: 25, tsla: 1.5, unverified: true, alts: ["VTV","SCHD"], note: "Zero expense ratio, proprietary Fidelity index, whether SPCX is in yet isn't disclosed in real time. Nonzero Musk either way; run the live scan." },
  { t: "SWTSX", n: "Schwab Total Stock Market Index Fund", type: "Mutual fund", cat: "Total US market index", aumB: 25, tsla: 1.5, unverified: true, alts: ["SCHD","VTV"] },
  { t: "IWB",   n: "iShares Russell 1000 ETF", type: "ETF", cat: "Large-cap index", aumB: 45, tsla: 1.6, spacex: 0.3, alts: ["IWD","DIA"], note: "SPCX joined the Russell 1000 at the June 27 reconstitution, straight into large-cap land, no small-cap apprenticeship." },
  { t: "VV",    n: "Vanguard Large-Cap ETF", type: "ETF", cat: "Large-cap index", aumB: 45, tsla: 1.6, spacex: 0.3, alts: ["VTV","DIA"] },

  /* ---------- Nasdaq / growth ---------- */
  { t: "QQQ",   n: "Invesco QQQ Trust (Nasdaq-100)", type: "ETF", cat: "Nasdaq-100 index", aumB: 480, tsla: 3.2, spacex: 1.0, alts: ["VGT","XLK","SMH"], aliases: ["nasdaq","nasdaq 100","qs"], note: "As of July 7, 2026, QQQ contains SpaceX, the Nasdaq-100 fast-tracked SPCX in on its 15th trading day, forcing ~$4.3B of index buying. Plus Tesla at 3.3%. QQQ is now the Muskiest mainstream index fund in America." },
  { t: "QQQM",  n: "Invesco Nasdaq-100 ETF", type: "ETF", cat: "Nasdaq-100 index", aumB: 65, tsla: 3.2, spacex: 1.0, alts: ["VGT","XLK","SMH"], note: "Same index as QQQ, cheaper wrapper, identical Musk. SPCX joined July 7, 2026." },
  { t: "ONEQ",  n: "Fidelity Nasdaq Composite ETF", type: "ETF", cat: "Nasdaq composite index", aumB: 8, tsla: 2.4, spacex: 0.8, alts: ["VGT","XLK"], note: "The composite holds everything listed on Nasdaq, which, since June 12, includes a $1.8 trillion rocket company." },
  { t: "TQQQ",  n: "ProShares UltraPro QQQ (3×)", type: "ETF", cat: "Leveraged Nasdaq-100", aumB: 28, tsla: 9.7, spacex: 3.0, alts: ["VGT","XLK"], note: "3× daily leverage means roughly 3× the Musk, now with leveraged SpaceX too. Among other problems." },
  { t: "VUG",   n: "Vanguard Growth ETF", type: "ETF", cat: "Large growth index", aumB: 180, tsla: 2.8, spacex: 0.5, alts: ["VGT","XLK"] },
  { t: "IWF",   n: "iShares Russell 1000 Growth ETF", type: "ETF", cat: "Large growth index", aumB: 120, tsla: 2.9, spacex: 0.5, alts: ["VGT","XLK"] },
  { t: "SCHG",  n: "Schwab US Large-Cap Growth ETF", type: "ETF", cat: "Large growth index", aumB: 45, tsla: 2.9, spacex: 0.5, alts: ["VGT","XLK"] },
  { t: "SPYG",  n: "SPDR Portfolio S&P 500 Growth ETF", type: "ETF", cat: "Large growth index", aumB: 40, tsla: 3.0, alts: ["VGT","XLK"], note: "S&P growth flavor: Tesla yes, SpaceX no. SPCX isn't in any S&P index yet." },
  { t: "VOOG",  n: "Vanguard S&P 500 Growth ETF", type: "ETF", cat: "Large growth index", aumB: 15, tsla: 3.0, alts: ["VGT","XLK"] },
  { t: "IVW",   n: "iShares S&P 500 Growth ETF", type: "ETF", cat: "Large growth index", aumB: 60, tsla: 3.0, alts: ["VGT","XLK"] },
  { t: "MGK",   n: "Vanguard Mega Cap Growth ETF", type: "ETF", cat: "Mega-cap growth index", aumB: 30, tsla: 3.0, spacex: 0.6, alts: ["VGT","XLK"] },
  { t: "VONG",  n: "Vanguard Russell 1000 Growth ETF", type: "ETF", cat: "Large growth index", aumB: 30, tsla: 2.9, spacex: 0.5, alts: ["VGT","XLK"] },
  { t: "FBGRX", n: "Fidelity Blue Chip Growth Fund", type: "Mutual fund", cat: "Active large growth", aumB: 65, tsla: 2.4, spacex: 0.6, alts: ["VGT","XLK"], note: "Held private SpaceX shares for years before the IPO. That bet just went extremely public." },
  { t: "AGTHX", n: "American Funds Growth Fund of America", type: "Mutual fund", cat: "Active large growth", aumB: 145, tsla: 1.7, alts: ["VTV","DIA"] },

  /* ---------- ARK ---------- */
  { t: "ARKK",  n: "ARK Innovation ETF", type: "ETF", cat: "Active innovation", aumB: 8.2, tsla: 9.5, spacex: 8.0, alts: [], aliases: ["ark","cathie wood"], note: "Tesla has been ARKK's flagship conviction for a decade, and Cathie bought ~$300M of SPCX starting on IPO day. Tesla plus SpaceX is now roughly a sixth of the fund. There is no de-Musked ARKK. There is only ARKK." },
  { t: "ARKQ",  n: "ARK Autonomous Tech & Robotics ETF", type: "ETF", cat: "Active robotics", aumB: 1.4, tsla: 11.0, spacex: 0.6, alts: ["BOTZ"], note: "Double-digit Tesla plus a fresh SPCX position. The muskiest plain ETF on the market." },
  { t: "ARKW",  n: "ARK Next Generation Internet ETF", type: "ETF", cat: "Active internet", aumB: 2, tsla: 6.0, spacex: 0.3, alts: ["VGT"] },
  { t: "ARKX",  n: "ARK Space & Defense Innovation ETF", type: "ETF", cat: "Space & defense", aumB: 0.5, spacex: 8.0, alts: [], note: "For five years, ARK's space ETF famously contained zero SpaceX. ETFs couldn't hold private companies, so it held John Deere instead. ARK bought SPCX the morning it listed. The John Deere era is over." },
  { t: "ARKVX", n: "ARK Venture Fund", type: "Interval fund", cat: "Venture capital", aumB: 0.6, spacex: 17.0, alts: [], note: "Bought SpaceX and xAI while they were private. After the merger and IPO, that's one very large, very public SPCX position. The early-bird Musk fund." },

  /* ---------- Consumer discretionary ---------- */
  { t: "XLY",   n: "Consumer Discretionary Select Sector SPDR", type: "ETF", cat: "Consumer discretionary sector", aumB: 22, tsla: 18.4, alts: ["XRT"], note: "Tesla is this fund's #2 holding, behind Amazon. Nearly a fifth of your money." },
  { t: "VCR",   n: "Vanguard Consumer Discretionary ETF", type: "ETF", cat: "Consumer discretionary sector", aumB: 7, tsla: 14.8, alts: ["XRT"] },
  { t: "XRT",   n: "SPDR S&P Retail ETF", type: "ETF", cat: "Retail (equal weight)", tsla: 0, note: "Equal-weight retail. Tesla doesn't make the cut." },

  /* ---------- Sector funds (musk-free by classification) ---------- */
  { t: "VGT",   n: "Vanguard Information Technology ETF", type: "ETF", cat: "Tech sector", tsla: 0, note: "GICS classifies Tesla as Consumer Discretionary and SpaceX as aerospace, neither counts as 'Technology.' The tech fund is accidentally Musk-free. Bureaucracy delivers." },
  { t: "XLK",   n: "Technology Select Sector SPDR", type: "ETF", cat: "Tech sector", tsla: 0, note: "No Tesla (not classified as tech) and no SPCX (sector SPDRs only hold S&P 500 members, and SpaceX isn't one). Double-shielded by paperwork." },
  { t: "SMH",   n: "VanEck Semiconductor ETF", type: "ETF", cat: "Semiconductors", tsla: 0, note: "Chips only. Some of these companies sell billions in GPUs to Musk firms, but supply-chain exposure isn't equity exposure." },
  { t: "SOXX",  n: "iShares Semiconductor ETF", type: "ETF", cat: "Semiconductors", tsla: 0 },
  { t: "XLF",   n: "Financial Select Sector SPDR", type: "ETF", cat: "Financials sector", tsla: 0 },
  { t: "XLV",   n: "Health Care Select Sector SPDR", type: "ETF", cat: "Healthcare sector", tsla: 0 },
  { t: "XLE",   n: "Energy Select Sector SPDR", type: "ETF", cat: "Energy sector", tsla: 0, note: "Oil and gas. Ideologically the anti-Tesla, if that's your thing." },
  { t: "XLI",   n: "Industrial Select Sector SPDR", type: "ETF", cat: "Industrials sector", tsla: 0, note: "SpaceX is an industrial by classification, but sector SPDRs only hold S&P 500 members, and SPCX isn't one yet. Watch this space (sorry) when the S&P admits it." },
  { t: "XLP",   n: "Consumer Staples Select Sector SPDR", type: "ETF", cat: "Consumer staples sector", tsla: 0, note: "Toothpaste and soda. Zero rockets." },
  { t: "XLU",   n: "Utilities Select Sector SPDR", type: "ETF", cat: "Utilities sector", tsla: 0 },
  { t: "XLB",   n: "Materials Select Sector SPDR", type: "ETF", cat: "Materials sector", tsla: 0 },
  { t: "XLRE",  n: "Real Estate Select Sector SPDR", type: "ETF", cat: "Real estate sector", tsla: 0 },
  { t: "XLC",   n: "Communication Services Select Sector SPDR", type: "ETF", cat: "Communication sector", tsla: 0, note: "Holds Meta and Alphabet, different billionaires entirely. X and Grok live inside SPCX now, which isn't in any S&P index." },
  { t: "VNQ",   n: "Vanguard Real Estate ETF", type: "ETF", cat: "Real estate (REITs)", tsla: 0 },
  { t: "VHT",   n: "Vanguard Health Care ETF", type: "ETF", cat: "Healthcare sector", tsla: 0 },

  /* ---------- Dividend / value ---------- */
  { t: "SCHD",  n: "Schwab US Dividend Equity ETF", type: "ETF", cat: "Dividend equity", tsla: 0, note: "Neither Tesla nor SpaceX pays a dividend, so neither can get in. The bouncer here is math." },
  { t: "VYM",   n: "Vanguard High Dividend Yield ETF", type: "ETF", cat: "Dividend equity", tsla: 0 },
  { t: "VIG",   n: "Vanguard Dividend Appreciation ETF", type: "ETF", cat: "Dividend growth", tsla: 0, note: "Requires 10 straight years of dividend increases. Musk companies have zero. Musk-free until at least 2036." },
  { t: "DGRO",  n: "iShares Core Dividend Growth ETF", type: "ETF", cat: "Dividend growth", tsla: 0 },
  { t: "DVY",   n: "iShares Select Dividend ETF", type: "ETF", cat: "Dividend equity", tsla: 0 },
  { t: "HDV",   n: "iShares Core High Dividend ETF", type: "ETF", cat: "Dividend equity", tsla: 0 },
  { t: "VTV",   n: "Vanguard Value ETF", type: "ETF", cat: "Large value index", tsla: 0, note: "Value index. Tesla and SPCX trade at multiples that disqualify them on contact." },
  { t: "IWD",   n: "iShares Russell 1000 Value ETF", type: "ETF", cat: "Large value index", tsla: 0, note: "SPCX went into the Russell growth index, not value. A $1.8T company with no GAAP earnings was never going to be 'value.'" },
  { t: "JEPI",  n: "JPMorgan Equity Premium Income ETF", type: "ETF", cat: "Covered-call income", tsla: 0, note: "Low-volatility stock selection has kept Tesla out. Verify current holdings, it's actively managed." },
  { t: "JEPQ",  n: "JPMorgan Nasdaq Equity Premium Income ETF", type: "ETF", cat: "Covered-call income", aumB: 30, tsla: 2.4, alts: ["JEPI"], note: "Nasdaq-linked and actively managed, with SPCX now in the Nasdaq-100, expect it to show up here too. Check current holdings." },
  { t: "MOAT",  n: "VanEck Morningstar Wide Moat ETF", type: "ETF", cat: "Wide moat", tsla: 0 },
  { t: "COWZ",  n: "Pacer US Cash Cows 100 ETF", type: "ETF", cat: "Free cash flow", tsla: 0 },

  /* ---------- Dow / equal weight / small-mid ---------- */
  { t: "DIA",   n: "SPDR Dow Jones Industrial Average ETF", type: "ETF", cat: "Dow 30 index", tsla: 0, aliases: ["dow","dow jones"], note: "Neither Tesla nor SpaceX has ever been admitted to the Dow. 30 stocks, zero Musk, since 1896." },
  { t: "RSP",   n: "Invesco S&P 500 Equal Weight ETF", type: "ETF", cat: "S&P 500 equal weight", tsla: 0.2, alts: ["DIA"], note: "Equal weight: Tesla gets the same allocation as, roughly, Hormel Foods. And no SpaceX, it's not in the S&P 500. Deeply humbling all around." },
  { t: "IWM",   n: "iShares Russell 2000 ETF", type: "ETF", cat: "Small-cap index", tsla: 0, aliases: ["russell 2000"], note: "Small caps. SPCX went straight into the Russell 1000, no company worth $1.8 trillion is doing a small-cap apprenticeship. Still Musk-free down here." },
  { t: "VB",    n: "Vanguard Small-Cap ETF", type: "ETF", cat: "Small-cap index", tsla: 0 },
  { t: "VO",    n: "Vanguard Mid-Cap ETF", type: "ETF", cat: "Mid-cap index", tsla: 0 },
  { t: "IJH",   n: "iShares Core S&P Mid-Cap ETF", type: "ETF", cat: "Mid-cap index", tsla: 0 },
  { t: "IJR",   n: "iShares Core S&P Small-Cap ETF", type: "ETF", cat: "Small-cap index", tsla: 0 },
  { t: "AVUV",  n: "Avantis US Small Cap Value ETF", type: "ETF", cat: "Small-cap value", tsla: 0 },
  { t: "VXF",   n: "Vanguard Extended Market ETF", type: "ETF", cat: "Completion index", aumB: 22, tsla: 0, unverified: true, note: "Holds everything NOT in the S&P 500. When the S&P Total Market index adds SPCX (expected September 2026), this fund inherits the biggest IPO in history, precisely because the S&P 500 refuses it. Bureaucratic comedy, pending." , alts: ["VB","IJR"] },
  { t: "VBR",   n: "Vanguard Small-Cap Value ETF", type: "ETF", cat: "Small-cap value", tsla: 0 },

  /* ---------- International ---------- */
  { t: "VXUS",  n: "Vanguard Total International Stock ETF", type: "ETF", cat: "International index", tsla: 0, aliases: ["international"], note: "Ex-US means ex-Musk. Tesla and SPCX are both US-listed. The rest of the planet, one fund." },
  { t: "VEA",   n: "Vanguard FTSE Developed Markets ETF", type: "ETF", cat: "Developed international", tsla: 0 },
  { t: "VWO",   n: "Vanguard FTSE Emerging Markets ETF", type: "ETF", cat: "Emerging markets", tsla: 0, note: "Holds BYD, Tesla's biggest rival. Take that as you will." },
  { t: "IEFA",  n: "iShares Core MSCI EAFE ETF", type: "ETF", cat: "Developed international", tsla: 0 },
  { t: "EFA",   n: "iShares MSCI EAFE ETF", type: "ETF", cat: "Developed international", tsla: 0 },
  { t: "IEMG",  n: "iShares Core MSCI Emerging Markets ETF", type: "ETF", cat: "Emerging markets", tsla: 0 },
  { t: "IXUS",  n: "iShares Core MSCI Total International ETF", type: "ETF", cat: "International index", tsla: 0 },
  { t: "SCHF",  n: "Schwab International Equity ETF", type: "ETF", cat: "Developed international", tsla: 0 },
  { t: "VT",    n: "Vanguard Total World Stock ETF", type: "ETF", cat: "Global index", aumB: 60, tsla: 1.0, spacex: 0.15, alts: ["VXUS","VEA"], note: "The whole world, including the parts of it that are Tesla and, since June, SpaceX." },
  { t: "VTWAX", n: "Vanguard Total World Stock Index Admiral", type: "Mutual fund", cat: "Global index", aumB: 45, tsla: 1.0, spacex: 0.15, alts: ["VXUS"] },
  { t: "ACWI",  n: "iShares MSCI ACWI ETF", type: "ETF", cat: "Global index", aumB: 22, tsla: 1.1, spacex: 0.15, alts: ["IXUS"], note: "MSCI fast-tracked SPCX into its global indices within days of the IPO." },

  /* ---------- Bonds / cash / commodities / crypto ---------- */
  { t: "BND",   n: "Vanguard Total Bond Market ETF", type: "ETF", cat: "US bonds", tsla: 0, aliases: ["bonds"], note: "Bonds. The Musk content of a US aggregate bond fund is zero, which is also its excitement content." },
  { t: "AGG",   n: "iShares Core US Aggregate Bond ETF", type: "ETF", cat: "US bonds", tsla: 0 },
  { t: "BNDX",  n: "Vanguard Total International Bond ETF", type: "ETF", cat: "International bonds", tsla: 0 },
  { t: "VBTLX", n: "Vanguard Total Bond Market Index Admiral", type: "Mutual fund", cat: "US bonds", tsla: 0 },
  { t: "FXNAX", n: "Fidelity US Bond Index Fund", type: "Mutual fund", cat: "US bonds", tsla: 0 },
  { t: "TLT",   n: "iShares 20+ Year Treasury Bond ETF", type: "ETF", cat: "Long treasuries", tsla: 0 },
  { t: "SHY",   n: "iShares 1-3 Year Treasury Bond ETF", type: "ETF", cat: "Short treasuries", tsla: 0 },
  { t: "SGOV",  n: "iShares 0-3 Month Treasury Bond ETF", type: "ETF", cat: "T-bills", tsla: 0, note: "T-bills: backed by the full faith and credit of the United States, an entity Musk has merely worked for." },
  { t: "BIL",   n: "SPDR Bloomberg 1-3 Month T-Bill ETF", type: "ETF", cat: "T-bills", tsla: 0 },
  { t: "LQD",   n: "iShares Investment Grade Corporate Bond ETF", type: "ETF", cat: "Corporate bonds", tsla: 0, note: "Tesla carries almost no public debt and SpaceX just raised $75B in equity instead. Even the bond funds are clean." },
  { t: "HYG",   n: "iShares High Yield Corporate Bond ETF", type: "ETF", cat: "High-yield bonds", tsla: 0 },
  { t: "MUB",   n: "iShares National Muni Bond ETF", type: "ETF", cat: "Municipal bonds", tsla: 0 },
  { t: "GLD",   n: "SPDR Gold Shares", type: "ETF", cat: "Gold", tsla: 0, aliases: ["gold"], note: "It's a vault of metal bars in London. Musk content: geologically zero." },
  { t: "IAU",   n: "iShares Gold Trust", type: "ETF", cat: "Gold", tsla: 0 },
  { t: "SLV",   n: "iShares Silver Trust", type: "ETF", cat: "Silver", tsla: 0 },
  { t: "IBIT",  n: "iShares Bitcoin Trust", type: "ETF", cat: "Bitcoin", tsla: 0, aliases: ["bitcoin"], note: "Financially Musk-free. Spiritually, he did move this market with single tweets, repeatedly. Exposure: emotional." },
  { t: "FBTC",  n: "Fidelity Wise Origin Bitcoin Fund", type: "ETF", cat: "Bitcoin", tsla: 0 },

  /* ---------- Target date / balanced ---------- */
  { t: "VFFVX", n: "Vanguard Target Retirement 2055", type: "Mutual fund", cat: "Target date", aumB: 45, tsla: 0.9, spacex: 0.15, alts: [], aliases: ["target date","target retirement"], note: "The default 401(k) fund for millions. It's held Tesla for years, and as of June, its total-market sleeve quietly picked up SpaceX too. No, HR didn't mention that." },
  { t: "VTTSX", n: "Vanguard Target Retirement 2060", type: "Mutual fund", cat: "Target date", aumB: 30, tsla: 0.9, spacex: 0.15, alts: [] },
  { t: "VTHRX", n: "Vanguard Target Retirement 2030", type: "Mutual fund", cat: "Target date", aumB: 40, tsla: 0.6, spacex: 0.1, alts: [] },
  { t: "VBIAX", n: "Vanguard Balanced Index Fund", type: "Mutual fund", cat: "60/40 balanced", aumB: 60, tsla: 0.9, spacex: 0.15, alts: ["VWELX"] },
  { t: "VWELX", n: "Vanguard Wellington Fund", type: "Mutual fund", cat: "Active balanced", aumB: 100, tsla: 1.0, alts: ["DODGX","PRWCX"], note: "Running since 1929, and per its latest SEC filing, currently running with about 1% Tesla. Even the old guard picked some up. We checked the actual N-PORT so you don't have to." },

  /* ---------- Maximum musk ---------- */
  { t: "TSLA",  n: "Tesla, Inc.", type: "Stock", cat: "The original source", tsla: 100, alts: ["F","GM","RIVN"], aliases: ["tesla"], note: "This is not a fund with Musk in it. This is the Musk. 100% by definition, plus the CEO's undivided attention, minus the CEO's undivided attention." },
  { t: "SPCX",  n: "SpaceX (Space Exploration Technologies)", type: "Stock", cat: "The new source", spacex: 100, alts: ["BA","AMZN"], aliases: ["spacex","space x","starlink","xai","x","twitter","grok","spacexai"], note: "Public since June 12, 2026, the largest IPO in history (~$1.8T, ~$75B raised). One share buys you rockets, Starlink, xAI, Grok, and what's left of Twitter, all under one ticker. 100% Musk, now available in your brokerage app and, increasingly, your index fund." },
  { t: "TSLL",  n: "Direxion Daily TSLA Bull 2X Shares", type: "ETF", cat: "Leveraged single stock", aumB: 5, tsla: 200, alts: [], note: "Two hundred percent Musk. Every dollar you invest is two dollars of Elon, rebalanced daily. Certified extremely not Musk-free." },
  { t: "TSLS",  n: "Direxion Daily TSLA Bear 1X Shares", type: "ETF", cat: "Inverse single stock", tsla: -100, alts: [], note: "Negative Musk. This fund profits when Tesla falls. Not Musk-free. Musk-hostile. A different thing entirely." },
  { t: "TSLZ",  n: "T-Rex 2X Inverse Tesla Daily Target ETF", type: "ETF", cat: "Inverse single stock", tsla: -200, alts: [], note: "Minus two hundred percent Musk. The most anti-Musk instrument legally available to a retail investor." },
  { t: "DXYZ",  n: "Destiny Tech100", type: "Closed-end fund", cat: "Private tech", aumB: 2, spacex: 16.2, alts: [], aliases: ["destiny"], note: "Bought SpaceX while it was private and rode the IPO up. Still usually trades at a rich premium to asset value, the Musk costs extra here. Also holds a slug of Anthropic now." },
  { t: "XOVR",  n: "ERShares Private-Public Crossover ETF", type: "ETF", cat: "Crossover", aumB: 2.3, spacex: 16.6, tsla: 0.8, alts: [], note: "The first ETF to hold SpaceX shares, back when that required a workaround wrapped in a loophole wrapped in an expense ratio. Now it's just a stock anyone can buy, which rather undercuts the pitch." },
  { t: "BPTRX", n: "Baron Partners Fund", type: "Mutual fund", cat: "Concentrated growth", aumB: 8, tsla: 20.4, spacex: 33.0, alts: [], aliases: ["baron"], note: "Per its own SEC filing (March 2026): 23% Tesla plus 37% SpaceX across share classes, roughly SIXTY percent of this mutual fund is Musk enterprises. The most Musk-concentrated fund in America, now with government paperwork to prove it." },
  { t: "BFGFX", n: "Baron Focused Growth Fund", type: "Mutual fund", cat: "Concentrated growth", aumB: 2, tsla: 9.0, spacex: 12.0, alts: [] },

  /* ---------- Musk private companies (searchable) ---------- */
  { t: "NEURALINK", n: "Neuralink", type: "Private company", cat: "Not publicly traded", special: "private", note: "Still private (~$9B). Effectively no fund exposure for retail investors. Your brain remains, for now, unchipped and your portfolio unexposed." },
  { t: "BORING", n: "The Boring Company", type: "Private company", cat: "Not publicly traded", special: "private", aliases: ["boring company"], note: "Still private (~$7B). No meaningful retail fund exposure. The tunnels remain, like the company, hard to get into." },
  { t: "DOGE",  n: "Dogecoin", type: "Cryptocurrency", cat: "Meme asset", special: "doge", aliases: ["dogecoin"], note: "Equity exposure to Musk companies: 0%. Spiritual exposure: total. He named a federal department after it. We can't stamp this one. Nobody can." },

  /* ---------- Individual stocks (musk-free) ---------- */
  { t: "AAPL",  n: "Apple Inc.", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["apple"], note: "Different billionaire's legacy. Tim Cook has never once hosted a rocket livestream." },
  { t: "MSFT",  n: "Microsoft Corporation", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["microsoft"], note: "Musk sued them. That's the opposite of ownership." },
  { t: "NVDA",  n: "NVIDIA Corporation", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["nvidia"], note: "Zero Musk equity, but they sell GPUs to Musk companies by the warehouse, and even invested in xAI's last private round before the SpaceX merger. Supply-chain and customer exposure isn't counted here, but you should know it exists." },
  { t: "AMZN",  n: "Amazon.com, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["amazon"], note: "Bezos. The rival rocket billionaire. Kuiper vs Starlink, Blue Origin vs SpaceX. Musk-free and Musk-competitive." },
  { t: "GOOGL", n: "Alphabet Inc.", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["google","alphabet"], note: "Larry Page and Musk used to be close friends. They are not anymore. 0% exposure." },
  { t: "META",  n: "Meta Platforms, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["facebook","meta"], note: "Zuckerberg. The cage match never happened, and neither did any equity overlap." },
  { t: "BRK.B", n: "Berkshire Hathaway Inc.", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["berkshire","buffett","brk"], note: "Warren Buffett has never owned Tesla, skipped the SpaceX IPO, and famously does not text Elon. The blue-chip Musk-free option." },
  { t: "JPM",   n: "JPMorgan Chase & Co.", type: "Stock", cat: "Individual stock", tsla: 0, note: "They sued each other over Tesla warrants in 2021. Grudge-certified Musk-free." },
  { t: "V",     n: "Visa Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "MA",    n: "Mastercard Incorporated", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "JNJ",   n: "Johnson & Johnson", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "WMT",   n: "Walmart Inc.", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["walmart"] },
  { t: "COST",  n: "Costco Wholesale Corporation", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["costco"], note: "The $1.50 hot dog is Musk-free and inflation-free. A safe harbor in every sense." },
  { t: "KO",    n: "The Coca-Cola Company", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["coca cola","coke"], note: "Musk once tweeted he'd buy Coca-Cola 'to put the cocaine back in.' He did not buy it. 0%." },
  { t: "PG",    n: "The Procter & Gamble Company", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "PEP",   n: "PepsiCo, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, note: "Bought some Tesla Semis once. That's a customer relationship, not equity. 0%." },
  { t: "NFLX",  n: "Netflix, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["netflix"] },
  { t: "AMD",   n: "Advanced Micro Devices, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, note: "Cathie Wood sold AMD to buy more SpaceX. Being someone's funding source for Musk purchases is not, itself, Musk exposure." },
  { t: "DIS",   n: "The Walt Disney Company", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["disney"], note: "Musk publicly feuded with the CEO and pulled ads. Feud-certified Musk-free." },
  { t: "HD",    n: "The Home Depot, Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "MCD",   n: "McDonald's Corporation", type: "Stock", cat: "Individual stock", tsla: 0, note: "He said he'd eat a Happy Meal on TV if they accepted Dogecoin. They declined. 0%." },
  { t: "BA",    n: "The Boeing Company", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["boeing"], note: "SpaceX's biggest rival for NASA contracts, now also its rival on the Nasdaq. Different rocket problems entirely. 0% Musk." },
  { t: "F",     n: "Ford Motor Company", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["ford"], note: "The other American EV maker. 122 years old, zero Musk, occasionally borrows his charging plugs." },
  { t: "GM",    n: "General Motors Company", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "RIVN",  n: "Rivian Automotive, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["rivian"], note: "EV competitor, part-owned by Amazon and Volkswagen. Musk has mocked them on X, which if anything is negative exposure." },
  { t: "LCID",  n: "Lucid Group, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["lucid"], note: "Founded by Tesla's former chief engineer. Musk-adjacent DNA, zero Musk equity." },
  { t: "NIO",   n: "NIO Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "TM",    n: "Toyota Motor Corporation", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["toyota"] },
  { t: "PLTR",  n: "Palantir Technologies Inc.", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["palantir"], note: "A different controversial-billionaire situation. Consult a different website." },
];

/* ---------- Expansion: more index / sector / factor funds ---------- */
FUNDS.push(
  { t: "OEF",   n: "iShares S&P 100 ETF", type: "ETF", cat: "Mega-cap index", aumB: 15, tsla: 2.0, alts: ["DIA","XLG"] },
  { t: "XLG",   n: "Invesco S&P 500 Top 50 ETF", type: "ETF", cat: "Mega-cap index", aumB: 10, tsla: 2.3, alts: ["DIA"] },
  { t: "SPTM",  n: "SPDR Portfolio S&P 1500 ETF", type: "ETF", cat: "Broad US index", aumB: 10, tsla: 1.6, unverified: true, alts: ["VTV","DIA"], note: "S&P family. SPCX pending the quarterly index update. Live scan below settles it." },
  { t: "FNILX", n: "Fidelity ZERO Large Cap Index Fund", type: "Mutual fund", cat: "Large-cap index", aumB: 8, tsla: 1.7, alts: ["VTV","DIA"] },
  { t: "BKLC",  n: "BNY Mellon US Large Cap Core Equity ETF", type: "ETF", cat: "Large-cap index", aumB: 3, tsla: 1.7, alts: ["VTV"] },
  { t: "VONE",  n: "Vanguard Russell 1000 ETF", type: "ETF", cat: "Large-cap index", aumB: 5, tsla: 1.6, spacex: 0.3, alts: ["IWD","DIA"] },
  { t: "USMV",  n: "iShares MSCI USA Min Vol Factor ETF", type: "ETF", cat: "Low volatility", tsla: 0, note: "Minimum-volatility screens have never had room for Tesla, and a freshly IPO'd rocket company is the opposite of low-vol. Structurally Musk-resistant." },
  { t: "SCHV",  n: "Schwab US Large-Cap Value ETF", type: "ETF", cat: "Large value index", tsla: 0 },
  { t: "SPYV",  n: "SPDR Portfolio S&P 500 Value ETF", type: "ETF", cat: "Large value index", tsla: 0 },
  { t: "IUSV",  n: "iShares Core S&P US Value ETF", type: "ETF", cat: "Value index", tsla: 0 },
  { t: "IUSG",  n: "iShares Core S&P US Growth ETF", type: "ETF", cat: "Growth index", aumB: 20, tsla: 2.8, alts: ["VGT","XLK"] },
  { t: "VBK",   n: "Vanguard Small-Cap Growth ETF", type: "ETF", cat: "Small growth index", tsla: 0 },
  { t: "VOT",   n: "Vanguard Mid-Cap Growth ETF", type: "ETF", cat: "Mid growth index", tsla: 0 },
  { t: "QQQE",  n: "Direxion Nasdaq-100 Equal Weighted ETF", type: "ETF", cat: "Nasdaq-100 equal weight", aumB: 1.5, tsla: 1.0, spacex: 1.0, alts: ["VGT"], note: "Equal weight: Tesla and SpaceX each get the same 1% as everything else. Musk, democratized." },
  { t: "QQQJ",  n: "Invesco Nasdaq Next Gen 100 ETF", type: "ETF", cat: "Nasdaq mid-cap", tsla: 0, note: "The next 100 after the Nasdaq-100. SPCX skipped this waiting room entirely." },
  /* sectors */
  { t: "VOX",   n: "Vanguard Communication Services ETF", type: "ETF", cat: "Communication sector", tsla: 0, unverified: true, note: "Meta and Alphabet territory. If MSCI ever files SPCX under communications (Starlink is, after all, a telecom), this gets interesting, live scan below." },
  { t: "VIS",   n: "Vanguard Industrials ETF", type: "ETF", cat: "Industrials sector", tsla: 0, unverified: true, note: "SpaceX is an aerospace company by classification. If it lands in the MSCI industrials bucket, this fund will carry a big slug of it. Run the live scan, this one can change under your feet." },
  { t: "VDC",   n: "Vanguard Consumer Staples ETF", type: "ETF", cat: "Consumer staples sector", tsla: 0 },
  { t: "VDE",   n: "Vanguard Energy ETF", type: "ETF", cat: "Energy sector", tsla: 0 },
  { t: "VAW",   n: "Vanguard Materials ETF", type: "ETF", cat: "Materials sector", tsla: 0 },
  { t: "FTEC",  n: "Fidelity MSCI Information Technology ETF", type: "ETF", cat: "Tech sector", tsla: 0, note: "Same GICS technicality as VGT: Tesla isn't tech, so it isn't here." },
  { t: "IYW",   n: "iShares US Technology ETF", type: "ETF", cat: "Tech sector", tsla: 0 },
  { t: "IGV",   n: "iShares Expanded Tech-Software ETF", type: "ETF", cat: "Software", tsla: 0 },
  /* aerospace & space, the SPCX frontier */
  { t: "ITA",   n: "iShares US Aerospace & Defense ETF", type: "ETF", cat: "Aerospace & defense", tsla: 0, unverified: true, note: "The obvious home for a rocket company, but it tracks a Dow Jones select index with its own add schedule. Whether SPCX has landed here yet is exactly what the live scan below is for." },
  { t: "XAR",   n: "SPDR S&P Aerospace & Defense ETF", type: "ETF", cat: "Aerospace & defense", tsla: 0, note: "S&P-universe, equal weight, no SPCX until the S&P family admits it, and even then it'd get an equal slice like everyone else." },
  { t: "PPA",   n: "Invesco Aerospace & Defense ETF", type: "ETF", cat: "Aerospace & defense", tsla: 0, unverified: true, note: "Tracks the SPADE Defense Index, which moves on its own schedule. Prime SPCX-candidate territory, run the live scan." },
  { t: "UFO",   n: "Procure Space ETF", type: "ETF", cat: "Space", tsla: 0, unverified: true, aliases: ["space etf"], note: "A pure-play space ETF that spent seven years unable to own the biggest space company on Earth. Now it can. Whether it has yet: see the live scan. (ARKX already did.)" },
  { t: "ARKF",  n: "ARK Fintech Innovation ETF", type: "ETF", cat: "Active fintech", tsla: 0, unverified: true, note: "The one ARK fund without a Tesla habit, historically. Cathie's funds change fast; trust the live scan over us." },
  /* dividend & factor */
  { t: "NOBL",  n: "ProShares S&P 500 Dividend Aristocrats ETF", type: "ETF", cat: "Dividend growth", tsla: 0, note: "Requires 25 consecutive years of dividend increases. Musk companies have zero years. See you in 2051." },
  { t: "SDY",   n: "SPDR S&P Dividend ETF", type: "ETF", cat: "Dividend equity", tsla: 0 },
  { t: "SPHD",  n: "Invesco S&P 500 High Dividend Low Vol ETF", type: "ETF", cat: "Dividend equity", tsla: 0 },
  { t: "DGRW",  n: "WisdomTree US Quality Dividend Growth Fund", type: "ETF", cat: "Dividend growth", tsla: 0 },
  /* leveraged & inverse index (the fun ones) */
  { t: "SSO",   n: "ProShares Ultra S&P 500 (2×)", type: "ETF", cat: "Leveraged S&P 500", aumB: 5, tsla: 3.4, alts: ["DIA"], note: "2× the S&P means 2× its Tesla. Still zero SpaceX, leverage can't buy what the index refuses." },
  { t: "UPRO",  n: "ProShares UltraPro S&P 500 (3×)", type: "ETF", cat: "Leveraged S&P 500", aumB: 4, tsla: 5.1, alts: ["DIA"] },
  { t: "SPXL",  n: "Direxion Daily S&P 500 Bull 3X", type: "ETF", cat: "Leveraged S&P 500", aumB: 5, tsla: 5.1, alts: [] },
  { t: "QLD",   n: "ProShares Ultra QQQ (2×)", type: "ETF", cat: "Leveraged Nasdaq-100", aumB: 8, tsla: 6.4, spacex: 2.0, alts: [] },
  { t: "SQQQ",  n: "ProShares UltraPro Short QQQ (−3×)", type: "ETF", cat: "Inverse Nasdaq-100", tsla: -9.7, spacex: -3.0, alts: [], note: "Shorts the entire Nasdaq-100, which now means shorting Tesla AND SpaceX simultaneously, with leverage. The maximalist anti-Musk position, plus a hundred innocent bystanders." },
  { t: "SDS",   n: "ProShares UltraShort S&P 500 (−2×)", type: "ETF", cat: "Inverse S&P 500", tsla: -3.4, alts: [] },
  { t: "SPXS",  n: "Direxion Daily S&P 500 Bear 3X", type: "ETF", cat: "Inverse S&P 500", tsla: -5.1, alts: [] },
  /* international & bonds */
  { t: "VEU",   n: "Vanguard FTSE All-World ex-US ETF", type: "ETF", cat: "International index", tsla: 0 },
  { t: "FTIHX", n: "Fidelity Total International Index Fund", type: "Mutual fund", cat: "International index", tsla: 0 },
  { t: "FZILX", n: "Fidelity ZERO International Index Fund", type: "Mutual fund", cat: "International index", tsla: 0 },
  { t: "VGIT",  n: "Vanguard Intermediate-Term Treasury ETF", type: "ETF", cat: "Treasuries", tsla: 0 },
  { t: "VGSH",  n: "Vanguard Short-Term Treasury ETF", type: "ETF", cat: "Treasuries", tsla: 0 },
  { t: "VGLT",  n: "Vanguard Long-Term Treasury ETF", type: "ETF", cat: "Treasuries", tsla: 0 },
  { t: "VTEB",  n: "Vanguard Tax-Exempt Bond ETF", type: "ETF", cat: "Municipal bonds", tsla: 0 },
  { t: "SCHZ",  n: "Schwab US Aggregate Bond ETF", type: "ETF", cat: "US bonds", tsla: 0 },
  { t: "FBND",  n: "Fidelity Total Bond ETF", type: "ETF", cat: "US bonds", tsla: 0 },
  { t: "ETHA",  n: "iShares Ethereum Trust", type: "ETF", cat: "Ethereum", tsla: 0, note: "Vitalik's chain, not Elon's coin. 0% Musk, 100% different internet drama." },
  /* target date & active mutual funds */
  { t: "VFIFX", n: "Vanguard Target Retirement 2050", type: "Mutual fund", cat: "Target date", aumB: 80, tsla: 0.9, spacex: 0.15, alts: [] },
  { t: "VTTVX", n: "Vanguard Target Retirement 2025", type: "Mutual fund", cat: "Target date", aumB: 50, tsla: 0.4, spacex: 0.06, alts: [] },
  { t: "VTINX", n: "Vanguard Target Retirement Income", type: "Mutual fund", cat: "Target date", aumB: 35, tsla: 0.3, spacex: 0.04, alts: [] },
  { t: "FDKLX", n: "Fidelity Freedom Index 2060", type: "Mutual fund", cat: "Target date", aumB: 25, tsla: 0.9, unverified: true, alts: [] },
  { t: "FCNTX", n: "Fidelity Contrafund", type: "Mutual fund", cat: "Active large growth", aumB: 140, tsla: 0, unverified: true, note: "Historically a Meta-and-Berkshire shop with no Tesla habit, but it held private SpaceX in the past. Actively managed; verify current holdings." },
  { t: "FDGRX", n: "Fidelity Growth Company Fund", type: "Mutual fund", cat: "Active large growth", aumB: 65, tsla: 1.9, spacex: 2.9, note: "Bought SpaceX while private and kept it through the IPO, its SEC filing shows nearly 3%, one of the larger mainstream-fund SpaceX bets." },
  { t: "TRBCX", n: "T. Rowe Price Blue Chip Growth Fund", type: "Mutual fund", cat: "Active large growth", aumB: 55, tsla: 1.0, unverified: true, alts: ["VTV"] },
  { t: "DODGX", n: "Dodge & Cox Stock Fund", type: "Mutual fund", cat: "Active value", tsla: 0, note: "Old-school value discipline since 1965. Musk multiples need not apply." },
  { t: "PRWCX", n: "T. Rowe Price Capital Appreciation Fund", type: "Mutual fund", cat: "Active balanced", tsla: 0 },
  /* individual stocks, more coverage */
  { t: "AVGO",  n: "Broadcom Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "ORCL",  n: "Oracle Corporation", type: "Stock", cat: "Individual stock", tsla: 0, note: "Larry Ellison sits on nobody's board quietly, once held a Tesla board seat personally, and Oracle rents xAI compute. Corporate equity overlap today: zero." },
  { t: "CRM",   n: "Salesforce, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, note: "Benioff also wanted Twitter once. He got over it. 0%." },
  { t: "ADBE",  n: "Adobe Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "LLY",   n: "Eli Lilly and Company", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "ABBV",  n: "AbbVie Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "MRK",   n: "Merck & Co., Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "PFE",   n: "Pfizer Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "UNH",   n: "UnitedHealth Group Incorporated", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "TMO",   n: "Thermo Fisher Scientific Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "ABT",   n: "Abbott Laboratories", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "CVX",   n: "Chevron Corporation", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "XOM",   n: "Exxon Mobil Corporation", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["exxon"] },
  { t: "WFC",   n: "Wells Fargo & Company", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "BAC",   n: "Bank of America Corporation", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "GS",    n: "The Goldman Sachs Group, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, note: "They underwrote the SPCX IPO and got paid handsomely for it. Fees are not equity." },
  { t: "MS",    n: "Morgan Stanley", type: "Stock", cat: "Individual stock", tsla: 0, note: "Financed the Twitter deal back in 2022. Lender, not owner, and they've been paid back. 0%." },
  { t: "C",     n: "Citigroup Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "T",     n: "AT&T Inc.", type: "Stock", cat: "Individual stock", tsla: 0, note: "Competes with Starlink's direct-to-cell ambitions. Musk-free and increasingly Musk-annoyed." },
  { t: "VZ",    n: "Verizon Communications Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "TMUS",  n: "T-Mobile US, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, note: "Partners with Starlink for satellite texting. A business deal, not a shareholding. 0%." },
  { t: "CSCO",  n: "Cisco Systems, Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "IBM",   n: "International Business Machines", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "INTU",  n: "Intuit Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "NOW",   n: "ServiceNow, Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "QCOM",  n: "Qualcomm Incorporated", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "TXN",   n: "Texas Instruments Incorporated", type: "Stock", cat: "Individual stock", tsla: 0, note: "Texas? Yes. Instruments? Yes. Tesla? No. (Our name-matcher checked twice.)" },
  { t: "INTC",  n: "Intel Corporation", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "UBER",  n: "Uber Technologies, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, note: "The robotaxi cold war's other side. Zero Musk equity, maximum Musk rivalry." },
  { t: "COIN",  n: "Coinbase Global, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, note: "Lists Dogecoin, which is spiritually his. Financially: 0%." },
  { t: "HOOD",  n: "Robinhood Markets, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, note: "Where a meaningful fraction of the Musk trades happen. Selling shovels isn't holding the gold. 0%." },
  { t: "SHOP",  n: "Shopify Inc.", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "MSTR",  n: "MicroStrategy Incorporated", type: "Stock", cat: "Individual stock", tsla: 0, note: "A different billionaire with a different obsession. 0% Musk, 100% Saylor." },
  { t: "RKLB",  n: "Rocket Lab Corporation", type: "Stock", cat: "Individual stock", tsla: 0, aliases: ["rocket lab"], note: "The scrappy SpaceX competitor. Buying RKLB is arguably an anti-Musk position with upside." },
  { t: "ASTS",  n: "AST SpaceMobile, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, note: "Starlink's direct-to-phone rival. Musk-free and aimed directly at his satellites." },
  { t: "LMT",   n: "Lockheed Martin Corporation", type: "Stock", cat: "Individual stock", tsla: 0, note: "Half of ULA, SpaceX's launch rival. Legacy aerospace, zero Musk." },
  { t: "RTX",   n: "RTX Corporation", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "NOC",   n: "Northrop Grumman Corporation", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "GE",    n: "GE Aerospace", type: "Stock", cat: "Individual stock", tsla: 0 },
  { t: "CAT",   n: "Caterpillar Inc.", type: "Stock", cat: "Individual stock", tsla: 0, note: "Makes actual boring machines. The Boring Company wishes. 0%." },
  { t: "DE",    n: "Deere & Company", type: "Stock", cat: "Individual stock", tsla: 0, note: "Held for years by ARK's space ETF in lieu of actual SpaceX. Now free to just be a tractor company again." },
  { t: "BLK",   n: "BlackRock, Inc.", type: "Stock", cat: "Individual stock", tsla: 0, note: "Owns ~6% of Tesla, on behalf of index-fund holders like, statistically, you. Owning the asset manager itself: 0% Musk. The recursion is free." }
);

/* ---------- International coverage: Canada (TSX) + Europe (UCITS) ----------
   region: "CA" | "EU" (absent = US listing)
   mirror: US-listed fund tracking the same index, weights inherit from its
           daily verification (an S&P 500 tracker is the S&P 500 everywhere)
   aumB:   approximate assets in USD billions (for the Big Board ranking) */
FUNDS.push(
  /* ===== Canada. TSX-listed ===== */
  { t: "VFV",  region: "CA", n: "Vanguard S&P 500 Index ETF (CAD)", type: "ETF", cat: "S&P 500 index", tsla: 1.7, aumB: 13, mirror: "VOO", alts: ["XIU","XDV"], aliases: ["vfv.to"], note: "The S&P 500 in Canadian dollars, same index, same Tesla, no SpaceX (GAAP rule applies in every currency)." },
  { t: "XUS",  region: "CA", n: "iShares Core S&P 500 Index ETF (CAD)", type: "ETF", cat: "S&P 500 index", tsla: 1.7, aumB: 4, mirror: "VOO", alts: ["XIU","XDV"] },
  { t: "ZSP",  region: "CA", n: "BMO S&P 500 Index ETF (CAD)", type: "ETF", cat: "S&P 500 index", tsla: 1.7, aumB: 11, mirror: "VOO", alts: ["XIU","ZLB"] },
  { t: "XSP",  region: "CA", n: "iShares Core S&P 500 (CAD-Hedged)", type: "ETF", cat: "S&P 500 index (hedged)", tsla: 1.7, aumB: 7, mirror: "VOO", alts: ["XIU","XDV"], note: "Currency hedging removes the USD swings. The Musk stays fully unhedged." },
  { t: "HXS",  region: "CA", n: "Global X S&P 500 Index Corporate Class ETF", type: "ETF", cat: "S&P 500 index (swap)", tsla: 1.7, aumB: 3, mirror: "VOO", alts: ["XIU"], note: "Swap-based: you don't own the shares, you own a promise of their return, including the ~1.7% of that return that is Tesla. Synthetic Musk is still Musk." },
  { t: "VUN",  region: "CA", n: "Vanguard US Total Market Index ETF (CAD)", type: "ETF", cat: "Total US market index", tsla: 1.5, spacex: 0.25, aumB: 6, mirror: "VTI", alts: ["XIU","VDY"], note: "Tracks the same CRSP index as VTI, which means it inherited SpaceX on June 18 along with every VTI holder." },
  { t: "XUU",  region: "CA", n: "iShares Core S&P US Total Market ETF (CAD)", type: "ETF", cat: "Total US market index", tsla: 1.5, unverified: true, aumB: 3, mirror: "ITOT", alts: ["XIU"] },
  { t: "XQQ",  region: "CA", n: "iShares Nasdaq-100 Index ETF (CAD-Hedged)", type: "ETF", cat: "Nasdaq-100 index", tsla: 3.2, spacex: 1.3, aumB: 2.5, mirror: "QQQ", alts: ["XIU","ZLB"], aliases: ["xqq.to"] },
  { t: "ZQQ",  region: "CA", n: "BMO Nasdaq 100 Equity Hedged to CAD ETF", type: "ETF", cat: "Nasdaq-100 index", tsla: 3.2, spacex: 1.0, aumB: 2, mirror: "QQQ", alts: ["ZLB"] },
  { t: "ZNQ",  region: "CA", n: "BMO Nasdaq 100 Equity Index ETF (CAD)", type: "ETF", cat: "Nasdaq-100 index", tsla: 3.2, spacex: 1.0, aumB: 1.5, mirror: "QQQ", alts: ["ZLB"] },
  { t: "VEQT", region: "CA", n: "Vanguard All-Equity ETF Portfolio", type: "ETF", cat: "Global all-equity wrap", tsla: 0.95, spacex: 0.15, aumB: 6, alts: ["XIU","VCN"], aliases: ["veqt.to"], note: "The famous one-ticket portfolio: ~45% US market inside, so roughly 1.1% of your 'set and forget' is Musk enterprises. You set it; they forgot to mention that." },
  { t: "XEQT", region: "CA", n: "iShares Core Equity ETF Portfolio", type: "ETF", cat: "Global all-equity wrap", tsla: 0.75, aumB: 20, alts: ["XIU","XIC"], aliases: ["xeqt.to"] },
  { t: "VGRO", region: "CA", n: "Vanguard Growth ETF Portfolio (80/20)", type: "ETF", cat: "Global 80/20 wrap", tsla: 0.75, spacex: 0.12, aumB: 5, alts: ["XIC","VAB"] },
  { t: "XGRO", region: "CA", n: "iShares Core Growth ETF Portfolio (80/20)", type: "ETF", cat: "Global 80/20 wrap", tsla: 0.6, aumB: 3, alts: ["XIC","VAB"] },
  { t: "VBAL", region: "CA", n: "Vanguard Balanced ETF Portfolio (60/40)", type: "ETF", cat: "Global 60/40 wrap", tsla: 0.55, spacex: 0.09, aumB: 4, alts: ["XIC","VAB"] },
  { t: "XBAL", region: "CA", n: "iShares Core Balanced ETF Portfolio (60/40)", type: "ETF", cat: "Global 60/40 wrap", tsla: 0.45, aumB: 2, alts: ["XIC","VAB"] },
  { t: "XAW",  region: "CA", n: "iShares Core MSCI All Country World ex Canada", type: "ETF", cat: "Global ex-Canada index", tsla: 1.15, spacex: 0.18, aumB: 3.5, alts: ["XIC","XDV"], note: "Everything except Canada, which unfortunately includes the parts of everything that are Tesla and SpaceX." },
  { t: "VXC",  region: "CA", n: "Vanguard FTSE Global All Cap ex Canada", type: "ETF", cat: "Global ex-Canada index", tsla: 1.15, spacex: 0.18, aumB: 2, alts: ["XIC"] },
  { t: "XIU",  region: "CA", n: "iShares S&P/TSX 60 Index ETF", type: "ETF", cat: "Canadian large-cap index", tsla: 0, aumB: 10, aliases: ["xiu.to","tsx 60"], note: "Canada's founding ETF (1990) and 60 of its biggest companies. Banks, rails, energy, and precisely zero Musk. The most patriotic de-Musking available." },
  { t: "XIC",  region: "CA", n: "iShares Core S&P/TSX Capped Composite", type: "ETF", cat: "Canadian total market index", tsla: 0, aumB: 9, note: "The whole Canadian market. Musk companies are not listed on the TSX, a fact Ottawa has yet to advertise." },
  { t: "VCN",  region: "CA", n: "Vanguard FTSE Canada All Cap Index ETF", type: "ETF", cat: "Canadian total market index", tsla: 0, aumB: 5 },
  { t: "VDY",  region: "CA", n: "Vanguard FTSE Canadian High Dividend Yield", type: "ETF", cat: "Canadian dividend", tsla: 0, aumB: 2.5 },
  { t: "XDV",  region: "CA", n: "iShares Canadian Select Dividend Index ETF", type: "ETF", cat: "Canadian dividend", tsla: 0, aumB: 1.5 },
  { t: "ZLB",  region: "CA", n: "BMO Low Volatility Canadian Equity ETF", type: "ETF", cat: "Canadian low volatility", tsla: 0, aumB: 2.5, note: "Low-volatility Canadian equities: utilities, grocery stores, insurers. The temperamental opposite of a Musk portfolio." },
  { t: "ZEB",  region: "CA", n: "BMO Equal Weight Banks Index ETF", type: "ETF", cat: "Canadian banks", tsla: 0, aumB: 3, note: "The Big Six banks, equally weighted. Musk exposure: zero. Oligopoly exposure: total." },
  { t: "ZAG",  region: "CA", n: "BMO Aggregate Bond Index ETF", type: "ETF", cat: "Canadian bonds", tsla: 0, aumB: 5 },
  { t: "VAB",  region: "CA", n: "Vanguard Canadian Aggregate Bond Index ETF", type: "ETF", cat: "Canadian bonds", tsla: 0, aumB: 3 },

  /* ===== Europe. UCITS (LSE/Xetra listings) ===== */
  { t: "CSPX", region: "EU", n: "iShares Core S&P 500 UCITS ETF (Acc)", type: "ETF", cat: "S&P 500 index", tsla: 1.7, aumB: 110, mirror: "VOO", alts: ["MEUD","ISF"], aliases: ["cspx.l","sxr8"], note: "Europe's biggest S&P 500 fund. Same index as SPY, same 1.7% Tesla, same zero SpaceX, the GAAP rule doesn't respect borders either." },
  { t: "VUSA", region: "EU", n: "Vanguard S&P 500 UCITS ETF (Dist)", type: "ETF", cat: "S&P 500 index", tsla: 1.7, aumB: 55, mirror: "VOO", alts: ["MEUD","VUKE"], aliases: ["vusa.l"] },
  { t: "VUAA", region: "EU", n: "Vanguard S&P 500 UCITS ETF (Acc)", type: "ETF", cat: "S&P 500 index", tsla: 1.7, aumB: 30, mirror: "VOO", alts: ["MEUD","VUKE"] },
  { t: "IWDA", region: "EU", n: "iShares Core MSCI World UCITS ETF (Acc)", type: "ETF", cat: "MSCI World index", tsla: 1.2, spacex: 0.18, aumB: 110, alts: ["EXUS","MEUD"], aliases: ["iwda.l","swda","eunl"], note: "The default 'whole developed world' fund of European FIRE forums. ~70% US inside, and MSCI fast-tracked SPCX in June. Your world portfolio now includes rockets." },
  { t: "XDWD", region: "EU", n: "Xtrackers MSCI World UCITS ETF", type: "ETF", cat: "MSCI World index", tsla: 1.2, spacex: 0.18, aumB: 15, alts: ["EXUS","MEUD"] },
  { t: "VWCE", region: "EU", n: "Vanguard FTSE All-World UCITS ETF (Acc)", type: "ETF", cat: "Global index", tsla: 1.1, spacex: 0.16, aumB: 35, mirror: "VT", alts: ["EXUS","MEUD"], aliases: ["vwce.de"], note: "r/eupersonalfinance's favorite ticker. FTSE fast-tracked SPCX after the IPO, so 'VWCE and chill' now includes a small, permanent seat on the rocket." },
  { t: "VWRL", region: "EU", n: "Vanguard FTSE All-World UCITS ETF (Dist)", type: "ETF", cat: "Global index", tsla: 1.1, spacex: 0.16, aumB: 16, mirror: "VT", alts: ["EXUS","MEUD"] },
  { t: "SSAC", region: "EU", n: "iShares MSCI ACWI UCITS ETF (Acc)", type: "ETF", cat: "Global index", tsla: 1.1, spacex: 0.15, aumB: 8, mirror: "ACWI", alts: ["EXUS","MEUD"] },
  { t: "EQQQ", region: "EU", n: "Invesco Nasdaq-100 UCITS ETF", type: "ETF", cat: "Nasdaq-100 index", tsla: 3.2, spacex: 1.0, aumB: 9, mirror: "QQQ", alts: ["IUIT","MEUD"], aliases: ["eqqq.l"] },
  { t: "CNDX", region: "EU", n: "iShares Nasdaq 100 UCITS ETF (Acc)", type: "ETF", cat: "Nasdaq-100 index", tsla: 3.2, spacex: 1.0, aumB: 7, mirror: "QQQ", alts: ["IUIT","MEUD"] },
  { t: "ISF",  region: "EU", n: "iShares Core FTSE 100 UCITS ETF", type: "ETF", cat: "UK large-cap index", tsla: 0, aumB: 15, aliases: ["isf.l","ftse 100"], note: "A hundred British blue chips: oil, banks, pharma, and a company that still makes actual cigarettes. Zero Musk, he's never listed anything in London." },
  { t: "VUKE", region: "EU", n: "Vanguard FTSE 100 UCITS ETF", type: "ETF", cat: "UK large-cap index", tsla: 0, aumB: 5 },
  { t: "MEUD", region: "EU", n: "Amundi Stoxx Europe 600 UCITS ETF", type: "ETF", cat: "European index", tsla: 0, aumB: 10, aliases: ["stoxx 600"], note: "Six hundred European companies, zero Musk enterprises. The entire continent remains a certified Musk-free jurisdiction, equity-wise." },
  { t: "VEUR", region: "EU", n: "Vanguard FTSE Developed Europe UCITS ETF", type: "ETF", cat: "European index", tsla: 0, aumB: 3 },
  { t: "EXS1", region: "EU", n: "iShares Core DAX UCITS ETF", type: "ETF", cat: "German index", tsla: 0, aumB: 7, aliases: ["dax"], note: "Germany's 40 biggest. They build the cars Tesla competes with. 0% Musk, 100% Schadenfreude-ready." },
  { t: "EXUS", region: "EU", n: "Xtrackers MSCI World ex USA UCITS ETF", type: "ETF", cat: "Developed ex-US index", tsla: 0, aumB: 4, note: "The developed world minus the United States, which, since every Musk company is US-listed, means minus the Musk. The cleanest broad swap for a World fund." },
  { t: "IUIT", region: "EU", n: "iShares S&P 500 Information Technology UCITS", type: "ETF", cat: "Tech sector", tsla: 0, aumB: 12, note: "US tech via the S&P sector index: no Tesla (classified consumer discretionary) and no SPCX (not in the S&P). Accidentally Musk-free in two languages." },
  { t: "AGGG", region: "EU", n: "iShares Core Global Aggregate Bond UCITS", type: "ETF", cat: "Global bonds", tsla: 0, aumB: 8 },

  /* ===== Canada, second wave (mirror trackers + clean anchors) ===== */
  { t: "VSP",  region: "CA", n: "Vanguard S&P 500 Index ETF (CAD-Hedged)", type: "ETF", cat: "S&P 500 index (hedged)", tsla: 1.7, aumB: 4, mirror: "VOO", alts: ["XIU","XDV"] },
  { t: "ZUE",  region: "CA", n: "BMO S&P 500 Hedged to CAD Index ETF", type: "ETF", cat: "S&P 500 index (hedged)", tsla: 1.7, aumB: 2, mirror: "VOO", alts: ["XIU","ZLB"] },
  { t: "TPU",  region: "CA", n: "TD U.S. Equity Index ETF", type: "ETF", cat: "S&P 500 index", tsla: 1.7, aumB: 1.5, mirror: "VOO", alts: ["XIU"] },
  { t: "QQC",  region: "CA", n: "Invesco Nasdaq 100 Index ETF (CAD)", type: "ETF", cat: "Nasdaq-100 index", tsla: 3.2, spacex: 1.3, aumB: 1.5, mirror: "QQQ", alts: ["XIU","ZLB"] },
  { t: "HXQ",  region: "CA", n: "Global X Nasdaq-100 Index Corporate Class ETF", type: "ETF", cat: "Nasdaq-100 index (swap)", tsla: 3.2, spacex: 1.3, aumB: 1.5, mirror: "QQQ", alts: ["ZLB"] },
  { t: "VUS",  region: "CA", n: "Vanguard US Total Market (CAD-Hedged)", type: "ETF", cat: "Total US market index", tsla: 1.5, spacex: 0.25, aumB: 1.5, mirror: "VTI", alts: ["XIU","VDY"] },
  { t: "VGG",  region: "CA", n: "Vanguard US Dividend Appreciation Index ETF", type: "ETF", cat: "US dividend growth", tsla: 0, aumB: 3, mirror: "VIG", note: "Tracks the same dividend-growth index as VIG: ten straight years of raises required, Musk companies have zero. Musk-free in both currencies." },
  { t: "ZDY",  region: "CA", n: "BMO US Dividend ETF", type: "ETF", cat: "US dividend", tsla: 0, aumB: 1.5 },
  { t: "XWD",  region: "CA", n: "iShares MSCI World Index ETF", type: "ETF", cat: "MSCI World index", tsla: 1.25, spacex: 0.1, aumB: 1.5, mirror: "URTH", alts: ["XIC","XEF"] },
  { t: "ZEQT", region: "CA", n: "BMO All-Equity ETF", type: "ETF", cat: "Global all-equity wrap", tsla: 0.8, spacex: 0.1, aumB: 1, alts: ["XIU","XIC"] },
  { t: "VCIP", region: "CA", n: "Vanguard Conservative Income ETF Portfolio (20/80)", type: "ETF", cat: "Global 20/80 wrap", tsla: 0.2, spacex: 0.03, aumB: 0.6, alts: ["VAB"] },
  { t: "VCNS", region: "CA", n: "Vanguard Conservative ETF Portfolio (40/60)", type: "ETF", cat: "Global 40/60 wrap", tsla: 0.35, spacex: 0.06, aumB: 0.7, alts: ["VAB"] },
  { t: "XEF",  region: "CA", n: "iShares MSCI EAFE IMI Index ETF", type: "ETF", cat: "Developed ex-North America", tsla: 0, aumB: 7, note: "Europe, Japan, Australia, the developed world minus North America, which means minus the Musk." },
  { t: "ZEA",  region: "CA", n: "BMO MSCI EAFE Index ETF", type: "ETF", cat: "Developed ex-North America", tsla: 0, aumB: 5 },
  { t: "XEC",  region: "CA", n: "iShares MSCI Emerging Markets IMI ETF", type: "ETF", cat: "Emerging markets", tsla: 0, aumB: 2 },
  { t: "VEE",  region: "CA", n: "Vanguard FTSE Emerging Markets All Cap ETF", type: "ETF", cat: "Emerging markets", tsla: 0, aumB: 1.5 },
  { t: "ZCN",  region: "CA", n: "BMO S&P/TSX Capped Composite Index ETF", type: "ETF", cat: "Canadian total market index", tsla: 0, aumB: 9 },
  { t: "HXT",  region: "CA", n: "Global X S&P/TSX 60 Index Corporate Class ETF", type: "ETF", cat: "Canadian large-cap (swap)", tsla: 0, aumB: 4 },
  { t: "XEI",  region: "CA", n: "iShares S&P/TSX Composite High Dividend", type: "ETF", cat: "Canadian dividend", tsla: 0, aumB: 1.5 },
  { t: "ZDV",  region: "CA", n: "BMO Canadian Dividend ETF", type: "ETF", cat: "Canadian dividend", tsla: 0, aumB: 1 },
  { t: "ZWB",  region: "CA", n: "BMO Covered Call Canadian Banks ETF", type: "ETF", cat: "Canadian banks (covered call)", tsla: 0, aumB: 3, note: "Bank dividends with option income on top. The furthest thing from a rocket the TSX offers." },
  { t: "XBB",  region: "CA", n: "iShares Core Canadian Universe Bond ETF", type: "ETF", cat: "Canadian bonds", tsla: 0, aumB: 4 },
  { t: "XSB",  region: "CA", n: "iShares Core Canadian Short Term Bond ETF", type: "ETF", cat: "Canadian bonds", tsla: 0, aumB: 3 },
  { t: "VSB",  region: "CA", n: "Vanguard Canadian Short-Term Bond ETF", type: "ETF", cat: "Canadian bonds", tsla: 0, aumB: 1.5 },

  /* ===== Europe, second wave ===== */
  { t: "SPY5", region: "EU", n: "SPDR S&P 500 UCITS ETF", type: "ETF", cat: "S&P 500 index", tsla: 1.7, aumB: 15, mirror: "VOO", alts: ["MEUD","ISF"] },
  { t: "P500", region: "EU", n: "Invesco S&P 500 UCITS ETF (swap)", type: "ETF", cat: "S&P 500 index (synthetic)", tsla: 1.7, aumB: 25, mirror: "VOO", alts: ["MEUD","ISF"], note: "Synthetic replication: no shares held, same return delivered, including Tesla's slice. You can't swap your way out of the Musk." },
  { t: "VUAG", region: "EU", n: "Vanguard S&P 500 UCITS ETF (Acc, GBP)", type: "ETF", cat: "S&P 500 index", tsla: 1.7, aumB: 20, mirror: "VOO", alts: ["VUKE","MEUD"] },
  { t: "XSPX", region: "EU", n: "Xtrackers S&P 500 UCITS ETF", type: "ETF", cat: "S&P 500 index", tsla: 1.7, aumB: 10, mirror: "VOO", alts: ["MEUD"] },
  { t: "SWRD", region: "EU", n: "SPDR MSCI World UCITS ETF", type: "ETF", cat: "MSCI World index", tsla: 1.25, spacex: 0.1, aumB: 12, mirror: "URTH", alts: ["EXUS","MEUD"] },
  { t: "HMWO", region: "EU", n: "HSBC MSCI World UCITS ETF", type: "ETF", cat: "MSCI World index", tsla: 1.25, spacex: 0.1, aumB: 9, mirror: "URTH", alts: ["EXUS","MEUD"] },
  { t: "WEBN", region: "EU", n: "Amundi Prime All Country World UCITS ETF", type: "ETF", cat: "Global index", tsla: 1.1, spacex: 0.1, aumB: 4, alts: ["EXUS","MEUD"] },
  { t: "FWRA", region: "EU", n: "Invesco FTSE All-World UCITS ETF", type: "ETF", cat: "Global index", tsla: 1.1, spacex: 0.16, aumB: 3, mirror: "VT", alts: ["EXUS","MEUD"] },
  { t: "IMID", region: "EU", n: "SPDR MSCI ACWI IMI UCITS ETF", type: "ETF", cat: "Global index (all-cap)", tsla: 1.05, spacex: 0.14, aumB: 2, mirror: "ACWI", alts: ["EXUS"] },
  { t: "XNAS", region: "EU", n: "Xtrackers Nasdaq 100 UCITS ETF", type: "ETF", cat: "Nasdaq-100 index", tsla: 3.2, spacex: 1.3, aumB: 3, mirror: "QQQ", alts: ["IUIT","MEUD"] },
  { t: "VNRT", region: "EU", n: "Vanguard FTSE North America UCITS ETF", type: "ETF", cat: "North America index", tsla: 1.5, spacex: 0.22, aumB: 3, mirror: "VTI", alts: ["VERX","MEUD"] },
  { t: "EXSA", region: "EU", n: "iShares STOXX Europe 600 UCITS ETF", type: "ETF", cat: "European index", tsla: 0, aumB: 9 },
  { t: "VMID", region: "EU", n: "Vanguard FTSE 250 UCITS ETF", type: "ETF", cat: "UK mid-cap index", tsla: 0, aumB: 2 },
  { t: "VERX", region: "EU", n: "Vanguard FTSE Developed Europe ex-UK UCITS", type: "ETF", cat: "European index", tsla: 0, aumB: 3 },
  { t: "VHYL", region: "EU", n: "Vanguard FTSE All-World High Dividend Yield", type: "ETF", cat: "Global dividend", tsla: 0, aumB: 5, note: "High-yield screen: no dividend, no entry. The Musk empire remains yield-free and therefore absent." },
  { t: "EIMI", region: "EU", n: "iShares Core MSCI EM IMI UCITS ETF", type: "ETF", cat: "Emerging markets", tsla: 0, aumB: 20, note: "Emerging markets, home of BYD, Tesla's fiercest rival. Zero Musk, maximum competition." },
  { t: "VFEM", region: "EU", n: "Vanguard FTSE Emerging Markets UCITS ETF", type: "ETF", cat: "Emerging markets", tsla: 0, aumB: 2.5 },
  { t: "VAGP", region: "EU", n: "Vanguard Global Aggregate Bond UCITS (GBP-H)", type: "ETF", cat: "Global bonds", tsla: 0, aumB: 1.5 },
  { t: "SUSW", region: "EU", n: "iShares MSCI World SRI UCITS ETF", type: "ETF", cat: "ESG / SRI screened", tsla: 1.9, unverified: true, aumB: 5, alts: ["EXUS","MEUD"], note: "Yes, the socially-responsible fund can hold MORE Tesla than the regular one. MSCI's SRI methodology historically loved EVs. ESG committees and Musk have a complicated relationship; check the live data." }
);

/* US anchor for MSCI World mirrors (verified daily like any US ETF) */
FUNDS.push(
  { t: "URTH", n: "iShares MSCI World ETF", type: "ETF", cat: "MSCI World index", tsla: 1.25, spacex: 0.1, aumB: 4, alts: ["EXUS","VEA"], note: "The developed world in one US-listed ticker. ~70% of it American, Musk included since MSCI fast-tracked SPCX in June." }
);

/* ---------- Analytics Annex data (curated, approximate, labeled as such) ---------- */
const ANALYTICS = {
  /* Tesla's weight in the S&P 500, approximate month-end values */
  tslaWeight: {
    title: "Tesla’s weight in the S&P 500",
    sub: "Approximate month-end index weight since inclusion, %",
    points: [
      ["Jan 2021", 1.6], ["Nov 2021", 2.4], ["Jun 2022", 1.8], ["Dec 2022", 1.0],
      ["Jul 2023", 1.9], ["Dec 2023", 1.6], ["Jul 2024", 1.3], ["Dec 2024", 2.3],
      ["Apr 2025", 1.6], ["Dec 2025", 2.0], ["Jul 2026", 1.71],
    ],
    note: "Tesla joined the index in December 2020. Every index-fund dollar tracks these swings automatically, nobody asks you.",
  },
  /* Cumulative estimated forced passive buying of SPCX after the IPO */
  spcxFlows: {
    title: "Index funds force-buying SpaceX",
    sub: "Cumulative estimated passive inflows into SPCX from index inclusions, $B",
    points: [
      ["Jun 12", 0, "IPO day, no index owns it yet"],
      ["Jun 18", 5.5, "CRSP total market adds (VTI, VTSAX)"],
      ["Jun 23", 8.5, "MSCI fast-entry (ACWI, global funds)"],
      ["Jun 29", 15.0, "Russell 1000 reconstitution (IWB, IWF)"],
      ["Jul 7", 19.3, "Nasdaq-100 fast-track (QQQ, QQQM)"],
    ],
    note: "Analyst estimates, midpoints of published ranges. Next scheduled wave: S&P Total Market, September 2026. The S&P 500 itself remains closed (GAAP rule).",
  },
  /* Combined Musk exposure by major index, as of ASOF */
  indexBars: {
    title: "Musk exposure by index",
    sub: "Combined Tesla + SpaceX weight, %, as of " + "July 2026",
    bars: [
      ["Nasdaq-100 (QQQ)", 4.2], ["Russell 1000 Growth (IWF)", 3.4], ["Russell 1000 (IWB)", 1.9],
      ["CRSP Total Market (VTI)", 1.75], ["S&P 500 (SPY, VOO)", 1.71],
      ["Equal-weight S&P (RSP)", 0.2], ["Dow Jones (DIA)", 0], ["MSCI EAFE, int’l (EFA)", 0],
    ],
    note: "The S&P 500 number is all Tesla, zero SpaceX until the committee relents. The Dow remains a Musk-free heritage site.",
  },
};

/* Curated musk-free picks shown on the homepage */
const CLEAN_PICKS = ["DIA", "SCHD", "VGT", "XLK", "VTV", "VIG", "NOBL", "USMV", "VYM", "VXUS", "EXUS", "EIMI", "XIU", "MEUD", "IWM", "BND", "GLD", "SGOV"];
const DIRTY_LEADERBOARD = ["TSLL", "TSLA", "SPCX", "BPTRX", "BFGFX", "XLY", "ARKK", "ARKVX", "DXYZ", "VCR", "TQQQ", "XOVR", "ARKQ", "QQQ"];
const POPULAR_CHECKS = ["SPY", "VOO", "QQQ", "SPCX", "VTI", "ARKK", "XLY", "SCHD", "DIA", "TSLA"];
