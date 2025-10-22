# 📋 @proconnect-gouv/proconnect.registre_national_entreprises

> 🏢 Registre National des Entreprises API client for ProConnect

A TypeScript client for interacting with the [Registre National des Entreprises (RNE)](https://registre-national-entreprises.inpi.fr/api) API maintained by INPI.

## ⚙️ Installation

```bash
npm install @proconnect-gouv/proconnect.registre_national_entreprises
```

## 📖 Usage

### Authentication

First, obtain an access token using your RNE credentials:

```ts
import { getRegistreNationalEntreprisesAccessTokenFactory } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";

const getAccessToken = getRegistreNationalEntreprisesAccessTokenFactory({
  username: "your-username",
  password: "your-password",
});

const token = await getAccessToken();
```

### Create a Client

Create an API client with your access token:

```ts
import { createRegistreNationalEntreprisesOpenApiClient } from "@proconnect-gouv/proconnect.registre_national_entreprises/client";

const client = createRegistreNationalEntreprisesOpenApiClient(token);
```

### Find Company by SIREN

Use the `findBySiren` factory to search for companies:

```ts
import { findBySirenFactory } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";

const findBySiren = findBySirenFactory(client);

try {
  const company = await findBySiren("123456789");
  console.log(company);
} catch (error) {
  if (error instanceof RegistreNationalEntreprisesApiError) {
    console.error("API Error:", error.message);
  }
}
```

## 🔧 API Reference

### Authentication

- **`getRegistreNationalEntreprisesAccessTokenFactory(credentials, options?)`** - Returns a function to get access tokens
  - `credentials`: Object with `username` and `password`
  - `options`: Optional client configuration

### Client Creation

- **`createRegistreNationalEntreprisesOpenApiClient(token, options?)`** - Creates an OpenAPI client for the RNE API
  - `token`: Bearer token for authentication
  - `options`: Optional client configuration (baseUrl, etc.)

### Company Lookup

- **`findBySirenFactory(client, optionsFn?)`** - Returns a function to find companies by SIREN number
  - `client`: The RNE API client
  - `optionsFn`: Optional function returning fetch options

### Error Handling

- **`RegistreNationalEntreprisesApiError`** - Base API error class
- **`RegistreNationalEntreprisesApiAuthError`** - Authentication-specific errors

### Update OpenAPI Types

> [!NOTE]
> We are manually updating the OpenAPI types from the RNE API specification.

Regenerate TypeScript types from the OpenAPI specification:

```bash
npm run build:openapi
```

## 📖 License

[MIT](./LICENSE)
