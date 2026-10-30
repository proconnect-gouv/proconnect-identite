# @proconnect-gouv/proconnect.identite.runtime

## 0.4.0

### Minor Changes

- [#2387](https://github.com/proconnect-gouv/proconnect-identite/pull/2387) [`e4b4789`](https://github.com/proconnect-gouv/proconnect-identite/commit/e4b4789b5eb0ad01d9b4ce216fe81cce40a2c70b) Thanks [@douglasduteil](https://github.com/douglasduteil)! - Ajoute la commande `addMembership` : elle crée, dans une seule transaction, le rattachement d'un utilisateur à une organisation et journalise l'action `member.joined` sous l'acteur reçu, avec le `verification_type` et l'`is_external` dans `inputs`. Elle renvoie l'issue `member_joined` (avec `activity_id` et le rattachement) ou `member_already_exists` (avec `organization_id` et `user_id`, sans rien écrire ni modifier le rattachement existant).

- [#2389](https://github.com/proconnect-gouv/proconnect-identite/pull/2389) [`cc30f4f`](https://github.com/proconnect-gouv/proconnect-identite/commit/cc30f4f98277b7833b7ca5949f5617916be3b2e2) Thanks [@douglasduteil](https://github.com/douglasduteil)! - Ajoute la commande `deleteUser` : elle supprime, dans une seule transaction, le compte d'un utilisateur et journalise l'action `user.deleted` sous l'acteur reçu, avec dans `inputs` l'entrée de la commande (`user_id`) et dans `outcome` son résultat : l'email, le prénom et le nom du compte supprimé ainsi que ses rattachements (`organization_id`, `is_external`, `verification_type`) supprimés avec lui. La ligne reste lisible après la suppression : `activity_logs` n'a pas de clé étrangère vers `users`. Elle renvoie l'issue `user_deleted` (avec `previous` et `activity_id`) ou `user_not_found` (avec `user_id`, sans rien écrire).

- [#2386](https://github.com/proconnect-gouv/proconnect-identite/pull/2386) [`0791585`](https://github.com/proconnect-gouv/proconnect-identite/commit/0791585ecd627035cb1a633dbc20956a08f58ad7) Thanks [@douglasduteil](https://github.com/douglasduteil)! - Ajoute les commandes `connectFranceConnect` et `disconnectFranceConnect` : elles lient ou délie, dans une seule transaction, l'identité FranceConnect d'un utilisateur et journalisent `franceconnect.connected` ou `franceconnect.disconnected` sous l'acteur reçu, avec `inputs` vide et, dans `outcome`, la date de création du rattachement FranceConnect. `connectFranceConnect` recopie aussi les noms FranceConnect sur l'utilisateur ; elle renvoie l'issue `franceconnect_connected` (avec `activity_id`, `connected_at` et les noms posés) ou `user_not_found`. `disconnectFranceConnect` renvoie `franceconnect_disconnected` (avec `activity_id` et `connected_at`) ou `franceconnect_identity_not_found`, sans rien écrire.

- [#2390](https://github.com/proconnect-gouv/proconnect-identite/pull/2390) [`03426c3`](https://github.com/proconnect-gouv/proconnect-identite/commit/03426c325f3439e0ee9587a2088d51e62589fe04) Thanks [@douglasduteil](https://github.com/douglasduteil)! - Ajoute la commande `openModeration` : elle crée, dans une seule transaction, une modération en attente (`pending`) et journalise l'action `moderation.opened` sous l'acteur reçu, avec le `type` de modération et le `sp_name` dans `inputs`, et les colonnes `moderation_id`, `organization_id` et `user_id` renseignées. Elle renvoie l'issue `moderation_opened` (avec `activity_id` et l'`id` de la modération).

- [#2384](https://github.com/proconnect-gouv/proconnect-identite/pull/2384) [`27b202a`](https://github.com/proconnect-gouv/proconnect-identite/commit/27b202a9a33f7143c9e62e4831e24341ce320749) Thanks [@douglasduteil](https://github.com/douglasduteil)! - Ajoute la commande `removeMembership` : elle supprime, dans une seule transaction, le rattachement d'un utilisateur à une organisation et journalise l'action `member.removed` sous l'acteur reçu, avec `inputs` vide et, dans `outcome`, le `is_external` et le `verification_type` du rattachement supprimé. Elle renvoie l'issue `member_removed` (avec `previous` et `activity_id`) ou `membership_not_found` (avec `organization_id` et `user_id`, sans rien écrire). Le type `Actor` accepte `{ type: "user", user_id }`, journalisé avec `actor_type` `user` et `actor_ref` égal à l'identifiant.

- [#2392](https://github.com/proconnect-gouv/proconnect-identite/pull/2392) [`3c541dd`](https://github.com/proconnect-gouv/proconnect-identite/commit/3c541dd8fe07ef45e11339c3d07e796c9e2b9f41) Thanks [@douglasduteil](https://github.com/douglasduteil)! - Ajoute la commande `resetMfa` : elle réinitialise, dans une seule transaction, l'accès d'un utilisateur — suppression de ses clés d'accès (`authenticators`), clé TOTP effacée, mot de passe effacé, email marqué non vérifié, `force_2fa` désactivé — et journalise l'action `user.mfa_reset` sous l'acteur reçu, avec dans `inputs` l'identifiant de l'utilisateur et dans `outcome.previous` l'état d'avant (nombre de clés d'accès, email vérifié, mot de passe configuré, clé TOTP configurée, `force_2fa`). Elle renvoie l'issue `mfa_reset` (avec `previous` et `activity_id`) ou `user_not_found` (avec `user_id`, sans rien écrire).

- [#2391](https://github.com/proconnect-gouv/proconnect-identite/pull/2391) [`c8d53f1`](https://github.com/proconnect-gouv/proconnect-identite/commit/c8d53f17eeb1b0caff4b5e9031f7cee2b31dec1b) Thanks [@douglasduteil](https://github.com/douglasduteil)! - Ajoute la commande `updateMembership` : elle modifie, dans une seule transaction, le `is_external` et/ou le `verification_type` du rattachement d'un utilisateur à une organisation et journalise l'action `member.updated` sous l'acteur reçu, avec dans `inputs` les champs demandés et dans `outcome.previous` le `is_external` et le `verification_type` d'avant. Un nouveau `verification_type` remet `verified_at` à maintenant, ou à `null` pour `domain_not_verified_yet` ; `renew_verification: true` le remet à maintenant même quand le `verification_type` ne change pas (renouvellement d'une certification). Elle renvoie l'issue `member_updated` (avec `previous` et `activity_id`), `membership_unchanged` si rien ne change, ou `membership_not_found` (avec `organization_id` et `user_id`) ; ces deux dernières n'écrivent rien.

### Patch Changes

- Updated dependencies [[`e4b4789`](https://github.com/proconnect-gouv/proconnect-identite/commit/e4b4789b5eb0ad01d9b4ce216fe81cce40a2c70b), [`03426c3`](https://github.com/proconnect-gouv/proconnect-identite/commit/03426c325f3439e0ee9587a2088d51e62589fe04), [`cc30f4f`](https://github.com/proconnect-gouv/proconnect-identite/commit/cc30f4f98277b7833b7ca5949f5617916be3b2e2), [`0791585`](https://github.com/proconnect-gouv/proconnect-identite/commit/0791585ecd627035cb1a633dbc20956a08f58ad7), [`27b202a`](https://github.com/proconnect-gouv/proconnect-identite/commit/27b202a9a33f7143c9e62e4831e24341ce320749), [`c8d53f1`](https://github.com/proconnect-gouv/proconnect-identite/commit/c8d53f17eeb1b0caff4b5e9031f7cee2b31dec1b)]:
  - @proconnect-gouv/proconnect.identite@14.0.0

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
