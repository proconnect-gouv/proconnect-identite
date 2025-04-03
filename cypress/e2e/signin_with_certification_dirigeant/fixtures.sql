INSERT INTO users
(id, email, email_verified, email_verified_at, encrypted_password, created_at, updated_at,
 given_name, family_name, phone_number, job, encrypted_totp_key, totp_key_verified_at, force_2fa)
VALUES
  (1, 'certified-franceconnected+dirigeant@yopmail.com', true, CURRENT_TIMESTAMP,
   '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
   'Jean', 'Un', '0123456789', 'Certified Single Dirigeant',
   null, null, false),
  (2, 'franceconnected+employee@yopmail.com', true, CURRENT_TIMESTAMP,
   '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
   'Jean', 'Deux', '0123456789', 'FranceConnect-ed Single Dirigeant',
   null, null, false),
  (3, 'franceconnected+dirigeant@unipersonnelle.com', true, CURRENT_TIMESTAMP,
   '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
   'Jean', 'Trois', '0123456789', 'FranceConnect-ed Entreprise Unipersonnelle Dirigeant',
   null, null, false),
  (4, 'outdated-certified-franceconnected+dirigeant@unipersonnelle.com', true, CURRENT_TIMESTAMP,
   '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
   'Jean', 'Quatre', '0123456789', 'FranceConnect-ed Entreprise Unipersonnelle Dirigeant',
   null, null, false),
  (5, 'outdated-franceconnected+dirigeant@yopmail.com', true, CURRENT_TIMESTAMP,
   '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
   'Jean', 'Cinq', '0123456789', 'FranceConnect-ed Entreprise Unipersonnelle Dirigeant',
   null, null, false),
  (6, 'gray+douglasduteil@mail.com', true, CURRENT_TIMESTAMP,
   '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
   'Douglas Le Gris', 'Duteil', '0123456789', 'HyyyperProConnectDev4000',
   null, null, false),
  (7, 'red+douglasduteil@mail.com', true, CURRENT_TIMESTAMP,
   '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
   'Douglas Le Rouge', 'Duteil', '0123456789', 'HyyyperProConnectDev4000',
   null, null, false)
;

INSERT INTO franceconnect_userinfo
  (user_id, birthdate, birthplace, family_name, given_name, created_at, updated_at)
VALUES
  (1, '1990-06-01', '75000', 'Jean', 'Un', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, '1990-06-01', '75000', 'Jean', 'Deux', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, '1990-06-01', '75000', 'Jean', 'Trois', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, '1990-06-01', '75000', 'Jean', 'Quatre', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, '1980-06-01', '75000', 'Jean', 'Cinq', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP  - INTERVAL '3 months'),
  (6, '1980-06-01', '75000', 'DUTEIL', 'Douglas Le Gris', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP  - INTERVAL '3 months')
;

INSERT INTO organizations
  (id, siret, created_at, updated_at)
VALUES
  (1, '21340126800130', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, '45334017600024', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, '82869625200018', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
;

INSERT INTO users_organizations
  (user_id, organization_id, is_external, is_executive, is_executive_verified_at, verification_type, has_been_greeted)
VALUES
  (1, 1, false, true, CURRENT_TIMESTAMP, 'domain', true),
  (2, 2, false, false, CURRENT_TIMESTAMP, 'domain', true),
  (4, 2, false, true, CURRENT_TIMESTAMP - INTERVAL '1 day', 'domain', true),
  (5, 2, false, true, CURRENT_TIMESTAMP, 'domain', true)
;

INSERT INTO oidc_clients
(client_name, client_id, client_secret, redirect_uris,
 post_logout_redirect_uris, scope, client_uri, client_description,
 userinfo_signed_response_alg, id_token_signed_response_alg,
 authorization_signed_response_alg, introspection_signed_response_alg)
VALUES
  ('Oidc Test Client',
   'standard_client_id',
   'standard_client_secret',
   ARRAY [
     'http://localhost:4000/login-callback'
     ],
   ARRAY []::varchar[],
   'openid email profile organization',
   'http://localhost:4000/',
   'ProConnect test client. More info: https://github.com/numerique-gouv/proconnect-test-client.',
   null, null, null, null);
