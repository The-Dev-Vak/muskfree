/* ============================================================
   lib-holdings.mjs — shared ETF holdings fetcher

   stockanalysis.com removed its public /api/symbol/... endpoints
   (July 2026); top-25 holdings now ship only inside the SvelteKit
   SSR payload at /etf/{ticker}/holdings/__data.json. That payload
   is devalue-encoded: each node's `data` is a flat array where
   object property values are indices into the same array.

   getHoldings(t) tries the SSR payload first, then the legacy API
   in case it ever comes back. Returns
     { holdings: [{n, s, as, ...}], aum: number|null }
   or null. Row shape matches the old API, so callers' scanners
   work unchanged.
   ============================================================ */

export const API = "https://api.stockanalysis.com/api";
export const UA = { headers: { "User-Agent": "muskfree-certified/1.0 (nightly registry verification)" } };

export async function getJSON(p) {
  try {
    const r = await fetch(API + p, UA);
    if (!r.ok) return null;
    const j = await r.json();
    return j && j.status === 200 ? j.data : null;
  } catch { return null; }
}

function devalueResolve(data) {
  const seen = new Array(data.length);
  const resolve = (i) => {
    if (i === -1 || i == null) return undefined;
    if (typeof i !== "number") return i;
    if (seen[i] !== undefined) return seen[i];
    const v = data[i];
    if (Array.isArray(v)) {
      const out = [];
      seen[i] = out;
      for (const x of v) out.push(resolve(x));
      return out;
    }
    if (v && typeof v === "object") {
      const out = {};
      seen[i] = out;
      for (const [k, idx] of Object.entries(v)) out[k] = resolve(idx);
      return out;
    }
    seen[i] = v;
    return v;
  };
  return resolve(0);
}

async function fromDataJSON(t) {
  try {
    const r = await fetch(`https://stockanalysis.com/etf/${t.toLowerCase()}/holdings/__data.json`, UA);
    if (!r.ok) return null;
    const j = await r.json();
    for (const node of j.nodes || []) {
      if (!node || node.type !== "data") continue;
      const d = devalueResolve(node.data);
      if (d && Array.isArray(d.holdings) && d.holdings.length) {
        return { holdings: d.holdings, aum: d.infoTable?.aum ?? null };
      }
    }
    return null;
  } catch { return null; }
}

export async function getHoldings(t) {
  const ssr = await fromDataJSON(t);
  if (ssr) return ssr;
  const legacy = await getJSON(`/symbol/e/${t}/holdings`);
  if (legacy && legacy.holdings) return { holdings: legacy.holdings, aum: null };
  return null;
}
