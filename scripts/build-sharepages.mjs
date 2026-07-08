#!/usr/bin/env node
/* ============================================================
   build-sharepages.mjs
   Pre-renders one static HTML stub per registry ticker (f/T.html)
   with fund-specific OG/Twitter meta + a redirect to the SPA
   route, and one OG card SVG per ticker (og/T.svg). PNG
   conversion is done by the caller (see scripts/build-og-pngs.sh)
   because the rasterizer differs per platform.

   Usage: SITE_URL=https://yourdomain.com node scripts/build-sharepages.mjs
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SITE = (process.env.SITE_URL || "https://muskfree.example").replace(/\/$/, "");

/* ---- load the registry (plain-JS consts) ---- */
const dataSrc = fs.readFileSync(path.join(root, "data.js"), "utf8");
const { FUNDS, ASOF } = (0, eval)(`(function(){ ${dataSrc}; return { FUNDS, ASOF }; })()`);

/* ---- verdict logic (kept in sync with app.js) ---- */
const exposure = (f) => (f.tsla || 0) + (f.spacex || 0) + (f.xai || 0) + (f.other || 0);
function verdict(f) {
  if (f.special === "private") return { stamp: "100% MUSK", sub: "PRIVATELY HELD", color: "#C8102E" };
  if (f.special === "doge") return { stamp: "SPIRITUALLY MUSK", sub: "UNQUANTIFIABLE", color: "#5B2A86" };
  const x = exposure(f);
  if (x < 0) return { stamp: "ANTI-MUSK", sub: "SHORTS THE MUSK", color: "#5B2A86" };
  if (x === 0) return { stamp: "MUSK-FREE", sub: "CERTIFIED · NO ELON DETECTED", color: "#0E6B37" };
  if (x < 0.5) return { stamp: "TRACE MUSK", sub: "HOMEOPATHIC LEVELS", color: "#8A7B1E" };
  if (x < 5) return { stamp: "CONTAINS MUSK", sub: "ELON DETECTED", color: "#C8102E" };
  if (x < 15) return { stamp: "HIGH MUSK CONTENT", sub: "SUBSTANTIAL ELON WITHIN", color: "#C8102E" };
  if (x < 85) return { stamp: "EXTREMELY MUSKY", sub: "APPROACH WITH CAUTION", color: "#C8102E" };
  if (x <= 100) return { stamp: "PURE UNCUT MUSK", sub: "THIS IS THE MUSK", color: "#C8102E" };
  return { stamp: "LEVERAGED MUSK", sub: "MORE MUSK THAN MONEY", color: "#C8102E" };
}
const fmtPct = (x) => (x === 0 ? "0.0%" : (Math.abs(x) < 1 ? x.toFixed(1) : x % 1 === 0 ? x.toFixed(0) : x.toFixed(1)) + "%");
const escXml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---- HTML stub ---- */
function stubHTML(f) {
  const v = verdict(f);
  const x = exposure(f);
  const pct = f.special ? "" : ` — ${fmtPct(x)} Musk exposure`;
  const title = `${f.t}: ${v.stamp} — Musk-Free Certified™`;
  const desc = f.special
    ? `${f.n}: ${v.stamp}. Check any ticker for Elon Musk exposure — free, 2 seconds, official-looking stamp included.`
    : `${f.n}${pct}. ${x > 0 ? `Invest $10,000 and ~$${Math.abs(Math.round(x * 100)).toLocaleString("en-US")} of it is Musk enterprises.` : "No Tesla, no SpaceX, no Musk. Certified."} Check any ticker free.`;
  const og = `${SITE}/og/${encodeURIComponent(f.t)}.png`;
  const page = `${SITE}/f/${encodeURIComponent(f.t)}.html`;
  const spa = `../#/f/${encodeURIComponent(f.t)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escXml(title)}</title>
<meta name="description" content="${escXml(desc)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${escXml(page)}" />
<meta property="og:title" content="${escXml(title)}" />
<meta property="og:description" content="${escXml(desc)}" />
<meta property="og:image" content="${escXml(og)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escXml(title)}" />
<meta name="twitter:description" content="${escXml(desc)}" />
<meta name="twitter:image" content="${escXml(og)}" />
<meta http-equiv="refresh" content="0;url=${escXml(spa)}" />
<link rel="canonical" href="${escXml(page)}" />
<script>location.replace(${JSON.stringify(spa)});</script>
</head>
<body>
<p><a href="${escXml(spa)}">Continue to the ${escXml(f.t)} certificate →</a></p>
</body>
</html>
`;
}

