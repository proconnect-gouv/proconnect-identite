# 📦 @proconnect-gouv/proconnect.entreprise

> ⚡ Typed entreprise.api.gouv.fr API for ProConnect

## ⚙️ Installation

```bash
npm install @proconnect-gouv/proconnect.entreprise
```

## 📖 Usage

### `@proconnect-gouv/proconnect.entreprise/client"

Get full fetch client from `@proconnect-gouv/proconnect.entreprise/client`

```ts
import { createEntrepriseOpenApiClient } from "@proconnect-gouv/proconnect.entreprise/client";

const entrepriseOpenApiClient = createEntrepriseOpenApiClient(
  "ENTREPRISE_API_TOKEN",
  { baseUrl: "https://staging.entreprise.api.gouv.fr" },
);
```

### `@proconnect-gouv/proconnect.entreprise/api"

Get use case api factory functions from `@proconnect-gouv/proconnect.entreprise/api`

```ts
import { findBySiretFactory } from "@proconnect-gouv/proconnect.entreprise/api/insee";

export const findBySiret = findBySiretFactory(entrepriseOpenApiClient, {
  context: "ProConnect",
  object: "findEstablishmentBySiret",
  recipient: "13002526500013",
});
```

### `@proconnect-gouv/proconnect.entreprise/types"

Get API Entreprise types and errors from `@proconnect-gouv/proconnect.entreprise/types`

```ts
import type { InseeSiretEstablishment } from "@proconnect-gouv/proconnect.entreprise/types";

const establishment: InseeSiretEstablishment;
```

### `@proconnect-gouv/proconnect.entreprise/formatters"

Get models formatters from `@proconnect-gouv/proconnect.entreprise/formatters`

```ts
import { formatMainActivity } from "@proconnect-gouv/proconnect.entreprise/formatters";

const libelleActivitePrincipale: formatMainActivity(activite_principale),
```

### `@proconnect-gouv/proconnect.entreprise/testing"

Used for internal tests

## 📖 License

[MIT](./LICENSE.md)
