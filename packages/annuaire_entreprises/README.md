# 📋 @proconnect-gouv/proconnect.annuaire_entreprises

> 📊 Annuaire des Entreprises data for ProConnect

## ⚙️ Installation

```bash
npm install @proconnect-gouv/proconnect.annuaire_entreprises
```

## 📖 Usage

### Public Service Classification Data

Get public service classification constants from `@proconnect-gouv/proconnect.annuaire_entreprises`

```ts
import {
  NATURE_JURIDIQUE_SERVICE_PUBLIC,
  SERVICE_PUBLIC_BLACKLIST,
  SERVICE_PUBLIC_WHITELIST,
} from "@proconnect-gouv/proconnect.annuaire_entreprises";

// Check if a legal nature code corresponds to a public service
const isPublicServiceNature = NATURE_JURIDIQUE_SERVICE_PUBLIC.includes("7160");

// Check if a SIREN is explicitly blacklisted (never a public service)
const isBlacklisted = SERVICE_PUBLIC_BLACKLIST.includes("123456789");

// Check if a SIREN is whitelisted (always a public service)
const isWhitelisted = SERVICE_PUBLIC_WHITELIST.includes("987654321");
```

## 📊 Available Data

- **`NATURE_JURIDIQUE_SERVICE_PUBLIC`** - Legal nature codes for public services from [Annuaire des Entreprises](https://github.com/annuaire-entreprises-data-gouv-fr/search-infra)
- **`SERVICE_PUBLIC_BLACKLIST`** - SIREN numbers explicitly excluded from public service classification
- **`SERVICE_PUBLIC_WHITELIST`** - SIREN numbers explicitly included as public services

## 🔄 Data Updates

Data is synced from the [Annuaire des Entreprises search infrastructure](https://github.com/annuaire-entreprises-data-gouv-fr/search-infra) using:

```bash
npm run build:data
```

## 📖 License

[MIT](./LICENSE.md)
