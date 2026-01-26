import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // 1. Renommer la colonne existante pour garder une copie temporaire des données
  await pgm.db.query(`
    ALTER TABLE moderations
    RENAME COLUMN ticket_id TO ticket_id_int;
  `);

  // 2. Ajouter la nouvelle colonne avec le type string (TEXT en PostgreSQL)
  await pgm.db.query(`
    ALTER TABLE moderations
    ADD COLUMN ticket_id TEXT;
  `);

  // 3. Convertir les données de l'ancienne colonne (int) en texte
  await pgm.db.query(`
    UPDATE moderations
    SET ticket_id = ticket_id_int::TEXT;
  `);

  // 4. Supprimer la colonne temporaire
  await pgm.db.query(`
    ALTER TABLE moderations
    DROP COLUMN ticket_id_int;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // 1. Ajouter une colonne temporaire avec le type original (int)
  await pgm.db.query(`
    ALTER TABLE moderations
    ADD COLUMN ticket_id_int INT;
  `);

  // 2. Convertir les données de la nouvelle colonne (string) en entier
  await pgm.db.query(`
    UPDATE moderations
    SET ticket_id_int = ticket_id::INT;
  `);

  // 3. Supprimer la colonne string
  await pgm.db.query(`
    ALTER TABLE moderations
    DROP COLUMN ticket_id;
  `);

  // 4. Renommer la colonne temporaire en son nom original
  await pgm.db.query(`
    ALTER TABLE moderations
    RENAME COLUMN ticket_id_int TO ticket_id;
  `);
}
