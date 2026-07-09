/* ============================================================
   MUSK-FREE CERTIFIED, app
   Hash-routed static SPA. No dependencies, no build step.
   ============================================================ */

(function () {
  "use strict";

  var app = document.getElementById("app");
  var byTicker = {};
  FUNDS.forEach(function (f) { byTicker[f.t] = f; });

  /* Machine-generated registry extension (data.gen.js): the top US ETFs by
     AUM outside the curated set, each pre-scanned for Musk exposure. */
  function mergeGen(list, extra) {
    list.forEach(function (g) {
      if (byTicker[g.t]) return;
      var f = {
        t: g.t, n: g.n, type: "ETF", cat: g.cat, aumB: g.aumB,
        tsla: g.tsla || 0, spacex: g.spacex || 0,
        autoGen: true, unverified: !!g.noscan, alts: []
      };
      if (g.region) f.region = g.region;
      if (extra) for (var k in extra) f[k] = extra[k];
      FUNDS.push(f);
      byTicker[g.t] = f;
    });
  }
  if (typeof GEN_FUNDS !== "undefined") mergeGen(GEN_FUNDS);
  if (typeof GEN_INTL !== "undefined") mergeGen(GEN_INTL, { genIssuer: true });

  /* ---------------- helpers ---------------- */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function exposure(f) {
    return (f.tsla || 0) + (f.spacex || 0) + (f.xai || 0) + (f.other || 0);
  }

  function fmtPct(x) {
    if (x === 0) return "0.0%";
    var v = Math.abs(x) < 1 ? x.toFixed(1) : (x % 1 === 0 ? x.toFixed(0) : x.toFixed(1));
    return v + "%";
  }

  function fmtMoney(x) {
    var sign = x < 0 ? "−$" : "$";
    return sign + Math.abs(x).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  /* Verdict tiers */
  function verdict(f) {
    if (f.special === "private") {
      return { key: "private", stamp: "100% MUSK", sub: "PRIVATELY HELD", cls: "red", short: "PRIVATE MUSK CO.", tone: "bad" };
    }
    if (f.special === "doge") {
      return { key: "doge", stamp: "SPIRITUALLY MUSK", sub: "UNQUANTIFIABLE", cls: "purple", short: "SPIRITUALLY MUSK", tone: "anti" };
    }
    if (f.special === "limited") {
      return { key: "limited", stamp: "DATA LIMITED", sub: "MANUAL INSPECTION ADVISED", cls: "olive", short: "DATA LIMITED", tone: "bad" };
    }
    if (f.live && f.liveClean) {
      return { key: "provclean", stamp: "NO MUSK DETECTED", sub: "TOP-25 SCAN · PROVISIONAL", cls: "green", short: "NO MUSK DETECTED", tone: "ok" };
    }
    var x = exposure(f);
    if (x < 0) return { key: "anti", stamp: "ANTI-MUSK", sub: "SHORTS THE MUSK", cls: "purple", short: "ANTI-MUSK", tone: "anti" };
    if (x === 0) return { key: "free", stamp: "MUSK-FREE", sub: "CERTIFIED · NO ELON DETECTED", cls: "green", short: "MUSK-FREE ✓", tone: "ok" };
    if (x < 0.5) return { key: "trace", stamp: "TRACE MUSK", sub: "HOMEOPATHIC LEVELS", cls: "olive", short: "TRACE MUSK", tone: "bad" };
    if (x < 5) return { key: "contains", stamp: "CONTAINS MUSK", sub: "ELON DETECTED", cls: "red", short: "CONTAINS MUSK ✗", tone: "bad" };
    if (x < 15) return { key: "high", stamp: "HIGH MUSK CONTENT", sub: "SUBSTANTIAL ELON WITHIN", cls: "red", short: "HIGH MUSK", tone: "bad" };
    if (x < 85) return { key: "extreme", stamp: "EXTREMELY MUSKY", sub: "APPROACH WITH CAUTION", cls: "red", short: "EXTREMELY MUSKY", tone: "bad" };
    if (x <= 100) return { key: "pure", stamp: "PURE UNCUT MUSK", sub: "THIS IS THE MUSK", cls: "red", short: "100% MUSK", tone: "bad" };
    return { key: "leveraged", stamp: "LEVERAGED MUSK", sub: "MORE MUSK THAN MONEY", cls: "red", short: "LEVERAGED MUSK", tone: "bad" };
  }

  function verdictLabel(f) {
    var v = verdict(f);
    if (f.special || v.key === "pure") return v.short;
    var x = exposure(f);
    return v.short + (x !== 0 ? " · " + fmtPct(x) : "");
  }

  /* ---------------- search ---------------- */

  function normalize(q) {
    return q.toLowerCase().replace(/[^a-z0-9&\s.]/g, "").trim()
      .replace(/\.(to|v|ne|cn|l|de|pa|as|mi|sw|f|ln)$/i, ""); // exchange suffixes: VFV.TO, CSPX.L …
  }

  /* region helpers */
  function regionMeta(f) {
    if (f.region === "CA") return { flag: "🇨🇦", label: "TSX-listed (Canada)" };
    if (f.region === "EU") return { flag: "🇪🇺", label: "UCITS (Europe)" };
    return { flag: "🇺🇸", label: "US-listed" };
  }

  /* The Bureau's one recommended musk-free substitute for a musky fund.
     Prefers the fund's own curated alts; falls back to a same-region
     broad clean fund so EVERY musky ticker gets a recommendation. */
  function bestAlt(f) {
    var pick = null;
    (f.alts || []).some(function (a) {
      var af = byTicker[a];
      if (af && !af.special && exposure(af) <= 0.2) { pick = { f: af, fallback: false }; return true; }
      return false;
    });
    if (pick) return pick;
    var fb = f.region === "CA" ? "XIU" : f.region === "EU" ? "MEUD" : (/nasdaq|growth|tech|innovation|robotics|internet/i.test(f.cat || "") ? "VGT" : "DIA");
    if (byTicker[fb] && fb !== f.t) return { f: byTicker[fb], fallback: true };
    return null;
  }

  function search(q) {
    q = normalize(q);
    if (!q) return [];
    var starts = [], contains = [], aliased = [];
    FUNDS.forEach(function (f) {
      var t = f.t.toLowerCase(), n = f.n.toLowerCase();
      if (t === q) { starts.unshift(f); return; }
      if (t.indexOf(q) === 0) { starts.push(f); return; }
      if (n.indexOf(q) !== -1) { contains.push(f); return; }
      if ((f.aliases || []).some(function (a) { return a.indexOf(q) !== -1; })) aliased.push(f);
    });
    return starts.concat(contains, aliased).slice(0, 8);
  }

  function findExact(q) {
    q = normalize(q);
    var up = q.toUpperCase().replace(/\s+/g, "");
    if (byTicker[up]) return byTicker[up];
    var hits = search(q);
    if (hits.length && (hits[0].t.toLowerCase() === q || hits[0].n.toLowerCase() === q)) return hits[0];
    if (hits.length === 1) return hits[0];
    // full alias match
    var alias = FUNDS.filter(function (f) {
      return (f.aliases || []).indexOf(q) !== -1;
    });
    if (alias.length === 1) return alias[0];
    return null;
  }

  /* ---------------- shared components ---------------- */

  function stampHTML(f, size) {
    var v = verdict(f);
    return '<div class="stamp stamp-' + v.cls + " stamp-" + (size || "lg") + '" role="img" aria-label="' +
      esc(v.stamp + ". " + v.sub) + '"><span>' + esc(v.stamp) + "<small>" + esc(v.sub) + "</small></span></div>";
  }

  function cardHTML(t) {
    var f = byTicker[t];
    if (!f) return "";
    var v = verdict(f);
    var x = exposure(f);
    var pct = f.special ? "" : '<span class="card-pct ' + v.tone + '">' + fmtPct(x) + "</span>";
    return '<a class="card" href="#/f/' + esc(f.t) + '">' + pct +
      '<div class="card-tick">' + esc(f.t) + "</div>" +
      '<div class="card-name">' + esc(f.n) + "</div>" +
      '<div class="card-verdict ' + v.tone + '">' + esc(v.short) + "</div></a>";
  }

  function searchboxHTML(id) {
    return (
      '<div class="searchbox">' +
      '<form class="search-form" data-search-form autocomplete="off">' +
      '<input class="search-input" data-search-input id="' + id + '" type="text" ' +
      'placeholder="Type a ticker or fund name. VOO, ARKK, “fidelity 500”…" ' +
      'aria-label="Search for a fund or stock" spellcheck="false" />' +
      '<button class="search-btn" type="submit">Inspect</button>' +
      "</form>" +
      '<div class="suggest" data-suggest role="listbox"></div>' +
      "</div>"
    );
  }

  function chipsHTML() {
    return '<div class="chips"><span class="chips-label">Frequently inspected:</span>' +
      POPULAR_CHECKS.map(function (t) {
        return '<a class="chip" href="#/f/' + t + '">' + t + "</a>";
      }).join("") + "</div>";
  }

  /* ---------------- views ---------------- */

  function homeView() {
    var freeCount = FUNDS.filter(function (f) { return !f.special && exposure(f) === 0; }).length;

    return (
      '<section class="hero"><div class="wrap"><div class="hero-flex">' +
      "<div>" +
      '<p class="kicker">Portfolio Inspection Service</p>' +
      '<h1 class="h-display hero-title">Is there <span class="strike-musk">Elon</span> in your index fund?</h1>' +
      '<p class="hero-sub">Probably. <span class="serif">$1.71 of every $100</span> in an S&amp;P 500 fund is Tesla, and since SpaceX&rsquo;s record IPO in June, SPCX has been landing in total-market funds, target-date funds, and (as of July&nbsp;7) the Nasdaq-100. Type any ticker (ETF, mutual fund, or stock) and get the official verdict in two seconds.</p>' +
      searchboxHTML("home-search") +
      chipsHTML() +
      "</div>" +
      '<div class="hero-stamp"><img class="hero-musk-img" src="musk.png" alt="Specimen under inspection" /><div class="stamp stamp-green stamp-md"><span>MUSK-FREE<small>SPECIMEN STAMP</small></span></div></div>' +
      "</div></div></section>" +

      bigBoardHTML() +
      companiesHTML() +

      '<section class="section"><div class="wrap">' +
      '<p class="kicker">Recent inspections</p>' +
      '<h2 class="h-display" style="font-size:clamp(28px,4vw,44px);margin-bottom:26px;">The funds everyone asks about</h2>' +
      '<div class="grid grid-4">' + POPULAR_CHECKS.slice(0, 8).map(cardHTML).join("") + "</div>" +
      '<a class="mf2-banner" href="#/portfolio"><span class="mf2-form">FORM MF-2</span>' +
      "<span><b>Own more than one fund?</b> Paste your whole portfolio and get a single blended verdict, one stamp for everything you hold.</span>" +
      '<span class="mf2-go">Run the full audit →</span></a>' +
      "</div></section>" +

      '<section class="section" id="musk-index"><div class="wrap">' +
      '<p class="kicker">The Musk Index</p>' +
      '<h2 class="h-display" style="font-size:clamp(28px,4vw,44px);margin-bottom:26px;">Know your exposure</h2>' +
      '<div class="grid grid-4">' +
      KEY_STATS.map(function (s) {
        return '<div class="stat"><div class="stat-big">' + esc(s.big) + '</div><div class="stat-label">' + esc(s.label) + '</div><div class="stat-sub">' + esc(s.sub) + "</div></div>";
      }).join("") +
      "</div>" +
      '<div class="grid grid-2" style="margin-top:44px;align-items:start;">' +
      leaderboardHTML() + cleanboardHTML() +
      "</div>" +

      '<div style="margin-top:44px;overflow-x:auto;">' + trackerHTML() + "</div>" +
      "</div></section>"
    );
  }

  /* ------------- The Musk companies (dedicated section) ------------- */

  function companiesHTML() {
    var cards = MUSK_EMPIRE.map(function (c) {
      var isPublic = /public/i.test(c.status);
      var tick = c.ticker && c.ticker !== "-" ? c.ticker : null;
      return '<div class="co-card">' +
        '<div class="co-head"><span class="co-name">' + esc(c.name) + "</span>" +
        '<span class="tr-chip ' + (isPublic ? "tr-in" : "tr-out") + '">' + (isPublic ? "PUBLIC" + (tick ? " · " + esc(tick) : "") : "PRIVATE") + "</span></div>" +
        '<div class="co-val">' + esc(c.value) + "</div>" +
        (tick ? '<div class="co-live" id="co-live-' + esc(tick) + '"></div>' : "") +
        '<div class="co-status">' + esc(c.status) + "</div>" +
        '<p class="co-how">' + esc(c.how) + "</p>" +
        (tick ? '<a class="btn ghost co-btn" href="#/f/' + esc(tick) + '">Inspect ' + esc(tick) + " →</a>" : '<span class="co-btn co-none">No ticker. No fund exposure. No entry.</span>') +
        "</div>";
    }).join("");
    return (
      '<section class="section" id="companies"><div class="wrap">' +
      '<p class="kicker">The subjects of investigation</p>' +
      '<h2 class="h-display" style="font-size:clamp(28px,4vw,44px);margin-bottom:10px;">The Musk companies</h2>' +
      '<p class="hero-sub" style="margin-top:8px;max-width:62ch;">Four companies, one very online owner. Two are publicly traded and flowing into index funds; two remain private and effectively unreachable. Every exposure number on this site traces back to these.</p>' +
      '<div class="grid grid-2" style="margin-top:30px;">' + cards + "</div>" +
      "</div></section>"
    );
  }

  function leaderboardHTML() {
    var rows = DIRTY_LEADERBOARD.map(function (t) {
      var f = byTicker[t];
      var x = exposure(f);
      var w = Math.min(100, Math.abs(x) / 2);
      return "<tr><td><a href='#/f/" + t + "'>" + t + "</a></td><td>" + esc(f.n) +
        '</td><td class="num"><span class="bar" style="width:' + w + 'px"></span>' + fmtPct(x) + "</td></tr>";
    }).join("");
    return '<table class="tbl"><caption>Exhibit A. Muskiest funds in America</caption>' +
      "<thead><tr><th>Ticker</th><th>Fund</th><th>Musk exposure</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }

  function cleanboardHTML() {
    var rows = CLEAN_PICKS.map(function (t) {
      var f = byTicker[t];
      if (!f) return "";
      var rm = regionMeta(f);
      return "<tr><td>" + rm.flag + " <a href='#/f/" + t + "'>" + t + "</a></td><td>" + esc(f.n) +
        "</td><td>" + esc(f.cat) + "</td></tr>";
    }).join("");
    return '<table class="tbl"><caption>Exhibit B. Popular certified Musk-free funds</caption>' +
      "<thead><tr><th>Ticker</th><th>Fund</th><th>Category</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }

  function methodologyHTML() {
    return (
      '<div class="prose">' +
      "<p><b>What we count.</b> Direct equity exposure to Musk-led companies: Tesla (TSLA) weight in the fund, plus SpaceX (NASDAQ: SPCX) weight, which since the February 2026 merger includes xAI, X (formerly Twitter), and Grok, plus any disclosed stakes in the still-private Neuralink or The Boring Company. Figures are percentages of fund assets from the most recent public disclosures and index data as of " + esc(ASOF) + ", rounded sensibly.</p>" +
      "<p><b>What we don’t count.</b> Supply-chain exposure (NVIDIA selling GPUs to Musk companies), index derivatives, securities lending, or the CEO’s presence in your social feed. If we counted vibes, nothing would be Musk-free.</p>" +
      "<p><b>Two data layers.</b> (1) A <b>verified registry</b> of " + FUNDS.length + " funds and stocks, hand-checked against issuer disclosures and index announcements, that’s what the stamp is based on. (2) A <b>live layer</b>: your browser queries a public market-data API for real-time quotes, assets, expense ratios, and each ETF’s current top-25 holdings, then scans those holdings for Tesla and SpaceX by ticker <i>and</i> by name (pre-IPO stakes hide under names like “SPV Exposure to SpaceX LP”). When the live scan disagrees with the registry, the live number wins and the stamp is re-issued on the spot, marked LIVE-ADJUSTED. Tickers we’ve never heard of get a fully live provisional certificate.</p>" +
      "<p><b>Coverage.</b> The registry spans US-listed funds and stocks, TSX-listed Canadian funds 🇨🇦, and the major European UCITS funds 🇪🇺. Foreign listings that track a US index inherit the daily-verified weights of their US twin (marked “mirrors …”), an S&amp;P 500 tracker is the S&amp;P 500 in any currency. Any other US-listed ticker still works via live lookup; Canadian and European tickers outside the registry aren’t covered yet.</p>" +
      "<p><b>Limits, stated plainly.</b> The live holdings feed shows the top ~25 positions (typically 40–90% of a fund’s assets), so a sub-1% Musk position can hide below the cutoff, live scans are a floor, not a ceiling. Mutual funds don’t expose machine-readable holdings in real time at all. And SPCX is still being added to index families on their own schedules (see the Inclusion Tracker above), funds marked “on SPCX-watch” can change any week. The issuer’s own holdings page remains the final word: search “[ticker] full holdings.”</p>" +
      '<p class="serif">This site is satire wearing a green eyeshade, but the data is real, and so is the use case. Invest according to your own values and math.</p>' +
      "</div>"
    );
  }

  function faqHTML() {
    var items = [
      ["Why isn’t Tesla in my tech fund?", "Because officially, Tesla isn’t a tech company. The GICS classification system files it under <b>Consumer Discretionary. Automobiles</b>, next to Ford and Harley-Davidson. That’s why VGT and XLK hold zero Tesla while the consumer-discretionary fund XLY is nearly one-fifth Tesla. The most effective Musk filter in finance is a filing-cabinet decision from S&amp;P and MSCI."],
      ["Is my 401(k) Musk-free?", "Almost certainly not, and it just got Muskier. Most 401(k) money defaults into target-date funds, which hold total-market index funds, which hold Tesla at roughly 1–1.7% and, since June 18, a slice of SPCX too. On a $100,000 balance, that’s comfortably over $1,000 of Elon. Check your plan’s fund lineup, the tickers are searchable right here."],
      ["Wait, SpaceX is a public company now?", "As of June 12, 2026. NASDAQ: <a href='#/f/SPCX'>SPCX</a>, the largest IPO in history (~$1.8 trillion valuation, ~$75B raised). Index funds started absorbing it almost immediately: the CRSP total-market index (VTI, VTSAX) added it June 18, the Russell 1000 June 29, and the Nasdaq-100 (QQQ) on July 7. The big holdout is the S&amp;P 500, which requires GAAP profitability, so SPY and VOO hold zero SpaceX for now. If you want to avoid it, the S&amp;P 500, the Dow, dividend funds, and international funds are your friends."],
      ["What happened to xAI, X, and Grok?", "They’re all inside SPCX. xAI absorbed X (Twitter) in 2025; then SpaceX absorbed xAI in February 2026 at a combined $1.25 trillion valuation before the IPO. One ticker now contains the rockets, the satellites, the social network, and the chatbot. Buying, or avoiding, the Musk empire has never been more administratively convenient."],
      ["What about NVIDIA, or companies that do business with Musk?", "We only count equity ownership. NVIDIA sells enormous quantities of chips to SpaceX’s AI division and to Tesla, but owning NVDA doesn’t make you a Musk shareholder, it makes you a shareholder of a company he’s a customer of. If supply chains counted, your toothpaste would be implicated."],
      ["I want the S&P 500 without Tesla. Does that exist?", "Not as a cheap one-ticker ETF, yet. Your practical options: the <a href='#/f/DIA'>Dow (DIA)</a>, 30 blue chips, never included Tesla; <a href='#/f/RSP'>equal-weight S&P (RSP)</a>. Tesla diluted to 0.2%; value and dividend funds like <a href='#/f/VTV'>VTV</a> or <a href='#/f/SCHD'>SCHD</a> that exclude it by rule; or direct indexing, where you buy the index minus specific stocks (offered by Fidelity, Schwab, Frec, and others)."],
      ["Wait, there are anti-Musk funds?", "Yes. Inverse Tesla ETFs like <a href='#/f/TSLS'>TSLS</a> and <a href='#/f/TSLZ'>TSLZ</a> go up when Tesla goes down. They’re daily-rebalanced trading instruments that decay if held long-term, protest with your allocation, not your life savings."],
      ["Is this financial advice?", "No. This is a website with a rubber stamp. It’s accurate to the best of our data and updated when holdings shift, but every investing decision is yours, ideally made with someone who has a fiduciary duty and a calculator."],
    ];
    return items.map(function (it) {
      return '<details class="faq-item"><summary>' + it[0] + '</summary><div class="faq-body"><p>' + it[1] + "</p></div></details>";
    }).join("");
  }

  /* ------------- fund certificate view ------------- */

  function fundView(f) {
    var v = verdict(f);
    var x = exposure(f);
    var per10k = Math.round(x * 100); // x% of $10,000
    var certNo = "MF-2026-" + f.t.replace(/[^A-Z0-9]/g, "");

    var rm = regionMeta(f);
    var metaBits = [f.type, f.cat].map(esc).join(" · ") + " · " + rm.flag + " " + esc(rm.label);

    /* Bureau Recommendation, every musky fund gets one clean substitute */
    var recHTML = "";
    if (!f.special && x > 0.15) {
      var rec = bestAlt(f);
      if (rec) {
        var recX = exposure(rec.f);
        recHTML = '<div class="bureau-rec"><div class="bureau-rec-head">☛ BUREAU RECOMMENDATION</div>' +
          '<p>Choose <a href="#/f/' + esc(rec.f.t) + '"><b>' + esc(rec.f.t) + "</b></a> over " + esc(f.t) + ". " +
          esc(rec.f.n) + ", " + (recX === 0 ? "certified 0.0% Musk" : "just " + fmtPct(recX) + " Musk") + "." +
          (rec.fallback
            ? " <span class=\"bureau-rec-fine\">(No like-for-like substitute exists for this one, this is the nearest clean, broad " + (f.region === "CA" ? "Canadian" : f.region === "EU" ? "European" : "US") + " lane, not an equivalent exposure.)</span>"
            : " <span class=\"bureau-rec-fine\">(Same broad lane. " + esc(rec.f.cat) + ", but not an identical exposure; see the plan's fine print.)</span>") +
          "</p></div>";
      }
    }

    /* dollar line */
    var dollarLine = "";
    if (!f.special) {
      if (x === 0) {
        dollarLine = '<p class="dollar-line">Invest $10,000 and <b class="ok">$0</b> of it goes to a Musk enterprise. Not a cent. The stamp does not lie.</p>';
      } else if (x < 0) {
        dollarLine = '<p class="dollar-line">Every $10,000 here is effectively a <b>' + fmtMoney(Math.abs(per10k)) + "</b> bet <i>against</i> Tesla, rebalanced daily. Bold.</p>";
      } else {
        dollarLine = '<p class="dollar-line">Put in $10,000 and roughly <b>' + fmtMoney(per10k) + "</b> of it is Musk enterprises.</p>";
      }
    }

    /* note */
    var noteHTML = "";
    var autoNote = "";
    if (!f.note && f.autoGen) {
      autoNote = f.unverified
        ? "Auto-registered from the issuer catalog. No machine-readable holdings feed was available for this one, verify with the issuer before assuming anything."
        : f.genIssuer
          ? (x > 0
            ? "Auto-registered from the issuer's catalog and scanned via its complete daily holdings file, this number covers the full portfolio, wraps resolved by look-through."
            : "Auto-registered from the issuer's catalog. The complete daily holdings file shows no Tesla and no SpaceX, a real zero, not a sampling artifact.")
          : (x > 0
            ? "Auto-registered from the ETF universe and scanned via its top-25 holdings (" + (f.cat || "ETF") + "). Positions below the top-25 cutoff are invisible, treat the number as a floor."
            : "Auto-registered from the ETF universe. Top-25 holdings scan found no Tesla or SpaceX; sub-1% positions could hide below the cutoff.");
    } else if (!f.note) {
      if (x === 0) autoNote = "No Tesla in the holdings, no disclosed stakes in SpaceX, xAI, Neuralink, or The Boring Company. Clean.";
      else if (x < 5) autoNote = "Carries Tesla at roughly its index weight. Not a statement, just what happens when you buy the whole market.";
      else autoNote = "This fund holds a substantial, deliberate position in Musk enterprises. This is a conviction, not an accident.";
    }
    noteHTML = '<div class="cert-note ' + (v.tone === "ok" ? "ok" : "") + '"><span class="serif">Inspector’s remarks.</span> ' + esc(f.note || autoNote) + "</div>";

    /* musk facts label */
    var mfacts = "";
    if (!f.special) {
      var rows = [
        ["Tesla, Inc. (TSLA)", f.tsla || 0],
        ["SpaceX (SPCX), incl. xAI, X, Grok", (f.spacex || 0) + (f.xai || 0)],
        ["Neuralink / Boring Co.", f.other || 0],
      ];
      mfacts =
        '<div class="mfacts"><h3>Musk Facts</h3>' +
        '<div class="mf-serving">Serving size: <b>$10,000 invested</b><br/>Servings per portfolio: varies by regret</div>' +
        '<div class="mf-amount">Amount per serving</div>' +
        '<div class="mf-row total"><span>Total Musk Exposure</span><span class="v">' + fmtPct(x) + "</span></div>" +
        rows.map(function (r) {
          return '<div class="mf-row indent"><span>' + esc(r[0]) + '</span><span class="v">' + fmtPct(r[1]) + "</span></div>";
        }).join("") +
        '<div class="mf-row"><span>Your $10,000, to Musk cos.</span><span class="v">' + fmtMoney(per10k) + "</span></div>" +
        '<div class="mf-foot">Percentages are approximate fund weights from latest public disclosures (' + esc(ASOF) + "). Not a nutrition label. Not advice. Daily values may vary with the CEO’s posting schedule.</div></div>";
    } else if (f.related) {
      mfacts =
        '<div class="mfacts"><h3>Musk Facts</h3>' +
        '<div class="mf-serving">This company is <b>privately held</b>, no ticker, no fund required to carry it.</div>' +
        '<div class="mf-amount">Funds with disclosed exposure</div>' +
        f.related.map(function (t) {
          var rf = byTicker[t];
          return '<div class="mf-row"><span><a href="#/f/' + t + '" style="font-family:var(--font-mono);font-weight:600;">' + t + "</a> " + esc(rf ? rf.n : "") + '</span><span class="v">' + (rf ? fmtPct(exposure(rf)) : "") + "</span></div>";
        }).join("") +
        '<div class="mf-foot">Avoiding Musk? Avoid these. Seeking Musk? Mind the premiums, lockups and expense ratios. (' + esc(ASOF) + ")</div></div>";
    }

    /* holdings breakdown bars */
    var holdbars = "";
    if (!f.special && x > 0) {
      var parts = [
        ["TSLA", f.tsla || 0],
        ["SPCX", (f.spacex || 0) + (f.xai || 0)],
      ].filter(function (p) { return p[1] > 0; });
      var max = Math.max.apply(null, parts.map(function (p) { return p[1]; }));
      holdbars = '<div class="holdbars">' + parts.map(function (p) {
        return '<div class="holdbar-row"><span class="hb-label">' + esc(p[0]) + '</span><span class="holdbar-track"><span class="holdbar-fill" style="width:' + (p[1] / max * 100) + '%"></span></span><span class="hb-val">' + fmtPct(p[1]) + "</span></div>";
      }).join("") + "</div>";
    }

    /* alternatives */
    var altsHTML = "";
    if (f.alts && f.alts.length) {
      altsHTML =
        '<div class="alts"><p class="alts-title">Same lane, <b>zero (or near-zero) Musk</b>, certified alternatives</p>' +
        '<div class="grid grid-3">' + f.alts.map(cardHTML).join("") + "</div></div>";
    } else if (!f.special && x >= 5) {
      altsHTML =
        '<div class="alts"><p class="alts-title">Alternatives</p>' +
        '<div class="prose"><p class="serif">There is no de-Musked version of this. It is what it is on purpose. Browse Exhibit B on the <a href="#/">home page</a> for certified funds.</p></div></div>';
    }

    /* share */
    var shareText;
    if (f.special === "doge") shareText = "I tried to check if Dogecoin is Musk-free. The inspectors could not stamp it.";
    else if (x === 0) shareText = f.t + " is officially MUSK-FREE CERTIFIED™. 0.0% Elon. Check your funds:";
    else if (x < 0) shareText = f.t + " is certified ANTI-MUSK (" + fmtPct(x) + " exposure). It shorts Tesla. Check your funds:";
    else shareText = "⚠️ " + f.t + " CONTAINS MUSK. " + fmtPct(x) + " of it is Elon companies. Check your funds:";
    /* Registry funds have pre-rendered share stubs (f/T.html) with their own
       OG card, so the tweet unfurls with this fund's stamp; provisional live
       results fall back to the SPA hash route. */
    var baseDir = location.origin + location.pathname.replace(/[^\/]*$/, "");
    var sharePage = f.live ? baseDir + "#/f/" + encodeURIComponent(f.t) : baseDir + "f/" + encodeURIComponent(f.t) + ".html";
    var shareURL = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText + " ") + "&url=" + encodeURIComponent(sharePage);
    var cardBtn = f.live ? "" : '<a class="btn ghost" href="og/' + encodeURIComponent(f.t) + '.png" download="' + esc(f.t) + '-musk-verdict.png">Download card</a>';

    var headLeft = f.live
      ? "Provisional Certificate. Live Scan No. " + certNo
      : "Certificate of Inspection No. " + certNo;
    var headRight = f.live ? "Live market data" : "Data as of " + esc(ASOF);

    return (
      '<section class="cert"><div class="wrap">' +
      '<div class="cert-doc">' +
      '<div class="cert-head"><span>' + headLeft + "</span><span>Bureau of Portfolio Purity</span><span>" + headRight + "</span></div>" +
      '<div class="cert-body">' +
      '<div class="cert-cols"><div>' +
      '<p class="cert-eyebrow">This document certifies the Musk content of</p>' +
      '<h1 class="cert-ticker">' + esc(f.t) + "</h1>" +
      '<p class="cert-fullname">' + esc(f.n) + "</p>" +
      '<p class="cert-meta"><span>' + metaBits + "</span>" +
      (f.dailyVerified
        ? '<span class="dv-chip">' + (f.dailyVerified.src === "nport"
          ? "✓ verified via SEC N-PORT filing · holdings as of " + esc(f.dailyVerified.asof || "last quarter")
          : f.dailyVerified.src === "issuer"
            ? "✓ verified via the issuer’s own daily holdings file · " + esc(f.dailyVerified.date)
          : f.dailyVerified.src === "mirror"
            ? "✓ mirrors " + esc(f.dailyVerified.via) + ", same index, verified daily"
            : "✓ verified by daily scan · " + esc(f.dailyVerified.date)) + "</span>"
        : f.autoGen
          ? '<span class="dv-chip">' + (f.genIssuer
            ? "✓ auto-registered from issuer catalog · full holdings scanned " + esc(typeof GEN_INTL_ASOF !== "undefined" ? GEN_INTL_ASOF : "recently")
            : "✓ auto-registered · holdings scanned " + esc(typeof GEN_ASOF !== "undefined" ? GEN_ASOF : "recently")) + "</span>"
          : "") +
      "</p>" +
      '<div class="cert-stampzone">' + stampHTML(f, "lg") + "</div>" +
      dollarLine +
      recHTML +
      noteHTML +
      holdbars +
      '<div class="cert-actions">' +
      '<a class="btn" href="' + shareURL + '" target="_blank" rel="noopener">Share verdict on X</a>' +
      cardBtn +
      '<button class="btn ghost" data-print>Print certificate</button>' +
      '<a class="btn ghost" href="#/">Inspect another</a>' +
      "</div>" +
      "</div>" +
      (mfacts || "") +
      "</div>" +
      '<div id="live-slot" aria-live="polite"></div>' +
      '<div class="sig-line"><div class="sig-block"><span class="sig-scrawl">The Inspectors</span><hr/><p class="sig-caption">Chief Inspector, Bureau of Portfolio Purity</p></div>' +
      '<div class="sig-block" style="max-width:220px;">' + stampHTML(f, "sm") + '<hr style="margin-top:14px;"/><p class="sig-caption">Official seal (decorative, like most seals)</p></div></div>' +
      "</div>" +
      '<div class="cert-foot"><div class="barcode" aria-hidden="true">' + barcodeHTML(f.t) + "</div>" +
      '<p class="cert-foot-note">Figures approximate; holdings drift daily. Verify with the fund issuer’s official holdings disclosure before making decisions. Parody document, confers bragging rights only.</p></div>' +
      "</div>" +
      altsHTML +
      '<div style="margin-top:48px;">' + searchboxHTML("cert-search") + "</div>" +
      "</div></section>"
    );
  }

  function barcodeHTML(seed) {
    var out = "";
    var n = 34 + (seed.charCodeAt(0) % 8);
    for (var i = 0; i < n; i++) out += "<i></i>";
    return out;
  }

  /* ------------- portfolio audit (Form MF-2) ------------- */

  function parsePortfolio(text, extras) {
    var known = [], unknown = [], noAmount = [];
    text.split(/[\n;]+/).forEach(function (line) {
      line = line.trim();
      if (!line) return;
      var m = line.match(/^\$?\s*([A-Za-z.&\-]{1,12})[\s,:]*\$?\s*([\d,]+(?:\.\d+)?)?/);
      if (!m) return;
      var t = m[1].toUpperCase();
      var amt = m[2] ? parseFloat(m[2].replace(/,/g, "")) : null;
      var f = byTicker[t] || (extras && extras[t]);
      if (!f) { unknown.push(t); return; }
      if (amt === null) noAmount.push(t);
      known.push({ f: f, amt: amt });
    });
    // Weighting: if nothing has an amount, equal-weight everything.
    // If some do, lines without get the average of the specified amounts.
    var specified = known.filter(function (e) { return e.amt !== null; });
    if (!specified.length) {
      known.forEach(function (e) { e.amt = 1; });
      noAmount = [];
    } else if (noAmount.length) {
      var avg = specified.reduce(function (s, e) { return s + e.amt; }, 0) / specified.length;
      known.forEach(function (e) { if (e.amt === null) e.amt = avg; });
    }
    return { known: known, unknown: unknown, noAmount: noAmount };
  }

  function portfolioExposure(f) {
    if (f.special === "private") return 100;
    if (f.special === "doge") return 0;
    return exposure(f);
  }

  function portfolioView() {
    var saved = "";
    try { saved = localStorage.getItem("mf-portfolio") || ""; } catch (e) {}
    return (
      '<section class="cert"><div class="wrap">' +
      '<p class="kicker">Form MF-2. Full portfolio audit</p>' +
      '<h1 class="h-display" style="font-size:clamp(34px,6vw,64px);">Audit the whole thing<span style="color:var(--red)">.</span></h1>' +
      '<p class="hero-sub" style="margin-top:16px;">One fund at a time is for tourists. Paste every position, ticker plus dollar amount, one per line, <b>or drop the positions CSV your brokerage exports</b> (Fidelity, Schwab, Vanguard, Robinhood all have one). You get a single blended verdict plus a De-Musk Plan. Everything is parsed in your browser; nothing is uploaded anywhere.</p>' +
      '<div class="pf-entry" id="pf-drop">' +
      '<textarea class="pf-input" id="pf-input" rows="8" spellcheck="false" placeholder="VOO 25000\nQQQ 10000\nSCHD 8000\nBND 5000\nTSLA 2000\n\n…or drag your brokerage CSV anywhere onto this box">' + esc(saved) + "</textarea>" +
      '<div class="pf-actions"><button class="btn" data-audit>Run the audit</button>' +
      '<label class="btn ghost" style="cursor:pointer;">Import brokerage CSV<input type="file" id="pf-file" accept=".csv,text/csv" style="display:none;"></label>' +
      '<button class="btn ghost" data-audit-demo>Demo portfolio</button></div>' +
      "</div>" +
      '<div id="pf-results"></div>' +
      "</div></section>"
    );
  }

  /* Parse a brokerage positions CSV (Fidelity / Schwab / Vanguard /
     Robinhood exports and most others). Returns "TICKER VALUE" lines. */
  function csvToPositions(text) {
    function splitRow(line) {
      var out = [], cur = "", inQ = false;
      for (var i = 0; i < line.length; i++) {
        var ch = line[i];
        if (ch === '"') inQ = !inQ;
        else if (ch === "," && !inQ) { out.push(cur); cur = ""; }
        else cur += ch;
      }
      out.push(cur);
      return out.map(function (s) { return s.trim(); });
    }
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
    var symCol = -1, valCol = -1, headerIdx = -1;
    for (var i = 0; i < Math.min(lines.length, 12); i++) {
      var cells = splitRow(lines[i]).map(function (c) { return c.toLowerCase().replace(/["']/g, ""); });
      var s = -1, v = -1;
      cells.forEach(function (c, j) {
        if (s === -1 && /^(symbol|ticker|investment|holding)$/.test(c)) s = j;
        if (v === -1 && /^(market value|current value|total value|value|balance|amount|mkt val \(market value\))$/.test(c)) v = j;
      });
      if (s !== -1 && v !== -1) { symCol = s; valCol = v; headerIdx = i; break; }
    }
    if (headerIdx === -1) return null;
    var out = [];
    for (var r = headerIdx + 1; r < lines.length; r++) {
      var row = splitRow(lines[r]);
      var sym = (row[symCol] || "").replace(/["'*]/g, "").trim().toUpperCase();
      var val = parseFloat((row[valCol] || "").replace(/[^0-9.\-]/g, ""));
      if (!/^[A-Z][A-Z0-9.\-]{0,9}$/.test(sym)) continue;      // skip cash sweeps, totals, prose
      if (!isFinite(val) || val <= 0) continue;
      out.push(sym + " " + Math.round(val));
    }
    return out.length ? out.join("\n") : null;
  }

  /* De-Musk Plan: for each musky position, propose the best registry
     alternative and quantify the blended before/after. */
  function demuskPlanHTML(rows, total, muskDollars) {
    var blended = muskDollars / total * 100;
    if (blended <= 0.05) return "";
    var swaps = [], remaining = muskDollars, unswappable = [];
    rows.forEach(function (r) {
      if (r.x <= 0.1) return;
      var alt = null;
      (r.f.alts || []).some(function (a) {
        var af = byTicker[a];
        if (af && !af.special && exposure(af) <= 0.2) { alt = af; return true; }
        return false;
      });
      if (alt) {
        var altX = exposure(alt);
        var saved = r.amt * (r.x - altX) / 100;
        remaining -= saved;
        swaps.push({ from: r.f, to: alt, amt: r.amt, saved: saved, fromX: r.x, toX: altX });
      } else {
        unswappable.push(r);
      }
    });
    if (!swaps.length && !unswappable.length) return "";
    var after = Math.max(0, remaining) / total * 100;
    var eq = rows.every(function (r) { return r.amt === 1; });
    var fmtAmt = function (d) { return eq ? (d / total * 100).toFixed(2) + "% of total" : fmtMoney(Math.round(d)); };

    var html = '<div class="pf-plan"><div class="pf-plan-head">FORM MF-3 · THE DE-MUSK PLAN</div>';
    if (swaps.length) {
      html += '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Swap</th><th>Same lane</th><th>Musk %</th><th>Musk removed</th></tr></thead><tbody>' +
        swaps.map(function (s) {
          return "<tr><td><a href='#/f/" + esc(s.from.t) + "'>" + esc(s.from.t) + "</a> → <a href='#/f/" + esc(s.to.t) + "'>" + esc(s.to.t) + "</a></td>" +
            "<td>" + esc(s.to.n) + "</td>" +
            '<td class="num">' + fmtPct(s.fromX) + " → " + fmtPct(s.toX) + "</td>" +
            '<td class="num" style="color:var(--green)">−' + fmtAmt(s.saved) + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    }
    if (unswappable.length) {
      html += '<p class="pf-note">No like-for-like Musk-free substitute on file for: ' + unswappable.map(function (r) {
        return "<b>" + esc(r.f.t) + "</b> (" + fmtPct(r.x) + ")";
      }).join(", ") + ". Options: trim the position, or accept the Musk and stop reading websites like this one.</p>";
    }
    html += '<div class="pf-plan-bottom">Execute every swap and your portfolio goes from <b style="color:var(--red)">' + fmtPct(blended) + "</b> Musk to <b style=\"color:var(--green)\">" + fmtPct(after) + "</b>." +
      '<div class="pf-plan-fine">Swaps stay in the same broad lane (index style, sector, income) but are NOT identical exposures, different holdings, weights, and tax consequences. Selling in a taxable account can realize gains. This is a parody form, not a fiduciary; talk to a professional before acting.</div></div></div>';
    return html;
  }

  function renderPortfolioResults(text, extras) {
    var out = document.getElementById("pf-results");
    var parsed = parsePortfolio(text, extras);

    /* Unknown tickers: try live lookups once, then re-render with results */
    if (parsed.unknown.length && !extras && typeof LIVE !== "undefined" && window.fetch) {
      var targets = parsed.unknown.slice(0, 8);
      Promise.all(targets.map(function (t) { return LIVE.lookup(t); })).then(function (results) {
        var found = {};
        results.forEach(function (r, i) {
          if (!r) return;
          var lv = livePctPair(r.scan);
          found[targets[i]] = {
            t: targets[i], n: r.name, live: true,
            type: r.kind === "e" ? "ETF" : r.kind === "mutf" ? "Mutual fund" : "Stock",
            cat: "Live lookup",
            tsla: lv.tsla, spacex: lv.spcx,
            special: r.kind === "mutf" && !r.scan ? "limited" : undefined
          };
        });
        if (Object.keys(found).length && document.getElementById("pf-results") === out) {
          renderPortfolioResults(text, found);
        }
      });
    }

    if (!parsed.known.length) {
      out.innerHTML = '<div class="nf-box" style="margin-top:32px;"><div class="prose"><p><b>Nothing we recognize yet.</b> One position per line, like <span style="font-family:var(--font-mono)">VOO 25000</span>.' +
        (parsed.unknown.length ? " We didn’t recognize: <b>" + parsed.unknown.map(esc).join(", ") + "</b>." : "") +
        "</p></div></div>";
      return;
    }
    try { localStorage.setItem("mf-portfolio", text); } catch (e) {}

    var total = parsed.known.reduce(function (s, e) { return s + e.amt; }, 0);
    var muskDollars = 0;
    var rows = parsed.known.map(function (e) {
      var x = portfolioExposure(e.f);
      var contrib = e.amt * x / 100;
      muskDollars += contrib;
      return { f: e.f, amt: e.amt, x: x, contrib: contrib };
    }).sort(function (a, b) { return b.contrib - a.contrib; });

    var blended = muskDollars / total * 100;
    var fake = { tsla: blended };
    var v = verdict(fake);
    var per10k = Math.round(blended * 100);
    var equalWeighted = parsed.known.every(function (e) { return e.amt === 1; });

    var tblRows = rows.map(function (r) {
      var w = r.amt / total * 100;
      return "<tr><td><a href='#/f/" + esc(r.f.t) + "'>" + esc(r.f.t) + "</a>" + (r.f.live ? ' <span class="lt-live">LIVE</span>' : "") + "</td>" +
        "<td>" + esc(r.f.n) + "</td>" +
        '<td class="num">' + w.toFixed(1) + "%</td>" +
        '<td class="num">' + (r.f.special === "limited" ? "?" : fmtPct(r.x)) + "</td>" +
        '<td class="num"><span class="bar' + (r.contrib <= 0 ? " ok" : "") + '" style="width:' + Math.min(90, Math.abs(r.contrib) / total * 100 * 18) + 'px"></span>' +
        (equalWeighted ? (r.contrib / total * 100).toFixed(2) + "% of total" : fmtMoney(Math.round(r.contrib))) + "</td></tr>";
    }).join("");

    var shareText = blended === 0
      ? "OFFICIAL: my entire portfolio is MUSK-FREE CERTIFIED™. 0.0% Elon across every holding. Get yours stamped:"
      : "OFFICIAL: my portfolio is " + fmtPct(blended) + " Musk" + (blended >= 5 ? " 💀" : " 😬") + ", audited by the Bureau of Portfolio Purity. Get yours stamped:";
    var shareURL = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText + " ") + "&url=" + encodeURIComponent(location.origin + location.pathname + "#/portfolio");

    out.innerHTML =
      '<div class="cert-doc" style="margin-top:38px;">' +
      '<div class="cert-head"><span>Consolidated Audit No. MF2-2026-' + String(parsed.known.length).padStart(2, "0") + "</span><span>Bureau of Portfolio Purity</span><span>Data as of " + esc(ASOF) + "</span></div>" +
      '<div class="cert-body">' +
      '<p class="cert-eyebrow">Blended verdict across ' + parsed.known.length + " position" + (parsed.known.length > 1 ? "s" : "") + "</p>" +
      '<div class="pf-verdict-row">' +
      '<div class="stamp stamp-' + v.cls + ' stamp-md" role="img"><span>' + esc(v.stamp) + "<small>" + esc(v.sub) + "</small></span></div>" +
      '<div class="pf-big"><div class="pf-big-num ' + (blended === 0 ? "ok" : "") + '">' + fmtPct(blended) + "</div><div class=\"pf-big-label\">of your portfolio is Musk enterprises</div>" +
      (equalWeighted
        ? '<div class="pf-big-sub">equal-weighted · that’s ' + fmtMoney(per10k) + " per $10,000 invested</div>"
        : '<div class="pf-big-sub">' + fmtMoney(Math.round(muskDollars)) + " of your " + fmtMoney(Math.round(total)) + "</div>") +
      "</div></div>" +
      '<div style="overflow-x:auto;margin-top:30px;"><table class="tbl">' +
      "<thead><tr><th>Ticker</th><th>Holding</th><th>Weight</th><th>Musk %</th><th>Musk " + (equalWeighted ? "share" : "dollars") + "</th></tr></thead><tbody>" + tblRows + "</tbody></table></div>" +
      (parsed.unknown.length ? '<p class="pf-note">Not on file (excluded from the math): <b>' + parsed.unknown.map(esc).join(", ") + "</b>. Search “[ticker] full holdings” and inspect manually.</p>" : "") +
      (parsed.noAmount.length ? '<p class="pf-note">No amount given for <b>' + parsed.noAmount.map(esc).join(", ") + "</b>, weighted at your average position size.</p>" : "") +
      demuskPlanHTML(rows, total, muskDollars) +
      '<div class="cert-actions">' +
      '<a class="btn" href="' + shareURL + '" target="_blank" rel="noopener">Share verdict on X</a>' +
      '<button class="btn ghost" data-print>Print audit</button>' +
      "</div></div>" +
      '<div class="cert-foot"><div class="barcode" aria-hidden="true">' + barcodeHTML("MF2") + "</div>" +
      '<p class="cert-foot-note">Blended exposure = Σ (position weight × fund’s Musk weight), using approximate disclosures as of ' + esc(ASOF) + ". Computed locally in your browser; we never see your holdings. Parody document, confers bragging rights only.</p></div>" +
      "</div>";

    var printBtn = out.querySelector("[data-print]");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function wirePortfolio(scope) {
    var input = scope.querySelector("#pf-input");
    if (!input) return;
    var run = function () { renderPortfolioResults(input.value); };
    scope.querySelector("[data-audit]").addEventListener("click", run);
    scope.querySelector("[data-audit-demo]").addEventListener("click", function () {
      input.value = "VOO 25000\nQQQ 10000\nVTI 12000\nSCHD 8000\nBND 5000\nARKK 3000\nTSLA 2000\nGLD 1500";
      run();
    });
    input.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
    });

    /* brokerage CSV: file picker + drag-drop */
    function importCSV(file) {
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var positions = csvToPositions(String(reader.result || ""));
        if (positions) { input.value = positions; run(); }
        else {
          input.value = "";
          input.placeholder = "Couldn't find Symbol + Value columns in that CSV, export the *positions* view from your brokerage, or type tickers manually.";
        }
      };
      reader.readAsText(file);
    }
    var fileEl = scope.querySelector("#pf-file");
    if (fileEl) fileEl.addEventListener("change", function () { importCSV(fileEl.files[0]); });
    var drop = scope.querySelector("#pf-drop");
    if (drop) {
      ["dragover", "dragenter"].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("pf-dragging"); });
      });
      ["dragleave", "drop"].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("pf-dragging"); });
      });
      drop.addEventListener("drop", function (e) {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) importCSV(e.dataTransfer.files[0]);
      });
    }

    if (input.value.trim()) run();
  }

  /* ------------- live data integration ------------- */

  function livePctPair(scan) {
    return { tsla: scan ? scan.tsla : 0, spcx: scan ? scan.spcx : 0, total: scan ? scan.tsla + scan.spcx : 0 };
  }

  function liveStatHTML(label, value) {
    if (value == null || value === "" || value === "n/a") return "";
    return '<div class="lp-stat"><span class="lp-k">' + esc(label) + '</span><span class="lp-v">' + esc(String(value)) + "</span></div>";
  }

  function renderLivePanel(f, data) {
    var slot = document.getElementById("live-slot");
    if (!slot || !data) return;
    var q = LIVE.fmtQuoteLine(data.quote);
    var ov = data.overview || {};
    var scan = data.scan;
    var html = '<div class="live-panel">';
    html += '<div class="lp-head"><span class="lp-dot"></span>LIVE READOUT <span class="lp-src">source: market data API' + (q && q.asof ? " · " + esc(q.asof) : "") + "</span></div>";

    html += '<div class="lp-stats">';
    if (q) {
      html += liveStatHTML("Price", q.price);
      html += '<div class="lp-stat"><span class="lp-k">Today</span><span class="lp-v ' + (q.up ? "up" : "down") + '">' + esc(q.chg) + "</span></div>";
      if (q.l52 != null && q.h52 != null) html += liveStatHTML("52-wk range", "$" + q.l52 + " – $" + q.h52);
    }
    html += liveStatHTML(ov.aum ? "Assets" : "Market cap", ov.aum || ov.marketCap);
    html += liveStatHTML("Expense ratio", ov.expenseRatio);
    html += liveStatHTML("Dividend yield", ov.dividendYield);
    html += liveStatHTML("P/E", ov.peRatio);
    if (ov.holdings) html += liveStatHTML("Holdings", ov.holdings);
    html += "</div>";

    if (scan) {
      var lv = livePctPair(scan);
      var reg = (f.tsla || 0) + (f.spacex || 0);
      html += '<div class="lp-scan"><div class="lp-scan-title">Live holdings scan, top ' + scan.rows.length + " positions (" + scan.coverage.toFixed(0) + "% of assets)</div>";
      if (scan.matched.length) {
        html += '<table class="tbl lp-tbl"><thead><tr><th>Detected</th><th>Holding</th><th>Live weight</th></tr></thead><tbody>' +
          scan.matched.map(function (m) {
            return '<tr><td class="num" style="color:var(--red)">' + esc(m.kind) + "</td><td>" + esc(m.name) + '</td><td class="num">' + m.w.toFixed(2) + "%</td></tr>";
          }).join("") + "</tbody></table>";
      } else {
        html += '<p class="lp-clean">No Tesla or SpaceX detected in the visible holdings. Positions under ~1% can sit below the top-25 cutoff' + (reg > 0 ? ", our registry still expects ~" + fmtPct(reg) + " here" : "") + ".</p>";
      }
      /* discrepancy handling */
      if (!f.live) {
        if (lv.total > reg + 0.6) {
          html += '<div class="lp-alert">⚡ The live scan reads <b>' + fmtPct(lv.total) + "</b> Musk, higher than our registry (" + fmtPct(reg) + "). Live wins. Stamp adjusted above.</div>";
          restampLive(f, lv);
        } else if (f.unverified && lv.total > 0.1) {
          html += '<div class="lp-alert">⚡ Registry had this one pending, the live scan now detects <b>' + fmtPct(lv.total) + "</b> Musk exposure. Stamp adjusted above.</div>";
          restampLive(f, lv);
        } else if (f.unverified && lv.total === 0) {
          html += '<div class="lp-ok">✓ Live scan agrees: nothing visible in the top holdings as of today. This fund is on SPCX-watch, recheck after index rebalances.</div>';
        } else if (reg > 0 && Math.abs(lv.total - reg) <= 0.6 && lv.total > 0) {
          html += '<div class="lp-ok">✓ Live scan (' + fmtPct(lv.total) + ") agrees with the registry (" + fmtPct(reg) + "). Stamp stands.</div>";
        }
      }
      html += "</div>";
    }
    html += '<p class="lp-foot">Live quotes and holdings via a public market-data API, fetched by your browser just now and cached ~10 min. If this panel is missing, the API is down and you’re seeing registry data only.</p>';
    html += "</div>";
    slot.innerHTML = html;
  }

  function restampLive(f, lv) {
    var zone = document.querySelector(".cert-stampzone");
    if (!zone) return;
    var merged = {};
    for (var k in f) merged[k] = f[k];
    merged.tsla = lv.tsla > 0 ? lv.tsla : f.tsla;
    merged.spacex = lv.spcx > 0 ? lv.spcx : f.spacex;
    zone.innerHTML = stampHTML(merged, "lg") + '<div class="live-adj">⚡ LIVE-ADJUSTED · ' + fmtPct((merged.tsla || 0) + (merged.spacex || 0)) + " DETECTED NOW</div>";
  }

  function enhanceFundLive(f) {
    if (typeof LIVE === "undefined" || !window.fetch) return;
    if (f.region) return; // TSX/UCITS listings: no US market-data API; mirror + registry cover them
    LIVE.enrich(f).then(function (data) {
      if (data) renderLivePanel(f, data);
    });
  }

  /* Provisional certificate for tickers not in the registry */
  function liveFundView(t) {
    app.innerHTML =
      '<section class="cert"><div class="wrap">' +
      '<p class="kicker">Live inspection in progress</p>' +
      '<h1 class="h-display" style="font-size:clamp(34px,6vw,64px);">Scanning ' + esc(t) + '<span class="blink">…</span></h1>' +
      '<p class="hero-sub" style="margin-top:16px;">Not in our verified registry, running a live lookup: classifying the ticker, pulling holdings, scanning for Musk enterprises.</p>' +
      "</div></section>";

    LIVE.lookup(t).then(function (r) {
      if (location.hash !== "#/f/" + t) return; // user navigated away
      if (!r) { app.innerHTML = notFoundView(t); wireSearch(app); return; }
      var lv = livePctPair(r.scan);
      var typeLabel = r.kind === "e" ? "ETF" : r.kind === "mutf" ? "Mutual fund" : "Stock";
      var f = {
        t: r.sym, n: r.name, type: typeLabel,
        cat: "Live lookup, not yet in the verified registry",
        live: true,
        tsla: lv.tsla, spacex: lv.spcx,
        liveClean: r.kind === "e" && r.scan && lv.total === 0,
        special: r.kind === "mutf" && !r.scan ? "limited" : (r.kind === "s" && !r.scan && lv.total === 0 ? undefined : undefined),
        note: r.kind === "e"
          ? (lv.total > 0
            ? "Live top-25 holdings scan detected Musk positions (see panel below). Weights below the top-25 cutoff are invisible to this scan, treat the number as a floor, not a ceiling."
            : "Live top-25 holdings scan found no Tesla or SpaceX. Small positions (under roughly 1%) can hide below the cutoff, check the issuer’s full holdings list to be certain.")
          : r.kind === "mutf"
            ? "Mutual fund holdings aren’t machine-readable in real time. Search “" + r.sym + " full holdings”, open the issuer’s page, and Ctrl-F for Tesla and SpaceX."
            : "An individual company that is not Tesla and not SpaceX. Direct Musk equity: zero. (Business relationships with Musk companies aren’t equity, see methodology.)",
        alts: [], aliases: []
      };
      if (f.special === "limited") { f.tsla = 0; f.spacex = 0; }
      app.innerHTML = fundView(f);
      var v = verdict(f);
      document.title = f.t + ": " + v.stamp + " (provisional) · Musk-Free Certified™";
      window.scrollTo(0, 0);
      wireSearch(app);
      renderLivePanel(f, { quote: r.quote, overview: r.overview, scan: r.scan });
    });
  }

  /* Live quotes inside the Musk-companies cards */
  function fillLiveTape() {
    if (typeof LIVE === "undefined" || !window.fetch) return;
    ["TSLA", "SPCX"].forEach(function (t) {
      var el = document.getElementById("co-live-" + t);
      if (!el) return;
      Promise.all([LIVE.quote("s", t), LIVE.overview("s", t)]).then(function (res) {
        var q = LIVE.fmtQuoteLine(res[0]);
        var ov = res[1] || {};
        if (!q) return;
        el.innerHTML = '<span class="lp-dot"></span><span class="lt-live">LIVE</span> ' +
          '<span class="lt-price" style="font-size:22px;">' + q.price + ' <span class="' + (q.up ? "up" : "down") + '">' + q.chg + "</span></span>" +
          '<span class="lt-sub">' + (ov.marketCap ? " · mkt cap " + esc(ov.marketCap) : "") + "</span>";
      });
    });
  }

  /* ------------- The Big Board (largest Musk-holding funds) ------------- */

  function fundAumB(f) {
    var s = f.dailyVerified && f.dailyVerified.aum;
    if (s) {
      var m = String(s).match(/([\d.]+)\s*([TBM])/i);
      if (m) return parseFloat(m[1]) * (m[2].toUpperCase() === "T" ? 1000 : m[2].toUpperCase() === "M" ? 0.001 : 1);
    }
    return f.aumB || 0;
  }
  function fmtAumB(v) {
    return v >= 1000 ? "$" + (v / 1000).toFixed(2).replace(/\.?0+$/, "") + "T" : v >= 10 ? "$" + Math.round(v) + "B" : "$" + v.toFixed(1) + "B";
  }

  function bigBoardHTML() {
    return (
      '<section class="section"><div class="wrap">' +
      '<p class="kicker">Exhibit AA. The Big Board</p>' +
      '<h2 class="h-display" style="font-size:clamp(28px,4vw,44px);margin-bottom:10px;">The largest funds holding Musk companies</h2>' +
      '<p class="hero-sub" style="margin-top:8px;max-width:64ch;">Ranked by assets. Every one comes with the Bureau’s recommended clean substitute. Assets approximate; exposure verified where chips say so.</p>' +
      '<div class="bb-filters" role="tablist">' +
      [["ALL", "🌍 All"], ["US", "🇺🇸 United States"], ["CA", "🇨🇦 Canada"], ["EU", "🇪🇺 Europe"]].map(function (r, i) {
        return '<button class="chip bb-chip' + (i === 0 ? " active" : "") + '" data-bb-region="' + r[0] + '">' + r[1] + "</button>";
      }).join("") +
      "</div>" +
      '<div style="overflow-x:auto;margin-top:18px;"><table class="tbl"><thead><tr><th>#</th><th>Fund</th><th>Assets</th><th>Musk %</th><th>Choose instead</th></tr></thead><tbody id="bb-body"></tbody></table></div>' +
      "</div></section>"
    );
  }

  function fillBigBoard(region) {
    var body = document.getElementById("bb-body");
    if (!body) return;
    var rows = FUNDS.filter(function (f) {
      if (f.special || exposure(f) <= 0.25) return false;
      if (region !== "ALL" && (f.region || "US") !== region) return false;
      return fundAumB(f) > 0;
    }).sort(function (a, b) { return fundAumB(b) - fundAumB(a); }).slice(0, 10);

    body.innerHTML = rows.map(function (f, i) {
      var rec = bestAlt(f);
      var rm = regionMeta(f);
      return "<tr><td class='num'>" + (i + 1) + "</td>" +
        "<td>" + rm.flag + " <a href='#/f/" + esc(f.t) + "'>" + esc(f.t) + "</a><div class='tr-funds'>" + esc(f.n) + "</div></td>" +
        "<td class='num'>" + fmtAumB(fundAumB(f)) + "</td>" +
        "<td class='num' style='color:var(--red)'>" + fmtPct(exposure(f)) + "</td>" +
        "<td>" + (rec ? "<a href='#/f/" + esc(rec.f.t) + "'>" + esc(rec.f.t) + "</a> <span class='tr-funds' style='display:inline'>" + fmtPct(exposure(rec.f)) + " Musk" + (rec.fallback ? " · nearest clean lane" : "") + "</span>" : "-") + "</td></tr>";
    }).join("") || '<tr><td colspan="5">No qualifying funds in this region’s registry yet.</td></tr>';
  }

  function wireBigBoard(scope) {
    var wrap = scope.querySelector(".bb-filters");
    if (!wrap) return;
    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-bb-region]");
      if (!btn) return;
      wrap.querySelectorAll(".bb-chip").forEach(function (c) { c.classList.toggle("active", c === btn); });
      fillBigBoard(btn.getAttribute("data-bb-region"));
    });
    fillBigBoard("ALL");
  }

  /* SPCX inclusion tracker */
  function trackerHTML() {
    var chip = { in: '<span class="tr-chip tr-in">IN. CONTAINS SPCX</span>', out: '<span class="tr-chip tr-out">OUT. SPCX-FREE</span>', pending: '<span class="tr-chip tr-pending">PENDING</span>' };
    var rows = SPCX_TRACKER.map(function (r) {
      return "<tr><td><b>" + esc(r.index) + '</b><div class="tr-funds">' + esc(r.funds) + "</div></td><td>" + chip[r.status] + '<div class="tr-when">' + esc(r.when) + "</div></td><td>" + esc(r.note) + "</td></tr>";
    }).join("");
    return '<table class="tbl"><caption>Exhibit D. The SPCX Inclusion Tracker: is SpaceX coming to YOUR index?</caption>' +
      "<thead><tr><th>Index family</th><th>Status</th><th>The situation</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }

  /* ------------- Analytics Annex (inline SVG charts) -------------
     Single-series marks in the site's semantic red; 2px lines, ≥8px
     hover targets, recessive grid, direct labels, table fallback. */

  var CHART = { W: 720, H: 300, padL: 46, padR: 96, padT: 18, padB: 34 };

  function chartScale(points, getY) {
    var max = 0;
    points.forEach(function (p) { max = Math.max(max, getY(p)); });
    max = max * 1.15 || 1;
    return {
      x: function (i) { return CHART.padL + (CHART.W - CHART.padL - CHART.padR) * (points.length === 1 ? 0.5 : i / (points.length - 1)); },
      y: function (v) { return CHART.H - CHART.padB - (CHART.H - CHART.padT - CHART.padB) * (v / max); },
      max: max,
    };
  }

  function chartGrid(s, fmt) {
    var out = "", n = 4;
    for (var i = 0; i <= n; i++) {
      var v = s.max * i / n, y = s.y(v);
      out += '<line x1="' + CHART.padL + '" y1="' + y + '" x2="' + (CHART.W - CHART.padR) + '" y2="' + y + '" stroke="#C9C3AE" stroke-width="1"' + (i === 0 ? ' stroke-opacity="1"' : ' stroke-opacity="0.55" stroke-dasharray="1 3"') + "/>";
      out += '<text x="' + (CHART.padL - 8) + '" y="' + (y + 3.5) + '" text-anchor="end" class="ch-axis">' + fmt(v) + "</text>";
    }
    return out;
  }

  function lineChartSVG(spec, step) {
    var pts = spec.points;
    var s = chartScale(pts, function (p) { return p[1]; });
    var d = "";
    pts.forEach(function (p, i) {
      var x = s.x(i), y = s.y(p[1]);
      if (i === 0) d += "M" + x + " " + y;
      else if (step) d += "H" + x + "V" + y;
      else d += "L" + x + " " + y;
    });
    var marks = pts.map(function (p, i) {
      var x = s.x(i), y = s.y(p[1]);
      var tip = esc(p[0]) + " · " + p[1] + (spec.unit || "%") + (p[2] ? ". " + esc(p[2]) : "");
      return '<circle cx="' + x + '" cy="' + y + '" r="3.5" fill="#C8102E"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="12" fill="transparent" class="ch-hit" data-tip="' + tip + '"/>';
    }).join("");
    var xLabels = pts.map(function (p, i) {
      if (pts.length > 6 && i % 2 === 1 && i !== pts.length - 1) return "";
      return '<text x="' + s.x(i) + '" y="' + (CHART.H - 12) + '" text-anchor="middle" class="ch-axis">' + esc(p[0]) + "</text>";
    }).join("");
    var last = pts[pts.length - 1];
    var endLabel = '<text x="' + (s.x(pts.length - 1) + 10) + '" y="' + (s.y(last[1]) + 4) + '" class="ch-endlabel">' + last[1] + (spec.unit || "%") + "</text>";
    return '<svg viewBox="0 0 ' + CHART.W + " " + CHART.H + '" class="chart" role="img" aria-label="' + esc(spec.title) + '">' +
      chartGrid(s, function (v) { return (spec.unit === "B" ? "$" + v.toFixed(0) + "B" : v.toFixed(1) + "%"); }) +
      '<path d="' + d + '" fill="none" stroke="#C8102E" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      marks + xLabels + endLabel + "</svg>";
  }

  function barChartSVG(spec) {
    var bars = spec.bars;
    var rowH = 30, labelW = 210, valW = 60;
    var H = bars.length * rowH + 14;
    var max = Math.max.apply(null, bars.map(function (b) { return b[1]; })) * 1.05 || 1;
    var plotW = CHART.W - labelW - valW - 20;
    var rows = bars.map(function (b, i) {
      var y = 8 + i * rowH;
      var w = Math.max(0, b[1] / max * plotW);
      var zero = b[1] === 0;
      return '<text x="' + (labelW - 10) + '" y="' + (y + 15) + '" text-anchor="end" class="ch-cat">' + esc(b[0]) + "</text>" +
        (zero
          ? '<rect x="' + labelW + '" y="' + (y + 4) + '" width="2.5" height="14" fill="#0E6B37"/>'
          : '<rect x="' + labelW + '" y="' + (y + 4) + '" width="' + w + '" height="14" rx="3" fill="#C8102E"/>') +
        '<rect x="' + labelW + '" y="' + y + '" width="' + (plotW + valW) + '" height="' + rowH + '" fill="transparent" class="ch-hit" data-tip="' + esc(b[0]) + " · " + b[1] + '%"/>' +
        '<text x="' + (labelW + (zero ? 10 : w + 8)) + '" y="' + (y + 15) + '" class="ch-val"' + (zero ? ' fill="#0E6B37"' : "") + ">" + (zero ? "0% ✓" : b[1] + "%") + "</text>";
    }).join("");
    return '<svg viewBox="0 0 ' + CHART.W + " " + H + '" class="chart" role="img" aria-label="' + esc(spec.title) + '">' + rows + "</svg>";
  }

  function chartCard(spec, svg, exhibit) {
    var table = '<details class="ch-data"><summary>View the data</summary><table class="tbl">' +
      "<thead><tr><th>" + (spec.points ? "Point" : "Index") + "</th><th>Value</th>" + (spec.points && spec.points[0] && spec.points[0][2] !== undefined ? "<th>Event</th>" : "") + "</tr></thead><tbody>" +
      (spec.points || spec.bars).map(function (p) {
        return "<tr><td>" + esc(p[0]) + '</td><td class="num">' + p[1] + (spec.unit === "B" ? " $B" : "%") + "</td>" + (p[2] !== undefined && spec.points ? "<td>" + esc(p[2] || "") + "</td>" : "") + "</tr>";
      }).join("") + "</tbody></table></details>";
    return '<div class="ch-card"><div class="ch-exhibit">' + esc(exhibit) + '</div><h3 class="ch-title">' + esc(spec.title) + '</h3><p class="ch-sub">' + esc(spec.sub) + "</p>" + svg +
      '<p class="ch-note">' + esc(spec.note) + "</p>" + table + "</div>";
  }

  function analyticsView() {
    return (
      '<section class="cert"><div class="wrap">' +
      '<p class="kicker">The Analytics Annex</p>' +
      '<h1 class="h-display" style="font-size:clamp(34px,6vw,64px);">The charts<span style="color:var(--red)">.</span></h1>' +
      '<p class="hero-sub" style="margin-top:16px;">Exposure over time, the passive-flow machine at work, and where the Musk actually concentrates. Figures are curated estimates from index data and analyst flow projections, approximate by nature, honest by policy.</p>' +
      '<div class="ch-grid">' +
      chartCard(ANALYTICS.tslaWeight, lineChartSVG(ANALYTICS.tslaWeight), "Exhibit F-1") +
      chartCard(ANALYTICS.spcxFlows, lineChartSVG(Object.assign({ unit: "B" }, ANALYTICS.spcxFlows), true), "Exhibit F-2") +
      chartCard(ANALYTICS.indexBars, barChartSVG(ANALYTICS.indexBars), "Exhibit F-3") +
      "</div>" +
      '<div style="margin-top:40px;">' + searchboxHTML("an-search") + "</div>" +
      "</div></section>"
    );
  }

  function wireChartTips(scope) {
    var tip = document.createElement("div");
    tip.className = "chart-tip";
    document.body.appendChild(tip);
    scope.addEventListener("mousemove", function (e) {
      var hit = e.target.closest && e.target.closest(".ch-hit");
      if (hit) {
        tip.textContent = hit.getAttribute("data-tip");
        tip.style.display = "block";
        tip.style.left = Math.min(e.pageX + 14, window.innerWidth - 260) + "px";
        tip.style.top = (e.pageY - 34) + "px";
      } else tip.style.display = "none";
    });
    scope.addEventListener("mouseleave", function () { tip.style.display = "none"; });
  }

  /* ------------- SPCX Watch (changelog) ------------- */

  function watchView() {
    return (
      '<section class="cert"><div class="wrap">' +
      '<p class="kicker">SPCX Watch, daily surveillance</p>' +
      '<h1 class="h-display" style="font-size:clamp(34px,6vw,64px);">The exposure changelog<span style="color:var(--red)">.</span></h1>' +
      '<p class="hero-sub" style="margin-top:16px;">Every night we re-scan the visible holdings of every fund in the registry and log what changed. SpaceX arriving in a fund, exiting one, or Musk exposure shifting by half a point or more. Subscribe to the <a href="feed.xml">RSS feed</a> to know the moment SPCX lands in yours.</p>' +
      '<div id="watch-log" style="margin-top:36px;"><p class="lp-clean">Loading the log…</p></div>' +
      '<div style="margin-top:44px;overflow-x:auto;">' + trackerHTML() + "</div>" +
      "</div></section>"
    );
  }

  function fillWatchLog() {
    var el = document.getElementById("watch-log");
    if (!el || !window.fetch) return;
    fetch("changelog.json").then(function (r) { return r.ok ? r.json() : null; }).then(function (log) {
      if (!log) { el.innerHTML = '<p class="lp-clean">No log available (are you running locally without the pipeline output?).</p>'; return; }
      if (!log.length) {
        el.innerHTML = '<div class="nf-box"><div class="prose"><p><b>No exposure changes on file yet.</b> The nightly scanner started recently, events appear here the first time a fund’s visible Musk holdings move. Quiet log, calm markets, watchful bureau.</p></div></div>';
        return;
      }
      var rows = log.slice(0, 100).map(function (e) {
        var chip = e.type === "spcx-added" ? '<span class="tr-chip tr-in">SPCX DETECTED</span>'
          : e.type === "spcx-removed" ? '<span class="tr-chip tr-out">SPCX EXITED</span>'
          : '<span class="tr-chip tr-pending">SHIFT</span>';
        return "<tr><td class='num'>" + esc(e.date) + "</td><td><a href='#/f/" + esc(e.t) + "'>" + esc(e.t) + "</a></td><td>" + chip + "</td><td>" + esc(e.text) + "</td></tr>";
      }).join("");
      el.innerHTML = '<table class="tbl"><caption>Exhibit E. Logged exposure events (newest first)</caption>' +
        "<thead><tr><th>Date</th><th>Ticker</th><th>Event</th><th>Detail</th></tr></thead><tbody>" + rows + "</tbody></table>";
    }).catch(function () {});
  }

  function methodologyView() {
    return (
      '<section class="cert"><div class="wrap">' +
      '<p class="kicker">Fine print, up front</p>' +
      '<h1 class="h-display" style="font-size:clamp(34px,6vw,64px);margin-bottom:26px;">Methodology<span style="color:var(--red)">.</span></h1>' +
      methodologyHTML() +
      '<div style="margin-top:44px;">' + searchboxHTML("meth-search") + "</div>" +
      "</div></section>"
    );
  }

  function faqView() {
    return (
      '<section class="cert"><div class="wrap">' +
      '<p class="kicker">Frequently asked</p>' +
      '<h1 class="h-display" style="font-size:clamp(34px,6vw,64px);margin-bottom:26px;">Questions<span style="color:var(--red)">.</span></h1>' +
      faqHTML() +
      '<div style="margin-top:44px;">' + searchboxHTML("faq-search") + "</div>" +
      "</div></section>"
    );
  }

  function notFoundView(q) {
    return (
      '<section class="cert"><div class="wrap">' +
      '<p class="kicker">Inspection failed</p>' +
      '<h1 class="h-display" style="font-size:clamp(34px,6vw,64px);margin-bottom:24px;">Not on file<span style="color:var(--red)">.</span></h1>' +
      '<div class="nf-box"><div class="prose">' +
      "<p>We couldn’t find <b>“" + esc(q) + "”</b> in the registry. We cover " + FUNDS.length + " of the most widely held funds and stocks, but not everything, yet.</p>" +
      "<p><b>DIY inspection, 60 seconds:</b> search “<i>" + esc(q) + " full holdings</i>” and open the fund issuer’s own page. Then Ctrl-F for <b>Tesla</b>, <b>SpaceX</b>, and <b>xAI</b>. If it’s a US large-cap index fund, assume roughly 1.5–2% Tesla until proven otherwise.</p>" +
      '<p class="serif">Rule of thumb: if it tracks “the market,” the market includes Elon.</p>' +
      "</div></div>" +
      '<div style="margin-top:40px;">' + searchboxHTML("nf-search") + chipsHTML() + "</div>" +
      "</div></section>"
    );
  }

  function sectionView(kind) {
    // methodology / faq / index deep links scroll to home sections
    return homeView();
  }

  /* ---------------- ticker tape ---------------- */

  function buildTape() {
    var track = document.getElementById("tape-track");
    if (!track) return;
    var items = POPULAR_CHECKS.concat(["VGT", "XLY", "BPTRX", "GLD", "TSLL", "VXUS", "RSP", "JEPQ", "BND", "TSLZ"]);
    var html = items.map(function (t) {
      var f = byTicker[t];
      if (!f) return "";
      var v = verdict(f);
      return "<span><b>" + t + "</b> <span class='tape-" + v.tone + "'>" + esc(verdictLabel(f).replace(t + " ", "")) + "</span></span>";
    }).join('<span aria-hidden="true">◆</span>');
    track.innerHTML = html + '<span aria-hidden="true">◆</span>' + html; // duplicate for seamless loop
  }

  /* ---------------- search wiring ---------------- */

  function wireSearch(scope) {
    var forms = scope.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      var box = form.parentElement.querySelector("[data-suggest]");
      var activeIdx = -1;

      function close() { box.classList.remove("open"); box.innerHTML = ""; activeIdx = -1; }

      function renderSuggest() {
        var hits = search(input.value);
        if (!hits.length || !input.value.trim()) { close(); return; }
        box.innerHTML = hits.map(function (f, i) {
          var v = verdict(f);
          return '<button type="button" class="suggest-item" data-t="' + esc(f.t) + '" role="option">' +
            '<span class="s-tick">' + esc(f.t) + '</span><span class="s-name">' + esc(f.n) + "</span>" +
            '<span class="s-dot ' + v.tone + '">' + esc(v.short) + "</span></button>";
        }).join("");
        box.classList.add("open");
        activeIdx = -1;
      }

      input.addEventListener("input", renderSuggest);
      input.addEventListener("focus", renderSuggest);
      input.addEventListener("keydown", function (e) {
        var items = box.querySelectorAll(".suggest-item");
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          if (!items.length) return;
          e.preventDefault();
          activeIdx = e.key === "ArrowDown"
            ? (activeIdx + 1) % items.length
            : (activeIdx - 1 + items.length) % items.length;
          items.forEach(function (el, i) { el.classList.toggle("active", i === activeIdx); });
        } else if (e.key === "Enter" && activeIdx >= 0 && items[activeIdx]) {
          e.preventDefault();
          go(items[activeIdx].getAttribute("data-t"));
        } else if (e.key === "Escape") {
          close();
        }
      });

      box.addEventListener("mousedown", function (e) {
        var btn = e.target.closest(".suggest-item");
        if (btn) { e.preventDefault(); go(btn.getAttribute("data-t")); }
      });

      document.addEventListener("click", function (e) {
        if (!form.parentElement.contains(e.target)) close();
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var q = input.value.trim();
        if (!q) return;
        var f = findExact(q);
        if (f) go(f.t);
        else {
          var hits = search(q);
          if (hits.length) go(hits[0].t);
          else if (/^[A-Za-z0-9.\-]{1,10}$/.test(q)) go(q.toUpperCase()); // live lookup route
          else location.hash = "#/nf/" + encodeURIComponent(q);
        }
      });

      function go(t) {
        close();
        input.value = "";
        location.hash = "#/f/" + t;
      }
    });

    var printBtn = scope.querySelector("[data-print]");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
  }

  /* ---------------- router ---------------- */

  function route() {
    var h = location.hash || "#/";
    var m;
    document.title = "Musk-Free Certified™ · Is there Elon in your index fund?";

    if ((m = h.match(/^#\/f\/([^\/]+)/))) {
      var t = decodeURIComponent(m[1]).toUpperCase();
      var f = byTicker[t];
      if (f) {
        app.innerHTML = fundView(f);
        var v = verdict(f);
        document.title = f.t + ": " + v.stamp + " · Musk-Free Certified™";
        enhanceFundLive(f);
      } else if (typeof LIVE !== "undefined" && window.fetch && /^[A-Z0-9.\-]{1,10}$/.test(t)) {
        liveFundView(t);
      } else {
        app.innerHTML = notFoundView(t);
      }
      window.scrollTo(0, 0);
    } else if ((m = h.match(/^#\/nf\/(.+)/))) {
      app.innerHTML = notFoundView(decodeURIComponent(m[1]));
      window.scrollTo(0, 0);
    } else if (h === "#/portfolio") {
      app.innerHTML = portfolioView();
      document.title = "Full Portfolio Audit. Musk-Free Certified™";
      window.scrollTo(0, 0);
      wirePortfolio(app);
    } else if (h === "#/watch") {
      app.innerHTML = watchView();
      document.title = "SPCX Watch. Musk-Free Certified™";
      window.scrollTo(0, 0);
      fillWatchLog();
    } else if (h === "#/analytics") {
      app.innerHTML = analyticsView();
      document.title = "The Analytics Annex. Musk-Free Certified™";
      window.scrollTo(0, 0);
      wireChartTips(app);
    } else if (h === "#/methodology") {
      app.innerHTML = methodologyView();
      document.title = "Methodology · Musk-Free Certified™";
      window.scrollTo(0, 0);
    } else if (h === "#/faq") {
      app.innerHTML = faqView();
      document.title = "FAQ · Musk-Free Certified™";
      window.scrollTo(0, 0);
    } else if (h === "#/index") {
      app.innerHTML = homeView();
      requestAnimationFrame(function () {
        var el = document.getElementById("musk-index");
        if (el) el.scrollIntoView();
      });
    } else {
      app.innerHTML = homeView();
      window.scrollTo(0, 0);
    }
    wireSearch(app);
    wireBigBoard(app);
    fillLiveTape();
  }

  window.addEventListener("hashchange", route);

  /* ---------------- daily-scan overlay ----------------
     data.live.json is regenerated nightly by scripts/refresh-data.mjs.
     Detection is affirmative evidence (use it, up or down); a scan MISS
     is not proof of absence (top-25 cutoff), so zeros never overwrite. */
  function applyDailyOverlay(overlay, intl) {
    if (!overlay || !overlay.funds) overlay = { funds: {} };
    var date = (overlay.generated || "").slice(0, 10);
    Object.keys(overlay.funds).forEach(function (t) {
      var f = byTicker[t];
      var rec = overlay.funds[t];
      if (!f || f.special) return;
      /* Leveraged/inverse products: holdings files list swap collateral, not
         notional exposure. Registry keeps the true multiple; no scan override,
         no misleading "verified" chip. */
      if (Math.abs(f.tsla || 0) >= 100 || /leveraged|inverse/i.test(f.cat || "")) return;
      if (rec.src === "nport") {
        /* N-PORT is the complete portfolio, zeros are affirmative too,
           EXCEPT for SPCX in filings dated before its index-inclusion wave
           (June 2026): those filings couldn't have held it yet. */
        f.tsla = rec.tsla;
        if (rec.spcx > 0 || (rec.asof && rec.asof >= "2026-06-18")) {
          f.spacex = rec.spcx;
          f.unverified = false;
        }
      } else {
        if (rec.tsla > 0) f.tsla = rec.tsla;
        if (rec.spcx > 0) f.spacex = rec.spcx;
      }
      f.dailyVerified = { date: date, cov: rec.cov, aum: rec.aum, er: rec.er, src: rec.src, asof: rec.asof };
    });
    /* Index mirrors: foreign listings of a US-verified index inherit its
       verified weights (an S&P 500 tracker is the S&P 500 in any currency). */
    FUNDS.forEach(function (f) {
      if (!f.mirror || f.dailyVerified) return;
      var m = byTicker[f.mirror];
      if (!m || !m.dailyVerified) return;
      if ((m.tsla || 0) > 0) f.tsla = m.tsla;
      if ((m.spacex || 0) > 0) f.spacex = m.spacex;
      f.dailyVerified = { date: m.dailyVerified.date, src: "mirror", via: m.t };
    });
    /* Issuer-direct holdings files (CA/EU iShares): complete daily portfolios
       with fund-of-funds look-through, beats mirrors and statics. */
    if (intl && intl.funds) {
      var iDate = (intl.generated || "").slice(0, 10);
      Object.keys(intl.funds).forEach(function (t) {
        var f = byTicker[t];
        var rec = intl.funds[t];
        if (!f || f.special) return;
        f.tsla = rec.tsla;
        f.spacex = rec.spcx;
        f.unverified = false;
        f.dailyVerified = { date: iDate, src: "issuer", asof: rec.asof };
      });
    }
    route(); // re-render current view with verified numbers
  }
  if (window.fetch) {
    Promise.all([
      fetch("data.live.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("data.intl.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ]).then(function (res) { applyDailyOverlay(res[0], res[1]); });
  }

  /* ---------------- init ---------------- */

  var asof = document.getElementById("footer-asof");
  if (asof) asof.textContent = ASOF;

  var navToggle = document.getElementById("nav-toggle");
  var masthead = document.querySelector(".masthead");
  if (navToggle && masthead) {
    navToggle.addEventListener("click", function () {
      var open = masthead.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    masthead.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        masthead.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  buildTape();
  route();
})();
