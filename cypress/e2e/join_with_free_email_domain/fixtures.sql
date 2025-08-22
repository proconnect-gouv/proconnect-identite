INSERT INTO users
  (id, email, email_verified, email_verified_at, encrypted_password, created_at, updated_at, given_name, family_name,
   phone_number, job)
VALUES
  (1, 'lion.eljonson@yopmail.com', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Lion', 'El''Jonson', '0123456789', 'Primarque');

INSERT INTO organizations
  (id, siret, created_at, updated_at)
VALUES
  (1, '19750663700010', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, '11000201100044', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users_organizations
  (user_id, organization_id, is_external, verification_type, has_been_greeted)
VALUES
  (1, 1, false, 'domain', true);

INSERT INTO email_domains
  (organization_id, domain, verification_type, verified_at)
VALUES
  (2, 'finances.gouv.fr', 'verified', CURRENT_TIMESTAMP),
  (2, 'ext.finances.gouv.fr', 'external', CURRENT_TIMESTAMP)
;
