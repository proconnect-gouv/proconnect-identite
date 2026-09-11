//
import { z } from "zod";
import type { TrancheEffectifs } from "./organization.js";

//

export const OrganizationInfoSchema = z.object({
  activitePrincipale: z.string(),
  adresse: z.string(),
  categorieJuridique: z.string(),
  codeOfficielGeographique: z.string(),
  codePostal: z.string().nullable(),
  enseigne: z.string(),
  estActive: z.boolean(),
  estDiffusible: z.boolean(),
  etatAdministratif: z.string(),
  libelle: z.string(),
  libelleActivitePrincipale: z.string(),
  libelleCategorieJuridique: z.string(),
  libelleTrancheEffectif: z.string(),
  nomComplet: z.string(),
  siegeSocial: z.boolean(),
  siret: z.string(),
  statutDiffusion: z.enum([
    "diffusible",
    "partiellement_diffusible",
    "non_diffusible",
  ]),
  trancheEffectifs: z.custom<TrancheEffectifs | null>().nullable(),
  trancheEffectifsUniteLegale: z.string().nullable(),
});

export type OrganizationInfo = z.output<typeof OrganizationInfoSchema>;
