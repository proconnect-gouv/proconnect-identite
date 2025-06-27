# 🔑 ProConnect Identité

ProConnect, l'accès pour les pros, validé par l'État

## Why use ProConnect Identité ❓

ProConnect Identité is an "OpenId Connect" identity provider managed by the DINUM.

For professionals who don't have a designated identity provider in the ProConnect federation,
the DINUM provides an account in ProConnect Identité.
Thus, any person affiliated with an organization registered with INSEE, meaning they have a SIRET number, can use an
identity provided by the DINUM within the ProConnect federation.

To integrate with the ProConnect federation, please refer
to [our online documentation](https://github.com/numerique-gouv/proconnect-documentation).

> ⚠️ ProConnect Identité can no longer be used outside of [the ProConnect federation](https://www.proconnect.gouv.fr/).

## Getting started 🔧

This guide provides steps to run the ProConnect Identité Node.js application locally while managing its dependencies in Docker containers.

### Prerequisites

- Node.js (v22) installed locally (we suggest the usage of [nvm](https://github.com/nvm-sh/nvm))
- Docker (>= v25) and Docker Compose (>= v2.24) installed ([doc](https://docs.docker.com/engine/install/))
- Clone the ProConnect Identité repository

### Setting Up Dependencies with Docker

1. **Start Dependencies**: Navigate to the root directory of the cloned repository and run:

   ```bash
   docker compose up
   ```

   This will start all required services (e.g., databases) defined in the `docker-compose.yml`.

### Setting Up the Node.js Application

1. **Install Node.js Dependencies**:

   Inside the project’s root directory, run:

   ```bash
   npm install
   ```

2. **Database Initialization**: The database will be automatically initialized with data from `scripts/fixtures.sql`.

   ```bash
   npm run fixtures:load
   ```

### Running the Application

After setting up the application, start the Node.js server with:

```bash
npm run dev
```

The application is now available at http://localhost:3000.

To log in, use the email address user@yopmail.com and the password "user@yopmail.com".

Emails are not sent but printed in the console.

By default, the application will run with testing mocks for external apis.

### Testing the Connection with a Test Client

ProConnect Identité is provided with a test client: https://github.com/numerique-gouv/proconnect-test-client

This container is launched within the ProConnect Identité `docker-compose.yml`.

It's available at http://localhost:3001

### Testing edge cases

In our OIDC provider project,
navigating through certain paths can be particularly challenging due to the diverse range of scenarios that may arise.

Recognizing this complexity,
we provide comprehensive datasets and associated configurations
tailored for executing specific test cases.

You can manually execute a Cypress end-to-end test
to thoroughly explore these paths by following [this doc](./cypress/README.md).

### Connecting to local databases

Docker Compose initializes both a PostgreSQL and a Redis database.

To connect to these databases, use the following commands:

```bash
docker compose exec db psql postgres://moncomptepro:moncomptepro@db:5432/moncomptepro
docker compose exec redis redis-cli -h redis -p 6379
```

### Configuring different environment variables

The default environment variables are defined in the `.env` file, which applies to all environments. Based on the `NODE_ENV` variable, the corresponding file is selected: `.env.development` for the development environment, `.env.production` for production, or `.env.test` for testing.

To customize or override these defaults, we recommend using the `.env*.local` files. The file `.env.<NODE_ENV>.local` will have higher priority over both `.env.local` and `.env.<NODE_ENV>`.

### Skipping Cypress Binary Installation for Local Setup

If you prefer not to run end-to-end tests locally and want to avoid downloading the large Cypress binary, you can prevent it during the installation process. To do this, run the following command:

```bash
CYPRESS_INSTALL_BINARY=0 npm install
```

This command ensures that the Cypress binary is not downloaded, saving time and disk space during the installation process.

### Packages

| Package                                                               | Version                                                                                                                                                        | Downloads                                                                                 | Changelog                                       |
| :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- | :---------------------------------------------- |
| [@gouvfr-lasuite/proconnect.core](./packages/core#readme)             | [![npm](https://img.shields.io/npm/v/@gouvfr-lasuite/proconnect.core.svg?logo=npm)](https://www.npmjs.com/package/@gouvfr-lasuite/proconnect.core)             | ![Downloads](https://img.shields.io/npm/dw/@gouvfr-lasuite/proconnect.core?label=↓)       | [Changelog](./packages/core/CHANGELOG.md)       |
| [@gouvfr-lasuite/proconnect.crisp](./packages/crisp#readme)           | [![npm](https://img.shields.io/npm/v/@gouvfr-lasuite/proconnect.crisp.svg?logo=npm)](https://www.npmjs.com/package/@gouvfr-lasuite/proconnect.crisp)           | ![Downloads](https://img.shields.io/npm/dw/@gouvfr-lasuite/proconnect.crisp?label=↓)      | [Changelog](./packages/crisp/CHANGELOG.md)      |
| [@gouvfr-lasuite/proconnect.debounce](./packages/debounce#readme)     | [![npm](https://img.shields.io/npm/v/@gouvfr-lasuite/proconnect.debounce.svg?logo=npm)](https://www.npmjs.com/package/@gouvfr-lasuite/proconnect.debounce)     | ![Downloads](https://img.shields.io/npm/dw/@gouvfr-lasuite/proconnect.debounce?label=↓)   | [Changelog](./packages/debounce/CHANGELOG.md)   |
| [@gouvfr-lasuite/proconnect.email](./packages/email#readme)           | [![npm](https://img.shields.io/npm/v/@gouvfr-lasuite/proconnect.email.svg?logo=npm)](https://www.npmjs.com/package/@gouvfr-lasuite/proconnect.email)           | ![Downloads](https://img.shields.io/npm/dw/@gouvfr-lasuite/proconnect.email?label=↓)      | [Changelog](./packages/email/CHANGELOG.md)      |
| [@gouvfr-lasuite/proconnect.entreprise](./packages/entreprise#readme) | [![npm](https://img.shields.io/npm/v/@gouvfr-lasuite/proconnect.entreprise.svg?logo=npm)](https://www.npmjs.com/package/@gouvfr-lasuite/proconnect.entreprise) | ![Downloads](https://img.shields.io/npm/dw/@gouvfr-lasuite/proconnect.entreprise?label=↓) | [Changelog](./packages/entreprise/CHANGELOG.md) |
| [@gouvfr-lasuite/proconnect.identite](./packages/identite#readme)     | [![npm](https://img.shields.io/npm/v/@gouvfr-lasuite/proconnect.identite.svg?logo=npm)](https://www.npmjs.com/package/@gouvfr-lasuite/proconnect.identite)     | ![Downloads](https://img.shields.io/npm/dw/@gouvfr-lasuite/proconnect.identite?label=↓)   | [Changelog](./packages/entreprise/CHANGELOG.md) |

#### Document your change in packages

We use changeset to manage our package changelog. You can read more about it [here](https://github.com/changesets/changesets).

To create a new changeset, run the following command:

```bash
npx changeset
```

You will be prompted to select the type of change you want to make.  
As this changelog is intended for French end users, we recommend you write your change in French :fr:.

Commit your changes and push them in your branch.  
We will merge a "Version Packages" PR when we are ready to release :wink:

### Adding new data

Remember to request production API credentials from a colleague.

Use the testing cli to add additional data needed for dev or tests.

```bash
$ npx tsx scripts/testing.ts --help
```

Note that the ./packages/testing/src/api/data/people.ts file contains a list of people that are used to anonymize data.
