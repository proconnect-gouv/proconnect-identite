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
    'magnus.the.red@new.prospero.world',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jean',
    'Officiel',
    '0123456789',
    'Sbire'
  ),
  (
    2,
    'ahriman@new.prospero.world',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jean',
    'Officiel',
    '0123456789',
    'Sbire'
  ),
  (
    3,
    'ahriman@prospero.world',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jean',
    'Nouveau',
    '0123456789',
    'Sbire'
  ),
  (
    4,
    'god-emperor@mankind.world',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'God',
    'Emperor',
    '9999999999',
    'God Emperor'
  ),
  (
    5,
    'servitor@yopmail.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jean',
    'User1',
    '0123456789',
    'Sbire'
  );

INSERT INTO
  organizations (id, cached_libelle, siret, created_at, updated_at)
VALUES
  (
    1,
    'Commune de lamalou-les-bains - Mairie',
    '21340126800130',
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
  (
    1,
    'prospero.world',
    'verified',
    CURRENT_TIMESTAMP
  );
