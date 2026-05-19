# 🔐 @proconnect-gouv/proconnect.identite

> Core identity management logic for ProConnect

## ⚙️ Installation

```bash
npm install @proconnect-gouv/proconnect.identite
```

## 📖 Usage

### Managers

High-level business logic for certification, FranceConnect integration, organization, and user management.

```typescript
import { isOrganizationDirigeant } from "@proconnect-gouv/proconnect.identite/managers/certification";
import { getOrganizationInfo } from "@proconnect-gouv/proconnect.identite/managers/organization";
import { assignUserVerificationTypeToDomain } from "@proconnect-gouv/proconnect.identite/managers/user";
```

### Repositories

Data access layer for email domains, organizations, and users.

```typescript
import {
  findByEmail,
  findById,
  getByIdFactory,
} from "@proconnect-gouv/proconnect.identite/repositories/user";
import {
  findByUserId,
  linkUserToOrganization,
} from "@proconnect-gouv/proconnect.identite/repositories/organization";
import { addDomain } from "@proconnect-gouv/proconnect.identite/repositories/email-domain";
```

### Services

Stateless business logic for organization validation and PostgreSQL utilities.

```typescript
import {
  isEntrepriseUnipersonnelle,
  computeIsServicePublic,
} from "@proconnect-gouv/proconnect.identite/services/organization";
import { hashToPostgresParams } from "@proconnect-gouv/proconnect.identite/services/postgres";
```

### Mappers

Data transformation utilities for certification and organization data.

```typescript
import { fromSiret } from "@proconnect-gouv/proconnect.identite/mappers/organization";
```

### Types

TypeScript type definitions for users, organizations, claims, and more.

```typescript
import type {
  User,
  Organization,
  UserOrganizationLink,
  EmailDomain,
  FranceConnectUserInfo,
} from "@proconnect-gouv/proconnect.identite/types";
```

### Data

Raw data arrays for organization domain whitelists.

```typescript
import { domainsWhitelist } from "@proconnect-gouv/proconnect.identite/data/organization";
```

### Errors

Custom error types for identity management operations.

```typescript
import {
  InvalidCertificationError,
  InvalidSiretError,
  NotFoundError,
  OrganizationNotFoundError,
  UserNotFoundError,
} from "@proconnect-gouv/proconnect.identite/errors";
```

## 📊 Available Exports

- **`/managers/certification`** - Organization certification and dirigeant validation
- **`/managers/franceconnect`** - FranceConnect OIDC client integration
- **`/managers/organization`** - Organization business logic
- **`/managers/user`** - User business logic
- **`/repositories/email-domain`** - Email domain data access
- **`/repositories/organization`** - Organization data access
- **`/repositories/user`** - User data access
- **`/services/organization`** - Organization validation utilities
- **`/services/postgres`** - PostgreSQL query utilities
- **`/mappers/certification`** - Certification data transformation
- **`/mappers/organization`** - Organization data transformation
- **`/types`** - TypeScript type definitions
- **`/data/organization`** - Organization reference data
- **`/errors`** - Custom error types

## 📖 License

[MIT](./LICENSE)
