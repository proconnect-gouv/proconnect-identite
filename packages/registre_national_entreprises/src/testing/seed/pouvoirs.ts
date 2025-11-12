//

import type { FindPouvoirsBySirenHandler } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";

//

type Pouvoir = NonNullable<
  Awaited<ReturnType<FindPouvoirsBySirenHandler>>[number]
>;

export const UlysseTosiPouvoir: Pouvoir = {
  typeDePersonne: "INDIVIDU",
  actif: true,
  individu: {
    descriptionPersonne: {
      dateDeNaissance: "1992-09-07",
      nom: "TOSI",
      prenoms: ["Ulysse"],
      genre: "1",
      lieuDeNaissance: "Marseille",
      codeInseeGeographique: "13055",
      codePostalNaissance: "13001",
      codePaysNaissance: "FRA",
    },
  },
};

export const RogalDornPouvoir: Pouvoir = {
  typeDePersonne: "INDIVIDU",
  actif: true,
  individu: {
    descriptionPersonne: {
      dateDeNaissance: "29000-01-07",
      nom: "DORN",
      prenoms: ["ROGAL"],
      genre: "1",
      lieuDeNaissance: "INWIT",
      codePaysNaissance: "ISL",
    },
  },
};
