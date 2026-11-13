---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Remplace la commande `disconnectFranceConnect` par la procédure `franceconnect.disconnected` : `runtime.as(acteur).franceconnect.disconnected.mutate({ user_id })` supprime l’identité FranceConnect et écrit la même ligne `franceconnect.disconnected` qu’avant ; `disconnectFranceConnect` quitte `as(acteur)`.
