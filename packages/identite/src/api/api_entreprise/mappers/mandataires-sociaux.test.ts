//

import {
  CommissaireComptesMandataire,
  JohnSmithMandataire,
  KarimaAknineMandataire,
  MarieLeblancMandataire,
  PierreDurandMandataire,
  RogalDornMandataire,
  SocietePresidenteMandataire,
  SophieMartinMandataire,
  StevensCheronMandataire,
  UlysseToriMandataire,
} from "@proconnect-gouv/proconnect.api_entreprise/testing/seed/v3-infogreffe-rcs-unites_legales-siren-mandataires_sociaux";
import { suite, test } from "node:test";
import { toIdentityVector } from "./mandataires-sociaux.js";

suite("toIdentityVector", () => {
  test("UlysseToriMandataire - French DIRIGEANT", (t) => {
    const identity = toIdentityVector(UlysseToriMandataire);
    t.assert.snapshot(identity);
  });

  test("StevensCheronMandataire - French DIRIGEANT", (t) => {
    const identity = toIdentityVector(StevensCheronMandataire);
    t.assert.snapshot(identity);
  });

  test("KarimaAknineMandataire - French DIRIGEANT", (t) => {
    const identity = toIdentityVector(KarimaAknineMandataire);
    t.assert.snapshot(identity);
  });

  test("MarieLeblancMandataire - French PRESIDENT", (t) => {
    const identity = toIdentityVector(MarieLeblancMandataire);
    t.assert.snapshot(identity);
  });

  test("JohnSmithMandataire - US COMMISSAIRE", (t) => {
    const identity = toIdentityVector(JohnSmithMandataire);
    t.assert.snapshot(identity);
  });

  test("PierreDurandMandataire - French DIRECTEUR GENERAL", (t) => {
    const identity = toIdentityVector(PierreDurandMandataire);
    t.assert.snapshot(identity);
  });

  test("SophieMartinMandataire - French GERANT", (t) => {
    const identity = toIdentityVector(SophieMartinMandataire);
    t.assert.snapshot(identity);
  });

  test("RogalDornMandataire - Edge case (futuristic)", (t) => {
    const identity = toIdentityVector(RogalDornMandataire);
    t.assert.snapshot(identity);
  });

  test("SocietePresidenteMandataire - Personne morale PRESIDENT", (t) => {
    const identity = toIdentityVector(SocietePresidenteMandataire);
    t.assert.snapshot(identity);
  });

  test("CommissaireComptesMandataire - Personne morale COMMISSAIRE", (t) => {
    const identity = toIdentityVector(CommissaireComptesMandataire);
    t.assert.snapshot(identity);
  });
});
