# 📦 @proconnect-gouv/proconnect.api_entreprise

> ⚡ Typed entreprise.api.gouv.fr API for ProConnect

## ⚙️ Installation

```bash
npm install @proconnect-gouv/proconnect.api_entreprise
```

## 📖 Usage

### `@proconnect-gouv/proconnect.api_entreprise/client"

Get full fetch client from `@proconnect-gouv/proconnect.api_entreprise/client`

```ts
import { createApiEntrepriseOpenApiClient } from "@proconnect-gouv/proconnect.api_entreprise/client";

const apiEntrepriseOpenApiClient = createApiEntrepriseOpenApiClient(
  "ENTREPRISE_API_TOKEN",
  { baseUrl: "https://staging.entreprise.api.gouv.fr" },
);
```

### `@proconnect-gouv/proconnect.api_entreprise/api"

Get use case api factory functions from `@proconnect-gouv/proconnect.api_entreprise/api`

```ts
import { findBySiretFactory } from "@proconnect-gouv/proconnect.api_entreprise/api/insee";

export const findBySiret = findBySiretFactory(apiEntrepriseOpenApiClient, {
  context: "ProConnect",
  object: "findEstablishmentBySiret",
  recipient: "13002526500013",
});
```

### `@proconnect-gouv/proconnect.api_entreprise/types"

Get API Entreprise types and errors from `@proconnect-gouv/proconnect.api_entreprise/types`

```ts
import type { InseeSiretEstablishment } from "@proconnect-gouv/proconnect.api_entreprise/types";

const establishment: InseeSiretEstablishment;
```

### `@proconnect-gouv/proconnect.api_entreprise/formatters"

Get models formatters from `@proconnect-gouv/proconnect.api_entreprise/formatters`

```ts
import { formatMainActivity } from "@proconnect-gouv/proconnect.api_entreprise/formatters";

const libelleActivitePrincipale: formatMainActivity(activite_principale),
```

### `@proconnect-gouv/proconnect.api_entreprise/testing"

Used for internal tests

## 📖 License

[MIT](./LICENSE.md)
