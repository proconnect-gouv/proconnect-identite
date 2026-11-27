---
"@proconnect-gouv/proconnect.identite": major
---

Retire `deleteModerationFactory` (`repositories/moderation`), exposé aussi par `connectors` (`moderations.delete`). L'application identite supprime maintenant une modération annulée avec sa procédure `moderation.cancelled`, qui journalise l'annulation.
