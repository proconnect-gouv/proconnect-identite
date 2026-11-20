---
"@proconnect-gouv/proconnect.identite": major
---

Retire `findBySiretFactory` (`repositories/organization`) et l'entrée `organizations.findBySiret` de `connectors` : la garde de navigation lit maintenant la base en Drizzle depuis l'application.
