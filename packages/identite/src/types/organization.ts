//

import * as z from "zod";

export type TrancheEffectifs =
  | "NN"
  | "00"
  | "01"
  | "02"
  | "03"
  | "11"
  | "12"
  | "21"
  | "22"
  | "31"
  | "32"
  | "41"
  | "42"
  | "51"
  | "52"
  | "53"
  | null;

//

export const CachedOrganizationInfoSchema = z.object({
  cached_activite_principale: z.string().nullable(),
  cached_adresse: z.string().nullable(),
  cached_categorie_juridique: z.string().nullable(),
  cached_code_officiel_geographique: z.string().nullable(),
  cached_code_postal: z.string().nullable(),
  cached_denomination_usuelle_etablissement_principal: z.string().nullable(),
  cached_enseigne: z.string().nullable(),
  cached_est_active: z.boolean().nullable(),
  cached_est_diffusible: z.boolean().nullable(),
  cached_etat_administratif: z.string().nullable(),
  cached_libelle: z.string().nullable(),
  cached_libelle_activite_principale: z.string().nullable(),
  cached_libelle_categorie_juridique: z.string().nullable(),
  cached_libelle_tranche_effectif: z.string().nullable(),
  cached_nom_complet: z.string().nullable(),
  cached_siege_social: z.boolean().nullable(),
  cached_statut_diffusion: z.string().nullable(),
  cached_tranche_effectifs: z.custom<TrancheEffectifs>(),
  cached_tranche_effectifs_unite_legale: z.string().nullable(),
});

export type Organization = z.output<typeof CachedOrganizationInfoSchema> & {
  created_at: Date;
  id: number;
  organization_info_fetched_at: Date | null;
  siret: string;
  updated_at: Date;
};
