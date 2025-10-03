exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    WITH cte AS (
      SELECT id,
             ROW_NUMBER()
             OVER (PARTITION BY organization_id, domain, verification_type ORDER BY updated_at DESC) AS rn
      FROM email_domains
      )
    DELETE
    FROM email_domains
    WHERE id IN (
      SELECT id
      FROM cte
      WHERE rn > 1
      );
  `);
  await pgm.db.query(`
    ALTER TABLE email_domains
      DROP CONSTRAINT unique_organization_domain;
  `);
  await pgm.db.query(`
    ALTER TABLE email_domains
      ADD CONSTRAINT unique_organization_domain
        UNIQUE NULLS NOT DISTINCT (organization_id, domain, verification_type);
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE email_domains
      DROP CONSTRAINT unique_organization_domain;
  `);
  await pgm.db.query(`
    ALTER TABLE email_domains
      ADD CONSTRAINT unique_organization_domain
        UNIQUE (organization_id, domain, verification_type);
  `);
};
