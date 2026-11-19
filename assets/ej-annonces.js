/* Express Juridique · Annonces légales (LejAL dans EJ)
   Maquette : données fictives, tout est en mémoire, rien n'est envoyé.
   Dates : « aujourd'hui » vaut le 19/11/2026. */
(function () {
  "use strict";

  var TODAY = "2026-11-19";
  var TAUX = 0.25; /* apport d'affaires : 25 % du HT, acquis à la parution */
  var NBSP = " ";

  /* ---------- Outils ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fmtDate(iso) {
    if (!iso) return "";
    var p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }
  function addDays(iso, n) {
    var p = iso.split("-");
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n));
    var m = d.getUTCMonth() + 1, j = d.getUTCDate();
    return d.getUTCFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (j < 10 ? "0" : "") + j;
  }
  function eur(n) {
    var neg = n < 0;
    var s = Math.abs(n).toFixed(2).split(".");
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return (neg ? "-" : "") + s[0] + "," + s[1] + NBSP + "€";
  }
  function round2(n) { return Math.round(n * 100) / 100; }
  function ttc(ht) { return round2(ht * 1.2); }
  function tva(ht) { return round2(ht * 0.2); }
  function apportDe(ht) { return round2(ht * TAUX); }
  function nombre(s) { return parseInt(String(s).replace(/\s/g, ""), 10) || 0; }
  function milliers(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP); }

  /* ---------- Données fictives ---------- */
  var DEPTS = {
    "13": "Bouches-du-Rhône", "33": "Gironde", "44": "Loire-Atlantique",
    "59": "Nord", "69": "Rhône", "75": "Paris"
  };
  var JOURNAL_PAR_DEPT = {
    "13": "La Tribune Démo de Provence", "33": "Le Journal Démo de la Gironde",
    "44": "Les Annonces Démo de Loire-Atlantique", "59": "L’Éclaireur Démo du Nord",
    "69": "La Gazette Démo du Rhône", "75": "Le Courrier Démo de Paris"
  };

  /* nom : SIREN, forme, capital, adresse, ville du RCS, département */
  var SOC = {
    "AXIOME": ["336 851 161", "SAS", "40 000", "14 avenue des Alpilles, 13100 Aix-en-Provence", "Aix-en-Provence", "13"],
    "CAP ESTEREL": ["359 945 830", "SARL", "8 000", "3 chemin du Port, 44000 Nantes", "Nantes", "44"],
    "HELIOS SAS": ["622 427 249", "SAS", "100 000", "27 rue de Rivoli, 75001 Paris", "Paris", "75"],
    "JULIEN MARCHAL FORMATIONS": ["238 124 756", "SASU", "5 000", "9 rue Garibaldi, 69006 Lyon", "Lyon", "69"],
    "KPL3D": ["187 094 208", "SAS", "15 000", "22 rue Paradis, 13006 Marseille", "Marseille", "13"],
    "LUMEN": ["961 913 731", "SARL", "20 000", "5 quai de Bacalan, 33300 Bordeaux", "Bordeaux", "33"],
    "MERCIER & ASSOCIES": ["757 508 228", "SARL", "30 000", "18 rue de Turbigo, 75003 Paris", "Paris", "75"],
    "NEOLAB.": ["371 758 930", "SAS", "12 000", "41 cours Victor Hugo, 33000 Bordeaux", "Bordeaux", "33"],
    "NOVA STUDIO DÉMO": ["En formation", "SAS", "5 000", "6 rue de la Barre, 69002 Lyon", "Lyon", "69"],
    "ODALIS": ["873 341 810", "SAS", "50 000", "12 rue Sainte-Catherine, 69001 Lyon", "Lyon", "69"],
    "ORVEA": ["119 576 308", "SARL", "25 000", "7 rue du Pas-Saint-Georges, 33000 Bordeaux", "Bordeaux", "33"],
    "PAPRIKA CANTINE": ["795 294 481", "SAS", "10 000", "33 rue du Faubourg Saint-Denis, 75010 Paris", "Paris", "75"],
    "SCI LES TERRASSES DÉMO": ["En formation", "SCI", "1 000", "15 rue des Chantiers, 44000 Nantes", "Nantes", "44"],
    "SOUFFLE ET HARMONIE": ["194 369 835", "SARL", "7 500", "4 place Bellecour, 69002 Lyon", "Lyon", "69"],
    "SOURIRE DENTAIRE": ["362 964 565", "SELARL", "50 000", "10 boulevard Longchamp, 13001 Marseille", "Marseille", "13"],
    "TB ELECTRICITE": ["100 017 061", "SARL", "10 000", "2 rue Lafayette, 33000 Bordeaux", "Bordeaux", "33"],
    "URBAN FIT CLUB": ["272 577 898", "SAS", "30 000", "19 rue de la République, 69002 Lyon", "Lyon", "69"]
  };

  var OPERATIONS = [
    "Transfert de siège", "Changement de dirigeant", "Augmentation de capital",
    "Constitution SAS", "Constitution SCI", "Dissolution"
  ];
  var PRIX_OP = {
    "Transfert de siège": 109, "Changement de dirigeant": 109, "Augmentation de capital": 136,
    "Constitution SAS": 199, "Constitution SCI": 191, "Dissolution": 153
  };
  var SUPP_DEPT = { "75": 0, "13": 0, "33": 0, "44": 0, "59": 0, "69": 0 };

  var ETATS = {
    confirmer: { lib: "À confirmer", cls: "badge-neutral" },
    attente: { lib: "En attente du paiement client", court: "Paiement attendu", cls: "ann-badge-warn" },
    envoi: { lib: "Payée, envoi au journal", cls: "badge-progress" },
    acceptee: { lib: "Acceptée par le journal", cls: "badge-progress" },
    prevue: { lib: "Parution prévue", cls: "badge-progress" },
    verif: { lib: "Parution en cours de vérification", court: "Parution en vérification", cls: "badge-progress" },
    publiee: { lib: "Publiée", cls: "badge-success" },
    refusee: { lib: "Refusée par le journal, à corriger", court: "Refusée, à corriger", cls: "badge-error" },
    annulee: { lib: "Annulée", cls: "badge-neutral" }
  };
  var ORDRE_ETATS = ["confirmer", "attente", "envoi", "acceptee", "prevue", "verif", "publiee", "refusee", "annulee"];
  var EN_COURS_JOURNAL = { envoi: 1, acceptee: 1, prevue: 1, verif: 1 };

  var GAZ_RHONE = "La Gazette Démo du Rhône";
  var ECHO_LYON = "L’Écho Démo de Lyon";
  var COURRIER = "Le Courrier Démo de Paris";
  var LOIRE = "Les Annonces Démo de Loire-Atlantique";
  var GIRONDE = "Le Journal Démo de la Gironde";
  var PROVENCE = "La Tribune Démo de Provence";

  function ligne(o) {
    var s = SOC[o.soc];
    o.dep = s[5];
    return o;
  }
  /* ht : prix HT final de l'annonce. ref : formalité d'origine (absente = hors formalité).
     dem, pay, env, acc : dates des étapes. par : parution prévue ou parue. att : attestation. */
  var ANNONCES = [
    ligne({ id: "AL-2026-0172", soc: "SOURIRE DENTAIRE", op: "Changement de dirigeant", etat: "confirmer", ht: 109, dem: "2026-11-19", par: "2026-12-08", mail: "direction@sourire-dentaire.example" }),
    ligne({ id: "AL-2026-0171", soc: "URBAN FIT CLUB", op: "Transfert de siège", etat: "confirmer", ht: 109, dem: "2026-11-19", par: "2026-12-04", mail: "gerance@urbanfitclub.example" }),
    ligne({ id: "AL-2026-0170", soc: "LUMEN", op: "Changement de dirigeant", ref: "GC-2026-286", etat: "attente", ht: 109, dem: "2026-11-18", par: "2026-12-03", mail: "contact@lumen-bordeaux.example", lien: "p/Lm4T9c" }),
    ligne({ id: "AL-2026-0169", soc: "SCI LES TERRASSES DÉMO", op: "Constitution SCI", ref: "GC-2026-279", etat: "envoi", ht: 191, dem: "2026-11-17", pay: "2026-11-18", env: "2026-11-18", par: "2026-11-27", j: LOIRE, sup: "papier", mail: "gerant@terrasses-demo.example", lien: "p/Sc7Qa2" }),
    ligne({ id: "AL-2026-0168", soc: "NOVA STUDIO DÉMO", op: "Constitution SAS", ref: "GC-2026-281", etat: "acceptee", ht: 199, dem: "2026-11-16", pay: "2026-11-16", env: "2026-11-17", acc: "2026-11-18", par: "2026-11-26", j: GAZ_RHONE, sup: "en ligne", mail: "president@novastudio-demo.example", lien: "p/Nv5Zx8" }),
    ligne({ id: "AL-2026-0167", soc: "HELIOS SAS", op: "Augmentation de capital", ref: "GC-2026-285", etat: "attente", ht: 136, dem: "2026-11-12", par: "2026-11-28", mail: "finance@helios-sas.example", lien: "p/He3Rb6" }),
    ligne({ id: "AL-2026-0166", soc: "AXIOME", op: "Dissolution", ref: "GC-2026-284", etat: "refusee", ht: 153, dem: "2026-11-10", pay: "2026-11-10", env: "2026-11-11", refus: "2026-11-14", par: "2026-11-25", j: PROVENCE, sup: "en ligne", mail: "associes@axiome-conseil.example", lien: "p/Ax9Kd1",
      motif: "Le nom du liquidateur et la date de la décision de dissolution ne figurent pas dans le texte. Le montant du capital doit aussi correspondre à celui du dernier acte déposé." }),
    ligne({ id: "AL-2026-0165", soc: "PAPRIKA CANTINE", op: "Augmentation de capital", ref: "GC-2026-277", etat: "prevue", ht: 136, dem: "2026-11-05", pay: "2026-11-06", env: "2026-11-06", acc: "2026-11-10", par: "2026-11-21", j: COURRIER, sup: "en ligne", mail: "compta@paprika-cantine.example", lien: "p/Pa2Wn7" }),
    ligne({ id: "AL-2026-0164", soc: "ODALIS", op: "Changement de dirigeant", etat: "verif", ht: 109, dem: "2026-10-28", pay: "2026-10-28", env: "2026-10-29", acc: "2026-10-30", par: "2026-11-12", j: ECHO_LYON, sup: "papier", mail: "secretariat@odalis.example", lien: "p/Od6Jf4" }),
    ligne({ id: "AL-2026-0163", soc: "CAP ESTEREL", op: "Transfert de siège", ref: "GC-2026-272", etat: "publiee", ht: 109, dem: "2026-10-27", pay: "2026-10-27", env: "2026-10-28", acc: "2026-10-30", par: "2026-11-10", att: "2026-11-11", j: LOIRE, sup: "papier", mail: "direction@capesterel.example", lien: "p/Ce1Ym3" }),
    ligne({ id: "AL-2026-0162", soc: "SOUFFLE ET HARMONIE", op: "Augmentation de capital", etat: "publiee", ht: 136, dem: "2026-10-22", pay: "2026-10-22", env: "2026-10-23", acc: "2026-10-26", par: "2026-11-06", att: "2026-11-07", j: GAZ_RHONE, sup: "en ligne", mail: "gerance@souffle-harmonie.example", lien: "p/So8Vh5" }),
    ligne({ id: "AL-2026-0161", soc: "NEOLAB.", op: "Dissolution", etat: "annulee", ht: 153, dem: "2026-10-21", pay: "2026-10-21", annul: "2026-10-22", par: "2026-11-05", j: GIRONDE, sup: "en ligne", mail: "associes@neolab.example", lien: "p/Ne4Tc9" }),
    ligne({ id: "AL-2026-0160", soc: "TB ELECTRICITE", op: "Changement de dirigeant", etat: "publiee", ht: 109, dem: "2026-10-20", pay: "2026-10-20", env: "2026-10-21", acc: "2026-10-23", par: "2026-11-04", att: "2026-11-05", j: GIRONDE, sup: "en ligne", mail: "gerant@tb-electricite.example", lien: "p/Tb5Lp2" }),
    ligne({ id: "AL-2026-0159", soc: "JULIEN MARCHAL FORMATIONS", op: "Transfert de siège", etat: "publiee", ht: 109, dem: "2026-10-13", pay: "2026-10-14", env: "2026-10-14", acc: "2026-10-16", par: "2026-10-29", att: "2026-10-30", j: ECHO_LYON, sup: "papier", mail: "julien@marchal-formations.example", lien: "p/Ju7Gs6" }),
    ligne({ id: "AL-2026-0158", soc: "MERCIER & ASSOCIES", op: "Augmentation de capital", ref: "GC-2026-232", etat: "publiee", ht: 136, dem: "2026-10-08", pay: "2026-10-09", env: "2026-10-09", acc: "2026-10-13", par: "2026-10-22", att: "2026-10-23", j: COURRIER, sup: "en ligne", mail: "associes@mercier-associes.example", lien: "p/Me2Bq8" }),
    ligne({ id: "AL-2026-0157", soc: "KPL3D", op: "Transfert de siège", etat: "publiee", ht: 109, dem: "2026-09-02", pay: "2026-09-02", env: "2026-09-03", acc: "2026-09-07", par: "2026-09-17", att: "2026-09-18", j: PROVENCE, sup: "en ligne", mail: "direction@kpl3d.example", lien: "p/Kp3Hn1", vire: "2026-10-15" }),
    ligne({ id: "AL-2026-0156", soc: "ORVEA", op: "Changement de dirigeant", etat: "publiee", ht: 109, dem: "2026-08-20", pay: "2026-08-21", env: "2026-08-21", acc: "2026-08-26", par: "2026-09-03", att: "2026-09-04", j: GIRONDE, sup: "en ligne", mail: "gerance@orvea.example", lien: "p/Or9Dk4", vire: "2026-10-15" })
  ];

  /* Attestations plus anciennes (archive), hors tableau de suivi */
  var ATTESTATIONS_ANCIENNES = [
    { soc: "LES JARDINS D’ORIANE", op: "Augmentation de capital", j: GAZ_RHONE, date: "2026-06-12" },
    { soc: "ALTITUDE CONSEIL", op: "Transfert de siège", j: COURRIER, date: "2026-03-05" },
    { soc: "AXIOME", op: "Changement de dirigeant", j: PROVENCE, date: "2025-11-20" },
    { soc: "PAPRIKA CANTINE", op: "Transfert de siège", j: COURRIER, date: "2025-09-09" },
    { soc: "MBCOMPTA", op: "Dissolution", j: ECHO_LYON, date: "2025-05-14" }
  ];

  /* Apport d'affaires : virements déjà reçus (brut, frais, net) et régularisation */
  var VIREMENTS = [
    { date: "2026-10-15", brut: 54.5, frais: 0.5 },
    { date: "2026-07-15", brut: 188.0, frais: 0.5 },
    { date: "2026-04-15", brut: 143.0, frais: 0.5 }
  ];
  var REGUL = { date: "2026-10-20", soc: "HELIOS SAS", op: "Changement de dirigeant, annonce rejetée après virement", id: "AL-2026-0148", ht: -109, montant: -27.25, etat: "regul" };

  var state = {
    tab: "suivi", q: "", etat: "", groupe: "", periode: "",
    qAtt: "", anAtt: "", frequence: "trimestre"
  };
  var dernierId = 172;

  /* ---------- Règles de lecture ---------- */
  function trouver(id) {
    for (var i = 0; i < ANNONCES.length; i++) if (ANNONCES[i].id === id) return ANNONCES[i];
    return null;
  }
  function siren(r) { return SOC[r.soc][0]; }
  function estPayee(r) { return !!r.pay && r.etat !== "annulee"; }
  function enGroupe(r, g) {
    if (g === "attente") return r.etat === "attente";
    if (g === "journal") return !!EN_COURS_JOURNAL[r.etat];
    if (g === "corriger") return r.etat === "refusee";
    if (g === "publiees") return r.etat === "publiee" && r.par.indexOf("2026-11") === 0;
    return true;
  }
  function dansPeriode(r, p) {
    if (!p) return true;
    var d = r.par;
    if (p === "mois") return d.indexOf("2026-11") === 0;
    if (p === "prec") return d.indexOf("2026-10") === 0;
    if (p === "t3") return d >= "2026-09-01" && d <= "2026-11-30";
    if (p === "venir") return d > TODAY;
    return true;
  }
  function filtrees() {
    var q = state.q.replace(/^\s+|\s+$/g, "").toLowerCase();
    return ANNONCES.filter(function (r) {
      if (q && (r.soc.toLowerCase().indexOf(q) === -1 && r.id.toLowerCase().indexOf(q) === -1 && (r.ref || "").toLowerCase().indexOf(q) === -1 && siren(r).replace(/\s/g, "").indexOf(q.replace(/\s/g, "")) === -1)) return false;
      if (state.etat && r.etat !== state.etat) return false;
      if (state.groupe && !enGroupe(r, state.groupe)) return false;
      return dansPeriode(r, state.periode);
    });
  }

  /* Apport d'affaires d'une annonce : montant et état */
  function apport(r) {
    var m = r.apportVire || apportDe(r.ht);
    if (r.etat === "publiee") return r.vire ? { m: m, cle: "vire", lib: "Viré le " + fmtDate(r.vire) } : { m: m, cle: "acquis", lib: "Acquis à la parution, à virer au prochain virement" };
    if (r.etat === "annulee") return { m: 0, cle: "aucun", lib: "Aucun apport : annonce annulée et remboursée" };
    if (r.etat === "confirmer" || r.etat === "attente") return { m: m, cle: "attente-paiement", lib: "En attente de parution, après le paiement du client" };
    return { m: m, cle: "attente", lib: "En attente de parution" };
  }

  function lienPaiement(r) { return r.lien ? "https://paiement.lejal.example/" + r.lien : ""; }

  /* ---------- Compteurs ---------- */
  var COMPTEURS = [
    { g: "attente", titre: "En attente du paiement client", sub: "Lien de paiement envoyé" },
    { g: "journal", titre: "En cours chez le journal", sub: "Envoi, acceptation, parution" },
    { g: "corriger", titre: "À corriger", sub: "Texte refusé par le journal", attention: true },
    { g: "publiees", titre: "Publiées ce mois", sub: "Novembre 2026, attestations disponibles" }
  ];
  function renderStats() {
    $("ann-stats").innerHTML = COMPTEURS.map(function (c) {
      var n = ANNONCES.filter(function (r) { return enGroupe(r, c.g); }).length;
      var on = state.groupe === c.g;
      return '<button type="button" class="card stat ann-stat' + (c.attention && n ? " attention" : "") + '" data-g="' + c.g + '" aria-pressed="' + (on ? "true" : "false") + '">' +
        '<span class="stat-top"><span>' + esc(c.titre) + '</span><span class="ms ann-check">check</span></span>' +
        '<span class="stat-value">' + n + "</span>" +
        '<span class="stat-sub">' + esc(c.sub) + "</span></button>";
    }).join("");
  }

  /* ---------- Tableau de suivi ---------- */
  function actionDe(r) {
    var id = esc(r.id);
    if (r.etat === "confirmer") return '<button type="button" class="btn btn-primary btn-sm" data-act="confirmer" data-id="' + id + '"><span class="ms">send</span>Confirmer</button>';
    if (r.etat === "attente") {
      var ancien = r.dem <= addDays(TODAY, -3);
      return ancien && !r.relance
        ? '<button type="button" class="btn btn-secondary btn-sm" data-act="relancer" data-id="' + id + '"><span class="ms">refresh-cw</span>Relancer<span class="sr-only"> le client</span></button>'
        : '<button type="button" class="btn btn-secondary btn-sm" data-act="copier" data-id="' + id + '"><span class="ms">copy</span>Copier le lien<span class="sr-only"> de paiement</span></button>';
    }
    if (r.etat === "refusee") return '<button type="button" class="btn btn-primary btn-sm" data-act="corriger" data-id="' + id + '"><span class="ms">edit</span>Corriger</button>';
    if (r.etat === "publiee") return '<button type="button" class="btn btn-secondary btn-sm" data-act="attestation" data-id="' + id + '"><span class="ms">file_download</span>Attestation<span class="sr-only"> : télécharger</span></button>';
    return '<button type="button" class="btn btn-tertiary btn-sm" data-act="voir" data-id="' + id + '">Détail</button>';
  }
  function parutionTxt(r) {
    if (r.etat === "annulee") return '<span class="muted">Aucune</span>';
    if (r.etat === "publiee" || r.etat === "verif") return "parue le " + fmtDate(r.par);
    return "prévue le " + fmtDate(r.par);
  }
  function journalTxt(r) {
    if (!r.j || (!r.pay && r.etat !== "annulee")) return '<span class="muted">Attribué après paiement</span>';
    return esc(r.j) + ' <span class="ann-sup">' + esc(r.sup) + "</span>";
  }
  function origineTxt(r) {
    if (!r.ref) return '<span class="muted">Hors formalité</span>';
    var href = r.ref === "GC-2026-281" ? "formalite.html?id=nova" : "formalite.html";
    return '<a class="link" href="' + href + '">Formalité ' + esc(r.ref) + "</a>";
  }
  function ligneHtml(r) {
    var e = ETATS[r.etat];
    var libre = r.soc + ", " + r.op;
    var sirenTxt = siren(r);
    return '<tr data-id="' + esc(r.id) + '"' + (r.neuf ? ' class="ann-new"' : "") + ">" +
      '<td><button type="button" class="ann-open" data-open="' + esc(r.id) + '" aria-haspopup="dialog" aria-label="Ouvrir le détail : ' + esc(libre) + '">' + esc(r.soc) + "</button>" +
      '<div class="ann-sub">' + esc(sirenTxt === "En formation" ? "Société en formation" : "SIREN " + sirenTxt) + "</div></td>" +
      "<td>" + esc(r.op) + '<div class="ann-sub">' + origineTxt(r) + "</div></td>" +
      "<td>" + journalTxt(r) + '<div class="ann-sub">' + esc(r.dep) + " " + esc(DEPTS[r.dep]) + "</div></td>" +
      '<td class="nw">' + parutionTxt(r) + "</td>" +
      '<td class="num">' + eur(ttc(r.ht)) + "</td>" +
      '<td><span class="badge ' + e.cls + '" title="' + esc(e.lib) + '">' + esc(e.court || e.lib) + "</span>" + (r.relance ? '<div class="ann-sub">Relancé le ' + fmtDate(r.relance) + "</div>" : "") + "</td>" +
      '<td class="ann-act">' + actionDe(r) + "</td></tr>";
  }
  function renderSuivi() {
    var liste = filtrees();
    $("ann-rows").innerHTML = liste.map(ligneHtml).join("");
    $("ann-empty").hidden = liste.length > 0;
    $("ann-count").textContent = liste.length + (liste.length > 1 ? " annonces" : " annonce") + " sur " + ANNONCES.length;
    var groupesActifs = !!state.groupe;
    $("ann-reset").hidden = !(state.q || state.etat || groupesActifs || state.periode);
    renderStats();
  }

  /* ---------- Attestations ---------- */
  function listeAttestations() {
    var l = ANNONCES.filter(function (r) { return r.etat === "publiee"; }).map(function (r) {
      return { soc: r.soc, op: r.op, j: r.j, sup: r.sup, date: r.par, id: r.id };
    });
    ATTESTATIONS_ANCIENNES.forEach(function (a, i) {
      l.push({ soc: a.soc, op: a.op, j: a.j, sup: "", date: a.date, id: "ANC-" + i });
    });
    l.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    return l;
  }
  function renderAttestations() {
    var q = state.qAtt.replace(/^\s+|\s+$/g, "").toLowerCase();
    var l = listeAttestations().filter(function (a) {
      if (q && a.soc.toLowerCase().indexOf(q) === -1 && a.op.toLowerCase().indexOf(q) === -1) return false;
      return !state.anAtt || a.date.indexOf(state.anAtt) === 0;
    });
    $("ann-att-rows").innerHTML = l.map(function (a) {
      return "<tr><td><strong>" + esc(a.soc) + "</strong></td><td>" + esc(a.op) + "</td><td>" + esc(a.j) + "</td>" +
        '<td class="nw">' + fmtDate(a.date) + '</td><td class="ann-act"><button type="button" class="btn btn-secondary btn-sm" data-att="' + esc(a.id) + '" data-soc="' + esc(a.soc) + '"><span class="ms">file_download</span>Télécharger<span class="sr-only"> l’attestation : ' + esc(a.soc) + ", " + esc(a.op) + "</span></button></td></tr>";
    }).join("");
    $("ann-att-empty").hidden = l.length > 0;
    $("ann-att-count").textContent = l.length + (l.length > 1 ? " attestations" : " attestation");
  }

  /* ---------- Apport d'affaires ---------- */
  function lignesApport() {
    var l = [];
    ANNONCES.forEach(function (r) {
      if (!estPayee(r)) return;
      var a = apport(r);
      var date = r.etat === "publiee" || r.etat === "verif" ? r.par : r.pay;
      if (date < "2026-09-01") return;
      l.push({ date: date, soc: r.soc, op: r.op, id: r.id, ht: r.htInitial || r.ht, montant: a.m, etat: a.cle });
    });
    l.push(REGUL);
    l.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    return l;
  }
  var ETAT_APPORT = {
    attente: ["En attente de parution", "badge-progress"],
    acquis: ["Acquis", "badge-success"],
    vire: ["Viré", "badge-neutral"],
    regul: ["Régularisation", "ann-badge-warn"]
  };
  function totauxApport(lignes) {
    var solde = 0, attente = 0, vireBrut = 0;
    lignes.forEach(function (x) {
      if (x.etat === "acquis" || x.etat === "regul") solde += x.montant;
      if (x.etat === "attente") attente += x.montant;
    });
    VIREMENTS.forEach(function (v) { vireBrut += v.brut; });
    return { solde: round2(solde), attente: round2(attente), annee: round2(vireBrut + solde) };
  }
  var PROCHAIN = "2027-01-15";
  function renderApport() {
    var lignes = lignesApport();
    var t = totauxApport(lignes);
    $("ann-ap-stats").innerHTML =
      '<div class="card stat"><div class="stat-top"><span>Solde à virer</span></div><div class="stat-value">' + eur(t.solde) + '</div><div class="stat-sub">Apports acquis, régularisation déduite</div></div>' +
      '<div class="card stat"><div class="stat-top"><span>En attente de parution</span></div><div class="stat-value">' + eur(t.attente) + '</div><div class="stat-sub">Annonces payées, pas encore parues</div></div>' +
      '<div class="card stat"><div class="stat-top"><span>Acquis cette année</span></div><div class="stat-value">' + eur(t.annee) + '</div><div class="stat-sub">Viré et à virer, 2026</div></div>';
    $("ann-prochain").innerHTML =
      '<div class="ann-card-h"><span class="overline">Prochain virement</span></div>' +
      '<div class="ann-big">' + fmtDate(PROCHAIN) + "</div>" +
      '<div class="small muted">Montant estimé : <strong class="strong">' + eur(round2(t.solde + t.attente)) + "</strong> si les annonces en attente paraissent avant le 31/12/2026.</div>";
    $("ann-ap-rows").innerHTML = lignes.map(function (x) {
      var e = ETAT_APPORT[x.etat];
      return "<tr><td class=\"nw\">" + fmtDate(x.date) + "</td><td><strong>" + esc(x.soc) + "</strong></td><td>" + esc(x.op) + '<div class="ann-sub">' + esc(x.id) + "</div></td>" +
        '<td class="num">' + eur(x.ht) + '</td><td class="num">25' + NBSP + "%</td><td class=\"num\">" + eur(x.montant) + '</td><td><span class="badge ' + e[1] + '">' + e[0] + "</span></td></tr>";
    }).join("");
    $("ann-vir-rows").innerHTML = VIREMENTS.map(function (v) {
      return '<tr><td class="nw">' + fmtDate(v.date) + '</td><td class="num">' + eur(v.brut) + '</td><td class="num">' + eur(-v.frais) + '</td><td class="num"><strong>' + eur(round2(v.brut - v.frais)) + "</strong></td></tr>";
    }).join("");
    var libF = { trimestre: "Chaque trimestre", semestre: "Chaque semestre", annee: "Chaque année" }[state.frequence];
    $("ann-freq").textContent = libF;
  }

  /* ---------- Texte de l'annonce ---------- */
  function texteAnnonce(nom, op, dateRef, dep) {
    var s = SOC[nom];
    if (!s) return "";
    var forme = s[1], cap = s[2], adr = s[3], ville = s[4];
    var formation = s[0] === "En formation";
    var rcs = formation ? "" : " RCS " + ville + " " + s[0] + ".";
    var gerance = /SARL|SELARL|SCI/.test(forme);
    var d = fmtDate(dateRef);
    var tete = nom + ", " + forme + " au capital de " + cap + " euros. Siège social : " + adr + "." + rcs + " ";
    var rcsDe = (/^[AEIOUÉ]/.test(ville) ? "d’" : "de ") + ville;
    var queue = " Mention sera faite au RCS " + rcsDe + ".";
    if (op === "Transfert de siège") {
      return tete + "Aux termes d’une décision du " + d + ", le siège social a été transféré à l’adresse ci-dessus à compter de cette date, l’ancien siège étant situé 8 rue des Ateliers, " + ville + ". L’article des statuts relatif au siège social a été modifié en conséquence." + queue;
    }
    if (op === "Changement de dirigeant") {
      return tete + "Aux termes d’une décision du " + d + ", Madame Claire Fontaine a été nommée " + (gerance ? "gérante" : "présidente") + " en remplacement de Monsieur Paul Armand, démissionnaire." + queue;
    }
    if (op === "Augmentation de capital") {
      var apres = milliers(nombre(cap) + 20000);
      return tete + "Aux termes d’une décision du " + d + ", le capital social a été augmenté de 20" + NBSP + "000 euros par apport en numéraire, pour être porté de " + cap + " à " + apres + " euros. L’article des statuts relatif au capital a été modifié en conséquence." + queue;
    }
    if (op === "Constitution SAS") {
      return "Avis de constitution. Aux termes d’un acte sous seing privé en date du " + d + ", il a été constitué une société par actions simplifiée. Dénomination : " + nom + ". Capital : " + cap + " euros. Siège social : " + adr + ". Objet : conception et production de contenus audiovisuels. Durée : 99 ans. Président : Madame Claire Fontaine, demeurant à " + ville + ". Immatriculation au RCS " + rcsDe + ".";
    }
    if (op === "Constitution SCI") {
      return "Avis de constitution. Aux termes d’un acte sous seing privé en date du " + d + ", il a été constitué une société civile immobilière. Dénomination : " + nom + ". Capital : " + cap + " euros. Siège social : " + adr + ". Objet : acquisition et gestion de biens immobiliers. Durée : 99 ans. Gérant : Monsieur Paul Armand, demeurant à " + ville + ". Immatriculation au RCS " + rcsDe + ".";
    }
    if (op === "Dissolution") {
      return tete + "Aux termes d’une décision du " + d + ", les associés ont prononcé la dissolution anticipée de la société à compter de cette date et nommé Monsieur Paul Armand liquidateur, demeurant au siège social, où la correspondance doit être adressée. Le siège de la liquidation est fixé au siège social." + queue;
    }
    return tete + "Avis relatif à l’opération : " + op + "." + queue;
  }
  function texteDe(r) {
    if (r.texte) return r.texte;
    return texteAnnonce(r.soc, r.op, addDays(r.dem, -5), r.dep);
  }

  /* ---------- Fenêtres ---------- */
  var ouverte = null; /* fenêtre actuellement ouverte */
  var retourFocus = null;
  var detailId = "";
  var correction = false;

  function focusables(el) {
    return Array.prototype.slice.call(el.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(function (x) { return !x.hidden && x.offsetParent !== null; });
  }
  function ouvrir(ov, focusSur) {
    retourFocus = document.activeElement;
    ov.hidden = false;
    ouverte = ov;
    document.body.style.overflow = "hidden";
    var cible = focusSur || focusables(ov)[0];
    if (cible) cible.focus();
  }
  function fermer() {
    if (!ouverte) return;
    ouverte.hidden = true;
    ouverte = null;
    document.body.style.overflow = "";
    if (retourFocus && retourFocus.focus && document.body.contains(retourFocus)) retourFocus.focus();
    retourFocus = null;
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $("ann-toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 4200);
  }

  /* ---------- Détail d'une annonce ---------- */
  var ETAPES = ["Demande", "Paiement du client", "Envoi au journal", "Acceptation", "Parution", "Attestation"];
  function etapesDe(r) {
    var dates = [r.dem, r.pay, r.env, r.acc, r.par, r.att];
    var fait = 0, now = -1, err = -1;
    switch (r.etat) {
      case "confirmer": now = 0; break;
      case "attente": fait = 1; now = 1; break;
      case "envoi": fait = 2; now = 2; break;
      case "acceptee": case "prevue": fait = 4; now = 4; break;
      case "verif": fait = 5; now = 5; break;
      case "publiee": fait = 6; break;
      case "refusee": fait = 3; err = 3; break;
      case "annulee": fait = 2; break;
    }
    return ETAPES.map(function (lib, i) {
      var st = i < fait ? "done" : i === err ? "err" : i === now ? "now" : "todo";
      var sub = "";
      if (st === "done") sub = fmtDate(dates[i]);
      else if (st === "err") sub = "Refusée le " + fmtDate(r.refus);
      else if (st === "now") {
        sub = ["À confirmer", "En attente", "En cours", "En attente", "Prévue le " + fmtDate(r.par), "En vérification"][i];
        if (i === 4 && r.etat === "verif") sub = "";
      } else if (r.etat === "annulee" && i === fait) sub = "Annulée le " + fmtDate(r.annul);
      if (r.etat === "verif" && i === 4) { st = "done"; sub = fmtDate(r.par); }
      return { lib: lib, st: st, sub: sub };
    });
  }
  function friseHtml(r) {
    return '<ol class="ann-frise" aria-label="Étapes de l’annonce">' + etapesDe(r).map(function (e) {
      var ico = e.st === "done" ? "check" : e.st === "err" ? "close" : e.st === "now" ? "hourglass" : "dot";
      return '<li class="ann-et is-' + e.st + '"><span class="ann-et-ico"><span class="ms">' + ico + '</span></span><span class="ann-et-lib">' + e.lib + "</span>" +
        '<span class="ann-et-sub">' + esc(e.sub) + (e.st === "done" ? '<span class="sr-only"> : terminée</span>' : "") + "</span></li>";
    }).join("") + "</ol>";
  }
  function lienEtat(r) {
    if (r.etat === "confirmer") return "Sera créé à la confirmation de l’annonce.";
    if (r.etat === "attente") return "Actif, envoyé à " + r.mail + " le " + fmtDate(r.dem) + (r.relance ? ", relancé le " + fmtDate(r.relance) : "") + ".";
    if (r.etat === "annulee") return "Fermé. Le client a été remboursé le " + fmtDate(r.annul) + ".";
    return "Payé le " + fmtDate(r.pay) + ".";
  }
  function preuveHtml(r) {
    if (r.etat === "publiee") {
      var lien = r.sup === "papier"
        ? '<a class="link" href="#" data-fictif="preuve">Voir le justificatif de parution (PDF)</a>'
        : '<a class="link" href="#" data-fictif="preuve">Voir la parution en ligne</a>';
      return '<div class="ann-sec"><div class="overline">Preuve de parution</div><p class="small">' + lien + '</p>' +
        '<div class="ann-btns"><button type="button" class="btn btn-primary btn-sm" data-act="attestation" data-id="' + esc(r.id) + '"><span class="ms">file_download</span>Télécharger l’attestation</button></div></div>';
    }
    if (r.etat === "verif") {
      return '<div class="ann-sec"><div class="overline">Preuve de parution</div><p class="small">Le journal a déposé sa preuve le ' + fmtDate(r.par) + '. LejAL la vérifie ; l’attestation sera disponible ensuite.</p></div>';
    }
    return "";
  }
  function detailHtml(r) {
    var e = ETATS[r.etat], ap = apport(r);
    var dossier = SOC[r.soc][0] === "En formation" ? "Société en formation" : "SIREN " + SOC[r.soc][0];
    var h = '<div class="ann-d-head"><div><div class="ann-d-soc">' + esc(r.soc) + ' <span class="ann-sub">' + esc(dossier) + '</span></div>' +
      '<div class="muted small">' + esc(r.op) + " · " + esc(r.id) + (r.ref ? " · Formalité " + esc(r.ref) : "") + "</div></div>" +
      '<span class="badge ' + e.cls + '">' + esc(e.lib) + "</span></div>";
    h += friseHtml(r);
    if (r.etat === "refusee") {
      h += '<div class="alert alert-error" role="alert"><span class="ms">error</span><div><strong>Refusée par le journal le ' + fmtDate(r.refus) + ".</strong> Motif : " + esc(r.motif) + "</div></div><div style=\"height:16px\"></div>";
    }
    if (r.etat === "annulee") {
      h += '<div class="alert alert-info"><span class="ms">info</span><div>Annonce annulée le ' + fmtDate(r.annul) + " à la demande du client. Le paiement a été remboursé et aucun apport d’affaires n’est dû.</div></div><div style=\"height:16px\"></div>";
    }
    /* Texte */
    if (correction && r.etat === "refusee") {
      h += '<div class="ann-sec ann-corr"><label class="overline" for="ann-corr-texte">Texte de l’annonce, à corriger</label>' +
        '<textarea class="form-input" id="ann-corr-texte" rows="8">' + esc(texteDe(r)) + "</textarea>" +
        '<div class="ann-btns"><button type="button" class="btn btn-primary btn-sm" data-act="renvoyer" data-id="' + esc(r.id) + '"><span class="ms">send</span>Renvoyer au journal</button>' +
        '<button type="button" class="btn btn-tertiary btn-sm" data-act="annuler-corr">Annuler la correction</button></div></div>';
    } else {
      h += '<div class="ann-sec"><div class="overline">Texte de l’annonce</div><div class="ann-text">' + esc(texteDe(r)) + "</div>" +
        (r.etat === "refusee" ? '<div class="ann-btns"><button type="button" class="btn btn-primary btn-sm" data-act="corriger-texte"><span class="ms">edit</span>Corriger le texte</button></div>' : "") + "</div>";
    }
    /* Prix et apport */
    h += '<div class="ann-grid2"><div class="ann-box"><div class="overline">Prix</div><dl class="ann-kv">' +
      "<dt>Prix HT</dt><dd>" + eur(r.ht) + "</dd><dt>TVA 20" + NBSP + "%</dt><dd>" + eur(tva(r.ht)) + "</dd><dt class=\"tot\">Prix TTC</dt><dd class=\"tot\">" + eur(ttc(r.ht)) + "</dd></dl></div>" +
      '<div class="ann-box"><div class="overline">Apport d’affaires du cabinet</div><dl class="ann-kv">' +
      "<dt>" + (r.htInitial ? "Montant viré (25" + NBSP + "% de " + eur(r.htInitial) + ")" : "Montant (25" + NBSP + "% du HT)") + "</dt><dd>" + eur(ap.m) + "</dd></dl><p class=\"ann-note\">" + esc(ap.lib) + ".</p>" +
      (r.note ? '<p class="ann-note">' + esc(r.note) + "</p>" : "") + "</div></div>";
    /* Lien de paiement et journal */
    var lienBloc = '<div class="ann-box"><div class="overline">Lien de paiement</div>';
    if (r.lien && r.etat !== "annulee") lienBloc += '<span class="ann-link-url">' + esc(lienPaiement(r)) + "</span>";
    lienBloc += '<p class="small">' + esc(lienEtat(r)) + "</p>";
    if (r.etat === "attente") {
      lienBloc += '<div class="ann-btns"><button type="button" class="btn btn-secondary btn-sm" data-act="copier" data-id="' + esc(r.id) + '"><span class="ms">copy</span>Copier le lien de paiement</button>' +
        '<button type="button" class="btn btn-secondary btn-sm" data-act="relancer" data-id="' + esc(r.id) + '"><span class="ms">refresh-cw</span>Relancer le client</button></div>';
    }
    if (r.etat === "confirmer") {
      lienBloc += '<div class="ann-btns"><button type="button" class="btn btn-primary btn-sm" data-act="confirmer" data-id="' + esc(r.id) + '"><span class="ms">send</span>Confirmer l’annonce</button></div>';
    }
    lienBloc += "</div>";
    var jBloc = '<div class="ann-box"><div class="overline">Journal</div>';
    if (!r.j || (!r.pay && r.etat !== "annulee")) {
      jBloc += '<p class="small">Attribué après le paiement du client, selon le département (' + esc(r.dep) + " " + esc(DEPTS[r.dep]) + ").</p>" +
        '<dl class="ann-kv ann-kv-left"><dt>Parution</dt><dd>souhaitée le ' + fmtDate(r.par) + "</dd></dl>";
    } else {
      jBloc += '<dl class="ann-kv ann-kv-left"><dt>Nom</dt><dd>' + esc(r.j) + "</dd><dt>Support</dt><dd>" + esc(r.sup) + "</dd><dt>Département</dt><dd>" + esc(r.dep) + " " + esc(DEPTS[r.dep]) +
        "</dd><dt>Date</dt><dd>" + (r.etat === "publiee" || r.etat === "verif" ? "parue le " : r.etat === "annulee" ? "annulée, prévue le " : "prévue le ") + fmtDate(r.par) + "</dd></dl>";
    }
    jBloc += "</div>";
    h += '<div class="ann-grid2">' + lienBloc + jBloc + "</div>";
    h += preuveHtml(r);
    return h;
  }
  function ouvrirDetail(id, modeCorrection) {
    var r = trouver(id);
    if (!r) return;
    detailId = id;
    correction = !!modeCorrection && r.etat === "refusee";
    dessinerDetail();
    if (ouverte !== $("ann-detail")) ouvrir($("ann-detail"), $("ann-d-close"));
    if (correction) { var t = $("ann-corr-texte"); if (t) t.focus(); }
  }
  function dessinerDetail() {
    var r = trouver(detailId);
    if (!r) return;
    $("ann-d-body").innerHTML = detailHtml(r);
  }

  /* ---------- Actions ---------- */
  function actionSur(act, id) {
    var r = trouver(id || detailId);
    if (act === "annuler-corr") { correction = false; dessinerDetail(); return; }
    if (act === "corriger-texte") { correction = true; dessinerDetail(); var t = $("ann-corr-texte"); if (t) t.focus(); return; }
    if (!r) return;
    if (act === "voir") { ouvrirDetail(r.id); return; }
    if (act === "corriger") { ouvrirDetail(r.id, true); return; }
    if (act === "copier") {
      var url = lienPaiement(r);
      try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url); } catch (e) {}
      toast("Lien de paiement copié (simulation).");
      return;
    }
    if (act === "relancer") {
      r.relance = TODAY;
      toast("Relance envoyée à " + r.mail + " (simulation, rien n’est envoyé).");
    } else if (act === "confirmer") {
      r.etat = "attente";
      r.lien = r.lien || "p/" + r.id.slice(-4) + "Zq";
      toast("Lien de paiement envoyé à " + r.mail + " (simulation, rien n’est envoyé).");
    } else if (act === "attestation") {
      toast("Attestation de parution téléchargée : " + r.soc + " (simulation).");
      return;
    } else if (act === "renvoyer") {
      var champ = $("ann-corr-texte");
      if (champ && champ.value.replace(/\s/g, "")) r.texte = champ.value;
      r.etat = "envoi";
      r.env = TODAY;
      r.refus = "";
      correction = false;
      toast("Texte corrigé, renvoyé au journal (simulation).");
    }
    renderSuivi();
    renderApport();
    if (ouverte === $("ann-detail")) {
      dessinerDetail();
      $("ann-d-close").focus();
    } else if (id) {
      var cible = document.querySelector('tr[data-id="' + id + '"] [data-act], tr[data-id="' + id + '"] .ann-open');
      if (cible) cible.focus();
    }
  }

  /* ---------- Publier une annonce ---------- */
  var wz = { step: 1, texteCle: "", texteModifie: false };
  function remplirListes() {
    var noms = Object.keys(SOC).sort(function (a, b) { return a.localeCompare(b, "fr"); });
    $("ann-wz-soc").innerHTML = '<option value="">Choisir une société</option>' + noms.map(function (n) {
      return '<option value="' + esc(n) + '">' + esc(n) + (SOC[n][0] === "En formation" ? " (en formation)" : "") + "</option>";
    }).join("");
    $("ann-wz-op").innerHTML = '<option value="">Choisir une opération</option>' + OPERATIONS.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + "</option>"; }).join("");
    $("ann-wz-dep").innerHTML = '<option value="">Choisir un département</option>' + Object.keys(DEPTS).map(function (d) { return '<option value="' + d + '">' + d + " " + DEPTS[d] + "</option>"; }).join("");
    $("ann-f-etat").innerHTML = '<option value="">Tous les états</option>' + ORDRE_ETATS.map(function (k) { return '<option value="' + k + '">' + esc(ETATS[k].lib) + "</option>"; }).join("");
  }
  function prixWz(op, dep) {
    var p = (PRIX_OP[op] || 109) + (SUPP_DEPT[dep] || 0);
    return Math.max(109, Math.min(199, p));
  }
  function wzValeurs() {
    return { soc: $("ann-wz-soc").value, op: $("ann-wz-op").value, dep: $("ann-wz-dep").value, date: $("ann-wz-date").value, texte: $("ann-wz-texte").value, mail: $("ann-wz-mail").value.replace(/^\s+|\s+$/g, "") };
  }
  function wzMontrer() {
    var etapes = $("ann-steps").children;
    for (var i = 0; i < etapes.length; i++) {
      etapes[i].className = i + 1 < wz.step ? "is-done" : i + 1 === wz.step ? "is-now" : "";
      if (i + 1 === wz.step) etapes[i].setAttribute("aria-current", "step"); else etapes[i].removeAttribute("aria-current");
    }
    for (var s = 1; s <= 3; s++) $("ann-wz-p" + s).hidden = s !== wz.step;
    $("ann-wz-prec").hidden = wz.step === 1;
    $("ann-wz-suiv").hidden = wz.step === 3;
    $("ann-wz-ok").hidden = wz.step !== 3;
    $("ann-wz-err").textContent = "";
  }
  function wzRecap() {
    var v = wzValeurs();
    var ht = prixWz(v.op, v.dep);
    $("ann-wz-recap").innerHTML =
      '<dl class="ann-kv ann-kv-left"><dt>Société</dt><dd>' + esc(v.soc) + "</dd><dt>Opération</dt><dd>" + esc(v.op) + "</dd><dt>Département</dt><dd>" + esc(v.dep) + " " + esc(DEPTS[v.dep] || "") +
      "</dd><dt>Parution</dt><dd>souhaitée le " + fmtDate(v.date) + "</dd><dt>Journal</dt><dd>Attribué par LejAL après le paiement du client</dd></dl>" +
      '<div class="ann-grid2" style="margin-top:14px"><div class="ann-box"><div class="overline">Prix</div><dl class="ann-kv"><dt>Prix HT</dt><dd>' + eur(ht) + "</dd><dt>TVA 20" + NBSP + "%</dt><dd>" + eur(tva(ht)) +
      '</dd><dt class="tot">Prix TTC</dt><dd class="tot">' + eur(ttc(ht)) + '</dd></dl></div><div class="ann-box"><div class="overline">Apport d’affaires du cabinet</div><dl class="ann-kv"><dt>Montant (25' + NBSP + '% du HT)</dt><dd>' + eur(apportDe(ht)) +
      '</dd></dl><p class="ann-note">Acquis à la parution. Le cabinet ne règle rien.</p></div></div>';
  }
  function wzSuivant() {
    var v = wzValeurs(), err = $("ann-wz-err");
    if (wz.step === 1) {
      if (!v.soc || !v.op || !v.dep || !v.date) { err.textContent = "Renseignez la société, l’opération, le département et la date de parution souhaitée."; return; }
      if (v.date < addDays(TODAY, 1)) { err.textContent = "La date de parution souhaitée doit être postérieure au " + fmtDate(TODAY) + "."; return; }
      var cle = v.soc + "|" + v.op + "|" + v.date;
      if (!wz.texteModifie || wz.texteCle !== cle) {
        if (!wz.texteModifie) $("ann-wz-texte").value = texteAnnonce(v.soc, v.op, addDays(TODAY, -2), v.dep);
        wz.texteCle = cle;
      }
      wz.step = 2;
    } else if (wz.step === 2) {
      if (v.texte.replace(/\s/g, "").length < 40) { err.textContent = "Le texte de l’annonce est trop court."; return; }
      wzRecap();
      wz.step = 3;
    }
    wzMontrer();
    var cible = wz.step === 2 ? $("ann-wz-texte") : $("ann-wz-mail");
    if (cible) cible.focus();
  }
  function wzPrecedent() {
    if (wz.step > 1) wz.step -= 1;
    wzMontrer();
  }
  function wzPublier() {
    var v = wzValeurs(), err = $("ann-wz-err");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.mail)) { err.textContent = "Saisissez une adresse e-mail valide pour le client."; $("ann-wz-mail").focus(); return; }
    dernierId += 1;
    var r = {
      id: "AL-2026-0" + dernierId, soc: v.soc, op: v.op, etat: "attente", ht: prixWz(v.op, v.dep), dem: TODAY, par: v.date,
      mail: v.mail, lien: "p/Nw" + dernierId, texte: v.texte, dep: v.dep, neuf: true
    };
    ANNONCES.unshift(r);
    state.q = ""; state.etat = ""; state.groupe = ""; state.periode = "";
    $("ann-f-q").value = ""; $("ann-f-etat").value = ""; $("ann-f-periode").value = "";
    fermer();
    changerOnglet("suivi", false);
    renderSuivi();
    toast("Annonce ajoutée, lien de paiement envoyé à " + v.mail + " (simulation, rien n’est envoyé).");
    var ligneNeuve = document.querySelector('tr[data-id="' + r.id + '"] .ann-open');
    if (ligneNeuve) ligneNeuve.focus();
  }
  function wzOuvrir() {
    wz = { step: 1, texteCle: "", texteModifie: false };
    $("ann-wz-soc").value = ""; $("ann-wz-op").value = ""; $("ann-wz-dep").value = "";
    $("ann-wz-date").value = "2026-12-03"; $("ann-wz-date").min = addDays(TODAY, 1);
    $("ann-wz-texte").value = ""; $("ann-wz-mail").value = "";
    wzMontrer();
    ouvrir($("ann-wz"), $("ann-wz-soc"));
  }

  /* ---------- Onglets ---------- */
  var ONGLETS = ["suivi", "attestations", "apport"];
  function changerOnglet(nom, focus) {
    state.tab = nom;
    ONGLETS.forEach(function (o) {
      var b = $("ann-tab-" + o), p = $("ann-p-" + o);
      var on = o === nom;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
      p.hidden = !on;
    });
    $("ann-stats").hidden = nom !== "suivi";
    if (focus) $("ann-tab-" + nom).focus();
  }

  /* ---------- Branchements ---------- */
  function init() {
    remplirListes();
    renderSuivi();
    renderAttestations();
    renderApport();
    changerOnglet("suivi", false);

    /* Onglets */
    ONGLETS.forEach(function (o) {
      $("ann-tab-" + o).addEventListener("click", function () { changerOnglet(o, false); });
    });
    $("ann-tablist").addEventListener("keydown", function (e) {
      var i = ONGLETS.indexOf(state.tab), n = -1;
      if (e.key === "ArrowRight") n = (i + 1) % ONGLETS.length;
      else if (e.key === "ArrowLeft") n = (i + ONGLETS.length - 1) % ONGLETS.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = ONGLETS.length - 1;
      if (n >= 0) { e.preventDefault(); changerOnglet(ONGLETS[n], true); }
    });

    /* Compteurs */
    $("ann-stats").addEventListener("click", function (e) {
      var b = e.target.closest("[data-g]");
      if (!b) return;
      var g = b.getAttribute("data-g");
      state.groupe = state.groupe === g ? "" : g;
      state.etat = ""; $("ann-f-etat").value = "";
      renderSuivi();
      var nouveau = document.querySelector('.ann-stat[data-g="' + g + '"]');
      if (nouveau) nouveau.focus();
    });

    /* Filtres du suivi */
    $("ann-f-q").addEventListener("input", function (e) { state.q = e.target.value; renderSuivi(); });
    $("ann-f-etat").addEventListener("change", function (e) { state.etat = e.target.value; state.groupe = ""; renderSuivi(); });
    $("ann-f-periode").addEventListener("change", function (e) { state.periode = e.target.value; renderSuivi(); });
    $("ann-reset").addEventListener("click", function () {
      state.q = ""; state.etat = ""; state.groupe = ""; state.periode = "";
      $("ann-f-q").value = ""; $("ann-f-etat").value = ""; $("ann-f-periode").value = "";
      renderSuivi();
    });

    /* Tableau de suivi : bouton d'action, lien de formalité, sinon ouverture du détail */
    $("ann-rows").addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (b) { actionSur(b.getAttribute("data-act"), b.getAttribute("data-id")); return; }
      if (e.target.closest("a")) return;
      var tr = e.target.closest("tr[data-id]");
      if (tr) ouvrirDetail(tr.getAttribute("data-id"));
    });

    /* Attestations */
    $("ann-att-q").addEventListener("input", function (e) { state.qAtt = e.target.value; renderAttestations(); });
    $("ann-att-an").addEventListener("change", function (e) { state.anAtt = e.target.value; renderAttestations(); });
    $("ann-att-rows").addEventListener("click", function (e) {
      var b = e.target.closest("[data-att]");
      if (b) toast("Attestation de parution téléchargée : " + b.getAttribute("data-soc") + " (simulation).");
    });

    /* Versement */
    $("ann-vers-modif").addEventListener("click", function () {
      $("ann-vers-edit").hidden = false;
      $("ann-vers-modif").hidden = true;
      $("ann-vers-sel").value = state.frequence;
      $("ann-vers-sel").focus();
    });
    $("ann-vers-save").addEventListener("click", function () {
      state.frequence = $("ann-vers-sel").value;
      $("ann-vers-edit").hidden = true;
      $("ann-vers-modif").hidden = false;
      renderApport();
      $("ann-vers-modif").focus();
      toast("Fréquence de versement modifiée (simulation). Elle s’applique après le virement du " + fmtDate(PROCHAIN) + ".");
    });
    $("ann-vers-cancel").addEventListener("click", function () {
      $("ann-vers-edit").hidden = true;
      $("ann-vers-modif").hidden = false;
      $("ann-vers-modif").focus();
    });

    /* Fenêtres */
    $("ann-publier").addEventListener("click", wzOuvrir);
    $("ann-detail").addEventListener("click", function (e) {
      if (e.target === $("ann-detail") || e.target.closest("[data-close]")) { fermer(); return; }
      var b = e.target.closest("[data-act]");
      if (b) { e.preventDefault(); actionSur(b.getAttribute("data-act"), b.getAttribute("data-id")); return; }
      var f = e.target.closest("[data-fictif]");
      if (f) { e.preventDefault(); toast("Lien fictif : la maquette n’ouvre aucune parution."); }
    });
    $("ann-wz").addEventListener("click", function (e) {
      if (e.target === $("ann-wz") || e.target.closest("[data-close]")) fermer();
    });
    $("ann-wz-suiv").addEventListener("click", wzSuivant);
    $("ann-wz-prec").addEventListener("click", wzPrecedent);
    $("ann-wz-ok").addEventListener("click", wzPublier);
    $("ann-wz-texte").addEventListener("input", function () { wz.texteModifie = true; });
    ["ann-wz-soc", "ann-wz-op", "ann-wz-date"].forEach(function (id) {
      $(id).addEventListener("change", function () { wz.texteModifie = false; });
    });
    $("ann-wz-form").addEventListener("submit", function (e) {
      e.preventDefault();
      if (wz.step < 3) wzSuivant(); else wzPublier();
    });

    /* Clavier : Échap ferme, Tab reste dans la fenêtre */
    document.addEventListener("keydown", function (e) {
      if (!ouverte) return;
      if (e.key === "Escape") { e.preventDefault(); fermer(); return; }
      if (e.key !== "Tab") return;
      var liste = focusables(ouverte);
      if (!liste.length) return;
      var premier = liste[0], dernier = liste[liste.length - 1];
      if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
      else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
    });

    /* Adresse : ?annonce=AL-2026-0165 ouvre le détail, ?tab=apport|attestations choisit l'onglet */
    var params = null;
    try { params = new URLSearchParams(window.location.search); } catch (e) {}
    if (params) {
      var t = params.get("tab");
      if (t && ONGLETS.indexOf(t) !== -1) changerOnglet(t, false);
      var a = params.get("annonce");
      if (a && trouver(a)) ouvrirDetail(a);
    }
  }

  window.EJ_ANNONCES = { annonces: ANNONCES, trouver: trouver, apport: apport, lignesApport: lignesApport, totauxApport: totauxApport, texteAnnonce: texteAnnonce, ETATS: ETATS, fmtDate: fmtDate, eur: eur };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
