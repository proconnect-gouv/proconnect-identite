## Migrations

Migrations are managed using [node-pg-migrate](https://www.npmjs.com/package/node-pg-migrate).

To create a migration, run:

```bash
npm run migrate create "add names to user"
```

To apply the migration, run:

```bash
npm run migrate up
```

More information is available at:
[https://github.com/salsita/node-pg-migrate](https://github.com/salsita/node-pg-migrate)

Next, update the `proconnect.identite.database` package so **Hyyypertool** can import it.

First, update `schema.sql` and the Drizzle schema. Go to `packages/database/` and run:

```bash
npm run build
npm run build:schema
```

Finally, publish a changeset for the database package:

```bash
npx changeset
```

More details about changesets can be found here:
[/README.md#document-your-change-in-packages](/README.md#document-your-change-in-packages)

Keep in mind that schema updates can impact published data. Check the publication script before pushing the migration:
`scripts/create-anonymized-copy-of-database.sh`
