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
  await pgm.db.query(`
    CREATE OR REPLACE FUNCTION audit_trigger_func()
    RETURNS TRIGGER AS $$
    DECLARE
      v_old_values JSONB;
      v_new_values JSONB;
      v_changed_fields TEXT[];
      v_record_id INTEGER;
      v_user_id INTEGER;
      v_actor_email VARCHAR(255);
      v_actor_type VARCHAR(50);
      v_migration_name VARCHAR(100);
      v_key TEXT;
    BEGIN
      -- Get context from session variables (set by application or migrations)
      v_user_id := NULLIF(current_setting('app.actor_user_id', true), '')::INTEGER;
      v_actor_email := NULLIF(current_setting('app.actor_email', true), '');
      v_actor_type := COALESCE(NULLIF(current_setting('app.actor_type', true), ''), 'system');
      v_migration_name := NULLIF(current_setting('app.current_migration', true), '');

      -- Determine record_id (handle composite keys for users_organizations)
      IF TG_TABLE_NAME = 'users_organizations' THEN
        v_record_id := COALESCE(NEW.user_id, OLD.user_id);
      ELSE
        v_record_id := COALESCE(NEW.id, OLD.id);
      END IF;

      -- Set old/new values based on operation
      IF TG_OP = 'INSERT' THEN
        v_old_values := NULL;
        v_new_values := to_jsonb(NEW);
        v_changed_fields := NULL;
      ELSIF TG_OP = 'UPDATE' THEN
        v_old_values := to_jsonb(OLD);
        v_new_values := to_jsonb(NEW);
        -- Compute changed fields
        SELECT ARRAY_AGG(key)
        INTO v_changed_fields
        FROM jsonb_each(v_new_values) AS n(key, value)
        WHERE v_old_values->key IS DISTINCT FROM n.value;
      ELSIF TG_OP = 'DELETE' THEN
        v_old_values := to_jsonb(OLD);
        v_new_values := NULL;
        v_changed_fields := NULL;
      END IF;

      -- Insert audit log entry
      INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        changed_fields,
        user_id,
        actor_email,
        actor_type,
        migration_name
      ) VALUES (
        TG_TABLE_NAME,
        v_record_id,
        TG_OP,
        v_old_values,
        v_new_values,
        v_changed_fields,
        v_user_id,
        v_actor_email,
        v_actor_type,
        v_migration_name
      );

      RETURN COALESCE(NEW, OLD);
    END;
    $$ LANGUAGE plpgsql;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = async (pgm) => {
  await pgm.db.query(`DROP FUNCTION IF EXISTS audit_trigger_func();`);
};
