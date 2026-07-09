#!/usr/bin/env node
/* ============================================================
   expand-intl.mjs — auto-registration of the iShares CA + UCITS
   catalogs. The product screeners expose every fund with ticker,
   name, asset class, AUM and product URL; each product page
   serves a full daily holdings JSON. Every fund not already in
   the curated registry gets registered with an issuer-grade
   Musk scan (fund-of-funds resolved by look-through).

   Writes data.gen.intl.js (GEN_INTL array, loaded by the site).
   Run: node scripts/expand-intl.mjs
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
    fx: 0.73, // CAD → USD, rough
  },
  EU: {
    screener: "https://www.ishares.com/uk/individual/en/product-screener/product-screener-v3.1.jsn?dcrPath=/templatedata/config/product-screener-v3/data/en/uk/product-screener/ishares-product-screener-backend-config&siteEntryPassthrough=true",
    base: "https://www.ishares.com",
    ajaxNode: "1506575576011",
    fx: 1.0, // UCITS list AUM currency varies per fund; treated as ~USD-scale
  },
};

const dataSrc = fs.readFileSync(path.join(root, "data.js"), "utf8");
const { FUNDS } = (0, eval)(`(function(){ ${dataSrc}; return { FUNDS }; })()`);
const byTicker = {};
FUNDS.forEach((f) => (byTicker[f.t] = f));
let live = null;
try { live = JSON.parse(fs.readFileSync(path.join(root, "data.live.json"), "utf8")); } catch {}
function exposureOf(t) {
  const f = byTicker[t];
  if (!f) return null;
  const rec = live && live.funds && live.funds[t];
  return {
    tsla: rec && rec.tsla > 0 ? rec.tsla : f.tsla || 0,
    spcx: rec && rec.spcx > 0 ? rec.spcx : f.spacex || 0,
  };
}

async function getJSON(url) {
  try {
    const r = await fetch(url, UA);
    if (!r.ok) return null;
    return JSON.parse((await r.text()).replace(/^﻿/, ""));
  } catch { return null; }
}

function rowWeight(row) {
  for (const cell of row) {
    if (cell && typeof cell === "object" && typeof cell.raw === "number" && cell.raw > -100 && cell.raw <= 100) return cell.raw;
  }
  return 0;
}
function scanRows(rows) {
  let tsla = 0, spcx = 0;
  for (const row of rows) {
    const sym = String(row[0] || "").toUpperCase();
    const name = String(row[1] || "").toLowerCase();
    const w = rowWeight(row);
    if (sym === "TSLA" || /\btesla\b/.test(name)) { tsla += w; continue; }
    if (sym === "SPCX" || /space\s?x|space exploration/.test(name)) { spcx += w; continue; }
    const under = byTicker[sym];
    if (under && under.type !== "Stock" && w > 1) {
      const ex = exposureOf(sym);
      if (ex) { tsla += (w * ex.tsla) / 100; spcx += (w * ex.spcx) / 100; }
    }
  }
  return { tsla: +tsla.toFixed(2), spcx: +spcx.toFixed(2) };
}

const gen = [];
const seen = new Set(FUNDS.map((f) => f.t));
let scanned = 0, noHold = 0;

for (const [region, site] of Object.entries(SITES)) {
  const screener = await getJSON(site.screener);
  if (!screener) { console.error(`${region}: screener failed`); continue; }
  const products = Object.values(screener).filter(
    (r) => r && typeof r === "object" && r.localExchangeTicker && r.productPageUrl
  );
  console.log(`${region}: ${products.length} products in catalog`);
  // prefer larger funds when tickers collide across listings
  products.sort((a, b) => ((b.totalNetAssets?.r || 0) - (a.totalNetAssets?.r || 0)));
  for (const p of products) {
    const t = String(p.localExchangeTicker).toUpperCase().replace(/\s+/g, "");
    if (!/^[A-Z0-9.\-]{1,10}$/.test(t) || seen.has(t)) continue;
    seen.add(t);
    const aumRaw = p.totalNetAssets?.r || p.totalNetAssetsFund?.r || 0;
    const entry = {
      t: t,
      region: region,
      n: p.fundName || t,
      cat: [p.aladdinAssetClass, p.aladdinSubAssetClass].filter(Boolean).join(" · ") || "Fund",
      aumB: +((aumRaw * site.fx) / 1e9).toFixed(2),
    };
    const hold = await getJSON(`${site.base}${p.productPageUrl}/${site.ajaxNode}.ajax?fileType=json&tab=all`);
    await sleep(200);
    if (hold && hold.aaData && hold.aaData.length) {
      const scan = scanRows(hold.aaData);
      entry.tsla = scan.tsla;
      entry.spacex = scan.spcx;
      scanned++;
    } else {
      entry.tsla = 0; entry.spacex = 0; entry.noscan = 1;
      noHold++;
    }
    gen.push(entry);
    if ((scanned + noHold) % 100 === 0) console.log(`  progress: ${scanned + noHold} (${scanned} scanned)`);
  }
}

const asof = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(root, "data.gen.intl.js"),
  `/* AUTO-GENERATED by scripts/expand-intl.mjs on ${asof} — iShares CA + UCITS catalogs,
   issuer-grade full-holdings scans. Rerun the script; don't hand-edit. */
const GEN_INTL_ASOF = "${asof}";
const GEN_INTL = ` + JSON.stringify(gen) + ";\n"
);
const musky = gen.filter((g) => g.tsla + g.spacex > 0.25);
console.log(`wrote data.gen.intl.js: ${gen.length} funds (${scanned} scanned, ${noHold} no-feed) — musk-positive: ${musky.length}`);
console.log("top musky:", musky.sort((a, b) => (b.tsla + b.spacex) - (a.tsla + a.spacex)).slice(0, 10).map((g) => `${g.t}(${g.region}) ${(g.tsla + g.spacex).toFixed(1)}%`).join(", "));
