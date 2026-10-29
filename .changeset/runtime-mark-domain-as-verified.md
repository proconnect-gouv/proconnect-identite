---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Première version : `createIdentiteRuntime({ db })` reçoit une instance Drizzle construite par l'appelant avec le schéma de `@proconnect-gouv/proconnect.identite.database` et renvoie la commande `markDomainAsVerified`. Elle vérifie un domaine avec un type approuvé dans une seule transaction (remplace les états du domaine pour l'organisation et promeut les membres concernés) et renvoie une issue `domain_verified` (ligne `email_domain` créée, `promoted_members` avec leur rattachement précédent, `replaced_verification_types` supprimés) ou `organization_not_found` (avec `organization_id`). Le type `IdentiteDatabase` est exporté.
