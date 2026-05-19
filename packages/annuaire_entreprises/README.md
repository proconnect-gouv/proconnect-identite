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
  ADMINISTRATION_BLACKLIST,
  ADMINISTRATION_WHITELIST,
} from "@proconnect-gouv/proconnect.annuaire_entreprises";

// Check if a SIREN is explicitly blacklisted (never a public service)
const isBlacklisted = ADMINISTRATION_BLACKLIST.includes("123456789");

// Check if a SIREN is whitelisted (always an administration)
const isWhitelisted = ADMINISTRATION_WHITELIST.includes("987654321");
```

## 📊 Available Data

- **`ADMINISTRATION_BLACKLIST`** - SIREN numbers explicitly excluded from administrations
- **`ADMINISTRATION_WHITELIST`** - SIREN numbers explicitly included as administrations

## 🔄 Data Updates

Data is synced from the [Annuaire des Entreprises search infrastructure](https://github.com/annuaire-entreprises-data-gouv-fr/search-infra) using:

```bash
npm run build:data
```

## 📖 License

[MIT](./LICENSE.md)
