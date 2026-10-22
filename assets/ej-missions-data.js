/* Express Juridique · Lifting 2026 · Données fictives partagées
   Missions & conformité (LAB, lettres de mission) et cockpit.
   Cabinet de démonstration : CABINET DELMAS EXPERTISE. Date de référence : 19/10/2026.
   Toutes les données sont fictives. Les sociétés reprennent celles de societes.html. */
(function () {
  var EQUIPE = {
    TG: { nom: "Thomas Girard", role: "Associé, expert-comptable", couleur: "var(--ej-info-600)" },
    LP: { nom: "Laura Perrin", role: "Cheffe de mission", couleur: "var(--ej-tag-coral)" },
    JM: { nom: "Julien Moreau", role: "Collaborateur comptable", couleur: "var(--ej-accent-600)" },
    EG: { nom: "Élodie Garcia", role: "Juriste", couleur: "var(--ej-warning-600)" },
    NB: { nom: "Nadia Benali", role: "Collaboratrice comptable", couleur: "var(--ej-action-700)" },
  };

  /* lab.risque : faible | standard | eleve | null (pas encore évalué)
     lab.statut : a_jour | a_revoir | incomplet | a_ouvrir
     lab.ouverture : date d'ouverture du dossier (identification avant toute lettre de mission)
     lab.criblage : dernier criblage PPE et gel des avoirs (criblage continu, null si jamais fait)
     lab.derniereRevue / prochaineRevue : null tant que le dossier n'a jamais été validé
     lab.pieces : [reçues, attendues] · lab.be : bénéficiaires effectifs connus
     lab.ppe : au moins une personne politiquement exposée identifiée
     lab.gel : "ok" (aucune correspondance) | "a_verifier" (homonymie à lever)
     lm.statut : signee | envoyee | brouillon | a_renouveler | absente
     lm.echeance : fin de la période en cours (lettres à tacite reconduction, prise d'effet à la signature)
     lm.reconduction : false si la lettre n'est pas reconduite (statut a_renouveler)
     lm.honoraires : forfait annuel HT en euros (null si pas de lettre)
     cac : réservé aux missions CAC (prochaine maquette). Une société dont le cabinet
     présente les comptes ne peut pas être aussi son client CAC (incompatibilité
     à faire confirmer par un professionnel) : les clients CAC seront des sociétés distinctes. */
  var SOCIETES = [
    { id: "paprika", nom: "PAPRIKA CANTINE", siren: "795 294 481", forme: "SAS", activite: "Restauration", resp: "LP", cloture: "30/06",
      lab: { ouverture: "01/10/2025", criblage: "18/10/2026", risque: "standard", statut: "a_revoir", derniereRevue: "12/10/2025", prochaineRevue: "12/10/2026", be: 2, ppe: false, gel: "ok", pieces: [5, 6] },
      lm: { statut: "signee", ref: "LM-2025-041", signee: "18/11/2025", echeance: "30/06/2027", honoraires: 6800, missions: ["Présentation des comptes annuels", "Juridique annuel", "Paie (12 bulletins/mois)"] }, cac: false },
    { id: "axiome", nom: "AXIOME", siren: "336 851 161", forme: "SARL", activite: "Conseil en informatique", resp: "JM", cloture: "31/12",
      lab: { ouverture: "28/01/2026", criblage: "18/10/2026", risque: "faible", statut: "a_jour", derniereRevue: "03/02/2026", prochaineRevue: "03/02/2029", be: 1, ppe: false, gel: "ok", pieces: [5, 5] },
      lm: { statut: "signee", ref: "LM-2026-007", signee: "10/02/2026", echeance: "31/12/2026", honoraires: 3900, missions: ["Présentation des comptes annuels", "Juridique annuel"] }, cac: false },
    { id: "helios", nom: "HELIOS SAS", siren: "622 427 249", forme: "SAS", activite: "Installation photovoltaïque", resp: "TG", cloture: "30/06",
      lab: { ouverture: "20/06/2025", criblage: "18/10/2026", risque: "eleve", statut: "a_revoir", derniereRevue: "15/04/2026", prochaineRevue: "15/10/2026", be: 3, ppe: true, gel: "ok", pieces: [7, 8] },
      lm: { statut: "signee", ref: "LM-2025-018", signee: "02/07/2025", echeance: "30/06/2027", honoraires: 14500, missions: ["Présentation des comptes annuels", "Juridique annuel", "Consolidation"] }, cac: false },
    { id: "kpl3d", nom: "KPL3D", siren: "187 094 208", forme: "SAS", activite: "Impression 3D industrielle", resp: "LP", cloture: "30/09",
      lab: { ouverture: "20/05/2026", criblage: "18/10/2026", risque: "standard", statut: "a_jour", derniereRevue: "20/05/2026", prochaineRevue: "20/05/2028", be: 2, ppe: false, gel: "ok", pieces: [6, 6] },
      lm: { statut: "envoyee", ref: "LM-2026-052", envoyee: "14/10/2026", echeance: "30/09/2027", honoraires: 5200, missions: ["Présentation des comptes annuels", "Juridique annuel"] }, cac: false },
    { id: "orvea", nom: "ORVEA", siren: "119 576 308", forme: "SAS", activite: "Cosmétique", resp: "NB", cloture: "31/12",
      lab: { ouverture: "08/09/2026", criblage: "18/10/2026", risque: "standard", statut: "incomplet", derniereRevue: null, prochaineRevue: null, be: 1, ppe: false, gel: "ok", pieces: [3, 6] },
      lm: { statut: "brouillon", ref: "LM-2026-058", echeance: "31/12/2027", honoraires: 4600, missions: ["Présentation des comptes annuels", "Paie (5 bulletins/mois)"] }, cac: false },
    { id: "cap-esterel", nom: "CAP ESTEREL", siren: "359 945 830", forme: "SCI", activite: "Location immobilière", resp: "EG", cloture: "31/12",
      lab: { ouverture: "25/08/2026", criblage: "18/10/2026", risque: "eleve", statut: "a_jour", derniereRevue: "02/09/2026", prochaineRevue: "02/09/2027", be: 2, ppe: false, gel: "ok", pieces: [8, 8] },
      lm: { statut: "signee", ref: "LM-2026-033", signee: "05/09/2026", echeance: "31/12/2026", honoraires: 2400, missions: ["Comptes annuels SCI", "Déclaration 2072", "Juridique annuel"] }, cac: false },
    { id: "lumen", nom: "LUMEN", siren: "961 913 731", forme: "SAS", activite: "Agence de communication", resp: "JM", cloture: "31/12",
      lab: { ouverture: null, criblage: null, risque: null, statut: "a_ouvrir", derniereRevue: null, prochaineRevue: null, be: 0, ppe: false, gel: "ok", pieces: [0, 5] },
      lm: { statut: "absente", ref: null, echeance: null, honoraires: null, missions: [] }, cac: false },
    { id: "azur-holding", nom: "AZUR HOLDING", siren: "650 309 775", forme: "SAS", activite: "Holding animatrice", resp: "TG", cloture: "31/12",
      lab: { ouverture: "02/06/2026", criblage: "18/10/2026", risque: "eleve", statut: "a_jour", derniereRevue: "11/06/2026", prochaineRevue: "11/06/2027", be: 2, ppe: true, gel: "ok", pieces: [9, 9] },
      lm: { statut: "signee", ref: "LM-2026-021", signee: "20/06/2026", echeance: "31/12/2026", honoraires: 9800, missions: ["Présentation des comptes annuels", "Juridique annuel", "Intégration fiscale"] }, cac: false },
    { id: "mercier", nom: "MERCIER & ASSOCIES", siren: "757 508 228", forme: "SELARL", activite: "Cabinet d'avocats", resp: "LP", cloture: "30/06",
      lab: { ouverture: "16/01/2023", criblage: "18/10/2026", risque: "standard", statut: "a_jour", derniereRevue: "17/03/2026", prochaineRevue: "17/03/2028", be: 2, ppe: false, gel: "ok", pieces: [6, 6] },
      lm: { statut: "a_renouveler", reconduction: false, ref: "LM-2023-012", signee: "02/02/2023", echeance: "30/06/2026", honoraires: 7200, missions: ["Présentation des comptes annuels", "Déclarations BNC des associés"] }, cac: false },
    { id: "sourire", nom: "SOURIRE DENTAIRE", siren: "362 964 565", forme: "SELARL", activite: "Cabinet dentaire", resp: "NB", cloture: "31/12",
      lab: { ouverture: "20/01/2026", criblage: "18/10/2026", risque: "faible", statut: "a_jour", derniereRevue: "28/01/2026", prochaineRevue: "28/01/2029", be: 1, ppe: false, gel: "ok", pieces: [5, 5] },
      lm: { statut: "signee", ref: "LM-2026-004", signee: "30/01/2026", echeance: "31/12/2026", honoraires: 4100, missions: ["Présentation des comptes annuels", "Paie (4 bulletins/mois)"] }, cac: false },
    { id: "urban-fit", nom: "URBAN FIT CLUB", siren: "272 577 898", forme: "SAS", activite: "Salle de sport", resp: "JM", cloture: "31/08",
      lab: { ouverture: "01/10/2024", criblage: "18/10/2026", risque: "standard", statut: "a_revoir", derniereRevue: "05/10/2024", prochaineRevue: "05/10/2026", be: 2, ppe: false, gel: "ok", pieces: [5, 6] },
      lm: { statut: "signee", ref: "LM-2024-066", signee: "12/10/2024", echeance: "31/08/2027", honoraires: 5600, missions: ["Présentation des comptes annuels", "Paie (9 bulletins/mois)"] }, cac: false },
    { id: "tb-elec", nom: "TB ELECTRICITE", siren: "100 017 061", forme: "SARL", activite: "Électricité générale", resp: "NB", cloture: "31/12",
      lab: { ouverture: "10/04/2026", criblage: "18/10/2026", risque: "faible", statut: "a_jour", derniereRevue: "14/04/2026", prochaineRevue: "14/04/2029", be: 1, ppe: false, gel: "ok", pieces: [5, 5] },
      lm: { statut: "signee", ref: "LM-2026-015", signee: "20/04/2026", echeance: "31/12/2026", honoraires: 3300, missions: ["Présentation des comptes annuels"] }, cac: false },
    { id: "groupe-bmr", nom: "GROUPE BMR", siren: "114 974 823", forme: "SA", activite: "Négoce de matériaux", resp: "TG", cloture: "31/12",
      lab: { ouverture: "02/09/2026", criblage: "18/10/2026", risque: "standard", statut: "a_jour", derniereRevue: "09/09/2026", prochaineRevue: "09/09/2028", be: 2, ppe: false, gel: "ok", pieces: [7, 7] },
      lm: { statut: "signee", ref: "LM-2026-039", signee: "16/09/2026", echeance: "31/12/2026", honoraires: 18900, missions: ["Présentation des comptes annuels", "Juridique annuel", "Consolidation"] }, cac: false },
    { id: "neolab", nom: "NEOLAB.", siren: "371 758 930", forme: "SAS", activite: "Biotechnologies", resp: "LP", cloture: "31/12",
      lab: { ouverture: "11/10/2026", criblage: "11/10/2026", risque: null, statut: "incomplet", derniereRevue: null, prochaineRevue: null, be: 0, ppe: false, gel: "ok", pieces: [2, 6] },
      lm: { statut: "brouillon", ref: "LM-2026-055", echeance: "31/12/2027", honoraires: 8400, missions: ["Présentation des comptes annuels", "Juridique annuel", "Crédit d'impôt recherche"] }, cac: false },
    { id: "odalis", nom: "ODALIS", siren: "873 341 810", forme: "SARL", activite: "Services à la personne", resp: "EG", cloture: "31/12",
      lab: { ouverture: "01/03/2023", criblage: "18/10/2026", risque: "faible", statut: "a_jour", derniereRevue: "22/02/2026", prochaineRevue: "22/02/2029", be: 1, ppe: false, gel: "ok", pieces: [5, 5] },
      lm: { statut: "a_renouveler", reconduction: false, ref: "LM-2023-031", signee: "15/03/2023", echeance: "31/12/2025", honoraires: 8200, missions: ["Présentation des comptes annuels", "Paie (14 bulletins/mois)"] }, cac: false },
    { id: "kalipso", nom: "KALIPSO SARL", siren: "906 661 239", forme: "SARL", activite: "Import de textiles", resp: "JM", cloture: "31/12",
      lab: { ouverture: "01/10/2026", criblage: "01/10/2026", risque: "eleve", statut: "incomplet", derniereRevue: null, prochaineRevue: null, be: 1, ppe: false, gel: "a_verifier", pieces: [4, 8] },
      lm: { statut: "brouillon", ref: "LM-2026-057", echeance: "31/12/2027", honoraires: 4900, missions: ["Présentation des comptes annuels", "TVA mensuelle"] }, cac: false },
    { id: "sotrab", nom: "SOTRAB", siren: "278 917 483", forme: "SAS", activite: "Travaux publics", resp: "TG", cloture: "31/03",
      lab: { ouverture: "10/09/2026", criblage: "18/10/2026", risque: "standard", statut: "a_jour", derniereRevue: "16/09/2026", prochaineRevue: "16/09/2028", be: 2, ppe: false, gel: "ok", pieces: [6, 6] },
      lm: { statut: "signee", ref: "LM-2026-041", signee: "18/09/2026", echeance: "31/03/2027", honoraires: 16900, missions: ["Présentation des comptes annuels", "Juridique annuel", "Paie (32 bulletins/mois)"] }, cac: false },
    { id: "botanica", nom: "BOTANICA", siren: "107 106 376", forme: "SAS", activite: "Jardinerie", resp: "NB", cloture: "31/03",
      lab: { ouverture: "20/07/2023", criblage: "18/10/2026", risque: "faible", statut: "a_revoir", derniereRevue: "02/08/2023", prochaineRevue: "02/08/2026", be: 1, ppe: false, gel: "ok", pieces: [4, 5] },
      lm: { statut: "signee", ref: "LM-2025-029", signee: "10/04/2025", echeance: "31/03/2027", honoraires: 4300, missions: ["Présentation des comptes annuels"] }, cac: false },
  ];

  /* Bibliothèque de prestations (lettres de mission). Prix indicatifs du cabinet fictif. */
  var PRESTATIONS = [
    { id: "presentation", famille: "Comptable", libelle: "Présentation des comptes annuels", base: "Forfait annuel", prix: 2800 },
    { id: "tenue", famille: "Comptable", libelle: "Tenue de la comptabilité", base: "Forfait annuel", prix: 1800 },
    { id: "tva", famille: "Fiscal", libelle: "TVA mensuelle", base: "Forfait annuel", prix: 960 },
    { id: "liasse", famille: "Fiscal", libelle: "Liasse fiscale et déclarations annuelles", base: "Forfait annuel", prix: 650 },
    { id: "paie", famille: "Social", libelle: "Paie", base: "Par bulletin", prix: 32 },
    { id: "juridique", famille: "Juridique", libelle: "Juridique annuel", base: "Forfait annuel", prix: 650, ej: true },
    { id: "registres", famille: "Juridique", libelle: "Tenue des registres légaux", base: "Forfait annuel", prix: 180, ej: true },
    { id: "modif", famille: "Juridique", libelle: "Modification statutaire", base: "Par opération", prix: 450, ej: true },
    { id: "sci", famille: "Comptable", libelle: "Comptes annuels SCI", base: "Forfait annuel", prix: 1400 },
    { id: "consolidation", famille: "Comptable", libelle: "Consolidation", base: "Forfait annuel", prix: 4600 },
    { id: "d2072", famille: "Fiscal", libelle: "Déclaration 2072", base: "Forfait annuel", prix: 350 },
    { id: "bnc", famille: "Fiscal", libelle: "Déclarations BNC des associés", base: "Forfait annuel", prix: 2400 },
    { id: "integration", famille: "Fiscal", libelle: "Intégration fiscale", base: "Forfait annuel", prix: 2600 },
    { id: "cir", famille: "Fiscal", libelle: "Crédit d'impôt recherche", base: "Forfait annuel", prix: 3200 },
    { id: "conseil", famille: "Conseil", libelle: "Conseil et assistance", base: "Au temps passé", prix: 140 },
  ];

  /* Modèles de lettre de mission */
  var MODELES = [
    { id: "pme", libelle: "Mission de présentation · PME", desc: "Comptable, fiscal et juridique annuel. Le plus utilisé du cabinet.", usage: 62 },
    { id: "sci", libelle: "SCI · comptes et 2072", desc: "Comptes annuels, déclaration 2072 et juridique annuel.", usage: 14 },
    { id: "liberal", libelle: "Profession libérale · BNC", desc: "Déclaration 2035 et déclarations des associés.", usage: 9 },
    { id: "social", libelle: "Mission sociale seule", desc: "Paie, déclarations sociales, contrats de travail.", usage: 6 },
  ];

  window.EJM = {
    today: "19/10/2026",
    cabinet: "CABINET DELMAS EXPERTISE",
    equipe: EQUIPE,
    societes: SOCIETES,
    prestations: PRESTATIONS,
    modeles: MODELES,
    totalSocietes: 135,
    find: function (id) {
      return SOCIETES.filter(function (s) { return s.id === id; })[0] || SOCIETES[0];
    },
    esc: function (s) {
      return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    },
    euros: function (n) {
      return n == null ? "" : n.toLocaleString("fr-FR").replace(/ /g, " ") + " €";
    },
    RISQUE: { faible: "Risque faible", standard: "Risque standard", eleve: "Risque élevé" },
    VIGILANCE: { faible: "Vigilance simplifiée", standard: "Vigilance standard", eleve: "Vigilance renforcée" },
    LAB_STATUT: { a_jour: "À jour", a_revoir: "Revue échue", incomplet: "Pièces manquantes", a_ouvrir: "Dossier à ouvrir" },
    LM_STATUT: { signee: "Signée", envoyee: "Envoyée pour signature", brouillon: "Brouillon", a_renouveler: "À renouveler", absente: "Aucune lettre" },
  };
})();
