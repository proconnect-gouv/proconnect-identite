INSERT INTO users
  (id, email, email_verified, email_verified_at, encrypted_password, created_at, updated_at, given_name, family_name, job)
VALUES
  (1, 'god-emperor@mankind.world', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'God', 'Emperor', 'God Emperor'),
  (2, 'lion.eljonson@darkangels.world', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Lion', 'El''Jonson', 'Primarque');

INSERT INTO organizations
  (id, siret, created_at, updated_at)
VALUES
  (1, '66204244933106', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO email_domains
  (id, organization_id, domain, verification_type, verified_at)
VALUES
  (1, 1, 'mankind.world', null, CURRENT_TIMESTAMP);
