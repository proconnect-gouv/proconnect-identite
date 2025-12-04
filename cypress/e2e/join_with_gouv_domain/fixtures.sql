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
    'lion.eljonson@vip.gouv.fr',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Lion',
    'El''Jonson',
    '0123456789',
    'Primarque'
  );

INSERT INTO
  organizations (id, siret, created_at, updated_at)
VALUES
  (
    1,
    '13002526500013',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

INSERT INTO
  email_domains (
    organization_id,
    domain,
    verification_type,
    verified_at
  )
VALUES
  (1, 'vip.gouv.fr', 'verified', CURRENT_TIMESTAMP);
