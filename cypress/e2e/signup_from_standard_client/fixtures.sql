INSERT INTO
  organizations (id, cached_libelle, siret, created_at, updated_at)
VALUES
  (
    1,
    'Direction interministerielle du numerique (DINUM)',
    '13002526500013',
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
  (1, 'vip.gouv.fr', 'verified', CURRENT_TIMESTAMP);

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
    introspection_signed_response_alg
  )
VALUES
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
    null
  );
