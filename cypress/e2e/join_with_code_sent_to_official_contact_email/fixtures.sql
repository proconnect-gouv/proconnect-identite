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
    'alpharius.omegon@alphalegion.world',
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
    'magnus.the.red@prospero.world',
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
    3,
    'unused1@yopmail.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jean',
    'User1',
    '0123456789',
    'Sbire'
  ),
  (
    4,
    'eneeria@prospero.world',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Marie',
    'Elisabeth',
    '0123456789',
    'Reine'
  );

INSERT INTO
  organizations (id, siret, created_at, updated_at)
VALUES
  (
    1,
    '21340126800130',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    2,
    '20008557900015',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

INSERT INTO
  users_organizations (
    user_id,
    organization_id,
    is_external,
    verification_type,
    has_been_greeted
  )
VALUES
  (1, 1, false, 'domain', true);
