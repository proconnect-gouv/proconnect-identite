# 📦 @gouvfr-lasuite/proconnect.entreprise

> ⚡ Typed entreprise.api.gouv.fr API for ProConnect

## ⚙️ Installation

```bash
npm install @gouvfr-lasuite/proconnect.entreprise
```

## 📖 Usage

### `@gouvfr-lasuite/proconnect.entreprise/client"

Get full fetch client from `@gouvfr-lasuite/proconnect.entreprise/client`

```ts
import { createEntrepriseOpenApiClient } from "@gouvfr-lasuite/proconnect.entreprise/client";

const entrepriseOpenApiClient = createEntrepriseOpenApiClient(
  "ENTREPRISE_API_TOKEN",
  { baseUrl: "https://staging.entreprise.api.gouv.fr" },
);
```

### `@gouvfr-lasuite/proconnect.entreprise/api"

Get use case api factory functions from `@gouvfr-lasuite/proconnect.entreprise/api`

```ts
import { findBySiretFactory } from "@gouvfr-lasuite/proconnect.entreprise/api/insee";

export const findBySiret = findBySiretFactory(entrepriseOpenApiClient, {
  context: "ProConnect",
  object: "findEstablishmentBySiret",
  recipient: "13002526500013",
});
```

### `@gouvfr-lasuite/proconnect.entreprise/types"

Get API Entreprise types and errors from `@gouvfr-lasuite/proconnect.entreprise/types`

```ts
import type { InseeSiretEstablishment } from "@gouvfr-lasuite/proconnect.entreprise/types";

const establishment: InseeSiretEstablishment;
```

### `@gouvfr-lasuite/proconnect.entreprise/formatters"

Get models formatters from `@gouvfr-lasuite/proconnect.entreprise/formatters`

```ts
import { formatMainActivity } from "@gouvfr-lasuite/proconnect.entreprise/formatters";

const libelleActivitePrincipale: formatMainActivity(activite_principale),
```

### `@gouvfr-lasuite/proconnect.entreprise/testing"

Used for internal tests

## 📖 License

[MIT](./LICENSE.md)
