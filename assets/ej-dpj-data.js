/* Express Juridique · Lifting 2026 · DPJ fictif (Dossier permanent juridique) et moteur de requêtes
   Cabinet de démonstration : CABINET DELMAS EXPERTISE. Mise à jour affichée : 18/10/2026.
   Principe : l'IA traduit une question en requête structurée sur des champs connus (schema) ;
   EJ exécute la requête ici, sur les fiches du DPJ. Le modèle ne voit jamais les données.
   Construit à partir de EJC.soc (135 sociétés, clé = nom), de façon déterministe : générateur
   pseudo-aléatoire à graine fixe, mêmes données à chaque chargement.
   Les 18 sociétés de EJM.societes reprennent siège, capital, dirigeant et associés de FICHES
   (lab-dossier.html). Les entités CAC (EJM.mandats) ne sont pas dans le DPJ.
   Dépend de ej-missions-data.js (EJM) et ej-cockpit-data.js (EJC), chargés avant. Expose window.EJDPJ.
   Toutes les données sont fictives. */
(function () {
  "use strict";
  var EJC = window.EJC;
  var EJM = window.EJM;
  var MAJ = "18/10/2026";

  /* ---------- Générateur pseudo-aléatoire à graine fixe ---------- */
  var seed = 20261018;
  function rnd() {
    seed = (seed + 0x6d2b79f5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function ri(a, b) {
    return a + Math.floor(rnd() * (b - a + 1));
  }
  function pick(arr) {
    return arr[Math.floor(rnd() * arr.length)];
  }
  function wpick(pairs) {
    var tot = 0;
    pairs.forEach(function (p) {
      tot += p[1];
    });
    var x = rnd() * tot;
    for (var i = 0; i < pairs.length; i++) {
      x -= pairs[i][1];
      if (x < 0) return pairs[i][0];
    }
    return pairs[pairs.length - 1][0];
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  /* ---------- Dates (chaînes JJ/MM/AAAA) ---------- */
  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function dstr(y, m, d) {
    return pad(d) + "/" + pad(m) + "/" + y;
  }
  function dparts(s) {
    var p = s.split("/");
    return { d: +p[0], m: +p[1], y: +p[2] };
  }
  function dkey(s) {
    var p = dparts(s);
    return p.y * 10000 + p.m * 100 + p.d;
  }
  function toUTC(s) {
    var p = dparts(s);
    return Date.UTC(p.y, p.m - 1, p.d);
  }
  function fromUTC(t) {
    var d = new Date(t);
    return dstr(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  }
  function addDays(s, n) {
    return fromUTC(toUTC(s) + n * 86400000);
  }
  function isLeap(y) {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  }
  function addYears(s, n) {
    var p = dparts(s);
    var y = p.y + n;
    var d = p.d;
    if (p.m === 2 && d === 29 && !isLeap(y)) d = 28;
    return dstr(y, p.m, d);
  }
  function between(a, b) {
    var ta = toUTC(a);
    var tb = toUTC(b);
    if (tb < ta) tb = ta;
    return fromUTC(ta + Math.floor(rnd() * ((tb - ta) / 86400000 + 1)) * 86400000);
  }
  function fromDate(d) {
    return dstr(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }

  /* ---------- Normalisation de texte : minuscules, sans accents, espaces simples ---------- */
  function fold(s) {
    return String(s == null ? "" : s)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }
  function slug(s) {
    return fold(s)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /* ---------- Tables de données ---------- */
  var FM = ("Alain|Bernard|Christophe|Daniel|Denis|Didier|Emmanuel|Fabien|Franck|Frédéric|Gaël|Guillaume|Henri|Jacques|Jérémy|Laurent|Ludovic|Maxime|Michel|Nicolas|Pascal|Patrick|Rémi|Romain|Sébastien|Stéphane|Thierry|Vincent|Yann|Yannick|Xavier|Samir|Karim|Mehdi|Nabil|Rachid|Antonio|Paulo|Luc|Hervé|Gilles|Éric|Bruno|Cédric|Jean-Marc|Jean-Pierre|Pierre-Yves|Arnaud|Benoît|Clément|Damien|Florent|Kévin|Loïc|Mickaël|Quentin|Raphaël|Tristan|Julien|Alexandre|Fabrice|Lionel|Serge|Christian|Gérard|Régis|Jérôme|Matthieu|Adrien").split("|");
  var FF = ("Agnès|Aurélie|Béatrice|Brigitte|Caroline|Catherine|Céline|Christine|Claudine|Corinne|Delphine|Émilie|Estelle|Françoise|Gwenaëlle|Isabelle|Jocelyne|Josiane|Julie|Karine|Laëtitia|Laurence|Lucie|Magali|Marie-Claire|Martine|Mélanie|Michèle|Muriel|Nadège|Nathalie|Nicole|Odile|Patricia|Pauline|Sandrine|Stéphanie|Sylvie|Valérie|Véronique|Virginie|Yasmine|Samia|Fatima|Leïla|Amandine|Anaïs|Marion|Élise|Cécile|Florence|Hélène|Anne|Christelle|Evelyne|Sonia|Camille|Charlotte|Maryse|Danielle|Annie").split("|");
  var LAST = ("Berger|Bonnet|Boyer|Brunet|Carlier|Chauvin|Collet|Colin|Cordier|Delattre|Delorme|Denis|Deschamps|Devaux|Dupuis|Durand|Fournel|Gaillard|Gauthier|Gilbert|Guérin|Guillot|Hamon|Huet|Jacquet|Klein|Labbé|Lacroix|Lambert|Langlois|Lebrun|Leclercq|Legrand|Lemoine|Lopes|Maillet|Marchetti|Martinez|Masson|Meunier|Michaud|Morel|Navarro|Nguyen|Pagès|Parent|Pasquier|Pelletier|Picard|Poulain|Rey|Rivière|Robin|Rolland|Roux|Sanchez|Schmitt|Simon|Tessier|Thibault|Weber|Yildiz|Zimmermann|Benoit|Bouvier|Vincent|Rousseau|Lefort|Blondel|Gomes|Ferreira|Kowalski|Mercadier|Duclos|Sauvage|Barbier|Allard|Charpentier|Daniel|Fontaine|Hubert|Joly|Lejeune|Marty|Paulin|Renard|Salmon|Vallet|Bertrand|Chevalier|Dumont|Laporte|Perret|Muller|Bailly|Camus|Giraud|Henry|Leroux|Moulin|Noël|Philippe|Raynaud|Tournier|Vaillant").split("|");
  var MORALES = ["SAS FINANCIÈRE DU ROCHER", "SARL HOLDING BELLEROCHE", "SAS PATRIMOINE ET AVENIR", "SC DES CÈDRES", "SAS INVEST OUEST", "SARL HOLDING MARTINET", "SAS GROUPE LAMOTHE", "SC DE LA SOURCE"];

  /* Villes : [ville, codes postaux]. Paris est traité à part (environ un quart des sièges générés). */
  var VILLES = [
    ["Lyon", ["69001", "69002", "69003", "69006", "69007"]], ["Marseille", ["13001", "13006", "13008", "13009"]], ["Toulouse", ["31000", "31100", "31200", "31500"]],
    ["Bordeaux", ["33000", "33100", "33200", "33800"]], ["Nantes", ["44000", "44100", "44200", "44300"]], ["Lille", ["59000", "59800"]], ["Strasbourg", ["67000", "67200"]],
    ["Rennes", ["35000", "35200", "35700"]], ["Montpellier", ["34000", "34070", "34080"]], ["Nice", ["06000", "06100", "06200"]], ["Grenoble", ["38000", "38100"]],
    ["Dijon", ["21000"]], ["Angers", ["49000", "49100"]], ["Tours", ["37000", "37100", "37200"]], ["Reims", ["51100"]], ["Rouen", ["76000", "76100"]], ["Le Havre", ["76600"]],
    ["Clermont-Ferrand", ["63000", "63100"]], ["Metz", ["57000"]], ["Nancy", ["54000"]], ["Orléans", ["45000", "45100"]], ["Caen", ["14000"]], ["Brest", ["29200"]],
    ["Limoges", ["87000"]], ["Perpignan", ["66000"]], ["Pau", ["64000"]], ["Annecy", ["74000"]], ["Poitiers", ["86000"]], ["La Rochelle", ["17000"]], ["Avignon", ["84000"]],
    ["Saint-Étienne", ["42000"]], ["Mulhouse", ["68100"]], ["Amiens", ["80000"]], ["Besançon", ["25000"]], ["Vannes", ["56000"]], ["Quimper", ["29000"]], ["Chambéry", ["73000"]],
    ["Bayonne", ["64100"]], ["Toulon", ["83000"]], ["Nîmes", ["30000"]], ["Valence", ["26000"]], ["Versailles", ["78000"]], ["Boulogne-Billancourt", ["92100"]],
    ["Nanterre", ["92000"]], ["Créteil", ["94000"]], ["Cergy", ["95000"]], ["Saint-Denis", ["93200"]], ["Le Mans", ["72000"]], ["Troyes", ["10000"]], ["Lorient", ["56100"]],
  ];
  var ARR = [1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 10, 10, 11, 12, 13, 14, 15, 15, 16, 17, 17, 18, 19, 20];
  var RUES = ["rue de la République", "avenue Jean Jaurès", "boulevard Gambetta", "rue Victor Hugo", "place de la Mairie", "rue du Commerce", "chemin des Vignes", "rue Pasteur", "avenue de la Gare", "rue des Tanneurs", "rue Saint-Nicolas", "avenue du Général de Gaulle", "rue de l'Industrie", "boulevard Voltaire", "rue des Lilas", "quai des Chartrons", "rue Carnot", "avenue des Platanes", "zone d'activités des Landes", "rue du Moulin", "impasse des Acacias", "rue Anatole France", "avenue Foch", "rue Thiers", "boulevard de la Liberté", "cours Gambetta"];

  /* Activités des sociétés hors EJM */
  var ACT = {
    "LES JARDINS D'ORIANE": "Aménagement paysager", "ALTITUDE CONSEIL": "Conseil en management", "SAS NOVALYS AÉRO": "Construction aéronautique", "27 BELLEVUE": "Location immobilière",
    "NOVA STUDIO DÉMO": "Production audiovisuelle", "SCP MÉDICALE DES TILLEULS DÉMO": "Activité médicale", "SCCV LES ATELIERS DÉMO": "Construction-vente immobilière",
    "SCI LES TERRASSES DÉMO": "Location immobilière", "JULIEN MARCHAL FORMATIONS": "Formation professionnelle", "SOUFFLE ET HARMONIE": "Bien-être et sophrologie",
    "SELARL VASSEUR": "Cabinet d'avocats", "CABINET DE LORME": "Conseil en gestion", "MBCOMPTA": "Services comptables", "CHAUFFAGE DU LIMOUSIN": "Installation de chauffage",
    "HLMT CONSULTING": "Conseil en organisation", "MARALUNA": "Commerce de prêt-à-porter", "ESTERIA": "Esthétique et soins du corps", "IMMO +": "Location immobilière",
    LOGIVIA: "Logistique et entreposage", "VILLA SERENA": "Location immobilière", "PL CONSEILS": "Conseil en gestion de patrimoine",
    "ATELIER BERTIN": "Mécanique de précision", "BOULANGERIE DU MARCHÉ": "Boulangerie-pâtisserie", "GARAGE DUVAL": "Réparation automobile", "PHARMACIE DES ARCADES": "Pharmacie d'officine",
    "TRANSPORTS LEMAIRE": "Transport routier de marchandises", "SCI DU PARC": "Location immobilière", "MAISON CAILLAUD": "Commerce de détail", "OPTIQUE MARTIN": "Optique-lunetterie",
    "CLINIQUE VÉTÉRINAIRE DU LAC": "Activités vétérinaires", BATIGEST: "Maîtrise d'oeuvre bâtiment", "ELEC SERVICES": "Électricité générale", NOVATERRA: "Promotion immobilière",
    "LES VERGERS DE SAINT CLAIR": "Arboriculture fruitière", "HORIZON PATRIMOINE": "Holding patrimoniale", "SCI LES CHÊNES": "Location immobilière", "CAFÉ DES SPORTS": "Débit de boissons",
    "AGENCE PIXELIA": "Agence de communication", "CABINET FOURNIER": "Conseil en gestion", "SELARL DR ROCHE": "Cabinet médical", "ARTISANS DU BOIS": "Menuiserie",
    "MENUISERIE GAUTHIER": "Menuiserie", "SAVEURS D'ASIE": "Restauration", "ÉCOLE DE CONDUITE PRIMA": "Enseignement de la conduite", "DOMAINE DES CRÊTES": "Viticulture",
    "FROMAGERIE BLANC": "Commerce de fromages", "LOGISTIQUE OUEST": "Logistique et entreposage", "SCI MONTPLAISIR": "Location immobilière", "KINÉ SANTÉ PLUS": "Masso-kinésithérapie",
    "IMPRIMERIE MODERNE": "Imprimerie", "ALPHA SÉCURITÉ": "Sécurité privée", "BIO ET CO": "Commerce de produits biologiques", "CRÉATIONS LÉA": "Création de vêtements",
    TECHNIFROID: "Installation frigorifique", "SCI LA FONTAINE": "Location immobilière", "GROUPE ARMAND": "Holding animatrice", "HÔTEL DU PORT": "Hôtellerie",
    "PRESTIGE AUTO": "Commerce de véhicules", "VERDI PAYSAGE": "Aménagement paysager", "LES DÉLICES DE MARIE": "Traiteur", "CONSEIL ET STRATÉGIE": "Conseil de gestion",
    MEDIALINK: "Services numériques", "SCI DES TILLEULS": "Location immobilière", "ATLAS INGÉNIERIE": "Ingénierie et études techniques", "FLEURS DE SAISON": "Commerce de fleurs",
    DATAVERSE: "Services informatiques", "SCI BEAUSOLEIL": "Location immobilière", "PLOMBERIE RIVIÈRE": "Plomberie et chauffage", "MARINE ÉQUIPEMENT": "Commerce d'équipements nautiques",
    "OSTÉO DU CENTRE": "Ostéopathie", "CHARPENTES DUBOIS": "Charpente et couverture", "STUDIO NOMADE": "Production audiovisuelle", "SCI LE CLOS": "Location immobilière",
    "GAMMA FINANCE": "Conseil financier et holding", "PRIMEURS DU SUD": "Commerce de fruits et légumes", "RÉSIDENCE LES PINS": "Exploitation de résidence services", "NETTOYAGE PRO": "Nettoyage de locaux",
    "SELARL AVOCATS LEROY": "Cabinet d'avocats", "TERRA BÂTIMENT": "Gros oeuvre du bâtiment", "SCI HAUTEVILLE": "Location immobilière", "BRASSERIE DU NORD": "Restauration",
    "ÉQUILIBRE COACHING": "Coaching professionnel", "AUTO ÉCOLE DU CENTRE": "Enseignement de la conduite", "ORTHOPTIE MARCEAU": "Orthoptie", "CAVE DES VIGNERONS": "Commerce de vins",
    "SCI ROSERAIE": "Location immobilière", "LUMIÈRE ET DÉCO": "Décoration et luminaires", "AEROTECH SERVICES": "Maintenance aéronautique", "TABAC DE LA GARE": "Débit de tabac",
    "SCI VAL FLEURI": "Location immobilière", IMMOGEST: "Administration de biens", "VÉLO PASSION": "Commerce de cycles", "PÂTISSERIE AUGUSTIN": "Boulangerie-pâtisserie",
    "SCI BELLEVUE DEUX": "Location immobilière", "RESTAURANT LE GALION": "Restauration", "MANUFACTURE DE L'EST": "Fabrication industrielle", "SCI CAP SUD": "Location immobilière",
    "ÉNERGIES NOUVELLES": "Énergies renouvelables", "SERVICES À DOMICILE AMI": "Services à la personne", "SCI DES ACACIAS": "Location immobilière", "DIGITAL FACTORY": "Développement logiciel",
    "EXPERTISE BÂTIMENT": "Diagnostic immobilier", "SCI DU MOULIN": "Location immobilière", "GARDEN CENTER VERT": "Jardinerie", "AMBULANCES SECOURS": "Transport sanitaire",
    "SCI LES OLIVIERS": "Location immobilière", "TRAITEUR GOURMET": "Traiteur", "ACADÉMIE DE DANSE": "Enseignement artistique", "SCI MARIGNAN": "Location immobilière",
    "CLIMATISATION DU SUD": "Génie climatique", "MAROQUINERIE ÉLISE": "Maroquinerie", "SCI DES BRUYÈRES": "Location immobilière", "AGRI SERVICES": "Services agricoles", "LIBRAIRIE DES QUAIS": "Librairie",
  };

  /* Capitaux des plus grosses sociétés générées (euros) */
  var CAP_BIG = {
    "GROUPE ARMAND": 750000, "MANUFACTURE DE L'EST": 1500000, "TRANSPORTS LEMAIRE": 500000, "LOGISTIQUE OUEST": 300000, "ATLAS INGÉNIERIE": 250000, "HÔTEL DU PORT": 400000,
    "AEROTECH SERVICES": 180000, "ÉNERGIES NOUVELLES": 350000, "DIGITAL FACTORY": 120000, "PRESTIGE AUTO": 200000, "DOMAINE DES CRÊTES": 160000, "TERRA BÂTIMENT": 220000,
    "GAMMA FINANCE": 900000, "HORIZON PATRIMOINE": 450000, NOVATERRA: 600000, "AMBULANCES SECOURS": 110000, "SAS NOVALYS AÉRO": 280000, "LES JARDINS D'ORIANE": 20000,
    "RÉSIDENCE LES PINS": 130000, "IMPRIMERIE MODERNE": 140000, "CLIMATISATION DU SUD": 105000,
  };

  /* SIREN déjà affichés dans societes.html pour les sociétés hors EJM */
  var SIREN_VISIBLES = {
    "LES JARDINS D'ORIANE": "961 559 332", "ALTITUDE CONSEIL": "106 218 754", "SAS NOVALYS AÉRO": "100 844 154", "27 BELLEVUE": "114 143 410", "JULIEN MARCHAL FORMATIONS": "238 124 756",
    "SOUFFLE ET HARMONIE": "194 369 835", "CABINET DE LORME": "218 624 777", MBCOMPTA: "658 018 966", "CHAUFFAGE DU LIMOUSIN": "107 336 244", "HLMT CONSULTING": "146 373 888",
    MARALUNA: "103 280 002", ESTERIA: "345 532 791", "IMMO +": "373 868 763", LOGIVIA: "965 431 012", "VILLA SERENA": "649 899 134", "PL CONSEILS": "605 023 769",
  };

  /* Cabinets de commissariat aux comptes fictifs (jamais le cabinet de démonstration) */
  var CABINETS_CAC = ["FIDUCIAIRE DE L'ATLANTIQUE AUDIT", "CABINET MARTEL AUDIT", "ARCADIA COMMISSARIAT AUX COMPTES", "LEFEBVRE & MOREL AUDIT", "GROUPE SOGEVAL AUDIT", "AUDIT CONSEIL DU SUD-OUEST", "BERTRAND LAMBERT & ASSOCIÉS", "KORELIS AUDIT"];

  /* Fiches reprises de FICHES (lab-dossier.html) : siège, capital, dirigeant, associés.
     Dates (immatriculation, début et fin de mandat) propres au DPJ. */
  var FIXED = {
    paprika: { siege: ["14 quai de la Fosse", "44000", "Nantes"], capital: 20000, dir: ["Camille Rousseau", "Présidente", "pres"], assoc: [["Camille Rousseau", 60], ["Hugo Lefèvre", 40]], imm: "14/03/2017", debut: "14/03/2017", fin: null },
    axiome: { siege: ["8 rue Pasteur", "69003", "Lyon"], capital: 10000, dir: ["Marc Vidal", "gérant", "ger"], assoc: [["Marc Vidal", 100]], imm: "02/07/2009", debut: "02/07/2009", fin: null },
    helios: { siege: ["220 avenue des Pins", "13100", "Aix-en-Provence"], capital: 450000, dir: ["Étienne Marchand", "Président", "pres"], assoc: [["Étienne Marchand", 38], ["Sophie Brun", 27], ["Mathieu Solère", 35, true]], imm: "21/05/2015", debut: "28/06/2021", fin: "28/06/2027", cac: ["LEFEBVRE & MOREL AUDIT", "30/06/2029"] },
    kpl3d: { siege: ["3 rue des Forges", "38000", "Grenoble"], capital: 50000, dir: ["Antoine Faure", "Président", "pres"], assoc: [["Antoine Faure", 55], ["Léa Giraud", 45]], imm: "11/09/2019", debut: "11/09/2019", fin: null },
    orvea: { siege: ["27 rue de la République", "33000", "Bordeaux"], capital: 30000, dir: ["Inès Carpentier", "Présidente", "pres"], assoc: [["Inès Carpentier", 100]], imm: "06/02/2024", debut: "06/02/2024", fin: null },
    "cap-esterel": { siege: ["5 boulevard de la Mer", "83700", "Saint-Raphaël"], capital: 1000, dir: ["Philippe Aubert", "gérant", "ger"], assoc: [["Philippe Aubert", 35], ["Nathalie Aubert", 35], ["Jérôme Costa", 15], ["Valérie Costa", 15]], imm: "19/11/2003", debut: "19/11/2003", fin: null },
    lumen: { siege: ["41 rue du Faubourg", "31000", "Toulouse"], capital: 5000, dir: ["Manon Duval", "Présidente", "pres"], assoc: [], imm: "03/03/2022", debut: "03/03/2022", fin: null },
    "azur-holding": { siege: ["12 avenue Jean Médecin", "06000", "Nice"], capital: 800000, dir: ["Olivier Santini", "Président", "pres"], assoc: [["Olivier Santini", 70], ["Claire Santini", 30]], imm: "12/03/2018", debut: "12/03/2018", fin: null, cac: ["ARCADIA COMMISSARIAT AUX COMPTES", "30/06/2027"] },
    mercier: { siege: ["18 rue de la Paix", "75002", "Paris"], capital: 20000, dir: ["Hélène Mercier", "gérante", "ger"], assoc: [["Hélène Mercier", 50], ["Julien Roche", 30], ["Aurélie Petit", 20]], imm: "05/10/2011", debut: "01/10/2021", fin: "30/09/2027" },
    sourire: { siege: ["9 place Carnot", "54000", "Nancy"], capital: 8000, dir: ["Paul Henry", "gérant", "ger"], assoc: [["Paul Henry", 100]], imm: "04/01/2016", debut: "04/01/2016", fin: null },
    "urban-fit": { siege: ["77 rue des Sports", "59000", "Lille"], capital: 100000, dir: ["Kévin Laurent", "Président", "pres"], assoc: [["Kévin Laurent", 51], ["Sandra Noël", 49]], imm: "12/06/2014", debut: "14/03/2022", fin: "14/03/2027" },
    "tb-elec": { siege: ["3 zone artisanale du Moulin", "49000", "Angers"], capital: 7500, dir: ["Thierry Bouchet", "gérant", "ger"], assoc: [["Thierry Bouchet", 100]], imm: "15/09/2012", debut: "15/09/2012", fin: null },
    "groupe-bmr": { siege: ["1 route de Rennes", "35000", "Rennes"], capital: 2400000, dir: ["Bruno Marchal", "Président-directeur général", "pdg"], assoc: [["Bruno Marchal", 38], ["Claire Marchal", 27]], imm: "18/05/1989", debut: "22/06/2021", fin: "22/06/2027", cac: ["FIDUCIAIRE DE L'ATLANTIQUE AUDIT", "30/06/2027"] },
    neolab: { siege: ["55 rue de la Recherche", "67000", "Strasbourg"], capital: 40000, dir: ["Pierre Weiss", "Président", "pres"], assoc: [], imm: "08/11/2023", debut: "08/11/2023", fin: null },
    odalis: { siege: ["6 rue Gambetta", "34000", "Montpellier"], capital: 5000, dir: ["Sabrina Mallet", "gérante", "ger"], assoc: [["Sabrina Mallet", 100]], imm: "30/04/2010", debut: "30/04/2010", fin: null },
    kalipso: { siege: ["120 quai du Port", "13002", "Marseille"], capital: 15000, dir: ["Karim Haddad", "gérant", "ger"], assoc: [["Karim Haddad", 100]], imm: "21/01/2021", debut: "21/01/2021", fin: null },
    sotrab: { siege: ["Zone industrielle Les Landes", "85000", "La Roche-sur-Yon"], capital: 600000, dir: ["Daniel Chevalier", "Président", "pres"], assoc: [["Daniel Chevalier", 60], ["Marie Chevalier", 40]], imm: "17/09/1996", debut: "17/09/1996", fin: null, cac: ["CABINET MARTEL AUDIT", "30/06/2028"] },
    botanica: { siege: ["14 chemin des Serres", "44300", "Nantes"], capital: 12000, dir: ["Lucie Fabre", "Présidente", "pres"], assoc: [["Lucie Fabre", 100]], imm: "09/05/2013", debut: "09/05/2013", fin: null },
  };

  /* Personnes présentes dans plusieurs sociétés (pour « où X est associé ou dirigeant »).
     dir : dirigeant (et premier associé) ; assoc : associé (deuxième ligne du tableau des associés) */
  var LINKS = [
    { p: "Rémi Castellane", g: "M", dir: ["SCI DU PARC", "HORIZON PATRIMOINE"], assoc: ["SCI LES CHÊNES", "GAMMA FINANCE"] },
    { p: "Nadine Orsoni", g: "F", dir: ["DOMAINE DES CRÊTES", "SCI MONTPLAISIR"], assoc: ["BRASSERIE DU NORD"] },
    { p: "Gaëtan Valcourt", g: "M", dir: ["TERRA BÂTIMENT", "SCI HAUTEVILLE"], assoc: ["LOGISTIQUE OUEST"] },
  ];
  var EXEMPLE_PERSONNE = "Rémi Castellane";

  /* ---------- Personnes ---------- */
  var USED = {};
  [
    "Thomas Girard", "Antoine Faure", "Paul Roussel", "Julien Moreau", "Élodie Garcia", "Laura Perrin", "Claire Dubois", "Nadia Benali", "Léa Fontaine", "Jean Dupond", "Sophie Lambert", "Olivier Garnier", "Marc Renaud",
    "Camille Rousseau", "Hugo Lefèvre", "Marc Vidal", "Étienne Marchand", "Sophie Brun", "Mathieu Solère", "Léa Giraud", "Inès Carpentier", "Philippe Aubert", "Nathalie Aubert", "Jérôme Costa", "Valérie Costa", "Manon Duval",
    "Olivier Santini", "Claire Santini", "Hélène Mercier", "Julien Roche", "Aurélie Petit", "Paul Henry", "Kévin Laurent", "Sandra Noël", "Thierry Bouchet", "Bruno Marchal", "Claire Marchal", "Pierre Weiss", "Sabrina Mallet",
    "Karim Haddad", "Daniel Chevalier", "Marie Chevalier", "Lucie Fabre",
  ].forEach(function (n) {
    USED[n] = 1;
  });
  LINKS.forEach(function (l) {
    USED[l.p] = 1;
  });
  function person(g, last) {
    var gg = g || (rnd() < 0.5 ? "M" : "F");
    var n, l, tries = 0;
    do {
      l = last && tries < 30 ? last : pick(LAST);
      n = pick(gg === "M" ? FM : FF) + " " + l;
      tries++;
    } while (USED[n]);
    USED[n] = 1;
    return { nom: n, g: gg, last: l };
  }
  function fct(role, g) {
    var f = g === "F";
    switch (role) {
      case "pres": return f ? "Présidente" : "Président";
      case "dg": return f ? "Directrice générale" : "Directeur général";
      case "pdg": return f ? "Présidente-directrice générale" : "Président-directeur général";
      case "pca": return f ? "Présidente du conseil d'administration" : "Président du conseil d'administration";
      case "coger": return f ? "Cogérante" : "Cogérant";
      default: return f ? "Gérante" : "Gérant";
    }
  }
  function pcts(n, forme) {
    if (n === 1) return [100];
    if (forme === "SCI" && n >= 2 && n <= 4 && rnd() < 0.5) return n === 2 ? [50, 50] : n === 3 ? [34, 33, 33] : [25, 25, 25, 25];
    if (n === 2) return pick([[50, 50], [60, 40], [70, 30], [51, 49], [80, 20], [55, 45], [75, 25]]);
    var w = [];
    var tot = 0;
    for (var i = 0; i < n; i++) {
      w.push(1 + rnd() * 3 + (i === 0 ? 2 : 0));
      tot += w[i];
    }
    var out = [];
    var acc = 0;
    for (var j = 0; j < n - 1; j++) {
      var v = Math.max(2, Math.round((w[j] / tot) * 100));
      out.push(v);
      acc += v;
    }
    out.push(100 - acc);
    out.sort(function (a, b) {
      return b - a;
    });
    return out;
  }

  /* ---------- Construction des fiches ---------- */
  var SIRENS = {};
  Object.keys(SIREN_VISIBLES).forEach(function (k) {
    SIRENS[SIREN_VISIBLES[k].replace(/ /g, "")] = 1;
  });
  var EJM_BY = {};
  (EJM.societes || []).forEach(function (s) {
    EJM_BY[s.nom] = s;
    SIRENS[s.siren.replace(/ /g, "")] = 1;
  });
  function genSiren() {
    var s;
    do {
      var d = [];
      var sum = 0;
      for (var i = 0; i < 8; i++) {
        d.push(i === 0 ? ri(1, 9) : ri(0, 9));
        var x = d[i];
        if (i % 2 === 1) {
          x *= 2;
          if (x > 9) x -= 9;
        }
        sum += x;
      }
      d.push((10 - (sum % 10)) % 10);
      s = d.join("");
    } while (SIRENS[s]);
    SIRENS[s] = 1;
    return s;
  }
  function fmtSiren(s) {
    return s.slice(0, 3) + " " + s.slice(3, 6) + " " + s.slice(6);
  }
  function genSeat() {
    if (rnd() < 0.24) return [ri(1, 120) + " " + pick(RUES), "750" + pad(pick(ARR)), "Paris"];
    var v = pick(VILLES);
    return [ri(1, 150) + " " + pick(RUES), pick(v[1]), v[0]];
  }
  function genImm() {
    var y = wpick([[ri(1985, 1999), 10], [ri(2000, 2009), 22], [ri(2010, 2017), 28], [ri(2018, 2022), 28], [ri(2023, 2025), 12]]);
    return dstr(y, ri(1, 12), ri(1, 28));
  }
  function genCapital(forme, nom) {
    if (CAP_BIG[nom]) return CAP_BIG[nom];
    switch (forme) {
      case "SAS": return wpick([[1000, 3], [2000, 3], [5000, 4], [10000, 4], [20000, 3], [30000, 2], [37000, 2], [50000, 3], [80000, 1], [100000, 1]]);
      case "SARL": return wpick([[1000, 3], [1500, 2], [3000, 2], [5000, 4], [7500, 2], [8000, 2], [10000, 4], [15000, 2], [20000, 2], [40000, 1], [50000, 1]]);
      case "SA": return wpick([[37000, 3], [100000, 3], [250000, 3], [500000, 2], [1000000, 2]]);
      case "SELARL": return wpick([[5000, 2], [10000, 3], [20000, 3], [40000, 1], [100000, 1]]);
      case "SCP": return 5000;
      case "SCCV": return 1000;
      default: return wpick([[100, 2], [1000, 4], [1500, 3], [2000, 2], [5000, 2], [10000, 2], [76000, 1], [152450, 1]]);
    }
  }
  /* Mandat d'un dirigeant : fin = null pour une durée indéterminée */
  function genMandat(imm, forme) {
    var det = forme === "SA" ? true : forme === "SAS" ? rnd() < 0.5 : rnd() < 0.1;
    if (!det) return { debut: rnd() < 0.65 ? imm : between(imm, "30/09/2026"), fin: null };
    var T = forme === "SA" ? pick([3, 6, 6]) : pick([3, 3, 5, 5, 6]);
    var fin = addDays("19/10/2026", ri(25, T * 365 - 30));
    var debut = addYears(fin, -T);
    if (dkey(debut) < dkey(imm)) debut = imm;
    return { debut: debut, fin: fin };
  }
  function genModif(imm) {
    if (rnd() < 0.2) return imm;
    var a = toUTC(imm);
    var b = toUTC("30/09/2026");
    var frac = Math.pow(rnd(), 0.4);
    return fromUTC(a + Math.floor(((b - a) * frac) / 86400000) * 86400000);
  }
  function genAG(s, imm) {
    var ag;
    var decS = s.decS && dkey(s.decS) <= dkey(MAJ) ? s.decS : null;
    var tenue = s.st === "ok" || s.st === "dep" || s.st === "sig";
    if (s.cl && s.clos && s.dl) {
      var clos = fromDate(s.clos);
      var dl = fromDate(s.dl);
      if (decS) ag = decS;
      else if (tenue) {
        var cap = addDays(MAJ, -4);
        var lo = addDays(clos, 75);
        var hi = dkey(dl) < dkey(cap) ? dl : cap;
        if (dkey(lo) > dkey(hi)) lo = addDays(clos, 20);
        ag = between(lo, hi);
      } else ag = between(addDays(addYears(clos, -1), 75), addYears(dl, -1));
    } else ag = between("15/04/2025", "20/12/2025");
    if (dkey(ag) < dkey(addDays(imm, 120))) return null;
    return ag;
  }

  var SOCS = [];
  var FIX_ID = {};
  (EJM.societes || []).forEach(function (s) {
    FIX_ID[s.nom] = s.id;
  });
  var PROTECT = {};

  EJC.soc.forEach(function (s) {
    var fid = FIX_ID[s.n];
    var fx = fid ? FIXED[fid] : null;
    var forme = s.f;
    var crea = !!s.crea;
    var f = {
      id: fid || slug(s.n),
      nom: s.n,
      forme: forme,
      siren: null,
      siege: null,
      capital: 0,
      activite: "",
      immatriculation: null,
      cloture: s.cl || null,
      dirigeants: [],
      associes: [],
      cac: null,
      derniereAG: null,
      derniereModifStatuts: null,
    };
    /* identité */
    if (fx) {
      f.siren = EJM_BY[s.n].siren;
      f.siege = { adresse: fx.siege[0], cp: fx.siege[1], ville: fx.siege[2] };
      f.capital = fx.capital;
      f.activite = EJM_BY[s.n].activite;
      f.immatriculation = fx.imm;
      PROTECT[f.id] = 1;
    } else {
      var sg = genSeat();
      f.siege = { adresse: sg[0], cp: sg[1], ville: sg[2] };
      f.capital = genCapital(forme, s.n);
      f.activite = ACT[s.n] || "Activités de services";
      if (crea) f.siren = null;
      else if (SIREN_VISIBLES[s.n]) f.siren = SIREN_VISIBLES[s.n];
      else f.siren = fmtSiren(genSiren());
      f.immatriculation = crea ? null : genImm();
    }
    var imm = f.immatriculation || "01/10/2026";

    /* associés et dirigeants */
    var people = [];
    if (fx) {
      fx.assoc.forEach(function (a) {
        var o = { nom: a[0], pct: a[1] };
        if (a[2]) o.indirect = true;
        f.associes.push(o);
      });
      var m0 = { debut: crea ? null : fx.debut, fin: fx.fin };
      f.dirigeants.push({ nom: fx.dir[0], fonction: fx.dir[1], debut: m0.debut, fin: m0.fin, _r: fx.dir[2] });
    } else {
      var n = forme === "SA" ? ri(3, 8)
        : forme === "SCP" ? 3
        : forme === "SCCV" ? 4
        : forme === "SELARL" ? ri(2, 4)
        : forme === "SCI" ? wpick([[2, 4], [3, 3], [4, 2], [5, 1], [6, 1]])
        : wpick([[1, 35], [2, 30], [3, 15], [4, 12], [5, 8]]);
      var first = person();
      people.push(first);
      var famille = forme === "SCI" || rnd() < 0.3;
      for (var k = 1; k < n; k++) people.push(person(null, famille && rnd() < 0.6 ? first.last : null));
      var pc = pcts(n, forme);
      people.forEach(function (p, idx) {
        f.associes.push({ nom: p.nom, pct: pc[idx] });
      });
      if (n >= 2 && rnd() < 0.06 && (forme === "SAS" || forme === "SARL" || forme === "SA")) {
        var last = f.associes[f.associes.length - 1];
        last.nom = pick(MORALES);
        last.morale = true;
      }
      /* dirigeants */
      var main = rnd() < 0.85 ? first : person();
      var mm = genMandat(imm, forme);
      var roles = [];
      if (forme === "SAS") {
        roles.push(["pres", main]);
        if (rnd() < 0.28) roles.push(["dg", people.length > 1 && rnd() < 0.6 ? people[1] : person()]);
      } else if (forme === "SA") {
        if (rnd() < 0.5) roles.push(["pdg", main]);
        else {
          roles.push(["pca", main]);
          roles.push(["dg", people[1] || person()]);
        }
      } else {
        roles.push(["ger", main]);
        if (rnd() < 0.2 && people.length > 1) roles.push(["coger", people[1]]);
      }
      roles.forEach(function (r, idx) {
        var mt = idx === 0 ? mm : genMandat(imm, forme);
        f.dirigeants.push({ nom: r[1].nom, fonction: fct(r[0], r[1].g), debut: crea ? null : mt.debut, fin: crea ? null : mt.fin, _r: r[0], _g: r[1].g });
      });
    }

    /* événements */
    if (!crea) {
      f.derniereModifStatuts = genModif(imm);
      f.derniereAG = genAG(s, imm);
    }
    f._s = s;
    SOCS.push(f);
  });
  var BYNOM = {};
  SOCS.forEach(function (f) {
    BYNOM[f.nom] = f;
  });

  /* Personnes liées à plusieurs sociétés */
  LINKS.forEach(function (l) {
    function prot(nom) {
      var f = BYNOM[nom];
      if (!f) throw new Error("DPJ : société inconnue " + nom);
      PROTECT[f.id] = 1;
      return f;
    }
    l.dir.forEach(function (nom) {
      var f = prot(nom);
      f.dirigeants[0].nom = l.p;
      f.dirigeants[0]._g = l.g;
      f.dirigeants[0].fonction = fct(f.dirigeants[0]._r, l.g);
      f.associes[0].nom = l.p;
      delete f.associes[0].morale;
    });
    l.assoc.forEach(function (nom) {
      var f = prot(nom);
      var idx = Math.min(1, f.associes.length - 1);
      f.associes[idx].nom = l.p;
      delete f.associes[idx].morale;
    });
  });

  /* Commissaires aux comptes : plus grosses sociétés (SA et SAS à fort capital) */
  var ANNEES_CAC = [2027, 2029, 2028, 2027, 2030, 2031, 2027, 2028, 2032, 2029, 2030, 2027];
  var cacN = 0;
  SOCS.forEach(function (f) {
    var fid = FIXED[f.id];
    if (fid && fid.cac) {
      f.cac = { cabinet: fid.cac[0], fin: fid.cac[1] };
      return;
    }
    if (fid || !f.siren) return;
    if (f.forme === "SA" || (f.forme === "SAS" && f.capital >= 400000)) {
      var s = f._s;
      var an = ANNEES_CAC[cacN % ANNEES_CAC.length];
      var fin = s.cl && s.clos ? dstr(an, ((s.clMonth + 6) % 12) + 1, 1) : dstr(an, 6, 30);
      var p = dparts(fin);
      f.cac = { cabinet: CABINETS_CAC[cacN % CABINETS_CAC.length], fin: dstr(p.y, p.m, new Date(Date.UTC(p.y, p.m, 0)).getUTCDate()) };
      cacN++;
    }
  });

  /* Champs manquants réalistes (nombres exacts : 14 dirigeants, 20 associés, 23 AG, 11 statuts) */
  function eligible(pred) {
    return shuffle(
      SOCS.filter(function (f) {
        return pred(f);
      })
    );
  }
  eligible(function (f) {
    return !PROTECT[f.id] && !f._s.crea;
  })
    .slice(0, 14)
    .forEach(function (f) {
      f.dirigeants = [];
    });
  eligible(function (f) {
    return !PROTECT[f.id] && !f._s.crea;
  })
    .slice(0, 18)
    .forEach(function (f) {
      f.associes = [];
    });
  eligible(function (f) {
    var s = f._s;
    var tenue = s.st === "ok" || s.st === "dep" || s.st === "sig" || (s.decS && dkey(s.decS) <= dkey(MAJ));
    return !f._s.crea && !PROTECT[f.id] && !tenue && f.derniereAG;
  })
    .slice(0, 18)
    .forEach(function (f) {
      f.derniereAG = null;
    });
  eligible(function (f) {
    return !f._s.crea && f.derniereModifStatuts;
  })
    .slice(0, 6)
    .forEach(function (f) {
      f.derniereModifStatuts = null;
    });

  /* Nettoyage des champs internes */
  SOCS.forEach(function (f) {
    delete f._s;
    f.dirigeants.forEach(function (d) {
      delete d._r;
      delete d._g;
    });
  });

  /* ---------- Schéma des champs interrogeables ---------- */
  var OPS_TXT = ["=", "!=", "contient", "est_vide", "non_vide"];
  var OPS_LISTE = ["=", "!="];
  var OPS_NUM = ["=", "!=", ">", ">=", "<", "<=", "entre", "est_vide", "non_vide"];
  var OPS_DATE = ["=", "!=", ">", ">=", "<", "<=", "avant", "apres", "entre", "est_vide", "non_vide"];
  var FORMES = ["SAS", "SARL", "SA", "SELARL", "SCI", "SCP", "SCCV"];

  function capFirst(v) {
    v = String(v == null ? "" : v);
    return v.charAt(0).toUpperCase() + v.slice(1);
  }
  function fmtPct(v) {
    return String(v).replace(".", ",") + " %";
  }
  function grpPersonnes(f) {
    var out = [];
    f.dirigeants.forEach(function (d) {
      out.push({ nom: d.nom, role: capFirst(d.fonction) });
    });
    f.associes.forEach(function (a) {
      out.push({ nom: a.nom, role: "Associé (" + fmtPct(a.pct) + ")" });
    });
    return out;
  }

  var FIELD = {};
  var SCHEMA = [];
  function def(id, label, type, ops, groupe, extra) {
    /* schema : entrée sérialisable (envoyée au modèle) ; FIELD : même entrée + accesseurs */
    var entry = { id: id, label: label, type: type, ops: ops, groupe: groupe };
    if (extra && extra.valeurs) entry.valeurs = extra.valeurs;
    var d = { id: id, label: label, type: type, ops: ops, groupe: groupe };
    if (extra) for (var k in extra) d[k] = extra[k];
    FIELD[id] = d;
    SCHEMA.push(entry);
    return d;
  }
  def("nom", "Dénomination", "texte", OPS_TXT, "Identité", { get: function (f) { return f.nom; } });
  def("forme", "Forme juridique", "liste", OPS_LISTE, "Identité", { valeurs: FORMES, get: function (f) { return f.forme; } });
  def("siren", "SIREN", "texte", OPS_TXT, "Identité", { norm: function (v) { return String(v).replace(/\D/g, ""); }, get: function (f) { return f.siren; } });
  def("siege.ville", "Ville du siège", "texte", OPS_TXT, "Siège", { get: function (f) { return f.siege.ville; } });
  def("siege.departement", "Département du siège", "texte", ["=", "!=", "est_vide", "non_vide"], "Siège", { get: function (f) { return f.siege.cp.slice(0, 2); } });
  def("capital", "Capital (euros)", "nombre", OPS_NUM, "Identité", { get: function (f) { return f.capital; } });
  def("activite", "Activité", "texte", OPS_TXT, "Identité", { get: function (f) { return f.activite; } });
  def("immatriculation", "Date d'immatriculation", "date", OPS_DATE, "Identité", { get: function (f) { return f.immatriculation; } });
  def("cloture", "Date de clôture (JJ/MM)", "texte", ["=", "!=", "contient", "est_vide", "non_vide"], "Identité", {
    norm: function (v) {
      var m = String(v).match(/^(\d{1,2})\/(\d{1,2})/);
      return m ? pad(+m[1]) + "/" + pad(+m[2]) : fold(v);
    },
    get: function (f) { return f.cloture; },
  });
  def("dirigeant.nom", "Dirigeant : nom", "texte", OPS_TXT, "Dirigeants", { grp: "dirigeant", pget: function (p) { return p.nom; } });
  def("dirigeant.fonction", "Dirigeant : fonction", "texte", OPS_TXT, "Dirigeants", { grp: "dirigeant", pget: function (p) { return p.fonction; }, fmt: capFirst });
  def("dirigeant.debut", "Dirigeant : début de mandat", "date", OPS_DATE, "Dirigeants", { grp: "dirigeant", pget: function (p) { return p.debut; } });
  def("dirigeant.fin", "Dirigeant : fin de mandat", "date", OPS_DATE, "Dirigeants", {
    grp: "dirigeant",
    pget: function (p) { return p.fin; },
    fmt: function (v) { return v || "durée indéterminée"; },
  });
  def("dirigeant.detail", "Dirigeants et mandats", "texte", ["contient"], "Dirigeants", {
    grp: "dirigeant",
    pget: function (p) { return p.nom + ", " + p.fonction.toLowerCase() + (p.fin ? " (jusqu'au " + p.fin + ")" : ""); },
  });
  def("associe.nom", "Associé : nom", "texte", OPS_TXT, "Associés", { grp: "associe", pget: function (p) { return p.nom; } });
  def("associe.pct", "Associé : part du capital", "pourcentage", OPS_NUM, "Associés", { grp: "associe", pget: function (p) { return p.pct; }, fmt: fmtPct });
  def("associe.detail", "Associés et parts du capital", "texte", ["contient"], "Associés", {
    grp: "associe",
    pget: function (p) { return p.nom + " " + fmtPct(p.pct); },
  });
  def("nbAssocies", "Nombre d'associés", "nombre", OPS_NUM, "Associés", { get: function (f) { return f.associes.length ? f.associes.length : null; } });
  def("personne.nom", "Personne (dirigeant ou associé)", "texte", ["=", "contient", "est_vide", "non_vide"], "Personnes", { grp: "personne", pget: function (p) { return p.nom; } });
  def("personne.role", "Rôle de la personne", "texte", ["contient"], "Personnes", { grp: "personne", pget: function (p) { return p.role; } });
  def("cac.present", "Commissaire aux comptes : présent", "liste", OPS_LISTE, "Commissariat aux comptes", { valeurs: ["oui", "non"], get: function (f) { return f.cac ? "oui" : "non"; } });
  def("cac.cabinet", "Commissaire aux comptes : cabinet", "texte", OPS_TXT, "Commissariat aux comptes", { grp: "cac", pget: function (p) { return p.cabinet; } });
  def("cac.fin", "Commissaire aux comptes : fin de mandat", "date", OPS_DATE, "Commissariat aux comptes", { grp: "cac", pget: function (p) { return p.fin; } });
  def("derniereAG", "Dernière AG d'approbation", "date", OPS_DATE, "Événements", { get: function (f) { return f.derniereAG; } });
  def("derniereModifStatuts", "Dernière modification statutaire", "date", OPS_DATE, "Événements", { get: function (f) { return f.derniereModifStatuts; } });

  var GROUPS = {
    dirigeant: { list: function (f) { return f.dirigeants; }, nomField: "dirigeant.nom", motif: "sans dirigeant renseigné au DPJ", cac: false },
    associe: { list: function (f) { return f.associes; }, nomField: "associe.nom", motif: "sans associé renseigné au DPJ", cac: false },
    personne: { list: grpPersonnes, nomField: "personne.nom", motif: "sans dirigeant ni associé renseigné au DPJ", cac: false },
    cac: { list: function (f) { return f.cac ? [f.cac] : []; }, nomField: "cac.cabinet", motif: "", cac: true },
  };

  /* ---------- Conversion et test de valeurs ---------- */
  function toNum(x) {
    if (typeof x === "number") return isFinite(x) ? x : NaN;
    var t = String(x).replace(/[\s  €%a-zA-Z]/g, "").replace(",", ".");
    if (t === "" || !/^-?\d+(\.\d+)?$/.test(t)) return NaN;
    return parseFloat(t);
  }
  /* Date en JJ/MM/AAAA ou AAAA-MM-JJ ; une année seule vaut son 1er janvier (borne basse) ou son 31 décembre (borne haute) */
  function toDate(x, haut) {
    var s = String(x).trim();
    var m;
    if ((m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/))) return s;
    if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/))) return m[3] + "/" + m[2] + "/" + m[1];
    if ((m = s.match(/^(\d{4})$/))) return haut ? "31/12/" + m[1] : "01/01/" + m[1];
    return null;
  }
  function validDate(s) {
    var p = dparts(s);
    return p.m >= 1 && p.m <= 12 && p.d >= 1 && p.d <= new Date(Date.UTC(p.y, p.m, 0)).getUTCDate();
  }
  function testVal(d, v, op, value) {
    if (op === "est_vide") return v == null || v === "";
    if (op === "non_vide") return !(v == null || v === "");
    if (v == null) return false;
    if (d.type === "texte" || d.type === "liste") {
      var nf = d.norm || fold;
      var a = nf(v);
      var vals = Array.isArray(value) ? value : [value];
      if (op === "=") return vals.some(function (x) { return nf(x) === a; });
      if (op === "!=") return vals.every(function (x) { return nf(x) !== a; });
      if (op === "contient") return vals.some(function (x) { return a.indexOf(fold(d.norm ? d.norm(x) : x)) !== -1; });
      return false;
    }
    if (d.type === "nombre" || d.type === "pourcentage") {
      var n = toNum(v);
      if (op === "entre") return n >= toNum(value[0]) && n <= toNum(value[1]);
      var b = toNum(value);
      return op === "=" ? n === b : op === "!=" ? n !== b : op === ">" ? n > b : op === ">=" ? n >= b : op === "<" ? n < b : op === "<=" ? n <= b : false;
    }
    if (d.type === "date") {
      var k = dkey(v);
      if (op === "entre") return k >= dkey(toDate(value[0], false)) && k <= dkey(toDate(value[1], true));
      var kb = dkey(toDate(value, op === "apres" || op === ">" ? true : false));
      return op === "=" ? k === kb : op === "!=" ? k !== kb : op === ">" || op === "apres" ? k > kb : op === ">=" ? k >= kb : op === "<" || op === "avant" ? k < kb : op === "<=" ? k <= kb : false;
    }
    return false;
  }

  /* Contrôle d'un critère : renvoie un message d'erreur, ou null */
  function checkClause(c) {
    if (!c || typeof c !== "object") return "critère non reconnu : critère vide";
    var d = FIELD[c.field];
    if (!d) return "critère non reconnu : champ « " + c.field + " » inconnu du DPJ";
    if (d.ops.indexOf(c.op) === -1) return "critère non reconnu : opérateur « " + c.op + " » impossible sur « " + d.label + " »";
    if (c.op === "est_vide" || c.op === "non_vide") return null;
    var val = c.value;
    if (val == null || val === "") return "critère non reconnu : valeur manquante pour « " + d.label + " »";
    if (c.op === "entre") {
      if (!Array.isArray(val) || val.length !== 2) return "critère non reconnu : « entre » demande deux bornes pour « " + d.label + " »";
      if (d.type === "date") {
        var a = toDate(val[0], false);
        var b = toDate(val[1], true);
        if (!a || !b || !validDate(a) || !validDate(b)) return "critère non reconnu : dates invalides pour « " + d.label + " » (attendu JJ/MM/AAAA)";
      } else if (isNaN(toNum(val[0])) || isNaN(toNum(val[1]))) return "critère non reconnu : valeurs numériques invalides pour « " + d.label + " »";
      return null;
    }
    if (d.type === "date") {
      var dt = toDate(val, c.op === "apres" || c.op === ">");
      if (Array.isArray(val) || !dt || !validDate(dt)) return "critère non reconnu : date invalide pour « " + d.label + " » (attendu JJ/MM/AAAA)";
    } else if (d.type === "nombre" || d.type === "pourcentage") {
      if (Array.isArray(val) || isNaN(toNum(val))) return "critère non reconnu : valeur numérique invalide pour « " + d.label + " »";
    } else if (d.type === "liste" && d.valeurs) {
      var arr = Array.isArray(val) ? val : [val];
      for (var i = 0; i < arr.length; i++) {
        if (d.valeurs.map(fold).indexOf(fold(arr[i])) === -1) return "critère non reconnu : valeur « " + arr[i] + " » impossible pour « " + d.label + " »";
      }
    }
    return null;
  }

  /* ---------- Évaluation ---------- */
  function evalGroup(f, grp, clauses) {
    var G = GROUPS[grp];
    var list = G.list(f);
    if (!list.length) {
      if (G.cac) {
        var okAll = clauses.every(function (c) {
          return c.op === "est_vide";
        });
        return { res: okAll, matched: [] };
      }
      var miss = null;
      var res = true;
      clauses.forEach(function (c) {
        if (c.field === G.nomField && c.op === "est_vide") return;
        if (c.field === G.nomField && c.op === "non_vide") res = false;
        else if (!miss) miss = c.field;
      });
      if (res === false) return { res: false, matched: [] };
      if (miss) return { res: "missing", field: miss, matched: [] };
      return { res: true, matched: [] };
    }
    var matched = list.filter(function (p) {
      return clauses.every(function (c) {
        var d = FIELD[c.field];
        return testVal(d, d.pget(p), c.op, c.value);
      });
    });
    return { res: matched.length > 0, matched: matched };
  }

  /* Valeur affichée (select) ou de tri */
  function cellValue(f, d, ctx) {
    if (d.grp) {
      var list = ctx.matched[d.grp] || GROUPS[d.grp].list(f);
      var out = [];
      list.forEach(function (p) {
        var v = d.pget(p);
        var s = d.fmt ? d.fmt(v) : v;
        if (s != null && s !== "") out.push(s);
      });
      return out.length ? out.join(" ; ") : null;
    }
    var v2 = d.get(f);
    return v2 == null ? null : v2;
  }
  function sortValue(f, d, ctx) {
    var v;
    if (d.grp) {
      var list = ctx.matched[d.grp] || GROUPS[d.grp].list(f);
      for (var i = 0; i < list.length; i++) {
        v = d.pget(list[i]);
        if (v != null) break;
        v = null;
      }
    } else v = d.get(f);
    if (v == null) return null;
    if (d.type === "date") return dkey(v);
    if (d.type === "nombre" || d.type === "pourcentage") return toNum(v);
    return fold(v);
  }

  function colonnes(select) {
    var out = [{ id: "nom", label: "Société", type: "texte" }];
    (select || []).forEach(function (id) {
      var d = FIELD[id];
      if (d && id !== "nom" && !out.some(function (c) { return c.id === id; })) out.push({ id: id, label: d.label, type: d.type });
    });
    return out;
  }

  function run(query) {
    query = query || {};
    var where = query.where || [];
    var select = query.select || [];
    var errs = [];
    var clauses = [];
    where.forEach(function (c) {
      var e = checkClause(c);
      if (e) errs.push(e);
      else clauses.push({ field: c.field, op: c.op, value: c.value });
    });
    select.forEach(function (id) {
      if (!FIELD[id]) errs.push("critère non reconnu : colonne « " + id + " » inconnue du DPJ");
    });
    var sort = query.sort || { field: "nom", dir: "asc" };
    if (!FIELD[sort.field]) errs.push("critère non reconnu : tri sur « " + sort.field + " » impossible");
    if (errs.length) return { ok: false, erreurs: errs, rows: [], total: 0, exclus: [], maj: MAJ, colonnes: colonnes(select) };

    /* unités : un critère isolé par champ simple, un seul bloc par groupe de personnes */
    var units = [];
    var byGrp = {};
    clauses.forEach(function (c) {
      var d = FIELD[c.field];
      if (d.grp) {
        if (!byGrp[d.grp]) {
          byGrp[d.grp] = { grp: d.grp, clauses: [] };
          units.push(byGrp[d.grp]);
        }
        byGrp[d.grp].clauses.push(c);
      } else units.push({ single: c });
    });

    var exclusMap = {};
    var exclusOrder = [];
    var hits = [];
    SOCS.forEach(function (f) {
      var ctx = { matched: {} };
      var results = units.map(function (u) {
        if (u.grp) {
          var r = evalGroup(f, u.grp, u.clauses);
          ctx.matched[u.grp] = r.matched;
          return r;
        }
        var c = u.single;
        var d = FIELD[c.field];
        var v = d.get(f);
        if ((v == null || v === "") && c.op !== "est_vide" && c.op !== "non_vide") return { res: "missing", field: c.field };
        return { res: testVal(d, v, c.op, c.value) };
      });
      for (var i = 0; i < results.length; i++) if (results[i].res === false) return;
      for (var j = 0; j < results.length; j++) {
        if (results[j].res === "missing") {
          var fld = results[j].field;
          if (!exclusMap[fld]) {
            var dd = FIELD[fld];
            var G = dd.grp ? GROUPS[dd.grp] : null;
            exclusMap[fld] = { field: fld, label: dd.label, count: 0, motif: G && G.motif ? G.motif : "sans « " + dd.label.toLowerCase() + " » au DPJ" };
            exclusOrder.push(fld);
          }
          exclusMap[fld].count++;
          return;
        }
      }
      hits.push({ f: f, ctx: ctx });
    });

    var sd = FIELD[sort.field];
    var dir = sort.dir === "desc" ? -1 : 1;
    hits.forEach(function (h) {
      h.sk = sortValue(h.f, sd, h.ctx);
      h.nk = fold(h.f.nom);
    });
    hits.sort(function (a, b) {
      if (a.sk == null && b.sk == null) return a.nk < b.nk ? -1 : a.nk > b.nk ? 1 : 0;
      if (a.sk == null) return 1;
      if (b.sk == null) return -1;
      if (a.sk < b.sk) return -dir;
      if (a.sk > b.sk) return dir;
      return a.nk < b.nk ? -1 : a.nk > b.nk ? 1 : 0;
    });
    var total = hits.length;
    var lim = query.limit > 0 ? query.limit : hits.length;
    var rows = hits.slice(0, lim).map(function (h) {
      var row = { id: h.f.id, nom: h.f.nom, forme: h.f.forme };
      select.forEach(function (id) {
        row[id] = cellValue(h.f, FIELD[id], h.ctx);
      });
      return row;
    });
    return {
      ok: true,
      erreurs: [],
      rows: rows,
      total: total,
      exclus: exclusOrder.map(function (k) {
        return exclusMap[k];
      }),
      maj: MAJ,
      colonnes: colonnes(select),
    };
  }

  /* ---------- Exemples de démonstration ---------- */
  function ex(question, query) {
    return { question: question, query: query, colonnes: colonnes(query.select) };
  }
  var EXAMPLES = [
    ex("Quels mandats de dirigeants expirent avant le 31/12/2027 ?", {
      where: [{ field: "dirigeant.fin", op: "avant", value: "31/12/2027" }],
      select: ["dirigeant.nom", "dirigeant.fonction", "dirigeant.fin"],
      sort: { field: "dirigeant.fin", dir: "asc" },
    }),
    ex("Quelles SAS ont un capital supérieur à 100 000 € ?", {
      where: [{ field: "forme", op: "=", value: "SAS" }, { field: "capital", op: ">", value: 100000 }],
      select: ["capital", "dirigeant.nom", "siege.ville"],
      sort: { field: "capital", dir: "desc" },
    }),
    ex("Dans quelles sociétés " + EXEMPLE_PERSONNE + " est-il associé ou dirigeant ?", {
      where: [{ field: "personne.nom", op: "=", value: EXEMPLE_PERSONNE }],
      select: ["personne.role", "capital", "siege.ville"],
      sort: { field: "nom", dir: "asc" },
    }),
    ex("Quelles sociétés n'ont pas modifié leurs statuts depuis plus de cinq ans ?", {
      where: [{ field: "derniereModifStatuts", op: "avant", value: "19/10/2021" }],
      select: ["immatriculation", "derniereModifStatuts"],
      sort: { field: "derniereModifStatuts", dir: "asc" },
    }),
    ex("Quelles sociétés ont un commissaire aux comptes dont le mandat se termine en 2027 ?", {
      where: [{ field: "cac.present", op: "=", value: "oui" }, { field: "cac.fin", op: "entre", value: ["01/01/2027", "31/12/2027"] }],
      select: ["cac.cabinet", "cac.fin", "capital"],
      sort: { field: "cac.fin", dir: "asc" },
    }),
    ex("Quelles sociétés ont leur siège à Paris ?", {
      where: [{ field: "siege.ville", op: "=", value: "Paris" }],
      select: ["activite", "dirigeant.nom", "capital"],
      sort: { field: "nom", dir: "asc" },
    }),
    ex("Quelles sociétés immatriculées n'ont aucune dernière AG d'approbation connue ?", {
      where: [{ field: "immatriculation", op: "non_vide" }, { field: "derniereAG", op: "est_vide" }],
      select: ["immatriculation", "dirigeant.nom"],
      sort: { field: "immatriculation", dir: "desc" },
    }),
    ex("Quelles sociétés ont plus de trois associés ?", {
      where: [{ field: "nbAssocies", op: ">", value: 3 }],
      select: ["nbAssocies", "associe.detail"],
      sort: { field: "nbAssocies", dir: "desc" },
    }),
  ];

  /* ---------- Personnes (masquage avant envoi au modèle) ---------- */
  var seen = {};
  var PERSONS = [];
  SOCS.forEach(function (f) {
    f.dirigeants.concat(f.associes).forEach(function (p) {
      if (p.morale || seen[p.nom]) return;
      seen[p.nom] = 1;
      PERSONS.push(p.nom);
    });
  });
  PERSONS.sort(function (a, b) {
    return a.localeCompare(b, "fr");
  });

  /* ---------- Couverture par champ (qualité du DPJ) ---------- */
  function couverture() {
    var tot = SOCS.length;
    function cnt(pred) {
      var n = 0;
      SOCS.forEach(function (f) {
        if (pred(f)) n++;
      });
      return { renseigne: n, manquant: tot - n };
    }
    return {
      societes: tot,
      siren: cnt(function (f) { return !!f.siren; }),
      immatriculation: cnt(function (f) { return !!f.immatriculation; }),
      cloture: cnt(function (f) { return !!f.cloture; }),
      dirigeants: cnt(function (f) { return f.dirigeants.length > 0; }),
      associes: cnt(function (f) { return f.associes.length > 0; }),
      derniereAG: cnt(function (f) { return !!f.derniereAG; }),
      derniereModifStatuts: cnt(function (f) { return !!f.derniereModifStatuts; }),
      cac: cnt(function (f) { return !!f.cac; }),
    };
  }

  window.EJDPJ = {
    maj: MAJ,
    schema: SCHEMA,
    societes: SOCS,
    byId: function (id) {
      for (var i = 0; i < SOCS.length; i++) if (SOCS[i].id === id) return SOCS[i];
      return null;
    },
    run: run,
    examples: EXAMPLES,
    persons: PERSONS,
    couverture: couverture,
    fold: fold,
  };
})();
