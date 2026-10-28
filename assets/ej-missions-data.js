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
    SR: { nom: "Sophie Roux", role: "Associée, expert-comptable", couleur: "var(--ej-tag-coral)" },
    CD: { nom: "Claire Dubois", role: "Associée, commissaire aux comptes", couleur: "var(--ej-primary-500)" },
    LF: { nom: "Léa Fontaine", role: "Auditrice", couleur: "var(--ej-neutral-600)" },
    JD: { nom: "Jean Dupond", role: "Auditeur", couleur: "var(--ej-accent-600)" },
  };

  /* lab.risque : faible | standard | eleve | null (pas encore évalué)
     lab.statut : a_jour | a_revoir | incomplet | a_ouvrir | fin_relation (revue conclue par la fin de la relation : plus de prochaine revue)
     lab.ouverture : date d'ouverture du dossier (identification avant toute lettre de mission)
     lab.criblage : dernier criblage PPE et gel des avoirs (criblage continu, null si jamais fait)
     lab.derniereRevue / prochaineRevue : null tant que le dossier n'a jamais été validé
     lab.pieces : [reçues, attendues] · lab.be : bénéficiaires effectifs connus
     lab.ppe : au moins une personne politiquement exposée identifiée
     lab.changements : [date, événement, source] relevés par EJ depuis la dernière revue (formalités, registres) ; [] = aucun
     associe : associé signataire de la mission, qui valide les revues (sauf PPE, risque élevé ou homonymie : responsable LAB)
     lab.gel : "ok" (aucune correspondance) | "a_verifier" (homonymie à lever)
     lm.statut : signee | envoyee | brouillon | a_renouveler | absente
     lm.echeance : fin de la période en cours (lettres à tacite reconduction, prise d'effet à la signature)
     lm.reconduction : false si la lettre n'est pas reconduite (statut a_renouveler)
     lm.honoraires : forfait annuel HT en euros (null si pas de lettre)
     cac : toujours false. Une société dont le cabinet présente les comptes ne peut pas
     être aussi contrôlée par lui (incompatibilité à faire confirmer par un professionnel) :
     les entités contrôlées sont dans MANDATS, plus bas. */
  var SOCIETES = [
    { id: "paprika", nom: "PAPRIKA CANTINE", siren: "795 294 481", forme: "SAS", activite: "Restauration", resp: "LP", associe: "SR", cloture: "30/06",
      lab: { ouverture: "01/10/2025", criblage: "18/10/2026", risque: "standard", statut: "a_revoir", derniereRevue: "12/10/2025", prochaineRevue: "12/10/2026", be: 2, ppe: false, gel: "ok", pieces: [5, 6], changements: [["03/03/2026", "Transfert du siège social au 14 quai de la Fosse, Nantes", "Formalité F-2026-0212"]] },
      lm: { statut: "signee", ref: "LM-2025-041", signee: "18/11/2025", echeance: "30/06/2027", honoraires: 6800, missions: ["Présentation des comptes annuels", "Juridique annuel", "Paie (12 bulletins/mois)"] }, cac: false },
    { id: "axiome", nom: "AXIOME", siren: "336 851 161", forme: "SARL", activite: "Conseil en informatique", resp: "JM", associe: "TG", cloture: "31/12",
      lab: { ouverture: "28/01/2026", criblage: "18/10/2026", risque: "faible", statut: "a_jour", derniereRevue: "03/02/2026", prochaineRevue: "03/02/2029", be: 1, ppe: false, gel: "ok", pieces: [5, 5] },
      lm: { statut: "signee", ref: "LM-2026-007", signee: "10/02/2026", echeance: "31/12/2026", honoraires: 3900, missions: ["Présentation des comptes annuels", "Juridique annuel"] }, cac: false },
    { id: "helios", nom: "HELIOS SAS", siren: "622 427 249", forme: "SAS", activite: "Installation photovoltaïque", resp: "TG", associe: "TG", cloture: "30/06",
      lab: { ouverture: "20/06/2025", criblage: "18/10/2026", risque: "eleve", statut: "a_revoir", derniereRevue: "15/04/2026", prochaineRevue: "15/10/2026", be: 3, ppe: true, gel: "ok", pieces: [7, 8], changements: [["12/06/2026", "Cession de 27 % des actions à Sophie Brun, qui devient bénéficiaire effective", "Registre des mouvements de titres"], ["02/07/2026", "Nomination d'un directeur général délégué", "Formalité F-2026-0307"]] },
      lm: { statut: "signee", ref: "LM-2025-018", signee: "02/07/2025", echeance: "30/06/2027", honoraires: 14500, missions: ["Présentation des comptes annuels", "Juridique annuel", "Consolidation"] }, cac: false },
    { id: "kpl3d", nom: "KPL3D", siren: "187 094 208", forme: "SAS", activite: "Impression 3D industrielle", resp: "LP", associe: "SR", cloture: "30/09",
      lab: { ouverture: "20/05/2026", criblage: "18/10/2026", risque: "standard", statut: "a_jour", derniereRevue: "20/05/2026", prochaineRevue: "20/05/2028", be: 2, ppe: false, gel: "ok", pieces: [6, 6] },
      lm: { statut: "envoyee", ref: "LM-2026-052", envoyee: "14/10/2026", echeance: "30/09/2027", honoraires: 5200, missions: ["Présentation des comptes annuels", "Juridique annuel"] }, cac: false },
    { id: "orvea", nom: "ORVEA", siren: "119 576 308", forme: "SAS", activite: "Cosmétique", resp: "NB", associe: "TG", cloture: "31/12",
      lab: { ouverture: "08/09/2026", criblage: "18/10/2026", risque: "standard", statut: "incomplet", derniereRevue: null, prochaineRevue: null, be: 1, ppe: false, gel: "ok", pieces: [3, 6] },
      lm: { statut: "brouillon", ref: "LM-2026-058", echeance: "31/12/2027", honoraires: 4600, missions: ["Présentation des comptes annuels", "Paie (5 bulletins/mois)"] }, cac: false },
    { id: "cap-esterel", nom: "CAP ESTEREL", siren: "359 945 830", forme: "SCI", activite: "Location immobilière", resp: "EG", associe: "TG", cloture: "31/12",
      lab: { ouverture: "25/08/2026", criblage: "18/10/2026", risque: "eleve", statut: "a_jour", derniereRevue: "02/09/2026", prochaineRevue: "02/09/2027", be: 2, ppe: false, gel: "ok", pieces: [8, 8] },
      lm: { statut: "signee", ref: "LM-2026-033", signee: "05/09/2026", echeance: "31/12/2026", honoraires: 2400, missions: ["Comptes annuels SCI", "Déclaration 2072", "Juridique annuel"] }, cac: false },
    { id: "lumen", nom: "LUMEN", siren: "961 913 731", forme: "SAS", activite: "Agence de communication", resp: "JM", associe: "TG", cloture: "31/12",
      lab: { ouverture: null, criblage: null, risque: null, statut: "a_ouvrir", derniereRevue: null, prochaineRevue: null, be: 0, ppe: false, gel: "ok", pieces: [0, 5] },
      lm: { statut: "absente", ref: null, echeance: null, honoraires: null, missions: [] }, cac: false },
    { id: "azur-holding", nom: "AZUR HOLDING", siren: "650 309 775", forme: "SAS", activite: "Holding animatrice", resp: "TG", associe: "TG", cloture: "31/12",
      lab: { ouverture: "02/06/2026", criblage: "18/10/2026", risque: "eleve", statut: "a_jour", derniereRevue: "11/06/2026", prochaineRevue: "11/06/2027", be: 2, ppe: true, gel: "ok", pieces: [9, 9] },
      lm: { statut: "signee", ref: "LM-2026-021", signee: "20/06/2026", echeance: "31/12/2026", honoraires: 9800, missions: ["Présentation des comptes annuels", "Juridique annuel", "Intégration fiscale"] }, cac: false },
    { id: "mercier", nom: "MERCIER & ASSOCIES", siren: "757 508 228", forme: "SELARL", activite: "Cabinet d'avocats", resp: "LP", associe: "SR", cloture: "30/06",
      lab: { ouverture: "16/01/2023", criblage: "18/10/2026", risque: "standard", statut: "a_jour", derniereRevue: "17/03/2026", prochaineRevue: "17/03/2028", be: 2, ppe: false, gel: "ok", pieces: [6, 6] },
      lm: { statut: "a_renouveler", reconduction: false, ref: "LM-2023-012", signee: "02/02/2023", echeance: "30/06/2026", honoraires: 7200, missions: ["Présentation des comptes annuels", "Déclarations BNC des associés"] }, cac: false },
    { id: "sourire", nom: "SOURIRE DENTAIRE", siren: "362 964 565", forme: "SELARL", activite: "Cabinet dentaire", resp: "NB", associe: "SR", cloture: "31/12",
      lab: { ouverture: "20/01/2026", criblage: "18/10/2026", risque: "faible", statut: "a_jour", derniereRevue: "28/01/2026", prochaineRevue: "28/01/2029", be: 1, ppe: false, gel: "ok", pieces: [5, 5] },
      lm: { statut: "signee", ref: "LM-2026-004", signee: "30/01/2026", echeance: "31/12/2026", honoraires: 4100, missions: ["Présentation des comptes annuels", "Paie (4 bulletins/mois)"] }, cac: false },
    { id: "urban-fit", nom: "URBAN FIT CLUB", siren: "272 577 898", forme: "SAS", activite: "Salle de sport", resp: "JM", associe: "SR", cloture: "31/08",
      lab: { ouverture: "01/10/2024", criblage: "18/10/2026", risque: "standard", statut: "a_revoir", derniereRevue: "05/10/2024", prochaineRevue: "05/10/2026", be: 2, ppe: false, gel: "ok", pieces: [5, 6], changements: [["14/01/2025", "Augmentation de capital portée à 100 000 €", "Formalité F-2025-0019"], ["30/06/2025", "Entrée de Sandra Noël au capital (49 %)", "Registre des mouvements de titres"]] },
      lm: { statut: "signee", ref: "LM-2024-066", signee: "12/10/2024", echeance: "31/08/2027", honoraires: 5600, missions: ["Présentation des comptes annuels", "Paie (9 bulletins/mois)"] }, cac: false },
    { id: "tb-elec", nom: "TB ELECTRICITE", siren: "100 017 061", forme: "SARL", activite: "Électricité générale", resp: "NB", associe: "SR", cloture: "31/12",
      lab: { ouverture: "10/04/2026", criblage: "18/10/2026", risque: "faible", statut: "a_jour", derniereRevue: "14/04/2026", prochaineRevue: "14/04/2029", be: 1, ppe: false, gel: "ok", pieces: [5, 5] },
      lm: { statut: "signee", ref: "LM-2026-015", signee: "20/04/2026", echeance: "31/12/2026", honoraires: 3300, missions: ["Présentation des comptes annuels"] }, cac: false },
    { id: "groupe-bmr", nom: "GROUPE BMR", siren: "114 974 823", forme: "SA", activite: "Négoce de matériaux", resp: "TG", associe: "TG", cloture: "31/12",
      lab: { ouverture: "02/09/2026", criblage: "18/10/2026", risque: "standard", statut: "a_jour", derniereRevue: "09/09/2026", prochaineRevue: "09/09/2028", be: 2, ppe: false, gel: "ok", pieces: [7, 7] },
      lm: { statut: "signee", ref: "LM-2026-039", signee: "16/09/2026", echeance: "31/12/2026", honoraires: 18900, missions: ["Présentation des comptes annuels", "Juridique annuel", "Consolidation"] }, cac: false },
    { id: "neolab", nom: "NEOLAB.", siren: "371 758 930", forme: "SAS", activite: "Biotechnologies", resp: "LP", associe: "SR", cloture: "31/12",
      lab: { ouverture: "11/10/2026", criblage: "11/10/2026", risque: null, statut: "incomplet", derniereRevue: null, prochaineRevue: null, be: 0, ppe: false, gel: "ok", pieces: [2, 6] },
      lm: { statut: "brouillon", ref: "LM-2026-055", echeance: "31/12/2027", honoraires: 8400, missions: ["Présentation des comptes annuels", "Juridique annuel", "Crédit d'impôt recherche"] }, cac: false },
    { id: "odalis", nom: "ODALIS", siren: "873 341 810", forme: "SARL", activite: "Services à la personne", resp: "EG", associe: "SR", cloture: "31/12",
      lab: { ouverture: "01/03/2023", criblage: "18/10/2026", risque: "faible", statut: "a_jour", derniereRevue: "22/02/2026", prochaineRevue: "22/02/2029", be: 1, ppe: false, gel: "ok", pieces: [5, 5] },
      lm: { statut: "a_renouveler", reconduction: false, ref: "LM-2023-031", signee: "15/03/2023", echeance: "31/12/2025", honoraires: 8200, missions: ["Présentation des comptes annuels", "Paie (14 bulletins/mois)"] }, cac: false },
    { id: "kalipso", nom: "KALIPSO SARL", siren: "906 661 239", forme: "SARL", activite: "Import de textiles", resp: "JM", associe: "TG", cloture: "31/12",
      lab: { ouverture: "01/10/2026", criblage: "18/10/2026", risque: "eleve", statut: "incomplet", derniereRevue: null, prochaineRevue: null, be: 1, ppe: false, gel: "a_verifier", pieces: [4, 8] },
      lm: { statut: "brouillon", ref: "LM-2026-057", echeance: "31/12/2027", honoraires: 4900, missions: ["Présentation des comptes annuels", "TVA mensuelle"] }, cac: false },
    { id: "sotrab", nom: "SOTRAB", siren: "278 917 483", forme: "SAS", activite: "Travaux publics", resp: "TG", associe: "TG", cloture: "31/03",
      lab: { ouverture: "10/09/2026", criblage: "18/10/2026", risque: "standard", statut: "a_jour", derniereRevue: "16/09/2026", prochaineRevue: "16/09/2028", be: 2, ppe: false, gel: "ok", pieces: [6, 6] },
      lm: { statut: "signee", ref: "LM-2026-041", signee: "18/09/2026", echeance: "31/03/2027", honoraires: 16900, missions: ["Présentation des comptes annuels", "Juridique annuel", "Paie (32 bulletins/mois)"] }, cac: false },
    { id: "botanica", nom: "BOTANICA", siren: "107 106 376", forme: "SAS", activite: "Jardinerie", resp: "NB", associe: "SR", cloture: "31/03",
      lab: { ouverture: "20/07/2023", criblage: "18/10/2026", risque: "faible", statut: "a_revoir", derniereRevue: "02/08/2023", prochaineRevue: "02/08/2026", be: 1, ppe: false, gel: "ok", pieces: [4, 5], changements: [] },
      lm: { statut: "signee", ref: "LM-2025-029", signee: "10/04/2025", echeance: "31/03/2027", honoraires: 4300, missions: ["Présentation des comptes annuels"] }, cac: false },
  ];


  /* ---------- Missions CAC (profil commissaire aux comptes ou mixte) ----------
     Entités DISTINCTES des clients EC ci-dessus : le cabinet ne tient pas leur
     comptabilité et ne fait pas leur juridique (incompatibilités, à faire confirmer).
     type : legal (mandat légal, six exercices) | alpe (audit légal petites entreprises, trois exercices)
            | contractuel (audit contractuel, un exercice)
     premier / dernier : premier et dernier exercice du mandat (année de clôture)
     ex : exercice en cours de contrôle. phase : acceptation | planification | interim | final | rapports | emis
     heures : [budget, réalisées] · interventions : [libellé, du, au, statut fait|en_cours|prevu]
     ag : date prévue de l'AG d'approbation (null si non fixée)
     lm : lettre de mission CAC (signee | envoyee | a_etablir) ; établie après l'acceptation de la mission
     independance : déclaration annuelle de l'équipe (a_jour | a_renouveler | a_faire)
     lab : même structure que les dossiers EC (lab.html les affiche en profil CAC ou mixte) ;
     beDefaut : true si le bénéficiaire effectif retenu est le représentant légal, à défaut (association) */
  var MANDATS = [
    { id: "vertalis", nom: "VERTALIS SA", siren: "412 386 950", forme: "SA", activite: "Chimie de spécialité", cloture: "31/12", signataire: "CD", equipe: ["LF"], cocac: null,
      type: "legal", premier: 2021, dernier: 2026, nomination: "18/06/2021", honoraires: 31200,
      ex: { clos: "31/12/2026", phase: "interim", avancement: 15, heures: [260, 38] },
      interventions: [["Prise de connaissance et planification", "05/10/2026", "09/10/2026", "fait"], ["Intérim", "16/11/2026", "27/11/2026", "prevu"], ["Final", "08/02/2027", "19/02/2027", "prevu"]],
      ag: "17/06/2027", lm: { statut: "signee", ref: "LM-CAC-2021-003", date: "06/09/2021" }, independance: { statut: "a_jour", date: "05/01/2026" },
      lab: { ouverture: "02/06/2021", criblage: "18/10/2026", risque: "standard", statut: "a_jour", derniereRevue: "12/01/2026", prochaineRevue: "12/01/2028", be: 2, ppe: false, gel: "ok", pieces: [6, 6] } },
    { id: "nordia", nom: "NORDIA LOGISTIQUE", siren: "523 904 117", forme: "SAS", activite: "Transport et entreposage", cloture: "30/06", signataire: "CD", equipe: ["JD"], cocac: null,
      type: "legal", premier: 2024, dernier: 2029, nomination: "12/12/2023", honoraires: 25200,
      ex: { clos: "30/06/2026", phase: "rapports", avancement: 85, heures: [210, 228] },
      interventions: [["Intérim", "11/05/2026", "15/05/2026", "fait"], ["Final", "21/09/2026", "02/10/2026", "fait"], ["Rapports", "26/10/2026", "13/11/2026", "prevu"]],
      ag: "15/12/2026", lm: { statut: "signee", ref: "LM-CAC-2023-011", date: "08/01/2024" }, independance: { statut: "a_jour", date: "04/07/2026" },
      lab: { ouverture: "20/11/2023", criblage: "18/10/2026", risque: "standard", statut: "a_jour", derniereRevue: "04/07/2026", prochaineRevue: "04/07/2028", be: 1, ppe: false, gel: "ok", pieces: [5, 5] } },
    { id: "clinique-parc", nom: "CLINIQUE DU PARC", siren: "389 211 641", forme: "SAS", activite: "Établissement de santé", cloture: "31/12", signataire: "CD", equipe: ["LF"], cocac: null,
      type: "legal", premier: 2023, dernier: 2028, nomination: "22/06/2023", honoraires: 36000,
      ex: { clos: "31/12/2026", phase: "planification", avancement: 10, heures: [300, 25] },
      interventions: [["Planification", "19/10/2026", "23/10/2026", "en_cours"], ["Intérim", "30/11/2026", "11/12/2026", "prevu"], ["Final", "15/03/2027", "26/03/2027", "prevu"]],
      ag: "24/06/2027", lm: { statut: "signee", ref: "LM-CAC-2023-007", date: "11/09/2023" }, independance: { statut: "a_renouveler", date: "10/01/2025" },
      lab: { ouverture: "30/05/2023", criblage: "18/10/2026", risque: "standard", statut: "a_jour", derniereRevue: "15/01/2026", prochaineRevue: "15/01/2028", be: 2, ppe: false, gel: "ok", pieces: [6, 6] } },
    { id: "halios", nom: "GROUPE HALIOS", siren: "301 775 483", forme: "SA", activite: "Holding, comptes consolidés", cloture: "31/12", signataire: "CD", equipe: ["LF", "JD"], cocac: "ARVEL AUDIT (cocommissaire)",
      type: "legal", premier: 2022, dernier: 2027, nomination: "21/06/2022", honoraires: 52000,
      ex: { clos: "31/12/2026", phase: "interim", avancement: 40, heures: [420, 160] },
      interventions: [["Planification avec le cocommissaire", "14/09/2026", "18/09/2026", "fait"], ["Intérim", "12/10/2026", "23/10/2026", "en_cours"], ["Final et consolidation", "22/02/2027", "12/03/2027", "prevu"]],
      ag: "10/06/2027", lm: { statut: "signee", ref: "LM-CAC-2022-002", date: "05/09/2022" }, independance: { statut: "a_jour", date: "08/01/2026" },
      lab: { ouverture: "02/05/2022", criblage: "18/10/2026", risque: "eleve", statut: "a_jour", derniereRevue: "08/01/2026", prochaineRevue: "08/01/2027", be: 2, ppe: true, gel: "ok", pieces: [8, 8] } },
    { id: "dorval", nom: "ATELIERS DORVAL", siren: "448 120 396", forme: "SAS", activite: "Menuiserie industrielle", cloture: "30/09", signataire: "CD", equipe: ["JD"], cocac: null,
      type: "alpe", premier: 2025, dernier: 2027, nomination: "17/03/2025", honoraires: 7400,
      ex: { clos: "30/09/2026", phase: "final", avancement: 30, heures: [70, 12] },
      interventions: [["Intérim", "08/09/2026", "10/09/2026", "fait"], ["Final", "23/11/2026", "27/11/2026", "prevu"], ["Rapport", "07/12/2026", "11/12/2026", "prevu"]],
      ag: "18/03/2027", lm: { statut: "signee", ref: "LM-CAC-2025-004", date: "02/04/2025" }, independance: { statut: "a_jour", date: "06/01/2026" },
      lab: { ouverture: "24/02/2025", criblage: "18/10/2026", risque: "faible", statut: "a_jour", derniereRevue: "24/02/2025", prochaineRevue: "24/02/2028", be: 1, ppe: false, gel: "ok", pieces: [5, 5] } },
    { id: "brioche", nom: "BRIOCHE & CIE", siren: "507 642 813", forme: "SAS", activite: "Boulangerie industrielle", cloture: "31/12", signataire: "CD", equipe: ["JD"], cocac: null,
      type: "alpe", premier: 2024, dernier: 2026, nomination: "20/06/2024", honoraires: 6300,
      ex: { clos: "31/12/2026", phase: "planification", avancement: 5, heures: [60, 4] },
      interventions: [["Intérim", "07/12/2026", "09/12/2026", "prevu"], ["Final", "15/03/2027", "19/03/2027", "prevu"]],
      ag: "22/06/2027", lm: { statut: "signee", ref: "LM-CAC-2024-006", date: "02/09/2024" }, independance: { statut: "a_jour", date: "06/01/2026" },
      lab: { ouverture: "03/06/2024", criblage: "18/10/2026", risque: "faible", statut: "a_jour", derniereRevue: "03/06/2024", prochaineRevue: "03/06/2027", be: 2, ppe: false, gel: "ok", pieces: [5, 5] } },
    { id: "soleil", nom: "ASSOCIATION SOLEIL D'ARGENT", siren: "781 450 227", forme: "Association", activite: "Aide à domicile, subventions publiques", cloture: "31/12", signataire: "CD", equipe: ["JD"], cocac: null,
      type: "legal", premier: 2021, dernier: 2026, nomination: "26/06/2021", honoraires: 9500,
      ex: { clos: "31/12/2026", phase: "planification", avancement: 5, heures: [90, 6] },
      interventions: [["Intérim", "14/12/2026", "16/12/2026", "prevu"], ["Final", "05/04/2027", "09/04/2027", "prevu"]],
      ag: "26/06/2027", lm: { statut: "signee", ref: "LM-CAC-2021-009", date: "14/09/2021" }, independance: { statut: "a_jour", date: "05/01/2026" },
      lab: { ouverture: "10/06/2021", criblage: "18/10/2026", risque: "faible", statut: "a_jour", derniereRevue: "15/01/2025", prochaineRevue: "15/01/2028", be: 1, beDefaut: true, ppe: false, gel: "ok", pieces: [5, 5] } },
    { id: "marees", nom: "HÔTEL LES MARÉES", siren: "622 918 304", forme: "SAS", activite: "Hôtellerie", cloture: "31/12", signataire: "CD", equipe: ["LF"], cocac: null,
      type: "legal", premier: 2025, dernier: 2030, nomination: "19/06/2025", honoraires: 18600,
      ex: { clos: "31/12/2026", phase: "planification", avancement: 0, heures: [150, 0] },
      interventions: [["Rapports exercice 2025", "26/05/2026", "29/05/2026", "fait", 2025], ["Planification", "09/11/2026", "13/11/2026", "prevu"], ["Final", "29/03/2027", "09/04/2027", "prevu"]],
      ag: "29/06/2027", lm: { statut: "signee", ref: "LM-CAC-2025-008", date: "01/09/2025" }, independance: { statut: "a_jour", date: "06/01/2026" },
      lab: { ouverture: "02/06/2025", criblage: "18/10/2026", risque: "eleve", statut: "a_revoir", derniereRevue: "02/06/2025", prochaineRevue: "02/06/2026", be: 3, ppe: false, gel: "ok", pieces: [7, 8], changements: [["10/02/2026", "Entrée de Laurent Pichon au capital (27 %), qui devient bénéficiaire effectif", "Registre des mouvements de titres"]] } },
    { id: "technopole", nom: "TECHNOPOLE 21", siren: "915 307 269", forme: "SAS", activite: "Logiciels, levée de fonds en cours", cloture: "31/12", signataire: "CD", equipe: [], cocac: null,
      type: "contractuel", premier: 2026, dernier: 2026, nomination: null, honoraires: 14000,
      ex: { clos: "31/12/2026", phase: "acceptation", avancement: 0, heures: [110, 0] },
      interventions: [["Acceptation de la mission", "12/10/2026", "30/10/2026", "en_cours"]],
      ag: null, lm: { statut: "a_etablir", ref: null, date: null }, independance: { statut: "a_faire", date: null },
      lab: { ouverture: "12/10/2026", criblage: "12/10/2026", risque: null, statut: "incomplet", derniereRevue: null, prochaineRevue: null, be: 1, ppe: false, gel: "ok", pieces: [3, 6] } },
  ];

  /* Missions ponctuelles du commissaire aux comptes, liées à une opération juridique.
     nature : apport (commissaire aux apports) | transformation (commissaire à la transformation) | fusion (commissaire à la fusion)
     etape : designation | acceptation | pieces | rapport | signature | depot | termine
     assemblee : date de l'assemblée qui statue sur l'opération ; depotAvant : date limite de mise à disposition du rapport
     au siège social (faite par la société, après transmission par le commissaire) ; delai : règle applicable selon l'opération
     dirigeant : signataire de la lettre d'affirmation (pour une fusion : dirigeants des sociétés concernées)
     accord : accord de la société pour le partage des pièces et la transmission dans la formalité EJ du conseil (null = à recueillir)
     transmis / miseADisposition : dates de transmission au conseil et de mise à disposition au siège (missions terminées)
     pieces : [reçues, attendues], déposées par le conseil de la société par un lien de dépôt, sans compte
     conseil : cabinet qui prépare l'opération. ej : true s'il utilise Express Juridique (le rapport signé
     rejoint alors directement sa formalité, avec l'accord de la société)
     lab : même structure que les dossiers EC (la file LAB les affiche en profil CAC ou mixte)
     documents : [libellé, statut a_produire | brouillon | a_signer | signe | depose] ; à l'acceptation, rapport et lettre
     d'affirmation passent en brouillon (modèle du cabinet)
     dirigeantAbsorbee : fusion, dirigeant de la société absorbée (second signataire de la lettre d'affirmation)
     conclusions : { libellé du rapport : texte saisi par le signataire } (aucune conclusion rédigée par l'outil)
     laEnvoi : date d'envoi de la lettre d'affirmation en signature au dirigeant
     Le rapport est daté du jour de sa signature (la date de finalisation n'est pas la date du rapport).
     piecesDetail (facultatif, sinon dérivé par cac-mission.html) : [{ lib, source operation | dpj | registre | depot | null,
       origine (libellé de la source), dateDoc, version, recuperee, etat disponible | retenue | attendue | recue | controlee |
       a_remplacer | sans_objet, historique: [{version, etat, note}], motif, optionnelle }]. « recue » = reçue, à contrôler :
       une pièce reçue ou remplacée n'est jamais contrôlée d'office. pieces[0] compte les pièces reçues (recue, controlee, retenue).
     versions (état de session) : { libellé du rapport : [{ n, origine modele | joint, fichier, etat brouillon | finalise | signe,
       creee, finalisee, signee, remise }] } ; remises : [{ doc, n, date, operation, destinataire }] (une remise = une version
       déterminée). Côté conseil, sessionStorage « ej-conseil-retenues » = { ref formalité : { doc, n, date } } : version
       retenue pour le dossier de dépôt, jamais remplacée sans choix du conseil. */
  var PONCTUELLES = [
    { id: "orvane", nom: "ORVANE INDUSTRIES", siren: "834 210 576", forme: "SAS", nature: "apport", signataire: "CD", dirigeant: "Bertrand Orvain, Président", delai: { texte: "8 jours au moins avant l'assemblée", ref: "Code de commerce, art. R.225-136" }, accord: null,
      operation: "Augmentation de capital par apport de 100 % des titres de MÉTALIS SAS", valeur: 1850000,
      designation: { mode: "Décision unanime des associés", date: "02/10/2026" }, assemblee: "27/11/2026", depotAvant: "19/11/2026",
      etape: "pieces", pieces: [4, 7], honoraires: 6500,
      conseil: { nom: "CABINET MARCHAL & ASSOCIÉS", ej: true, formalite: "F-2026-0418", libelle: "Augmentation de capital par apport en nature" },
      lm: { statut: "signee", ref: "LM-CAC-2026-014" }, independance: { statut: "a_jour" }, lab: { ouverture: "25/09/2026", criblage: "18/10/2026", risque: "standard", statut: "a_jour", derniereRevue: "02/10/2026", prochaineRevue: "02/10/2028", be: 2, ppe: false, gel: "ok", pieces: [6, 6] },
      documents: [["Lettre de mission", "signe"], ["Rapport du commissaire aux apports", "brouillon"], ["Lettre d'affirmation", "brouillon"]] },
    { id: "kerlys", nom: "KERLYS", siren: "752 018 334", forme: "SARL", nature: "transformation", signataire: "CD", dirigeant: "Yann Le Gall, gérant", delai: { texte: "8 jours au moins avant l'assemblée", ref: "Code de commerce, art. R.224-3" },
      accord: { par: "Yann Le Gall, gérant de KERLYS", date: "15/09/2026", perimetre: "Pièces de la formalité F-2026-0409 et du dossier permanent, transmission du rapport signé dans cette formalité" },
      operation: "Transformation de la SARL en SAS", valeur: null,
      designation: { mode: "Décision unanime des associés", date: "15/09/2026" }, assemblee: "08/12/2026", depotAvant: "30/11/2026",
      etape: "rapport", pieces: [6, 6], honoraires: 3800,
      conseil: { nom: "SELARL VASSEUR AVOCATS", ej: true, formalite: "F-2026-0409", libelle: "Transformation de SARL en SAS" },
      lm: { statut: "signee", ref: "LM-CAC-2026-011" }, independance: { statut: "a_jour" }, lab: { ouverture: "10/09/2026", criblage: "18/10/2026", risque: "faible", statut: "a_jour", derniereRevue: "15/09/2026", prochaineRevue: "15/09/2029", be: 1, ppe: false, gel: "ok", pieces: [5, 5] },
      documents: [["Lettre de mission", "signe"], ["Rapport sur la valeur des biens et la situation nette", "brouillon"], ["Lettre d'affirmation", "brouillon"]],
      piecesDetail: [
        { lib: "Décision de désignation", source: "operation", origine: "Formalité EJ F-2026-0409", dateDoc: "15/09/2026", version: "Signée le 15/09/2026", recuperee: "15/09/2026", etat: "controlee" },
        { lib: "Statuts à jour", source: "dpj", origine: "Dossier permanent juridique", dateDoc: "12/06/2024", version: "Mise à jour du 12/06/2024", recuperee: "24/09/2026", etat: "controlee" },
        { lib: "Derniers comptes approuvés", source: "dpj", origine: "Dossier permanent juridique", dateDoc: "26/06/2026", version: "Comptes 2025, approuvés le 26/06/2026", recuperee: "24/09/2026", etat: "controlee" },
        { lib: "Situation intermédiaire", source: "depot", origine: "Lien de dépôt du conseil", dateDoc: "31/08/2026", version: "Version 2 déposée le 16/10/2026", recuperee: "16/10/2026", etat: "recue",
          historique: [{ version: "Version 1 déposée le 30/09/2026", etat: "remplacee", note: "Contrôlée le 02/10/2026, remplacée par le conseil" }] },
        { lib: "Projet de statuts de SAS", source: "operation", origine: "Formalité EJ F-2026-0409", dateDoc: "22/09/2026", version: "Projet du 22/09/2026", recuperee: "24/09/2026", etat: "controlee" },
        { lib: "Extrait Kbis", source: "registre", origine: "Extrait RNE · INPI", dateDoc: "24/09/2026", version: "Récupéré le 24/09/2026", recuperee: "24/09/2026", etat: "controlee" },
        { lib: "Rapport de gestion 2025", source: "dpj", origine: "Dossier permanent juridique", dateDoc: "26/06/2026", version: "Approuvé le 26/06/2026", recuperee: null, etat: "disponible", optionnelle: true },
        { lib: "Rapport du commissaire aux comptes sur les derniers comptes", source: null, origine: null, dateDoc: null, version: null, recuperee: null, etat: "sans_objet", motif: "La société n'a pas de commissaire aux comptes", optionnelle: true },
      ] },
    { id: "brun", nom: "ATELIERS BRUN", siren: "903 556 120", forme: "SAS", nature: "apport", signataire: "CD", dirigeant: "Henri Brun, Président", delai: { texte: "1 mois au moins avant l'assemblée", ref: "Code de commerce, régime des scissions (apport partiel d'actif)" }, accord: null,
      operation: "Apport partiel d'actif de la branche menuiserie", valeur: 640000,
      designation: { mode: "Ordonnance du président du tribunal de commerce", date: "16/10/2026" }, assemblee: "15/01/2027", depotAvant: "15/12/2026",
      etape: "acceptation", pieces: [0, 8], honoraires: null,
      conseil: { nom: "CABINET MARCHAL & ASSOCIÉS", ej: true, formalite: "F-2026-0431", libelle: "Apport partiel d'actif" },
      lm: { statut: "a_etablir", ref: null }, independance: { statut: "a_faire" }, lab: { ouverture: null, criblage: null, risque: null, statut: "a_ouvrir", derniereRevue: null, prochaineRevue: null, be: 0, ppe: false, gel: "ok", pieces: [0, 5] },
      documents: [["Lettre de mission", "a_produire"], ["Rapport du commissaire aux apports", "a_produire"], ["Lettre d'affirmation", "a_produire"]] },
    { id: "vetis", nom: "VETIS SANTÉ", siren: "811 470 925", forme: "SAS", nature: "fusion", signataire: "CD", dirigeant: "Claire Vétillard, Présidente", dirigeantAbsorbee: "Marc Delorme, Président", delai: { texte: "1 mois au moins avant l'assemblée", ref: "Code de commerce, régime des fusions" }, accord: { par: "Claire Vétillard, Présidente de VETIS SANTÉ", date: "03/09/2026", perimetre: "Pièces de la formalité F-2026-0396 et transmission du rapport signé dans cette formalité" },
      operation: "Fusion-absorption de SANTÉO DIFFUSION par VETIS SANTÉ", valeur: 2300000,
      designation: { mode: "Ordonnance du président du tribunal de commerce", date: "01/09/2026" }, assemblee: "27/11/2026", depotAvant: "27/10/2026",
      etape: "signature", pieces: [9, 9], honoraires: 9200,
      conseil: { nom: "CABINET MARCHAL & ASSOCIÉS", ej: true, formalite: "F-2026-0396", libelle: "Fusion-absorption" },
      lm: { statut: "signee", ref: "LM-CAC-2026-009" }, independance: { statut: "a_jour" }, lab: { ouverture: "25/08/2026", criblage: "18/10/2026", risque: "standard", statut: "a_jour", derniereRevue: "01/09/2026", prochaineRevue: "01/09/2028", be: 2, ppe: false, gel: "ok", pieces: [6, 6] },
      documents: [["Lettre de mission", "signe"], ["Rapport sur la valeur des apports", "a_signer"], ["Rapport sur la rémunération des apports", "a_signer"], ["Lettre d'affirmation", "a_signer"]],
      laEnvoi: "16/10/2026",
      conclusions: {
        "Rapport sur la valeur des apports": "Sur la base de nos travaux, nous n'avons pas relevé d'élément de nature à remettre en cause la valeur globale des apports retenue, soit 2 300 000 €. Nous estimons que cette valeur n'est pas surévaluée et qu'elle est au moins égale à l'augmentation de capital de la société absorbante, majorée de la prime de fusion.",
        "Rapport sur la rémunération des apports": "Sur la base de nos travaux, nous estimons que le rapport d'échange retenu par les parties présente un caractère équitable. Les méthodes d'évaluation mises en œuvre nous paraissent pertinentes au regard des caractéristiques des deux sociétés.",
      } },
    { id: "pomone", nom: "POMONE PRIMEURS", siren: "790 335 618", forme: "SARL", nature: "transformation", signataire: "CD", dirigeant: "Rachid Benamar, gérant", delai: { texte: "8 jours au moins avant l'assemblée", ref: "Code de commerce, art. R.224-3" }, accord: null,
      operation: "Transformation de la SARL en SAS", valeur: null,
      designation: { mode: "Décision unanime des associés", date: "08/07/2026" }, assemblee: "30/09/2026", depotAvant: "22/09/2026",
      etape: "termine", pieces: [6, 6], honoraires: 3200, transmis: "18/09/2026", miseADisposition: "21/09/2026",
      conseil: { nom: "SELARL VASSEUR AVOCATS", ej: false, formalite: null, libelle: "Transformation de SARL en SAS" },
      lm: { statut: "signee", ref: "LM-CAC-2026-006" }, independance: { statut: "a_jour" }, lab: { ouverture: "01/07/2026", criblage: "18/10/2026", risque: "faible", statut: "a_jour", derniereRevue: "08/07/2026", prochaineRevue: "08/07/2029", be: 1, ppe: false, gel: "ok", pieces: [5, 5] },
      documents: [["Lettre de mission", "signe"], ["Rapport sur la valeur des biens et la situation nette", "depose"], ["Lettre d'affirmation", "signe"]] },
  ];

  /* Missions ponctuelles créées pendant la session (cac.html, « Nouvelle mission ponctuelle ») :
     sessionStorage["ej-cac-nouvelles"] = tableau d'objets de même forme, étape "designation". */
  try {
    var NOUV = JSON.parse(window.sessionStorage.getItem("ej-cac-nouvelles") || "[]");
    if (Array.isArray(NOUV)) NOUV.forEach(function (m) {
      if (m && m.id && !PONCTUELLES.some(function (x) { return x.id === m.id; })) PONCTUELLES.push(m);
    });
  } catch (e) { /* stockage indisponible : missions de démonstration seules */ }

  /* Avancement des missions ponctuelles pendant la session : source unique, écrite par cac-mission.html
     (sessionStorage["ej-cac-ponctuelles"] = { id: état }). Appliqué ici, toutes les pages qui chargent ce fichier
     (liste CAC, cockpit, fiche) voient le même avancement. m._origine garde les données d'avant la session :
     la fiche s'en sert pour dériver son journal sans appliquer deux fois l'avancement. */
  var CHAMPS_AVANCEMENT = ["etape", "pieces", "documents", "lm", "independance", "honoraires", "accord", "accordDemande",
    "transmis", "miseADisposition", "relances", "laEnvoi", "laSignee", "conclusions", "dateRapport",
    "piecesDetail", "versions", "remises"];
  try {
    var AV = JSON.parse(window.sessionStorage.getItem("ej-cac-ponctuelles") || "{}") || {};
    PONCTUELLES.forEach(function (m) {
      var s = AV[m.id];
      if (!s || s.v !== 3) return;
      m._origine = JSON.parse(JSON.stringify(m));
      CHAMPS_AVANCEMENT.forEach(function (k) {
        if (s[k] !== undefined) m[k] = JSON.parse(JSON.stringify(s[k]));
      });
    });
  } catch (e) { /* stockage indisponible : avancement des données de démonstration */ }

  /* Conseil de KERLYS, utilisateur d'Express Juridique (vue « Conseil », cabinet actif SELARL VASSEUR AVOCATS).
     Compte distinct du cabinet DELMAS : ses sociétés et ses formalités ne sont pas celles du cabinet DELMAS,
     et il ne voit de la mission du commissaire que ce que l'intervention partage (coordination, documents partagés).
     formalites[].intervention : intervention d'un commissaire dans l'opération, représentée par EJ.
       preparee : date à laquelle le conseil a ajouté l'intervention à la formalité (commissaire pressenti)
       invitation : accès au dossier proposé au commissaire (technique : ne vaut ni désignation ni acceptation)
       acte : acte de désignation produit par EJ dans la formalité (statut a_produire | a_signer | signe)
       acceptation : date d'acceptation de la mission par le commissaire (null tant qu'il n'a pas accepté)
       mission : id de la mission ponctuelle (EJM.ponctuelles) ; l'état du rapport se lit sur la mission. */
  var CONSEIL = {
    cabinet: "SELARL VASSEUR AVOCATS",
    societes: [
      { id: "kerlys", nom: "KERLYS", siren: "752 018 334", forme: "SARL", activite: "Location et entretien de bateaux de plaisance",
        siege: "Zone portuaire de Kernével, 56260 Larmor-Plage", greffe: "LORIENT", immatriculation: "03/05/2012", ajout: "02/09/2026" },
      { id: "scorff", nom: "CHANTIERS DU SCORFF", siren: "530 530 419", forme: "SAS", activite: "Construction navale",
        siege: "12 quai des Indes, 56100 Lorient", greffe: "LORIENT", immatriculation: "14/03/2011", ajout: "18/01/2025" },
      { id: "kernevel", nom: "SCI KERNÉVEL", siren: "749 008 934", forme: "SCI", activite: "Location de terrains et d'autres biens immobiliers",
        siege: "4 rue du Port, 56260 Larmor-Plage", greffe: "LORIENT", immatriculation: "22/09/2012", ajout: "18/01/2025" },
      { id: "breizhoptic", nom: "BREIZH OPTIQUE", siren: "925 988 156", forme: "SARL", activite: "Commerce de détail d'optique",
        siege: "27 rue de Liège, 56100 Lorient", greffe: "LORIENT", immatriculation: "06/02/2023", ajout: "09/06/2025" },
    ],
    formalites: [
      { ref: "F-2026-0409", societe: "kerlys", libelle: "Transformation de SARL en SAS", statut: "en_cours",
        operations: ["Transformation de la société en SAS", "Nomination du commissaire à la transformation"],
        creee: "02/09/2026", par: "Anne Vasseur", maj: "16/10/2026",
        intervention: {
          nature: "transformation", type: "Commissaire à la transformation",
          commissaire: "Claire Dubois", cabinet: "CABINET DELMAS EXPERTISE",
          preparee: "02/09/2026",
          invitation: { date: "09/09/2026", destinataire: "Claire Dubois, CABINET DELMAS EXPERTISE",
            perimetre: "Coordination de l'opération et documents partagés de la formalité" },
          acte: { libelle: "Décision unanime des associés nommant le commissaire à la transformation", date: "15/09/2026", statut: "signe" },
          acceptation: "24/09/2026",
          mission: "kerlys" } },
      { ref: "F-2026-0377", societe: "scorff", libelle: "Changement de président", statut: "termine",
        operations: ["Nomination d'un nouveau président"], creee: "28/07/2026", par: "Anne Vasseur", maj: "21/08/2026" },
      { ref: "F-2026-0352", societe: "kernevel", libelle: "Transfert de siège social", statut: "termine",
        operations: ["Transfert du siège social dans le même ressort"], creee: "09/07/2026", par: "Anne Vasseur", maj: "30/07/2026" },
      { ref: "F-2026-0421", societe: "breizhoptic", libelle: "Approbation des comptes 2025", statut: "en_cours",
        operations: ["Approbation des comptes annuels"], creee: "05/10/2026", par: "Anne Vasseur", maj: "15/10/2026" },
    ],
  };

  /* Opérations partagées avec le cabinet DELMAS par des conseils qui utilisent EJ : un conseil invite le
     commissaire depuis sa formalité. mission : id de la mission ponctuelle déjà rattachée (null = invitation
     pas encore rattachée). Une invitation ne crée pas de mission et ne vaut pas désignation. */
  var INVITATIONS = [
    { ref: "F-2026-0396", conseil: "CABINET MARCHAL & ASSOCIÉS", societe: "VETIS SANTÉ", siren: "811 470 925", forme: "SAS", nature: "fusion", libelle: "Fusion-absorption", date: "28/08/2026", mission: "vetis" },
    { ref: "F-2026-0409", conseil: "SELARL VASSEUR AVOCATS", societe: "KERLYS", siren: "752 018 334", forme: "SARL", nature: "transformation", libelle: "Transformation de SARL en SAS", date: "09/09/2026", mission: "kerlys" },
    { ref: "F-2026-0418", conseil: "CABINET MARCHAL & ASSOCIÉS", societe: "ORVANE INDUSTRIES", siren: "834 210 576", forme: "SAS", nature: "apport", libelle: "Augmentation de capital par apport en nature", date: "24/09/2026", mission: "orvane" },
    { ref: "F-2026-0431", conseil: "CABINET MARCHAL & ASSOCIÉS", societe: "ATELIERS BRUN", siren: "903 556 120", forme: "SAS", nature: "apport", libelle: "Apport partiel d'actif", date: "14/10/2026", mission: "brun" },
    { ref: "F-2026-0447", conseil: "CABINET MARCHAL & ASSOCIÉS", societe: "SOLÉA BOIS", siren: "362 275 869", forme: "SAS", nature: "apport", libelle: "Augmentation de capital par apport en nature", date: "16/10/2026", mission: null },
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
    /* Responsable LAB du cabinet, qui valide les revues : un seul par cabinet.
       Cabinet EC ou mixte : Thomas Girard. Cabinet CAC seul (profil cac) : Claire Dubois. */
    responsableLab: function (profil) {
      return profil === "cac" ? "CD" : "TG";
    },
    mandats: MANDATS,
    ponctuelles: PONCTUELLES,
    conseil: CONSEIL,
    invitations: INVITATIONS,
    /* Sociétés suivies par le cabinet en tant que commissaire (mandats et missions ponctuelles, y compris celles
       créées pendant la session), regroupées par SIREN. cle = SIREN en chiffres (societe.html?cac=<cle>). */
    societesCac: function () {
      var out = [], vu = {};
      function ajoute(m, source) {
        var cle = String(m.siren || "").replace(/\D/g, "");
        if (!cle) return;
        if (!vu[cle]) {
          vu[cle] = { cle: cle, nom: m.nom, siren: m.siren, forme: m.forme, mandats: [], ponctuelles: [] };
          out.push(vu[cle]);
        }
        vu[cle][source].push(m);
      }
      MANDATS.forEach(function (m) { ajoute(m, "mandats"); });
      PONCTUELLES.forEach(function (m) { ajoute(m, "ponctuelles"); });
      return out;
    },
    findSocieteCac: function (cle) {
      cle = String(cle || "").replace(/\D/g, "");
      return window.EJM.societesCac().filter(function (s) { return s.cle === cle; })[0] || null;
    },
    findFormaliteConseil: function (ref) {
      return CONSEIL.formalites.filter(function (f) { return f.ref === ref; })[0] || null;
    },
    findPonctuelle: function (id) {
      return PONCTUELLES.filter(function (m) { return m.id === id; })[0] || null;
    },
    NATURE: { apport: "Commissariat aux apports", transformation: "Commissariat à la transformation", fusion: "Commissariat à la fusion" },
    ETAPE: { designation: "Désignation", acceptation: "Acceptation", pieces: "Pièces", rapport: "Rapport", signature: "Signature", depot: "Transmission", termine: "Terminée" },
    DOC_STATUT: { a_produire: "À produire", brouillon: "Brouillon", a_signer: "À signer", signe: "Signé", depose: "Remis" },
    /* Verbe canonique d'une mission ponctuelle : l'action principale du bloc « À faire » de cac-mission.html.
       labAJour : état réel du dossier LAB (module LAB). Retour : { lib, ancre } ; ancre = lien à ouvrir. */
    verbePonctuelle: function (m, labAJour) {
      var fiche = "cac-mission.html?id=" + encodeURIComponent(m.id) + "#afaire";
      function v(lib) { return { lib: lib, ancre: fiche }; }
      var e = m.etape, lm = m.lm || {}, ind = m.independance || {}, cs = m.conseil || {};
      if (e === "designation") return v("Accepter la mission");
      if (e === "acceptation") {
        if (!labAJour) return { lib: "Voir le dossier LAB", ancre: "lab-dossier.html?id=" + encodeURIComponent(m.id) + "&from=mission" };
        if (ind.statut !== "a_jour") return v("Signer la déclaration d'indépendance");
        if (lm.statut === "brouillon") return v("Envoyer la lettre pour signature");
        if (lm.statut === "envoyee") return v("Relancer la société");
        if (lm.statut !== "signee") return v("Établir la lettre de mission");
        return v("Accepter la mission");
      }
      if (e === "pieces") return v("Relancer le conseil");
      if (e === "rapport") return v("Finaliser le rapport");
      if (e === "signature") {
        var la = (m.documents || []).filter(function (d) { return d[0] === "Lettre d'affirmation"; })[0];
        if (la && la[1] !== "signe") return v(m.laEnvoi ? "Relancer le dirigeant" : "Envoyer en signature");
        /* Signature refusée tant qu'une pièce est à contrôler ou à remplacer (même règle que cac-mission.html) */
        var bloque = (m.piecesDetail || []).some(function (p) { return p.etat === "recue" || p.etat === "a_remplacer"; });
        if (bloque) return { lib: "Voir les pièces", ancre: "cac-mission.html?id=" + encodeURIComponent(m.id) + "#pieces" };
        return v("Signer le rapport");
      }
      if (e === "depot") {
        if (m.transmis) return v("Enregistrer la mise à disposition");
        return v(cs.ej && cs.formalite && m.accord ? "Remettre dans la formalité " + cs.formalite : "Remettre au conseil");
      }
      return { lib: "Consulter la mission", ancre: "cac-mission.html?id=" + encodeURIComponent(m.id) };
    },
    findMandat: function (id) {
      return MANDATS.filter(function (m) { return m.id === id; })[0] || null;
    },
    TYPE_MANDAT: { legal: "Mandat légal · six exercices", alpe: "Audit légal petite entreprise · trois exercices", contractuel: "Audit contractuel" },
    PHASE: { acceptation: "Acceptation", planification: "Planification", interim: "Intérim", final: "Final", rapports: "Rapports", emis: "Rapports émis" },
    INDEP: { a_jour: "Déclaration à jour", a_renouveler: "Déclaration à renouveler", a_faire: "Déclaration à faire" },
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
    LAB_STATUT: { a_jour: "À jour", a_revoir: "Revue échue", incomplet: "Pièces manquantes", a_ouvrir: "Dossier à ouvrir", fin_relation: "Relation terminée" },
    LM_STATUT: { signee: "Signée", envoyee: "Envoyée pour signature", brouillon: "Brouillon", a_renouveler: "À renouveler", absente: "Aucune lettre" },
  };
})();
