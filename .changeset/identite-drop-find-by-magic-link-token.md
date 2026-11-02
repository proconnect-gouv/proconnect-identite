---
"@proconnect-gouv/proconnect.identite": major
---

Retire `findByMagicLinkTokenFactory` (`repositories/user`) et l'entrée `users.findByMagicLinkToken` de `connectors` : la connexion par lien magique lit maintenant la base en Drizzle depuis l'application.
