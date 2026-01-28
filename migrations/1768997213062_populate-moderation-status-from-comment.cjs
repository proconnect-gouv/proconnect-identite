/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * Extract the last line from a potentially multi-line comment
 * Comment format: "{timestamp} {email} | {Action} par {email}"
 * Actions: "Validé par" -> accepted, "Rejeté par" -> rejected, "Réouverte par" -> pending
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = async (pgm) => {
  // For multi-line comments, the last line determines the current status
  // We use split_part with reverse to get the last line
  await pgm.db.query(`
    UPDATE moderations
    SET status = CASE
      -- Extract last line: reverse, get first part before newline, reverse back
      WHEN reverse(split_part(reverse(comment), chr(10), 1)) LIKE '%Validé par%'
        THEN 'accepted'
      WHEN reverse(split_part(reverse(comment), chr(10), 1)) LIKE '%Rejeté par%'
        THEN 'rejected'
      WHEN reverse(split_part(reverse(comment), chr(10), 1)) LIKE '%Réouverte par%'
        THEN 'pending'
      -- If no comment but moderated_at is NULL, it's pending
      WHEN comment IS NULL AND moderated_at IS NULL
        THEN 'pending'
      -- Keep unknown as fallback
      ELSE 'unknown'
    END
    WHERE status = 'unknown';
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = async (pgm) => {
  await pgm.db.query(`
    UPDATE moderations
    SET status = 'unknown'
    WHERE status IN ('accepted', 'rejected', 'pending');
  `);
};
