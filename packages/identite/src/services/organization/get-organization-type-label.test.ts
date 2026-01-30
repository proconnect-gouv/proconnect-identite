//

import type { Organization } from "#src/types";
import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { getOrganizationTypeLabel } from "./get-organization-type-label.js";

//

suite("getOrganizationTypeLabel", () => {
  test("returns 'établissement scolaire' for school", () => {
    const organization = {
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_libelle_categorie_juridique:
        "Établissement public local d'enseignement",
    } as Organization;

    assert.equal(
      getOrganizationTypeLabel(organization),
      "établissement scolaire",
    );
  });

  test("returns 'mairie' for commune", () => {
    const organization = {
      cached_categorie_juridique: "7210",
      cached_libelle_categorie_juridique: "Commune et commune nouvelle",
    } as Organization;

    assert.equal(getOrganizationTypeLabel(organization), "mairie");
  });

  test("returns 'service' for public service that is not commune", () => {
    const organization = {
      cached_categorie_juridique: "7120",
      cached_libelle_categorie_juridique: "Service central d'un ministère",
    } as Organization;

    assert.equal(getOrganizationTypeLabel(organization), "service");
  });

  test("returns 'entreprise' for entreprise unipersonnelle with waste management", () => {
    const organization = {
      cached_libelle_categorie_juridique: "Entrepreneur individuel",
      cached_tranche_effectifs_unite_legale: "00",
      cached_libelle_activite_principale:
        "38.21Z - Traitement et élimination des déchets non dangereux",
    } as Organization;

    assert.equal(getOrganizationTypeLabel(organization), "entreprise");
  });

  test("returns 'organisation' by default", () => {
    const organization = {
      cached_libelle_categorie_juridique: "Association déclarée",
    } as Organization;

    assert.equal(getOrganizationTypeLabel(organization), "organisation");
  });
});
