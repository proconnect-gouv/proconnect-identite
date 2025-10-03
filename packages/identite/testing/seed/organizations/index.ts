//

import type { Organization } from "#src/types";

//

export const association_org_info = {
  siret: "83511518900010",
  cached_tranche_effectifs: "00",
  cached_tranche_effectifs_unite_legale: "00",
  cached_libelle_tranche_effectif:
    "0 salarié (n'ayant pas d'effectif au 31/12 mais ayant employé des salariés au cours de l'année de référence), en 2020",
  cached_activite_principale: "81.21Z",
  cached_libelle_activite_principale:
    "81.21Z - Nettoyage courant des bâtiments",
  cached_categorie_juridique: "9220",
  cached_libelle_categorie_juridique: "Association déclarée",
} as Organization;

export const small_association_org_info = {
  siret: "39399933900046",
  cached_tranche_effectifs: "12",
  cached_tranche_effectifs_unite_legale: "12",
  cached_libelle_tranche_effectif: "20 à 49 salariés, en 2022",
  cached_activite_principale: "84.13Z",
  cached_libelle_activite_principale:
    "84.13Z - Administration publique (tutelle) des activités économiques",
  cached_categorie_juridique: "9220",
  cached_libelle_categorie_juridique: "Association déclarée",
} as Organization;

export const entreprise_unipersonnelle_org_info = {
  siret: "82869625200018",
  cached_tranche_effectifs: null,
  cached_tranche_effectifs_unite_legale: null,
  cached_libelle_tranche_effectif: null,
  cached_activite_principale: "62.01Z",
  cached_libelle_activite_principale: "62.01Z - Programmation informatique",
  cached_categorie_juridique: "1000",
  cached_libelle_categorie_juridique: "Entrepreneur individuel",
} as Organization;

export const lamalou_org_info = {
  siret: "21340126800130",
  cached_tranche_effectifs: "12",
  cached_tranche_effectifs_unite_legale: "21",
  cached_libelle_tranche_effectif: "20 à 49 salariés, en 2020",
  cached_activite_principale: "84.11Z",
  cached_libelle_activite_principale:
    "84.11Z - Administration publique générale",
  cached_categorie_juridique: "7210",
  cached_libelle_categorie_juridique: "Commune et commune nouvelle",
} as Organization;

export const dinum_org_info = {
  siret: "13002526500013",
  cached_tranche_effectifs: "22",
  cached_tranche_effectifs_unite_legale: "22",
  cached_libelle_tranche_effectif: "100 à 199 salariés, en 2020",
  cached_activite_principale: "84.11Z",
  cached_libelle_activite_principale:
    "84.11Z - Administration publique générale",
  cached_categorie_juridique: "7120",
  cached_libelle_categorie_juridique: "Service central d'un ministère",
} as Organization;

export const onf_org_info = {
  siret: "66204311604119",
  cached_tranche_effectifs: null,
  cached_tranche_effectifs_unite_legale: "52",
  cached_libelle_tranche_effectif: null,
  cached_activite_principale: "02.40Z",
  cached_libelle_activite_principale:
    "02.40Z - Services de soutien à l'exploitation forestière",
  cached_categorie_juridique: "4110",
  cached_libelle_categorie_juridique:
    "Établissement public national à caractère industriel ou commercial doté d'un comptable public",
} as Organization;

export const bpifrance_org_info = {
  siret: "32025248901075",
  cached_tranche_effectifs: "42",
  cached_tranche_effectifs_unite_legale: "51",
  cached_libelle_tranche_effectif: "1 000 à 1 999 salariés, en 2021",
  cached_activite_principale: "64.92Z",
  cached_libelle_activite_principale: "64.92Z - Autre distribution de crédit",
  cached_categorie_juridique: "5599",
  cached_libelle_categorie_juridique: "SA à conseil d'administration (s.a.i.)",
} as Organization;

export const whitelisted_org_info = {
  siret: "18000001000017",
  cached_tranche_effectifs: "22",
  cached_tranche_effectifs_unite_legale: "32",
  cached_libelle_tranche_effectif: "100 à 199 salariés, en 2022",
  cached_activite_principale: "84.11Z",
  cached_libelle_activite_principale:
    "84.11Z - Administration publique générale",
  cached_categorie_juridique: "7490",
  cached_libelle_categorie_juridique:
    "Autre personne morale de droit administratif",
} as Organization;

export const trackdechets_public_org_info = {
  siret: "25680169700010",
  cached_tranche_effectifs: "NN",
  cached_tranche_effectifs_unite_legale: "NN",
  cached_libelle_tranche_effectif:
    "Unité non employeuse (pas de salarié au cours de l'année de référence et pas d'effectif au 31/12)",
  cached_activite_principale: "38.21Z",
  cached_libelle_activite_principale:
    "38.21Z - Traitement et élimination des déchets non dangereux",
  cached_categorie_juridique: "7354",
  cached_libelle_categorie_juridique: "Syndicat mixte fermé",
} as Organization;
