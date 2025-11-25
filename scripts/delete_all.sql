DELETE FROM users_organizations;

DELETE FROM moderations;

DELETE FROM organizations;

DELETE FROM users_oidc_clients;

DELETE FROM users;

DELETE FROM oidc_clients;

DELETE FROM email_domains;

DELETE FROM email_deliverability_whitelist;

-- The sequence starts at 1000 to prevent collisions with data from fixture files
-- where the IDs are predefined, as well as to avoid any conflicts when a record
-- is added subsequent to the insertion of fixtures in database.
ALTER SEQUENCE moderations_id_seq RESTART
WITH
  1000;

ALTER SEQUENCE organizations_id_seq RESTART
WITH
  1000;

ALTER SEQUENCE users_oidc_clients_id_seq RESTART
WITH
  1000;

ALTER SEQUENCE users_id_seq RESTART
WITH
  1000;

ALTER SEQUENCE oidc_clients_id_seq RESTART
WITH
  1000;

ALTER SEQUENCE email_domains_id_seq RESTART
WITH
  1000;
