import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.addColumn("moderations", {
    status: {
      type: "TEXT",
      notNull: true,
      default: "unknown",
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.dropColumn("moderations", "status");
}
