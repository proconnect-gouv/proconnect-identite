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
