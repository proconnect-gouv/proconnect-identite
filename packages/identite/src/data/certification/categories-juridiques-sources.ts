// source: https://github.com/proconnect-gouv/proconnect-insee-demande-acces/blob/develop/src/main/resources/config/categories_juridiques_sources.csv

export type CategorieJuridiqueSource = "sirene" | "rne";

export interface CategorieJuridique {
  categorie_juridique: string;
  libelle_categorie_juridique: string;
  source: CategorieJuridiqueSource;
}

export const CATEGORIES_JURIDIQUES: ReadonlyArray<CategorieJuridique> = [
  {
    categorie_juridique: "1000",
    libelle_categorie_juridique: "Entrepreneur individuel",
    source: "sirene",
  },
  {
    categorie_juridique: "3110",
    libelle_categorie_juridique:
      "Représentation ou agence commerciale d'état ou organisme public étranger immatriculé au RCS",
    source: "rne",
  },
  {
    categorie_juridique: "3120",
    libelle_categorie_juridique:
      "Société commerciale étrangère immatriculée au RCS",
    source: "rne",
  },
  {
    categorie_juridique: "3220",
    libelle_categorie_juridique: "Société étrangère non immatriculée au RCS",
    source: "rne",
  },
  {
    categorie_juridique: "4110",
    libelle_categorie_juridique:
      "Établissement public national à caractère industriel ou commercial doté d'un comptable public",
    source: "rne",
  },
  {
    categorie_juridique: "4120",
    libelle_categorie_juridique:
      "Établissement public national à caractère industriel ou commercial non doté d'un comptable public",
    source: "rne",
  },
  {
    categorie_juridique: "4140",
    libelle_categorie_juridique:
      "Établissement public local à caractère industriel ou commercial",
    source: "rne",
  },
  {
    categorie_juridique: "4150",
    libelle_categorie_juridique:
      "Régie d'une collectivité locale à caractère industriel ou commercial",
    source: "rne",
  },
  {
    categorie_juridique: "5191",
    libelle_categorie_juridique: "Société de caution mutuelle",
    source: "rne",
  },
  {
    categorie_juridique: "5192",
    libelle_categorie_juridique: "Société coopérative de banque populaire",
    source: "rne",
  },
  {
    categorie_juridique: "5193",
    libelle_categorie_juridique: "Caisse de crédit maritime mutuel",
    source: "rne",
  },
  {
    categorie_juridique: "5194",
    libelle_categorie_juridique: "Caisse (fédérale) de crédit mutuel",
    source: "rne",
  },
  {
    categorie_juridique: "5195",
    libelle_categorie_juridique:
      "Association coopérative inscrite (droit local Alsace Moselle)",
    source: "rne",
  },
  {
    categorie_juridique: "5196",
    libelle_categorie_juridique:
      "Caisse d'épargne et de prévoyance à forme coopérative",
    source: "rne",
  },
  {
    categorie_juridique: "5202",
    libelle_categorie_juridique: "Société en nom collectif",
    source: "rne",
  },
  {
    categorie_juridique: "5203",
    libelle_categorie_juridique: "Société en nom collectif coopérative",
    source: "rne",
  },
  {
    categorie_juridique: "5306",
    libelle_categorie_juridique: "Société en commandite simple",
    source: "rne",
  },
  {
    categorie_juridique: "5307",
    libelle_categorie_juridique: "Société en commandite simple coopérative",
    source: "rne",
  },
  {
    categorie_juridique: "5308",
    libelle_categorie_juridique: "Société en commandite par actions",
    source: "rne",
  },
  {
    categorie_juridique: "5309",
    libelle_categorie_juridique:
      "Société en commandite par actions coopérative",
    source: "rne",
  },
  {
    categorie_juridique: "5310",
    libelle_categorie_juridique: "Société en libre partenariat (SLP)",
    source: "rne",
  },
  {
    categorie_juridique: "5370",
    libelle_categorie_juridique:
      "Société de Participations Financières de Profession Libérale Société en commandite par actions (SPFPL SCA)",
    source: "rne",
  },
  {
    categorie_juridique: "5385",
    libelle_categorie_juridique:
      "Société d'exercice libéral en commandite par actions",
    source: "rne",
  },
  {
    categorie_juridique: "5410",
    libelle_categorie_juridique: "SARL nationale",
    source: "rne",
  },
  {
    categorie_juridique: "5415",
    libelle_categorie_juridique: "SARL d'économie mixte",
    source: "rne",
  },
  {
    categorie_juridique: "5422",
    libelle_categorie_juridique:
      "SARL immobilière pour le commerce et l'industrie (SICOMI)",
    source: "rne",
  },
  {
    categorie_juridique: "5426",
    libelle_categorie_juridique: "SARL immobilière de gestion",
    source: "rne",
  },
  {
    categorie_juridique: "5430",
    libelle_categorie_juridique:
      "SARL d'aménagement foncier et d'équipement rural (SAFER)",
    source: "rne",
  },
  {
    categorie_juridique: "5431",
    libelle_categorie_juridique: "SARL mixte d'intérêt agricole (SMIA)",
    source: "rne",
  },
  {
    categorie_juridique: "5432",
    libelle_categorie_juridique: "SARL d'intérêt collectif agricole (SICA)",
    source: "rne",
  },
  {
    categorie_juridique: "5442",
    libelle_categorie_juridique: "SARL d'attribution",
    source: "rne",
  },
  {
    categorie_juridique: "5443",
    libelle_categorie_juridique: "SARL coopérative de construction",
    source: "rne",
  },
  {
    categorie_juridique: "5451",
    libelle_categorie_juridique: "SARL coopérative de consommation",
    source: "rne",
  },
  {
    categorie_juridique: "5453",
    libelle_categorie_juridique: "SARL coopérative artisanale",
    source: "rne",
  },
  {
    categorie_juridique: "5454",
    libelle_categorie_juridique: "SARL coopérative d'intérêt maritime",
    source: "rne",
  },
  {
    categorie_juridique: "5455",
    libelle_categorie_juridique: "SARL coopérative de transport",
    source: "rne",
  },
  {
    categorie_juridique: "5458",
    libelle_categorie_juridique: "SARL coopérative de production (SCOP)",
    source: "rne",
  },
  {
    categorie_juridique: "5459",
    libelle_categorie_juridique: "SARL union de sociétés coopératives",
    source: "rne",
  },
  {
    categorie_juridique: "5460",
    libelle_categorie_juridique: "Autre SARL coopérative",
    source: "rne",
  },
  {
    categorie_juridique: "5470",
    libelle_categorie_juridique:
      "Société de Participations Financières de Profession Libérale Société à responsabilité limitée (SPFPL SARL)",
    source: "rne",
  },
  {
    categorie_juridique: "5485",
    libelle_categorie_juridique:
      "Société d'exercice libéral à responsabilité limitée",
    source: "rne",
  },
  {
    categorie_juridique: "5499",
    libelle_categorie_juridique:
      "Société à responsabilité limitée (sans autre indication)",
    source: "rne",
  },
  {
    categorie_juridique: "5505",
    libelle_categorie_juridique:
      "SA à participation ouvrière à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5510",
    libelle_categorie_juridique: "SA nationale à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5515",
    libelle_categorie_juridique:
      "SA d'économie mixte à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5520",
    libelle_categorie_juridique:
      "Fonds à forme sociétale à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5522",
    libelle_categorie_juridique:
      "SA immobilière pour le commerce et l'industrie (SICOMI) à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5525",
    libelle_categorie_juridique:
      "SA immobilière d'investissement à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5530",
    libelle_categorie_juridique:
      "SA d'aménagement foncier et d'équipement rural (SAFER) à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5531",
    libelle_categorie_juridique:
      "Société anonyme mixte d'intérêt agricole (SMIA) à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5532",
    libelle_categorie_juridique:
      "SA d'intérêt collectif agricole (SICA) à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5542",
    libelle_categorie_juridique: "SA d'attribution à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5543",
    libelle_categorie_juridique:
      "SA coopérative de construction à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5546",
    libelle_categorie_juridique: "SA de HLM à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5547",
    libelle_categorie_juridique:
      "SA coopérative de production de HLM à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5548",
    libelle_categorie_juridique:
      "SA de crédit immobilier à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5551",
    libelle_categorie_juridique:
      "SA coopérative de consommation à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5552",
    libelle_categorie_juridique:
      "SA coopérative de commerçants-détaillants à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5553",
    libelle_categorie_juridique:
      "SA coopérative artisanale à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5554",
    libelle_categorie_juridique:
      "SA coopérative (d'intérêt) maritime à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5555",
    libelle_categorie_juridique:
      "SA coopérative de transport à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5558",
    libelle_categorie_juridique:
      "SA coopérative de production  (SCOP) à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5559",
    libelle_categorie_juridique:
      "SA union de sociétés coopératives à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5560",
    libelle_categorie_juridique:
      "Autre SA coopérative à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5570",
    libelle_categorie_juridique:
      "Société de Participations Financières de Profession Libérale Société anonyme à conseil d'administration (SPFPL SA à conseil d'administration)",
    source: "rne",
  },
  {
    categorie_juridique: "5585",
    libelle_categorie_juridique:
      "Société d'exercice libéral à forme anonyme à conseil d'administration",
    source: "rne",
  },
  {
    categorie_juridique: "5599",
    libelle_categorie_juridique: "SA à conseil d'administration (s.a.i.)",
    source: "rne",
  },
  {
    categorie_juridique: "5605",
    libelle_categorie_juridique: "SA à participation ouvrière à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5610",
    libelle_categorie_juridique: "SA nationale à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5615",
    libelle_categorie_juridique: "SA d'économie mixte à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5620",
    libelle_categorie_juridique: "Fonds à forme sociétale à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5622",
    libelle_categorie_juridique:
      "SA immobilière pour le commerce et l'industrie (SICOMI) à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5625",
    libelle_categorie_juridique: "SA immobilière d'investissement à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5630",
    libelle_categorie_juridique: "Safer anonyme à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5631",
    libelle_categorie_juridique: "SA mixte d'intérêt agricole (SMIA)",
    source: "rne",
  },
  {
    categorie_juridique: "5632",
    libelle_categorie_juridique: "SA d'intérêt collectif agricole (SICA)",
    source: "rne",
  },
  {
    categorie_juridique: "5642",
    libelle_categorie_juridique: "SA d'attribution à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5643",
    libelle_categorie_juridique: "SA coopérative de construction à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5646",
    libelle_categorie_juridique: "SA de HLM à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5647",
    libelle_categorie_juridique:
      "Société coopérative de production de HLM anonyme à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5648",
    libelle_categorie_juridique: "SA de crédit immobilier à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5651",
    libelle_categorie_juridique: "SA coopérative de consommation à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5652",
    libelle_categorie_juridique:
      "SA coopérative de commerçants-détaillants à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5653",
    libelle_categorie_juridique: "SA coopérative artisanale à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5654",
    libelle_categorie_juridique:
      "SA coopérative d'intérêt maritime à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5655",
    libelle_categorie_juridique: "SA coopérative de transport à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5658",
    libelle_categorie_juridique:
      "SA coopérative de production (SCOP) à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5659",
    libelle_categorie_juridique:
      "SA union de sociétés coopératives à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5660",
    libelle_categorie_juridique: "Autre SA coopérative à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5670",
    libelle_categorie_juridique:
      "Société de Participations Financières de Profession Libérale Société anonyme à Directoire (SPFPL SA à directoire)",
    source: "rne",
  },
  {
    categorie_juridique: "5685",
    libelle_categorie_juridique:
      "Société d'exercice libéral à forme anonyme à directoire",
    source: "rne",
  },
  {
    categorie_juridique: "5699",
    libelle_categorie_juridique: "SA à directoire (s.a.i.)",
    source: "rne",
  },
  {
    categorie_juridique: "5710",
    libelle_categorie_juridique: "SAS, société par actions simplifiée",
    source: "rne",
  },
  {
    categorie_juridique: "5770",
    libelle_categorie_juridique:
      "Société de Participations Financières de Profession Libérale Société par actions simplifiée (SPFPL SAS)",
    source: "rne",
  },
  {
    categorie_juridique: "5785",
    libelle_categorie_juridique:
      "Société d'exercice libéral par action simplifiée",
    source: "rne",
  },
  {
    categorie_juridique: "5800",
    libelle_categorie_juridique: "Société européenne",
    source: "rne",
  },
  {
    categorie_juridique: "6100",
    libelle_categorie_juridique: "Caisse d'Épargne et de Prévoyance",
    source: "rne",
  },
  {
    categorie_juridique: "6210",
    libelle_categorie_juridique:
      "Groupement européen d'intérêt économique (GEIE)",
    source: "rne",
  },
  {
    categorie_juridique: "6220",
    libelle_categorie_juridique: "Groupement d'intérêt économique (GIE)",
    source: "rne",
  },
  {
    categorie_juridique: "6316",
    libelle_categorie_juridique:
      "Coopérative d'utilisation de matériel agricole en commun (CUMA)",
    source: "rne",
  },
  {
    categorie_juridique: "6317",
    libelle_categorie_juridique: "Société coopérative agricole",
    source: "rne",
  },
  {
    categorie_juridique: "6318",
    libelle_categorie_juridique: "Union de sociétés coopératives agricoles",
    source: "rne",
  },
  {
    categorie_juridique: "6411",
    libelle_categorie_juridique: "Société d'assurance à forme mutuelle",
    source: "rne",
  },
  {
    categorie_juridique: "6511",
    libelle_categorie_juridique:
      "Sociétés Interprofessionnelles de Soins Ambulatoires",
    source: "rne",
  },
  {
    categorie_juridique: "6521",
    libelle_categorie_juridique:
      "Société civile de placement collectif immobilier (SCPI)",
    source: "rne",
  },
  {
    categorie_juridique: "6532",
    libelle_categorie_juridique:
      "Société civile d'intérêt collectif agricole (SICA)",
    source: "rne",
  },
  {
    categorie_juridique: "6533",
    libelle_categorie_juridique:
      "Groupement agricole d'exploitation en commun (GAEC)",
    source: "rne",
  },
  {
    categorie_juridique: "6534",
    libelle_categorie_juridique: "Groupement foncier agricole",
    source: "rne",
  },
  {
    categorie_juridique: "6535",
    libelle_categorie_juridique: "Groupement agricole foncier",
    source: "rne",
  },
  {
    categorie_juridique: "6536",
    libelle_categorie_juridique: "Groupement forestier",
    source: "rne",
  },
  {
    categorie_juridique: "6537",
    libelle_categorie_juridique: "Groupement pastoral",
    source: "rne",
  },
  {
    categorie_juridique: "6538",
    libelle_categorie_juridique: "Groupement foncier et rural",
    source: "rne",
  },
  {
    categorie_juridique: "6539",
    libelle_categorie_juridique: "Société civile foncière",
    source: "rne",
  },
  {
    categorie_juridique: "6540",
    libelle_categorie_juridique: "Société civile immobilière",
    source: "rne",
  },
  {
    categorie_juridique: "6541",
    libelle_categorie_juridique:
      "Société civile immobilière de construction-vente",
    source: "rne",
  },
  {
    categorie_juridique: "6542",
    libelle_categorie_juridique: "Société civile d'attribution",
    source: "rne",
  },
  {
    categorie_juridique: "6543",
    libelle_categorie_juridique: "Société civile coopérative de construction",
    source: "rne",
  },
  {
    categorie_juridique: "6544",
    libelle_categorie_juridique:
      "Société civile immobilière d' accession progressive à la propriété",
    source: "rne",
  },
  {
    categorie_juridique: "6551",
    libelle_categorie_juridique: "Société civile coopérative de consommation",
    source: "rne",
  },
  {
    categorie_juridique: "6554",
    libelle_categorie_juridique:
      "Société civile coopérative d'intérêt maritime",
    source: "rne",
  },
  {
    categorie_juridique: "6558",
    libelle_categorie_juridique: "Société civile coopérative entre médecins",
    source: "rne",
  },
  {
    categorie_juridique: "6560",
    libelle_categorie_juridique: "Autre société civile coopérative",
    source: "rne",
  },
  {
    categorie_juridique: "6561",
    libelle_categorie_juridique: "SCP d'avocats",
    source: "rne",
  },
  {
    categorie_juridique: "6562",
    libelle_categorie_juridique: "SCP d'avocats aux conseils",
    source: "rne",
  },
  {
    categorie_juridique: "6563",
    libelle_categorie_juridique: "SCP d'avoués d'appel",
    source: "rne",
  },
  {
    categorie_juridique: "6564",
    libelle_categorie_juridique: "SCP d'huissiers",
    source: "rne",
  },
  {
    categorie_juridique: "6565",
    libelle_categorie_juridique: "SCP de notaires",
    source: "rne",
  },
  {
    categorie_juridique: "6566",
    libelle_categorie_juridique: "SCP de commissaires-priseurs",
    source: "rne",
  },
  {
    categorie_juridique: "6567",
    libelle_categorie_juridique: "SCP de greffiers de tribunal de commerce",
    source: "rne",
  },
  {
    categorie_juridique: "6568",
    libelle_categorie_juridique: "SCP de conseils juridiques",
    source: "rne",
  },
  {
    categorie_juridique: "6569",
    libelle_categorie_juridique: "SCP de commissaires aux comptes",
    source: "rne",
  },
  {
    categorie_juridique: "6571",
    libelle_categorie_juridique: "SCP de médecins",
    source: "rne",
  },
  {
    categorie_juridique: "6572",
    libelle_categorie_juridique: "SCP de dentistes",
    source: "rne",
  },
  {
    categorie_juridique: "6573",
    libelle_categorie_juridique: "SCP d'infirmiers",
    source: "rne",
  },
  {
    categorie_juridique: "6574",
    libelle_categorie_juridique: "SCP de masseurs-kinésithérapeutes",
    source: "rne",
  },
  {
    categorie_juridique: "6575",
    libelle_categorie_juridique:
      "SCP de directeurs de laboratoire d'analyse médicale",
    source: "rne",
  },
  {
    categorie_juridique: "6576",
    libelle_categorie_juridique: "SCP de vétérinaires",
    source: "rne",
  },
  {
    categorie_juridique: "6577",
    libelle_categorie_juridique: "SCP de géomètres experts",
    source: "rne",
  },
  {
    categorie_juridique: "6578",
    libelle_categorie_juridique: "SCP d'architectes",
    source: "rne",
  },
  {
    categorie_juridique: "6585",
    libelle_categorie_juridique: "Autre société civile professionnelle",
    source: "rne",
  },
  {
    categorie_juridique: "6589",
    libelle_categorie_juridique: "Société civile de moyens",
    source: "rne",
  },
  {
    categorie_juridique: "6595",
    libelle_categorie_juridique: "Caisse locale de crédit mutuel",
    source: "rne",
  },
  {
    categorie_juridique: "6596",
    libelle_categorie_juridique: "Caisse de crédit agricole mutuel",
    source: "rne",
  },
  {
    categorie_juridique: "6597",
    libelle_categorie_juridique: "Société civile d'exploitation agricole",
    source: "rne",
  },
  {
    categorie_juridique: "6598",
    libelle_categorie_juridique:
      "Exploitation agricole à responsabilité limitée",
    source: "rne",
  },
  {
    categorie_juridique: "6599",
    libelle_categorie_juridique: "Autre société civile",
    source: "rne",
  },
  {
    categorie_juridique: "6901",
    libelle_categorie_juridique:
      "Autre personne de droit privé inscrite au registre du commerce et des sociétés",
    source: "rne",
  },
  {
    categorie_juridique: "8250",
    libelle_categorie_juridique: "Assurance mutuelle agricole",
    source: "rne",
  },
] as const;
