/* Express Juridique · Lifting 2026 · Logique LAB partagée
   Utilisée par lab.html (file de travail) et lab-dossier.html (onglet Vigilance LAB).
   - fiches d'identification fictives (siège, capital, dirigeant, bénéficiaires effectifs)
   - règle unique des pièces attendues : reprises d'EJ (non demandées) et pièces demandées au client
   - revues validées pendant la session (sessionStorage « ej-lab-revues »), demandes de validation (« ej-lab-demandes »)
   - levées d'homonymie sur le gel des avoirs (sessionStorage « ej-lab-gel »)
   - dossiers ouverts pendant la session (sessionStorage « ej-lab-ouvertures »), y compris ceux créés depuis le DPJ
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

  function estPonctuelle(s) {
    return (E.ponctuelles || []).indexOf(s) !== -1;
  }
  /* Entité suivie au titre du commissariat aux comptes : mandat ou mission ponctuelle */
  function estCAC(s) {
    return E.mandats.indexOf(s) !== -1 || estPonctuelle(s);
  }
  function trouver(id) {
    function par(liste) { return (liste || []).filter(function (x) { return x.id === id; })[0]; }
    return par(E.societes) || par(E.mandats) || par(E.ponctuelles) || null;
  }
  /* Dossiers LAB dans le périmètre du profil : clients EC, entités contrôlées (mandats) et missions ponctuelles CAC */
  function dossiers(profil) {
    var cac = E.mandats.concat(E.ponctuelles || []);
    return profil === "ec" ? E.societes.slice() : profil === "cac" ? cac : E.societes.concat(cac);
  }
  /* Qui valide la revue : l'associé signataire de la mission ; le responsable LAB du cabinet
     seulement pour une PPE, un risque élevé ou une homonymie à lever sur le gel des avoirs. */
  /* risqueRetenu (facultatif) : niveau choisi dans une revue en cours, à la place du niveau actuel du dossier */
  /* Responsable LAB compétent pour un dossier : celui du commissariat aux comptes pour une entité CAC
     (mandat ou mission ponctuelle), celui de l'expertise comptable pour un client EC, même en cabinet mixte */
  function responsableLabDe(s) {
    return E.responsableLab(estCAC(s) ? "cac" : "ec");
  }
  /* profil : gardé pour la compatibilité des appels (le responsable LAB dépend du dossier, pas du profil affiché) */
  function validateur(s, profil, risqueRetenu) {
    var L = s.lab || {};
    var rlab = responsableLabDe(s);
    var risque = risqueRetenu || L.risque;
    var raison = L.ppe ? "ppe" : risque === "eleve" ? "eleve" : L.gel === "a_verifier" ? "homonymie" : null;
    var code = raison ? rlab : estCAC(s) ? s.signataire : s.associe || rlab;
    return { code: code, nom: E.equipe[code].nom, raison: raison, responsableLab: code === rlab && !!raison };
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
    /* Missions ponctuelles du commissaire aux comptes (données inventées pour la maquette) */
    orvane: ["9 rue des Fonderies, 25000 Besançon", "1 200 000 €", "Bertrand Orvain, Président",
      [["Bertrand Orvain", "58 % du capital et des droits de vote"], ["Agnès Orvain", "30 % du capital et des droits de vote"]],
      [["Fonds Industrie Franche-Comté", "12 %"]]],
    kerlys: ["Zone portuaire de Kernével, 56260 Larmor-Plage", "50 000 €", "Yann Le Gall, gérant",
      [["Yann Le Gall", "80 % du capital et des droits de vote"]],
      [["Maëlle Le Gall", "20 %"]]],
    brun: ["14 rue des Artisans, 49300 Cholet", "300 000 €", "Henri Brun, Président", []],
    vetis: ["3 avenue Pasteur, 35000 Rennes", "750 000 €", "Claire Vétillard, Présidente",
      [["Claire Vétillard", "46 % du capital et des droits de vote"], ["Nicolas Brémond", "32 % du capital et des droits de vote"]],
      [["Santéo Participations", "22 %"]]],
    pomone: ["Marché d'intérêt national, 94150 Rungis", "20 000 €", "Rachid Benamar, gérant",
      [["Rachid Benamar", "100 % du capital et des droits de vote"]]],
  };
  function fiche(id) {
    return FICHES[id] || null;
  }
  /* Activité : les missions ponctuelles n'en portent pas dans EJM (données inventées pour la maquette) */
  var ACTIVITES = {
    orvane: "Fabrication d'équipements industriels",
    kerlys: "Location et entretien de bateaux de plaisance",
    brun: "Menuiserie et agencement",
    vetis: "Distribution de produits vétérinaires",
    pomone: "Commerce de gros de fruits et légumes",
  };
  function activite(s) {
    return s.activite || ACTIVITES[s.id] || "Activité non renseignée";
  }

  /* ---------- Gel des avoirs : correspondances possibles à lever (fiche du registre inventée) ----------
     personne : nom retenu au dossier ; dossier / registre : date de naissance, lieu de naissance, nationalité */
  var HOMONYMIES = {
    kalipso: {
      personne: "Karim Haddad",
      registre: "HADDAD, Karim",
      dossier: { naissance: "22/09/1981", lieu: "Marseille (13)", nationalite: "Française" },
      liste: { naissance: "1968", lieu: "Alep (Syrie)", nationalite: "Syrienne" },
    },
  };
  function homonymie(s) {
    var h = HOMONYMIES[s.id];
    if (h) return h;
    var F = fiche(s.id);
    var nom = F ? (F[3].length ? F[3][F[3].length - 1][0] : F[2].split(",")[0].trim()) : s.nom;
    return { personne: nom, registre: nom.toUpperCase(), dossier: { naissance: "Au dossier", lieu: "Au dossier", nationalite: "Au dossier" }, liste: { naissance: "Au registre", lieu: "Au registre", nationalite: "Au registre" } };
  }

  /* ---------- Pièces attendues : règle unique (nombre attendu = lab.pieces[1]) ----------
     Total = pièces reprises d'EJ (jamais demandées au client) + pièces demandées au client.
     Reprise : [libellé, détail, source, date] ; pièce demandée : [libellé, détail].
     Les reprises comptent comme reçues : reçues = max(lab.pieces[0], nombre de reprises).
     La file (lab.html) et la fiche lisent les mêmes fonctions : mêmes chiffres partout. */
  var ATTESTATION = "Attestation PPE et bénéficiaires effectifs";
  function estClientEC(s) {
    return E.societes.indexOf(s) !== -1;
  }
  function estMandat(s) {
    return E.mandats.indexOf(s) !== -1;
  }
  /* Source des actes (statuts, procès-verbaux, nominations) détenus par EJ */
  function sourceActes(s) {
    var L = s.lab;
    var dInpi = L.criblage || L.ouverture || E.today;
    /* Mission ponctuelle : statuts et procès-verbaux repris de la formalité EJ du conseil seulement avec l'accord de la société ;
       sans accord, ils sont demandés (null) */
    if (estPonctuelle(s)) return s.conseil && s.conseil.ej && s.conseil.formalite && s.accord ? ["Formalité " + s.conseil.formalite, s.accord.date || L.ouverture || E.today] : null;
    if (estMandat(s)) return ["Connecteur INPI", dInpi];
    var f = (L.changements || []).filter(function (c) { return /^Formalité/.test(c[2]); });
    return f.length ? [f[f.length - 1][2], f[f.length - 1][0]] : ["Formalités EJ", L.ouverture || E.today];
  }
  var ID_BE = "Pièces d'identité des bénéficiaires effectifs";
  var ID_DIR = "Pièce d'identité du dirigeant";
  function nomDirigeant(s) {
    var F = fiche(s.id);
    return F ? F[2].split(",")[0].trim() : "";
  }
  function listesPieces(s) {
    var L = s.lab, total = L.pieces[1];
    var F = fiche(s.id);
    var BE = F ? F[3] : [];
    if (s.forme === "Association")
      return {
        reprises: [],
        demandees: [
          ["Statuts à jour", ""],
          ["Composition du bureau", "procès-verbal de la dernière assemblée"],
          ["Publication au Journal officiel", "déclaration de l'association"],
          ["Pièce d'identité du représentant légal", "la présidente de l'association"],
          [ATTESTATION, "à signer électroniquement par le représentant légal"],
        ].slice(0, total),
      };
    var act = activite(s);
    var clientEC = estClientEC(s);
    var dirNom = nomDirigeant(s);
    var autresBE = BE.filter(function (b) { return b[0] !== dirNom; }).map(function (b) { return b[0]; });
    var indirect = BE.some(function (b) { return /indirect/.test(b[1]); });
    var holding = /^Holding/.test(act);
    var dInpi = L.criblage || L.ouverture || E.today;
    var actes = sourceActes(s);
    /* Seules reprises d'EJ : extrait RNE (connecteur INPI), statuts et procès-verbaux du dossier, extrait du RBE.
       La pièce d'identité du dirigeant est toujours demandée au client (une pièce versée pour une formalité ne change pas de finalité). */
    var rep = [["Extrait RNE", "tient lieu d'extrait Kbis", "Connecteur INPI", dInpi]];
    if (actes) rep.push(["Statuts à jour et procès-verbaux", "", actes[0], actes[1]]);
    var extras = [["Extrait du registre des bénéficiaires effectifs", "accès réservé aux professionnels assujettis", "Connecteur INPI", dInpi]];
    var dem = [[ATTESTATION, "à signer électroniquement par le dirigeant"], [ID_DIR, dirNom]];
    if (!actes) dem.push(["Statuts à jour et procès-verbaux", "à fournir par la société"]);
    /* Identités des bénéficiaires effectifs autres que le dirigeant (sa pièce est déjà reprise ou demandée) */
    if (!BE.length) dem.push([ID_BE, "en attente de l'identification des bénéficiaires effectifs"]);
    else if (autresBE.length) dem.push([ID_BE, autresBE.join(", ")]);
    /* Pièces selon le cas, par priorité */
    var opt = [];
    if (indirect) opt.push(["Organigramme de détention", "exigé : détention indirecte"]);
    else if (holding) opt.push(["Organigramme du groupe", act === "Holding animatrice" ? "filiales animées, pour la holding animatrice" : "périmètre des comptes consolidés"]);
    if (L.ppe || L.risque === "eleve") opt.push(["Origine du patrimoine", "PPE ou risque élevé"]);
    opt.push(["Origine des fonds", "selon le cas"]);
    if (L.risque === "eleve") opt.push(["Justificatifs de l'activité", "contrats, factures ou bons de commande"]);
    /* Dernier bilan : jamais quand le cabinet tient ou certifie les comptes (client EC, mandat CAC) */
    if (!clientEC && !estMandat(s)) opt.push(["Dernier bilan", "pour le profil d'activité"]);
    dem = dem.concat(opt.slice(0, Math.max(0, total - rep.length - dem.length)));
    while (rep.length + dem.length < total && extras.length) rep.push(extras.shift());
    while (rep.length + dem.length < total) dem.push(["Pièce complémentaire", "à préciser"]);
    rep = rep.slice(0, total);
    return { reprises: rep, demandees: dem.slice(0, total - rep.length) };
  }
  /* Changement de bénéficiaire effectif relevé par EJ depuis la dernière revue (date la plus récente, sinon null) */
  function changementBE(s) {
    var d = null;
    (s.lab.changements || []).forEach(function (c) {
      var m = /au capital \((\d+) %\)/.exec(c[1]);
      if ((/bénéficiaire effecti/.test(c[1]) || (m && +m[1] > 25)) && (!d || dt(c[0]) > dt(d))) d = c[0];
    });
    return d;
  }
  /* État des pièces demandées : reçue, manquante, ou reçue avant un changement de bénéficiaire effectif (à renouveler) */
  /* L'attestation PPE et bénéficiaires effectifs est renouvelée à chaque revue : signée lors de la dernière revue validée ;
     revue échue : envoyée à la signature par EJ à l'échéance, signée deux jours plus tard. Un changement de bénéficiaire
     effectif relevé depuis la dernière revue rend l'attestation et les identités des bénéficiaires à renouveler.
     Une pièce à renouveler n'est pas reçue : elle compte parmi les manquantes. date : date de la pièce si connue (sinon null). */
  function etatDemandees(s) {
    var l = listesPieces(s), L = s.lab, P = L.pieces;
    var marques = piecesMarquees(s.id);
    var nRec = Math.max(0, Math.min(P[1], Math.max(P[0], l.reprises.length)) - l.reprises.length);
    var chBE = changementBE(s);
    var rs = revueSession(s.id);
    var dRev = rs ? rs.avant.derniereRevue : L.derniereRevue;
    var renouv = L.statut === "a_revoir" && L.prochaineRevue ? plusJours(L.prochaineRevue, 2) : null;
    if (renouv && dt(renouv) > dt(E.today)) renouv = null;
    return l.demandees.map(function (p, j) {
      var recue = j < nRec;
      var date = null;
      if (recue && p[0] === ATTESTATION) date = rs ? rs.date : renouv && !chBE ? renouv : dRev && L.ouverture && dt(dRev) > dt(L.ouverture) ? dRev : null;
      var perime = recue && chBE && (p[0] === ATTESTATION || p[0] === ID_BE) ? chBE : null;
      if (perime && p[0] === ATTESTATION) date = dRev && L.ouverture && dt(dRev) > dt(L.ouverture) ? dRev : null;
      var m = marques[p[0]];
      /* Pièce reçue pendant la session (marquée ou déposée) : reçue à cette date */
      if (m && (!recue || perime)) return { lib: p[0], det: p[1], recue: true, perime: null, date: m.date, renouvelee: false, marquee: m, rang: l.reprises.length + j };
      return { lib: p[0], det: perime ? "changement de bénéficiaire effectif du " + chBE : p[1], recue: recue && !perime, perime: perime, date: date, renouvelee: !!(recue && !perime && p[0] === ATTESTATION && renouv && !rs), rang: l.reprises.length + j };
    });
  }
  /* Règle unique des pièces d'un dossier (file, fiche, cockpit, fiches de mission, collectes) :
     { attendues, recues, manquantes, aRenouveler, liste } ; liste = pièces reprises d'EJ puis pièces demandées */
  function etatPieces(s) {
    var rep = piecesReprises(s), dem = etatDemandees(s);
    var manq = dem.filter(function (e) { return !e.recue; });
    var liste = rep.map(function (p, i) { return { lib: p[0], det: p[1], recue: true, reprise: true, source: p[2], date: p[3], rang: i }; }).concat(dem);
    return {
      attendues: s.lab.pieces[1],
      recues: s.lab.pieces[1] - manq.length,
      manquantes: manq.length,
      aRenouveler: manq.filter(function (e) { return !!e.perime; }).length,
      liste: liste,
    };
  }
  /* Pièces reçues pendant la session : marquées « reçue » ou déposées dans la fiche (sessionStorage « ej-lab-pieces ») */
  var CLE_PIECES = "ej-lab-pieces";
  function piecesMarquees(id) {
    var t = objet(CLE_PIECES);
    return t[id] && typeof t[id] === "object" ? t[id] : {};
  }
  function marquerRecue(s, lib, par, fichier) {
    var t = objet(CLE_PIECES);
    if (!t[s.id] || typeof t[s.id] !== "object") t[s.id] = {};
    t[s.id][lib] = { date: E.today, par: par || "", fichier: fichier || "" };
    ecrire(CLE_PIECES, t);
    return t[s.id][lib];
  }
  /* Pièces d'identification manquantes (attestation, identités) : elles bloquent la validation d'une revue */
  function identificationManquante(s) {
    return etatDemandees(s).filter(function (e) { return !e.recue && (e.lib === ATTESTATION || e.lib === ID_BE || e.lib === ID_DIR); }).map(function (e) { return e.lib; });
  }
  function piecesReprises(s) {
    return listesPieces(s).reprises;
  }
  function piecesDemandees(s) {
    return listesPieces(s).demandees;
  }
  function piecesAttendues(s) {
    var l = listesPieces(s);
    return l.reprises.concat(l.demandees);
  }
  /* Pièces reçues (reprises d'EJ comprises) */
  function recues(s) {
    return s.lab.pieces[1] - nbManquantes(s);
  }
  /* Pièces demandées au client et pas encore reçues : seules celles-ci sont à collecter */
  function piecesManquantes(s) {
    return etatDemandees(s).filter(function (e) { return !e.recue; }).map(function (e) { return [e.lib, e.det]; });
  }
  function nbManquantes(s) {
    return piecesManquantes(s).length;
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
  function objet(k) {
    var r = lire(k);
    return r && typeof r === "object" && !Array.isArray(r) ? r : {};
  }
  var CLE_REVUES = "ej-lab-revues";
  function revuesSession() {
    return objet(CLE_REVUES);
  }
  function revueSession(id) {
    return revuesSession()[id] || null;
  }
  /* Validateur des revues passées : associé signataire de l'époque, attribution stable quel que soit le profil affiché.
     Société cliente : s.associe ; entité CAC : s.signataire ; PPE ou risque élevé : responsable LAB (cabinet EC pour
     une société cliente, cabinet CAC pour une entité contrôlée). Le risque pris en compte est celui d'avant la revue de la session. */
  function validateurHistorique(s) {
    var L = s.lab || {};
    var rs = revueSession(s.id);
    var risque = rs && rs.avant && rs.avant.risque !== undefined ? rs.avant.risque : L.risque;
    var raison = L.ppe ? "ppe" : risque === "eleve" ? "eleve" : null;
    var code = raison ? responsableLabDe(s) : estCAC(s) ? s.signataire : s.associe || E.responsableLab("ec");
    var m = E.equipe[code];
    return { code: code, nom: m.nom, role: m.role, raison: raison, responsableLab: !!raison };
  }
  function appliquerRevue(s, r) {
    s.lab.statut = r.conclusion === "fin" && !estCAC(s) ? "fin_relation" : "a_jour";
    s.lab.derniereRevue = r.date;
    s.lab.prochaineRevue = r.prochaine;
    if (r.risque) s.lab.risque = r.risque;
  }
  function validerRevue(s, par, o) {
    var L = s.lab;
    o = o || {};
    var risque = o.risque || L.risque;
    var fin = o.conclusion === "fin" && !estCAC(s);
    /* La périodicité suit le risque retenu (grille du cabinet), sauf ajustement reconduit (o.mois) ; fin de relation : plus de revue */
    var mois = fin ? 0 : o.mois || (risque ? GRILLE_MOIS[risque] : periodiciteMois(L));
    var r = {
      date: E.today,
      par: par,
      code: o.code || "",
      mois: mois,
      ajustement: o.ajustement || "",
      prochaine: fin ? null : plusMois(E.today, mois),
      risque: risque,
      conclusion: o.conclusion || "poursuivre",
      commentaire: o.commentaire || "",
      criteres: o.criteres || {},
      verifPPE: o.verifPPE || null,
      avant: { statut: L.statut, derniereRevue: L.derniereRevue, prochaineRevue: L.prochaineRevue, risque: L.risque },
    };
    var tout = revuesSession();
    tout[s.id] = r;
    ecrire(CLE_REVUES, tout);
    var d = demandes();
    if (d[s.id]) {
      delete d[s.id];
      ecrire(CLE_DEMANDES, d);
    }
    appliquerRevue(s, r);
    return r;
  }
  var CONCLUSIONS = {
    poursuivre: "Poursuivre la relation",
    renforcer: "Renforcer la vigilance",
    fin: "Mettre fin à la relation",
    poursuivreMission: "Poursuivre la mission",
    demission: "Envisager la démission",
    interrompre: "Refuser ou interrompre la mission",
  };
  /* Conclusions possibles d'une revue : [code, libellé]. Mandat légal : la démission n'est possible que pour un motif légitime ;
     mission ponctuelle : refus ou interruption ; « Mettre fin à la relation » est réservé aux clients en expertise comptable. */
  function conclusions(s) {
    if (estPonctuelle(s)) return [["poursuivreMission", CONCLUSIONS.poursuivreMission], ["renforcer", CONCLUSIONS.renforcer], ["interrompre", CONCLUSIONS.interrompre]];
    if (estCAC(s)) return [["poursuivre", CONCLUSIONS.poursuivre], ["renforcer", CONCLUSIONS.renforcer], ["demission", CONCLUSIONS.demission]];
    return [["poursuivre", CONCLUSIONS.poursuivre], ["renforcer", CONCLUSIONS.renforcer], ["fin", CONCLUSIONS.fin]];
  }
  function libConclusion(c) {
    return CONCLUSIONS[c] || CONCLUSIONS.poursuivre;
  }

  /* ---------- Demandes de validation (revue préparée par un autre que le validateur) ---------- */
  var CLE_DEMANDES = "ej-lab-demandes";
  function demandes() {
    return objet(CLE_DEMANDES);
  }
  function demandeValidation(id) {
    return demandes()[id] || null;
  }
  function demanderValidation(s, par, a, o) {
    var d = demandes();
    o = o || {};
    d[s.id] = { date: E.today, par: par, code: o.code || "", a: a, aCode: o.aCode || "", risque: o.risque || s.lab.risque, conclusion: o.conclusion || "poursuivre", commentaire: o.commentaire || "", criteres: o.criteres || {}, mois: o.mois || 0, ajustement: o.ajustement || "", verifPPE: o.verifPPE || null, renvoi: null };
    ecrire(CLE_DEMANDES, d);
    return d[s.id];
  }
  function retirerDemande(s) {
    var d = demandes();
    delete d[s.id];
    ecrire(CLE_DEMANDES, d);
  }
  /* Le validateur renvoie la revue préparée, avec un commentaire */
  function renvoyerRevue(s, par, commentaire) {
    var d = demandes();
    if (!d[s.id]) return null;
    d[s.id].renvoi = { date: E.today, par: par, commentaire: commentaire };
    ecrire(CLE_DEMANDES, d);
    return d[s.id];
  }

  /* ---------- Gel des avoirs : levées d'homonymie de la session ----------
     { personne, elements: { naissance, lieu, nationalite : "concorde" | "differe" }, piece, conclusion: "levee" | "confirmee", par, date } */
  var CLE_GEL = "ej-lab-gel";
  function leveesGel() {
    return objet(CLE_GEL);
  }
  function leveeGel(id) {
    return leveesGel()[id] || null;
  }
  function appliquerGel(s, g) {
    if (g.conclusion === "levee") {
      s.lab.gel = "ok";
      s.lab.gelLevee = g;
    } else if (g.conclusion === "confirmee") {
      s.lab.gel = "a_verifier";
      s.lab.gelConfirme = g;
    }
  }
  /* Correspondance confirmée sur le gel des avoirs (session) : gel à appliquer, pas d'homonymie à lever */
  function gelConfirme(s) {
    var g = s ? leveeGel(s.id) : null;
    return !!(g && g.conclusion === "confirmee");
  }
  function enregistrerGel(s, g) {
    var tout = leveesGel();
    g.date = E.today;
    tout[s.id] = g;
    ecrire(CLE_GEL, tout);
    appliquerGel(s, g);
    return g;
  }

  /* ---------- Ouverture d'un dossier LAB (session) ----------
     { id, date, par, be, fiche (dérivée du DPJ, facultative), societe (dossier créé depuis le DPJ, sinon null), total }
     Le dossier passe à « incomplet » : premier contrôle du gel des avoirs fait à l'ouverture, risque à évaluer,
     pièces reçues = pièces reprises d'EJ. */
  var CLE_OUV = "ej-lab-ouvertures";
  function ouvertures() {
    return objet(CLE_OUV);
  }
  function ouvertureSession(id) {
    return ouvertures()[id] || null;
  }
  function appliquerOuverture(o) {
    var s = trouver(o.id);
    if (!s && o.societe) {
      s = JSON.parse(JSON.stringify(o.societe));
      E.societes.push(s);
    }
    if (!s || !s.lab) return null;
    if (o.fiche) FICHES[o.id] = o.fiche;
    var L = s.lab;
    var total = o.total || (L.pieces ? L.pieces[1] : 5);
    L.ouverture = o.date;
    L.criblage = o.date;
    L.statut = "incomplet";
    L.risque = null;
    L.derniereRevue = null;
    L.prochaineRevue = null;
    L.be = o.be || 0;
    L.ppe = false;
    L.gel = "ok";
    L.pieces = [0, total];
    L.pieces[0] = Math.min(total, piecesReprises(s).length);
    return s;
  }
  function ouvrirDossier(id, o) {
    o = o || {};
    var rec = { id: id, date: E.today, par: o.par || "", be: o.be || 0, fiche: o.fiche || null, societe: o.societe || null, total: o.total || 0 };
    var tout = ouvertures();
    tout[id] = rec;
    ecrire(CLE_OUV, tout);
    return appliquerOuverture(rec);
  }

  /* Applique dès le chargement les ouvertures, les revues validées et les levées de la session (la file et la fiche les reflètent) */
  (function () {
    var o = ouvertures();
    Object.keys(o).forEach(function (id) {
      if (o[id] && o[id].date) appliquerOuverture(o[id]);
    });
    var r = revuesSession();
    Object.keys(r).forEach(function (id) {
      var s = trouver(id);
      if (s && r[id] && r[id].avant) appliquerRevue(s, r[id]);
    });
    var g = leveesGel();
    Object.keys(g).forEach(function (id) {
      var s = trouver(id);
      if (s && g[id] && g[id].conclusion) appliquerGel(s, g[id]);
    });
  })();

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
  /* Relances de collecte : { collecte, societeId, date, par } (sessionStorage « ej-collectes-relances ») */
  var CLE_RELANCES = "ej-collectes-relances";
  function relances() {
    var l = lire(CLE_RELANCES);
    return Array.isArray(l) ? l : [];
  }
  function relancesDe(societeId) {
    return relances().filter(function (r) { return r && r.societeId === societeId; });
  }
  function relancesCollecte(collecteId) {
    return relances().filter(function (r) { return r && r.collecte === collecteId; });
  }
  function relancerCollecte(collecteId, societeId, par) {
    var l = relances();
    var r = { collecte: collecteId, societeId: societeId, date: E.today, par: par || "" };
    l.push(r);
    ecrire(CLE_RELANCES, l);
    return r;
  }
  /* Demande de pièces initiale (au journal du dossier) : envoyée deux jours après l'ouverture d'un dossier incomplet */
  function demandeInitiale(s) {
    var L = s.lab;
    if (L.statut !== "incomplet" || !L.ouverture) return null;
    var d = plusJours(L.ouverture, 2);
    if (dt(d) > dt(E.today)) return null;
    return { date: d, n: nbManquantes(s) };
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
    ".lab-repris{margin-top:-6px;font-size:12.5px;color:var(--ej-neutral-500)}.lab-repris:empty{display:none}" +
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
      '<div><div class="lab-lbl" id="col-dest-lbl">Destinataire <span class="info-tip" data-tip="bas"><button type="button" class="info-tip-btn" aria-describedby="note-collecte" aria-label="Fonctionnement de la collecte"><span class="ms">info</span></button><span class="info-tip-pop" role="tooltip" id="note-collecte">Le client dépose ses pièces depuis un lien sécurisé, avec relances automatiques. L\'attestation PPE et bénéficiaires effectifs se signe en ligne (jesignexpert.com). Les pièces reçues sont versées au dossier LAB.</span></span></div><div class="lab-dest" id="col-dest"></div></div>' +
      '<fieldset class="lab-pieces" id="col-pieces"><legend class="lab-lbl" id="col-lbl">Pièces demandées</legend><div id="col-liste"></div></fieldset>' +
      '<p class="lab-repris" id="col-repris"></p>' +
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
    var rep = piecesReprises(s);
    M.querySelector("#col-repris").textContent = rep.length
      ? "Déjà détenus par EJ, non demandés : " + rep.map(function (p) { return p[0]; }).join(", ") + "."
      : "";
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
    estPonctuelle: estPonctuelle,
    dossiers: dossiers,
    validateur: validateur,
    responsableLabDe: responsableLabDe,
    trouver: trouver,
    fiche: fiche,
    activite: activite,
    homonymie: homonymie,
    ATTESTATION: ATTESTATION,
    piecesAttendues: piecesAttendues,
    piecesReprises: piecesReprises,
    etatPieces: etatPieces,
    etatDemandees: etatDemandees,
    piecesMarquees: piecesMarquees,
    marquerRecue: marquerRecue,
    /* Option Pappers KYC (vérification PPE automatique) : inactive dans ce cabinet */
    kycPappers: false,
    identificationManquante: identificationManquante,
    changementBE: changementBE,
    ID_BE: ID_BE,
    ID_DIR: ID_DIR,
    piecesDemandees: piecesDemandees,
    recues: recues,
    piecesManquantes: piecesManquantes,
    nbManquantes: nbManquantes,
    dirigeant: dirigeant,
    GRILLE_MOIS: GRILLE_MOIS,
    periodiciteMois: periodiciteMois,
    validateurHistorique: validateurHistorique,
    revueSession: revueSession,
    validerRevue: validerRevue,
    CONCLUSIONS: CONCLUSIONS,
    conclusions: conclusions,
    libConclusion: libConclusion,
    relancesDe: relancesDe,
    relancesCollecte: relancesCollecte,
    relancerCollecte: relancerCollecte,
    demandeValidation: demandeValidation,
    demanderValidation: demanderValidation,
    retirerDemande: retirerDemande,
    renvoyerRevue: renvoyerRevue,
    gelConfirme: gelConfirme,
    ouvrirDossier: ouvrirDossier,
    ouvertureSession: ouvertureSession,
    leveeGel: leveeGel,
    enregistrerGel: enregistrerGel,
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
