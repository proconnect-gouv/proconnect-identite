# @proconnect-gouv/proconnect.identite.runtime

## 0.1.0

### Minor Changes

- [#2365](https://github.com/proconnect-gouv/proconnect-identite/pull/2365) [`e47d7dd`](https://github.com/proconnect-gouv/proconnect-identite/commit/e47d7dd69c76c7b8c8dc8094c8ec4ac574278e75) Thanks [@douglasduteil](https://github.com/douglasduteil)! - Première version : `createIdentiteRuntime({ db })` reçoit une instance Drizzle construite par l'appelant avec le schéma de `@proconnect-gouv/proconnect.identite.database` et renvoie la commande `markDomainAsVerified`. Elle vérifie un domaine avec un type approuvé dans une seule transaction (remplace les états du domaine pour l'organisation et promeut les membres concernés) et renvoie une issue `domain_verified` (ligne `email_domain` créée, `promoted_members` avec leur rattachement précédent, `replaced_verification_types` supprimés) ou `organization_not_found` (avec `organization_id`). Le type `IdentiteDatabase` est exporté.

### Patch Changes

- Updated dependencies [[`e47d7dd`](https://github.com/proconnect-gouv/proconnect-identite/commit/e47d7dd69c76c7b8c8dc8094c8ec4ac574278e75), [`e47d7dd`](https://github.com/proconnect-gouv/proconnect-identite/commit/e47d7dd69c76c7b8c8dc8094c8ec4ac574278e75), [`da31f6d`](https://github.com/proconnect-gouv/proconnect-identite/commit/da31f6d036c7569c0184962bb9bc6d14d12f04a1)]:
  - @proconnect-gouv/proconnect.identite.database@1.10.1
  - @proconnect-gouv/proconnect.identite@12.0.0
