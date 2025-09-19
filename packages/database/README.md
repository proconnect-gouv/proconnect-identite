# 📦 @gouvfr-lasuite/proconnect.identite.database

> 🗄️ Database schema package for ProConnect Identité

## ⚙️ Installation

```bash
npm install @gouvfr-lasuite/proconnect.identite.database
```

## 📖 Usage

### Database Migration

Apply the ProConnect Identité database schema to your PostgreSQL or PGlite instance:

```ts
import { migrate } from "@gouvfr-lasuite/proconnect.identite.database";
import { Client } from "pg";

// With pg Client
const client = new Client({
  host: "localhost",
  port: 5432,
  database: "proconnect",
  user: "user",
  password: "password",
});

await client.connect();
await migrate(client);
await client.end();
```

```ts
import { migrate } from "@gouvfr-lasuite/proconnect.identite.database";
import { PGlite } from "@electric-sql/pglite";

// With PGlite (in-memory or file-based)
const db = new PGlite();
await migrate(db);
```

## 🏗️ Schema Generation

The database schema is automatically generated from the main application's migrations using `node-pg-migrate`.

To rebuild the schema:

```bash
npm run build
```

This will:
1. Run all migrations from the root project against a PGlite instance
2. Export the resulting schema using `pg_dump`
3. Save it to `schema.sql`

## 🧪 Testing

The package includes utilities for setting up test databases with the complete schema.

## 📖 License

[MIT](./LICENSE.md)
