---
"@proconnect-gouv/proconnect.identite": major
---

Retire `findRejectedModerationFactory` (`repositories/moderation`) et l'entrée `moderations.findRejected` de `connectors` : la décision d'adhésion lit maintenant la base en Drizzle depuis l'application.
