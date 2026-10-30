---
"@proconnect-gouv/proconnect.identite": major
---

Retire `findByVerifiedEmailDomainFactory` (`repositories/organization`) et l'entrée `organizations.findByVerifiedEmailDomain` de `connectors` : les suggestions d'organisation lisent maintenant la base en Drizzle depuis l'application.
