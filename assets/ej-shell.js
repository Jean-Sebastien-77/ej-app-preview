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
    { id: "ifu", label: "Export IFU 2025", sub: "Assistance à la décla.", icon: "price_change", href: "export-ifu.html" },
    { section: "Missions & conformité" },
    { id: "lettres", label: "Lettres de mission", icon: "file_pen_line", href: "lettres-mission.html", profils: ["ec", "mixte"] },
    { id: "lab", label: "Dispositif LAB", sub: "Lutte anti-blanchiment", icon: "shield_check", href: "lab.html" },
    { id: "cac", label: "Missions CAC", sub: "Mandats et interventions", icon: "briefcase", href: "cac.html", profils: ["cac", "mixte"] },
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
  try {
    var saved = localStorage.getItem("ej-profil");
    if (PROFILS.some(function (p) { return p.id === saved; })) profil = saved;
  } catch (e) {}
  document.body.setAttribute("data-profil", profil);
  var profilLabel = PROFILS.filter(function (p) { return p.id === profil; })[0].label;
  window.EJ_PROFIL = profil;
  /* Utilisateur connecté simulé : l'associée CAC en profil cac, sinon l'associé EC. */
  var user = profil === "cac" ? { initiales: "CD", nom: "Claire Dubois" } : { initiales: "TG", nom: "Thomas Girard" };
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
    '<div class="dropdown" data-dropdown>' +
    '<button class="header-profil" type="button" aria-haspopup="true" title="Profil de démonstration"><span class="ms">eye</span><span class="hp-label">' + profilLabel + '</span><span class="ms">expand_more</span></button>' +
    '<div class="dropdown-menu"><div class="dropdown-head">Profil de démonstration (maquette)</div>' +
    PROFILS.map(function (p) {
      return '<a class="dropdown-item' + (p.id === profil ? " current" : "") + '" href="#" data-profil="' + p.id + '"><span class="ms">' + (p.id === profil ? "check" : "dot") + "</span>" + p.label + "</a>";
    }).join("") +
    "</div></div>" +
    '<div class="dropdown" data-dropdown>' +
    '<button class="header-company" type="button" aria-haspopup="true"><span class="ms">domain</span>CABINET DELMAS EXPERTISE<span class="ms">expand_more</span></button>' +
    '<div class="dropdown-menu"><div class="dropdown-head">Cabinet actif</div>' +
    '<a class="dropdown-item current" href="#"><span class="ms">check</span>CABINET DELMAS EXPERTISE</a></div>' +
    "</div>" +
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
      ].map(function (t) {
        var on = t.id === homeTab;
        return '<a class="tab' + (on ? " active" : "") + '" href="' + t.href + '"' + (on ? ' aria-current="page"' : "") + '><span class="ms">' + t.icon + "</span>" + t.label + "</a>";
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

  document.addEventListener("click", function (e) {
    var pick = e.target.closest("[data-profil]");
    if (pick && pick.tagName === "A") {
      e.preventDefault();
      try { localStorage.setItem("ej-profil", pick.getAttribute("data-profil")); } catch (err) {}
      location.reload();
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
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.querySelectorAll("[data-dropdown].open").forEach(function (d) { d.classList.remove("open"); });
  });
})();
