import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE organizations ALTER cached_est_active TYPE boolean
USING CASE cached_est_active WHEN 'true' THEN true ELSE false END;
`);
  await pgm.db.query(`
ALTER TABLE organizations ALTER cached_est_diffusible TYPE boolean
USING CASE cached_est_diffusible WHEN 'true' THEN true ELSE false END;
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE organizations ALTER cached_est_active TYPE varchar
USING CASE cached_est_active WHEN true THEN 'true' ELSE 'false' END;`);
  await pgm.db.query(`
ALTER TABLE organizations ALTER cached_est_diffusible TYPE varchar
USING CASE cached_est_diffusible WHEN true THEN 'true' ELSE 'false' END;`);
}
