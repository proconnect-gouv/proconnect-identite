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
    'jean.valjean@republic.fr',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jean',
    'Valjean',
    '0600000001',
    'Forçat'
  );

INSERT INTO
  organizations (id, siret, created_at, updated_at)
VALUES
  (
    1,
    '21340126800130',
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

INSERT INTO
  franceconnect_userinfo (
    user_id,
    birthdate,
    birthplace,
    family_name,
    gender,
    given_name,
    preferred_username,
    sub,
    created_at,
    updated_at,
    birthcountry
  )
VALUES
  (
    1,
    '1769-06-24 00:00:00+00',
    '75107',
    'Valjean',
    'male',
    'Jean',
    '',
    '🎭 FranceConnect Sub',
    '2026-02-20 14:06:52.812827+00',
    '2026-02-20 14:06:52.812+00',
    '99100'
  );
