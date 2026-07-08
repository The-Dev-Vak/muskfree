/* ============================================================
   MUSK-FREE CERTIFIED — live data layer
   Client-side market data via api.stockanalysis.com (CORS-open,
   keyless). Everything degrades gracefully: if the network or
   the API is down, the site falls back to the curated registry
   and simply doesn't show live panels.

   Endpoints used:
     /api/quotes/{kind}/{SYM}            live quote
     /api/symbol/{kind}/{SYM}/overview   AUM / mcap / ER / etc.
     /api/symbol/e/{SYM}/holdings        top-25 holdings (ETFs)
     /api/search?q=                      classify unknown tickers
   kind: s = stock, e = ETF, mutf = mutual fund
   ============================================================ */

var LIVE = (function () {
  "use strict";

  var BASE = "https://api.stockanalysis.com/api";
  var TTL = 10 * 60 * 1000; // 10 min cache

  function cacheGet(key) {
    try {
      var raw = sessionStorage.getItem("sa:" + key);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (Date.now() - obj.ts > TTL) return null;
      return obj.data;
    } catch (e) { return null; }
  }
  function cacheSet(key, data) {
    try { sessionStorage.setItem("sa:" + key, JSON.stringify({ ts: Date.now(), data: data })); } catch (e) {}
  }

  function get(path) {
    var hit = cacheGet(path);
    if (hit) return Promise.resolve(hit);
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, 7000);
    return fetch(BASE + path, { signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (timer) clearTimeout(timer);
        if (!j || j.status !== 200 || !j.data) return null;
        cacheSet(path, j.data);
        return j.data;
      })
      .catch(function () { if (timer) clearTimeout(timer); return null; });
  }

  /* Registry type → API kind */
  function kindOf(f) {
    if (!f) return "s";
    if (f.type === "ETF") return "e";
    if (f.type === "Mutual fund" || f.type === "Interval fund") return "mutf";
    if (f.type === "Closed-end fund") return "s"; // CEFs quote like stocks; holdings often under /e/
    return "s";
  }

  function quote(kind, sym) { return get("/quotes/" + kind + "/" + encodeURIComponent(sym)); }
  function overview(kind, sym) { return get("/symbol/" + kind + "/" + encodeURIComponent(sym) + "/overview"); }
  function holdings(sym) { return get("/symbol/e/" + encodeURIComponent(sym) + "/holdings"); }
  function search(q) { return get("/search?q=" + encodeURIComponent(q)); }

  /* Scan a holdings list for Musk positions.
     Rows look like {n:"Tesla, Inc.", s:"$TSLA", as:"3.18%", sh:"..."} —
     private-era stakes may have no symbol (e.g. "Spv Exposure To Spacex Lp"),
     so we match names too. */
  function muskScan(rows) {
    var tsla = 0, spcx = 0, coverage = 0, matched = [];
    (rows || []).forEach(function (h) {
      var sym = String(h.s || "").replace(/^\$/, "").toUpperCase();
      var name = String(h.n || "").toLowerCase();
      var w = parseFloat(String(h.as || "").replace("%", "")) || 0;
      coverage += w;
      var isTsla = sym === "TSLA" || /\btesla\b/.test(name);
      var isSpcx = sym === "SPCX" || /space\s?x|space exploration/.test(name);
      if (isTsla) { tsla += w; matched.push({ name: h.n, sym: sym || "—", w: w, kind: "TSLA" }); }
      else if (isSpcx) { spcx += w; matched.push({ name: h.n, sym: sym || "—", w: w, kind: "SPCX" }); }
    });
    return { tsla: tsla, spcx: spcx, coverage: coverage, matched: matched, rows: rows || [] };
  }

  /* Classify an unknown ticker via search. Returns {kind, sym, name} or null.
     Only accepts US-listed results (path without an exchange prefix). */
  function classify(q) {
    return search(q).then(function (results) {
      if (!results || !results.length) return null;
      var qq = q.toUpperCase();
      var best = null;
      results.forEach(function (r) {
        var path = String(r.s || "");
        if (path.indexOf("/") !== -1 && !/^(e|s|mutf|etf|stocks)\//.test(path) && path.split("/")[0].length > 4) return; // foreign exchange prefix
        var sym = (r.id || "").replace(/^(MUTF|OTC)-/, "");
        var isExact = sym.toUpperCase() === qq || String(r.s).toUpperCase() === qq;
        var kind = r.t === "e" ? "e" : (r.st === "m" || /^mutf\//.test(path)) ? "mutf" : "s";
        var cand = { kind: kind, sym: sym.toUpperCase(), name: r.n || sym, exact: isExact };
        if (isExact && !best) best = cand;
      });
      return best;
    });
  }

  /* Full live lookup for a ticker NOT in the registry.
     Returns a provisional fund-shaped object or null. */
  function lookup(sym) {
    return classify(sym).then(function (c) {
      if (!c) return null;
      var wants = [quote(c.kind, c.sym), overview(c.kind, c.sym)];
      if (c.kind === "e") wants.push(holdings(c.sym));
      return Promise.all(wants).then(function (res) {
        var q = res[0], ov = res[1], hold = res[2];
        if (!q && !ov && !hold) return null;
        var scan = hold ? muskScan(hold.holdings) : null;
        return {
          sym: c.sym, name: c.name, kind: c.kind,
          quote: q, overview: ov, scan: scan
        };
      });
    });
  }

  /* Live enrichment for a registry fund: quote + overview + scan.
     Mutual funds are skipped — their API endpoints don't serve CORS
     and their verification comes from SEC N-PORT via the overlay. */
  function enrich(f) {
    var kind = kindOf(f);
    if (kind === "mutf") return Promise.resolve(null);
    var wants = [quote(kind, f.t), overview(kind, f.t)];
    var scannable = kind === "e" || f.type === "Closed-end fund";
    if (scannable) wants.push(holdings(f.t));
    return Promise.all(wants).then(function (res) {
      var q = res[0], ov = res[1], hold = res[2];
      if (!q && !ov && !hold) return null;
      return { quote: q, overview: ov, scan: hold ? muskScan(hold.holdings) : null };
    });
  }

  function fmtQuoteLine(q) {
    if (!q || q.p == null) return null;
    var chg = q.cp != null ? q.cp : 0;
    return {
      price: "$" + Number(q.p).toLocaleString("en-US", { maximumFractionDigits: 2 }),
      chg: (chg > 0 ? "+" : "") + chg.toFixed(2) + "%",
      up: chg >= 0,
      asof: q.u || "",
      h52: q.h52, l52: q.l52
    };
  }

  return {
    quote: quote, overview: overview, holdings: holdings,
    classify: classify, lookup: lookup, enrich: enrich,
    muskScan: muskScan, kindOf: kindOf, fmtQuoteLine: fmtQuoteLine
  };
})();
