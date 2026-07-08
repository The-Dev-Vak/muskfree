/* ============================================================
   MUSK-FREE CERTIFIED — app
   Hash-routed static SPA. No dependencies, no build step.
   ============================================================ */

(function () {
  "use strict";

  var app = document.getElementById("app");
  var byTicker = {};
  FUNDS.forEach(function (f) { byTicker[f.t] = f; });

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
    if (x < 60) return { key: "extreme", stamp: "EXTREMELY MUSKY", sub: "APPROACH WITH CAUTION", cls: "red", short: "EXTREMELY MUSKY", tone: "bad" };
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
    return q.toLowerCase().replace(/[^a-z0-9&\s.]/g, "").trim();
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
      esc(v.stamp + " — " + v.sub) + '"><span>' + esc(v.stamp) + "<small>" + esc(v.sub) + "</small></span></div>";
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
      'placeholder="Type a ticker or fund name — VOO, ARKK, “fidelity 500”…" ' +
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
      '<p class="hero-sub">Probably. <span class="serif">$1.71 of every $100</span> in an S&amp;P 500 fund is Tesla — and since SpaceX&rsquo;s record IPO in June, SPCX has been landing in total-market funds, target-date funds, and (as of July&nbsp;7) the Nasdaq-100. Type any ticker — ETF, mutual fund, or stock — and get the official verdict in two seconds.</p>' +
      searchboxHTML("home-search") +
      chipsHTML() +
      "</div>" +
      '<div class="hero-stamp"><div class="stamp stamp-green stamp-md"><span>MUSK-FREE<small>SPECIMEN STAMP</small></span></div></div>' +
      "</div></div></section>" +

      '<section class="section"><div class="wrap">' +
      '<p class="kicker">Recent inspections</p>' +
      '<h2 class="h-display" style="font-size:clamp(28px,4vw,44px);margin-bottom:26px;">The funds everyone asks about</h2>' +
      '<div class="grid grid-4">' + POPULAR_CHECKS.slice(0, 8).map(cardHTML).join("") + "</div>" +
      '<a class="mf2-banner" href="#/portfolio"><span class="mf2-form">FORM MF-2</span>' +
      "<span><b>Own more than one fund?</b> Paste your whole portfolio and get a single blended verdict — one stamp for everything you hold.</span>" +
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
      liveTapeHTML() +

      '<div class="grid grid-2" style="margin-top:44px;align-items:start;">' +
      leaderboardHTML() + cleanboardHTML() +
      "</div>" +

      '<div style="margin-top:44px;overflow-x:auto;">' + trackerHTML() + "</div>" +
      '<div style="margin-top:44px;overflow-x:auto;">' + empireHTML() + "</div>" +
      "</div></section>" +

      '<section class="section"><div class="wrap">' +
      '<p class="kicker">Fine print, up front</p>' +
      '<h2 class="h-display" style="font-size:clamp(28px,4vw,44px);margin-bottom:20px;">Methodology</h2>' +
      methodologyHTML() +
      "</div></section>" +

      '<section class="section"><div class="wrap">' +
      '<p class="kicker">Frequently asked</p>' +
      '<h2 class="h-display" style="font-size:clamp(28px,4vw,44px);margin-bottom:20px;">Questions</h2>' +
      faqHTML() +
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
    return '<table class="tbl"><caption>Exhibit A — Muskiest funds in America</caption>' +
      "<thead><tr><th>Ticker</th><th>Fund</th><th>Musk exposure</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }

  function cleanboardHTML() {
    var rows = CLEAN_PICKS.map(function (t) {
      var f = byTicker[t];
      return "<tr><td><a href='#/f/" + t + "'>" + t + "</a></td><td>" + esc(f.n) +
        "</td><td>" + esc(f.cat) + "</td></tr>";
    }).join("");
    return '<table class="tbl"><caption>Exhibit B — Popular certified Musk-free funds</caption>' +
      "<thead><tr><th>Ticker</th><th>Fund</th><th>Category</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }

  function empireHTML() {
    var rows = MUSK_EMPIRE.map(function (c) {
      return "<tr><td><b>" + esc(c.name) + "</b></td><td>" + esc(c.status) + '</td><td class="num">' + esc(c.value) + "</td><td>" + esc(c.how) + "</td></tr>";
    }).join("");
    return '<table class="tbl"><caption>Exhibit C — The portfolio you may already own a piece of</caption>' +
      "<thead><tr><th>Company</th><th>Status</th><th>Valuation</th><th>How it reaches your portfolio</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }

  function methodologyHTML() {
    return (
      '<div class="prose">' +
      "<p><b>What we count.</b> Direct equity exposure to Musk-led companies: Tesla (TSLA) weight in the fund, plus SpaceX (NASDAQ: SPCX) weight — which since the February 2026 merger includes xAI, X (formerly Twitter), and Grok — plus any disclosed stakes in the still-private Neuralink or The Boring Company. Figures are percentages of fund assets from the most recent public disclosures and index data as of " + esc(ASOF) + ", rounded sensibly.</p>" +
      "<p><b>What we don’t count.</b> Supply-chain exposure (NVIDIA selling GPUs to Musk companies), index derivatives, securities lending, or the CEO’s presence in your social feed. If we counted vibes, nothing would be Musk-free.</p>" +
      "<p><b>Two data layers.</b> (1) A <b>verified registry</b> of " + FUNDS.length + " funds and stocks, hand-checked against issuer disclosures and index announcements — that’s what the stamp is based on. (2) A <b>live layer</b>: your browser queries a public market-data API for real-time quotes, assets, expense ratios, and each ETF’s current top-25 holdings, then scans those holdings for Tesla and SpaceX by ticker <i>and</i> by name (pre-IPO stakes hide under names like “SPV Exposure to SpaceX LP”). When the live scan disagrees with the registry, the live number wins and the stamp is re-issued on the spot, marked LIVE-ADJUSTED. Tickers we’ve never heard of get a fully live provisional certificate.</p>" +
      "<p><b>Limits, stated plainly.</b> The live holdings feed shows the top ~25 positions (typically 40–90% of a fund’s assets), so a sub-1% Musk position can hide below the cutoff — live scans are a floor, not a ceiling. Mutual funds don’t expose machine-readable holdings in real time at all. And SPCX is still being added to index families on their own schedules (see the Inclusion Tracker above) — funds marked “on SPCX-watch” can change any week. The issuer’s own holdings page remains the final word: search “[ticker] full holdings.”</p>" +
      '<p class="serif">This site is satire wearing a green eyeshade — but the data is real, and so is the use case. Invest according to your own values and math.</p>' +
      "</div>"
    );
  }

  function faqHTML() {
    var items = [
      ["Why isn’t Tesla in my tech fund?", "Because officially, Tesla isn’t a tech company. The GICS classification system files it under <b>Consumer Discretionary — Automobiles</b>, next to Ford and Harley-Davidson. That’s why VGT and XLK hold zero Tesla while the consumer-discretionary fund XLY is nearly one-fifth Tesla. The most effective Musk filter in finance is a filing-cabinet decision from S&amp;P and MSCI."],
      ["Is my 401(k) Musk-free?", "Almost certainly not — and it just got Muskier. Most 401(k) money defaults into target-date funds, which hold total-market index funds, which hold Tesla at roughly 1–1.7% and, since June 18, a slice of SPCX too. On a $100,000 balance, that’s comfortably over $1,000 of Elon. Check your plan’s fund lineup — the tickers are searchable right here."],
      ["Wait, SpaceX is a public company now?", "As of June 12, 2026 — NASDAQ: <a href='#/f/SPCX'>SPCX</a>, the largest IPO in history (~$1.8 trillion valuation, ~$75B raised). Index funds started absorbing it almost immediately: the CRSP total-market index (VTI, VTSAX) added it June 18, the Russell 1000 June 29, and the Nasdaq-100 (QQQ) on July 7. The big holdout is the S&amp;P 500, which requires GAAP profitability — so SPY and VOO hold zero SpaceX for now. If you want to avoid it, the S&amp;P 500, the Dow, dividend funds, and international funds are your friends."],
      ["What happened to xAI, X, and Grok?", "They’re all inside SPCX. xAI absorbed X (Twitter) in 2025; then SpaceX absorbed xAI in February 2026 at a combined $1.25 trillion valuation before the IPO. One ticker now contains the rockets, the satellites, the social network, and the chatbot. Buying — or avoiding — the Musk empire has never been more administratively convenient."],
      ["What about NVIDIA, or companies that do business with Musk?", "We only count equity ownership. NVIDIA sells enormous quantities of chips to SpaceX’s AI division and to Tesla, but owning NVDA doesn’t make you a Musk shareholder — it makes you a shareholder of a company he’s a customer of. If supply chains counted, your toothpaste would be implicated."],
      ["I want the S&P 500 without Tesla. Does that exist?", "Not as a cheap one-ticker ETF, yet. Your practical options: the <a href='#/f/DIA'>Dow (DIA)</a> — 30 blue chips, never included Tesla; <a href='#/f/RSP'>equal-weight S&P (RSP)</a> — Tesla diluted to 0.2%; value and dividend funds like <a href='#/f/VTV'>VTV</a> or <a href='#/f/SCHD'>SCHD</a> that exclude it by rule; or direct indexing, where you buy the index minus specific stocks (offered by Fidelity, Schwab, Frec, and others)."],
      ["Wait — there are anti-Musk funds?", "Yes. Inverse Tesla ETFs like <a href='#/f/TSLS'>TSLS</a> and <a href='#/f/TSLZ'>TSLZ</a> go up when Tesla goes down. They’re daily-rebalanced trading instruments that decay if held long-term — protest with your allocation, not your life savings."],
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

    var metaBits = [f.type, f.cat].map(esc).join(" · ");

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
    if (!f.note) {
      if (x === 0) autoNote = "No Tesla in the holdings, no disclosed stakes in SpaceX, xAI, Neuralink, or The Boring Company. Clean.";
      else if (x < 5) autoNote = "Carries Tesla at roughly its index weight. Not a statement — just what happens when you buy the whole market.";
      else autoNote = "This fund holds a substantial, deliberate position in Musk enterprises. This is a conviction, not an accident.";
    }
    noteHTML = '<div class="cert-note ' + (v.tone === "ok" ? "ok" : "") + '"><span class="serif">Inspector’s remarks.</span> ' + esc(f.note || autoNote) + "</div>";

    /* musk facts label */
    var mfacts = "";
    if (!f.special) {
      var rows = [
        ["Tesla, Inc. (TSLA)", f.tsla || 0],
        ["SpaceX (SPCX) — incl. xAI, X, Grok", (f.spacex || 0) + (f.xai || 0)],
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
        '<div class="mf-serving">This company is <b>privately held</b> — no ticker, no fund required to carry it.</div>' +
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
        '<div class="alts"><p class="alts-title">Same lane, <b>zero (or near-zero) Musk</b> — certified alternatives</p>' +
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
    else shareText = "⚠️ " + f.t + " CONTAINS MUSK — " + fmtPct(x) + " of it is Elon companies. Check your funds:";
    var shareURL = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText + " ") + "&url=" + encodeURIComponent(location.origin + location.pathname + "#/f/" + f.t);

    var headLeft = f.live
      ? "Provisional Certificate — Live Scan No. " + certNo
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
      '<p class="cert-meta"><span>' + metaBits + "</span></p>" +
      '<div class="cert-stampzone">' + stampHTML(f, "lg") + "</div>" +
      dollarLine +
      noteHTML +
      holdbars +
      '<div class="cert-actions">' +
      '<a class="btn" href="' + shareURL + '" target="_blank" rel="noopener">Share verdict on X</a>' +
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
      '<p class="cert-foot-note">Figures approximate; holdings drift daily. Verify with the fund issuer’s official holdings disclosure before making decisions. Parody document — confers bragging rights only.</p></div>' +
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
      '<p class="kicker">Form MF-2 — Full portfolio audit</p>' +
      '<h1 class="h-display" style="font-size:clamp(34px,6vw,64px);">Audit the whole thing<span style="color:var(--red)">.</span></h1>' +
      '<p class="hero-sub" style="margin-top:16px;">One fund at a time is for tourists. Paste every position — ticker plus dollar amount, one per line — and receive a single blended verdict for your entire portfolio. Amounts optional; without them we weight everything equally. Nothing leaves your browser.</p>' +
      '<div class="pf-entry">' +
      '<textarea class="pf-input" id="pf-input" rows="8" spellcheck="false" placeholder="VOO 25000\nQQQ 10000\nSCHD 8000\nBND 5000\nTSLA 2000">' + esc(saved) + "</textarea>" +
      '<div class="pf-actions"><button class="btn" data-audit>Run the audit</button>' +
      '<button class="btn ghost" data-audit-demo>Show me a demo portfolio</button></div>' +
      "</div>" +
      '<div id="pf-results"></div>' +
      "</div></section>"
    );
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
      : "OFFICIAL: my portfolio is " + fmtPct(blended) + " Musk" + (blended >= 5 ? " 💀" : " 😬") + " — audited by the Bureau of Portfolio Purity. Get yours stamped:";
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
      (parsed.noAmount.length ? '<p class="pf-note">No amount given for <b>' + parsed.noAmount.map(esc).join(", ") + "</b> — weighted at your average position size.</p>" : "") +
      '<div class="cert-actions">' +
      '<a class="btn" href="' + shareURL + '" target="_blank" rel="noopener">Share verdict on X</a>' +
      '<button class="btn ghost" data-print>Print audit</button>' +
      "</div></div>" +
      '<div class="cert-foot"><div class="barcode" aria-hidden="true">' + barcodeHTML("MF2") + "</div>" +
      '<p class="cert-foot-note">Blended exposure = Σ (position weight × fund’s Musk weight), using approximate disclosures as of ' + esc(ASOF) + ". Computed locally in your browser; we never see your holdings. Parody document — confers bragging rights only.</p></div>" +
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
      html += '<div class="lp-scan"><div class="lp-scan-title">Live holdings scan — top ' + scan.rows.length + " positions (" + scan.coverage.toFixed(0) + "% of assets)</div>";
      if (scan.matched.length) {
        html += '<table class="tbl lp-tbl"><thead><tr><th>Detected</th><th>Holding</th><th>Live weight</th></tr></thead><tbody>' +
          scan.matched.map(function (m) {
            return '<tr><td class="num" style="color:var(--red)">' + esc(m.kind) + "</td><td>" + esc(m.name) + '</td><td class="num">' + m.w.toFixed(2) + "%</td></tr>";
          }).join("") + "</tbody></table>";
      } else {
        html += '<p class="lp-clean">No Tesla or SpaceX detected in the visible holdings. Positions under ~1% can sit below the top-25 cutoff' + (reg > 0 ? " — our registry still expects ~" + fmtPct(reg) + " here" : "") + ".</p>";
      }
      /* discrepancy handling */
      if (!f.live) {
        if (lv.total > reg + 0.6) {
          html += '<div class="lp-alert">⚡ The live scan reads <b>' + fmtPct(lv.total) + "</b> Musk — higher than our registry (" + fmtPct(reg) + "). Live wins. Stamp adjusted above.</div>";
          restampLive(f, lv);
        } else if (f.unverified && lv.total > 0.1) {
          html += '<div class="lp-alert">⚡ Registry had this one pending — the live scan now detects <b>' + fmtPct(lv.total) + "</b> Musk exposure. Stamp adjusted above.</div>";
          restampLive(f, lv);
        } else if (f.unverified && lv.total === 0) {
          html += '<div class="lp-ok">✓ Live scan agrees: nothing visible in the top holdings as of today. This fund is on SPCX-watch — recheck after index rebalances.</div>';
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
      '<p class="hero-sub" style="margin-top:16px;">Not in our verified registry — running a live lookup: classifying the ticker, pulling holdings, scanning for Musk enterprises.</p>' +
      "</div></section>";

    LIVE.lookup(t).then(function (r) {
      if (location.hash !== "#/f/" + t) return; // user navigated away
      if (!r) { app.innerHTML = notFoundView(t); wireSearch(app); return; }
      var lv = livePctPair(r.scan);
      var typeLabel = r.kind === "e" ? "ETF" : r.kind === "mutf" ? "Mutual fund" : "Stock";
      var f = {
        t: r.sym, n: r.name, type: typeLabel,
        cat: "Live lookup — not yet in the verified registry",
        live: true,
        tsla: lv.tsla, spacex: lv.spcx,
        liveClean: r.kind === "e" && r.scan && lv.total === 0,
        special: r.kind === "mutf" && !r.scan ? "limited" : (r.kind === "s" && !r.scan && lv.total === 0 ? undefined : undefined),
        note: r.kind === "e"
          ? (lv.total > 0
            ? "Live top-25 holdings scan detected Musk positions (see panel below). Weights below the top-25 cutoff are invisible to this scan — treat the number as a floor, not a ceiling."
            : "Live top-25 holdings scan found no Tesla or SpaceX. Small positions (under roughly 1%) can hide below the cutoff — check the issuer’s full holdings list to be certain.")
          : r.kind === "mutf"
            ? "Mutual fund holdings aren’t machine-readable in real time. Search “" + r.sym + " full holdings”, open the issuer’s page, and Ctrl-F for Tesla and SpaceX."
            : "An individual company that is not Tesla and not SpaceX. Direct Musk equity: zero. (Business relationships with Musk companies aren’t equity — see methodology.)",
        alts: [], aliases: []
      };
      if (f.special === "limited") { f.tsla = 0; f.spacex = 0; }
      app.innerHTML = fundView(f);
      var v = verdict(f);
      document.title = f.t + ": " + v.stamp + " (provisional) — Musk-Free Certified™";
      window.scrollTo(0, 0);
      wireSearch(app);
      renderLivePanel(f, { quote: r.quote, overview: r.overview, scan: r.scan });
    });
  }

  /* Homepage live tape (TSLA + SPCX) */
  function liveTapeHTML() {
    return '<div class="grid grid-2" id="live-tape" style="margin-top:26px;"></div>';
  }
  function fillLiveTape() {
    var el = document.getElementById("live-tape");
    if (!el || typeof LIVE === "undefined" || !window.fetch) return;
    var symbols = [
      { t: "TSLA", label: "Tesla, Inc." },
      { t: "SPCX", label: "SpaceX (incl. xAI, X, Grok)" },
    ];
    Promise.all(symbols.map(function (s) {
      return Promise.all([LIVE.quote("s", s.t), LIVE.overview("s", s.t)]);
    })).then(function (results) {
      var html = "";
      results.forEach(function (res, i) {
        var q = LIVE.fmtQuoteLine(res[0]);
        var ov = res[1] || {};
        if (!q) return;
        html += '<a class="card lt-card" href="#/f/' + symbols[i].t + '">' +
          '<div class="lt-row"><span class="card-tick">' + symbols[i].t + '</span><span class="lp-dot"></span><span class="lt-live">LIVE</span></div>' +
          '<div class="card-name">' + esc(symbols[i].label) + "</div>" +
          '<div class="lt-price">' + q.price + ' <span class="' + (q.up ? "up" : "down") + '">' + q.chg + "</span></div>" +
          '<div class="lt-sub">' + (ov.marketCap ? "mkt cap " + esc(ov.marketCap) : "") + (q.asof ? " · " + esc(q.asof) : "") + "</div></a>";
      });
      if (html) el.innerHTML = html;
    });
  }

  /* SPCX inclusion tracker */
  function trackerHTML() {
    var chip = { in: '<span class="tr-chip tr-in">IN — CONTAINS SPCX</span>', out: '<span class="tr-chip tr-out">OUT — SPCX-FREE</span>', pending: '<span class="tr-chip tr-pending">PENDING</span>' };
    var rows = SPCX_TRACKER.map(function (r) {
      return "<tr><td><b>" + esc(r.index) + '</b><div class="tr-funds">' + esc(r.funds) + "</div></td><td>" + chip[r.status] + '<div class="tr-when">' + esc(r.when) + "</div></td><td>" + esc(r.note) + "</td></tr>";
    }).join("");
    return '<table class="tbl"><caption>Exhibit D — The SPCX Inclusion Tracker: is SpaceX coming to YOUR index?</caption>' +
      "<thead><tr><th>Index family</th><th>Status</th><th>The situation</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }

  function notFoundView(q) {
    return (
      '<section class="cert"><div class="wrap">' +
      '<p class="kicker">Inspection failed</p>' +
      '<h1 class="h-display" style="font-size:clamp(34px,6vw,64px);margin-bottom:24px;">Not on file<span style="color:var(--red)">.</span></h1>' +
      '<div class="nf-box"><div class="prose">' +
      "<p>We couldn’t find <b>“" + esc(q) + "”</b> in the registry. We cover " + FUNDS.length + " of the most widely held funds and stocks — but not everything, yet.</p>" +
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
    document.title = "Musk-Free Certified™ — Is there Elon in your index fund?";

    if ((m = h.match(/^#\/f\/([^\/]+)/))) {
      var t = decodeURIComponent(m[1]).toUpperCase();
      var f = byTicker[t];
      if (f) {
        app.innerHTML = fundView(f);
        var v = verdict(f);
        document.title = f.t + ": " + v.stamp + " — Musk-Free Certified™";
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
      document.title = "Full Portfolio Audit — Musk-Free Certified™";
      window.scrollTo(0, 0);
      wirePortfolio(app);
    } else if (h === "#/index" || h === "#/methodology" || h === "#/faq") {
      app.innerHTML = homeView();
      var target = { "#/index": "musk-index", "#/methodology": null, "#/faq": null }[h];
      // scroll to the matching section by heading text
      var anchors = { "#/index": "musk-index" };
      requestAnimationFrame(function () {
        if (h === "#/index") {
          var el = document.getElementById("musk-index");
          if (el) el.scrollIntoView();
        } else {
          var sections = app.querySelectorAll(".section .kicker");
          var want = h === "#/methodology" ? "Fine print" : "Frequently asked";
          for (var i = 0; i < sections.length; i++) {
            if (sections[i].textContent.indexOf(want) !== -1) { sections[i].closest(".section").scrollIntoView(); break; }
          }
        }
      });
    } else {
      app.innerHTML = homeView();
      window.scrollTo(0, 0);
    }
    wireSearch(app);
    fillLiveTape();
  }

  window.addEventListener("hashchange", route);

  /* ---------------- init ---------------- */

  var asof = document.getElementById("footer-asof");
  if (asof) asof.textContent = ASOF;
  buildTape();
  route();
})();
