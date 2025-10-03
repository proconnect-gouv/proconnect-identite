# Run cypress locally

## Usage

### Start databases and test clients

Start all the required services and wait for them to be ready:

```bash
docker compose up --wait
```

### Start the application

This will open a server on `http://localhost:3000`:

```bash
ENABLE_DATABASE_DELETION=True npm run e2e:dev
```

You will be prompted to select the test case.

### Open cypress

Open Cypress with the configuration from `cypress.config.ts`:

```bash
npm run e2e:studio
```

> Alias for `npx cypress open`

Here we recommend choosing the `<my_cypress_test_case>` you launched.

## Additional commands

### Run a specific test case with Cypress

On your host, run the tests:

```bash
npm run e2e:run <my_cypress_test_case>
```

### Setup database for a specific test case

Load the specific fixtures in the database using

```bash
npm run build:workspaces
npm run migrate up
ENABLE_DATABASE_DELETION=True npm run delete-database
npm run fixtures:load-ci cypress/e2e/${testCase}/fixtures.sql
npm run update-organization-info 0
```

## About test client used in e2e test

Some tests require a test client to be running.
By default, the Docker Compose file is configured to launch enough test clients to execute the end-to-end (E2E) tests.

## About cypress record video

To help support and the team better visualise the different ProConnect Identity paths, it is possible to film the paths via Cypress. The command to run is as follows:

```bash
CYPRESS_RECORD=true CYPRESS_RECORD_FOR_HUMANS=true npx dotenvx run -- npx cypress run --headed --spec "cypress/e2e/join_and_moderation/index.cy.ts"
```

The videos are listed on the following documentation page: https://documentation.beta.numerique.gouv.fr/doc/videos-des-differents-parcours-A3UJiqFLZn
If tests or visuals are added or modified, please update the videos in the documentation.
