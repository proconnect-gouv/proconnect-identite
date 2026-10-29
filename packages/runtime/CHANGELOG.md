# @proconnect-gouv/proconnect.identite.runtime

## 0.3.1

### Patch Changes

- Updated dependencies [[`a31ca3e`](https://github.com/proconnect-gouv/proconnect-identite/commit/a31ca3e90bcd2b874e754159d3597a720f7a62b0)]:
  - @proconnect-gouv/proconnect.identite@13.0.0

## 0.3.0

### Minor Changes

- [#2370](https://github.com/proconnect-gouv/proconnect-identite/pull/2370) [`d3dd8ca`](https://github.com/proconnect-gouv/proconnect-identite/commit/d3dd8cada634db4d3ed9a08d3b6f0ff4000ea97c) Thanks [@douglasduteil](https://github.com/douglasduteil)! - Journalise les membres promus par une vérification de domaine. `markDomainAsVerified` ajoute, dans sa transaction, une ligne `member.promoted` par membre promu, sous l'acteur `{ type: "app", job: "domain.promote_members" }`, avec `user_id`, `organization_id` et `cause_activity_id` pointant vers la ligne `domain.verified`. `activityContextSchemas` décrit la nouvelle action : `inputs.previous_verification_type`, `outcome.verification_type`.

### Patch Changes

- Updated dependencies [[`d3dd8ca`](https://github.com/proconnect-gouv/proconnect-identite/commit/d3dd8cada634db4d3ed9a08d3b6f0ff4000ea97c)]:
  - @proconnect-gouv/proconnect.identite.database@1.12.0

## 0.2.0

### Minor Changes

- [#2369](https://github.com/proconnect-gouv/proconnect-identite/pull/2369) [`6971b21`](https://github.com/proconnect-gouv/proconnect-identite/commit/6971b2172c4aeeb7a58f121e88d9d4548fbb87b3) Thanks [@douglasduteil](https://github.com/douglasduteil)! - Journalise les vérifications de domaine. Changement non rétrocompatible : `createIdentiteRuntime({ app, db })` reçoit l'application appelante (`"hyyypertool"` ou `"proconnect-identite"`, enregistrée dans la colonne `app` de chaque ligne) et renvoie `as(actor)` (type `Actor` exporté : `{ type: "app", job }` ou `{ type: "moderator", sub }`), qui renvoie la commande `markDomainAsVerified` et `record` liées à l'acteur. La commande ajoute une ligne `domain.verified` dans `activity_logs` dans sa transaction et son issue `domain_verified` porte `activity_id`. Le `context` de chaque action est décrit par un schéma zod : le runtime exporte `activityContextSchemas` (`domain.verified`) et le type déduit `ActivityContexts`. Une application décrit ses propres actions avec `ContextsOf` et les passe en paramètre de type, `createIdentiteRuntime<ContextesDeLApplication>({ app, db })` ; `record(tx, { action, context, organization_id?, user_id?, moderation_id? })` écrit alors l'une de ces actions dans la transaction de l'appelant (type `IdentiteTransaction` exporté) et renvoie `{ activity_id }`. Ne compilent pas : une action déjà définie par le runtime, un `context` qui ne correspond pas à son action, la base `db` au lieu d'une transaction. Nouvelle dépendance : `zod`.

### Patch Changes

- Updated dependencies [[`6971b21`](https://github.com/proconnect-gouv/proconnect-identite/commit/6971b2172c4aeeb7a58f121e88d9d4548fbb87b3)]:
  - @proconnect-gouv/proconnect.identite.database@1.11.0

## 0.1.0

### Minor Changes

- [#2365](https://github.com/proconnect-gouv/proconnect-identite/pull/2365) [`e47d7dd`](https://github.com/proconnect-gouv/proconnect-identite/commit/e47d7dd69c76c7b8c8dc8094c8ec4ac574278e75) Thanks [@douglasduteil](https://github.com/douglasduteil)! - Première version : `createIdentiteRuntime({ db })` reçoit une instance Drizzle construite par l'appelant avec le schéma de `@proconnect-gouv/proconnect.identite.database` et renvoie la commande `markDomainAsVerified`. Elle vérifie un domaine avec un type approuvé dans une seule transaction (remplace les états du domaine pour l'organisation et promeut les membres concernés) et renvoie une issue `domain_verified` (ligne `email_domain` créée, `promoted_members` avec leur rattachement précédent, `replaced_verification_types` supprimés) ou `organization_not_found` (avec `organization_id`). Le type `IdentiteDatabase` est exporté.

### Patch Changes

- Updated dependencies [[`e47d7dd`](https://github.com/proconnect-gouv/proconnect-identite/commit/e47d7dd69c76c7b8c8dc8094c8ec4ac574278e75), [`e47d7dd`](https://github.com/proconnect-gouv/proconnect-identite/commit/e47d7dd69c76c7b8c8dc8094c8ec4ac574278e75), [`da31f6d`](https://github.com/proconnect-gouv/proconnect-identite/commit/da31f6d036c7569c0184962bb9bc6d14d12f04a1)]:
  - @proconnect-gouv/proconnect.identite.database@1.10.1
  - @proconnect-gouv/proconnect.identite@12.0.0
