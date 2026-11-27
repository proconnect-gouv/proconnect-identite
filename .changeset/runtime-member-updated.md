---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Remplace la commande `updateMembership` par la procédure `member.updated` : `runtime.as(acteur).member.updated.mutate({ organization_id, user_id, … })` modifie le rattachement et écrit la même ligne `member.updated` qu’avant ; `updateMembership` quitte `as(acteur)`.
