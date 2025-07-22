# Run cypress locally

## Usage

### `docker compose up --wait`

Starts all the required services and waits for them to be ready.

### `npm run e2e:dev <my_cypress_test_case>`

> [!TIP]  
> Running the script without argument (or with a wrong argument) will trigger a prompt to select the test case.
>
> ```bash
> $ npm run e2e:dev
> Could not resolve test case "undefined"
> They are 26 test cases in the cypress/e2e folder :
> 0) activate_totp        1) check_email_deliverability
> [...]
> ```
>
> This will allow you to quickly pick the test case you want to run.

This will open a server on `http://localhost:3000`

### `npm run e2e:studio`

> Alias for `npx cypress open`

Will load the Cypress configuration from `cypress.config.ts`.
Here we recommend to choose the `<my_cypress_test_case>` you launched to testing coerce.

## Additional commands

### `npm run e2e:run <my_cypress_test_case>`

On your host, run the tests

```bash
npm run e2e:run <my_cypress_test_case>
```

### `npm run e2e:setup <my_cypress_test_case>`

> [!CAUTION]  
> That this will delete your database.

Load the specific fixtures in the database using

```bash
ENABLE_DATABASE_DELETION=True npm run e2e:setup redirect_after_session_expiration
```

#### `--dev` mode (same as `npm run e2e:dev`)

If you want to run the app in development mode, you can use the `--dev` flag.

```bash
NODE_ENV=development ENABLE_DATABASE_DELETION=True npm run e2e:setup --dev redirect_after_session_expiration
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

## Testing manually webauthn authent"

### Registration from dashboard pages

#### npm run fixtures:load

Given these data are loaded
When I visit the page localhost:3000/users/start-sign-in
And I authenticate with user@yopmail.com
And I enter the password user@yopmail.com
When I go to the page localhost:3000/connection-and-account
When I click on « Configurer la double authentification »
And I select « Clé d'accès (passkey) »
And I click on « Continuer »
When I create a new passkey
Then I am redirected to localhost:3000/connection-and-account?notification=passkey_successfully_created
And I see the notification « Tout est en ordre ! Vous pouvez désormais utiliser votre empreinte, votre visage ou le verrouillage de l'écran pour vous connecter sur cet appareil. »

### Authentication with previously set passkey (2fa should be forced)

Given the existing user data from the last scenario
When I visit the page localhost:3000/users/start-sign-in
And I authenticate with user@yopmail.com
And I enter the password user@yopmail.com
Then I am redirected to localhost:3000/users/2fa-sign-in
And I see the title « Valider avec la double authentification »
When I click on « Se connecter avec une clé d'accès »
And I authenticate with a passkey
Then I am redirected to the page localhost:3000

### Registration from 2FA force enrollment

#### ENABLE_DATABASE_DELETION=True npm run e2e:setup signin_with_totp_enrollment

Given these data are loaded
When I visit the page localhost:4000
And I click on « Forcer une connexion à deux facteurs »
Then I am redirected to localhost:3000/users/start-sign-in
When I authenticate with ial2-aal1@yopmail.com
And I enter the password password123
Then I am redirected to localhost:3000/users/double-authentication-choice
When I select « Clé d'accès (passkey) »
And I click on « Continuer »
When I create a new passkey
Then I am redirected to localhost:3000/users/2fa-successfully-configured
When I click on « Continuer »
Then I am redirected to localhost:4000 (the service provider)

### Authentication with previously set passkey (2fa should not be forced unless on /connection-and-account)

Given the existing user data from the last scenario
When I visit the page localhost:4000
And I click on the ProConnect login button
Then I am redirected to localhost:3000/users/start-sign-in
When I authenticate with ial2-aal1@yopmail.com
And I enter the password password123
Then I am redirected to localhost:4000 (the service provider)
When I visit the dashboard on localhost:3000
And I click on « Compte et connexion »
Then I am redirected to localhost:3000/users/2fa-sign-in?notification=2fa_required
And I must authenticate with a passkey
