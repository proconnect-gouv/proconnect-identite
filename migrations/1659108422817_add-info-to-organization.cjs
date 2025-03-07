exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE organizations
    ADD COLUMN cached_libelle character varying,
    ADD COLUMN cached_nom_complet character varying,
    ADD COLUMN cached_enseigne character varying,
    ADD COLUMN cached_tranche_effectifs character varying,
    ADD COLUMN cached_tranche_effectifs_unite_legale character varying,
    ADD COLUMN cached_libelle_tranche_effectif character varying,
    ADD COLUMN cached_etat_administratif character varying,
    ADD COLUMN cached_est_active character varying,
    ADD COLUMN cached_statut_diffusion character varying,
    ADD COLUMN cached_est_diffusible character varying,
    ADD COLUMN cached_adresse character varying,
    ADD COLUMN cached_code_postal character varying,
    ADD COLUMN cached_activite_principale character varying,
    ADD COLUMN cached_libelle_activite_principale character varying,
    ADD COLUMN cached_categorie_juridique character varying,
    ADD COLUMN cached_libelle_categorie_juridique character varying,
    ADD COLUMN organization_info_fetched_at timestamp with time zone;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE organizations
    DROP COLUMN cached_libelle,
    DROP COLUMN cached_nom_complet,
    DROP COLUMN cached_enseigne,
    DROP COLUMN cached_tranche_effectifs,
    DROP COLUMN cached_tranche_effectifs_unite_legale,
    DROP COLUMN cached_libelle_tranche_effectif,
    DROP COLUMN cached_etat_administratif,
    DROP COLUMN cached_est_active,
    DROP COLUMN cached_statut_diffusion,
    DROP COLUMN cached_est_diffusible,
    DROP COLUMN cached_adresse,
    DROP COLUMN cached_code_postal,
    DROP COLUMN cached_activite_principale,
    DROP COLUMN cached_libelle_activite_principale,
    DROP COLUMN cached_categorie_juridique,
    DROP COLUMN cached_libelle_categorie_juridique,
    DROP COLUMN organization_info_fetched_at;
  `);
};