/* ---- OG card SVG (square canvas for the macOS qlmanage trick;
        design band is 1200x630 centered — crop after raster) ---- */
function ogSVG(f) {
  const v = verdict(f);
  const x = exposure(f);
  const pctBig = f.special ? "" : fmtPct(x);
  const name = f.n.length > 52 ? f.n.slice(0, 50) + "…" : f.n;
  const per10k = f.special || x === 0 ? "" : `≈ $${Math.abs(Math.round(x * 100)).toLocaleString("en-US")} of every $10,000${x < 0 ? " (short)" : ""}`;
  const stampFont = v.stamp.length > 14 ? 44 : 58;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
<rect width="1200" height="1200" fill="#F2EFE6"/>
<g transform="translate(0,285)">
  <rect width="1200" height="630" fill="#F2EFE6"/>
  <rect x="0" y="0" width="1200" height="34" fill="#16150F"/>
  <text x="24" y="23" font-family="Courier New, monospace" font-size="15" letter-spacing="2" fill="#F2EFE6">CERTIFICATE OF INSPECTION · BUREAU OF PORTFOLIO PURITY · ${escXml(ASOF.toUpperCase())}</text>
  <rect x="26" y="56" width="1148" height="520" fill="none" stroke="#16150F" stroke-width="3"/>
  <rect x="34" y="64" width="1132" height="504" fill="none" stroke="#16150F" stroke-width="1"/>
  <text x="70" y="150" font-family="Courier New, monospace" font-size="19" letter-spacing="4" fill="#4E4B3E">THE MUSK CONTENT OF</text>
  <text x="66" y="248" font-family="Arial Black, Arial" font-size="96" font-weight="900" fill="#16150F" letter-spacing="-2">${escXml(f.t)}</text>
  <text x="70" y="296" font-family="Georgia, serif" font-size="27" font-style="italic" fill="#4E4B3E">${escXml(name)}</text>
  ${pctBig ? `<text x="1130" y="250" text-anchor="end" font-family="Arial Black, Arial" font-size="86" font-weight="900" fill="${v.color}">${escXml(pctBig)}</text>
  <text x="1130" y="290" text-anchor="end" font-family="Courier New, monospace" font-size="16" letter-spacing="2" fill="#4E4B3E">MUSK EXPOSURE${per10k ? " · " + escXml(per10k.toUpperCase()) : ""}</text>` : ""}
  <g transform="translate(600,455) rotate(-6)">
    <rect x="-430" y="-85" width="860" height="170" rx="14" fill="none" stroke="${v.color}" stroke-width="7"/>
    <rect x="-418" y="-73" width="836" height="146" rx="10" fill="none" stroke="${v.color}" stroke-width="2.5"/>
    <text x="0" y="10" text-anchor="middle" font-family="Arial Black, Arial" font-size="${stampFont}" font-weight="900" fill="${v.color}">${escXml(v.stamp)}</text>
    <text x="0" y="52" text-anchor="middle" font-family="Courier New, monospace" font-size="16" letter-spacing="5" fill="${v.color}">${escXml(v.sub)}</text>
  </g>
  <rect x="0" y="596" width="1200" height="34" fill="#16150F"/>
  <text x="600" y="619" text-anchor="middle" font-family="Courier New, monospace" font-size="15" letter-spacing="3" fill="#F2EFE6">IS THERE ELON IN YOUR FUND? · CHECK ANY TICKER FREE · § 420.69</text>
</g>
</svg>`;
}

/* ---- run ---- */
const fDir = path.join(root, "f");
const ogDir = path.join(root, "og");
const svgTmp = path.join(root, "og", "_svg");
fs.mkdirSync(fDir, { recursive: true });
fs.mkdirSync(svgTmp, { recursive: true });

let n = 0;
for (const f of FUNDS) {
  fs.writeFileSync(path.join(fDir, `${f.t}.html`), stubHTML(f));
  fs.writeFileSync(path.join(svgTmp, `${f.t}.svg`), ogSVG(f));
  n++;
}

/* ---- sitemap + robots (250 indexable verdict pages) ---- */
const urls = [`${SITE}/`].concat(FUNDS.map((f) => `${SITE}/f/${encodeURIComponent(f.t)}.html`));
fs.writeFileSync(
  path.join(root, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => ` <url><loc>${escXml(u)}</loc></url>`).join("\n") + "\n</urlset>\n"
);
fs.writeFileSync(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`built ${n} share stubs in f/, ${n} OG svgs, sitemap.xml (${urls.length} urls), robots.txt`);
console.log(`SITE_URL=${SITE}`);
