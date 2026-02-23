INSERT INTO
  organizations (id, cached_libelle, siret, created_at, updated_at)
VALUES
  (
    1,
    'Ministere des armees ',
    '11009001600053',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    2,
    'Commune de lamalou-les-bains - Mairie',
    '21340126800130',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    3,
    'Bnp paribas - Bnp paribas',
    '66204244933106',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    4,
    'Commune de clamart - Mairie',
    '21920023500014',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    5,
    'Commune de clamart - Service assainissement',
    '21920023500394',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    6,
    'Commune de clamart - Ecole maternelle publique trivaux',
    '21920023500204',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    7,
    'Commune de clamart - Ecole elementaire pub l s senghor',
    '21920023500063',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

INSERT INTO
  oidc_clients (
    client_name,
    client_id,
    client_secret,
    redirect_uris,
    post_logout_redirect_uris,
    scope,
    client_uri,
    client_description,
    userinfo_signed_response_alg,
    id_token_signed_response_alg,
    authorization_signed_response_alg,
    introspection_signed_response_alg,
    is_proconnect_federation
  )
VALUES
  (
    'ProConnect Federation',
    'proconnect_federation_client_id',
    'proconnect_federation_client_secret',
    ARRAY['http://localhost:4001/login-callback'],
    ARRAY[]::varchar[],
    'openid uid given_name usual_name email phone siret is_service_public is_public_service',
    'http://localhost:4001/',
    'Dispositif d’identification des agents de la fonction publique.',
    'ES256',
    'ES256',
    'ES256',
    'ES256',
    true
  ),
  (
    'Oidc Test Client',
    'standard_client_id',
    'standard_client_secret',
    ARRAY['http://localhost:4000/login-callback'],
    ARRAY[]::varchar[],
    'openid email profile organization',
    'http://localhost:4000/',
    'ProConnect test client. More info: https://github.com/proconnect-gouv/proconnect-test-client.',
    null,
    null,
    null,
    null,
    false
  );

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
    'I',
    'Primarque',
    false
  ),
  (
    3,
    'rogal.dorn@imperialfists.world',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Rogal',
    'Dorn',
    'I',
    'Primarque',
    false
  ),
  (
    4,
    'jane.doe@yopmail.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jane',
    'Doe',
    'La',
    'Donna',
    false
  ),
  (
    5,
    'user1@example.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'user',
    'Un',
    '0123456789',
    'travailleur',
    false
  ),
  (
    6,
    'user2@example.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'user',
    'Deux',
    '0123456789',
    'travailleur',
    false
  ),
  (
    7,
    'user3@example.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'user',
    'Trois',
    '0123456789',
    'travailleur',
    false
  ),
  (
    8,
    'user4@example.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'user',
    'Quatre',
    '0123456789',
    'travailleur',
    false
  ),
  (
    9,
    'user5@example.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'user',
    'Cinq',
    '0123456789',
    'travailleur',
    false
  ),
  (
    10,
    'user@example.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'user',
    'com',
    '0123456789',
    'travailleur',
    false
  ),
  (
    11,
    'user@example.org',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'user',
    'fr',
    '0123456789',
    'travailleur',
    false
  );

INSERT INTO
  email_domains (
    organization_id,
    domain,
    verification_type,
    verified_at
  )
VALUES
  (4, 'example.com', 'verified', CURRENT_TIMESTAMP),
  (5, 'example.com', 'verified', CURRENT_TIMESTAMP),
  (6, 'example.com', 'verified', CURRENT_TIMESTAMP),
  (7, 'example.com', 'verified', CURRENT_TIMESTAMP),
  (4, 'example.org', 'verified', CURRENT_TIMESTAMP),
  (5, 'example.org', 'verified', CURRENT_TIMESTAMP);

INSERT INTO
  users_organizations (
    user_id,
    organization_id,
    is_external,
    verification_type,
    has_been_greeted
  )
VALUES
  (2, 1, false, 'domain', true),
  (2, 2, false, 'domain', true),
  (3, 1, false, 'domain', true),
  (3, 2, false, 'domain', true),
  (4, 1, false, 'domain', true),
  (5, 4, false, 'domain', true),
  (5, 5, false, 'domain', true),
  (5, 6, false, 'domain', true),
  (5, 7, false, 'domain', true),
  (6, 4, false, 'domain', true),
  (7, 4, false, 'domain', true),
  (8, 4, false, 'domain', true),
  (9, 4, false, 'domain', true);
