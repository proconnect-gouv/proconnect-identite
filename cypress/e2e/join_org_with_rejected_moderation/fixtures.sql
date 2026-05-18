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
    'rejected.user@yopmail.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jean',
    'Rejeté',
    '0123456789',
    'Développeur rejeté'
  );

INSERT INTO
  organizations (id, cached_libelle, siret, created_at, updated_at)
VALUES
  (
    1,
    'BNP PARIBAS à SAINT-SYMPHORIEN-D OZON',
    '66204244933106',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    2,
    'BNP PARIBAS (HELLO BANK!) à CARCASSONNE',
    '66204244914742',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    3,
    'BNP PARIBAS (HELLO BANK!) à CLAMECY',
    '66204244905476',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

INSERT INTO
  moderations (
    id,
    user_id,
    organization_id,
    type,
    created_at,
    moderated_at,
    end_user_reason,
    moderated_by,
    status
  )
VALUES
  (
    1,
    1,
    1,
    'organization_join_block',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'Nom de domaine introuvable',
    'moderator@yopmail.com',
    'rejected'
  ),
  (
    2,
    1,
    2,
    'organization_join_block',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'Inversion Nom et Prénom',
    'moderator@yopmail.com',
    'rejected'
  ),
  (
    3,
    1,
    3,
    'organization_join_block',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    DEFAULT,
    'moderator@yopmail.com',
    'rejected'
  );
