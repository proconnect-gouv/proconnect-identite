---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Remplace la commande `removeMembership` par la procédure `member.removed` : `runtime.as(acteur).member.removed.mutate({ organization_id, user_id })` supprime le rattachement et écrit la même ligne `member.removed` qu’avant ; `removeMembership` quitte `as(acteur)`.
