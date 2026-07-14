#!/usr/bin/env node
/* ============================================================
   refresh-data.mjs — the nightly data pipeline
   For every scannable fund in the registry, pulls current
   holdings + overview from the public market-data API, scans for
   Musk positions, and writes:
     data.live.json  — machine-verified overlay the site loads at boot
     changelog.json  — diffed exposure-change events (newest first)
     feed.xml        — RSS feed of those events ("SPCX Watch")
   Run:  node scripts/refresh-data.mjs
   CI:   .github/workflows/refresh.yml runs this nightly.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getHoldings } from "./lib-holdings.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const dataSrc = fs.readFileSync(path.join(root, "data.js"), "utf8");
const { FUNDS } = (0, eval)(`(function(){ ${dataSrc}; return { FUNDS }; })()`);
/* machine-generated extension (see expand-registry.mjs) — scan those too */
let GEN = [];
try {
  const genSrc = fs.readFileSync(path.join(root, "data.gen.js"), "utf8");
  GEN = (0, eval)(`(function(){ ${genSrc}; return GEN_FUNDS; })()`);
} catch {}
const curated = new Set(FUNDS.map((f) => f.t));
const ALLFUNDS = FUNDS.concat(GEN.filter((g) => !curated.has(g.t)).map((g) => ({ t: g.t, n: g.n, type: "ETF", cat: g.cat })));

function muskScan(rows) {
  let tsla = 0, spcx = 0, coverage = 0;
  for (const h of rows || []) {
    const sym = String(h.s || "").replace(/^\$/, "").toUpperCase();
    const name = String(h.n || "").toLowerCase();
    const w = parseFloat(String(h.as || "").replace("%", "")) || 0;
    coverage += w;
    if (sym === "TSLA" || /\btesla\b/.test(name)) tsla += w;
    else if (sym === "SPCX" || /space\s?x|space exploration/.test(name)) spcx += w;
  }
  return { tsla: +tsla.toFixed(2), spcx: +spcx.toFixed(2), coverage: +coverage.toFixed(1) };
}

const scannable = ALLFUNDS.filter((f) => (f.type === "ETF" || f.type === "Closed-end fund") && !f.special && !f.region);
console.log(`scanning ${scannable.length} funds…`);

const out = { generated: new Date().toISOString(), source: "stockanalysis.com top-25 holdings scan", funds: {} };
let ok = 0, fail = 0;
for (const f of scannable) {
  const hold = await getHoldings(f.t);
  if (!hold || !hold.holdings) { fail++; await sleep(120); continue; }
  const scan = muskScan(hold.holdings);
  out.funds[f.t] = {
    tsla: scan.tsla, spcx: scan.spcx, cov: scan.coverage,
    aum: hold.aum, er: null,
  };
  ok++;
  await sleep(120);
}
console.log(`scanned ok=${ok} fail=${fail}`);
if (ok < scannable.length * 0.5) {
  console.error("More than half the scans failed — refusing to overwrite good data.");
  process.exit(1);
}

/* ---- SEC N-PORT pass: mutual & interval funds (full portfolios, quarterly) ----
   The market-data API can't see mutual-fund holdings; the SEC can. N-PORT
   filings list every position with % of net assets. Complete data, so here a
   zero IS affirmative (as of the filing's quarter-end). */
const SEC_UA = { headers: { "User-Agent": "muskfree-certified research contact@muskfree.example" } };
async function secJSON(url) {
  try { const r = await fetch(url, SEC_UA); return r.ok ? r.json() : null; } catch { return null; }
}
async function secText(url) {
  try { const r = await fetch(url, SEC_UA); return r.ok ? r.text() : null; } catch { return null; }
}

const mfFunds = FUNDS.filter((f) => (f.type === "Mutual fund" || f.type === "Interval fund") && !f.special && !f.region);
console.log(`N-PORT pass: ${mfFunds.length} mutual/interval funds…`);
const mfMap = await secJSON("https://www.sec.gov/files/company_tickers_mf.json");
const bySymbol = {};
if (mfMap && mfMap.data) for (const r of mfMap.data) bySymbol[r[3]] = { cik: r[0], series: r[1] };

function nportMusk(xml) {
  let tsla = 0, spcx = 0, fundLike = 0;
  for (const m of xml.matchAll(/<invstOrSec>([\s\S]*?)<\/invstOrSec>/g)) {
    const blk = m[1];
    const name = (blk.match(/<name>([\s\S]*?)<\/name>/) || [, ""])[1];
    const pct = parseFloat((blk.match(/<pctVal>([\s\S]*?)<\/pctVal>/) || [, "0"])[1]) || 0;
    if (/\btesla\b/i.test(name)) tsla += pct;
    else if (/space\s?x|space exploration/i.test(name)) spcx += pct;
    /* issuerCat RF = registered fund — fund-of-funds hold other funds, not stocks */
    if (/<issuerCat>RF<\/issuerCat>/.test(blk) || /\b(index fund|investor shares|admiral|instl|institutional shares|etf)\b/i.test(name)) fundLike += pct;
  }
  return { tsla: +tsla.toFixed(2), spcx: +spcx.toFixed(2), fundLike: fundLike };
}

