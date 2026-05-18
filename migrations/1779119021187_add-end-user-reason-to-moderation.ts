import { type ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.addColumn("moderations", {
    end_user_reason: {
      type: "TEXT",
      notNull: true,
      default: "Raison transmise par mail",
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.dropColumn("moderations", "end_user_reason");
}
