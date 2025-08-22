# @gouvfr-lasuite/proconnect.testing

Mock server and CLI tools for testing ProConnect integrations with external APIs.

## What

This package provides:

- **Mock API Server**: HTTP server that mimics external service responses
- **CLI Tools**: Commands for fetching and managing test data from real APIs
- **Test Data**: Pre-populated JSON responses for common scenarios
- **Integration Tests**: Test suite ensuring mock endpoints work correctly

## Why

- **Testing without external dependencies**: Test ProConnect integrations without hitting real APIs during development and CI
- **Deterministic test data**: Consistent mock responses for reliable and reproducible tests
- **Development environment**: Local development without needing API tokens, rate limits, or network connectivity
- **Data privacy**: Anonymized test data for non-public enterprise information
- **Performance**: Fast local responses vs. external API calls

## How

### Mock Server Usage

Create a testing handler and mount it in your application:

```typescript
import { createTestingHandler } from "@gouvfr-lasuite/proconnect.testing/api";
import { createServer } from "http";

const handler = createTestingHandler("/testing", {
  ISSUER: "oidc.franceconnect.localhost",
  log: console.log,
});

const server = createServer(handler);
server.listen(3000);
// Server running at http://localhost:3000/testing
```

The handler uses [Hono](https://hono.dev/) framework and provides:

- Structured logging with 🎭 prefix
- Error handling and 404 responses
- Health check endpoint at `/healthz`

### CLI Tools

#### Adding Enterprise Test Data

Fetch real establishment data and save it as anonymized test data:

```bash
# Set up environment variables
export ENTREPRISE_API_TOKEN="your-api-token"
export ENTREPRISE_API_URL="https://entreprise.api.gouv.fr"
export ENTREPRISE_API_TRACKING_CONTEXT="testing"
export ENTREPRISE_API_TRACKING_RECIPIENT="your-siret"

# Add establishment data
npm run cli entreprise etablissements add 49430870300052
```

This command:

1. Fetches real data from the Entreprise API
2. Anonymizes private/non-diffusible information using predefined personas
3. Saves the result as a JSON file in `src/api/routes/entreprise.api.gouv.fr/etablissements/`
4. Formats the JSON with Prettier

### Available Mock Endpoints

#### Entreprise API (`/entreprise.api.gouv.fr`)

- `GET /v3/insee/sirene/etablissements/{siret}` - Establishment details
- `GET /v3/infogreffe/rcs/unites_legales/{siren}/mandataires_sociaux` - Company officers
- `GET /etablissements/discover` - Browse all available establishments (HTML interface)
- `GET /mandataires_sociaux/discover` - Browse all available company officers (HTML interface)
- Includes 80+ pre-populated establishments and company data
- Handles both public and anonymized private data

#### INSEE API (`/api.insee.fr`)

- `GET /entreprises/sirene/V3/etablissements/{siret}` - INSEE establishment data
- Compatible with INSEE Sirene API format

#### FranceConnect OIDC (`/oidc.franceconnect.gouv.fr`)

- `GET /.well-known/openid-configuration` - OIDC discovery endpoint
- `GET /api/v2/logout` - Logout page mock
- `GET /api/v2/select` - Identity provider selection mock
- Configurable issuer for testing different environments

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run dev:test

# Build the package
npm run build
```

### Test Data Structure

Mock data is organized as:

```
src/api/routes/
├── entreprise.api.gouv.fr/
│   ├── etablissements/          # Establishment JSON files by SIRET
│   │   └── discover.page.tsx    # HTML browser for establishments
│   └── mandataires_sociaux/     # Company officers by SIREN
│       └── discover.page.tsx    # HTML browser for company officers
├── api.insee.fr/
│   └── etablissements/          # INSEE format establishment data
└── oidc.franceconnect.gouv.fr/  # OIDC mock responses
```

Each JSON file contains real API response structure with anonymized sensitive data when needed.

### Discovery Interface

The testing server provides HTML interfaces to browse available test data:

- **Establishments**: Visit `/entreprise.api.gouv.fr/etablissements/discover` to see all available establishments with formatted company names and expandable JSON data
  https://identite-showcase.proconnect.gouv.fr/___testing___/entreprise.api.gouv.fr/etablissements/discover
- **Company Officers**: Visit `/entreprise.api.gouv.fr/mandataires_sociaux/discover` to browse all available company officers data
  https://identite-showcase.proconnect.gouv.fr/___testing___/entreprise.api.gouv.fr/mandataires_sociaux/discover
