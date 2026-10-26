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
    force_2fa
  )
VALUES
  (
    1,
    'certified-franceconnected+dirigeant@yopmail.com',
    true,
    CURRENT_TIMESTAMP,
    '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jean',
    'Un',
    '0123456789',
    'Dirigeant de CLAMART et employé de DANONE',
    null,
    null,
    false
  );

INSERT INTO
  franceconnect_userinfo (
    user_id,
    birthcountry,
    birthdate,
    birthplace,
    family_name,
    gender,
    given_name,
    created_at,
    updated_at
  )
VALUES
  (
    1,
    '99100',
    '1990-06-01',
    '75000',
    'Un',
    'male',
    'Jean',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

INSERT INTO
  organizations (cached_libelle, id, siret, created_at, updated_at)
VALUES
  (
    'CLAMART',
    1,
    '45334017600024',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'DANONE',
    2,
    '55203253400646',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

INSERT INTO
  users_organizations (
    user_id,
    organization_id,
    is_external,
    verification_type,
    verified_at,
    has_been_greeted
  )
VALUES
  (
    1,
    1,
    false,
    'organization_dirigeant',
    CURRENT_TIMESTAMP,
    true
  ),
  (1, 2, false, 'domain', CURRENT_TIMESTAMP, true);

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
    'Oidc Test Client',
    'standard_client_id',
    'standard_client_secret',
    ARRAY['http://localhost:4000/login-callback'],
    ARRAY['http://localhost:4000/'],
    'openid email profile organization',
    'http://localhost:4000/',
    'ProConnect test client. More info: https://github.com/proconnect-gouv/proconnect-test-client.',
    null,
    null,
    null,
    null,
    false
  ),
  (
    'ProConnect Federation',
    'proconnect_federation_client_id',
    'proconnect_federation_client_secret',
    ARRAY['http://localhost:4001/login-callback'],
    ARRAY['http://localhost:4001/'],
    'openid uid given_name usual_name email phone siret is_service_public is_public_service',
    'http://localhost:4001/',
    'Dispositif d’identification des agents de la fonction publique.',
    'ES256',
    'ES256',
    'ES256',
    'ES256',
    true
  );
