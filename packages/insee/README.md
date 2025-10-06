# 📦 @proconnect-gouv/proconnect.insee

> ⚡ Typed api.insee.fr API for ProConnect

## ⚙️ Installation

```bash
npm install @proconnect-gouv/proconnect.insee
```

## 📖 Usage

### `@proconnect-gouv/proconnect.insee/client"

Get full fetch client from `@proconnect-gouv/proconnect.insee/client`

```ts
import { createInseeOpenApiClient } from "@proconnect-gouv/proconnect.insee/client";

const inseeSirenePrivateOpenApiClient = createInseeSirenePrivateOpenApiClient(
  "__INSEE_API_TOKEN__",
  { baseUrl: "https://api.insee.fr" },
);
```

### `@proconnect-gouv/proconnect.insee/api"

Get use case api factory functions from `@proconnect-gouv/proconnect.insee/api`

```ts
import { findBySiretFactory } from "@proconnect-gouv/proconnect.insee/api/insee";

export const findBySiret = findBySiretFactory(inseeOpenApiClient);
const establishment: InseeSiretEstablishment = await findBySiret("662042449");
```

### `@proconnect-gouv/proconnect.insee/types"

Get API Entreprise types and errors from `@proconnect-gouv/proconnect.insee/types`

```ts
import type { InseeSiretEstablishment } from "@proconnect-gouv/proconnect.insee/types";

const establishment: InseeSiretEstablishment;
```

### `@proconnect-gouv/proconnect.insee/formatters"

Get models formatters from `@proconnect-gouv/proconnect.insee/formatters`

```ts
import { formatBirthdate } from "@proconnect-gouv/proconnect.insee/formatters";

const birthdate: Date = formatBirthdate("19800601");
```

### `@proconnect-gouv/proconnect.insee/testing"

Used for internal tests

## 📖 License

[MIT](./LICENSE.md)
