INSERT INTO oidc_clients
  (client_name, client_id, client_secret, redirect_uris,
   post_logout_redirect_uris, scope, client_uri, client_description,
   userinfo_signed_response_alg, id_token_signed_response_alg,
   authorization_signed_response_alg, introspection_signed_response_alg)
VALUES
  (
    'ProConnect Federation',
    'proconnect_federation_client_id',
    'proconnect_federation_client_secret',
    ARRAY [
      'http://localhost:4001/login-callback'
    ],
    ARRAY []::varchar[],
    'openid uid given_name usual_name email phone siret is_service_public is_public_service',
    'http://localhost:4001/',
    'Dispositif d’identification des agents de la fonction publique.',
    'ES256', 'ES256', 'ES256', 'ES256');
