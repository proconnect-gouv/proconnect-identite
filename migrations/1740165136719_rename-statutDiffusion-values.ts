import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
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
}

export async function down(pgm: MigrationBuilder): Promise<void> {
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
}
