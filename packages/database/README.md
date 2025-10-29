# 📦 @proconnect-gouv/proconnect.identite.database

> 🗄️ Database schema package for ProConnect Identité

## ⚙️ Installation

```bash
npm install @proconnect-gouv/proconnect.identite.database drizzle-orm
```

## 📖 Usage

### Database Migration

Apply the ProConnect Identité database schema to your PostgreSQL or PGlite instance using the provided `migrate` function:

```ts
import { migrate } from "@proconnect-gouv/proconnect.identite.database";
import { Client } from "pg";

// With PostgreSQL client
const client = new Client({
  host: "localhost",
  port: 5432,
  database: "proconnect",
  user: "user",
  password: "password",
});

await client.connect();
await migrate((query) => client.query(query));
await client.end();
```

```ts
import { migrate } from "@proconnect-gouv/proconnect.identite.database";
import { PGlite } from "@electric-sql/pglite";

// With PGlite (in-memory or file-based)
const db = new PGlite();
await migrate((query) => db.exec(query));
```

### API Reference

#### `migrate(execFn)`

Applies the database schema by executing the SQL commands from `schema.sql`.

> [!WARNING]
> The migration script contains `DROP TABLE` statements and will remove existing tables and data. Only run this on empty databases or when you intend to reset the schema completely.

**Parameters:**

- `execFn: (query: string) => Promise<unknown[]>` - Function that executes SQL queries

**Returns:** `Promise<unknown[]>` - Result of executing the schema

## 🏗️ Development

### Building

```bash
npm run build
```

Compiles TypeScript source files to JavaScript in the `dist/` directory.

### Schema Generation

```bash
npm run build:schema
```

Generates the database schema from the main application's migrations. This script:

1. Runs all migrations from the root project against a PGlite instance
2. Exports the resulting schema using `pg_dump`
3. Saves it to `schema.sql`

### Testing

```bash
npm test
```

Runs unit tests using Node.js test runner. The test suite validates:

- **In-memory PostgreSQL migration**: Bootstraps schema from scratch on clean PGlite database
- **External PostgreSQL migration**: Applies complete schema to fresh database instance (requires `DATABASE_URL`)

### Development Mode

```bash
npm run dev
```

Watches for changes and rebuilds automatically.

For update db snapshots :

```bash
DATABASE_URL=postgres://proconnect-identite:proconnect-identite@127.0.0.1:5432/proconnect-identite npm run test:unit --workspace=@proconnect-gouv/proconnect.identite.database -- --test-update-snapshots
```

## 🔄 Schema Updates

The `schema.sql` file contains the complete database schema for ProConnect Identité. This schema is generated from the main application's migrations and should not be edited manually.

## 📖 License

[MIT](./LICENSE)
