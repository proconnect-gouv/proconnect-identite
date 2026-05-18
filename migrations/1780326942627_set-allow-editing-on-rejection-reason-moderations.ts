import { type ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    UPDATE moderations
    SET allow_editing = TRUE
    WHERE allow_editing IS NULL
    AND (
    comment like '%Inversion Nom et Prénom%' OR
    comment like '%Nom et/ou Prénom manquants%' OR
    comment like '%Nom et/ou prénom mal renseignés - Modération non-bloquante%'
  )
  `);

  await pgm.db.query(`
    UPDATE moderations
    SET allow_editing = FALSE
    WHERE allow_editing IS NULL
  `);

  await pgm.db.query(`
  ALTER TABLE moderations ALTER COLUMN allow_editing SET NOT NULL
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
  ALTER TABLE moderations ALTER COLUMN allow_editing DROP NOT NULL
`);
}
