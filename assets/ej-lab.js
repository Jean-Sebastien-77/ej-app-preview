/* Express Juridique · Lifting 2026 · Logique LAB partagée
   Utilisée par lab.html (file de travail) et lab-dossier.html (onglet Vigilance LAB).
   - fiches d'identification fictives (siège, capital, dirigeant, bénéficiaires effectifs)
   - règle unique des pièces attendues
   - revues validées pendant la session (sessionStorage « ej-lab-revues »)
   - collectes envoyées (sessionStorage « ej-collectes », lues aussi par suivi-actions.html)
   - fenêtre « Envoyer une collecte au client » et message de confirmation
   À charger après ej-missions-data.js (et ej-dpj-data.js si disponible). Données fictives. */
(function () {
  var E = window.EJM;
  if (!E) return;
  var esc = E.esc;

  /* ---------- Stockage de session (navigation privée : repli en mémoire) ---------- */
  var MEM = {};
  function lire(k) {
    try {
      var v = sessionStorage.getItem(k);
      return v ? JSON.parse(v) : null;
    } catch (e) {
      return MEM[k] || null;
    }
  }
  function ecrire(k, v) {
    MEM[k] = v;
    try {
      sessionStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }

  /* ---------- Dates ---------- */
  function dt(x) {
    var p = x.split("/");
    return new Date(+p[2], +p[1] - 1, +p[0]);
  }
  function fmt(date) {
    function z(n) {
      return (n < 10 ? "0" : "") + n;
    }
    return z(date.getDate()) + "/" + z(date.getMonth() + 1) + "/" + date.getFullYear();
  }
  function plusJours(x, n) {
    var date = dt(x);
    date.setDate(date.getDate() + n);
    return fmt(date);
  }
  function plusMois(x, n) {
    var date = dt(x);
    date.setMonth(date.getMonth() + n);
    return fmt(date);
  }
  function joursEntre(a, b) {
    return Math.round((dt(b) - dt(a)) / 86400000);
  }

  function estCAC(s) {
    return E.mandats.indexOf(s) !== -1;
  }
  function trouver(id) {
    return E.societes.filter(function (x) { return x.id === id; })[0] || E.mandats.filter(function (x) { return x.id === id; })[0] || null;
  }

  /* ---------- Fiches d'identification (fictives, cohérentes avec EJM) ----------
     [siège, capital, dirigeant, bénéficiaires effectifs, associés sous le seuil]
     BE : [nom, détention (% capital et droits de vote ou nature du contrôle)]
     Seuil : plus de 25 % du capital ou des droits de vote, ou contrôle par un autre moyen.
     Le nombre de BE listés doit égaler lab.be. */
  var FICHES = {
    paprika: ["14 quai de la Fosse, 44000 Nantes", "20 000 €", "Camille Rousseau, Présidente",
      [["Camille Rousseau", "60 % du capital et des droits de vote"], ["Hugo Lefèvre", "40 % du capital et des droits de vote"]]],
    axiome: ["8 rue Pasteur, 69003 Lyon", "10 000 €", "Marc Vidal, gérant",
      [["Marc Vidal", "100 % du capital et des droits de vote"]]],
    helios: ["220 avenue des Pins, 13100 Aix-en-Provence", "450 000 €", "Étienne Marchand, Président",
      [["Étienne Marchand", "38 % du capital et des droits de vote"], ["Sophie Brun", "27 % du capital et des droits de vote"], ["Mathieu Solère", "35 % du capital (détention indirecte, via une société)"]]],
    kpl3d: ["3 rue des Forges, 38000 Grenoble", "50 000 €", "Antoine Faure, Président",
      [["Antoine Faure", "55 % du capital et des droits de vote"], ["Léa Giraud", "45 % du capital et des droits de vote"]]],
    orvea: ["27 rue de la République, 33000 Bordeaux", "30 000 €", "Inès Carpentier, Présidente",
      [["Inès Carpentier", "100 % du capital et des droits de vote"]]],
    "cap-esterel": ["5 boulevard de la Mer, 83700 Saint-Raphaël", "1 000 €", "Philippe Aubert, gérant",
      [["Philippe Aubert", "35 % des parts"], ["Nathalie Aubert", "35 % des parts"]],
      [["Jérôme Costa", "15 %"], ["Valérie Costa", "15 %"]]],
    lumen: ["41 rue du Faubourg, 31000 Toulouse", "5 000 €", "Manon Duval, Présidente", []],
    "azur-holding": ["12 avenue Jean Médecin, 06000 Nice", "800 000 €", "Olivier Santini, Président",
      [["Olivier Santini", "70 % du capital et des droits de vote"], ["Claire Santini", "30 % du capital et des droits de vote"]]],
    mercier: ["18 rue de la Paix, 75002 Paris", "20 000 €", "Hélène Mercier, gérante",
      [["Hélène Mercier", "50 % du capital et des droits de vote"], ["Julien Roche", "30 % du capital et des droits de vote"]],
      [["Aurélie Petit", "20 %"]]],
    sourire: ["9 place Carnot, 54000 Nancy", "8 000 €", "Paul Henry, gérant",
      [["Paul Henry", "100 % du capital et des droits de vote"]]],
    "urban-fit": ["77 rue des Sports, 59000 Lille", "100 000 €", "Kévin Laurent, Président",
      [["Kévin Laurent", "51 % du capital et des droits de vote"], ["Sandra Noël", "49 % du capital et des droits de vote"]]],
    "tb-elec": ["3 zone artisanale du Moulin, 49000 Angers", "7 500 €", "Thierry Bouchet, gérant",
      [["Thierry Bouchet", "100 % du capital et des droits de vote"]]],
    "groupe-bmr": ["1 route de Rennes, 35000 Rennes", "2 400 000 €", "Bruno Marchal, Président-directeur général",
      [["Bruno Marchal", "38 % du capital et des droits de vote"], ["Claire Marchal", "27 % du capital et des droits de vote"]]],
    neolab: ["55 rue de la Recherche, 67000 Strasbourg", "40 000 €", "Pierre Weiss, Président", []],
    odalis: ["6 rue Gambetta, 34000 Montpellier", "5 000 €", "Sabrina Mallet, gérante",
      [["Sabrina Mallet", "100 % du capital et des droits de vote"]]],
    kalipso: ["120 quai du Port, 13002 Marseille", "15 000 €", "Karim Haddad, gérant",
      [["Karim Haddad", "100 % du capital et des droits de vote"]]],
    sotrab: ["Zone industrielle Les Landes, 85000 La Roche-sur-Yon", "600 000 €", "Daniel Chevalier, Président",
      [["Daniel Chevalier", "60 % du capital et des droits de vote"], ["Marie Chevalier", "40 % du capital et des droits de vote"]]],
    botanica: ["14 chemin des Serres, 44300 Nantes", "12 000 €", "Lucie Fabre, Présidente",
      [["Lucie Fabre", "100 % du capital et des droits de vote"]]],
    /* Entités contrôlées (commissariat aux comptes) */
    vertalis: ["11 avenue de l'Industrie, 69007 Lyon", "4 800 000 €", "Gilles Perrot, Président-directeur général",
      [["Gilles Perrot", "41 % du capital et des droits de vote"], ["Anne Perrot", "33 % du capital et des droits de vote"]]],
    nordia: ["Zone logistique de la Plaine, 59810 Lesquin", "1 200 000 €", "Fabrice Leclerc, Président",
      [["Fabrice Leclerc", "80 % du capital et des droits de vote"]],
      [["Laure Gillet", "20 %"]]],
    "clinique-parc": ["4 avenue du Parc, 37000 Tours", "2 000 000 €", "Laurent Besson, Président",
      [["Laurent Besson", "52 % du capital et des droits de vote"], ["Valérie Aubry", "30 % du capital et des droits de vote"]],
      [["Marc Hervé", "18 %"]]],
    halios: ["7 quai Kléber, 67000 Strasbourg", "9 600 000 €", "Gérard Vasseur, Président-directeur général",
      [["Gérard Vasseur", "44 % du capital et des droits de vote"], ["Hélène Courtois", "31 % du capital et des droits de vote"]]],
    dorval: ["Zone artisanale des Chênes, 72000 Le Mans", "150 000 €", "Régis Dorval, Président",
      [["Régis Dorval", "85 % du capital et des droits de vote"]],
      [["Odile Dorval", "15 %"]]],
    brioche: ["18 rue du Moulin, 76000 Rouen", "400 000 €", "Sylvain Berthier, Président",
      [["Sylvain Berthier", "55 % du capital et des droits de vote"], ["Corinne Berthier", "45 % du capital et des droits de vote"]]],
    soleil: ["3 rue des Tilleuls, 87000 Limoges", null, "Monique Faure, Présidente de l'association",
      [["Monique Faure", "Représentant légal, à défaut (présidente de l'association)"]]],
    marees: ["2 boulevard de la Plage, 17000 La Rochelle", "600 000 €", "Anne-Sophie Maillard, Présidente",
      [["Anne-Sophie Maillard", "34 % du capital et des droits de vote"], ["Denis Maillard", "28 % du capital et des droits de vote"], ["Laurent Pichon", "27 % du capital et des droits de vote"]],
      [["Ophélie Pichon", "11 %"]]],
    technopole: ["21 avenue de la Technopole, 34000 Montpellier", "85 000 €", "Yanis Belkacem, Président",
      [["Yanis Belkacem", "62 % du capital et des droits de vote"]],
      [["Fonds d'amorçage Littoral", "20 %"], ["Inès Moulin", "18 %"]]],
  };
  function fiche(id) {
    return FICHES[id] || null;
  }

  /* ---------- Pièces attendues : règle unique (nombre attendu = lab.pieces[1]) ---------- */
  function piecesAttendues(s) {
    var L = s.lab, P = L.pieces;
    var F = fiche(s.id);
    var BE = F ? F[3] : [];
    var association = s.forme === "Association";
    var indirect = BE.some(function (b) { return /indirect/.test(b[1]); });
    var holding = /^Holding/.test(s.activite);
    var liste = association
      ? [
          ["Statuts à jour", ""],
          ["Composition du bureau", "procès-verbal de la dernière assemblée"],
          ["Publication au Journal officiel", "déclaration de l'association"],
          ["Pièce d'identité du représentant légal", "la présidente de l'association"],
          ["Justificatif de domicile du siège", ""],
        ]
      : [
          ["Extrait RNE ou Kbis", "de moins de 3 mois"],
          ["Statuts à jour", ""],
          ["Pièce d'identité du dirigeant", ""],
          ["Pièces d'identité des bénéficiaires effectifs", "une par bénéficiaire"],
          ["Justificatif de domicile du siège", ""],
        ];
    if (P[1] > 5) liste.push(["Origine des fonds", "selon le cas"]);
    var cand = [];
    if (indirect) cand.push(["Organigramme de détention", "exigé : détention indirecte"]);
    else if (holding) cand.push(["Organigramme du groupe", s.activite === "Holding animatrice" ? "filiales animées, pour la holding animatrice" : "périmètre des comptes consolidés"]);
    if (L.ppe || L.risque === "eleve") cand.push(["Origine du patrimoine", "à documenter en cas de PPE ou de risque élevé"]);
    cand.push(["Dernier bilan", "pour le profil d'activité"]);
    return liste.concat(cand.slice(0, Math.max(0, P[1] - liste.length))).slice(0, P[1]);
  }
  function piecesManquantes(s) {
    return piecesAttendues(s).slice(s.lab.pieces[0]);
  }
  function nbManquantes(s) {
    return Math.max(0, s.lab.pieces[1] - s.lab.pieces[0]);
  }

  /* ---------- Destinataire de la collecte : dirigeant (DPJ pour une société cliente) ---------- */
  function dirigeant(s) {
    if (!estCAC(s) && window.EJDPJ) {
      var f = window.EJDPJ.byId(s.id);
      if (f && f.dirigeants && f.dirigeants[0]) return { nom: f.dirigeants[0].nom, fct: f.dirigeants[0].fonction, src: "repris du DPJ" };
    }
    var F = fiche(s.id);
    if (F) {
      var p = F[2].split(",");
      return { nom: p[0].trim(), fct: p.slice(1).join(",").trim(), src: estCAC(s) ? "repris du dossier de la mission" : "repris du dossier LAB" };
    }
    return null;
  }

  /* ---------- Revues : périodicité, validations de la session ---------- */
  var GRILLE_MOIS = { faible: 36, standard: 24, eleve: 12 };
  function moisEntre(a, b) {
    var x = dt(a), y = dt(b);
    return (y.getFullYear() - x.getFullYear()) * 12 + (y.getMonth() - x.getMonth());
  }
  function periodiciteMois(L) {
    if (L.derniereRevue && L.prochaineRevue) return moisEntre(L.derniereRevue, L.prochaineRevue);
    return L.risque ? GRILLE_MOIS[L.risque] : 0;
  }
  /* Validateur des revues passées : attribution stable (associé EC pour une société cliente, associée CAC pour une entité contrôlée) */
  function validateurHistorique(s) {
    return E.equipe[estCAC(s) ? "CD" : "TG"];
  }
  var CLE_REVUES = "ej-lab-revues";
  function revuesSession() {
    var r = lire(CLE_REVUES);
    return r && typeof r === "object" && !Array.isArray(r) ? r : {};
  }
  function appliquerRevue(s, r) {
    s.lab.statut = "a_jour";
    s.lab.derniereRevue = r.date;
    s.lab.prochaineRevue = r.prochaine;
  }
  /* Applique dès le chargement les revues validées pendant la session (la file et la fiche les reflètent) */
  (function () {
    var r = revuesSession();
    Object.keys(r).forEach(function (id) {
      var s = trouver(id);
      if (s && r[id] && r[id].avant) appliquerRevue(s, r[id]);
    });
  })();
  function revueSession(id) {
    return revuesSession()[id] || null;
  }
  function validerRevue(s, par) {
    var L = s.lab;
    var mois = periodiciteMois(L);
    var r = {
      date: E.today,
      par: par,
      mois: mois,
      prochaine: plusMois(E.today, mois),
      avant: { statut: L.statut, derniereRevue: L.derniereRevue, prochaineRevue: L.prochaineRevue },
    };
    var tout = revuesSession();
    tout[s.id] = r;
    ecrire(CLE_REVUES, tout);
    appliquerRevue(s, r);
    return r;
  }

  /* ---------- Collectes envoyées (contrat partagé avec suivi-actions.html) ---------- */
  var CLE_COLLECTES = "ej-collectes";
  function collectes() {
    var l = lire(CLE_COLLECTES);
    return Array.isArray(l) ? l : [];
  }
  function collectesDe(id) {
    return collectes().filter(function (c) { return c && c.societeId === id; });
  }
  function derniereCollecte(id) {
    var l = collectesDe(id);
    return l.length ? l[l.length - 1] : null;
  }
  function enregistrerCollecte(s, pieces, dest, par) {
    var l = collectes();
    var c = {
      id: "col-" + Date.now().toString(36) + "-" + l.length,
      societeId: s.id,
      societe: s.nom,
      pieces: pieces,
      destinataire: dest,
      date: E.today,
      origine: "LAB",
      par: par || "",
    };
    l.push(c);
    ecrire(CLE_COLLECTES, l);
    return c;
  }
  /* Demande de pièces initiale (au journal du dossier) : envoyée deux jours après l'ouverture d'un dossier incomplet */
  function demandeInitiale(s) {
    var L = s.lab;
    if (L.statut !== "incomplet" || !L.ouverture) return null;
    return { date: plusJours(L.ouverture, 2), n: nbManquantes(s) };
  }
  function dejaDemande(s) {
    return !!demandeInitiale(s) || collectesDe(s.id).length > 0;
  }
  function verbePieces(s) {
    return dejaDemande(s) ? "Relancer le client" : "Demander les pièces";
  }

  /* ---------- Styles de la fenêtre et du message (jetons uniquement) ---------- */
  var CSS =
    ".lab-modal{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:24px;background:color-mix(in srgb,var(--ej-primary-900) 32%,transparent);opacity:0;visibility:hidden;transition:opacity var(--ej-transition-normal),visibility 0s linear 250ms}" +
    ".lab-modal.open{opacity:1;visibility:visible;transition:opacity var(--ej-transition-normal),visibility 0s}" +
    ".lab-modal-box{width:100%;max-width:520px;max-height:calc(100vh - 48px);overflow-y:auto;background:var(--ej-white);border-radius:var(--ej-radius-xl);box-shadow:var(--ej-shadow-xl);transform:translateY(8px);transition:transform var(--ej-transition-normal)}" +
    ".lab-modal.open .lab-modal-box{transform:none}" +
    ".lab-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:20px 22px 14px;border-bottom:1px solid var(--ej-hairline)}" +
    ".lab-modal-head h2{font-size:18px;font-weight:600;color:var(--ej-primary-900);outline:none}" +
    ".lab-modal-head h2:focus-visible{outline:2px solid var(--ej-action-600);outline-offset:3px;border-radius:var(--ej-radius-sm)}" +
    ".lab-modal-head p{margin-top:2px;font-size:13px;color:var(--ej-neutral-500)}" +
    ".lab-modal-body{padding:18px 22px;display:flex;flex-direction:column;gap:16px;font-size:14px}" +
    ".lab-lbl{margin-bottom:6px;font-family:var(--ej-font-display);font-size:13px;font-weight:600;color:var(--ej-primary-900)}" +
    ".lab-dest{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--ej-hairline);border-radius:var(--ej-radius-md)}" +
    ".lab-dest .ms{color:var(--ej-neutral-400)}" +
    ".lab-dest small,.lab-pieces small{display:block;font-size:12px;color:var(--ej-neutral-500)}" +
    ".lab-pieces{display:flex;flex-direction:column;gap:2px;border:0;padding:0;margin:0;min-width:0}" +
    ".lab-pieces label{display:flex;align-items:flex-start;gap:10px;padding:7px 4px;border-radius:var(--ej-radius-sm);cursor:pointer}" +
    ".lab-pieces label:hover{background:var(--ej-neutral-50)}" +
    ".lab-pieces input{margin-top:3px;accent-color:var(--ej-action-600)}" +
    ".lab-modal-note{font-size:12.5px;color:var(--ej-neutral-500)}" +
    ".lab-modal-foot{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:14px 22px 18px;border-top:1px solid var(--ej-hairline)}" +
    ".lab-toast{position:fixed;left:50%;bottom:32px;z-index:110;transform:translate(-50%,16px);display:flex;align-items:center;gap:10px;max-width:calc(100vw - 32px);padding:12px 18px;border-radius:var(--ej-radius-lg);background:var(--ej-primary-900);color:var(--ej-white);font-size:14px;box-shadow:var(--ej-shadow-lg);opacity:0;visibility:hidden;transition:opacity var(--ej-transition-normal),transform var(--ej-transition-normal),visibility 0s linear 250ms}" +
    ".lab-toast.show{opacity:1;visibility:visible;transform:translate(-50%,0);transition:opacity var(--ej-transition-normal),transform var(--ej-transition-normal),visibility 0s}" +
    ".lab-toast .ms{flex-shrink:0;color:var(--ej-logo-mint)}" +
    ".lab-toast a{font-weight:600;color:var(--ej-white);text-decoration:underline;text-underline-offset:2px;white-space:nowrap}" +
    ".lab-toast a:focus-visible{outline:2px solid var(--ej-logo-mint);outline-offset:2px;border-radius:var(--ej-radius-sm)}" +
    "@media (max-width:760px){.lab-modal{align-items:flex-end;padding:0}.lab-modal-box{max-width:none;max-height:92vh;border-radius:var(--ej-radius-xl) var(--ej-radius-xl) 0 0}.lab-modal-foot .btn{flex:1 1 0}.lab-toast{bottom:20px;flex-wrap:wrap}}";
  var styleOk = false;
  function styles() {
    if (styleOk) return;
    styleOk = true;
    var st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- Message de confirmation : reste affiché tant qu'il a le focus ou le pointeur ---------- */
  var toastEl = null, toastT = null, toastDedans = false;
  function cacherToast() {
    if (toastDedans || !toastEl) return;
    toastEl.classList.remove("show");
  }
  function armerToast() {
    clearTimeout(toastT);
    toastT = setTimeout(cacherToast, 8000);
  }
  function toast(html) {
    styles();
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "lab-toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      toastEl.innerHTML = '<span class="ms" aria-hidden="true">circle-check</span><span class="lab-toast-txt"></span>';
      document.body.appendChild(toastEl);
      toastEl.addEventListener("focusin", function () { toastDedans = true; clearTimeout(toastT); });
      toastEl.addEventListener("focusout", function (e) {
        if (toastEl.contains(e.relatedTarget)) return;
        toastDedans = false;
        armerToast();
      });
      toastEl.addEventListener("mouseenter", function () { clearTimeout(toastT); });
      toastEl.addEventListener("mouseleave", function () { if (!toastDedans) armerToast(); });
    }
    toastEl.querySelector(".lab-toast-txt").innerHTML = html;
    toastEl.classList.add("show");
    armerToast();
  }

  /* ---------- Fenêtre « Envoyer une collecte au client » ----------
     Fermée : inert + visibility:hidden (rien d'atteignable). Ouverte : focus sur le titre,
     focus piégé (Tab, Maj+Tab), Échap ferme, le reste de la page est rendu inerte. */
  var M = null, courant = null, opts = null, inertes = [];
  function construire() {
    styles();
    M = document.createElement("div");
    M.className = "lab-modal";
    M.id = "collecte";
    M.setAttribute("role", "dialog");
    M.setAttribute("aria-modal", "true");
    M.setAttribute("aria-labelledby", "col-title");
    M.setAttribute("aria-describedby", "col-soc");
    M.inert = true;
    M.innerHTML =
      '<div class="lab-modal-box">' +
      '<div class="lab-modal-head"><div><h2 id="col-title" tabindex="-1">Envoyer une collecte au client</h2><p id="col-soc"></p></div>' +
      '<button class="icon-btn" type="button" data-close aria-label="Fermer"><span class="ms">close</span></button></div>' +
      '<div class="lab-modal-body">' +
      '<div><div class="lab-lbl" id="col-dest-lbl">Destinataire</div><div class="lab-dest" id="col-dest"></div></div>' +
      '<fieldset class="lab-pieces" id="col-pieces"><legend class="lab-lbl" id="col-lbl">Pièces demandées</legend><div id="col-liste"></div></fieldset>' +
      '<p class="lab-modal-note">Le client dépose ses pièces depuis un lien sécurisé, avec relances automatiques, comme pour les signatures et documents. Les pièces reçues rejoignent le dossier LAB.</p>' +
      "</div>" +
      '<div class="lab-modal-foot"><button class="btn btn-tertiary" type="button" data-close>Annuler</button>' +
      '<button class="btn btn-primary" type="button" id="col-send"><span class="ms">send</span>Envoyer la collecte</button></div>' +
      "</div>";
    document.body.appendChild(M);
    M.addEventListener("click", function (e) {
      if (e.target === M || e.target.closest("[data-close]")) fermer();
    });
    M.querySelector("#col-liste").addEventListener("change", majEnvoi);
    M.querySelector("#col-send").addEventListener("click", envoyer);
    M.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        fermer();
        return;
      }
      if (e.key !== "Tab") return;
      var f = focusables();
      if (!f.length) return;
      var premier = f[0], dernier = f[f.length - 1], a = document.activeElement;
      if (e.shiftKey && (a === premier || a === M.querySelector("#col-title") || !M.contains(a))) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && (a === dernier || !M.contains(a))) {
        e.preventDefault();
        premier.focus();
      }
    });
    /* Filet : le focus ne quitte jamais la fenêtre ouverte */
    document.addEventListener("focusin", function (e) {
      if (!ouverte() || M.contains(e.target)) return;
      if (toastEl && toastEl.contains(e.target)) return;
      M.querySelector("#col-title").focus();
    });
  }
  function ouverte() {
    return !!M && M.classList.contains("open");
  }
  function focusables() {
    return Array.prototype.filter.call(M.querySelectorAll("button, input, a[href], [tabindex='0']"), function (x) {
      return !x.disabled;
    });
  }
  function majEnvoi() {
    M.querySelector("#col-send").disabled = M.querySelectorAll("#col-liste input:checked").length === 0;
  }
  function rendreInerte(oui) {
    if (oui) {
      inertes = Array.prototype.filter.call(document.body.children, function (x) {
        return x !== M && x !== toastEl && x.tagName !== "SCRIPT" && x.tagName !== "STYLE" && !x.inert;
      });
      inertes.forEach(function (x) { x.inert = true; });
    } else {
      inertes.forEach(function (x) { x.inert = false; });
      inertes = [];
    }
  }
  function ouvrir(s, o) {
    if (!M) construire();
    courant = s;
    opts = o || {};
    var dg = dirigeant(s);
    var pcs = piecesManquantes(s);
    var n = nbManquantes(s);
    M.querySelector("#col-title").textContent = dejaDemande(s) ? "Relancer le client" : "Envoyer une collecte au client";
    M.querySelector("#col-soc").textContent = s.nom + " · " + n + (n > 1 ? " pièces manquantes" : " pièce manquante") + " sur " + s.lab.pieces[1];
    M.querySelector("#col-dest").innerHTML =
      '<span class="ms" aria-hidden="true">user-round</span><div>' +
      (dg ? "<strong>" + esc(dg.nom) + "</strong>" + (dg.fct ? ", " + esc(dg.fct) : "") + "<small>Dirigeant " + esc(dg.src) + "</small>" : "<strong>Dirigeant à renseigner</strong><small>Absent du DPJ</small>") +
      "</div>";
    M.querySelector("#col-lbl").textContent = "Pièces demandées (" + pcs.length + ")";
    M.querySelector("#col-liste").innerHTML = pcs.map(function (p, i) {
      return '<label><input type="checkbox" checked data-p="' + i + '" value="' + esc(p[0]) + '" /><span>' + esc(p[0]) + (p[1] ? "<small>" + esc(p[1]) + "</small>" : "") + "</span></label>";
    }).join("");
    majEnvoi();
    rendreInerte(true);
    M.inert = false;
    M.classList.add("open");
    M.querySelector("#col-title").focus();
  }
  function fermer(sansRetour) {
    if (!M || !ouverte()) return;
    var o = opts || {};
    M.classList.remove("open");
    M.inert = true;
    rendreInerte(false);
    courant = null;
    opts = null;
    if (!sansRetour && o.declencheur && document.body.contains(o.declencheur)) o.declencheur.focus();
  }
  function envoyer() {
    if (!courant || !opts) return;
    var s = courant, o = opts;
    var pieces = Array.prototype.map.call(M.querySelectorAll("#col-liste input:checked"), function (x) { return x.value; });
    if (!pieces.length) return;
    var dg = dirigeant(s);
    var user = window.EJ_USER || {};
    var c = enregistrerCollecte(s, pieces, dg ? dg.nom : "Dirigeant à renseigner", user.nom);
    fermer(true);
    if (typeof o.onEnvoi === "function") o.onEnvoi(c);
    toast("Collecte envoyée à " + esc(c.destinataire) + ', suivie dans <a href="suivi-actions.html#collectes">Suivi des actions</a>');
  }

  window.EJLAB = {
    dt: dt,
    fmt: fmt,
    plusJours: plusJours,
    plusMois: plusMois,
    joursEntre: joursEntre,
    estCAC: estCAC,
    trouver: trouver,
    fiche: fiche,
    piecesAttendues: piecesAttendues,
    piecesManquantes: piecesManquantes,
    nbManquantes: nbManquantes,
    dirigeant: dirigeant,
    GRILLE_MOIS: GRILLE_MOIS,
    periodiciteMois: periodiciteMois,
    validateurHistorique: validateurHistorique,
    revueSession: revueSession,
    validerRevue: validerRevue,
    collectes: collectes,
    collectesDe: collectesDe,
    derniereCollecte: derniereCollecte,
    demandeInitiale: demandeInitiale,
    dejaDemande: dejaDemande,
    verbePieces: verbePieces,
    toast: toast,
    collecte: { ouvrir: ouvrir, fermer: fermer, ouverte: ouverte },
  };
})();
