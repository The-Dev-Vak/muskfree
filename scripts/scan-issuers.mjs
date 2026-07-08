#!/usr/bin/env node
/* ============================================================
   scan-issuers.mjs — issuer-direct verification for CA/EU funds
   BlackRock/iShares publishes full daily holdings JSON for every
   fund on its product pages. This script discovers product URLs
   via the (undocumented) screener config, pulls holdings for the
   registry's Canadian + European iShares funds, and writes
   data.intl.json — an overlay the site loads at boot.

   Direct positions are scanned for Tesla/SpaceX by name; fund-of-
   funds wraps (XEQT etc.) are resolved by LOOK-THROUGH into the
   registry's exposure numbers for their underlying funds.

   Run: node scripts/scan-issuers.mjs
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const UA = { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36" } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SITES = {
  CA: {
    screener: "https://www.blackrock.com/ca/investors/en/product-screener/product-screener-v3.1.jsn?dcrPath=/templatedata/config/product-screener-v3/data/en/ca-one/product-screener-backend-config&siteEntryPassthrough=true",
    base: "https://www.blackrock.com",
    ajaxNode: "1464253357814",
  },
  EU: {
    screener: "https://www.ishares.com/uk/individual/en/product-screener/product-screener-v3.1.jsn?dcrPath=/templatedata/config/product-screener-v3/data/en/uk/product-screener/ishares-product-screener-backend-config&siteEntryPassthrough=true",
    base: "https://www.ishares.com",
    ajaxNode: "1506575576011",
  },
};

/* UK lines sometimes list under a sibling ticker (IWDA trades as SWDA on LSE) */
const TICKER_SYNONYMS = { IWDA: ["IWDA", "SWDA"], SSAC: ["SSAC", "ISAC"] };
/* CA wrap sleeves that aren't registry tickers → their US registry twin */
const SLEEVE_ALIASES = { XTOT: "ITOT", XUSC: "ITOT" };

const dataSrc = fs.readFileSync(path.join(root, "data.js"), "utf8");
const { FUNDS } = (0, eval)(`(function(){ ${dataSrc}; return { FUNDS }; })()`);
const byTicker = {};
FUNDS.forEach((f) => (byTicker[f.t] = f));

/* freshest exposure per fund: nightly overlay beats registry statics */
let live = null;
try { live = JSON.parse(fs.readFileSync(path.join(root, "data.live.json"), "utf8")); } catch {}
function exposureOf(t) {
  const f = byTicker[t];
  if (!f) return null;
  const rec = live && live.funds && live.funds[t];
  const tsla = rec && rec.tsla > 0 ? rec.tsla : f.tsla || 0;
  const spcx = rec && rec.spcx > 0 ? rec.spcx : f.spacex || 0;
  return { tsla, spcx };
}

async function getJSON(url) {
  try {
    const r = await fetch(url, UA);
    if (!r.ok) return null;
    const txt = (await r.text()).replace(/^﻿/, "");
    return JSON.parse(txt);
  } catch { return null; }
}

function rowWeight(row) {
  // weight = the numeric cell whose raw value is a sane percentage
  let candidates = [];
  for (const cell of row) {
    if (cell && typeof cell === "object" && typeof cell.raw === "number") candidates.push(cell.raw);
  }
  for (const v of candidates) if (v > -100 && v <= 100) return v;
  return 0;
}

function scanRows(rows) {
  let tsla = 0, spcx = 0, lookthrough = false;
  for (const row of rows) {
    const sym = String(row[0] || "").toUpperCase();
    const name = String(row[1] || "").toLowerCase();
    const w = rowWeight(row);
    if (sym === "TSLA" || /\btesla\b/.test(name)) { tsla += w; continue; }
    if (sym === "SPCX" || /space\s?x|space exploration/.test(name)) { spcx += w; continue; }
    /* fund-of-funds sleeve → look through to the underlying fund's exposure */
    const under = byTicker[sym] ? sym : SLEEVE_ALIASES[sym];
    if (under && w > 1) {
      const ex = exposureOf(under);
      if (ex) { tsla += (w * ex.tsla) / 100; spcx += (w * ex.spcx) / 100; lookthrough = true; }
    }
  }
  return { tsla: +tsla.toFixed(2), spcx: +spcx.toFixed(2), lookthrough };
}

const out = { generated: new Date().toISOString(), source: "issuer daily holdings files (iShares/BlackRock)", funds: {} };
let ok = 0, miss = 0;

for (const [region, site] of Object.entries(SITES)) {
  const screener = await getJSON(site.screener);
  if (!screener) { console.error(`${region}: screener fetch failed`); continue; }
  const urlByTicker = {};
  for (const rec of Object.values(screener)) {
    if (rec && typeof rec === "object" && rec.localExchangeTicker && rec.productPageUrl) {
      urlByTicker[String(rec.localExchangeTicker).toUpperCase()] = rec.productPageUrl;
    }
  }
  const targets = FUNDS.filter((f) => f.region === region);
  console.log(`${region}: screener has ${Object.keys(urlByTicker).length} products; registry has ${targets.length} ${region} funds`);
  for (const f of targets) {
    const names = TICKER_SYNONYMS[f.t] || [f.t];
    const pageUrl = names.map((n) => urlByTicker[n]).find(Boolean);
    if (!pageUrl) { miss++; continue; } // not an iShares fund (Vanguard/BMO etc.)
    const hold = await getJSON(`${site.base}${pageUrl}/${site.ajaxNode}.ajax?fileType=json&tab=all`);
    await sleep(250);
    if (!hold || !hold.aaData || !hold.aaData.length) { miss++; continue; }
    const scan = scanRows(hold.aaData);
    out.funds[f.t] = {
      tsla: scan.tsla, spcx: scan.spcx,
      src: "issuer", lt: scan.lookthrough ? 1 : 0,
      asof: out.generated.slice(0, 10),
    };
    ok++;
    console.log(`  ${f.t}: tsla ${scan.tsla}% spcx ${scan.spcx}%${scan.lookthrough ? " (look-through)" : ""}`);
  }
}

fs.writeFileSync(path.join(root, "data.intl.json"), JSON.stringify(out));
console.log(`wrote data.intl.json — verified ${ok}, not-iShares/missing ${miss}`);
