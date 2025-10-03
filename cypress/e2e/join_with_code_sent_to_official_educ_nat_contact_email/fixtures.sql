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
    'rogal.dorn@imperialfists.world',
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
    'konrad.curze@nightlords.world',
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
    '19750663700010',
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
