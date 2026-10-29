/* Express Juridique · Lifting 2026
   Injecte l'en-tête, la barre latérale, le pied de page et la bulle d'aide
   dans les emplacements #ej-header, #ej-sidebar, #ej-footer de chaque page.
   La page déclare son entrée active via <body data-active="...">. */
(function () {
  var NAV = [
    { id: "accueil", label: "Accueil", icon: "home", href: "accueil.html" },
    { id: "formalites", label: "Formalités", icon: "topic", href: "formalites.html" },
    { id: "societes", label: "Sociétés", icon: "storefront", href: "societes.html" },
    { id: "suivi", label: "Suivi des actions", icon: "table_chart", href: "suivi-actions.html" },
    { id: "ifu", label: "Export IFU 2025", sub: "Assistance à la décla.", icon: "price_change", href: "export-ifu.html", profils: ["ec", "cac", "mixte"] },
    { section: "Missions & conformité", profils: ["ec", "cac", "mixte"] },
    { id: "lettres", label: "Lettres de mission", icon: "file_pen_line", href: "lettres-mission.html", profils: ["ec", "mixte"] },
    { id: "lab", label: "Dispositif LAB", sub: "Lutte anti-blanchiment", icon: "shield_check", href: "lab.html", profils: ["ec", "cac", "mixte"] },
    { id: "cac", label: "Missions CAC", sub: "Mandats et missions ponctuelles", icon: "briefcase", href: "cac.html", profils: ["cac", "mixte"] },
    { section: "Administration" },
    { id: "connecteurs", label: "Connecteurs", icon: "cable", href: "connecteurs.html" },
    { id: "etiquettes", label: "Étiquettes", icon: "bookmarks", href: "etiquettes.html" },
  ];
  /* L'organisation (cabinet, utilisateurs, abonnement, facturation) est dans le
     menu du compte, en haut à droite, pour alléger la barre latérale. */

  var USER_MENU = [
    { label: "Mon compte", icon: "person_outline", href: "#" },
    { divider: true },
    { head: "Organisation" },
    { label: "Mon cabinet", icon: "store", href: "mon-cabinet.html" },
    { label: "Utilisateurs", icon: "supervisor_account", href: "utilisateurs.html" },
    { label: "Souscriptions", icon: "shop", href: "souscriptions.html" },
    { label: "Moyens de paiement", icon: "credit_card", href: "moyens-de-paiement.html" },
    { label: "Factures", icon: "receipt_long", href: "factures.html" },
    { divider: true },
    { label: "Se déconnecter", icon: "logout", href: "#" },
  ];

  /* Cockpit avec Claude : la même page publiée comme Artifact Claude.ai (window.claude y existe avant les scripts).
     Sur ej-app-preview, l'onglet Cockpit ouvre cette version dans un nouvel onglet ; dans l'Artifact,
     les autres pages restent celles d'ej-app-preview (liens absolus, nouvel onglet). */
  var PREVIEW = "https://jean-sebastien-77.github.io/ej-app-preview/";
  var COCKPIT_CLAUDE = "https://claude.ai/artifact/6PwkrcDqaAaE4Kc5BahVGn";
  var IN_CLAUDE = !!(window.claude && typeof window.claude.use === "function");
  window.EJ_PREVIEW = PREVIEW;
  window.EJ_IN_CLAUDE = IN_CLAUDE;

  var active = document.body.getAttribute("data-active") || "";
  /* Accueil et Cockpit sont deux onglets d'une même entrée de menu. */
  if (active === "cockpit") active = "accueil";

  /* Profil de cabinet simulé (maquette) : ec, cac ou mixte. Gardé dans le
     navigateur ; les pages lisent document.body.dataset.profil. */
  var PROFILS = [
    { id: "ec", label: "Expert-comptable" },
    { id: "cac", label: "Commissaire aux comptes" },
    { id: "mixte", label: "Cabinet mixte EC et CAC" },
  ];
  var profil = "ec";
  /* Liens de l'index : ?cabinet=vasseur|delmas et ?profil=ec|cac|mixte posent la vue avant l'affichage */
  try {
    var qc = /[?&]cabinet=(vasseur|delmas)\b/.exec(location.search);
    if (qc) localStorage.setItem("ej-cabinet", qc[1]);
    var qp = /[?&]profil=(ec|cac|mixte)\b/.exec(location.search);
    if (qp) localStorage.setItem("ej-profil", qp[1]);
  } catch (e) {}
  try {
    var saved = localStorage.getItem("ej-profil");
    if (PROFILS.some(function (p) { return p.id === saved; })) profil = saved;
  } catch (e) {}
  /* Cabinet actif simulé : le cabinet DELMAS (EC et CAC) ou le conseil de KERLYS, SELARL VASSEUR AVOCATS.
     Deux comptes distincts : le conseil ne voit ni les missions ni le LAB du cabinet DELMAS.
     Côté conseil, body[data-profil] vaut "conseil" et le sélecteur de vue par activité disparaît. */
  var CABINETS = [
    { id: "delmas", nom: "CABINET DELMAS EXPERTISE" },
    { id: "vasseur", nom: "SELARL VASSEUR AVOCATS" },
  ];
  var cabinet = "delmas";
  try {
    if (localStorage.getItem("ej-cabinet") === "vasseur") cabinet = "vasseur";
  } catch (e) {}
  var cabinetNom = CABINETS.filter(function (c) { return c.id === cabinet; })[0].nom;
  if (cabinet === "vasseur") profil = "conseil";
  document.body.setAttribute("data-profil", profil);
  document.body.setAttribute("data-cabinet", cabinet);
  var profilLabel = profil === "conseil" ? "" : PROFILS.filter(function (p) { return p.id === profil; })[0].label;
  window.EJ_PROFIL = profil;
  window.EJ_CABINET = { id: cabinet, nom: cabinetNom };
  /* Utilisateur connecté simulé : l'associée CAC en profil cac, l'avocate au conseil, sinon l'associé EC. */
  var user = profil === "conseil" ? { initiales: "AV", nom: "Anne Vasseur" }
    : profil === "cac" ? { initiales: "CD", nom: "Claire Dubois" } : { initiales: "TG", nom: "Thomas Girard" };
  window.EJ_USER = user;

  var css =
    ".dropdown{position:relative}" +
    ".dropdown-menu{position:absolute;right:0;top:calc(100% + 6px);min-width:220px;background:var(--ej-white);border:1px solid var(--ej-neutral-200);border-radius:var(--ej-radius-lg);box-shadow:var(--ej-shadow-lg);padding:6px;opacity:0;transform:translateY(-4px);pointer-events:none;transition:opacity 150ms ease,transform 150ms ease;z-index:80}" +
    ".dropdown.open .dropdown-menu{opacity:1;transform:none;pointer-events:auto}" +
    ".dropdown-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--ej-radius-md);font-size:14px;color:var(--ej-neutral-700)}" +
    ".dropdown-item .ms{font-size:18px;color:var(--ej-neutral-400)}" +
    ".dropdown-item:hover{background:var(--ej-neutral-50);color:var(--ej-neutral-900)}" +
    ".dropdown-item.current{color:var(--ej-action-600)}" +
    ".dropdown-item.current .ms{color:var(--ej-action-600)}" +
    ".dropdown-divider{height:1px;background:var(--ej-neutral-200);margin:6px 4px}" +
    ".dropdown-head{padding:8px 10px 10px;font-size:12px;color:var(--ej-neutral-500)}" +
    ".header-profil{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:var(--ej-radius-full);background:var(--ej-action-100);color:var(--ej-action-700);font-family:var(--ej-font-display);font-size:11.5px;font-weight:600}" +
    ".header-profil .ms{font-size:15px}" +
    ".header-profil:hover{background:var(--ej-action-200)}" +
    ".sidebar-item.soon{color:var(--ej-neutral-400);cursor:default}" +
    ".sidebar-item.soon:hover{background:none;color:var(--ej-neutral-400)}" +
    ".sidebar-item.soon .ms{color:var(--ej-neutral-300)}" +
    ".menu-btn{display:none}" +
    ".home-tabs{margin-bottom:20px}" +
    ".home-tabs .tab{font-size:15px;padding:12px 16px 13px}" +
    ".home-tabs .tab .ms{font-size:19px}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  function replace(id, html) {
    var el = document.getElementById(id);
    if (el) el.outerHTML = html;
  }

  var page = location.pathname.split("/").pop();

  var header =
    '<header class="ej-header">' +
    '<button class="menu-btn icon-btn" type="button" aria-label="Ouvrir le menu" data-menu><span class="ms">menu</span></button>' +
    '<a class="ej-logo" href="accueil.html" aria-label="Express Juridique, accueil"><img src="assets/ej-logo.svg" alt="Express Juridique" /></a>' +
    '<div class="header-right">' +
    (profil === "conseil" ? "" :
    '<div class="dropdown" data-dropdown>' +
    '<button class="header-profil" type="button" aria-haspopup="true" title="Changer de vue"><span class="ms">eye</span><span class="hp-label">' + profilLabel + '</span><span class="ms">expand_more</span></button>' +
    '<div class="dropdown-menu"><div class="dropdown-head">Vue par activité</div>' +
    PROFILS.map(function (p) {
      return '<a class="dropdown-item' + (p.id === profil ? " current" : "") + '" href="#" data-profil="' + p.id + '"><span class="ms">' + (p.id === profil ? "check" : "dot") + "</span>" + p.label + "</a>";
    }).join("") +
    "</div></div>") +
    '<div class="dropdown" data-dropdown>' +
    '<button class="header-company" type="button" aria-haspopup="true"><span class="ms">domain</span>' + cabinetNom + '<span class="ms">expand_more</span></button>' +
    '<div class="dropdown-menu"><div class="dropdown-head">Cabinet actif</div>' +
    CABINETS.map(function (c) {
      return '<a class="dropdown-item' + (c.id === cabinet ? " current" : "") + '" href="#" data-cabinet="' + c.id + '"><span class="ms">' + (c.id === cabinet ? "check" : "dot") + "</span>" + c.nom + "</a>";
    }).join("") +
    "</div></div>" +
    '<span class="header-sep"></span>' +
    '<div class="dropdown" data-dropdown>' +
    '<button class="header-user" type="button" aria-haspopup="true"><span class="avatar avatar-sm">' + user.initiales + "</span>" + user.nom + '<span class="ms">expand_more</span></button>' +
    '<div class="dropdown-menu">' +
    USER_MENU.map(function (m) {
      if (m.divider) return '<div class="dropdown-divider"></div>';
      if (m.head) return '<div class="dropdown-head">' + m.head + "</div>";
      var cur = m.href === page ? " current" : "";
      return '<a class="dropdown-item' + cur + '" href="' + m.href + '"><span class="ms">' + m.icon + "</span>" + m.label + "</a>";
    }).join("") +
    "</div></div>" +
    "</div></header>";

  var sidebar =
    '<nav class="sidebar" aria-label="Navigation principale">' +
    NAV.filter(function (n) {
      return !n.profils || n.profils.indexOf(profil) !== -1;
    }).map(function (n) {
      if (n.section) return '<div class="sidebar-section">' + n.section + "</div>";
      var isActive = n.id === active;
      if (n.soon)
        return (
          '<span class="sidebar-item soon" aria-disabled="true"><span class="ms">' + n.icon + "</span>" +
          "<span>" + n.label + '<span class="sidebar-sub">' + n.sub + "</span></span></span>"
        );
      return (
        '<a class="sidebar-item' + (isActive ? " active" : "") + '" href="' + n.href + '"' + (isActive ? ' aria-current="page"' : "") + ">" +
        '<span class="ms">' + n.icon + "</span>" +
        "<span>" + n.label + (n.sub ? '<span class="sidebar-sub">' + n.sub + "</span>" : "") + "</span></a>"
      );
    }).join("") +
    "</nav>";

  var footer =
    '<footer class="ej-footer"><span>Copyright © 2026- Express Juridique</span>' +
    "<nav>" +
    '<a href="#">Mentions Légales</a><a href="#">CGU</a><a href="#">Paramétrage Cookies</a>' +
    '<a href="#">Politique de confidentialité</a><a href="#">Contact</a>' +
    '</nav><span class="version">stage-v0.29-rejistre</span></footer>' +
    '<button class="help-bubble" type="button" aria-label="Aide et contact"><span class="ms">chat</span></button>';

  var homeTab = document.body.getAttribute("data-home-tab");
  var homeTabs = "";
  if (homeTab) {
    try { localStorage.setItem("ej-home-tab", homeTab); } catch (e) {}
    homeTabs =
      '<nav class="tabs home-tabs" aria-label="Accueil">' +
      [
        { id: "accueil", label: "Accueil", icon: "home", href: "accueil.html?tab=accueil" },
        { id: "cockpit", label: "Cockpit", icon: "layout_dashboard", href: "cockpit.html" },
      ].filter(function (t) {
        /* Le cockpit porte les données du cabinet DELMAS : absent côté conseil */
        return !(profil === "conseil" && t.id === "cockpit");
      }).map(function (t) {
        var on = t.id === homeTab;
        var ext = t.id === "cockpit" && COCKPIT_CLAUDE && !IN_CLAUDE && /\.github\.io$/.test(location.hostname);
        var href = ext ? COCKPIT_CLAUDE + '" target="_blank" rel="noopener' : t.id === "cockpit" && IN_CLAUDE ? "#" : t.href;
        return '<a class="tab' + (on ? " active" : "") + '" href="' + href + '"' + (on ? ' aria-current="page"' : "") + '><span class="ms">' + t.icon + "</span>" + t.label + "</a>";
      }).join("") +
      "</nav>";
  }

  replace("ej-header", header);
  replace("ej-home-tabs", homeTabs);
  replace("ej-sidebar", sidebar);
  replace("ej-footer", footer);

  /* ---------- Pictos : Lucide (trait fin, comme le site vitrine) ----------
     Les pages écrivent <span class="ms">nom_material</span> ; on remplace le
     contenu par l'icône Lucide correspondante. */
  var LUCIDE = {
    account_tree: "network",
    add: "plus",
    add_business: "building",
    add_circle: "circle-plus",
    arrow_back: "arrow-left",
    arrow_forward: "arrow-right",
    auto_awesome: "sparkles",
    bookmarks: "tags",
    cable: "plug",
    category: "layout-grid",
    chat: "message-circle",
    check: "check",
    check_circle: "circle-check",
    checklist: "list-checks",
    chevron_left: "chevron-left",
    chevron_right: "chevron-right",
    close: "x",
    confirmation_number: "ticket",
    contract: "file-text",
    credit_card: "credit-card",
    dataset_linked: "database",
    delete: "trash-2",
    drag_indicator: "grip-vertical",
    description: "file-text",
    diversity_3: "users",
    domain: "landmark",
    done: "check",
    downloading: "chevrons-down",
    edit: "pencil",
    edit_note: "pencil-line",
    error: "circle-alert",
    event_available: "calendar-check",
    expand_less: "chevron-up",
    expand_more: "chevron-down",
    home: "house",
    play_arrow: "play",
    play_circle: "circle-play",
    fact_check: "clipboard-check",
    file_download: "download",
    filter_alt: "filter",
    folder_zip: "folder-archive",
    hourglass_disabled: "hourglass",
    info: "info",
    inventory_2: "archive",
    keyboard_arrow_down: "chevron-down",
    keyboard_arrow_right: "chevron-right",
    label: "tag",
    link: "link",
    logout: "log-out",
    menu_book: "book-open",
    more: "tags",
    more_vert: "ellipsis-vertical",
    navigate_before: "chevron-left",
    open_in_new: "external-link",
    person: "user",
    person_add_alt: "user-plus",
    person_outline: "user",
    picture_as_pdf: "file-down",
    price_change: "badge-euro",
    receipt_long: "receipt",
    search: "search",
    sell: "tag",
    settings: "settings",
    shop: "shopping-bag",
    store: "store",
    storefront: "building-2",
    supervisor_account: "users",
    table_chart: "table-2",
    table_view: "table",
    timeline: "git-commit-vertical",
    topic: "files",
    warning: "triangle-alert",
  };

  function toPascal(name) {
    return name.replace(/(^|-)([a-z0-9])/g, function (_, __, c) { return c.toUpperCase(); });
  }

  function lucidify(root) {
    if (!window.lucide) return;
    (root || document).querySelectorAll(".ms:not([data-lu])").forEach(function (el) {
      var key = el.textContent.trim();
      var name = LUCIDE[key] || key.replace(/_/g, "-");
      var node = window.lucide.icons[toPascal(name)];
      el.setAttribute("data-lu", name);
      el.setAttribute("aria-hidden", "true");
      if (!node) {
        console.warn("[ej-icons] picto sans équivalent Lucide :", key);
        return;
      }
      var svg = window.lucide.createElement(node);
      svg.setAttribute("stroke-width", "1.75");
      el.textContent = "";
      el.appendChild(svg);
    });
  }

  var lu = document.createElement("script");
  lu.src = "https://cdn.jsdelivr.net/npm/lucide@0.469.0/dist/umd/lucide.min.js";
  lu.onload = function () {
    lucidify(document);
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (n.nodeType === 1) lucidify(n.matches && n.matches(".ms") ? n.parentNode : n);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  };
  document.head.appendChild(lu);

  /* Dans l'Artifact, seul le cockpit est publié : les liens vers les autres pages ouvrent ej-app-preview */
  if (IN_CLAUDE)
    document.addEventListener(
      "click",
      function (e) {
        var a = e.target.closest ? e.target.closest("a[href]") : null;
        if (!a || a.hasAttribute("data-cabinet") || a.hasAttribute("data-profil")) return;
        var h = a.getAttribute("href");
        if (!h || h.charAt(0) === "#" || /^[a-z][a-z0-9+.-]*:/i.test(h)) return;
        e.preventDefault();
        e.stopPropagation();
        window.open(PREVIEW + h.replace(/^(\.\/|\/)+/, ""), "_blank", "noopener");
      },
      true
    );

  document.addEventListener("click", function (e) {
    var pick = e.target.closest("[data-profil]");
    if (pick && pick.tagName === "A") {
      e.preventDefault();
      try { localStorage.setItem("ej-profil", pick.getAttribute("data-profil")); } catch (err) {}
      location.reload();
      return;
    }
    /* Changement de cabinet : retour à l'accueil, les pages d'un compte n'existent pas dans l'autre */
    var cab = e.target.closest("[data-cabinet]");
    if (cab && cab.tagName === "A") {
      e.preventDefault();
      if (IN_CLAUDE) {
        window.open(PREVIEW + "accueil.html?tab=accueil&cabinet=" + cab.getAttribute("data-cabinet"), "_blank", "noopener");
        return;
      }
      try { localStorage.setItem("ej-cabinet", cab.getAttribute("data-cabinet")); } catch (err) {}
      location.href = "accueil.html?tab=accueil";
      return;
    }
    if (e.target.closest("[data-menu]")) {
      document.body.classList.toggle("menu-open");
      return;
    }
    if (document.body.classList.contains("menu-open") && !e.target.closest(".sidebar")) document.body.classList.remove("menu-open");
    var dd = e.target.closest("[data-dropdown]");
    var trigger = e.target.closest("[data-dropdown] > button");
    document.querySelectorAll("[data-dropdown].open").forEach(function (d) {
      if (d !== dd) d.classList.remove("open");
    });
    if (trigger) dd.classList.toggle("open");
  });
  /* ---------- Notes derrière un « i » (.info-tip) : placement automatique à l'ouverture ----------
     Un seul modèle pour toutes les pages (CSS dans ej-missions.css). Délégation d'événements :
     aucune initialisation par page, les « i » ajoutés dynamiquement sont couverts.
     La bulle reste entièrement dans l'écran : au-dessus par défaut, en dessous s'il n'y a pas la place
     (ou data-tip="bas" pour forcer), centrée, alignée à gauche ou à droite selon la place horizontale. */
  var TIP_MARGE = 8; /* distance minimale au bord de l'écran */
  var TIP_ECART = 8; /* distance entre le « i » et la bulle (identique au CSS) */
  var TIP_DECAL = 6; /* débord de la bulle alignée sur le bord du « i » (identique au CSS) */
  function placerNote(tip) {
    var pop = tip.querySelector(".info-tip-pop");
    if (!pop || tip.hidden) return;
    tip.classList.add("is-mesure"); /* affiche la bulle sans la rendre visible, pour la mesurer */
    tip.removeAttribute("data-tip-pos");
    tip.removeAttribute("data-tip-align");
    tip.style.removeProperty("--tip-dx");
    tip.style.removeProperty("--tip-maxh");
    tip.style.removeProperty("--tip-ov");
    var vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
    var r = tip.getBoundingClientRect();
    var w = pop.offsetWidth, h = pop.offsetHeight;
    /* Vertical */
    var place = { haut: r.top - TIP_ECART - TIP_MARGE, bas: vh - r.bottom - TIP_ECART - TIP_MARGE };
    var pref = tip.getAttribute("data-tip") === "bas" ? "bas" : "haut";
    var autre = pref === "bas" ? "haut" : "bas";
    var pos = place[pref] >= h ? pref : place[autre] >= h ? autre : place.haut >= place.bas ? "haut" : "bas";
    if (h > place[pos]) {
      /* écran vraiment trop bas : la bulle défile en interne plutôt que de sortir */
      tip.style.setProperty("--tip-maxh", Math.max(48, Math.floor(place[pos])) + "px");
      tip.style.setProperty("--tip-ov", "auto");
    }
    tip.setAttribute("data-tip-pos", pos);
    /* Horizontal : centrée, sinon vers la droite, sinon vers la gauche, sinon centrée puis recalée */
    var cx = r.left + r.width / 2;
    var cand = [
      { al: "", left: cx - w / 2 },
      { al: "debut", left: r.left - TIP_DECAL },
      { al: "fin", left: r.right + TIP_DECAL - w },
    ];
    var choix = null;
    for (var i = 0; i < cand.length; i++) {
      if (cand[i].left >= TIP_MARGE && cand[i].left + w <= vw - TIP_MARGE) { choix = cand[i]; break; }
    }
    if (!choix) {
      choix = cand[0];
      var cale = Math.min(Math.max(choix.left, TIP_MARGE), Math.max(TIP_MARGE, vw - TIP_MARGE - w));
      tip.style.setProperty("--tip-dx", Math.round(cale - choix.left) + "px");
    }
    if (choix.al) tip.setAttribute("data-tip-align", choix.al);
    tip.classList.remove("is-mesure");
  }
  function noteDe(cible) {
    return cible && cible.closest ? cible.closest(".info-tip") : null;
  }
  document.addEventListener("mouseover", function (e) {
    var tip = noteDe(e.target);
    if (!tip) return;
    if (!tip.contains(e.relatedTarget)) tip.removeAttribute("data-ferme"); /* nouvelle entrée : Échap n'agit plus */
    placerNote(tip);
  });
  document.addEventListener("focusin", function (e) {
    var tip = noteDe(e.target);
    if (!tip) return;
    tip.removeAttribute("data-ferme");
    placerNote(tip);
  });
  document.addEventListener("click", function (e) {
    /* Toucher : certains navigateurs ne donnent pas le focus à un bouton touché, la note s'ouvre alors par le focus */
    var btn = e.target.closest ? e.target.closest(".info-tip-btn") : null;
    if (!btn) return;
    var tip = noteDe(btn);
    tip.removeAttribute("data-ferme");
    if (document.activeElement !== btn) btn.focus();
    placerNote(tip);
  });
  window.addEventListener("resize", function () {
    Array.prototype.forEach.call(document.querySelectorAll(".info-tip:hover, .info-tip:focus-within"), placerNote);
  });
  document.addEventListener("keydown", function (e) {
    /* Échap referme une note « i » ouverte (au clavier comme au survol). */
    if (e.key === "Escape") {
      var ouverte = noteDe(document.activeElement) || document.querySelector(".info-tip:hover");
      if (ouverte) {
        ouverte.setAttribute("data-ferme", "");
        if (ouverte.contains(document.activeElement)) document.activeElement.blur();
      }
    }
    if (e.key === "Escape") document.querySelectorAll("[data-dropdown].open").forEach(function (d) { d.classList.remove("open"); });
  });
})();
