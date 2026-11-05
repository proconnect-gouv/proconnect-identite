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
    job,
    encrypted_totp_key,
    totp_key_verified_at,
    force_2fa,
    recovery_words_incentive_seen_at
  )
VALUES
  (
    1,
    'without-recovery-words@yopmail.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Lion',
    'El''Jonson',
    'I',
    'Primarque',
    'kuOSXGk68H2B3pYnph0uyXAHrmpbWaWyX/iX49xVaUc=.VMPBZSO+eAng7mjS.cI2kRY9rwhXchcKiiaMZIg==',
    CURRENT_TIMESTAMP,
    true,
    CURRENT_TIMESTAMP
  ),
  (
    2,
    'with-recovery-words@yopmail.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Lion',
    'El''Jonson',
    'I',
    'Primarque',
    'kuOSXGk68H2B3pYnph0uyXAHrmpbWaWyX/iX49xVaUc=.VMPBZSO+eAng7mjS.cI2kRY9rwhXchcKiiaMZIg==',
    CURRENT_TIMESTAMP,
    true,
    CURRENT_TIMESTAMP
  ),
  (
    3,
    'state-administration-agent@yopmail.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Leman',
    'Russ',
    'I',
    'Primarque',
    'kuOSXGk68H2B3pYnph0uyXAHrmpbWaWyX/iX49xVaUc=.VMPBZSO+eAng7mjS.cI2kRY9rwhXchcKiiaMZIg==',
    CURRENT_TIMESTAMP,
    true,
    CURRENT_TIMESTAMP
  );

INSERT INTO
  organizations (
    id,
    siret,
    cached_categorie_juridique,
    created_at,
    updated_at
  )
VALUES
  (
    1,
    '21340126800130',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    2,
    '11000201100044',
    '7120',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

INSERT INTO
  users_organizations (
    user_id,
    organization_id,
    is_external,
    verification_type
  )
VALUES
  (1, 1, false, 'domain'),
  (2, 1, false, 'domain'),
  (3, 2, false, 'domain');

-- recovery words: "caliban forteresse ange noir epee lion"
INSERT INTO
  recovery_words (user_id, hashed_words)
VALUES
  (
    2,
    '$2b$10$E7tPKTrJLqVCfxns4QZUMekfHtN5lgpjk9gRBkWkrtmBCnz4oT1Uu'
  );
