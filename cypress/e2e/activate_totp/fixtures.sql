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
    force_2fa
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
    'Lion',
    'El''Jonson',
    'I',
    'Primarque',
    false
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
    verification_type
  )
VALUES
  (1, 1, false, 'domain');

-- recovery words: "caliban forteresse ange noir epee lion"
INSERT INTO
  recovery_words (user_id, hashed_words)
VALUES
  (
    1,
    '$2b$10$E7tPKTrJLqVCfxns4QZUMekfHtN5lgpjk9gRBkWkrtmBCnz4oT1Uu'
  );
