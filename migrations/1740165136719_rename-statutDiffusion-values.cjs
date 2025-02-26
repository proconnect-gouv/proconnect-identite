/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = async (pgm) => {
  await pgm.sql(`
    UPDATE organizations
    SET cached_statut_diffusion = CASE
      WHEN cached_statut_diffusion = 'O' THEN 'diffusible'
      WHEN cached_statut_diffusion = 'P' THEN 'partiellement_diffusible'
      WHEN cached_statut_diffusion = 'N' THEN 'non_diffusible'
      ELSE cached_statut_diffusion
    END
    WHERE cached_statut_diffusion IS NOT NULL;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = async (pgm) => {
  await pgm.sql(`
    UPDATE organizations
    SET cached_statut_diffusion = CASE
      WHEN cached_statut_diffusion = 'diffusible' THEN 'O'
      WHEN cached_statut_diffusion = 'partiellement_diffusible' THEN 'P'
      WHEN cached_statut_diffusion = 'non_diffusible' THEN 'N'
      ELSE cached_statut_diffusion
    END
    WHERE cached_statut_diffusion IS NOT NULL;
  `);
};
