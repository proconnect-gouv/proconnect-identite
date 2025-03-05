//

import {
  AppleEuropeInc,
  JeanMichelEntrepreneur,
  MaireClamart,
} from "@gouvfr-lasuite/proconnect.entreprise/testing/seed/siret";
import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { fromSiret } from "./fromSiret.js";

suite("fromSiret", () => {
  test("AppleEuropeInc", () => {
    const organization = fromSiret(AppleEuropeInc);
    assert.deepEqual(organization, {
      activitePrincipale: "70.22Z",
      adresse: "100 west ten wilmington delawa, 99404, ETATS-UNIS",
      categorieJuridique: "3120",
      codeOfficielGeographique: "",
      codePostal: null,
      enseigne: "",
      estActive: false,
      estDiffusible: true,
      etatAdministratif: "A",
      libelle: "Apple europe inc.",
      libelleActivitePrincipale:
        "70.22Z - Conseil pour les affaires et autres conseils de gestion",
      libelleCategorieJuridique:
        "Société commerciale étrangère immatriculée au RCS",
      libelleTrancheEffectif: "",
      nomComplet: "Apple europe inc.",
      siret: "32122785200019",
      statutDiffusion: "diffusible",
      trancheEffectifs: null,
      trancheEffectifsUniteLegale: "31",
    });
  });

  test("Commune de clamart - Mairie", () => {
    const organization = fromSiret(MaireClamart);
    assert.deepEqual(organization, {
      activitePrincipale: "84.11Z",
      adresse: "1 place maurice gunsbourg, 92140 Clamart",
      categorieJuridique: "7210",
      codeOfficielGeographique: "92023",
      codePostal: "92140",
      enseigne: "MAIRIE",
      estActive: true,
      estDiffusible: true,
      etatAdministratif: "A",
      libelle: "Commune de clamart - Mairie",
      libelleActivitePrincipale: "84.11Z - Administration publique générale",
      libelleCategorieJuridique: "Commune et commune nouvelle",
      libelleTrancheEffectif: "1 000 à 1 999 salariés, en 2022",
      nomComplet: "Commune de clamart",
      siret: "21920023500014",
      statutDiffusion: "diffusible",
      trancheEffectifs: "42",
      trancheEffectifsUniteLegale: "42",
    });
  });

  test("JeanMichelEntrepreneur", () => {
    const organization = fromSiret(JeanMichelEntrepreneur);
    assert.deepEqual(organization, {
      activitePrincipale: "70.2A",
      adresse: "44049 Le croisic",
      categorieJuridique: "1000",
      codeOfficielGeographique: "44049",
      codePostal: "44049",
      enseigne: "",
      estActive: false,
      estDiffusible: false,
      etatAdministratif: "C",
      libelle: "Nom inconnu",
      libelleActivitePrincipale:
        "70.2A - ancienne révision NAF (NAF1993) non supportée",
      libelleCategorieJuridique: "Entrepreneur individuel",
      libelleTrancheEffectif: "",
      nomComplet: "Nom inconnu",
      siret: "00557246600026",
      statutDiffusion: "partiellement_diffusible",
      trancheEffectifs: null,
      trancheEffectifsUniteLegale: null,
    });
  });
});
