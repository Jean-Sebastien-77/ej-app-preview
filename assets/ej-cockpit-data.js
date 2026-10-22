/* Express Juridique · Lifting 2026 · Cockpit en canevas de tableaux
   Données fictives et calculs du cockpit, séparés du rendu (cockpit.html).
   Cabinet de démonstration : CABINET DELMAS EXPERTISE. Date de référence : 19/10/2026.
   Principe : l'IA compose avec ce catalogue fermé d'indicateurs certifiés ; EJ calcule ici.
   Chaque indicateur déclare sa règle, sa source, sa couverture et les filtres qu'il accepte.
   Aucune série sans donnée source : pas de chiffre d'affaires, pas d'activité par collaborateur,
   pas de durée de traitement. Toutes les données sont fictives.
   Dépend de ej-missions-data.js (window.EJM), chargé avant. Expose window.EJC. */
(function () {
  "use strict";
  var E = window.EJM;

  /* ---------- Repères de temps ---------- */
  var TODAY = new Date(2026, 9, 19);
  var CALC = "19/10/2026 à 07:00";
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var MOIS_C = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function fmt(d) {
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();
  }
  function parse(s) {
    var p = s.split("/");
    return new Date(+p[2], +p[1] - 1, +p[0]);
  }
  function addMonths(d, n) {
    return new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
  }
  function mi(d) {
    return d.getFullYear() * 12 + d.getMonth();
  }
  var CUR = mi(TODAY);
  function month(idx) {
    var y = Math.floor(idx / 12);
    var m = idx - y * 12;
    return { idx: idx, y: y, m: m, label: MOIS_C[m] + " " + String(y).slice(2), long: MOIS[m] + " " + y, from: new Date(y, m, 1), to: new Date(y, m + 1, 0) };
  }
  /* Fenêtre de n mois : vers l'arrière (mois en cours inclus) ou vers l'avant (à partir du mois en cours) */
  function back(n) {
    var out = [];
    for (var i = n - 1; i >= 0; i--) out.push(month(CUR - i));
    return out;
  }
  function fwd(n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(month(CUR + i));
    return out;
  }
  function nf(n) {
    return Math.round(n).toLocaleString("fr-FR").replace(/[\s ]/g, " ");
  }
  function pl(n, one, many) {
    return n > 1 ? many : one;
  }
  function sum(a) {
    return a.reduce(function (x, y) {
      return x + y;
    }, 0);
  }

  /* ---------- Portefeuille : 135 sociétés (mêmes données que la maquette « listes » archivée) ----------
     nom | forme | clôture (jj/mm, DPJ) | étape d'approbation | drapeaux | date de décision de l'AGOA
     Étapes : prep (à préparer), gen (documents générés), sig (en signature), dep (à déposer), ok (déposé)
     Drapeaux : f = formulaire AGOA commencé, c = en cours de création, p = approuvée en 2025 sans approbation en 2026,
     n = entrée au cabinet après l'échéance (exercice de la campagne non suivi) */
  var FORMES = ["SAS", "SARL", "SA", "SELARL", "SCI", "SCP", "SCCV"];
  var CIVILES = ["SCI", "SCP", "SCCV"];
  var NAMED = [
    "LES JARDINS D'ORIANE|SAS|31/12|dep||26/06/2026",
    "ALTITUDE CONSEIL|SARL|31/12|ok",
    "SAS NOVALYS AÉRO|SAS|31/12|prep|f",
    "27 BELLEVUE|SCI|31/12|prep|f",
    "NOVA STUDIO DÉMO|SAS|||c",
    "SCP MÉDICALE DES TILLEULS DÉMO|SCP|||c",
    "SCCV LES ATELIERS DÉMO|SCCV|||c",
    "SCI LES TERRASSES DÉMO|SCI|||c",
    "MERCIER & ASSOCIES|SELARL|30/06|dep||10/09/2026",
    "JULIEN MARCHAL FORMATIONS|SARL|31/12|ok",
    "AXIOME|SARL|31/12|gen||22/06/2026",
    "PAPRIKA CANTINE|SAS|30/06|gen||05/08/2026",
    "HELIOS SAS|SAS|30/06|prep",
    "URBAN FIT CLUB|SAS|31/08|ok",
    "LUMEN|SAS|31/12|prep|f",
    "TB ELECTRICITE|SARL|31/12|ok",
    "NEOLAB.|SAS|31/12||n",
    "ODALIS|SARL|31/12|ok",
    "CAP ESTEREL|SCI|31/12|ok",
    "SOUFFLE ET HARMONIE|SARL|31/12|prep|f",
    "SOURIRE DENTAIRE|SELARL|31/12|ok",
    "SELARL VASSEUR|SELARL|||c",
    "KPL3D|SAS|30/09|gen",
    "CABINET DE LORME|SARL|31/12|gen",
    "ORVEA|SAS|31/12|gen||29/06/2026",
    "MBCOMPTA|SARL|30/09|dep",
    "GROUPE BMR|SA|31/12|prep|f",
    "SOTRAB|SAS|31/03|prep|f",
    "CHAUFFAGE DU LIMOUSIN|SARL|31/12|ok",
    "HLMT CONSULTING|SARL|31/12|prep|f",
    "BOTANICA|SAS|31/03|ok",
    "MARALUNA|SAS|31/12|ok",
    "ESTERIA|SAS|31/12|ok",
    "AZUR HOLDING|SAS|31/12|ok",
    "KALIPSO SARL|SARL|31/12||n",
    "IMMO +|SCI|||p",
    "LOGIVIA|SAS|31/12|ok",
    "VILLA SERENA|SCI|||p",
    "PL CONSEILS|SARL|31/12|ok",
    "A.R.T.E|SAS|31/12|gen",
    "CL OPTIC|SARL|31/12|sig||12/09/2026",
    "SELARL MV|SELARL|31/12|ok",
  ];
  var GENERIC = (
    "ATELIER BERTIN|BOULANGERIE DU MARCHÉ|GARAGE DUVAL|PHARMACIE DES ARCADES|TRANSPORTS LEMAIRE|SCI DU PARC|MAISON CAILLAUD|OPTIQUE MARTIN|" +
    "CLINIQUE VÉTÉRINAIRE DU LAC|BATIGEST|ELEC SERVICES|NOVATERRA|LES VERGERS DE SAINT CLAIR|HORIZON PATRIMOINE|SCI LES CHÊNES|CAFÉ DES SPORTS|" +
    "AGENCE PIXELIA|CABINET FOURNIER|SELARL DR ROCHE|ARTISANS DU BOIS|MENUISERIE GAUTHIER|SAVEURS D'ASIE|ÉCOLE DE CONDUITE PRIMA|DOMAINE DES CRÊTES|" +
    "FROMAGERIE BLANC|LOGISTIQUE OUEST|SCI MONTPLAISIR|KINÉ SANTÉ PLUS|IMPRIMERIE MODERNE|ALPHA SÉCURITÉ|BIO ET CO|CRÉATIONS LÉA|" +
    "TECHNIFROID|SCI LA FONTAINE|GROUPE ARMAND|HÔTEL DU PORT|PRESTIGE AUTO|VERDI PAYSAGE|LES DÉLICES DE MARIE|CONSEIL ET STRATÉGIE|" +
    "MEDIALINK|SCI DES TILLEULS|ATLAS INGÉNIERIE|FLEURS DE SAISON|DATAVERSE|SCI BEAUSOLEIL|PLOMBERIE RIVIÈRE|MARINE ÉQUIPEMENT|" +
    "OSTÉO DU CENTRE|CHARPENTES DUBOIS|STUDIO NOMADE|SCI LE CLOS|GAMMA FINANCE|PRIMEURS DU SUD|RÉSIDENCE LES PINS|NETTOYAGE PRO|" +
    "SELARL AVOCATS LEROY|TERRA BÂTIMENT|SCI HAUTEVILLE|BRASSERIE DU NORD|ÉQUILIBRE COACHING|AUTO ÉCOLE DU CENTRE|ORTHOPTIE MARCEAU|CAVE DES VIGNERONS|" +
    "SCI ROSERAIE|LUMIÈRE ET DÉCO|AEROTECH SERVICES|TABAC DE LA GARE|SCI VAL FLEURI|IMMOGEST|VÉLO PASSION|PÂTISSERIE AUGUSTIN|" +
    "SCI BELLEVUE DEUX|RESTAURANT LE GALION|MANUFACTURE DE L'EST|SCI CAP SUD|ÉNERGIES NOUVELLES|SERVICES À DOMICILE AMI|SCI DES ACACIAS|DIGITAL FACTORY|" +
    "EXPERTISE BÂTIMENT|SCI DU MOULIN|GARDEN CENTER VERT|AMBULANCES SECOURS|SCI LES OLIVIERS|TRAITEUR GOURMET|ACADÉMIE DE DANSE|SCI MARIGNAN|" +
    "CLIMATISATION DU SUD|MAROQUINERIE ÉLISE|SCI DES BRUYÈRES|AGRI SERVICES|LIBRAIRIE DES QUAIS"
  ).split("|");

  var SOC = [];
  var BYNAME = {};
  function addSoc(s) {
    s.civ = CIVILES.indexOf(s.f) !== -1;
    if (s.cl) {
      var p = s.cl.split("/");
      s.clDay = +p[0];
      s.clMonth = +p[1] - 1;
      var y = s.clMonth >= 6 ? 2025 : 2026; /* exercice de la campagne : clos entre le 01/07/2025 et le 30/06/2026 */
      s.clos = new Date(y, s.clMonth, s.clDay);
      s.dl = new Date(y, s.clMonth + 7, 0); /* échéance de l'AG : six mois après la clôture, fin de mois */
    }
    s.camp = !!s.cl && !s.crea && !s.civ && !s.nouv;
    SOC.push(s);
    BYNAME[s.n] = s;
  }
  NAMED.forEach(function (l) {
    var p = l.split("|");
    var fl = p[4] || "";
    addSoc({ n: p[0], f: p[1], cl: p[2] || null, st: p[3] || null, fe: fl.indexOf("f") !== -1, crea: fl.indexOf("c") !== -1, prev: fl.indexOf("p") !== -1, nouv: fl.indexOf("n") !== -1, decS: p[5] || null });
  });
  var SCHED = [
    ["30/06", "prep"], ["30/06", "prep"], ["30/06", "gen"], ["30/06", "ok"], ["31/05", "prep"], ["31/05", "gen", "05/10/2026"], ["30/04", "ok", "28/08/2026"], ["30/04", "ok"],
    ["31/03", "ok"], ["31/03", "ok"], ["31/03", "ok"], ["30/09", "ok"], ["30/09", "ok"], ["30/09", "ok"], ["30/09", "ok"], ["31/08", "ok"], ["31/08", "ok"],
  ];
  (function () {
    var nNull = 0, nPrev = 0, k = 0;
    GENERIC.forEach(function (n, i) {
      var f = /^SCI /.test(n) ? "SCI" : /^SELARL /.test(n) ? "SELARL" : i % 11 === 10 ? "SA" : i % 2 ? "SARL" : "SAS";
      var s = { n: n, f: f, cl: null, st: null, fe: false, crea: false, prev: false, nouv: false, decS: null };
      if (i % 6 === 2 && nNull < 16) {
        nNull++;
        if (nPrev < 4) {
          s.prev = true;
          nPrev++;
        }
      } else {
        var sc = SCHED[k++] || ["31/12", "ok"];
        s.cl = sc[0];
        s.st = sc[1];
        s.decS = sc[2] || null;
      }
      addSoc(s);
    });
  })();
  var TOTAL = SOC.length; /* 135 */

  /* Date d'ajout au cabinet dans Express Juridique (existe : fiche société).
     Import initial le 03/10/2024 ; 27 ajouts de novembre 2024 à octobre 2025 ; 12 sur les douze derniers mois. */
  var RECENT = {
    "DIGITAL FACTORY": "08/12/2025", "STUDIO NOMADE": "19/01/2026", DATAVERSE: "10/03/2026", "ÉNERGIES NOUVELLES": "14/04/2026",
    ORVEA: "02/09/2026", "SELARL VASSEUR": "15/09/2026", "KALIPSO SARL": "25/09/2026", "NOVA STUDIO DÉMO": "01/10/2026",
    "SCP MÉDICALE DES TILLEULS DÉMO": "02/10/2026", "SCCV LES ATELIERS DÉMO": "02/10/2026", "SCI LES TERRASSES DÉMO": "05/10/2026", "NEOLAB.": "08/10/2026",
  };
  (function () {
    var j = 0;
    SOC.forEach(function (s, i) {
      if (RECENT[s.n]) s.ajout = parse(RECENT[s.n]);
      else if (i >= NAMED.length && (i - NAMED.length) % 3 === 1 && j < 27) {
        /* N-1 : de novembre 2024 à octobre 2025 */
        s.ajout = new Date(2024, 10 + (j % 12), 4 + ((j * 7) % 20));
        j++;
      } else s.ajout = new Date(2024, 9, 3);
    });
  })();

  /* Société fictive EJM (lettres de mission, LAB) du même nom */
  var EJM_BY = {};
  E.societes.forEach(function (s) {
    EJM_BY[s.nom] = s;
  });

  /* ---------- Dépôts INPI non terminés (suivi-actions.html) ---------- */
  var DEP = [
    { soc: "ORVEA", ref: "#GC-2026-238", dep: "#2 · Comptes annuels", st: "a_signer", date: "18/09/2026", by: "Olivier Garnier" },
    { soc: "AXIOME", ref: "#GC-2026-246", dep: "#3 · Comptes annuels", st: "a_signer", date: "17/09/2026", by: "Olivier Garnier" },
    { soc: "KPL3D", ref: "#GC-2026-244", dep: "#2 · Comptes annuels", st: "a_signer", date: "16/09/2026", by: "Olivier Garnier" },
    { soc: "CABINET DE LORME", ref: "#GC-2026-241", dep: "#1 · Comptes annuels", st: "a_signer", date: "16/09/2026", by: "Olivier Garnier" },
    { soc: "A.R.T.E", ref: "#GC-2026-069", dep: "#2 · Comptes annuels", st: "a_signer", date: "16/09/2026", by: "Marc Renaud" },
    { soc: "KPL3D", ref: "#GC-2026-244", dep: "#3 · Comptes annuels", st: "sig", date: "18/09/2026", by: "Olivier Garnier" },
    { soc: "AXIOME", ref: "#GC-2026-246", dep: "#2 · Comptes annuels", st: "sig", date: "17/09/2026", by: "Olivier Garnier" },
    { soc: "CL OPTIC", ref: "#GC-2026-143", dep: "#1 · Comptes annuels", st: "sig", date: "16/09/2026", by: "Marc Renaud" },
    { soc: "AXIOME", ref: "#GC-2026-246", dep: "#1 · Comptes annuels", st: "pret", date: "17/09/2026", by: "Olivier Garnier" },
    { soc: "KPL3D", ref: "#GC-2026-244", dep: "#1 · Comptes annuels", st: "pret", date: "16/09/2026", by: "Olivier Garnier" },
    { soc: "ORVEA", ref: "#GC-2026-238", dep: "#1 · Comptes annuels", st: "pret", date: "16/09/2026", by: "Olivier Garnier" },
    { soc: "MBCOMPTA", ref: "#GC-2026-237", dep: "#2 · Comptes annuels", st: "pret", date: "16/09/2026", by: "Olivier Garnier" },
    { soc: "SELARL MV", ref: "#Transfo-2026-141", dep: "#1 · Modification", st: "pret", date: "16/09/2026", by: "Marc Renaud" },
    { soc: "MERCIER & ASSOCIES", ref: "#GC-2026-232", dep: "#1 · Comptes annuels", st: "pret", date: "16/09/2026", by: "Olivier Garnier" },
    { soc: "LES JARDINS D'ORIANE", ref: "#GC-2026-229", dep: "#1 · Comptes annuels", st: "pret", date: "16/09/2026", by: "Olivier Garnier" },
    { soc: "CL OPTIC", ref: "#GC-2026-143", dep: "#2 · Comptes annuels", st: "pret", date: "16/09/2026", by: "Marc Renaud" },
  ];
  var DEP_ST = {
    a_signer: { label: "Documents à signer", action: "Lancer la signature", tone: "attention" },
    sig: { label: "En signature", action: "Suivre la signature", tone: "info" },
    pret: { label: "Prêt à déposer", action: "Déposer au Guichet unique", tone: "primary" },
  };

  /* ---------- Formalités : 164 au total, 20 au statut « Formulaire en cours » ----------
     Date de création (existe), type, statut (deux valeurs : formulaire en cours, documents générés), créé par.
     Les 20 en cours et les formalités citées ailleurs dans la maquette sont écrites à la main ;
     les autres sont générées de façon déterministe pour tenir les totaux mensuels. */
  var FAM = {
    agoa: "Approbation des comptes", capital: "Modification de capital", conv: "Conventions courantes", const: "Constitution",
    cession: "Cession de titres", dir: "Changement de dirigeant", siege: "Transfert de siège", autre: "Autres opérations",
  };
  var TYPES = {
    agoa: ["AGOA et dépôt des comptes", "GC"], capital: ["Modification de capital", "Capital"], conv: ["Conventions courantes", "AC"], const: ["Constitution", "Const"],
    cession: ["Cession et transmission de titres", "Cession"], dir: ["Nomination ou changement de dirigeant", "Dir"], siege: ["Transfert de siège social", "Siege"],
    autre: ["Modification de la personne morale", "PM"],
  };
  var FX = [
    /* 20 au statut « Formulaire en cours » (formalites.html) */
    ["SAS NOVALYS AÉRO", "agoa", "#GC-2026-271", "06/10/2026", "Laura Perrin", 1, null, "AGOA et dépôt des comptes"],
    ["27 BELLEVUE", "agoa", "#GC-2026-270", "06/10/2026", "Laura Perrin", 1, null, "AGOA et dépôt des comptes"],
    ["SCCV LES ATELIERS DÉMO", "const", "#Const-2026-088", "02/10/2026", "Sophie Lambert", 1, "21/10/2026", "Constitution d'une SCIC"],
    ["NOVA STUDIO DÉMO", "const", "#Const-2026-087", "01/10/2026", "Sophie Lambert", 1, "20/10/2026", "Constitution d'une SAS"],
    ["URBAN FIT CLUB", "conv", "#AC-2026-112", "22/09/2026", "Laura Perrin", 1, "", "Conventions courantes"],
    ["HELIOS SAS", "capital", "#Capital-2026-061", "28/09/2026", "Sophie Lambert", 1, "15/10/2026", "Modification de capital"],
    ["LUMEN", "capital", "#Capital-2026-058", "21/09/2026", "Sophie Lambert", 1, "01/10/2026", "Modification de capital"],
    ["CAP ESTEREL", "capital", "#Capital-2026-057", "15/09/2026", "Laura Perrin", 1, null, "Modification de capital"],
    ["NEOLAB.", "capital", "#Capital-2026-055", "10/10/2026", "Laura Perrin", 1, "01/10/2026", "Modification de capital"],
    ["NEOLAB.", "conv", "#AC-2026-104", "10/10/2026", "Laura Perrin", 1, "", "Conventions courantes"],
    ["SOUFFLE ET HARMONIE", "agoa", "#GC-2026-258", "25/03/2026", "Sophie Lambert", 1, "01/04/2026", "AGOA et dépôt des comptes"],
    ["LUMEN", "agoa", "#GC-2026-252", "18/09/2026", "Laura Perrin", 1, "25/09/2026", "AGOA et dépôt des comptes"],
    ["SELARL VASSEUR", "const", "#Const-2026-079", "16/09/2026", "Laura Perrin", 1, "23/09/2026", "Constitution d'une SELARL unipersonnelle"],
    ["KPL3D", "agoa", "#GC-2026-244", "10/12/2025", "Sophie Lambert", 1, "01/01/2026", "AGOA et dépôt des comptes"],
    ["CABINET DE LORME", "agoa", "#GC-2026-241", "20/01/2026", "Sophie Lambert", 1, "04/02/2026", "AGOA et dépôt des comptes"],
    ["MBCOMPTA", "agoa", "#GC-2026-237", "15/12/2025", "Sophie Lambert", 1, "08/01/2026", "AGOA et dépôt des comptes"],
    ["GROUPE BMR", "agoa", "#GC-2026-235", "14/04/2026", "Sophie Lambert", 1, "01/05/2026", "AGOA et dépôt des comptes"],
    ["SOTRAB", "agoa", "#GC-2026-249", "22/06/2026", "Sophie Lambert", 1, "09/07/2026", "AGOA et dépôt des comptes"],
    ["HLMT CONSULTING", "agoa", "#GC-2026-233", "28/04/2026", "Nadia Benali", 1, "14/05/2026", "AGOA et modification de la personne morale"],
    ["CHAUFFAGE DU LIMOUSIN", "cession", "#Cession-2026-019", "26/08/2026", "Laura Perrin", 1, "09/09/2026", "Cession et transmission de titres"],
    /* Documents générés, citées dans formalites.html, suivi-actions.html ou les décisions prévues */
    ["SCI LES TERRASSES DÉMO", "const", "#Const-2026-089", "05/10/2026", "Sophie Lambert", 0, "20/10/2026", "Constitution d'une SCI"],
    ["SCP MÉDICALE DES TILLEULS DÉMO", "const", "#Const-2026-090", "03/10/2026", "Sophie Lambert", 0, "22/10/2026", "Constitution d'une SCP de médecins"],
    ["LES JARDINS D'ORIANE", "capital", "#Capital-2026-063", "07/10/2026", "Sophie Lambert", 0, "31/10/2026", "Modification de capital"],
    ["LES JARDINS D'ORIANE", "capital", "#Capital-2026-064", "12/10/2026", "Sophie Lambert", 0, "30/11/2026", "Modification de capital"],
    ["ODALIS", "capital", "#Capital-2026-059", "25/09/2026", "Laura Perrin", 0, "03/11/2026", "Modification de capital"],
    ["ORVEA", "agoa", "#GC-2026-238", "10/09/2026", "Olivier Garnier", 0, "29/06/2026", "AGOA et dépôt des comptes"],
    ["PAPRIKA CANTINE", "agoa", "#GC-2026-221", "20/07/2026", "Sophie Lambert", 0, "05/08/2026", "AGOA et dépôt des comptes"],
    ["MERCIER & ASSOCIES", "agoa", "#GC-2026-232", "25/08/2026", "Olivier Garnier", 0, "10/09/2026", "AGOA et dépôt des comptes"],
    ["CL OPTIC", "agoa", "#GC-2026-143", "20/08/2026", "Marc Renaud", 0, "12/09/2026", "AGOA et dépôt des comptes"],
    ["A.R.T.E", "agoa", "#GC-2026-069", "28/08/2026", "Marc Renaud", 0, null, "AGOA et dépôt des comptes"],
    ["SELARL MV", "autre", "#Transfo-2026-141", "27/08/2026", "Marc Renaud", 0, "", "Transformation de la société"],
    ["AXIOME", "agoa", "#GC-2026-246", "15/04/2026", "Olivier Garnier", 0, "22/06/2026", "AGOA et dépôt des comptes"],
    ["LES JARDINS D'ORIANE", "agoa", "#GC-2026-229", "30/01/2026", "Olivier Garnier", 0, "26/06/2026", "AGOA et dépôt des comptes"],
    /* Approbations suivies dans EJ des sociétés du calendrier générique (étape cohérente avec la formalité) */
    ["MAISON CAILLAUD", "agoa", "#GC-2026-262", "14/09/2026", "Laura Perrin", 0, "05/10/2026", "AGOA et dépôt des comptes"],
    ["OPTIQUE MARTIN", "agoa", "#GC-2026-226", "03/08/2026", "Olivier Garnier", 0, "28/08/2026", "AGOA et dépôt des comptes"],
    ["PHARMACIE DES ARCADES", "agoa", "#GC-2026-266", "24/07/2026", "Sophie Lambert", 0, null, "AGOA et dépôt des comptes"],
    /* Approbations 2025 des sociétés sans date de clôture au DPJ (repli : approuvées l'an dernier, rien cette année) */
    ["GARAGE DUVAL", "agoa", "#GC-2025-061", "12/05/2025", "Sophie Lambert", 0, "", "AGOA et dépôt des comptes"],
    ["CLINIQUE VÉTÉRINAIRE DU LAC", "agoa", "#GC-2025-064", "20/05/2025", "Laura Perrin", 0, "", "AGOA et dépôt des comptes"],
    ["MENUISERIE GAUTHIER", "agoa", "#GC-2025-072", "05/06/2025", "Olivier Garnier", 0, "", "AGOA et dépôt des comptes"],
  ];
  /* Formalités créées par mois, de novembre 2024 à octobre 2026 : 64 sur N-1, 100 sur les douze derniers mois */
  var QUOTA = [3, 3, 4, 5, 6, 8, 9, 10, 4, 2, 5, 5, 5, 5, 6, 7, 9, 12, 13, 11, 7, 6, 9, 10];
  var Q0 = 2024 * 12 + 10; /* novembre 2024 */
  var CREATEURS = ["Sophie Lambert", "Laura Perrin", "Olivier Garnier", "Marc Renaud", "Nadia Benali", "Paul Roussel", "Julien Moreau", "Élodie Garcia"];
  var FORMS = [];
  (function () {
    var seed = 20261019;
    function rnd() {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    }
    function pick(w) {
      var keys = Object.keys(w);
      var t = rnd() * sum(keys.map(function (k) { return w[k]; }));
      for (var i = 0; i < keys.length; i++) {
        t -= w[keys[i]];
        if (t <= 0) return keys[i];
      }
      return keys[0];
    }
    var used = {};
    FX.forEach(function (x) {
      used[x[2]] = 1;
      FORMS.push({ soc: x[0], fam: x[1], ref: x[2], cree: parse(x[3]), by: x[4], st: x[5] ? "en_cours" : "generes", dec: x[6], type: x[7] });
    });
    var seq = {};
    function ref(fam, y) {
      var k = TYPES[fam][1] + "-" + y;
      var n = seq[k] || 100;
      var r;
      do {
        n++;
        r = "#" + k + "-" + n;
      } while (used[r]);
      seq[k] = n;
      used[r] = 1;
      return r;
    }
    var SAISON = { agoa: 55, capital: 12, conv: 8, dir: 8, siege: 5, cession: 6, const: 4, autre: 2 };
    var HORS = { agoa: 15, capital: 22, conv: 15, dir: 15, siege: 10, cession: 10, const: 8, autre: 5 };
    QUOTA.forEach(function (q, k) {
      var mo = month(Q0 + k);
      var have = FORMS.filter(function (f) {
        return mi(f.cree) === mo.idx;
      }).length;
      for (var i = have; i < q; i++) {
        var day = 2 + Math.floor(rnd() * 26);
        var d = new Date(mo.y, mo.m, day);
        if (mo.idx === CUR && d > TODAY) d = new Date(mo.y, mo.m, 1 + Math.floor(rnd() * (TODAY.getDate() - 1)));
        var fam = pick(mo.m >= 2 && mo.m <= 6 ? SAISON : mo.m === 11 ? { agoa: 35, capital: 20, conv: 15, dir: 12, siege: 8, cession: 6, const: 4 } : HORS);
        var pool;
        if (fam === "const") {
          pool = SOC.filter(function (s) {
            return mi(s.ajout) === mo.idx && s.ajout <= d && !s.crea;
          });
          if (!pool.length) fam = "capital";
          else d = new Date(s0(pool).ajout.getTime());
        }
        if (fam !== "const")
          pool = SOC.filter(function (s) {
            return s.ajout <= d && !s.crea && (fam !== "agoa" || !!s.cl);
          });
        var soc = pool[Math.floor(rnd() * pool.length)];
        FORMS.push({ soc: soc.n, fam: fam, ref: ref(fam, mo.y), cree: d, by: CREATEURS[Math.floor(rnd() * (mo.y >= 2026 ? 5 : 4))], st: "generes", dec: "", type: fam === "const" ? "Constitution d'une " + soc.f : TYPES[fam][0] });
      }
    });
    function s0(a) {
      return a[0];
    }
    FORMS.sort(function (a, b) {
      return b.cree - a.cree;
    });
  })();
  var FORM_TOTAL = FORMS.length; /* 164 */
  var FORM_EN_COURS = FORMS.filter(function (f) {
    return f.st === "en_cours";
  });

  /* Décisions et signatures prévues dans les formalités (90 prochains jours) */
  var PLAN = [
    { soc: "SCI LES TERRASSES DÉMO", date: "20/10/2026", nat: "Signature prévue · constitution d'une SCI" },
    { soc: "NOVA STUDIO DÉMO", date: "20/10/2026", nat: "Décision et signature prévues · constitution d'une SAS" },
    { soc: "SCCV LES ATELIERS DÉMO", date: "21/10/2026", nat: "Décision et signature prévues · constitution" },
    { soc: "SCP MÉDICALE DES TILLEULS DÉMO", date: "22/10/2026", nat: "Décision et signature prévues · constitution d'une SCP" },
    { soc: "LES JARDINS D'ORIANE", date: "31/10/2026", nat: "Décision prévue · modification de capital" },
    { soc: "ODALIS", date: "03/11/2026", nat: "Décision prévue · modification de capital" },
    { soc: "LES JARDINS D'ORIANE", date: "30/11/2026", nat: "Décision prévue · modification de capital" },
  ];

  /* ---------- Calculs d'AG et de dépôts ----------
     Exercice de la campagne : clos entre le 01/07/2025 et le 30/06/2026 (sociétés commerciales).
     AG suivie dans EJ : une formalité d'approbation existe dans EJ pour l'exercice (créée après la clôture),
     ou un dépôt des comptes est en cours dans le suivi des actions.
     Étape : à préparer, documents générés, en signature, à déposer, déposé. Un dépôt en cours prouve au moins
     des documents générés. Une date de décision ne vaut AG tenue qu'à partir des documents générés :
     la date prévue d'une formalité au stade « Formulaire en cours » n'est qu'une prévision.
     AG tenue : étape « En signature » ou au-delà, ou documents générés avec une décision passée.
     AG hors délai : AG suivie dans EJ, échéance dépassée sans décision, ou décision postérieure à l'échéance.
     AG non suivie dans EJ : échéance dépassée et aucune formalité d'approbation dans EJ pour l'exercice
     (l'AG a pu se tenir hors d'EJ : ni tenue ni hors délai, à vérifier).
     Dépôt des comptes en retard : décision valable connue, comptes non déposés deux mois après.
     Sociétés civiles : règle propre à valider avec le juriste EJ, jamais mélangée au calcul certain. */
  var RANK = { prep: 0, gen: 1, sig: 2, dep: 3, ok: 4 };
  var DEP_STAGE = { a_signer: "gen", sig: "sig", pret: "dep" };
  var CAMP_FROM = new Date(2025, 6, 1);
  var CAMP_TO = new Date(2026, 5, 30);
  function agoaOf(name, from, to) {
    return FORMS.filter(function (f) {
      return f.soc === name && f.fam === "agoa" && f.cree > from && f.cree <= to;
    });
  }
  SOC.forEach(function (s) {
    var depStage = null;
    DEP.forEach(function (d) {
      if (d.soc === s.n && /Comptes annuels/.test(d.dep) && (!depStage || RANK[DEP_STAGE[d.st]] > RANK[depStage])) depStage = DEP_STAGE[d.st];
    });
    if (s.cl) {
      s.fCamp = agoaOf(s.n, s.clos, TODAY);
      s.fPrev = agoaOf(s.n, new Date(s.clos.getFullYear() - 1, s.clos.getMonth(), s.clos.getDate()), s.clos);
    } else {
      s.fCamp = [];
      s.fPrev = agoaOf(s.n, addMonths(TODAY, -24), addMonths(TODAY, -12));
    }
    /* date de décision : celle de la société, sinon celle prévue dans la formalité d'approbation de l'exercice */
    var fd = s.fCamp.filter(function (f) { return !!f.dec; })[0];
    s.decSrc = s.decS ? "soc" : fd ? (fd.st === "en_cours" ? "prevue" : "formalite") : null;
    s.dec = s.decS ? parse(s.decS) : fd ? parse(fd.dec) : null;
    s.suivi = s.fCamp.length > 0 || !!depStage;
    s.stage = s.suivi ? s.st || "prep" : null;
    if (s.suivi && depStage && RANK[depStage] > RANK[s.stage]) s.stage = depStage;
    s.decEff = s.dec && s.stage && RANK[s.stage] >= 1 ? s.dec : null;
    s.held = !!s.stage && (RANK[s.stage] >= 2 || (!!s.decEff && s.decEff <= TODAY));
    if (!s.camp) return;
    var past = s.dl < TODAY;
    s.agLate = s.suivi && s.stage !== "ok" && past && (!s.decEff || s.decEff > s.dl);
    s.nonSuivi = !s.suivi && past;
    s.due = s.decEff ? addMonths(s.decEff, 2) : null;
    s.depLate = s.suivi && s.stage !== "ok" && !!s.decEff && s.decEff <= TODAY && s.due < TODAY;
  });
  /* Repli quand la clôture manque (05-decision.md §3.6) : approuvée dans EJ l'an dernier, rien cette année */
  SOC.forEach(function (s) {
    s.repli = !s.cl && !s.crea && !s.civ && s.fPrev.length > 0 && !agoaOf(s.n, addMonths(TODAY, -12), TODAY).length;
  });
  var ETATS = { prep: "À préparer", form: "Formulaire commencé", gen: "Documents générés ou plus" };
  /* Échéance d'AG d'une société dans le mois idx (null si aucune) */
  function agIn(s, idx) {
    if (!s.cl) return null;
    var cIdx = idx - 6;
    if (cIdx - Math.floor(cIdx / 12) * 12 !== s.clMonth) return null;
    var y = Math.floor(cIdx / 12);
    var clos = new Date(y, s.clMonth, s.clDay);
    var dl = new Date(y, s.clMonth + 7, 0);
    if (s.ajout > dl) return null;
    var campagne = clos >= CAMP_FROM && clos <= CAMP_TO;
    var held = clos < CAMP_FROM ? true : campagne ? s.held : false;
    var etat = held ? "tenue" : campagne && s.stage && RANK[s.stage] >= 1 ? "gen" : campagne && s.fe ? "form" : "prep";
    return { clos: clos, dl: dl, held: held, campagne: campagne, etat: etat, civ: s.civ };
  }
  /* Échéance de dépôt des comptes (sociétés commerciales) dans le mois idx */
  function depIn(s, idx) {
    if (!s.cl || s.civ || s.crea) return null;
    var cIdx = idx - 8;
    var y = Math.floor(cIdx / 12);
    if (cIdx - y * 12 === s.clMonth) {
      var clos = new Date(y, s.clMonth, s.clDay);
      if (clos > CAMP_TO) return { clos: clos, due: new Date(y, s.clMonth + 9, 0), dec: null, estime: true };
    }
    /* exercice de la campagne : échéance réelle si une décision valable est connue */
    if (s.camp && s.stage !== "ok") {
      var due = s.decEff ? addMonths(s.decEff, 2) : new Date(s.dl.getFullYear(), s.dl.getMonth() + 3, 0);
      if (mi(due) === idx && due >= new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)) return { clos: s.clos, due: due, dec: s.decEff, estime: !s.decEff };
    }
    return null;
  }

  /* ---------- Utilisateurs (utilisateurs.html) et « créé par » ---------- */
  var PEOPLE = ["Thomas Girard", "Antoine Faure", "Paul Roussel", "Julien Moreau", "Élodie Garcia", "Laura Perrin", "Claire Dubois", "Nadia Benali", "Léa Fontaine", "Jean Dupond", "Sophie Lambert", "Olivier Garnier", "Marc Renaud"];

  /* ---------- Filtres ---------- */
  function grpForme(f) {
    return CIVILES.indexOf(f) !== -1 ? "Sociétés civiles" : f;
  }
  function okForme(forme, ctx) {
    var fs = ctx.f.formes || [];
    return !fs.length || fs.indexOf(forme) !== -1;
  }
  function okSoc(name, ctx) {
    var s = BYNAME[name] || EJM_BY[name];
    var forme = s ? s.f || s.forme : null;
    return okForme(forme, ctx);
  }
  function okBy(by, ctx) {
    return !ctx.f.createur || ctx.f.createur === by;
  }
  function okMandat(m, ctx) {
    var ts = ctx.f.types || [];
    return (!ts.length || ts.indexOf(m.type) !== -1) && (!ctx.f.signataire || ctx.f.signataire === m.signataire);
  }
  function per(ctx) {
    return ctx.f.periode || 12;
  }
  function socs(ctx) {
    return SOC.filter(function (s) {
      return okForme(s.f, ctx);
    });
  }
  function forms(ctx) {
    return FORMS.filter(function (f) {
      return okSoc(f.soc, ctx) && okBy(f.by, ctx);
    });
  }
  function deps(ctx) {
    return DEP.filter(function (d) {
      return okSoc(d.soc, ctx) && okBy(d.by, ctx);
    });
  }
  function ejms(ctx) {
    return E.societes.filter(function (s) {
      return okForme(s.forme, ctx);
    });
  }
  function mandats(ctx) {
    return E.mandats.filter(function (m) {
      return okMandat(m, ctx);
    });
  }
  function formeLabel(ctx) {
    var fs = ctx.f.formes || [];
    return fs.length ? " (" + fs.join(", ") + ")" : "";
  }

  function cap1(t) {
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
  }
  /* ---------- Lignes de liste (tiroir) : texte brut, échappé par la page ---------- */
  function socRow(s, meta, extra) {
    var r = { title: s.n, forme: s.f, meta: meta || "", href: "societe.html", action: "Voir la société" };
    if (extra) for (var k in extra) r[k] = extra[k];
    return r;
  }
  function formRow(f) {
    var dec = f.dec === null ? "date de décision non définie" : f.dec ? "décision du " + f.dec : "";
    return {
      title: f.soc, forme: (BYNAME[f.soc] || {}).f || "",
      meta: f.ref + " · " + f.type + (dec ? " · " + dec : "") + " · créée le " + fmt(f.cree) + " par " + f.by,
      badge: f.st === "en_cours" ? { label: "Formulaire en cours", tone: "progress" } : { label: "Documents générés", tone: "neutral" },
      href: "formalite.html", action: f.st === "en_cours" ? "Reprendre le formulaire" : "Ouvrir la formalité",
    };
  }
  function depRow(d) {
    var m = DEP_ST[d.st];
    return {
      title: d.soc, forme: (BYNAME[d.soc] || {}).f || "",
      meta: "Dépôt " + d.dep + " · " + d.ref + " · depuis le " + d.date + " · créé par " + d.by,
      badge: { label: m.label, tone: d.st === "a_signer" ? "action" : "progress" },
      href: "suivi-actions.html", action: m.action,
    };
  }
  function labRow(s) {
    var l = s.lab;
    var motif = l.statut === "incomplet" ? "Pièces reçues : " + l.pieces[0] + " sur " + l.pieces[1] : l.statut === "a_ouvrir" ? "Dossier jamais ouvert" : l.prochaineRevue ? "Revue prévue le " + l.prochaineRevue : "Revue à planifier";
    return {
      title: s.nom, forme: s.forme, meta: E.LAB_STATUT[l.statut] + " · " + motif + (l.gel === "a_verifier" ? " · homonymie gel des avoirs à lever" : ""),
      badge: { label: l.risque ? E.RISQUE[l.risque] : "Risque non évalué", tone: l.risque === "eleve" ? "warning" : l.risque ? "neutral" : "neutral" },
      href: "lab-dossier.html?id=" + encodeURIComponent(s.id), action: l.statut === "a_ouvrir" ? "Ouvrir le dossier" : "Voir le dossier",
    };
  }
  function lmRow(s) {
    var l = s.lm;
    var meta = l.statut === "envoyee" ? "Envoyée le " + l.envoyee : l.statut === "a_renouveler" ? "Non reconduite, échéance du " + l.echeance : l.statut === "absente" ? "Aucune lettre de mission" : l.statut === "signee" ? "Signée le " + l.signee + " · " + l.ref : "Brouillon " + (l.ref || "");
    return {
      title: s.nom, forme: s.forme, meta: meta,
      badge: { label: E.LM_STATUT[l.statut], tone: l.statut === "signee" ? "success" : l.statut === "absente" ? "error" : l.statut === "a_renouveler" ? "action" : "progress" },
      href: "lettre-mission.html?id=" + encodeURIComponent(s.id),
      action: l.statut === "absente" ? "Créer la lettre" : l.statut === "envoyee" ? "Relancer la signature" : l.statut === "brouillon" ? "Finaliser la lettre" : l.statut === "a_renouveler" ? "Renouveler" : "Ouvrir la lettre",
    };
  }
  function mandRow(m, meta) {
    return { title: m.nom, forme: m.forme, meta: meta, href: "cac-mandat.html?id=" + encodeURIComponent(m.id), action: "Ouvrir la mission" };
  }
  function decTxt(s) {
    if (s.decEff) return " · décision du " + fmt(s.decEff);
    if (s.dec) return " · décision prévue le " + fmt(s.dec) + " (formulaire en cours, ne vaut pas AG tenue)";
    return "";
  }
  function agRow(s, a) {
    var r = socRow(s, "Exercice clos le " + fmt(a.clos) + " · AG avant le " + fmt(a.dl) + (a.campagne ? decTxt(s) : ""));
    r.badge = a.held ? { label: "AG tenue", tone: "success" } : a.civ ? { label: "Société civile, règle à valider", tone: "neutral" } : { label: ETATS[a.etat] || "AG à tenir", tone: a.etat === "prep" ? "action" : "progress" };
    if (!a.held) {
      r.href = a.campagne && (s.fe || a.etat === "gen") ? "formalite.html" : "nouvelle-formalite.html";
      r.action = a.campagne && s.fe ? "Reprendre l'AGOA" : a.etat === "gen" ? "Ouvrir l'AGOA" : "Préparer l'AGOA";
    }
    return r;
  }

  /* ---------- Couvertures ---------- */
  function covClot(ctx) {
    var all = socs(ctx);
    var withCl = all.filter(function (s) {
      return !!s.cl;
    }).length;
    return "Calculé sur " + withCl + " sociétés sur " + all.length + formeLabel(ctx) + " ; " + (all.length - withCl) + " sans date de clôture au DPJ.";
  }
  var COV_EJM = "Module Lettres de mission et LAB (2027, provisoire) : " + E.societes.length + " sociétés équipées dans la démonstration.";
  var COV_CAC = "Module Missions CAC (2027, provisoire) : " + E.mandats.length + " missions du cabinet.";

  /* ---------- Séries de base ---------- */
  function agSeries(ctx, months, keepHeld) {
    return months.map(function (mo) {
      var rows = [];
      socs(ctx).forEach(function (s) {
        var a = agIn(s, mo.idx);
        if (a && (keepHeld || !a.held)) rows.push({ s: s, a: a });
      });
      return rows;
    });
  }
  function agN1(ctx, months) {
    return months.map(function (mo) {
      var rows = [];
      socs(ctx).forEach(function (s) {
        var a = agIn(s, mo.idx - 12);
        if (a) rows.push({ s: s, a: a });
      });
      return rows;
    });
  }
  /* Sépare le calcul certain (sociétés commerciales) des sociétés civiles (règle à valider) */
  function noCiv(rows) {
    return rows.map(function (l) { return l.filter(function (x) { return !x.s.civ; }); });
  }
  function onlyCiv(rows) {
    return rows.map(function (l) { return l.filter(function (x) { return x.s.civ; }); });
  }
  function lens(rows) {
    return rows.map(function (l) { return l.length; });
  }
  function civNote(n) {
    return n ? "Sociétés civiles à part : " + n + " " + pl(n, "échéance", "échéances") + ", règle à valider." : "";
  }
  /* Libellés de mois : court sur l'axe (année au changement d'année), long dans les info-bulles et le tiroir */
  function cats(ms) {
    return ms.map(function (m, i) { return i === 0 || m.m === 0 ? m.label : MOIS_C[m.m]; });
  }
  function longs(ms) {
    return ms.map(function (m) { return m.long; });
  }
  function formsIn(ctx, idx) {
    return forms(ctx).filter(function (f) {
      return mi(f.cree) === idx;
    });
  }
  function socsAt(ctx, d) {
    return socs(ctx).filter(function (s) {
      return s.ajout <= d;
    });
  }
  function hasDep(name) {
    return DEP.some(function (d) { return d.soc === name && /Comptes annuels/.test(d.dep); });
  }
  function prevTxt(x) {
    var f = x.fPrev[0];
    return f ? "approuvée dans EJ l'an dernier (" + f.ref + ", créée le " + fmt(f.cree) + ")" : "";
  }
  function vigilance(ctx) {
    var s = socs(ctx);
    var e = ejms(ctx);
    function nsRow(x) {
      var r = x.cl
        ? socRow(x, "Exercice clos le " + fmt(x.clos) + " · échéance du " + fmt(x.dl) + " · aucune formalité d'approbation dans EJ pour cet exercice" + (x.fPrev.length ? " · " + prevTxt(x) : ""))
        : socRow(x, "Date de clôture absente du DPJ · " + prevTxt(x) + " · aucune approbation dans EJ depuis douze mois");
      r.badge = { label: "AG non suivie dans EJ", tone: "neutral" };
      r.action = "Vérifier la société";
      return r;
    }
    var nsA = s.filter(function (x) { return x.nonSuivi && x.fPrev.length; });
    var nsB = s.filter(function (x) { return x.nonSuivi && !x.fPrev.length; });
    var nsC = s.filter(function (x) { return x.repli; });
    return {
      ag: { label: "AG hors délai", rows: s.filter(function (x) { return x.agLate; }).map(function (x) {
        var r = socRow(x, "Exercice clos le " + fmt(x.clos) + " · échéance du " + fmt(x.dl) + (x.decEff ? " · décision du " + fmt(x.decEff) : x.dec ? " · décision prévue le " + fmt(x.dec) + ", formulaire en cours" : " · date de décision non définie"));
        r.badge = { label: "AG hors délai", tone: "action" };
        r.href = "formalite.html";
        r.action = x.fe ? "Reprendre l'AGOA" : "Ouvrir l'AGOA";
        return r;
      }) },
      dep: { label: "Dépôts des comptes en retard", rows: s.filter(function (x) { return x.depLate; }).map(function (x) {
        var dp = hasDep(x.n);
        var r = socRow(x, "Décision du " + fmt(x.decEff) + " · dépôt attendu avant le " + fmt(x.due) + (dp ? "" : " · aucun dépôt créé dans le suivi des actions"));
        r.badge = { label: "Délai de dépôt dépassé", tone: "action" };
        r.href = dp ? "suivi-actions.html" : "formalite.html";
        r.action = dp ? "Voir le dépôt" : "Créer le dépôt";
        return r;
      }) },
      ns: { label: "AG non suivies dans EJ", rows: nsA.concat(nsB, nsC).map(nsRow), parts: [nsA, nsB, nsC].map(function (l) { return l.map(nsRow); }) },
      clo: { label: "Sociétés sans date de clôture", rows: s.filter(function (x) { return !x.cl; }).map(function (x) {
        return socRow(x, x.crea ? "En cours de création" : "Date de clôture absente du DPJ", { action: "Compléter la fiche" });
      }) },
      lab: { label: "Dossiers LAB à revoir", rows: e.filter(function (x) { return x.lab.statut !== "a_jour"; }).map(labRow) },
      lm: { label: "Lettres de mission non signées", rows: e.filter(function (x) { return x.lm.statut !== "signee"; }).map(lmRow) },
    };
  }
  function echeances(ctx) {
    var items = [];
    var start = mi(TODAY);
    socs(ctx).forEach(function (s) {
      for (var i = 0; i < 12; i++) {
        var a = agIn(s, start + i);
        if (a && !a.held && a.dl >= TODAY) items.push({ d: a.dl, soc: s.n, forme: s.f, label: a.civ ? "Échéance de l'AG d'approbation (société civile, règle à valider)" : "Échéance de l'AG d'approbation", href: s.fe && a.campagne ? "formalite.html" : "nouvelle-formalite.html", action: "Préparer l'AGOA" });
        var dp = depIn(s, start + i);
        if (dp && dp.due >= TODAY && !dp.estime) items.push({ d: dp.due, soc: s.n, forme: s.f, label: "Dépôt des comptes", href: "suivi-actions.html", action: "Voir le dépôt" });
      }
    });
    PLAN.forEach(function (p) {
      var d = parse(p.date);
      if (d >= TODAY && okSoc(p.soc, ctx)) items.push({ d: d, soc: p.soc, forme: (BYNAME[p.soc] || {}).f || "", label: p.nat, href: "formalite.html", action: "Ouvrir la formalité" });
    });
    items.sort(function (a, b) {
      return a.d - b.d || (a.soc < b.soc ? -1 : 1);
    });
    return items;
  }
  /* Jours d'intervention (lundi au vendredi) d'une intervention CAC dans le mois idx */
  function joursIn(iv, idx) {
    var d = parse(iv[1]);
    var to = parse(iv[2]);
    var n = 0;
    while (d <= to) {
      if (mi(d) === idx && d.getDay() > 0 && d.getDay() < 6) n++;
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    }
    return n;
  }
  function isFin(m) {
    return m.type !== "contractuel" && +m.ex.clos.slice(-4) === m.dernier;
  }

  /* ---------- Constructeurs de résultats ---------- */
  function rowsOf(list, fn) {
    return list.map(fn);
  }
  function catResult(cats, tones, rowsByCat, extra) {
    var r = {
      kind: "cat",
      categories: cats,
      series: [{ name: "Nombre", values: rowsByCat.map(function (r) { return r.length; }), tones: tones }],
      rows: function (si, ci) {
        return ci == null ? [].concat.apply([], rowsByCat) : rowsByCat[ci] || [];
      },
    };
    if (extra) for (var k in extra) r[k] = extra[k];
    return r;
  }

  /* ---------- Catalogue d'indicateurs certifiés ----------
     kind : kpi | series (temps) | cat (catégories) | matrix (catégories × séries) | gauge | list
     dims : filtres acceptés (forme, createur, periode, type, signataire). Les autres sont « non disponibles ». */
  var THEMES = {
    portefeuille: "Portefeuille",
    charge: "Charge juridique",
    activite: "Activité",
    vigilance: "Vigilance et conformité",
    operations: "Opérations du jour",
    cac_missions: "Missions CAC",
    cac_conf: "Mandats et indépendance",
  };
  var SRC = {
    soc: "Fiches sociétés (date d'ajout, forme juridique)",
    dpj: "DPJ (date de clôture) et formalités (date de décision, étape)",
    form: "Formalités (date de création, type, statut, créé par)",
    dep: "Suivi des actions (dépôts INPI, statut et horodatage)",
    lab: "Module LAB (2027, provisoire)",
    lm: "Module Lettres de mission (2027, provisoire)",
    cac: "Module Missions CAC (2027, provisoire)",
  };
  var IND = {};
  function ind(id, o) {
    o.id = id;
    IND[id] = o;
  }

  /* ===== Portefeuille ===== */
  ind("soc_suivies", {
    group: "ec", theme: "portefeuille", kind: "kpi", title: "Sociétés suivies", dims: ["forme", "periode"], dir: "back", src: SRC.soc,
    kw: ["societes suivies", "portefeuille", "nombre de societes", "clients"],
    rule: "Société suivie par le cabinet dans Express Juridique. Variation : sociétés ajoutées sur la période.",
    cov: function (ctx) { return "Toutes les sociétés du cabinet (" + socs(ctx).length + formeLabel(ctx) + ")."; },
    compute: function (ctx) {
      var n = per(ctx);
      var ms = back(n);
      var all = socs(ctx);
      var added = all.filter(function (s) { return s.ajout >= ms[0].from; }).length;
      return {
        value: all.length, display: nf(all.length), delta: (added >= 0 ? "+" : "") + added + " sur les " + n + " derniers mois", deltaTone: added > 0 ? "up" : "flat",
        spark: ms.map(function (mo) { return socsAt(ctx, mo.idx === CUR ? TODAY : mo.to).length; }),
        rows: function () { return all.map(function (s) { return socRow(s, (s.cl ? "Clôture au " + s.cl : "Sans date de clôture") + " · ajoutée le " + fmt(s.ajout)); }); },
      };
    },
  });
  ind("soc_evolution", {
    group: "ec", theme: "portefeuille", kind: "series", title: "Sociétés suivies dans le temps", sub: "Fin de mois", viz: "line", vizes: ["line", "bar", "table"], dims: ["forme", "periode"], dir: "back", src: SRC.soc,
    kw: ["evolution du portefeuille", "evolution des societes", "croissance", "societes dans le temps"],
    rule: "Nombre de sociétés suivies à la fin de chaque mois, d'après la date d'ajout au cabinet.",
    cov: function (ctx) { return "Toutes les sociétés du cabinet (" + socs(ctx).length + formeLabel(ctx) + "). Historique depuis l'import du 03/10/2024."; },
    compute: function (ctx) {
      var ms = back(per(ctx));
      var rows = ms.map(function (mo) { return socsAt(ctx, mo.idx === CUR ? TODAY : mo.to); });
      return {
        kind: "series", categories: cats(ms), titles: longs(ms), months: ms,
        series: [{ name: "Sociétés suivies", values: rows.map(function (r) { return r.length; }), tone: "primary" }],
        rows: function (si, ci) { return (ci == null ? rows[rows.length - 1] : rows[ci]).map(function (s) { return socRow(s, "Ajoutée le " + fmt(s.ajout)); }); },
      };
    },
  });
  ind("soc_ajouts", {
    group: "ec", theme: "portefeuille", kind: "series", title: "Sociétés ajoutées par mois", viz: "bar", vizes: ["bar", "line", "table"], dims: ["forme", "periode"], dir: "back", src: SRC.soc,
    kw: ["societes ajoutees", "nouvelles societes", "nouveaux clients", "entrees"],
    rule: "Sociétés ajoutées au cabinet dans le mois (date d'ajout de la fiche société).",
    cov: function (ctx) { return "Toutes les sociétés du cabinet (" + socs(ctx).length + formeLabel(ctx) + ")."; },
    compute: function (ctx) {
      var ms = back(per(ctx));
      var rows = ms.map(function (mo) { return socs(ctx).filter(function (s) { return mi(s.ajout) === mo.idx; }); });
      return {
        kind: "series", categories: cats(ms), titles: longs(ms), months: ms,
        series: [{ name: "Sociétés ajoutées", values: rows.map(function (r) { return r.length; }), tone: "primary" }],
        rows: function (si, ci) { return (ci == null ? [].concat.apply([], rows) : rows[ci]).map(function (s) { return socRow(s, "Ajoutée le " + fmt(s.ajout)); }); },
      };
    },
  });
  ind("portefeuille_forme", {
    group: "ec", theme: "portefeuille", kind: "cat", title: "Portefeuille par forme juridique", viz: "donut", vizes: ["donut", "bar", "barh", "table"], dims: ["forme"], src: SRC.soc,
    kw: ["repartition par forme", "forme juridique", "formes juridiques", "repartition du portefeuille", "repartition"],
    rule: "Sociétés suivies, regroupées par forme juridique (fiche société). SCI, SCP et SCCV regroupées en sociétés civiles.",
    cov: function (ctx) { return "Toutes les sociétés du cabinet (" + socs(ctx).length + formeLabel(ctx) + ")."; },
    compute: function (ctx) {
      var groups = ["SAS", "SARL", "SA", "SELARL", "Sociétés civiles"];
      var tones = ["primary", "info", "accent", "mint", "muted"];
      var by = groups.map(function (g) { return socs(ctx).filter(function (s) { return grpForme(s.f) === g; }); });
      var keep = groups.map(function (g, i) { return by[i].length > 0; });
      var cats = groups.filter(function (g, i) { return keep[i]; });
      var r = catResult(cats, tones.filter(function (t, i) { return keep[i]; }), by.filter(function (b, i) { return keep[i]; }).map(function (l) {
        return l.map(function (s) { return socRow(s, s.cl ? "Clôture au " + s.cl : "Sans date de clôture"); });
      }));
      r.center = { value: nf(socs(ctx).length), label: "sociétés" };
      return r;
    },
  });

  /* ===== Activité ===== */
  ind("form_ouvertes", {
    group: "ec", theme: "activite", kind: "kpi", title: "Formalités créées", dims: ["forme", "createur", "periode"], dir: "back", src: SRC.form,
    kw: ["formalites creees", "formalites ouvertes", "nombre de formalites"],
    rule: "Formalités créées sur la période (date de création), tous types et tous statuts. Variation : mêmes mois un an plus tôt.",
    cov: function (ctx) { return "Toutes les formalités du cabinet (" + FORM_TOTAL + " depuis novembre 2024)."; },
    compute: function (ctx) {
      var n = per(ctx);
      var ms = back(n);
      var vals = ms.map(function (mo) { return formsIn(ctx, mo.idx).length; });
      var prev = sum(ms.map(function (mo) { return formsIn(ctx, mo.idx - 12).length; }));
      var v = sum(vals);
      var pct = prev ? Math.round(((v - prev) / prev) * 100) : null;
      var list = forms(ctx).filter(function (f) { return f.cree >= ms[0].from; });
      return {
        value: v, display: nf(v), delta: pct == null ? "Pas d'historique sur N-1" : (pct >= 0 ? "+" : "") + pct + " % vs N-1", deltaTone: pct == null ? "flat" : pct >= 0 ? "up" : "down",
        sub: "sur les " + n + " derniers mois", spark: vals, rows: function () { return list.map(formRow); },
      };
    },
  });
  ind("form_mois", {
    group: "ec", theme: "activite", kind: "series", title: "Formalités créées par mois", sub: "N et N-1", viz: "line", vizes: ["line", "bar", "table"], dims: ["forme", "createur", "periode"], dir: "back", src: SRC.form,
    kw: ["formalites creees par mois", "formalites par mois", "activite", "formalites", "creations de formalites"],
    rule: "Formalités créées dans le mois (date de création), tous types et tous statuts. N-1 : mêmes mois un an plus tôt.",
    cov: function () { return "Toutes les formalités du cabinet (" + FORM_TOTAL + " depuis novembre 2024, dont " + FORM_EN_COURS.length + " en cours)."; },
    compute: function (ctx) {
      var ms = back(per(ctx));
      var rows = ms.map(function (mo) { return formsIn(ctx, mo.idx); });
      var rowsP = ms.map(function (mo) { return formsIn(ctx, mo.idx - 12); });
      return {
        kind: "series", categories: cats(ms), titles: longs(ms), months: ms,
        series: [
          { name: "N", values: rows.map(function (r) { return r.length; }), tone: "primary" },
          { name: "N-1", values: rowsP.map(function (r) { return r.length; }), tone: "n1", dashed: true },
        ],
        rows: function (si, ci) {
          var src = si === 1 ? rowsP : rows;
          return (ci == null ? [].concat.apply([], src) : src[ci]).map(formRow);
        },
      };
    },
  });
  ind("form_types", {
    group: "ec", theme: "activite", kind: "cat", title: "Opérations les plus fréquentes", viz: "barh", vizes: ["barh", "bar", "donut", "table"], dims: ["forme", "createur", "periode"], dir: "back", src: SRC.form,
    kw: ["types d'operations", "operations les plus frequentes", "types de formalites", "par type"],
    rule: "Formalités créées sur la période, regroupées par type d'opération. Six types les plus fréquents, le reste en « Autres opérations ».",
    cov: function (ctx) { return "Toutes les formalités créées sur les " + per(ctx) + " derniers mois."; },
    compute: function (ctx) {
      var ms = back(per(ctx));
      var list = forms(ctx).filter(function (f) { return f.cree >= ms[0].from; });
      var by = {};
      list.forEach(function (f) { (by[f.fam] = by[f.fam] || []).push(f); });
      var keys = Object.keys(by).filter(function (k) { return k !== "autre"; }).sort(function (a, b) { return by[b].length - by[a].length; });
      var top = keys.slice(0, 6);
      var rest = [].concat.apply(by.autre || [], keys.slice(6).map(function (k) { return by[k]; }));
      var cats = top.map(function (k) { return FAM[k]; });
      var rows = top.map(function (k) { return by[k]; });
      if (rest.length) {
        cats.push(FAM.autre);
        rows.push(rest);
      }
      return catResult(cats, cats.map(function (c, i) { return i === 0 ? "primary" : "info"; }), rows.map(function (l) { return l.map(formRow); }));
    },
  });
  ind("ops_statut", {
    group: "ec", theme: "activite", kind: "matrix", title: "Avancement des opérations", sub: "Par statut", viz: "stacked", vizes: ["stacked", "bar", "table"], dims: ["forme", "createur"], src: SRC.form + " ; " + SRC.dep,
    kw: ["avancement", "operations en cours", "statut des operations", "par statut", "pipeline"],
    rule: "Formalités au statut « Formulaire en cours » et dépôts INPI non terminés, par type d'opération et par statut.",
    cov: function () { return "Formalités en cours (" + FORM_EN_COURS.length + ") et dépôts INPI non terminés (" + DEP.length + ")."; },
    compute: function (ctx) {
      var fams = ["agoa", "capital", "const", "autre"];
      function famOf(ref) {
        return /^#GC/.test(ref) ? "agoa" : /^#Capital/.test(ref) ? "capital" : /^#Const/.test(ref) ? "const" : "autre";
      }
      var cats = ["Approbation des comptes", "Modification de capital", "Constitution", "Autres opérations"];
      var st = [
        { name: "Formulaire en cours", tone: "muted", rows: fams.map(function (k) { return forms(ctx).filter(function (f) { return f.st === "en_cours" && famOf(f.ref) === k; }).map(formRow); }) },
        { name: "Documents à signer", tone: "attention", rows: fams.map(function (k) { return deps(ctx).filter(function (d) { return d.st === "a_signer" && famOf(d.ref) === k; }).map(depRow); }) },
        { name: "En signature", tone: "info", rows: fams.map(function (k) { return deps(ctx).filter(function (d) { return d.st === "sig" && famOf(d.ref) === k; }).map(depRow); }) },
        { name: "Prêt à déposer", tone: "primary", rows: fams.map(function (k) { return deps(ctx).filter(function (d) { return d.st === "pret" && famOf(d.ref) === k; }).map(depRow); }) },
      ];
      return {
        kind: "matrix", categories: cats, stacked: true,
        series: st.map(function (s) { return { name: s.name, values: s.rows.map(function (r) { return r.length; }), tone: s.tone }; }),
        rows: function (si, ci) {
          if (si == null) return [].concat.apply([], st.map(function (s) { return ci == null ? [].concat.apply([], s.rows) : s.rows[ci]; }));
          return ci == null ? [].concat.apply([], st[si].rows) : st[si].rows[ci];
        },
      };
    },
  });

  /* ===== Charge juridique ===== */
  var AG_RULE = "Échéance de l'AG d'approbation : six mois après la date de clôture du DPJ, en fin de mois, sauf prorogation (non connue d'EJ). AG déjà tenues exclues : en signature, à déposer ou déposée, ou documents générés avec une décision passée. Une date de décision prévue dans un formulaire en cours ne vaut pas AG tenue. Sociétés civiles comptées à part : leur règle est à valider avec le juriste EJ.";
  ind("ag_6m", {
    group: "ec", theme: "charge", kind: "kpi", title: "AG à tenir d'ici 6 mois", dims: ["forme"], src: SRC.dpj,
    kw: ["ag a tenir d'ici 6 mois", "ag a tenir", "assemblees a tenir", "ag d'approbation", "approbations a venir"],
    rule: AG_RULE + " Variation à périmètre identique : échéances des six prochains mois (AG tenues comprises, sociétés civiles exclues des deux côtés, mêmes filtres) comparées aux mêmes mois un an plus tôt. Mini-courbe : AG à tenir sur les six prochains mois.",
    cov: covClot,
    compute: function (ctx) {
      var ms = fwd(6);
      var rows = agSeries(ctx, ms);
      var cur = noCiv(rows);
      var civ = sum(lens(onlyCiv(rows)));
      var v = sum(lens(cur));
      var all = sum(lens(noCiv(agSeries(ctx, ms, true))));
      var p = sum(lens(noCiv(agN1(ctx, ms))));
      var d = all - p;
      return {
        value: v, display: nf(v), delta: d === 0 ? "Échéances stables vs N-1" : (d > 0 ? "+" : "") + d + " " + pl(Math.abs(d), "échéance", "échéances") + " vs N-1", deltaTone: d > 0 ? "up" : d < 0 ? "down" : "flat",
        note: civ ? "+ " + civ + " " + pl(civ, "société civile", "sociétés civiles") + ", règle à valider" : null,
        spark: lens(cur),
        rows: function () { return [].concat.apply([], cur).map(function (x) { return agRow(x.s, x.a); }); },
      };
    },
  });
  ind("ag_mois", {
    group: "ec", theme: "charge", kind: "series", title: "AG à tenir par mois", viz: "strip", vizes: ["strip", "bar", "table"], dims: ["forme", "periode"], dir: "fwd", params: ["n1"], src: SRC.dpj,
    kw: ["charge d'ag", "ag par mois", "ag a tenir par mois", "assemblees par mois", "charge juridique", "ag a tenir", "ag", "resultats des ag"],
    rule: AG_RULE + " Avec la comparaison N-1 : toutes les échéances du mois (AG déjà tenues comprises), face aux échéances des mêmes mois un an plus tôt.",
    cov: covClot,
    compute: function (ctx) {
      var ms = fwd(per(ctx));
      var n1 = !!(ctx.p && ctx.p.n1);
      var all = agSeries(ctx, ms, n1);
      var cert = noCiv(all);
      var civ = onlyCiv(all);
      var series = [{ name: n1 ? "Échéances" : "À tenir", values: lens(cert), tone: "primary" }];
      var srcs = [cert];
      if (n1) {
        var rowsP = noCiv(agN1(ctx, ms));
        series.push({ name: "N-1", values: lens(rowsP), tone: "n1" });
        srcs.push(rowsP);
      } else if (sum(lens(civ))) {
        series.push({ name: "Sociétés civiles, règle à valider", values: lens(civ), tone: "n1" });
        srcs.push(civ);
      }
      var vals = series[0].values;
      var peak = vals.indexOf(Math.max.apply(null, vals));
      var note = (vals[peak] > 0 && ms[peak].m === 5 ? "Pic de juin : clôtures au 31 décembre. " : "") + civNote(sum(lens(civ)));
      return {
        kind: "series", categories: cats(ms), titles: longs(ms), months: ms, series: series, stacked: !n1 && series.length > 1, note: note.trim(),
        rows: function (si, ci) {
          var src = srcs[si || 0] || cert;
          if (si == null) src = ci == null ? [].concat.apply([], srcs) : srcs.map(function (x) { return x[ci]; });
          else src = ci == null ? src : [src[ci]];
          return [].concat.apply([], src).map(function (x) { return agRow(x.s, x.a); });
        },
      };
    },
  });
  ind("ag_mois_cible", {
    group: "ec", theme: "charge", kind: "kpi", title: "AG à tenir en", dims: ["forme"], params: ["mois"], hidden: true, src: SRC.dpj,
    kw: [],
    rule: AG_RULE + " Variation : échéances du mois (AG tenues comprises), comparées au même mois un an plus tôt.",
    cov: covClot,
    compute: function (ctx) {
      var idx = ctx.p && ctx.p.mois != null ? ctx.p.mois : CUR;
      var all = agSeries(ctx, [month(idx)])[0];
      var r = all.filter(function (x) { return !x.s.civ; });
      var civ = all.length - r.length;
      var e = agSeries(ctx, [month(idx)], true)[0].filter(function (x) { return !x.s.civ; }).length;
      var p = agN1(ctx, [month(idx)])[0].filter(function (x) { return !x.s.civ; }).length;
      var d = e - p;
      return {
        value: r.length, display: nf(r.length), delta: d === 0 ? "Échéances stables vs N-1" : (d > 0 ? "+" : "") + d + " " + pl(Math.abs(d), "échéance", "échéances") + " vs N-1", deltaTone: d > 0 ? "up" : d < 0 ? "down" : "flat",
        note: civ ? "+ " + civ + " " + pl(civ, "société civile", "sociétés civiles") + ", règle à valider" : null,
        title: "AG à tenir en " + month(idx).long, spark: null,
        rows: function () { return r.map(function (x) { return agRow(x.s, x.a); }); },
      };
    },
  });
  ind("ag_mois_etat", {
    group: "ec", theme: "charge", kind: "matrix", title: "AG à tenir par mois et par état", viz: "stacked", vizes: ["stacked", "bar", "table"], dims: ["forme", "periode"], dir: "fwd", src: SRC.dpj,
    kw: ["ag par etat", "etat des ag", "avancement des ag", "ag a preparer", "charge par etat"],
    rule: AG_RULE + " État : à préparer (aucune formalité d'approbation), formulaire commencé, documents générés ou plus (décision encore à venir ou non datée).",
    cov: covClot,
    compute: function (ctx) {
      var ms = fwd(per(ctx));
      var rows = agSeries(ctx, ms);
      var ks = ["prep", "form", "gen"];
      var bs = ks.map(function (k) { return rows.map(function (l) { return l.filter(function (x) { return !x.s.civ && x.a.etat === k; }); }); });
      var civ = onlyCiv(rows);
      var names = [ETATS.prep, ETATS.form, ETATS.gen];
      var tones = ["primary", "accent", "mint"];
      if (sum(lens(civ))) {
        bs.push(civ);
        names.push("Sociétés civiles, règle à valider");
        tones.push("n1");
      }
      return {
        kind: "matrix", stacked: true, hideZeros: true, categories: cats(ms), titles: longs(ms), months: ms,
        series: bs.map(function (b, i) { return { name: names[i], values: lens(b), tone: tones[i] }; }),
        rows: function (si, ci) {
          var pick = si == null ? [].concat.apply([], bs.map(function (b) { return ci == null ? [].concat.apply([], b) : b[ci]; })) : ci == null ? [].concat.apply([], bs[si]) : bs[si][ci];
          return pick.map(function (x) { return agRow(x.s, x.a); });
        },
      };
    },
  });
  ind("ag_mois_forme", {
    group: "ec", theme: "charge", kind: "matrix", title: "AG à tenir par mois et par forme", viz: "stacked", vizes: ["stacked", "bar", "table"], dims: ["forme", "periode"], dir: "fwd", src: SRC.dpj,
    kw: ["ag par forme", "ag par mois et par forme", "charge par forme"],
    rule: AG_RULE,
    cov: covClot,
    compute: function (ctx) {
      var ms = fwd(per(ctx));
      var rows = agSeries(ctx, ms);
      var groups = ["SAS", "SARL", "SA", "SELARL", "Sociétés civiles"];
      var names = ["SAS", "SARL", "SA", "SELARL", "Sociétés civiles, règle à valider"];
      var tones = ["primary", "soft", "accent", "muted", "n1"];
      var by = groups.map(function (g) { return rows.map(function (l) { return l.filter(function (x) { return grpForme(x.s.f) === g; }); }); });
      var keep = by.map(function (b) { return sum(lens(b)) > 0; });
      var gi = groups.map(function (g, i) { return i; }).filter(function (i) { return keep[i]; });
      var bs = gi.map(function (i) { return by[i]; });
      return {
        kind: "matrix", stacked: true, hideZeros: true, categories: cats(ms), titles: longs(ms), months: ms,
        series: gi.map(function (i, k) { return { name: names[i], values: lens(bs[k]), tone: tones[i] }; }),
        rows: function (si, ci) {
          var pick = si == null ? [].concat.apply([], bs.map(function (b) { return ci == null ? [].concat.apply([], b) : b[ci]; })) : ci == null ? [].concat.apply([], bs[si]) : bs[si][ci];
          return pick.map(function (x) { return agRow(x.s, x.a); });
        },
      };
    },
  });
  ind("depots_mois", {
    group: "ec", theme: "charge", kind: "series", title: "Dépôts des comptes à faire", sub: "Par mois", viz: "bar", vizes: ["bar", "line", "table"], dims: ["forme", "periode"], dir: "fwd", src: SRC.dpj,
    kw: ["depots des comptes", "depots a faire", "depot des comptes par mois", "depots"],
    rule: "Sociétés commerciales. Échéance de dépôt : deux mois après la décision d'approbation quand elle est connue et valable (documents générés ou plus) ; sinon deux mois après l'échéance de l'AG (repère au plus tard). Sociétés civiles exclues (pas de dépôt des comptes).",
    cov: covClot,
    compute: function (ctx) {
      var ms = fwd(per(ctx));
      var rows = ms.map(function (mo) {
        var out = [];
        socs(ctx).forEach(function (s) {
          var d = depIn(s, mo.idx);
          if (d) out.push(socRow(s, "Exercice clos le " + fmt(d.clos) + (d.dec ? " · décision du " + fmt(d.dec) : "") + " · dépôt avant le " + fmt(d.due) + (d.estime ? " (repère au plus tard)" : ""), { href: d.dec ? "suivi-actions.html" : "societe.html", action: d.dec ? "Voir le dépôt" : "Voir la société" }));
        });
        return out;
      });
      return {
        kind: "series", categories: cats(ms), titles: longs(ms), months: ms,
        series: [{ name: "Dépôts à faire", values: rows.map(function (r) { return r.length; }), tone: "primary" }],
        rows: function (si, ci) { return ci == null ? [].concat.apply([], rows) : rows[ci]; },
      };
    },
  });
  ind("echeances", {
    group: "ec", theme: "charge", kind: "list", title: "Prochaines échéances", sub: "Les 10 plus proches", viz: "list", vizes: ["list"], dims: ["forme"], src: SRC.dpj,
    kw: ["prochaines echeances", "echeances", "calendrier", "a venir"],
    rule: "AG à tenir (six mois après la clôture), dépôts des comptes dont la décision est connue (deux mois après) et décisions ou signatures prévues dans les formalités, à partir du " + fmt(TODAY) + ". Sociétés civiles signalées : règle à valider.",
    cov: covClot,
    compute: function (ctx) {
      var all = echeances(ctx);
      return {
        kind: "list", columns: ["Date", "Société", "Échéance"],
        items: all.slice(0, 10).map(function (x) { return { date: fmt(x.d), title: x.soc, forme: x.forme, label: x.label, href: x.href, action: x.action }; }),
        total: all.length,
        rows: function () { return all.map(function (x) { return { title: x.soc, forme: x.forme, meta: fmt(x.d) + " · " + x.label, href: x.href, action: x.action }; }); },
      };
    },
  });
  function missingRows(ctx) {
    return socs(ctx).filter(function (s) { return !s.cl; }).map(function (s) {
      return socRow(s, s.crea ? "En cours de création" : "Date de clôture absente du DPJ", { action: "Compléter la fiche" });
    });
  }
  ind("dpj_couverture", {
    group: "ec", theme: "vigilance", kind: "gauge", title: "Dates de clôture renseignées", sub: "Qualité du DPJ", viz: "gauge", vizes: ["gauge"], dims: ["forme"], src: "DPJ, date de clôture",
    kw: ["couverture", "qualite du dpj", "dates de cloture renseignees", "completude"],
    rule: "Part des sociétés dont la date de clôture est renseignée au DPJ. Sans elle, aucune échéance d'AG ni de dépôt n'est calculable : ces sociétés sont listées, jamais comptées en silence.",
    cov: covClot,
    compute: function (ctx) {
      var all = socs(ctx);
      var missing = missingRows(ctx);
      return {
        kind: "gauge", value: all.length - missing.length, max: all.length, label: missing.length + " non " + pl(missing.length, "calculable", "calculables"), missing: missing.length,
        rows: function () { return missing; },
      };
    },
  });
  ind("dpj_sans_cloture", {
    group: "ec", theme: "vigilance", kind: "kpi", title: "Sociétés sans date de clôture", dims: ["forme"], src: "DPJ, date de clôture",
    kw: ["sans date de cloture", "dates de cloture manquantes", "non calculables", "cloture manquante", "manquants"],
    rule: "Société sans date de clôture au DPJ : ni échéance d'AG ni dépôt calculable. Sociétés en cours de création comprises.",
    cov: covClot,
    compute: function (ctx) {
      var r = missingRows(ctx);
      return { value: r.length, display: nf(r.length), delta: null, sub: "sur " + socs(ctx).length + " sociétés", spark: null, alert: r.length > 0, rows: function () { return r; } };
    },
  });

  /* ===== Vigilance et conformité ===== */
  ind("retards_legaux", {
    group: "ec", theme: "vigilance", kind: "kpi", title: "Retards légaux", dims: ["forme"], src: SRC.dpj + " ; " + SRC.dep,
    kw: ["retards legaux", "retards", "en retard", "hors delai et depots en retard"],
    rule: "AG hors délai (AG suivie dans EJ, échéance dépassée sans décision valable, ou décision postérieure à l'échéance) et dépôts des comptes en retard (décision valable connue, comptes non déposés deux mois après). Exercice de la campagne, sociétés commerciales. Les AG non suivies dans EJ n'y sont pas : elles sont à vérifier, pas en retard.",
    cov: covClot,
    compute: function (ctx) {
      var v = vigilance(ctx);
      var t = v.ag.rows.length + v.dep.rows.length;
      return {
        value: t, display: nf(t), delta: null, sub: "dont " + v.ag.rows.length + " AG hors délai", spark: null, alert: t > 0,
        rows: function () { return v.ag.rows.concat(v.dep.rows); },
      };
    },
  });
  ind("vig_points", {
    group: "ec", theme: "vigilance", kind: "cat", title: "Points de vigilance", viz: "barh", vizes: ["barh", "bar", "table"], dims: ["forme"], src: SRC.dpj + " ; " + SRC.lab + " ; " + SRC.lm,
    kw: ["points de vigilance", "vigilance", "alertes", "a verifier"],
    rule: "AG non suivies dans EJ (échéance dépassée, aucune formalité d'approbation dans EJ pour l'exercice ; repli pour les sociétés sans date de clôture : approuvées dans EJ l'an dernier, rien cette année) ; dossiers LAB à revoir (revue échue, pièces manquantes, dossier à ouvrir) ; lettres de mission non signées. Les retards légaux sont comptés à part.",
    cov: function (ctx) { return covClot(ctx) + " " + COV_EJM; },
    compute: function (ctx) {
      var v = vigilance(ctx);
      var l = [v.ns, v.lab, v.lm];
      var r = catResult(l.map(function (x) { return x.label; }), ["info", "warning", "attention"], l.map(function (x) { return x.rows; }));
      r.useTones = true;
      return r;
    },
  });
  ind("ag_non_suivies", {
    group: "ec", theme: "vigilance", kind: "cat", title: "AG non suivies dans EJ", sub: "À vérifier", viz: "barh", vizes: ["barh", "bar", "table"], dims: ["forme"], src: SRC.dpj + " ; " + SRC.form,
    kw: ["ag non suivies", "non suivies dans ej", "ag non suivie", "approuvees l'an dernier", "sans approbation"],
    rule: "Exercice de la campagne, échéance dépassée, aucune formalité d'approbation dans EJ pour l'exercice : l'AG a pu se tenir hors d'EJ, elle n'est donc ni comptée tenue ni hors délai. Repli quand la date de clôture manque : société approuvée dans EJ l'an dernier, sans approbation depuis douze mois. Sociétés civiles exclues : règle à valider.",
    cov: covClot,
    compute: function (ctx) {
      var v = vigilance(ctx);
      return catResult(["Suivies l'an dernier", "Sans historique EJ", "Sans clôture (repli)"], ["primary", "soft", "muted"], v.ns.parts, { useTones: true });
    },
  });
  ind("ag_hors_delai", {
    group: "ec", theme: "vigilance", kind: "kpi", title: "AG hors délai", dims: ["forme"], src: SRC.dpj,
    kw: ["ag hors delai", "ag en retard", "assemblees en retard"],
    rule: "Exercice de la campagne (clos entre le 01/07/2025 et le 30/06/2026), AG suivie dans EJ : échéance dépassée sans décision valable (documents générés ou plus), ou décision postérieure à l'échéance. Une prorogation accordée n'est pas connue d'EJ.",
    cov: covClot,
    compute: function (ctx) {
      var r = vigilance(ctx).ag.rows;
      return { value: r.length, display: nf(r.length), delta: null, sub: "exercice de la campagne", spark: null, alert: r.length > 0, rows: function () { return r; } };
    },
  });
  ind("depots_retard", {
    group: "ec", theme: "vigilance", kind: "kpi", title: "Dépôts en retard", dims: ["forme"], src: SRC.dpj,
    kw: ["depots en retard", "retard de depot"],
    rule: "Décision d'approbation valable connue (documents générés ou plus), comptes non déposés deux mois après.",
    cov: covClot,
    compute: function (ctx) {
      var r = vigilance(ctx).dep.rows;
      return { value: r.length, display: nf(r.length), delta: null, sub: "délai de dépôt dépassé", spark: null, alert: r.length > 0, rows: function () { return r; } };
    },
  });
  ind("lab_risque", {
    group: "ec", theme: "vigilance", kind: "cat", title: "Dossiers LAB par niveau de risque", viz: "donut", vizes: ["donut", "bar", "barh", "table"], dims: ["forme"], src: SRC.lab,
    kw: ["dossiers lab", "lab par risque", "niveau de risque", "lab", "anti blanchiment", "blanchiment"],
    rule: "Dossiers LAB des clients, par niveau de risque évalué (faible, standard, élevé) ; « non évalué » tant que l'évaluation n'est pas faite.",
    cov: function () { return COV_EJM; },
    compute: function (ctx) {
      var ks = ["faible", "standard", "eleve", null];
      var labels = ["Risque faible", "Risque standard", "Risque élevé", "Non évalué"];
      var by = ks.map(function (k) { return ejms(ctx).filter(function (s) { return s.lab.risque === k; }).map(labRow); });
      var r = catResult(labels, ["mint", "info", "warning", "muted"], by);
      r.center = { value: nf(ejms(ctx).length), label: "dossiers" };
      return r;
    },
  });
  ind("lab_a_revoir", {
    group: "ec", theme: "vigilance", kind: "kpi", title: "Dossiers LAB à revoir", dims: ["forme"], src: SRC.lab,
    kw: ["lab a revoir", "revues lab", "dossiers lab a revoir"],
    rule: "Dossier LAB dont la revue est échue, les pièces incomplètes ou qui reste à ouvrir.",
    cov: function () { return COV_EJM; },
    compute: function (ctx) {
      var r = ejms(ctx).filter(function (s) { return s.lab.statut !== "a_jour"; });
      return { value: r.length, display: nf(r.length), delta: null, sub: "sur " + ejms(ctx).length + " dossiers", spark: null, alert: r.length > 0, rows: function () { return r.map(labRow); } };
    },
  });
  ind("lab_revues_mois", {
    group: "ec", theme: "vigilance", kind: "series", title: "Revues LAB à faire", sub: "Par mois", viz: "bar", vizes: ["bar", "table"], dims: ["forme", "periode"], dir: "fwd", src: SRC.lab,
    kw: ["revues lab par mois", "revues lab", "revues a faire"],
    rule: "Date de prochaine revue du dossier LAB. « Échues » : date dépassée. « À ouvrir ou compléter » : dossier sans revue datée (pièces manquantes, dossier jamais ouvert).",
    cov: function () { return COV_EJM; },
    compute: function (ctx) {
      var ms = fwd(per(ctx));
      var list = ejms(ctx);
      var cs = ["Échues", "À compléter"].concat(cats(ms));
      var rows = [
        list.filter(function (s) { return s.lab.prochaineRevue && parse(s.lab.prochaineRevue) < TODAY; }),
        list.filter(function (s) { return !s.lab.prochaineRevue; }),
      ].concat(ms.map(function (mo) {
        return list.filter(function (s) { return s.lab.prochaineRevue && parse(s.lab.prochaineRevue) >= TODAY && mi(parse(s.lab.prochaineRevue)) === mo.idx; });
      }));
      return {
        kind: "series", categories: cs, titles: ["Revues échues", "Dossiers à ouvrir ou compléter"].concat(longs(ms)),
        series: [{ name: "Revues", values: rows.map(function (r) { return r.length; }), tone: "primary" }],
        highlight: 0, hideZeros: true,
        rows: function (si, ci) { return (ci == null ? [].concat.apply([], rows) : rows[ci]).map(labRow); },
      };
    },
  });
  ind("lm_statut", {
    group: "ec", theme: "vigilance", kind: "cat", title: "Lettres de mission par statut", viz: "bar", vizes: ["bar", "barh", "donut", "table"], dims: ["forme"], src: SRC.lm,
    kw: ["lettres de mission", "lettres non signees", "lettres par statut", "lettre de mission"],
    rule: "Statut de la lettre de mission de chaque client : signée, envoyée pour signature, brouillon, à renouveler (non reconduite), aucune lettre.",
    cov: function () { return COV_EJM; },
    compute: function (ctx) {
      var ks = ["signee", "envoyee", "brouillon", "a_renouveler", "absente"];
      var by = ks.map(function (k) { return ejms(ctx).filter(function (s) { return s.lm.statut === k; }).map(lmRow); });
      return catResult(ks.map(function (k) { return E.LM_STATUT[k]; }), ["mint", "info", "muted", "warning", "attention"], by, { useTones: true });
    },
  });
  ind("lm_non_signees", {
    group: "ec", theme: "vigilance", kind: "kpi", title: "Lettres non signées", dims: ["forme"], src: SRC.lm,
    kw: ["lettres non signees", "lettres de mission non signees", "lettres a signer"],
    rule: "Lettre au statut autre que « Signée » : brouillon, envoyée, à renouveler ou absente.",
    cov: function () { return COV_EJM; },
    compute: function (ctx) {
      var r = ejms(ctx).filter(function (s) { return s.lm.statut !== "signee"; });
      return { value: r.length, display: nf(r.length), delta: null, sub: "sur " + ejms(ctx).length + " clients", spark: null, alert: r.length > 0, rows: function () { return r.map(lmRow); } };
    },
  });

  /* ===== Opérations du jour ===== */
  function depKpi(id, st, title, sub, kw) {
    ind(id, {
      group: "ec", theme: "operations", kind: "kpi", title: title, dims: ["forme", "createur"], src: SRC.dep, kw: kw,
      rule: "Dépôt INPI au statut « " + DEP_ST[st].label + " ».",
      cov: function () { return "Tous les dépôts INPI non terminés du cabinet (" + DEP.length + ")."; },
      compute: function (ctx) {
        var r = deps(ctx).filter(function (d) { return d.st === st; });
        return { value: r.length, display: nf(r.length), delta: null, sub: sub, spark: null, alert: st === "a_signer" && r.length > 0, rows: function () { return r.map(depRow); } };
      },
    });
  }
  depKpi("docs_a_signer", "a_signer", "Documents à signer", "signature à lancer", ["documents a signer", "a signer"]);
  depKpi("en_signature", "sig", "En signature", "signatures en cours", ["en signature", "signatures en cours"]);
  depKpi("prets_a_deposer", "pret", "Prêts à déposer", "au Guichet unique", ["prets a deposer", "a deposer"]);
  ind("form_en_cours", {
    group: "ec", theme: "operations", kind: "kpi", title: "Formalités en cours", dims: ["forme", "createur"], src: SRC.form,
    kw: ["formalites en cours", "formulaires en cours"],
    rule: "Formalité au statut « Formulaire en cours ».",
    cov: function () { return "Toutes les formalités du cabinet (" + FORM_TOTAL + ")."; },
    compute: function (ctx) {
      var r = forms(ctx).filter(function (f) { return f.st === "en_cours"; });
      return { value: r.length, display: nf(r.length), delta: null, sub: "sur " + FORM_TOTAL + " formalités", spark: null, rows: function () { return r.map(formRow); } };
    },
  });
  ind("file_jour", {
    group: "ec", theme: "operations", kind: "list", title: "File du jour", sub: "Une ligne par société", viz: "list", vizes: ["list"], dims: ["forme", "createur"], src: SRC.form + " ; " + SRC.dep,
    kw: ["file du jour", "a faire aujourd'hui", "actions du jour", "liste d'actions"],
    rule: "Dépôts à signer, signatures en cours, dépôts prêts et formulaires en cours, regroupés par société, avec les retards légaux (AG hors délai, dépôt des comptes en retard), même sans opération en cours. Ordre : signatures à lancer, puis retards légaux, puis dépôts prêts, puis le plus ancien.",
    cov: function () { return "Formalités en cours (" + FORM_EN_COURS.length + ") et dépôts INPI non terminés (" + DEP.length + ")."; },
    compute: function (ctx) {
      var g = {};
      function add(soc, k, d, row) {
        var x = (g[soc] = g[soc] || { soc: soc, a_signer: 0, sig: 0, pret: 0, form: 0, agLate: 0, depLate: 0, oldest: TODAY, rows: [] });
        x[k]++;
        if (d < x.oldest) x.oldest = d;
        x.rows.push(row);
      }
      deps(ctx).forEach(function (d) { add(d.soc, d.st, parse(d.date), depRow(d)); });
      forms(ctx).filter(function (f) { return f.st === "en_cours"; }).forEach(function (f) { add(f.soc, "form", f.cree, formRow(f)); });
      var v = vigilance(ctx);
      v.ag.rows.forEach(function (r) { if (!ctx.f.createur || g[r.title]) add(r.title, "agLate", BYNAME[r.title].dl, r); });
      v.dep.rows.forEach(function (r) { if (!ctx.f.createur || g[r.title]) add(r.title, "depLate", BYNAME[r.title].due, r); });
      var list = Object.keys(g).map(function (k) { return g[k]; });
      list.sort(function (a, b) {
        return b.a_signer - a.a_signer || b.agLate + b.depLate - a.agLate - a.depLate || b.pret - a.pret || a.oldest - b.oldest;
      });
      var items = list.map(function (x) {
        var parts = [];
        if (x.agLate) parts.push("AG hors délai");
        if (x.depLate) parts.push("dépôt des comptes en retard");
        if (x.a_signer) parts.push(x.a_signer + " à signer");
        if (x.pret) parts.push(x.pret + " " + pl(x.pret, "prêt", "prêts") + " à déposer");
        if (x.sig) parts.push(x.sig + " en signature");
        if (x.form) parts.push(x.form + " " + pl(x.form, "formulaire", "formulaires") + " en cours");
        var act = x.a_signer ? ["Lancer la signature", "suivi-actions.html"] : x.pret ? ["Déposer", "suivi-actions.html"] : x.sig ? ["Suivre", "suivi-actions.html"] : x.form ? ["Reprendre", "formalite.html"] : ["Créer le dépôt", "formalite.html"];
        return { title: x.soc, forme: (BYNAME[x.soc] || {}).f || "", label: cap1(parts.join(" · ")), date: "", href: act[1], action: act[0], urgent: !!(x.a_signer || x.agLate || x.depLate), rows: x.rows };
      });
      return {
        kind: "list", columns: ["Société", "À faire"], items: items.slice(0, 10), total: items.length, more: { href: "suivi-actions.html", label: "Suivi des actions" },
        rows: function () { return [].concat.apply([], items.map(function (i) { return i.rows; })); },
      };
    },
  });
  ind("sans_mouvement", {
    group: "ec", theme: "operations", kind: "kpi", title: "Ouverts depuis plus de 30 j", dims: ["forme", "createur"], src: SRC.form + " ; " + SRC.dep,
    kw: ["sans mouvement", "ouverts depuis plus de 30 jours", "dossiers bloques", "dossiers dormants"],
    rule: "Formalité au statut « Formulaire en cours » créée il y a plus de 30 jours, ou dépôt INPI non terminé dont le statut date de plus de 30 jours. EJ ne garde pas l'historique des modifications d'une formalité : la date de création sert de repère, pas la dernière modification.",
    cov: function () { return "Formalités en cours (" + FORM_EN_COURS.length + ") et dépôts INPI non terminés (" + DEP.length + ")."; },
    compute: function (ctx) {
      var lim = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - 30);
      var r = forms(ctx).filter(function (f) { return f.st === "en_cours" && f.cree < lim; }).map(formRow)
        .concat(deps(ctx).filter(function (d) { return parse(d.date) < lim; }).map(depRow));
      return { value: r.length, display: nf(r.length), delta: null, sub: "à relancer", spark: null, rows: function () { return r; } };
    },
  });

  /* ===== Missions CAC ===== */
  function covC() {
    return COV_CAC;
  }
  ind("cac_missions", {
    group: "cac", theme: "cac_missions", kind: "kpi", title: "Missions", dims: ["type", "signataire"], src: SRC.cac,
    kw: ["missions", "nombre de missions", "mandats", "entites controlees"],
    rule: "Missions en cours : mandats légaux, audits légaux petites entreprises et audits contractuels. Variation : missions acceptées sur les 12 derniers mois.",
    cov: covC,
    compute: function (ctx) {
      var l = mandats(ctx);
      var lim = new Date(2025, 9, 20);
      var nouv = l.filter(function (m) { return parse(m.nomination || m.lab.ouverture) >= lim; }).length;
      return {
        value: l.length, display: nf(l.length), delta: "+" + nouv + " sur les 12 derniers mois", deltaTone: nouv ? "up" : "flat",
        spark: [2021, 2022, 2023, 2024, 2025, 2026].map(function (y) { return l.filter(function (m) { return m.premier <= y; }).length; }),
        rows: function () { return l.map(function (m) { return mandRow(m, E.TYPE_MANDAT[m.type] + " · exercice clos le " + m.ex.clos); }); },
      };
    },
  });
  ind("cac_honoraires", {
    group: "cac", theme: "cac_missions", kind: "kpi", title: "Honoraires des mandats", sub: "Prévus aux lettres de mission", unit: "eur", dims: ["type", "signataire"], src: SRC.cac + ", honoraires prévus",
    kw: ["honoraires", "honoraires des mandats", "honoraires annuels"],
    rule: "Somme des honoraires annuels prévus au mandat ou à la mission (montant de la lettre de mission CAC). Pas d'historique : pas de tendance.",
    cov: covC,
    compute: function (ctx) {
      var l = mandats(ctx);
      var t = sum(l.map(function (m) { return m.honoraires; }));
      return {
        value: t, display: nf(t) + " €", delta: null, sub: "par an, " + l.length + " " + pl(l.length, "mission", "missions"), spark: null,
        rows: function () { return l.map(function (m) { return mandRow(m, E.euros(m.honoraires) + " par an · " + E.TYPE_MANDAT[m.type]); }); },
      };
    },
  });
  ind("cac_heures_ratio", {
    group: "cac", theme: "cac_missions", kind: "kpi", title: "Heures réalisées", unit: "pct", dims: ["type", "signataire"], src: SRC.cac + ", heures budgétées et réalisées",
    kw: ["heures realisees", "heures sur budget", "consommation des heures", "budget d'heures"],
    rule: "Heures réalisées divisées par les heures budgétées, toutes missions, exercice en cours de contrôle. À lire avec la phase : en planification, peu d'heures sont consommées.",
    cov: covC,
    compute: function (ctx) {
      var l = mandats(ctx);
      var b = sum(l.map(function (m) { return m.ex.heures[0]; }));
      var r = sum(l.map(function (m) { return m.ex.heures[1]; }));
      var pct = b ? Math.round((r / b) * 100) : 0;
      return {
        value: pct, display: pct + " %", delta: null, sub: nf(r) + " h sur " + nf(b) + " h", spark: null, meter: { value: r, max: b },
        rows: function () { return l.map(function (m) { return mandRow(m, m.ex.heures[1] + " h réalisées sur " + m.ex.heures[0] + " h · " + E.PHASE[m.ex.phase]); }); },
      };
    },
  });
  ind("cac_fins", {
    group: "cac", theme: "cac_conf", kind: "kpi", title: "Fins de mandat à préparer", dims: ["type", "signataire"], src: SRC.cac,
    kw: ["fins de mandat", "fin de mandat", "renouvellement", "mandats a renouveler"],
    rule: "Mandat légal ou audit légal petite entreprise dont l'exercice en cours de contrôle est le dernier du mandat : renouvellement ou fin à préparer avant l'AG qui statue sur ces comptes. Audit contractuel exclu.",
    cov: covC,
    compute: function (ctx) {
      var l = mandats(ctx).filter(isFin);
      return {
        value: l.length, display: nf(l.length), delta: null, sub: "AG de 2027", spark: null, alert: l.length > 0,
        rows: function () { return l.map(function (m) { return mandRow(m, "Dernier exercice " + m.dernier + " · AG prévue le " + (m.ag || "non fixée")); }); },
      };
    },
  });
  ind("cac_interv_mois", {
    group: "cac", theme: "cac_missions", kind: "series", title: "Charge d'intervention", sub: "Jours par mois", viz: "bar", vizes: ["bar", "table"], dims: ["type", "signataire", "periode"], dir: "fwd", unit: "j", src: SRC.cac + ", interventions",
    kw: ["charge d'intervention", "jours d'intervention", "interventions par mois", "interventions", "charge cac"],
    rule: "Jours ouvrés (lundi au vendredi) des interventions faites, en cours ou prévues, comptés dans chaque mois. L'acceptation d'une mission n'est pas une intervention. Au-delà du dernier mois planifié : « Non planifié », jamais zéro.",
    cov: covC,
    compute: function (ctx) {
      var ms = fwd(per(ctx));
      var last = -1;
      mandats(ctx).forEach(function (m) {
        m.interventions.forEach(function (iv) {
          if (!/^Acceptation/.test(iv[0])) last = Math.max(last, mi(parse(iv[2])));
        });
      });
      var data = ms.map(function (mo) {
        var rows = [];
        var j = 0;
        mandats(ctx).forEach(function (m) {
          m.interventions.forEach(function (iv) {
            if (/^Acceptation/.test(iv[0])) return;
            var n = joursIn(iv, mo.idx);
            if (n) {
              j += n;
              rows.push(mandRow(m, iv[0] + " · du " + iv[1] + " au " + iv[2] + " · " + n + " " + pl(n, "jour", "jours") + " dans le mois"));
            }
          });
        });
        return { j: j, rows: rows };
      });
      return {
        kind: "series", categories: cats(ms), titles: longs(ms), months: ms, nullLabel: "Non planifié",
        series: [{ name: "Jours d'intervention", values: data.map(function (d, i) { return ms[i].idx > last ? null : d.j; }), tone: "primary" }],
        rows: function (si, ci) { return ci == null ? [].concat.apply([], data.map(function (d) { return d.rows; })) : data[ci].rows; },
      };
    },
  });
  ind("cac_heures_mission", {
    group: "cac", theme: "cac_missions", kind: "matrix", title: "Heures budget et réalisées", sub: "Par mission", viz: "barh", vizes: ["barh", "bar", "table"], dims: ["type", "signataire"], unit: "h", src: SRC.cac + ", heures",
    kw: ["heures par mission", "heures budget", "budget et realise", "depassement", "heures"],
    rule: "Heures budgétées et réalisées sur l'exercice en cours de contrôle, par mission. Mission au-delà du budget mise en avant.",
    cov: covC,
    compute: function (ctx) {
      var l = mandats(ctx);
      var over = -1;
      l.forEach(function (m, i) { if (over < 0 && m.ex.heures[1] > m.ex.heures[0]) over = i; });
      return {
        kind: "matrix", categories: l.map(function (m) { return m.nom; }),
        series: [
          { name: "Budget", values: l.map(function (m) { return m.ex.heures[0]; }), tone: "n1" },
          { name: "Réalisées", values: l.map(function (m) { return m.ex.heures[1]; }), tone: "primary" },
        ],
        highlight: over >= 0 ? over : null, highlightSeries: over >= 0 ? "Réalisées" : null,
        rows: function (si, ci) {
          var sel = ci == null ? l : [l[ci]];
          return sel.map(function (m) { return mandRow(m, m.ex.heures[1] + " h réalisées sur " + m.ex.heures[0] + " h · " + E.PHASE[m.ex.phase] + (m.ex.heures[1] > m.ex.heures[0] ? " · au-delà du budget" : "")); });
        },
      };
    },
  });
  ind("cac_types", {
    group: "cac", theme: "cac_missions", kind: "cat", title: "Missions par type", viz: "donut", vizes: ["donut", "bar", "barh", "table"], dims: ["type", "signataire"], src: SRC.cac,
    kw: ["missions par type", "type de mission", "types de mission", "repartition des missions"],
    rule: "Missions par type : mandat légal (six exercices), audit légal petite entreprise (trois exercices), audit contractuel.",
    cov: covC,
    compute: function (ctx) {
      var ks = ["legal", "alpe", "contractuel"];
      var lab = ["Mandat légal", "Audit légal petite entreprise", "Audit contractuel"];
      var by = ks.map(function (k) { return mandats(ctx).filter(function (m) { return m.type === k; }).map(function (m) { return mandRow(m, E.TYPE_MANDAT[m.type]); }); });
      var r = catResult(lab, ["primary", "info", "mint"], by);
      r.center = { value: nf(mandats(ctx).length), label: "missions" };
      return r;
    },
  });
  ind("cac_phases", {
    group: "cac", theme: "cac_missions", kind: "cat", title: "Avancement de la campagne", sub: "Missions par phase", viz: "barh", vizes: ["barh", "bar", "table"], dims: ["type", "signataire"], src: SRC.cac + ", phase",
    kw: ["avancement de la campagne", "phases", "par phase", "avancement cac"],
    rule: "Nombre de missions par phase de l'exercice en cours de contrôle, dans l'ordre de la campagne : acceptation, planification, intérim, final, rapports, rapports émis.",
    cov: covC,
    compute: function (ctx) {
      var ks = ["acceptation", "planification", "interim", "final", "rapports", "emis"];
      var by = ks.map(function (k) { return mandats(ctx).filter(function (m) { return m.ex.phase === k; }).map(function (m) { return mandRow(m, E.PHASE[k] + " · avancement " + m.ex.avancement + " %"); }); });
      return catResult(ks.map(function (k) { return E.PHASE[k]; }), ks.map(function () { return "primary"; }), by);
    },
  });
  ind("cac_echeances_mois", {
    group: "cac", theme: "cac_conf", kind: "matrix", title: "AG et fins de mandat", sub: "Par mois", viz: "stacked", vizes: ["stacked", "bar", "table"], dims: ["type", "signataire", "periode"], dir: "fwd", src: SRC.cac + ", date d'AG",
    kw: ["echeances cac", "ag et fins de mandat", "ag cac", "assemblees cac"],
    rule: "AG d'approbation prévues des entités contrôlées, et fins de mandat (AG qui statue sur le dernier exercice du mandat). Missions sans date d'AG listées à part dans le popover.",
    cov: function (ctx) {
      var sans = mandats(ctx).filter(function (m) { return !m.ag; }).length;
      return COV_CAC + (sans ? " " + sans + " sans date d'AG." : "");
    },
    compute: function (ctx) {
      var ms = fwd(per(ctx));
      var ag = ms.map(function (mo) { return mandats(ctx).filter(function (m) { return m.ag && mi(parse(m.ag)) === mo.idx && !isFin(m); }); });
      var fin = ms.map(function (mo) { return mandats(ctx).filter(function (m) { return m.ag && mi(parse(m.ag)) === mo.idx && isFin(m); }); });
      function rr(m) {
        return mandRow(m, "AG prévue le " + m.ag + (isFin(m) ? " · fin de mandat" : ""));
      }
      var src = [ag, fin];
      return {
        kind: "matrix", stacked: true, hideZeros: true, categories: cats(ms), titles: longs(ms), months: ms,
        series: [
          { name: "AG d'approbation", values: ag.map(function (l) { return l.length; }), tone: "primary" },
          { name: "Fin de mandat", values: fin.map(function (l) { return l.length; }), tone: "attention" },
        ],
        rows: function (si, ci) {
          var sets = si == null ? src : [src[si]];
          return [].concat.apply([], sets.map(function (s) { return ci == null ? [].concat.apply([], s) : s[ci]; })).map(rr);
        },
      };
    },
  });
  ind("cac_fins_annee", {
    group: "cac", theme: "cac_conf", kind: "cat", title: "Fins de mandat par année", viz: "bar", vizes: ["bar", "barh", "table"], dims: ["type", "signataire"], src: SRC.cac,
    kw: ["fins de mandat par annee", "fins de mandat", "mandats par annee"],
    rule: "Dernier exercice du mandat (mandats légaux et audits légaux petites entreprises). Audit contractuel exclu.",
    cov: covC,
    compute: function (ctx) {
      var ys = [2026, 2027, 2028, 2029, 2030];
      var by = ys.map(function (y) { return mandats(ctx).filter(function (m) { return m.type !== "contractuel" && m.dernier === y; }).map(function (m) { return mandRow(m, "Dernier exercice " + m.dernier + " · " + E.TYPE_MANDAT[m.type]); }); });
      return catResult(ys.map(String), ys.map(function (y, i) { return i === 0 ? "attention" : "primary"; }), by);
    },
  });
  ind("cac_indep", {
    group: "cac", theme: "cac_conf", kind: "cat", title: "Déclarations d'indépendance", viz: "donut", vizes: ["donut", "bar", "table"], dims: ["type", "signataire"], src: SRC.cac + ", indépendance",
    kw: ["independance", "declarations d'independance"],
    rule: "Déclaration annuelle d'indépendance de l'équipe de mission : à jour, à renouveler, à faire.",
    cov: covC,
    compute: function (ctx) {
      var ks = ["a_jour", "a_renouveler", "a_faire"];
      var by = ks.map(function (k) { return mandats(ctx).filter(function (m) { return m.independance.statut === k; }).map(function (m) { return mandRow(m, E.INDEP[k] + (m.independance.date ? " · " + m.independance.date : "")); }); });
      var r = catResult(["À jour", "À renouveler", "À faire"], ["mint", "warning", "attention"], by);
      r.center = { value: nf(mandats(ctx).length), label: "missions" };
      return r;
    },
  });
  ind("cac_lm", {
    group: "cac", theme: "cac_conf", kind: "cat", title: "Lettres de mission CAC", viz: "donut", vizes: ["donut", "bar", "table"], dims: ["type", "signataire"], src: SRC.cac + ", lettres de mission",
    kw: ["lettres de mission cac", "lettres cac", "lettre de mission cac"],
    rule: "Lettre de mission CAC : signée, envoyée pour signature, à établir (après l'acceptation de la mission).",
    cov: covC,
    compute: function (ctx) {
      var ks = ["signee", "envoyee", "a_etablir"];
      var lab = ["Signée", "Envoyée", "À établir"];
      var by = ks.map(function (k, i) { return mandats(ctx).filter(function (m) { return m.lm.statut === k; }).map(function (m) { return mandRow(m, lab[i] + (m.lm.ref ? " · " + m.lm.ref : "")); }); });
      var r = catResult(lab, ["mint", "info", "attention"], by);
      r.center = { value: nf(mandats(ctx).length), label: "missions" };
      return r;
    },
  });
  ind("cac_lab_risque", {
    group: "cac", theme: "cac_conf", kind: "cat", title: "LAB des entités contrôlées", sub: "Par niveau de risque", viz: "donut", vizes: ["donut", "bar", "barh", "table"], dims: ["type", "signataire"], src: SRC.lab + ", entités contrôlées",
    kw: ["lab des entites", "lab cac", "dossiers lab des entites controlees", "risque des entites"],
    rule: "Dossiers LAB des entités contrôlées, par niveau de risque évalué. Comptés à part des dossiers LAB des clients EC.",
    cov: covC,
    compute: function (ctx) {
      var ks = ["faible", "standard", "eleve", null];
      var by = ks.map(function (k) { return mandats(ctx).filter(function (m) { return m.lab.risque === k; }).map(function (m) { return mandRow(m, (k ? E.RISQUE[k] : "Risque non évalué") + " · " + E.LAB_STATUT[m.lab.statut]); }); });
      var r = catResult(["Risque faible", "Risque standard", "Risque élevé", "Non évalué"], ["mint", "info", "warning", "muted"], by);
      r.center = { value: nf(mandats(ctx).length), label: "dossiers" };
      return r;
    },
  });

  /* Intertitre du canevas (aucun calcul) : sépare les indicateurs CAC sur la Vue d'ensemble en profil mixte */
  ind("section_cac", {
    group: "cac", theme: "cac_missions", kind: "heading", title: "Commissariat aux comptes", hidden: true, dims: [], src: "", kw: [], rule: "", cov: function () { return ""; },
    compute: function () { return { kind: "heading" }; },
  });

  /* ---------- Tableaux par défaut ---------- */
  function W(ind, size, viz, params) {
    return { ind: ind, size: size, viz: viz || null, params: params || null };
  }
  var BOARDS = [
    { id: "ec_vue", group: "ec", title: "Vue d'ensemble", icon: "layout_dashboard", widgets: [
      W("soc_suivies", "S"), W("form_ouvertes", "S"), W("ag_6m", "S"), W("retards_legaux", "S"),
      W("ag_mois", "M"), W("form_mois", "M"), W("portefeuille_forme", "M"), W("ops_statut", "M"), W("vig_points", "M"), W("form_types", "M"),
      /* visibles en profil mixte seulement */
      W("section_cac", "L"), W("cac_missions", "S"), W("cac_fins", "S"),
    ] },
    { id: "ec_charge", group: "ec", title: "Charge juridique", icon: "calendar", widgets: [
      W("ag_mois_etat", "L"), W("depots_mois", "M"), W("dpj_couverture", "M"), W("echeances", "L"),
    ] },
    { id: "ec_vigilance", group: "ec", title: "Vigilance et conformité", icon: "shield_check", widgets: [
      W("ag_hors_delai", "S"), W("depots_retard", "S"), W("lab_a_revoir", "S"), W("lm_non_signees", "S"),
      W("ag_non_suivies", "M"), W("dpj_couverture", "M"), W("lab_risque", "M"), W("lab_revues_mois", "M"), W("lm_statut", "L"),
    ] },
    { id: "ec_file", group: "ec", title: "File du jour", icon: "list_checks", widgets: [
      W("docs_a_signer", "S"), W("prets_a_deposer", "S"), W("form_en_cours", "S"), W("sans_mouvement", "S"), W("file_jour", "L"),
    ] },
    { id: "cac_vue", group: "cac", title: "Vue d'ensemble CAC", icon: "briefcase", widgets: [
      W("cac_missions", "S"), W("cac_honoraires", "S"), W("cac_heures_ratio", "S"), W("cac_fins", "S"),
      W("cac_interv_mois", "M"), W("cac_echeances_mois", "M"), W("cac_types", "M"), W("cac_phases", "M"), W("cac_heures_mission", "L"),
    ] },
    { id: "cac_mandats", group: "cac", title: "Mandats et indépendance", icon: "file_pen_line", widgets: [
      W("cac_fins_annee", "M"), W("cac_indep", "M"), W("cac_lm", "M"), W("cac_lab_risque", "M"),
    ] },
  ];

  /* ---------- Masquage des noms avant envoi au modèle ----------
     Sociétés du portefeuille, entités contrôlées, utilisateurs du cabinet, et noms propres non reconnus
     (par précaution). fold() garde la longueur : les positions trouvées s'appliquent au texte saisi. */
  function fold(s) {
    var o = "";
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (c === "’" || c === "‘") c = "'";
      o += c.normalize("NFD").charAt(0).toLowerCase().charAt(0);
    }
    return o;
  }
  var FORME_TOK = ["sas", "sarl", "sa", "sci", "scp", "sccv", "selarl", "sasu", "eurl", "demo"];
  var PATS = (function () {
    var pats = [];
    var seen = {};
    function add(txt, type, id, cap) {
      var p = fold(txt).replace(/[^a-z0-9+]+$/, "").replace(/\s+/g, " ").trim();
      if (p.length < 2 || seen[type + "|" + p]) return;
      seen[type + "|" + p] = 1;
      pats.push({ p: p, type: type, id: id, cap: !!cap });
    }
    var names = SOC.map(function (s) { return s.n; });
    E.societes.concat(E.mandats).forEach(function (s) {
      if (names.indexOf(s.nom) === -1) names.push(s.nom);
    });
    names.push("ARVEL AUDIT");
    names.forEach(function (n) {
      add(n, "soc", n);
      var tok = fold(n).replace(/[^a-z0-9+&' ]/g, " ").split(/\s+/).filter(Boolean);
      while (tok.length && FORME_TOK.indexOf(tok[0]) !== -1) tok.shift();
      while (tok.length && FORME_TOK.indexOf(tok[tok.length - 1]) !== -1) tok.pop();
      var alias = tok.join(" ");
      if (alias.length >= 4 && alias !== fold(n)) add(alias, "soc", n);
    });
    PEOPLE.forEach(function (p) {
      var parts = p.split(" ");
      add(p, "per", p);
      add(parts[parts.length - 1], "per", p);
      add(parts[0], "per", p, true); /* prénom seul : seulement avec majuscule */
    });
    return pats.sort(function (a, b) { return b.p.length - a.p.length; });
  })();
  function isAN(c) {
    return !!c && /[a-z0-9]/.test(c);
  }
  function findSpans(raw) {
    var f = fold(raw);
    var spans = [];
    PATS.forEach(function (pt) {
      var from = 0;
      var i;
      while ((i = f.indexOf(pt.p, from)) !== -1) {
        var j = i + pt.p.length;
        from = i + 1;
        if (isAN(f.charAt(i - 1)) || isAN(f.charAt(j))) continue;
        if (pt.cap && raw.charAt(i) === raw.charAt(i).toLowerCase()) continue;
        if (spans.some(function (s) { return i < s.e && j > s.s; })) continue;
        spans.push({ s: i, e: j, type: pt.type, id: pt.id });
      }
    });
    return spans.sort(function (a, b) { return a.s - b.s; });
  }
  var MOIS_N = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
  var KNOWN_UP = ["ag", "agoa", "age", "sas", "sasu", "sarl", "eurl", "sa", "sci", "scp", "sccv", "selarl", "lab", "cac", "inpi", "dpj", "ej", "tva", "ppe", "ia", "rne", "cir", "siren", "siret", "iban", "ape", "naf", "rcs", "ca", "t1", "t2", "t3", "t4", "lm", "be", "kpi", "n-1", "ec", "alpe", "lcb-ft", "lcb"];
  var KNOWN_CAP = MOIS_N.concat(["guichet", "express", "juridique", "cockpit", "campagne", "depot", "depots", "formalite", "formalites", "signature", "signatures", "societe", "societes", "lettre", "lettres", "mission", "missions", "echeance", "echeances", "assemblee", "approbation", "comptes", "dossier", "dossiers", "associe", "collaborateur", "vigilance", "conformite", "tableau", "charge", "portefeuille", "vue", "ensemble", "n", "file", "jour", "mandats", "mandat", "independance", "risque", "activite", "n-1",
    "audit", "audits", "heures", "phase", "phases", "honoraires", "intervention", "interventions", "suivi", "pilotage", "synthese", "direction", "equipe",
    "controle", "qualite", "retard", "retards", "commissariat", "expertise", "comptable", "operation", "operations", "budget", "points", "point", "nouveau",
    "tableaux", "fin", "fins", "renouvellement", "client", "clients", "relance", "relances", "priorites", "urgences", "semaine", "mois", "annee", "trimestre",
    "lettres", "revues", "revue", "conformite", "legal", "legaux", "annuel", "annuels", "assemblees", "creations", "constitution", "constitutions", "statuts"]);
  function residualSpans(raw, spans) {
    var out = [];
    var re = /[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9'’.&+-]*/g;
    var m;
    while ((m = re.exec(raw))) {
      var s = m.index;
      var w = m[0].replace(/[.'’-]+$/, "");
      var e = s + w.length;
      if (spans.some(function (x) { return s < x.e && e > x.s; })) continue;
      var fw = fold(w);
      var letters = w.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, "");
      if (!letters) continue;
      var allUp = letters.length >= 2 && letters === letters.toUpperCase();
      var cap = letters.charAt(0) !== letters.charAt(0).toLowerCase();
      var before = raw.slice(0, s).replace(/\s+$/, "");
      var start = !before || /[.?!:«"]$/.test(before);
      var suspect = (allUp && KNOWN_UP.indexOf(fw) === -1) || (cap && !allUp && !start && KNOWN_CAP.indexOf(fw) === -1);
      if (!suspect) continue;
      var last = out[out.length - 1];
      if (last && /^\s+$/.test(raw.slice(last.e, s))) last.e = e;
      else out.push({ s: s, e: e, type: "nom" });
    }
    out.forEach(function (o) { o.id = fold(raw.slice(o.s, o.e)); });
    return out;
  }
  /* Identifiants et coordonnées, masqués par expression régulière avant les noms */
  var RX = [
    { re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g, id: "email", lab: "e-mail" },
    { re: /\b[A-Za-z]{2}\d{2}(?:[ ]?[A-Za-z0-9]{4}){3,7}(?:[ ]?[A-Za-z0-9]{1,3})?\b/g, id: "iban", lab: "IBAN" },
    { re: /(?:\+33[ .-]?|\b0)[1-9](?:[ .-]?\d{2}){4}\b/g, id: "téléphone", lab: "téléphone" },
    { re: /\b\d{3}[ .]?\d{3}[ .]?\d{3}(?:[ .]?\d{5})?\b/g, id: "siren", lab: "SIREN ou SIRET" },
  ];
  function patSpans(raw) {
    var out = [];
    RX.forEach(function (x) {
      x.re.lastIndex = 0;
      var m;
      while ((m = x.re.exec(raw))) {
        var s0 = m.index;
        var e0 = s0 + m[0].length;
        if (x.id === "iban" && !/\d{4}/.test(m[0].replace(/\s/g, "").slice(4))) continue;
        if (!out.some(function (o) { return s0 < o.e && e0 > o.s; })) out.push({ s: s0, e: e0, type: "pat", id: x.id, lab: x.lab });
      }
    });
    return out;
  }
  /* Renvoie des morceaux { t: texte } ou { m: "[société 1]" } : la page les échappe et les met en forme. */
  function mask(raw) {
    var pats = patSpans(raw);
    var spans = pats.concat(findSpans(raw).filter(function (sp) { return !pats.some(function (o) { return sp.s < o.e && sp.e > o.s; }); }));
    spans = spans.concat(residualSpans(raw, spans)).sort(function (a, b) { return a.s - b.s; });
    var num = { soc: {}, per: {}, nom: {} };
    var cnt = { soc: 0, per: 0, nom: 0, pat: 0 };
    var lab = { soc: "société", per: "personne", nom: "nom" };
    var parts = [];
    var last = 0;
    var found = [];
    spans.forEach(function (sp) {
      if (sp.s > last) parts.push({ t: raw.slice(last, sp.s) });
      if (sp.type === "pat") {
        cnt.pat++;
        parts.push({ m: "[" + sp.id + "]" });
      } else {
        if (!num[sp.type][sp.id]) num[sp.type][sp.id] = ++cnt[sp.type];
        parts.push({ m: "[" + lab[sp.type] + " " + num[sp.type][sp.id] + "]" });
      }
      found.push({ type: sp.type, id: sp.id, lab: sp.lab || null, text: raw.slice(sp.s, sp.e), s: sp.s, e: sp.e });
      last = sp.e;
    });
    if (last < raw.length) parts.push({ t: raw.slice(last) });
    return { parts: parts, soc: cnt.soc, per: cnt.per, nom: cnt.nom, pat: cnt.pat, found: found, text: parts.map(function (p) { return p.t || p.m; }).join("") };
  }

  window.EJC = {
    TODAY: TODAY, CALC: CALC, MOIS: MOIS, MOIS_C: MOIS_C, MOIS_N: MOIS_N, CUR: CUR,
    fmt: fmt, parse: parse, month: month, back: back, fwd: fwd, nf: nf, pl: pl, fold: fold,
    FORMES: FORMES, CIVILES: CIVILES, CREATEURS: CREATEURS, PEOPLE: PEOPLE,
    TYPES_MISSION: { legal: "Mandat légal", alpe: "Audit légal petite entreprise", contractuel: "Audit contractuel" },
    SIGNATAIRES: (function () {
      var o = {};
      E.mandats.forEach(function (m) { o[m.signataire] = E.equipe[m.signataire].nom; });
      return o;
    })(),
    soc: SOC, byName: BYNAME, formalites: FORMS, depots: DEP, plan: PLAN,
    totals: { societes: TOTAL, formalites: FORM_TOTAL, enCours: FORM_EN_COURS.length },
    agIn: agIn, IND: IND, THEMES: THEMES, BOARDS: BOARDS, mask: mask, ETATS: ETATS,
  };
})();
