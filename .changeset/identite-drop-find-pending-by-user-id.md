---
"@proconnect-gouv/proconnect.identite": major
---

Retire `findPendingByUserIdFactory` (`repositories/organization`) et l'entrée `organizations.findPendingByUserId` de `connectors` : la page des organisations lit maintenant la base en Drizzle depuis l'application.
