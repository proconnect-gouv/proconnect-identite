import type { Organization } from "#src/types";

const cat_jur = [
  "Association foncière de remembrement",
  "Association foncière urbaine",
  "Association syndicale autorisée",
  "Autre établissement public local de coopération non spécialisé ou entente",
  "(Autre) Établissement public administratif local",
  "Caisse de crédit municipal",
  "Caisse des écoles",
  "Centre Intercommunal d'action sociale (CIAS)",
  "Centre communal d'action sociale",
  "Commission syndicale pour la gestion des biens indivis des communes",
  "Établissement public local culturel",
  "Établissement public local social et médico-social",
  "Groupement de coopération sanitaire à gestion publique",
  "Pôle d'équilibre territorial et rural (PETR)",
  "Syndicat intercommunal à vocation multiple (SIVOM)",
  "Syndicat intercommunal à vocation unique (SIVU)",
  "Syndicat mixte fermé",
  "Syndicat mixte ouvert",
];

export const isSmallEtablissementPublic = ({
  cached_libelle_categorie_juridique,
}: Pick<Organization, "cached_libelle_categorie_juridique">): boolean => {
  if (!cached_libelle_categorie_juridique) {
    return false;
  }
  return cat_jur.includes(cached_libelle_categorie_juridique);
};
