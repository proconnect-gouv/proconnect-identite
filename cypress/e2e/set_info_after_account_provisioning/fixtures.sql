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
    needs_inclusionconnect_welcome_page,
    needs_inclusionconnect_onboarding_help
  )
VALUES
  (
    1,
    'lion.eljonson@darkangels.world',
    false,
    null,
    null,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Jean',
    'Jean',
    null,
    null,
    true,
    true
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
    verification_type,
    has_been_greeted
  )
VALUES
  (
    1,
    1,
    false,
    'imported_from_inclusion_connect',
    false
  );
