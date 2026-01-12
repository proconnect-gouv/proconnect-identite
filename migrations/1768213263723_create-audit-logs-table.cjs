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
  await pgm.createTable("audit_logs", {
    id: { type: "serial", primaryKey: true },
    table_name: { type: "varchar(100)", notNull: true },
    record_id: { type: "integer", notNull: true },
    action: { type: "varchar(20)", notNull: true },
    old_values: { type: "jsonb" },
    new_values: { type: "jsonb" },
    changed_fields: { type: "text[]" },
    user_id: {
      type: "integer",
      references: "users(id)",
      onDelete: "SET NULL",
    },
    actor_email: { type: "varchar(255)" },
    actor_type: { type: "varchar(50)", default: "'system'" },
    migration_name: { type: "varchar(100)" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("NOW()"),
    },
  });

  // Index for querying history of a specific record
  await pgm.createIndex("audit_logs", ["table_name", "record_id"], {
    name: "idx_audit_logs_table_record",
  });

  // Index for time-based queries
  await pgm.createIndex("audit_logs", ["created_at"], {
    name: "idx_audit_logs_created_at",
  });

  // Partial index for filtering by actor
  await pgm.createIndex("audit_logs", ["user_id"], {
    name: "idx_audit_logs_user_id",
    where: "user_id IS NOT NULL",
  });

  // Partial index for migration-related changes
  await pgm.createIndex("audit_logs", ["migration_name"], {
    name: "idx_audit_logs_migration",
    where: "migration_name IS NOT NULL",
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = async (pgm) => {
  await pgm.dropIndex("audit_logs", [], { name: "idx_audit_logs_migration" });
  await pgm.dropIndex("audit_logs", [], { name: "idx_audit_logs_user_id" });
  await pgm.dropIndex("audit_logs", [], { name: "idx_audit_logs_created_at" });
  await pgm.dropIndex("audit_logs", [], { name: "idx_audit_logs_table_record" });
  await pgm.dropTable("audit_logs");
};
