# Run cypress locally

## Step by step with command lines

### Setup env vars

You will need to set `BREVO_API_KEY`, `CYPRESS_MAILSLURP_API_KEY`, `DEBOUNCE_API_KEY`, and `ZAMMAD_TOKEN`.

Ask a teammate for them and put the values in your `.env`.

Also in your `.env` put the following values :

```dotenv
FEATURE_SEND_MAIL=True
```

### Load test fixtures in the database

Note that this will delete your database. Load the specific fixtures in the database:

```bash
ENABLE_DATABASE_DELETION=True npm run delete-database ; npx run-s "build:workspaces" "migrate up" "fixtures:load-ci cypress/e2e/join_and_moderation/fixtures.sql" "update-organization-info 2000"
```

### Start ProConnect Identité with the test configuration

Then run the app with the specific env vars:

```bash
npx dotenvx run -f cypress/e2e/join_and_moderation/env.conf -- npm run dev
```

## Run Cypress

On your host, run the tests

```bash
npx dotenvx run -- npx cypress run --headed --spec "cypress/e2e/join_and_moderation/index.cy.ts"
```

## About test client used in e2e test

Some tests require a test client to be running.
By default, the Docker Compose file is configured to launch enough test clients to execute the end-to-end (E2E) tests.

## About cypress record video

To help support and the team better visualise the different ProConnect Identity paths, it is possible to film the paths via Cypress. The command to run is as follows:

```bash
CYPRESS_RECORD=true npx dotenvx run -- npx cypress run --headed --spec "cypress/e2e/join_and_moderation/index.cy.ts"
```

The videos are listed on the following documentation page: https://documentation.beta.numerique.gouv.fr/doc/videos-des-differents-parcours-A3UJiqFLZn
If tests or visuals are added or modified, please update the videos in the documentation.
