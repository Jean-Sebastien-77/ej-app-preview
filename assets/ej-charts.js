/* ==========================================================
   Express Juridique · Lifting 2026
   ej-charts.js : graphiques SVG maison, aucune dépendance.

   window.EJCharts.bar(el, opts)        barres (simples, groupées, empilées, horizontales)
   window.EJCharts.line(el, opts)       courbes (N vs N-1, pointillés)
   window.EJCharts.donut(el, opts)      anneau + légende
   window.EJCharts.sparkline(el, opts)  mini courbe sans axes
   window.EJCharts.gauge(el, opts)      jauge (demi-anneau ou barre)
   window.EJCharts.strip(el, opts)       frise de cases (une par catégorie, intensité = valeur)

   Chaque fonction renvoie { update(options), destroy() }.
   Couleurs : uniquement des tokens var(--ej-*) (voir ej-app.css).
   Voir la section « Contrat » de cockpit-ia/06-refonte-canevas.md.
   ========================================================== */
(function (global) {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";
  var NBSP = " ";
  var uidCounter = 0;

  /* ---------- Tons ---------- */
  // "soft" est un ton interne (dégradé de la famille primary pour les séries empilées).
  var TONES = { primary: 1, accent: 1, mint: 1, muted: 1, warning: 1, attention: 1, info: 1, n1: 1, soft: 1 };
  var DEFAULT_TONES = ["primary", "accent", "soft", "muted", "n1"];

  /* ---------- CSS injecté une seule fois ---------- */
  var CSS = [
    ".ejc{position:relative;display:block;width:100%;min-width:0;font-family:var(--ej-font-body);font-size:12px;color:var(--ej-neutral-800);font-variant-numeric:tabular-nums}",
    ".ejc *{box-sizing:border-box}",
    ".ejc svg{display:block;width:100%;overflow:visible}",
    ".ejc svg text{font-family:var(--ej-font-body);font-variant-numeric:tabular-nums}",
    /* tons : --c = remplissage, --cs = trait et pastilles */
    ".ejc-t-primary{--c:var(--ej-primary-900);--cs:var(--ej-primary-900)}",
    ".ejc-t-accent{--c:var(--ej-action-500);--cs:var(--ej-action-500)}",
    ".ejc-t-mint{--c:var(--ej-accent-400);--cs:var(--ej-accent-400)}",
    ".ejc-t-muted{--c:var(--ej-primary-200);--cs:var(--ej-primary-300)}",
    ".ejc-t-warning{--c:var(--ej-warning-600);--cs:var(--ej-warning-600)}",
    ".ejc-t-attention{--c:var(--ej-attention-500);--cs:var(--ej-attention-500)}",
    ".ejc-t-info{--c:var(--ej-info-600);--cs:var(--ej-info-600)}",
    ".ejc-t-n1{--c:var(--ej-neutral-300);--cs:var(--ej-neutral-400)}",
    ".ejc-t-soft{--c:var(--ej-primary-300);--cs:var(--ej-primary-400)}",
    /* axes, grille */
    ".ejc-grid{stroke:var(--ej-neutral-100);stroke-width:1;shape-rendering:crispEdges}",
    ".ejc-base{stroke:var(--ej-neutral-200);stroke-width:1;shape-rendering:crispEdges}",
    ".ejc-tick{fill:var(--ej-neutral-500);font-size:11px}",
    ".ejc-cat{fill:var(--ej-neutral-500);font-size:12px;transition:fill 150ms ease}",
    ".ejc-cat.is-on{fill:var(--ej-neutral-900);font-weight:600}",
    ".ejc-val{fill:var(--ej-neutral-800);font-family:var(--ej-font-display)!important;font-weight:600;font-size:11.5px;transition:fill 150ms ease}",
    ".ejc-val.is-dim{fill:var(--ej-neutral-600)}",
    /* barres */
    ".ejc-bar{fill:var(--c);stroke:var(--ej-white);stroke-width:1;pointer-events:none;transition:opacity 150ms ease}",
    ".ejc-bar.is-dim{opacity:.35}",
    /* zones de survol et de focus */
    ".ejc-hit{fill:transparent;outline:none;cursor:default}",
    ".ejc-hit:hover,.ejc-hit.is-kb{fill:var(--ej-primary-50)}",
    ".ejc-hit.is-kb{stroke:var(--ej-primary-400);stroke-width:2}",
    ".ejc.is-selectable .ejc-hit{cursor:pointer}",
    ".ejc-hit--line:hover{fill:transparent}",
    ".ejc-hit--line.is-kb{fill:transparent;stroke:var(--ej-primary-300);stroke-width:1;stroke-dasharray:3 3}",
    /* un seul arrêt de tabulation par graphique : le conteneur (svg ou frise) porte le focus */
    ".ejc [tabindex]{outline:none}",
    ".ejc [tabindex]:focus-visible{outline:2px solid var(--ej-primary-400);outline-offset:3px;border-radius:6px}",
    /* valeur non disponible : bande hachurée pâle */
    ".ejc-hatch-bg{fill:var(--ej-neutral-50)}",
    ".ejc-hatch-ln{stroke:var(--ej-neutral-300);stroke-width:1.5}",
    ".ejc-nullband{stroke:var(--ej-neutral-200);stroke-width:1;pointer-events:none}",
    /* courbes */
    ".ejc-line{fill:none;stroke:var(--cs);stroke-width:2;stroke-linejoin:round;stroke-linecap:round;pointer-events:none}",
    ".ejc-line.is-dashed{stroke-dasharray:5 5}",
    ".ejc-area{stroke:none;pointer-events:none}",
    ".ejc-pts{opacity:0;pointer-events:none;transition:opacity 100ms ease}",
    ".ejc-hit:hover+.ejc-pts,.ejc-hit.is-kb+.ejc-pts{opacity:1}",
    ".ejc-cross{stroke:var(--ej-neutral-300);stroke-width:1;shape-rendering:crispEdges}",
    ".ejc-dot{fill:var(--cs);stroke:var(--ej-white);stroke-width:2}",
    ".ejc-dot--still{pointer-events:none}",
    /* anneau */
    ".ejc-donut{display:flex;align-items:center;gap:24px}",
    ".ejc-donut.is-stack{flex-direction:column;align-items:stretch;gap:14px}",
    ".ejc-donut svg{width:auto;flex:none}",
    ".ejc-donut.is-stack svg{align-self:center}",
    ".ejc-seg{fill:none;stroke:var(--c);stroke-width:var(--sw);transition:opacity 150ms ease,stroke-width 150ms ease;outline:none;cursor:default}",
    ".ejc.is-selectable .ejc-seg{cursor:pointer}",
    ".ejc-seg:hover,.ejc-seg.is-kb{stroke-width:calc(var(--sw) + 5px)}",
    ".ejc-donut.has-act .ejc-seg:not(.is-act){opacity:.35}",
    ".ejc-cval{fill:var(--ej-neutral-900);font-family:var(--ej-font-display)!important;font-weight:600}",
    ".ejc-clab{fill:var(--ej-neutral-500);font-size:11.5px}",
    ".ejc-dlegend{flex:1;min-width:0;margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:1px}",
    ".ejc-dlegend li{display:grid;grid-template-columns:10px minmax(0,1fr) auto 44px;align-items:center;gap:10px;margin:0 -8px;padding:6px 8px;border-radius:var(--ej-radius-sm);font-size:13px;color:var(--ej-neutral-700);transition:background 150ms ease,opacity 150ms ease}",
    ".ejc.is-selectable .ejc-dlegend li{cursor:pointer}",
    ".ejc-dlegend li.is-act{background:var(--ej-neutral-50)}",
    ".ejc-donut.has-act .ejc-dlegend li:not(.is-act){opacity:.55}",
    ".ejc-dlegend .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".ejc-dlegend .vl{font-weight:600;color:var(--ej-neutral-900)}",
    ".ejc-dlegend .pc{text-align:right;color:var(--ej-neutral-500);font-size:12px}",
    /* légende de séries */
    ".ejc-legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin:0 0 10px;padding:0;list-style:none;font-size:12px;color:var(--ej-neutral-600)}",
    ".ejc-legend li{display:inline-flex;align-items:center;gap:6px;margin:0;padding:0}",
    ".ejc-sw{display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--c);flex:none}",
    ".ejc-sw.is-line{width:14px;height:3px;border-radius:2px;background:var(--cs)}",
    ".ejc-sw.is-dashed{background:repeating-linear-gradient(90deg,var(--cs) 0 4px,transparent 4px 7px)}",
    ".ejc-sw.is-hatch{background:repeating-linear-gradient(135deg,var(--ej-neutral-300) 0 1.5px,var(--ej-neutral-50) 1.5px 4px);box-shadow:inset 0 0 0 1px var(--ej-neutral-200)}",
    /* jauge et sparkline */
    ".ejc-gtrack{fill:none;stroke:var(--ej-neutral-100);stroke-linecap:round}",
    ".ejc-gfill{fill:none;stroke:var(--c);stroke-linecap:round}",
    ".ejc-gbar-track{fill:var(--ej-neutral-100)}",
    ".ejc-gbar-fill{fill:var(--c)}",
    ".ejc-glab{fill:var(--ej-neutral-600);font-size:12px}",
    ".ejc-spark-line{fill:none;stroke:var(--cs);stroke-width:1.75;stroke-linejoin:round;stroke-linecap:round}",
    ".ejc-spark-dot{fill:var(--cs);stroke:var(--ej-white);stroke-width:2}",
    /* frise de cases */
    ".ejc-strip{display:grid;gap:6px}",
    ".ejc-cell{position:relative;display:grid;grid-template-rows:auto 1fr;justify-items:center;gap:4px;min-height:68px;min-width:0;padding:8px 4px 9px;border:1px solid var(--ej-primary-100);border-radius:var(--ej-radius-md);background:var(--ej-primary-100);background:color-mix(in srgb,var(--c) calc(var(--m,0) * 1%),var(--sb));color:var(--ej-neutral-800);text-align:center;transition:box-shadow 150ms ease}",
    ".ejc-cell.is-ink{color:var(--ej-white);border-color:transparent}",
    ".ejc-cell-l{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:1.2}",
    ".ejc-cell-v{align-self:center;max-width:100%;font-family:var(--ej-font-display);font-weight:600;line-height:1.1;white-space:nowrap}",
    ".ejc-cell.is-na{border:1px dashed var(--ej-neutral-300);background:repeating-linear-gradient(135deg,var(--ej-neutral-100) 0 2px,var(--ej-white) 2px 7px);color:var(--ej-neutral-600)}",
    ".ejc-cell.is-na .ejc-cell-v{font-family:var(--ej-font-body);font-weight:500;font-size:10.5px;line-height:1.2;white-space:normal;overflow-wrap:anywhere}",
    ".ejc.is-selectable .ejc-cell{cursor:pointer}",
    ".ejc-cell:hover,.ejc-cell.is-kb{box-shadow:0 0 0 2px var(--ej-white),0 0 0 4px var(--ej-primary-400);z-index:1}",
    ".ejc-strip-note{margin:8px 0 0;font-size:11.5px;line-height:1.4;color:var(--ej-neutral-500)}",
    ".ejc-anim .ejc-cell{animation:ejc-fade 240ms ease both;animation-delay:var(--d,0ms)}",
    /* info-bulle */
    ".ejc-tip{position:absolute;left:0;top:0;z-index:5;pointer-events:none;opacity:0;transition:opacity 120ms ease;min-width:110px;max-width:260px;padding:8px 10px;background:var(--ej-white);border:1px solid var(--ej-hairline);border-radius:var(--ej-radius-md);box-shadow:var(--ej-shadow-md);font-size:12px;line-height:1.35;color:var(--ej-neutral-700)}",
    ".ejc-tip.is-on{opacity:1}",
    ".ejc-tip-title{margin:0 0 4px;font-family:var(--ej-font-display);font-weight:600;font-size:12px;line-height:1.3;color:var(--ej-neutral-900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".ejc-tip-row{display:flex;align-items:center;gap:8px;white-space:nowrap}",
    ".ejc-tip-row .sw{width:8px;height:8px;border-radius:3px;background:var(--c);flex:none}",
    ".ejc-tip-row .nm{flex:1;overflow:hidden;text-overflow:ellipsis}",
    ".ejc-tip-row .vl{margin-left:12px;font-weight:600;color:var(--ej-neutral-900)}",
    ".ejc-tip-row.is-total{margin-top:3px;padding-top:4px;border-top:1px solid var(--ej-neutral-100);color:var(--ej-neutral-500)}",
    ".ejc-empty{display:flex;align-items:center;justify-content:center;color:var(--ej-neutral-500);font-size:13px;border:1px dashed var(--ej-neutral-200);border-radius:var(--ej-radius-md)}",
    ".ejc-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}",
    /* animations (désactivées si prefers-reduced-motion) */
    "@keyframes ejc-rise{from{transform:scaleY(0)}to{transform:scaleY(1)}}",
    "@keyframes ejc-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}",
    "@keyframes ejc-fade{from{opacity:0}to{opacity:1}}",
    "@keyframes ejc-draw{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}",
    "@keyframes ejc-gauge{from{stroke-dashoffset:100}}",
    ".ejc-anim .ejc-bar-v{transform-box:fill-box;transform-origin:50% 100%;animation:ejc-rise 240ms cubic-bezier(.2,.7,.2,1) both;animation-delay:var(--d,0ms)}",
    ".ejc-anim .ejc-bar-h{transform-box:fill-box;transform-origin:0 50%;animation:ejc-grow 240ms cubic-bezier(.2,.7,.2,1) both;animation-delay:var(--d,0ms)}",
    ".ejc-anim .ejc-line,.ejc-anim .ejc-area,.ejc-anim .ejc-spark-line,.ejc-anim .ejc-spark-area,.ejc-anim .ejc-spark-dot{animation:ejc-fade 300ms ease both}",
    ".ejc-anim .ejc-seg{stroke-dasharray:100;animation:ejc-draw 300ms cubic-bezier(.2,.7,.2,1) both}",
    ".ejc-anim .ejc-gfill{stroke-dasharray:100;animation:ejc-gauge 300ms cubic-bezier(.2,.7,.2,1) both}",
    ".ejc-anim .ejc-gbar-fill{transform-box:fill-box;transform-origin:0 50%;animation:ejc-grow 300ms cubic-bezier(.2,.7,.2,1) both}",
    "@media (prefers-reduced-motion:reduce){.ejc *{animation:none!important;transition:none!important}}"
  ].join("\n");

  function injectCss() {
    if (document.getElementById("ej-charts-css")) return;
    var st = document.createElement("style");
    st.id = "ej-charts-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- Formats français ---------- */
  var nf = null;
  function fmtNum(v) {
    if (v == null || isNaN(v)) return "n.d.";
    try {
      if (!nf) nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
      return nf.format(v).replace(/[  ]/g, NBSP);
    } catch (e) {
      return String(v);
    }
  }
  function fmtPct(p) {
    if (p == null || isNaN(p)) return "n.d.";
    var r = Math.round(p);
    if (r === 0 && p > 0) return "< 1" + NBSP + "%";
    return fmtNum(r) + NBSP + "%";
  }

  /* ---------- Utilitaires ---------- */
  function svgEl(name, attrs, parent, text) {
    var e = document.createElementNS(SVGNS, name);
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function htmlEl(tag, cls, parent, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function r2(v) { return Math.round(v * 100) / 100; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function toneOf(t) { return TONES[t] ? t : "primary"; }
  function tc(t) { return "ejc-t-" + toneOf(t); }

  function innerWidth(el) {
    var cs = getComputedStyle(el);
    return el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
  }

  var mctx = null;
  var mcache = {};
  function measure(text, size, weight, fam) {
    var font = (weight || 400) + " " + size + "px " + (fam || "sans-serif");
    var key = font + "|" + text;
    if (mcache[key] != null) return mcache[key];
    var w;
    try {
      if (!mctx) mctx = document.createElement("canvas").getContext("2d");
      mctx.font = font;
      w = mctx.measureText(text).width;
    } catch (e) {
      w = String(text).length * size * 0.56;
    }
    if (Object.keys(mcache).length > 4000) mcache = {};
    mcache[key] = w;
    return w;
  }
  function fit(text, maxW, size, weight, fam) {
    text = String(text);
    if (measure(text, size, weight, fam) <= maxW) return text;
    var s = text;
    while (s.length > 1 && measure(s + "…", size, weight, fam) > maxW) s = s.slice(0, -1);
    return s.replace(/\s+$/, "") + "…";
  }

  function niceScale(max, count, integer) {
    if (!(max > 0)) max = 1;
    var raw = max / count;
    var p = Math.pow(10, Math.floor(Math.log10(raw)));
    var f = raw / p;
    var m = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
    var step = m * p;
    if (integer && step < 1) step = 1;
    var top = Math.ceil(max / step - 1e-9) * step;
    var ticks = [];
    for (var v = 0; v <= top + step / 1000; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return { step: step, top: ticks[ticks.length - 1], ticks: ticks };
  }

  function normSeries(o) {
    var raw = o.series || [];
    var n = raw.length;
    return raw.map(function (s, i) {
      return {
        name: s.name == null ? "" : String(s.name),
        values: (s.values || []).map(function (v) {
          return v == null || v === "" || !isFinite(v) ? null : +v;
        }),
        tone: TONES[s.tone] ? s.tone : n === 1 ? "primary" : DEFAULT_TONES[i % DEFAULT_TONES.length],
        dashed: !!s.dashed,
        tones: Array.isArray(s.tones) ? s.tones.map(function (t) { return TONES[t] ? t : null; }) : null
      };
    });
  }
  function isInt(list) {
    return list.every(function (v) { return v == null || Math.round(v) === v; });
  }

  /* ---------- Légende, tableau masqué, info-bulle ---------- */
  function legend(parent, series, kind, nullLabel) {
    var ul = htmlEl("ul", "ejc-legend", parent);
    series.forEach(function (s) {
      var li = htmlEl("li", tc(s.tone), ul);
      var cls = "ejc-sw" + (kind === "line" ? " is-line" + (s.dashed ? " is-dashed" : "") : "");
      htmlEl("span", cls, li).setAttribute("aria-hidden", "true");
      htmlEl("span", null, li, s.name);
    });
    if (nullLabel) {
      var ln = htmlEl("li", null, ul);
      htmlEl("span", "ejc-sw is-hatch", ln).setAttribute("aria-hidden", "true");
      htmlEl("span", null, ln, nullLabel);
    }
    return ul;
  }

  /* Motif hachuré (tokens uniquement) pour les valeurs non disponibles ; renvoie l'id du pattern. */
  function hatch(svg) {
    var id = "ejc-h" + (++uidCounter);
    var defs = svgEl("defs", null, svg);
    var p = svgEl("pattern", { id: id, width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    svgEl("rect", { width: 6, height: 6, "class": "ejc-hatch-bg" }, p);
    svgEl("line", { x1: 0, y1: 0, x2: 0, y2: 6, "class": "ejc-hatch-ln" }, p);
    return id;
  }

  function srTable(parent, caption, head, rows) {
    var box = htmlEl("div", "sr-only ejc-sr", parent);
    var t = htmlEl("table", null, box);
    if (caption) htmlEl("caption", null, t, caption);
    var tr = htmlEl("tr", null, htmlEl("thead", null, t));
    head.forEach(function (h) { htmlEl("th", null, tr).textContent = h; });
    var tb = htmlEl("tbody", null, t);
    rows.forEach(function (r) {
      var row = htmlEl("tr", null, tb);
      r.forEach(function (c) { htmlEl("td", null, row, c); });
    });
  }

  function makeTip(host) {
    var d = htmlEl("div", "ejc-tip", host);
    d.setAttribute("role", "tooltip");
    d.setAttribute("aria-hidden", "true");
    return {
      show: function (spec, x, y) {
        d.textContent = "";
        if (spec.title) htmlEl("div", "ejc-tip-title", d, spec.title);
        (spec.rows || []).forEach(function (r) {
          var row = htmlEl("div", "ejc-tip-row " + (r.tone ? tc(r.tone) : "") + (r.total ? " is-total" : ""), d);
          if (r.tone) htmlEl("span", "sw", row);
          htmlEl("span", "nm", row, r.name || "");
          htmlEl("span", "vl", row, r.value);
        });
        d.classList.add("is-on");
        var hw = host.clientWidth, hh = host.clientHeight;
        var tw = d.offsetWidth, th = d.offsetHeight;
        var left = x + 14;
        if (left + tw > hw - 4) left = x - tw - 14;
        left = Math.max(4, Math.min(left, hw - tw - 4));
        var top = y - th - 12;
        if (top < 4) top = y + 16;
        top = Math.max(4, Math.min(top, hh - th - 4));
        d.style.transform = "translate(" + Math.round(left) + "px," + Math.round(top) + "px)";
      },
      hide: function () { d.classList.remove("is-on"); }
    };
  }

  /* Distance d'un point à un rectangle (0 si dedans) : choisit la série sous le pointeur. */
  function nearestRect(rects, px, py) {
    var best = 0, bd = Infinity;
    rects.forEach(function (r) {
      var dx = Math.max(r.x - px, 0, px - (r.x + r.w));
      var dy = Math.max(r.y - py, 0, py - (r.y + r.h));
      var d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = r.k; }
    });
    return best;
  }

  /* ---------- Interactions communes : survol, focus, clavier, clic ---------- */
  /* Un seul arrêt de tabulation par graphique (tabindex itinérant) : le svg reçoit le focus,
     les flèches parcourent les éléments (aria-activedescendant), Entrée/Espace = onSelect, Échap ferme l'info-bulle. */
  function wire(inst, svg, W, items, hooks) {
    var el = inst.el, tip = inst.tip;
    hooks = hooks || {};
    var cur = null;   // élément actif (survol ou clavier)
    var kb = null;    // élément parcouru au clavier
    var base = "ejc-" + (++uidCounter) + "-";

    if (typeof inst.opts.onSelect === "function") el.classList.add("is-selectable");
    else el.classList.remove("is-selectable");

    items.forEach(function (it, idx) {
      it.el.classList.add("ejc-hit");
      it.el.setAttribute("id", base + idx);
      it.el.setAttribute("role", "option");
      it.el.setAttribute("aria-label", it.aria);
      it.el.setAttribute("data-i", String(idx));
    });

    svg.setAttribute("tabindex", "0");
    svg.setAttribute("role", "listbox");
    // le décor (axes, barres, textes) est lu via le tableau masqué ; seuls les éléments interactifs restent exposés
    Array.prototype.forEach.call(svg.children, function (ch) {
      if (ch.classList.contains("ejc-hit") || ch.querySelector(".ejc-hit")) return;
      ch.setAttribute("aria-hidden", "true");
    });
    inst.focusTarget = svg;

    function find(t) {
      var n = t && t.closest ? t.closest(".ejc-hit") : null;
      return n && svg.contains(n) ? items[+n.getAttribute("data-i")] : null;
    }
    function svgPos(e) {
      var r = svg.getBoundingClientRect();
      var k = r.width ? W / r.width : 1;
      return [(e.clientX - r.left) * k, (e.clientY - r.top) * k];
    }
    function setActive(idx) {
      if (cur === idx) return;
      cur = idx;
      if (hooks.active) hooks.active(idx);
    }
    function showPointer(e) {
      var it = find(e.target);
      if (!it) { tip.hide(); setActive(null); return; }
      var p = svgPos(e);
      var k = it.pick ? it.pick(p[0], p[1]) : 0;
      var h = el.getBoundingClientRect();
      tip.show(it.tip(k), e.clientX - h.left, e.clientY - h.top);
      setActive(items.indexOf(it));
    }
    function showAnchor(it) {
      var r = svg.getBoundingClientRect(), h = el.getBoundingClientRect();
      var k = r.width ? r.width / W : 1;
      tip.show(it.tip(it.pick ? it.pick(it.ax, it.ay) : 0), r.left - h.left + it.ax * k, r.top - h.top + it.ay * k);
    }
    function clearKb() {
      if (kb != null && items[kb]) items[kb].el.classList.remove("is-kb");
      kb = null;
      svg.removeAttribute("aria-activedescendant");
    }
    function goKb(idx) {
      if (!items.length) return;
      idx = clamp(idx, 0, items.length - 1);
      if (kb != null && items[kb]) items[kb].el.classList.remove("is-kb");
      kb = idx;
      inst.kb = idx;
      items[idx].el.classList.add("is-kb");
      svg.setAttribute("aria-activedescendant", base + idx);
      showAnchor(items[idx]);
      setActive(idx);
    }

    svg.addEventListener("pointermove", showPointer);
    svg.addEventListener("pointerdown", function (e) { clearKb(); showPointer(e); });
    svg.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "touch") return;
      tip.hide();
      setActive(null);
    });
    svg.addEventListener("click", function (e) {
      var it = find(e.target);
      if (!it || typeof inst.opts.onSelect !== "function") return;
      var p = svgPos(e);
      inst.opts.onSelect(it.payload(it.pick ? it.pick(p[0], p[1]) : 0));
    });
    svg.addEventListener("focus", function () {
      var vis = true;
      try { vis = svg.matches(":focus-visible"); } catch (err) { vis = true; }
      if (!vis) return;
      goKb(inst.kb != null ? inst.kb : 0);
    });
    svg.addEventListener("blur", function () {
      clearKb();
      tip.hide();
      setActive(null);
    });
    svg.addEventListener("keydown", function (e) {
      if (!items.length || e.altKey || e.ctrlKey || e.metaKey) return;
      var go = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go = kb == null ? 0 : kb + 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go = kb == null ? items.length - 1 : kb - 1;
      else if (e.key === "Home") go = 0;
      else if (e.key === "End") go = items.length - 1;
      else if (e.key === "Escape") { tip.hide(); setActive(null); return; }
      else if ((e.key === "Enter" || e.key === " ") && typeof inst.opts.onSelect === "function") {
        e.preventDefault();
        var it = items[kb == null ? 0 : kb];
        inst.opts.onSelect(it.payload(it.pick ? it.pick(it.ax, it.ay) : 0));
        return;
      }
      if (go != null) {
        e.preventDefault();
        goKb(go);
      }
    });
  }

  function emptyState(inst, h) {
    var d = htmlEl("div", "ejc-empty", inst.el, "Aucune donnée à afficher");
    d.style.height = h + "px";
  }

  function newSvg(inst, W, H, label, animate) {
    var svg = svgEl("svg", {
      viewBox: "0 0 " + r2(W) + " " + r2(H),
      width: "100%",
      height: r2(H),
      role: "img",
      "aria-label": label
    });
    svg.style.height = r2(H) + "px";
    if (animate) svg.classList.add("ejc-anim");
    inst.el.appendChild(svg);
    return svg;
  }

  /* Rectangle à coins supérieurs arrondis (vertical) ou droits arrondis (horizontal). */
  function pathTop(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h));
    if (r < 0.5) return "M" + r2(x) + " " + r2(y) + "h" + r2(w) + "v" + r2(h) + "h" + r2(-w) + "Z";
    return "M" + r2(x) + " " + r2(y + h) + "V" + r2(y + r) +
      "A" + r + " " + r + " 0 0 1 " + r2(x + r) + " " + r2(y) +
      "H" + r2(x + w - r) +
      "A" + r + " " + r + " 0 0 1 " + r2(x + w) + " " + r2(y + r) +
      "V" + r2(y + h) + "Z";
  }
  function pathRight(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, h / 2, w));
    if (r < 0.5) return "M" + r2(x) + " " + r2(y) + "h" + r2(w) + "v" + r2(h) + "h" + r2(-w) + "Z";
    return "M" + r2(x) + " " + r2(y) + "H" + r2(x + w - r) +
      "A" + r + " " + r + " 0 0 1 " + r2(x + w) + " " + r2(y + r) +
      "V" + r2(y + h - r) +
      "A" + r + " " + r + " 0 0 1 " + r2(x + w - r) + " " + r2(y + h) +
      "H" + r2(x) + "Z";
  }

  /* ---------- Modèle commun barres et courbes ---------- */
  // bar = true : une valeur null est « non disponible » (info-bulle, bande hachurée) ; pour les courbes elle reste un trou.
  function model(inst, bar) {
    var o = inst.opts;
    var cats = (o.categories || []).map(String);
    var S = normSeries(o);
    var fmt = typeof o.format === "function" ? o.format : fmtNum;
    var stacked = !!o.stacked && S.length > 1;
    var titles = o.tooltipTitles || [];
    var nullLabel = o.nullLabel != null ? String(o.nullLabel) : "Non disponible";
    var na = bar ? nullLabel : "n.d.";
    var totals = cats.map(function (c, i) {
      return S.reduce(function (a, s) { return a + (s.values[i] == null ? 0 : s.values[i]); }, 0);
    });
    var all = [];
    S.forEach(function (s) { all = all.concat(s.values); });
    var m = {
      cats: cats, S: S, fmt: fmt, stacked: stacked, totals: totals, ns: S.length, n: cats.length,
      integer: isInt(all),
      nullLabel: nullLabel,
      hasNull: !!bar && S.some(function (s) { return cats.some(function (c, i) { return s.values[i] == null; }); }),
      allNull: function (i) { return S.every(function (s) { return s.values[i] == null; }); },
      // ton de la série k pour la catégorie i (couleur par catégorie : series[].tones)
      toneAt: function (k, i) { var s = S[k]; return (s.tones && s.tones[i]) || s.tone; },
      title: function (i) { return titles[i] != null ? String(titles[i]) : cats[i]; },
      tip: function (i) {
        var rows = [];
        S.forEach(function (s, k) {
          if (s.values[i] != null) rows.push({ tone: m.toneAt(k, i), name: s.name, value: fmt(s.values[i]) });
          else if (bar) rows.push({ tone: m.toneAt(k, i), name: s.name, value: nullLabel });
        });
        if (stacked && !(bar && m.allNull(i))) rows.push({ name: "Total", value: fmt(totals[i]), total: true });
        return { title: m.title(i), rows: rows };
      },
      aria: function (i) {
        return m.title(i) + " : " + S.map(function (s) {
          return (s.name ? s.name + " " : "") + (s.values[i] == null ? na : fmt(s.values[i]));
        }).join(", ");
      },
      payload: function (i, k) {
        var s = S[k] || S[0];
        return { serie: s.name, serieIndex: S.indexOf(s), categorie: cats[i], valeur: s.values[i], index: i, tone: m.toneAt(S.indexOf(s), i) };
      },
      label: function (kind) {
        if (o.ariaLabel || o.title) return String(o.ariaLabel || o.title);
        return kind + " : " + S.map(function (s) { return s.name; }).filter(Boolean).join(", ") +
          (cats.length ? " (" + cats.length + " " + (cats.length > 1 ? "catégories" : "catégorie") + ")" : "");
      },
      sr: function (parent, kind) {
        srTable(parent, m.label(kind), [""].concat(S.map(function (s) { return s.name; })),
          cats.map(function (c, i) {
            return [m.title(i)].concat(S.map(function (s) { return s.values[i] == null ? na : fmt(s.values[i]); }));
          }));
      }
    };
    // fonction d'atténuation : (série k, catégorie i) → vrai si la barre est estompée par `highlight`
    var hl = o.highlight == null ? null : o.highlight;
    var hs = o.highlightSeries == null ? null : o.highlightSeries;
    m.hl = hl;
    m.dim = function (k, i) {
      if (hl == null || hl === i) return false;
      if (hs == null) return true;
      return typeof hs === "number" ? k === hs : S[k].name === hs;
    };
    // étiquette de total : atténuée seulement si l'atténuation vise toute la barre
    m.dimTotal = function (i) { return m.ns === 1 ? m.dim(0, i) : (hl != null && hl !== i && hs == null); };
    return m;
  }

  /* Choix de la présentation des libellés de catégories sur l'axe. */
  function catLabelPlan(m, band, fs, fam) {
    var maxLab = 0;
    m.cats.forEach(function (c) { maxLab = Math.max(maxLab, measure(c, fs, 400, fam)); });
    var plan = { rotate: 0, step: 1, bottom: 28, labels: m.cats };
    if (maxLab + 8 <= band) return plan;
    var avg = m.cats.reduce(function (a, c) { return a + c.length; }, 0) / (m.n || 1);
    if (avg <= 6 && m.n >= 6) {
      plan.step = Math.ceil((maxLab + 10) / band);
      return plan;
    }
    plan.labels = m.cats.map(function (c) { return fit(c, 120, fs, 400, fam); });
    var mw = 0;
    plan.labels.forEach(function (c) { mw = Math.max(mw, measure(c, fs, 400, fam)); });
    plan.rotate = -35;
    plan.bottom = Math.min(86, Math.round(Math.sin(35 * Math.PI / 180) * mw + fs * 0.7 + 12));
    plan.step = Math.max(1, Math.ceil(15 / band));
    return plan;
  }

  /* ==========================================================
     BAR vertical
     ========================================================== */
  function drawBarV(inst, W, animate) {
    var el = inst.el, o = inst.opts, fam = inst.fam;
    var m = model(inst, true);
    var H = o.height || 220;
    if (!m.n || !m.ns) return emptyState(inst, H);
    if (m.ns > 1 || m.hasNull) legend(el, m.ns > 1 ? m.S : [], "bar", m.hasNull ? m.nullLabel : null);
    var svg = newSvg(inst, W, H, m.label("Graphique en barres"), animate);
    var hid = m.hasNull ? hatch(svg) : null;
    var fsC = W < 420 ? 11 : 12;
    var top = 20;

    var vmax = m.stacked ? Math.max.apply(null, m.totals) : Math.max.apply(null, m.S.map(function (s) {
      return Math.max.apply(null, s.values.map(function (v) { return v == null ? 0 : v; }));
    }));
    var prov = niceScale(vmax, clamp(Math.round((H - top - 30) / 46), 2, 5), m.integer);
    var tickW = 0;
    prov.ticks.forEach(function (t) { tickW = Math.max(tickW, measure(m.fmt(t), 11, 400, fam)); });
    var left = Math.max(30, Math.ceil(tickW) + 14), right = 8;
    var plotW = W - left - right;
    var band = plotW / m.n;
    var plan = catLabelPlan(m, band, fsC, fam);
    var plotH = H - top - plan.bottom;
    var sc = niceScale(vmax, clamp(Math.round(plotH / 46), 2, 5), m.integer);
    var yv = function (v) { return top + plotH - (v / sc.top) * plotH; };

    // grille et libellés de l'axe Y
    sc.ticks.forEach(function (t, i) {
      var y = r2(yv(t)) + 0.5;
      svgEl("line", { x1: left, x2: W - right, y1: y, y2: y, "class": i === 0 ? "ejc-base" : "ejc-grid" }, svg);
      svgEl("text", { x: left - 8, y: y + 4, "text-anchor": "end", "class": "ejc-tick" }, svg, m.fmt(t));
    });

    // valeurs au sommet des barres
    var maxValW = 0;
    var topVals = m.stacked ? m.totals : (m.ns === 1 ? m.S[0].values : null);
    if (topVals) topVals.forEach(function (v) { if (v != null) maxValW = Math.max(maxValW, measure(m.fmt(v), 11.5, 600, inst.famD)); });
    var showVals = o.values === true || (o.values !== false && topVals && maxValW <= band - 7);
    var hl = m.hl;

    var hitsLayer = svgEl("g", null, svg);
    var barsLayer = svgEl("g", null, svg);
    var valsLayer = svgEl("g", null, svg);
    var catsLayer = svgEl("g", null, svg);
    var items = [];
    var stepDelay = Math.min(8, 60 / m.n);

    function nullBand(x, w) {
      svgEl("rect", { x: r2(x), y: top, width: r2(w), height: r2(plotH), rx: 3, fill: "url(#" + hid + ")", "class": "ejc-nullband" }, barsLayer);
    }

    for (var i = 0; i < m.n; i++) {
      (function (i) {
        var cx = left + (i + 0.5) * band;
        var rects = [];
        var minY = top + plotH;
        var delay = "--d:" + r2(i * stepDelay) + "ms";
        var rad = band > 26 ? 4 : 3;
        var allNull = m.allNull(i);

        if (m.stacked || m.ns === 1) {
          var bw = Math.max(3, Math.min(band * 0.62, 52));
          var x = cx - bw / 2, acc = 0;
          var lastK = -1;
          m.S.forEach(function (s, k) { if (s.values[i] > 0) lastK = k; });
          if (allNull) {
            nullBand(x, bw);
            minY = top + plotH / 2;
          }
          m.S.forEach(function (s, k) {
            var v = s.values[i];
            if (!(v > 0)) return;
            var y1 = yv(acc), y0 = yv(acc + v);
            var h = Math.max(1.5, y1 - y0);
            svgEl("path", {
              d: k === lastK ? pathTop(x, y1 - h, bw, h, rad) : pathTop(x, y1 - h, bw, h, 0),
              "class": "ejc-bar ejc-bar-v " + tc(m.toneAt(k, i)) + (m.dim(k, i) ? " is-dim" : ""),
              style: delay
            }, barsLayer);
            rects.push({ k: k, x: x, y: y1 - h, w: bw, h: h });
            minY = Math.min(minY, y1 - h);
            acc += v;
          });
        } else {
          var gap = band > 60 ? 3 : 2;
          var gw = Math.min(band * 0.74, m.ns * 30 + (m.ns - 1) * gap);
          var bwg = Math.max(3, (gw - (m.ns - 1) * gap) / m.ns);
          var x0 = cx - (bwg * m.ns + gap * (m.ns - 1)) / 2;
          m.S.forEach(function (s, k) {
            var v = s.values[i];
            var x = x0 + k * (bwg + gap);
            if (v == null) {
              nullBand(x, bwg);
              rects.push({ k: k, x: x, y: top, w: bwg, h: plotH });
              minY = Math.min(minY, top + plotH / 2);
              return;
            }
            if (!(v > 0)) return;
            var h = Math.max(1.5, (v / sc.top) * plotH);
            var dim = m.dim(k, i);
            svgEl("path", {
              d: pathTop(x, top + plotH - h, bwg, h, bwg >= 8 ? 4 : 3),
              "class": "ejc-bar ejc-bar-v " + tc(m.toneAt(k, i)) + (dim ? " is-dim" : ""),
              style: delay
            }, barsLayer);
            rects.push({ k: k, x: x, y: top + plotH - h, w: bwg, h: h });
            minY = Math.min(minY, top + plotH - h);
            if (o.values === true && bwg >= 14 && !(o.hideZeros && !(v > 0))) {
              svgEl("text", { x: x + bwg / 2, y: top + plotH - h - 6, "text-anchor": "middle", "class": "ejc-val" + (dim ? " is-dim" : ""), "font-size": 10.5 }, valsLayer, m.fmt(v));
            }
          });
        }

        if (showVals && (m.stacked || m.ns === 1) && !allNull) {
          var tv = m.stacked ? m.totals[i] : m.S[0].values[i];
          if (tv != null && (tv > 0 || m.ns === 1) && !(o.hideZeros && !(tv > 0))) {
            svgEl("text", { x: cx, y: Math.max(12, (tv > 0 ? minY : top + plotH) - 6), "text-anchor": "middle", "class": "ejc-val" + (m.dimTotal(i) ? " is-dim" : "") }, valsLayer, m.fmt(tv));
          }
        }

        // libellé de catégorie
        if (i % plan.step === 0) {
          var ty = top + plotH + (plan.rotate ? 16 : 18);
          var t = svgEl("text", { x: cx, y: ty, "text-anchor": plan.rotate ? "end" : "middle", "class": "ejc-cat" + (hl === i ? " is-on" : ""), "font-size": fsC }, catsLayer, plan.labels[i]);
          if (plan.rotate) t.setAttribute("transform", "rotate(" + plan.rotate + " " + r2(cx + 3) + " " + ty + ")");
        }

        var hit = svgEl("rect", { x: r2(left + i * band), y: 0, width: r2(band), height: top + plotH, rx: 4 }, hitsLayer);
        items.push({
          el: hit, ax: cx, ay: Math.min(minY, top + plotH - 4),
          aria: m.aria(i),
          tip: function () { return m.tip(i); },
          pick: function (px, py) { return nearestRect(rects.length ? rects : [{ k: 0, x: cx, y: top, w: 0, h: plotH }], px, py); },
          payload: function (k) { return m.payload(i, k); }
        });
      })(i);
    }

    m.sr(el, "Graphique en barres");
    inst.tip = makeTip(el);
    wire(inst, svg, W, items);
  }

  /* ==========================================================
     BAR horizontal
     ========================================================== */
  function drawBarH(inst, W, animate) {
    var el = inst.el, o = inst.opts, fam = inst.fam, famD = inst.famD;
    var m = model(inst, true);
    if (!m.n || !m.ns) return emptyState(inst, o.height || 120);
    if (m.ns > 1 || m.hasNull) legend(el, m.ns > 1 ? m.S : [], "bar", m.hasNull ? m.nullLabel : null);
    var fsC = W < 420 ? 11 : 12;
    var showVals = o.values !== false;
    var grouped = m.ns > 1 && !m.stacked;
    var top = 4, bottom = showVals ? 4 : 24;
    var rowH = grouped ? Math.max(30, m.ns * 16 + 14) : 32;
    var H = o.height || Math.max(90, Math.round(m.n * rowH + top + bottom));
    rowH = (H - top - bottom) / m.n;
    var svg = newSvg(inst, W, H, m.label("Graphique en barres horizontales"), animate);
    var hid = m.hasNull ? hatch(svg) : null;

    var ends = m.stacked ? m.totals : [].concat.apply([], m.S.map(function (s) { return s.values; }));
    var vmax = Math.max.apply(null, ends.map(function (v) { return v == null ? 0 : v; }));
    var maxLab = 0;
    m.cats.forEach(function (c) { maxLab = Math.max(maxLab, measure(c, fsC, 400, fam)); });
    var labW = Math.min(Math.ceil(maxLab) + 16, Math.max(70, W * (W < 420 ? 0.4 : 0.38)), 240);
    var valRoom = 8;
    if (showVals) {
      var mv = 0;
      ends.forEach(function (v) { if (v != null) mv = Math.max(mv, measure(m.fmt(v), 11.5, 600, famD)); });
      valRoom = Math.ceil(mv) + 12;
    }
    var plotX = labW, plotW = Math.max(40, W - labW - valRoom);
    var sc = showVals ? { top: vmax || 1, ticks: [] } : niceScale(vmax, clamp(Math.round(plotW / 90), 2, 5), m.integer);
    if (!showVals) {
      sc.ticks.forEach(function (t, i) {
        var x = r2(plotX + (t / sc.top) * plotW) + 0.5;
        svgEl("line", { x1: x, x2: x, y1: top, y2: top + rowH * m.n, "class": i === 0 ? "ejc-base" : "ejc-grid" }, svg);
        svgEl("text", { x: x, y: top + rowH * m.n + 16, "text-anchor": "middle", "class": "ejc-tick" }, svg, m.fmt(t));
      });
    }
    var xv = function (v) { return (v / sc.top) * plotW; };
    var hl = m.hl;
    var hitsLayer = svgEl("g", null, svg);
    var barsLayer = svgEl("g", null, svg);
    var textLayer = svgEl("g", null, svg);
    var items = [];
    var stepDelay = Math.min(8, 60 / m.n);

    function nullBand(y, h) {
      svgEl("rect", { x: r2(plotX), y: r2(y), width: r2(plotW), height: r2(h), rx: 3, fill: "url(#" + hid + ")", "class": "ejc-nullband" }, barsLayer);
    }

    m.cats.forEach(function (cat, i) {
      var y0 = top + i * rowH, cy = y0 + rowH / 2;
      var rects = [], endX = plotX;
      var delay = "--d:" + r2(i * stepDelay) + "ms";
      var lab = fit(cat, labW - 14, fsC, 400, fam);
      var allNull = m.allNull(i);
      svgEl("text", { x: 0, y: cy + 4, "class": "ejc-cat" + (hl === i ? " is-on" : ""), "font-size": fsC }, textLayer, lab);

      if (!grouped) {
        var bh = clamp(rowH * 0.5, 8, 22), acc = 0, lastK = -1;
        m.S.forEach(function (s, k) { if (s.values[i] > 0) lastK = k; });
        if (allNull) {
          nullBand(cy - bh / 2, bh);
          endX = plotX + plotW / 2;
        }
        m.S.forEach(function (s, k) {
          var v = s.values[i];
          if (!(v > 0)) return;
          var x = plotX + xv(acc), w = Math.max(2, xv(v));
          svgEl("path", {
            d: pathRight(x, cy - bh / 2, w, bh, k === lastK ? 4 : 0),
            "class": "ejc-bar ejc-bar-h " + tc(m.toneAt(k, i)) + (m.dim(k, i) ? " is-dim" : ""), style: delay
          }, barsLayer);
          rects.push({ k: k, x: x, y: cy - bh / 2, w: w, h: bh });
          acc += v;
          endX = x + w;
        });
        if (showVals && !allNull) {
          var tv = m.stacked ? m.totals[i] : m.S[0].values[i];
          if (tv != null && !(o.hideZeros && !(tv > 0))) svgEl("text", { x: Math.max(endX, plotX) + 8, y: cy + 4, "class": "ejc-val" + (m.dimTotal(i) ? " is-dim" : "") }, textLayer, m.fmt(tv));
        }
      } else {
        var gap = 3;
        var bhg = clamp((rowH * 0.72 - (m.ns - 1) * gap) / m.ns, 6, 18);
        var y1 = cy - (bhg * m.ns + gap * (m.ns - 1)) / 2;
        m.S.forEach(function (s, k) {
          var v = s.values[i];
          var y = y1 + k * (bhg + gap);
          if (v == null) {
            nullBand(y, bhg);
            rects.push({ k: k, x: plotX, y: y, w: plotW, h: bhg });
            endX = Math.max(endX, plotX + plotW / 2);
            return;
          }
          if (!(v > 0)) return;
          var w = Math.max(2, xv(v));
          var dim = m.dim(k, i);
          svgEl("path", {
            d: pathRight(plotX, y, w, bhg, 3),
            "class": "ejc-bar ejc-bar-h " + tc(m.toneAt(k, i)) + (dim ? " is-dim" : ""), style: delay
          }, barsLayer);
          rects.push({ k: k, x: plotX, y: y, w: w, h: bhg });
          endX = Math.max(endX, plotX + w);
          if (showVals && bhg >= 10) {
            svgEl("text", { x: plotX + w + 8, y: y + bhg / 2 + 4, "class": "ejc-val" + (dim ? " is-dim" : ""), "font-size": 10.5 }, textLayer, m.fmt(v));
          }
        });
      }

      var hit = svgEl("rect", { x: 0, y: r2(y0), width: W, height: r2(rowH), rx: 4 }, hitsLayer);
      items.push({
        el: hit, ax: Math.min(endX, W - 10), ay: cy,
        aria: m.aria(i),
        tip: function () { return m.tip(i); },
        pick: function (px, py) { return nearestRect(rects.length ? rects : [{ k: 0, x: plotX, y: cy, w: 0, h: 0 }], px, py); },
        payload: function (k) { return m.payload(i, k); }
      });
    });

    m.sr(el, "Graphique en barres horizontales");
    inst.tip = makeTip(el);
    wire(inst, svg, W, items);
  }

  /* ==========================================================
     LINE
     ========================================================== */
  function drawLine(inst, W, animate) {
    var el = inst.el, o = inst.opts, fam = inst.fam;
    var m = model(inst);
    var H = o.height || 220;
    if (!m.n || !m.ns) return emptyState(inst, H);
    if (m.ns > 1) legend(el, m.S, "line");
    var svg = newSvg(inst, W, H, m.label("Courbe"), animate);
    var fsC = W < 420 ? 11 : 12;
    var top = 16;

    var vals = [].concat.apply([], m.S.map(function (s) { return s.values.filter(function (v) { return v != null; }); }));
    var vmax = vals.length ? Math.max.apply(null, vals) : 1;
    var vmin = vals.length ? Math.min.apply(null, vals) : 0;
    var zero = o.zero !== false || vmin < 0;
    var lo = zero ? Math.min(0, vmin) : vmin;
    var prov = niceScale(vmax - (zero ? 0 : lo), clamp(Math.round((H - top - 30) / 46), 2, 5), m.integer);
    var tickW = 0;
    prov.ticks.forEach(function (t) { tickW = Math.max(tickW, measure(m.fmt(t + (zero ? 0 : lo)), 11, 400, fam)); });
    var left = Math.max(30, Math.ceil(tickW) + 14), right = 12;
    var plotW = W - left - right;
    var band = plotW / m.n;
    var plan = catLabelPlan(m, band, fsC, fam);
    var plotH = H - top - plan.bottom;
    var sc = niceScale(vmax - lo, clamp(Math.round(plotH / 46), 2, 5), m.integer);
    var yv = function (v) { return top + plotH - ((v - lo) / sc.top) * plotH; };
    var xv = function (i) { return left + (i + 0.5) * band; };

    sc.ticks.forEach(function (t, i) {
      var y = r2(top + plotH - (t / sc.top) * plotH) + 0.5;
      svgEl("line", { x1: left, x2: W - right, y1: y, y2: y, "class": i === 0 ? "ejc-base" : "ejc-grid" }, svg);
      svgEl("text", { x: left - 8, y: y + 4, "text-anchor": "end", "class": "ejc-tick" }, svg, m.fmt(t + lo));
    });

    var catsLayer = svgEl("g", null, svg);
    var seriesLayer = svgEl("g", null, svg);
    var hl = o.highlight == null ? null : o.highlight;
    for (var i = 0; i < m.n; i++) {
      if (i % plan.step !== 0) continue;
      var cx = xv(i), ty = top + plotH + (plan.rotate ? 16 : 18);
      var t = svgEl("text", { x: cx, y: ty, "text-anchor": plan.rotate ? "end" : "middle", "class": "ejc-cat" + (hl === i ? " is-on" : ""), "font-size": fsC }, catsLayer, plan.labels[i]);
      if (plan.rotate) t.setAttribute("transform", "rotate(" + plan.rotate + " " + r2(cx + 3) + " " + ty + ")");
    }

    // dégradé de la zone sous la première série
    var uid = "ejc-g" + (++uidCounter);
    var defs = svgEl("defs", null, svg);
    var first = m.S[0];
    var grad = svgEl("linearGradient", { id: uid, x1: 0, x2: 0, y1: 0, y2: 1, "class": tc(first.tone) }, defs);
    svgEl("stop", { offset: "0%", style: "stop-color:var(--cs);stop-opacity:.14" }, grad);
    svgEl("stop", { offset: "100%", style: "stop-color:var(--cs);stop-opacity:0" }, grad);

    // les séries pointillées et grises passent derrière
    var order = m.S.map(function (s, k) { return k; }).sort(function (a, b) {
      return (m.S[b].tone === "n1" ? 1 : 0) - (m.S[a].tone === "n1" ? 1 : 0) || a - b;
    });
    order.forEach(function (k) {
      var s = m.S[k];
      var segs = [], seg = null;
      s.values.forEach(function (v, i) {
        if (v == null) { seg = null; return; }
        if (!seg) { seg = []; segs.push(seg); }
        seg.push([xv(i), yv(v)]);
      });
      var d = segs.map(function (g) {
        return g.map(function (p, j) { return (j ? "L" : "M") + r2(p[0]) + " " + r2(p[1]); }).join("");
      }).join("");
      if (k === 0 && !s.dashed) {
        var base = top + plotH;
        var ad = segs.filter(function (g) { return g.length > 1; }).map(function (g) {
          return g.map(function (p, j) { return (j ? "L" : "M") + r2(p[0]) + " " + r2(p[1]); }).join("") +
            "L" + r2(g[g.length - 1][0]) + " " + r2(base) + "L" + r2(g[0][0]) + " " + r2(base) + "Z";
        }).join("");
        if (ad) svgEl("path", { d: ad, "class": "ejc-area", fill: "url(#" + uid + ")" }, seriesLayer);
      }
      if (d) svgEl("path", { d: d, "class": "ejc-line " + tc(s.tone) + (s.dashed ? " is-dashed" : "") }, seriesLayer);
      segs.forEach(function (g) {
        if (g.length === 1) svgEl("circle", { cx: r2(g[0][0]), cy: r2(g[0][1]), r: 3.5, "class": "ejc-dot ejc-dot--still " + tc(s.tone) }, seriesLayer);
      });
    });

    // zones de survol + point et repère vertical (siblings CSS)
    var interact = svgEl("g", null, svg);
    var items = [];
    for (var j = 0; j < m.n; j++) {
      (function (j) {
        var cx = xv(j);
        var hit = svgEl("rect", { x: r2(left + j * band), y: 0, width: r2(band), height: top + plotH, "class": "ejc-hit--line" }, interact);
        var pts = svgEl("g", { "class": "ejc-pts" }, interact);
        svgEl("line", { x1: r2(cx) + 0.5, x2: r2(cx) + 0.5, y1: top, y2: top + plotH, "class": "ejc-cross" }, pts);
        var minY = top + plotH, rects = [];
        m.S.forEach(function (s, k) {
          var v = s.values[j];
          if (v == null) return;
          var y = yv(v);
          minY = Math.min(minY, y);
          rects.push({ k: k, x: cx, y: y, w: 0, h: 0 });
          svgEl("circle", { cx: r2(cx), cy: r2(y), r: 4.5, "class": "ejc-dot " + tc(s.tone) }, pts);
        });
        items.push({
          el: hit, ax: cx, ay: minY,
          aria: m.aria(j),
          tip: function () { return m.tip(j); },
          pick: function (px, py) { return rects.length ? nearestRect(rects, px, py) : 0; },
          payload: function (k) { return m.payload(j, k); }
        });
      })(j);
    }
    m.sr(el, "Courbe");
    inst.tip = makeTip(el);
    wire(inst, svg, W, items);
  }

  /* ==========================================================
     DONUT
     ========================================================== */
  function polar(cx, cy, r, a) { return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  function arcPath(cx, cy, r, a0, a1) {
    var p0 = polar(cx, cy, r, a0), p1 = polar(cx, cy, r, a1);
    return "M" + r2(p0[0]) + " " + r2(p0[1]) + "A" + r2(r) + " " + r2(r) + " 0 " + (a1 - a0 > Math.PI ? 1 : 0) + " 1 " + r2(p1[0]) + " " + r2(p1[1]);
  }

  function drawDonut(inst, W, animate) {
    var el = inst.el, o = inst.opts, famD = inst.famD;
    var fmt = typeof o.format === "function" ? o.format : fmtNum;
    var items0 = (o.items || []).map(function (it, i) {
      var v = it.value == null || !isFinite(it.value) ? 0 : Math.max(0, +it.value);
      return { label: String(it.label == null ? "" : it.label), value: v, tone: TONES[it.tone] ? it.tone : DEFAULT_TONES[i % DEFAULT_TONES.length] };
    });
    var total = items0.reduce(function (a, b) { return a + b.value; }, 0);
    var Dmax = o.height || 180;
    if (!items0.length || total <= 0) return emptyState(inst, Dmax);

    var stack = W < Dmax + 190;
    var D = Math.max(110, Math.min(Dmax, W - 8));
    var wrap = htmlEl("div", "ejc-donut" + (stack ? " is-stack" : ""), el);
    var label = o.ariaLabel || o.title || ("Anneau : " + items0.map(function (it) { return it.label; }).join(", "));
    var svg = svgEl("svg", { viewBox: "0 0 " + D + " " + D, width: D, height: D, role: "img", "aria-label": label });
    svg.style.width = D + "px";
    svg.style.height = D + "px";
    if (animate) svg.classList.add("ejc-anim");
    wrap.appendChild(svg);

    var R = D / 2 - 6, sw = Math.max(10, R * 0.22), rm = R - sw / 2, c = D / 2;
    svg.style.setProperty("--sw", r2(sw) + "px");
    var vis = items0.filter(function (it) { return it.value > 0; });
    var hl = o.highlight == null ? null : o.highlight;
    var segs = [];
    var angle = -Math.PI / 2;
    var gapA = vis.length > 1 ? 2.5 / rm : 0;
    var pcts = items0.map(function (it) { return (it.value / total) * 100; });
    var spec = [];

    items0.forEach(function (it, i) {
      if (it.value <= 0) { segs.push(null); return; }
      var sweep = (it.value / total) * Math.PI * 2;
      var a0 = angle + gapA / 2, a1 = angle + sweep - gapA / 2;
      if (a1 - a0 < 0.012) a1 = a0 + 0.012;
      angle += sweep;
      var seg;
      var cls = "ejc-seg " + tc(it.tone);
      if (vis.length === 1) {
        seg = svgEl("circle", { cx: c, cy: c, r: r2(rm), pathLength: 100, transform: "rotate(-90 " + c + " " + c + ")", "class": cls }, svg);
      } else {
        seg = svgEl("path", { d: arcPath(c, c, rm, a0, a1), pathLength: 100, "class": cls }, svg);
      }
      var mid = (a0 + a1) / 2, ap = polar(c, c, R + 2, mid);
      segs.push(seg);
      spec.push({
        el: seg, ax: ap[0], ay: ap[1], idx: i,
        aria: it.label + " : " + fmt(it.value) + " (" + fmtPct(pcts[i]) + ")",
        tip: function () { return { title: it.label, rows: [{ tone: it.tone, name: fmtPct(pcts[i]), value: fmt(it.value) }] }; },
        payload: function () { return { serie: it.label, serieIndex: i, categorie: it.label, valeur: it.value, index: i, tone: it.tone }; }
      });
    });

    // valeur centrale (remplacée par l'élément survolé)
    var center = o.center || null;
    var cv = null, cl = null;
    function setCenter(v, l) {
      if (!cv) return;
      var maxW = (R - sw) * 2 * 0.82;
      var fs = clamp(D * 0.17, 16, 30);
      while (fs > 12 && measure(v, fs, 600, famD) > maxW) fs -= 1;
      cv.setAttribute("font-size", fs);
      cv.textContent = v;
      cl.textContent = fit(l || "", maxW, 11.5, 400, inst.fam);
    }
    if (center) {
      cv = svgEl("text", { x: c, y: c + 2, "text-anchor": "middle", "class": "ejc-cval" }, svg);
      cl = svgEl("text", { x: c, y: c + 20, "text-anchor": "middle", "class": "ejc-clab" }, svg);
      setCenter(center.value == null ? "" : String(center.value), center.label || "");
    }

    // légende à droite (ou dessous)
    var ul = htmlEl("ul", "ejc-dlegend", wrap);
    var lis = items0.map(function (it, i) {
      var li = htmlEl("li", tc(it.tone), ul);
      htmlEl("span", "ejc-sw", li).setAttribute("aria-hidden", "true");
      var nm = htmlEl("span", "nm", li, it.label);
      nm.title = it.label;
      htmlEl("span", "vl", li, fmt(it.value));
      htmlEl("span", "pc", li, fmtPct(pcts[i]));
      return li;
    });

    function activate(idx) {
      var act = idx == null ? hl : idx;
      wrap.classList.toggle("has-act", act != null && items0[act] && items0[act].value > 0);
      segs.forEach(function (s, i) { if (s) s.classList.toggle("is-act", i === act); });
      lis.forEach(function (li, i) { li.classList.toggle("is-act", i === act); });
      if (center) {
        if (idx != null && items0[idx]) setCenter(fmt(items0[idx].value), items0[idx].label);
        else setCenter(center.value == null ? "" : String(center.value), center.label || "");
      }
    }
    activate(null);
    lis.forEach(function (li, i) {
      li.addEventListener("mouseenter", function () { activate(i); });
      li.addEventListener("mouseleave", function () { activate(null); });
      li.addEventListener("click", function () {
        if (typeof inst.opts.onSelect === "function") {
          inst.opts.onSelect({ serie: items0[i].label, serieIndex: i, categorie: items0[i].label, valeur: items0[i].value, index: i, tone: items0[i].tone });
        }
      });
    });

    srTable(el, label, ["Élément", "Valeur", "Part"], items0.map(function (it, i) { return [it.label, fmt(it.value), fmtPct(pcts[i])]; }));
    inst.tip = makeTip(el);
    wire(inst, svg, D, spec, {
      active: function (k) { activate(k == null ? null : spec[k].idx); }
    });
  }

  /* ==========================================================
     SPARKLINE
     ========================================================== */
  function drawSpark(inst, W, animate) {
    var o = inst.opts, fmt = typeof o.format === "function" ? o.format : fmtNum;
    var H = o.height || 32;
    var vals = (o.values || []).map(function (v) { return v == null || !isFinite(v) ? null : +v; });
    var real = vals.filter(function (v) { return v != null; });
    if (!real.length) return emptyState(inst, H);
    var tone = TONES[o.tone] ? o.tone : "primary";
    var label = o.ariaLabel || o.title ||
      ("Tendance : de " + fmt(real[0]) + " à " + fmt(real[real.length - 1]));
    var svg = newSvg(inst, W, H, label, animate);
    svg.setAttribute("class", (animate ? "ejc-anim " : "") + tc(tone));
    var padX = 5, padY = 5;
    var lo = Math.min.apply(null, real), hi = Math.max.apply(null, real);
    var span = hi - lo || 1;
    var n = vals.length;
    var xs = function (i) { return n === 1 ? W - padX : padX + (i / (n - 1)) * (W - padX * 2); };
    var ys = function (v) { return hi === lo ? H / 2 : padY + (1 - (v - lo) / span) * (H - padY * 2); };
    var segs = [], seg = null, last = null;
    vals.forEach(function (v, i) {
      if (v == null) { seg = null; return; }
      if (!seg) { seg = []; segs.push(seg); }
      seg.push([xs(i), ys(v)]);
      last = [xs(i), ys(v)];
    });
    var uid = "ejc-s" + (++uidCounter);
    var defs = svgEl("defs", null, svg);
    var grad = svgEl("linearGradient", { id: uid, x1: 0, x2: 0, y1: 0, y2: 1 }, defs);
    svgEl("stop", { offset: "0%", style: "stop-color:var(--cs);stop-opacity:.16" }, grad);
    svgEl("stop", { offset: "100%", style: "stop-color:var(--cs);stop-opacity:0" }, grad);
    var area = segs.filter(function (g) { return g.length > 1; }).map(function (g) {
      return g.map(function (p, j) { return (j ? "L" : "M") + r2(p[0]) + " " + r2(p[1]); }).join("") +
        "L" + r2(g[g.length - 1][0]) + " " + (H - 1) + "L" + r2(g[0][0]) + " " + (H - 1) + "Z";
    }).join("");
    if (area) svgEl("path", { d: area, fill: "url(#" + uid + ")", "class": "ejc-spark-area" }, svg);
    var d = segs.map(function (g) {
      return g.map(function (p, j) { return (j ? "L" : "M") + r2(p[0]) + " " + r2(p[1]); }).join("");
    }).join("");
    svgEl("path", { d: d, "class": "ejc-spark-line" }, svg);
    if (last) svgEl("circle", { cx: r2(last[0]), cy: r2(last[1]), r: 3, "class": "ejc-spark-dot" }, svg);
    srTable(inst.el, label, ["Rang", "Valeur"], vals.map(function (v, i) { return [String(i + 1), v == null ? "n.d." : fmt(v)]; }));
  }

  /* ==========================================================
     GAUGE
     ========================================================== */
  function drawGauge(inst, W, animate) {
    var el = inst.el, o = inst.opts, fam = inst.fam, famD = inst.famD;
    var max = o.max > 0 ? +o.max : 100;
    var value = o.value == null || !isFinite(o.value) ? 0 : +o.value;
    var frac = clamp(value / max, 0, 1);
    var tone = TONES[o.tone] ? o.tone : "primary";
    var text = typeof o.format === "function" ? o.format(value, max) : fmtPct((value / max) * 100);
    var lab = o.label == null ? "" : String(o.label);
    var aria = o.ariaLabel || (lab ? lab + " : " : "") + text;
    var variant = o.variant === "bar" ? "bar" : "arc";

    if (variant === "bar") {
      var H = 44;
      var svg = newSvg(inst, W, H, aria, animate);
      svg.setAttribute("class", (animate ? "ejc-anim " : "") + tc(tone));
      svgEl("text", { x: W, y: 17, "text-anchor": "end", "class": "ejc-cval", "font-size": 17 }, svg, text);
      var vw = measure(text, 17, 600, famD);
      if (lab) svgEl("text", { x: 0, y: 16, "class": "ejc-glab" }, svg, fit(lab, Math.max(30, W - vw - 16), 12, 400, fam));
      svgEl("rect", { x: 0, y: 28, width: W, height: 10, rx: 5, "class": "ejc-gbar-track" }, svg);
      if (frac > 0) svgEl("rect", { x: 0, y: 28, width: r2(Math.max(10, W * frac)), height: 10, rx: 5, "class": "ejc-gbar-fill" }, svg);
      return;
    }

    var swMin = 10;
    var rMax = o.height ? o.height - 36 : 96;
    var r = Math.max(30, Math.min((W - 24) / 2, rMax));
    var sw = clamp(r * 0.15, swMin, 16);
    r = Math.max(24, Math.min(r, (W - sw - 4) / 2));
    var cy = 3 + sw / 2 + r, cx = W / 2;
    var Ht = cy + sw / 2 + (lab ? 24 : 6);
    var svg2 = newSvg(inst, W, Ht, aria, animate);
    svg2.setAttribute("class", (animate ? "ejc-anim " : "") + tc(tone));
    var d = "M" + r2(cx - r) + " " + r2(cy) + "A" + r2(r) + " " + r2(r) + " 0 0 1 " + r2(cx + r) + " " + r2(cy);
    svgEl("path", { d: d, pathLength: 100, "class": "ejc-gtrack", "stroke-width": r2(sw) }, svg2);
    if (frac > 0) {
      var f = svgEl("path", { d: d, pathLength: 100, "class": "ejc-gfill", "stroke-width": r2(sw) }, svg2);
      f.style.strokeDasharray = "100";
      f.style.strokeDashoffset = r2(100 - frac * 100);
    }
    var maxTW = (r - sw) * 2 * 0.86;
    var fs = clamp(r * 0.5, 18, 34);
    while (fs > 13 && measure(text, fs, 600, famD) > maxTW) fs -= 1;
    svgEl("text", { x: cx, y: cy - 6, "text-anchor": "middle", "class": "ejc-cval", "font-size": r2(fs) }, svg2, text);
    if (lab) svgEl("text", { x: cx, y: cy + sw / 2 + 15, "text-anchor": "middle", "class": "ejc-glab" }, svg2, fit(lab, W - 8, 12, 400, fam));
  }

  /* ==========================================================
     STRIP : frise de cases (une par catégorie, intensité = valeur)
     ========================================================== */
  function drawStrip(inst, W, animate) {
    var el = inst.el, o = inst.opts, famD = inst.famD;
    var fmt = typeof o.format === "function" ? o.format : fmtNum;
    var cats = (o.categories || []).map(String);
    var n = cats.length;
    if (!n) return emptyState(inst, 68);
    var vals = cats.map(function (c, i) {
      var v = (o.values || [])[i];
      return v == null || v === "" || !isFinite(v) ? null : +v;
    });
    var real = vals.filter(function (v) { return v != null; });
    var max = o.max > 0 ? +o.max : (real.length ? Math.max.apply(null, real) : 0);
    var tone = TONES[o.tone] ? o.tone : "primary";
    var nullLabel = o.nullLabel != null ? String(o.nullLabel) : "Non disponible";
    var titles = o.tooltipTitles || [];
    var name = o.name == null ? "" : String(o.name);
    var title = function (i) { return titles[i] != null ? String(titles[i]) : cats[i]; };
    var label = o.ariaLabel || o.title ||
      ("Frise : " + (name ? name + ", " : "") + n + " " + (n > 1 ? "périodes" : "période"));

    // 12 cases sur une ligne au-delà de 560 px, 6 × 2 en dessous, 4 × 3 sous 360 px
    var gap = W < 360 ? 4 : 6;
    var per;
    if (n <= 4) per = n;
    else if (W >= 560) per = n <= 12 ? n : Math.ceil(n / Math.ceil(n / 12));
    else if (W >= 360) per = Math.ceil(n / 2);
    else per = Math.max(Math.ceil(n / 3), 4);
    per = Math.min(per, n);
    var cw = (W - gap * (per - 1)) / per;

    // taille commune de la valeur : la plus grande qui tienne dans la case la plus large en texte
    var fs = cw >= 64 ? 18 : 16;
    vals.forEach(function (v) {
      if (v == null) return;
      var txt = fmt(v);
      while (fs > 12 && measure(txt, fs, 600, famD) > cw - 10) fs -= 1;
    });

    var grid = htmlEl("div", "ejc-strip " + tc(tone) + (animate ? " ejc-anim" : ""), el);
    grid.style.gridTemplateColumns = "repeat(" + per + ",minmax(0,1fr))";
    grid.style.gap = gap + "px";
    grid.style.setProperty("--sb", tone === "primary" ? "var(--ej-primary-50)" : "var(--ej-white)");
    var base = "ejc-" + (++uidCounter) + "-";
    var stepDelay = Math.min(14, 120 / n);
    var cells = [];

    cats.forEach(function (cat, i) {
      var v = vals[i];
      var na = v == null;
      var cell = htmlEl("div", "ejc-cell" + (na ? " is-na" : ""), grid);
      cell.id = base + i;
      cell.setAttribute("role", "option");
      cell.setAttribute("data-i", String(i));
      cell.setAttribute("aria-label", title(i) + " : " + (na ? nullLabel : fmt(v)));
      cell.style.setProperty("--d", r2(i * stepDelay) + "ms");
      htmlEl("span", "ejc-cell-l", cell, cat);
      var vEl = htmlEl("span", "ejc-cell-v", cell, na ? (cw < 56 ? "n.d." : nullLabel) : fmt(v));
      if (!na) {
        // l'intensité va de primary-50 à primary-900 ; on saute la zone où ni le texte sombre ni le texte blanc
        // n'atteignent 4,5:1 (entre 50 % et 66 % de teinte) pour que chaque valeur reste lisible
        var t = max > 0 ? clamp(v / max, 0, 1) : 0;
        if (t > 0.5 && t < 0.66) t = t < 0.58 ? 0.5 : 0.66;
        cell.style.setProperty("--m", String(r2(t * 100)));
        if (t >= 0.66) cell.classList.add("is-ink");
        vEl.style.fontSize = fs + "px";
      }
      cells.push(cell);
    });

    if (o.note) htmlEl("p", "ejc-strip-note", el, String(o.note));
    srTable(el, label, ["Période", name || "Valeur"], cats.map(function (c, i) {
      return [title(i), vals[i] == null ? nullLabel : fmt(vals[i])];
    }));

    var tip = makeTip(el);
    inst.tip = tip;
    var selectable = typeof o.onSelect === "function";
    if (selectable) el.classList.add("is-selectable");

    function spec(i) {
      var row = { name: name, value: vals[i] == null ? nullLabel : fmt(vals[i]) };
      if (name) row.tone = tone;
      return { title: title(i), rows: [row] };
    }
    function payload(i) {
      return { serie: name, serieIndex: 0, categorie: cats[i], valeur: vals[i], index: i, tone: tone };
    }

    // un seul arrêt de tabulation : la frise reçoit le focus, les flèches parcourent les cases
    grid.setAttribute("tabindex", "0");
    grid.setAttribute("role", "listbox");
    grid.setAttribute("aria-label", label);
    inst.focusTarget = grid;
    var kb = null;
    function cellOf(t) {
      var c = t && t.closest ? t.closest(".ejc-cell") : null;
      return c && grid.contains(c) ? +c.getAttribute("data-i") : null;
    }
    function showAt(i, e) {
      var h = el.getBoundingClientRect();
      if (e) tip.show(spec(i), e.clientX - h.left, e.clientY - h.top);
      else {
        var r = cells[i].getBoundingClientRect();
        tip.show(spec(i), r.left - h.left + r.width / 2, r.top - h.top);
      }
    }
    function clearKb() {
      if (kb != null && cells[kb]) cells[kb].classList.remove("is-kb");
      kb = null;
      grid.removeAttribute("aria-activedescendant");
    }
    function goKb(i) {
      i = clamp(i, 0, n - 1);
      if (kb != null && cells[kb]) cells[kb].classList.remove("is-kb");
      kb = i;
      inst.kb = i;
      cells[i].classList.add("is-kb");
      grid.setAttribute("aria-activedescendant", base + i);
      showAt(i, null);
    }
    function pointer(e) {
      var i = cellOf(e.target);
      if (i == null) { tip.hide(); return; }
      showAt(i, e);
    }
    grid.addEventListener("pointermove", pointer);
    grid.addEventListener("pointerdown", function (e) { clearKb(); pointer(e); });
    grid.addEventListener("pointerleave", function (e) { if (e.pointerType !== "touch") tip.hide(); });
    grid.addEventListener("click", function (e) {
      var i = cellOf(e.target);
      if (i != null && selectable) o.onSelect(payload(i));
    });
    grid.addEventListener("focus", function () {
      var vis = true;
      try { vis = grid.matches(":focus-visible"); } catch (err) { vis = true; }
      if (vis) goKb(inst.kb != null ? inst.kb : 0);
    });
    grid.addEventListener("blur", function () { clearKb(); tip.hide(); });
    grid.addEventListener("keydown", function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var go = null, cur = kb == null ? 0 : kb;
      if (e.key === "ArrowRight") go = kb == null ? 0 : cur + 1;
      else if (e.key === "ArrowLeft") go = kb == null ? n - 1 : cur - 1;
      else if (e.key === "ArrowDown") go = kb == null ? 0 : (cur + per < n ? cur + per : cur);
      else if (e.key === "ArrowUp") go = kb == null ? n - 1 : (cur - per >= 0 ? cur - per : cur);
      else if (e.key === "Home") go = 0;
      else if (e.key === "End") go = n - 1;
      else if (e.key === "Escape") { tip.hide(); return; }
      else if ((e.key === "Enter" || e.key === " ") && selectable) {
        e.preventDefault();
        o.onSelect(payload(cur));
        return;
      }
      if (go != null) {
        e.preventDefault();
        goKb(go);
      }
    });
  }

  /* ==========================================================
     Montage commun : redessin au redimensionnement, update, destroy
     ========================================================== */
  function mount(el, type, options, drawFn) {
    if (!el) throw new Error("EJCharts." + type + " : conteneur introuvable");
    if (el.__ejc) el.__ejc.destroy();
    injectCss();

    var inst = { el: el, opts: Object.assign({}, options || {}), drawn: false, lastW: 0, destroyed: false, tip: null, kb: null, focusTarget: null };
    var raf = 0, ro = null;

    function render(animate) {
      if (inst.destroyed) return;
      el.classList.add("ejc", "ejc-k-" + type);
      var W = Math.floor(innerWidth(el));
      inst.lastW = W;
      if (W <= 0) return; // conteneur masqué : on redessinera à l'affichage
      var cs = getComputedStyle(el);
      inst.fam = cs.fontFamily || "sans-serif";
      inst.famD = (cs.getPropertyValue("--ej-font-display") || "").trim() || "Sora, sans-serif";
      var hadFocus = !!inst.focusTarget && el.contains(document.activeElement) && document.activeElement === inst.focusTarget;
      el.textContent = "";
      el.classList.remove("is-selectable");
      inst.tip = null;
      inst.focusTarget = null;
      try {
        drawFn(inst, W, !!animate);
        inst.drawn = true;
        if (hadFocus && inst.focusTarget) inst.focusTarget.focus({ preventScroll: true });
      } catch (err) {
        el.textContent = "";
        if (global.console) console.error("EJCharts." + type, err);
      }
    }

    function onDocDown(e) {
      if (inst.tip && !el.contains(e.target)) inst.tip.hide();
    }
    document.addEventListener("pointerdown", onDocDown);

    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(function (entries) {
        var w = Math.floor(entries[0].contentRect.width); // contentRect exclut déjà le padding
        if (w === inst.lastW) return;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () { render(!inst.drawn); });
      });
      ro.observe(el);
    } else {
      var onWin = function () {
        if (Math.floor(innerWidth(el)) !== inst.lastW) render(false);
      };
      window.addEventListener("resize", onWin);
      inst.offWin = function () { window.removeEventListener("resize", onWin); };
    }

    // les polices (Sora, Inter) changent les mesures : un redessin quand elles sont prêtes
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (!inst.destroyed && inst.drawn) render(false);
      });
    }

    render(true);

    var api = {
      update: function (next) {
        if (inst.destroyed) return;
        if (next) Object.assign(inst.opts, next);
        render(true);
      },
      destroy: function () {
        if (inst.destroyed) return;
        inst.destroyed = true;
        cancelAnimationFrame(raf);
        if (ro) ro.disconnect();
        if (inst.offWin) inst.offWin();
        document.removeEventListener("pointerdown", onDocDown);
        el.textContent = "";
        el.classList.remove("ejc", "ejc-k-" + type, "is-selectable");
        if (el.__ejc === api) delete el.__ejc;
      }
    };
    el.__ejc = api;
    return api;
  }

  global.EJCharts = {
    version: "1.1.0",
    bar: function (el, opts) {
      return mount(el, "bar", opts, function (inst, W, animate) {
        return inst.opts.horizontal ? drawBarH(inst, W, animate) : drawBarV(inst, W, animate);
      });
    },
    line: function (el, opts) { return mount(el, "line", opts, drawLine); },
    donut: function (el, opts) { return mount(el, "donut", opts, drawDonut); },
    sparkline: function (el, opts) { return mount(el, "sparkline", opts, drawSpark); },
    gauge: function (el, opts) { return mount(el, "gauge", opts, drawGauge); },
    strip: function (el, opts) { return mount(el, "strip", opts, drawStrip); },
    format: { number: fmtNum, percent: fmtPct },
    tones: Object.keys(TONES)
  };
})(window);
