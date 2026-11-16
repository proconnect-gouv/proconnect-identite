---
"@proconnect-gouv/proconnect.identite": major
---

Retire `reopenModerationFactory` (`repositories/moderation`), exposé aussi par `connectors` (`moderations.reopen`). L'application identite rouvre maintenant une modération refusée avec sa procédure `moderation.reopened`, une fois la correction des informations personnelles enregistrée, et la ligne de journal pointe vers cette correction.
