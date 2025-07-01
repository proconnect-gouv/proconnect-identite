# 🪙 @gouvfr-lasuite/proconnect.core

> 🪙 The core of ProConnect Apps

## ⚙️ Installation

```bash
npm install @gouvfr-lasuite/proconnect.core
```

## 📖 Usage

### Security Utilities

```typescript
import { hashPassword, isPasswordSecure } from "@gouvfr-lasuite/proconnect.core/security";
```

### Email Services

```typescript
import { getEmailDomain, isAFreeDomain } from "@gouvfr-lasuite/proconnect.core/services/email";
```

### Data Access

```typescript
import { 
  mostUsedFreeEmailDomains, 
  gouvfrDomains, 
  otherGouvDomains 
} from "@gouvfr-lasuite/proconnect.core/data";
```

### OIDC Provider

[@gouvfr-lasuite/proconnect.core/service/oidc](./src/services/oidc#readme)

### Suggestion Services

```typescript
import { didYouMean } from "@gouvfr-lasuite/proconnect.core/services/suggestion";
```

## 📊 Available Exports

- **`/security`** - Password hashing, validation, token generation
- **`/services/email`** - Email domain utilities and validation
- **`/services/oidc`** - OpenID Connect provider utilities
- **`/services/suggestion`** - Text suggestion and correction
- **`/data`** - Raw data arrays (email domains, government domains)

## 📖 License

[MIT](./LICENSE.md)
