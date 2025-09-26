INSERT INTO
  users (
    id,
    email,
    email_verified,
    email_verified_at,
    encrypted_password,
    created_at,
    updated_at,
    given_name,
    family_name,
    phone_number,
    job
  )
VALUES
  (
    1,
    'lion.eljonson@darkangels.world',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jean',
    'Nouveau',
    '0123456789',
    'Sbire'
  );

INSERT INTO
  organizations (id, siret, created_at, updated_at)
VALUES
  (
    1,
    '66204244933106',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    2,
    '66204244914742',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    3,
    '66204244905476',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

--   (4, '66204244923982', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
--   (5, '66204244917307', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
--   (6, '66204244908819', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
--   (7, '66204244908579', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO
  email_domains (
    id,
    organization_id,
    domain,
    verification_type,
    verified_at
  )
VALUES
  (
    1,
    1,
    'darkangels.world',
    'trackdechets_postal_mail',
    CURRENT_TIMESTAMP
  ),
  (
    2,
    2,
    'darkangels.world',
    'trackdechets_postal_mail',
    CURRENT_TIMESTAMP
  ),
  (
    3,
    3,
    'darkangels.world',
    'trackdechets_postal_mail',
    CURRENT_TIMESTAMP
  );
