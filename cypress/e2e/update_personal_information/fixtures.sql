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
    'user@yopmail.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Prénom1',
    'NOM DE NAISSANCE',
    '0123456789',
    'User'
  ),
  (
    2,
    'konrad.curze@nightlords.world',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Konrad',
    'Curze',
    '0404040404',
    null
  ),
  (
    3,
    'rogal.dorn@imperialfists.world',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    null,
    null,
    null,
    null
  );

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
    '1962-08-24 00:00:00+00',
    '75107',
    'NOM DE NAISSANCE',
    'female',
    'Prénom1 Prénom2 Prénom3-et''4',
    'NOM D''USAGE',
    '🎭 FranceConnect Sub',
    '2026-02-20 14:06:52.812827+00',
    '2026-02-20 14:06:52.812+00',
    '99100'
  );
