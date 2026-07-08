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

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const API = "https://api.stockanalysis.com/api";
const UA = { headers: { "User-Agent": "muskfree-certified/1.0 (nightly registry verification)" } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const dataSrc = fs.readFileSync(path.join(root, "data.js"), "utf8");
const { FUNDS } = (0, eval)(`(function(){ ${dataSrc}; return { FUNDS }; })()`);

async function getJSON(p) {
  try {
    const r = await fetch(API + p, UA);
    if (!r.ok) return null;
    const j = await r.json();
    return j && j.status === 200 ? j.data : null;
  } catch { return null; }
}

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

const scannable = FUNDS.filter((f) => (f.type === "ETF" || f.type === "Closed-end fund") && !f.special);
console.log(`scanning ${scannable.length} funds…`);

const out = { generated: new Date().toISOString(), source: "stockanalysis.com top-25 holdings scan", funds: {} };
let ok = 0, fail = 0;
for (const f of scannable) {
  const [hold, ov] = await Promise.all([getJSON(`/symbol/e/${f.t}/holdings`), getJSON(`/symbol/e/${f.t}/overview`)]);
  if (!hold || !hold.holdings) { fail++; await sleep(120); continue; }
  const scan = muskScan(hold.holdings);
  out.funds[f.t] = {
    tsla: scan.tsla, spcx: scan.spcx, cov: scan.coverage,
    aum: ov?.aum || null, er: ov?.expenseRatio || null,
  };
  ok++;
  await sleep(120);
}
console.log(`scanned ok=${ok} fail=${fail}`);
if (ok < scannable.length * 0.5) {
  console.error("More than half the scans failed — refusing to overwrite good data.");
  process.exit(1);
}

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
    const fund = FUNDS.find((f) => f.t === t);
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
