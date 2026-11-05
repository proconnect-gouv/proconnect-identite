---
"@proconnect-gouv/proconnect.identite": major
---

Retire `findPendingModerationFactory` (`repositories/moderation`) et l'entrée `moderations.findPending` de `connectors` : la décision d'adhésion lit maintenant la base en Drizzle depuis l'application.
