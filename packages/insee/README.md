# 📦 @gouvfr-lasuite/proconnect.insee

> ⚡ Typed api.insee.fr API for ProConnect

## ⚙️ Installation

```bash
npm install @gouvfr-lasuite/proconnect.insee
```

## 📖 Usage

### `@gouvfr-lasuite/proconnect.insee/client"

Get full fetch client from `@gouvfr-lasuite/proconnect.insee/client`

```ts
import { createInseeOpenApiClient } from "@gouvfr-lasuite/proconnect.insee/client";

const inseeSirenePrivateOpenApiClient = createInseeSirenePrivateOpenApiClient(
  "__INSEE_API_TOKEN__",
  { baseUrl: "https://api.insee.fr" },
);
```

### `@gouvfr-lasuite/proconnect.insee/api"

Get use case api factory functions from `@gouvfr-lasuite/proconnect.insee/api`

```ts
import { findBySiretFactory } from "@gouvfr-lasuite/proconnect.insee/api/insee";

export const findBySiret = findBySiretFactory(inseeOpenApiClient);
const establishment: InseeSiretEstablishment = await findBySiret("662042449");
```

### `@gouvfr-lasuite/proconnect.insee/types"

Get API Entreprise types and errors from `@gouvfr-lasuite/proconnect.insee/types`

```ts
import type { InseeSiretEstablishment } from "@gouvfr-lasuite/proconnect.insee/types";

const establishment: InseeSiretEstablishment;
```

### `@gouvfr-lasuite/proconnect.insee/formatters"

Get models formatters from `@gouvfr-lasuite/proconnect.insee/formatters`

```ts
import { formatBirthdate } from "@gouvfr-lasuite/proconnect.insee/formatters";

const birthdate: Date = formatBirthdate("19800601");
```

### `@gouvfr-lasuite/proconnect.insee/testing"

Used for internal tests

## 📖 License

[MIT](./LICENSE.md)
