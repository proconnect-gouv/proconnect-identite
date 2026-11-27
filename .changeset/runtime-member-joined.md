---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Remplace la commande `addMembership` par la procédure `member.joined` : `runtime.as(acteur).member.joined.mutate({ is_external, organization_id, user_id, verification_type })` crée le rattachement et écrit la même ligne `member.joined` qu’avant ; `is_external` devient obligatoire et `addMembership` quitte `as(acteur)`.