const startdt = new Date(Date.now() - 210 * 86400000).toISOString().slice(0, 10);
const enddt = new Date().toISOString().slice(0, 10);
let nportOk = 0, nportFail = 0;
for (const f of mfFunds) {
  const info = bySymbol[f.t];
  if (!info) { nportFail++; continue; }
  const search = await secJSON(
    `https://efts.sec.gov/LATEST/search-index?q=%22${info.series}%22&forms=NPORT-P&dateRange=custom&startdt=${startdt}&enddt=${enddt}`
  );
  await sleep(150);
  const hits = search?.hits?.hits || [];
  if (!hits.length) { nportFail++; continue; }
  hits.sort((a, b) => (a._source.file_date < b._source.file_date ? 1 : -1));
  const top = hits[0];
  const adsh = top._id.split(":")[0].replace(/-/g, "");
  const cik = parseInt(top._source.ciks[0], 10);
  const xml = await secText(`https://www.sec.gov/Archives/edgar/data/${cik}/${adsh}/primary_doc.xml`);
  await sleep(150);
  if (!xml || xml.indexOf(`<seriesId>${info.series}</seriesId>`) === -1) { nportFail++; continue; }
  const scan = nportMusk(xml);
  /* Fund-of-funds: the portfolio is other funds, so a zero here says nothing
     about look-through Musk exposure. Keep the registry estimate; no false
     verification badge. */
  if (scan.fundLike > 30 && scan.tsla + scan.spcx === 0) { nportFail++; await sleep(50); continue; }
  out.funds[f.t] = {
    tsla: scan.tsla, spcx: scan.spcx, cov: 100,
    src: "nport", asof: top._source.period_ending || null,
    aum: null, er: null,
  };
  nportOk++;
}
console.log(`N-PORT ok=${nportOk} fail=${nportFail}`);

/* ---- diff vs previous run → changelog events ---- */
const livePath = path.join(root, "data.live.json");
const logPath = path.join(root, "changelog.json");
let prev = null, log = [];
try { prev = JSON.parse(fs.readFileSync(livePath, "utf8")); } catch {}
try { log = JSON.parse(fs.readFileSync(logPath, "utf8")); } catch {}

const today = out.generated.slice(0, 10);
const events = [];
if (prev && prev.funds) {
  for (const [t, cur] of Object.entries(out.funds)) {
    const was = prev.funds[t];
    if (!was) continue;
    const curTotal = cur.tsla + cur.spcx, wasTotal = was.tsla + was.spcx;
    const fund = ALLFUNDS.find((f) => f.t === t);
    const name = fund ? fund.n : t;
    if (was.spcx === 0 && cur.spcx > 0.1) {
      events.push({ date: today, t, type: "spcx-added", from: 0, to: cur.spcx, text: `${t} (${name}) now shows SpaceX at ${cur.spcx}% — SPCX has entered this fund's visible holdings.` });
    } else if (was.spcx > 0.1 && cur.spcx === 0) {
      events.push({ date: today, t, type: "spcx-removed", from: was.spcx, to: 0, text: `${t} (${name}) no longer shows SpaceX in its top holdings (was ${was.spcx}%).` });
    } else if (Math.abs(curTotal - wasTotal) >= 0.5) {
      events.push({ date: today, t, type: "shift", from: +wasTotal.toFixed(2), to: +curTotal.toFixed(2), text: `${t} (${name}) Musk exposure moved ${wasTotal.toFixed(1)}% → ${curTotal.toFixed(1)}%.` });
    }
  }
}
if (events.length) {
  log = events.concat(log).slice(0, 300);
  fs.writeFileSync(logPath, JSON.stringify(log, null, 1));
  console.log(`${events.length} changelog events`);
} else if (!fs.existsSync(logPath)) {
  fs.writeFileSync(logPath, "[]");
}

fs.writeFileSync(livePath, JSON.stringify(out));

/* ---- RSS feed ---- */
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const SITE = (process.env.SITE_URL || "https://muskfree.example").replace(/\/$/, "");
const items = log.slice(0, 50).map((e) => `  <item>
   <title>${esc(e.t)}: ${esc(e.type === "spcx-added" ? "SpaceX detected" : e.type === "spcx-removed" ? "SpaceX exited" : "exposure shift")}</title>
   <description>${esc(e.text)}</description>
   <link>${SITE}/f/${encodeURIComponent(e.t)}.html</link>
   <guid isPermaLink="false">${esc(e.date + "-" + e.t + "-" + e.type)}</guid>
   <pubDate>${new Date(e.date + "T12:00:00Z").toUTCString()}</pubDate>
  </item>`).join("\n");
fs.writeFileSync(path.join(root, "feed.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
 <channel>
  <title>SPCX Watch — Musk-Free Certified</title>
  <link>${SITE}</link>
  <description>Daily-scanned changes in Tesla/SpaceX exposure across ${scannable.length} funds. Know the moment SPCX lands in yours.</description>
${items}
 </channel>
</rss>
`);
console.log("wrote data.live.json, changelog.json, feed.xml");
