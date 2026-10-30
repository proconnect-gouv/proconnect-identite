---
"@proconnect-gouv/proconnect.identite": major
---

Retire `deleteModerationFactory` (`repositories/moderation`), exposé aussi par `connectors`. L'application identite annule maintenant une demande de rattachement avec `cancelModeration` du runtime, qui garde la ligne en `cancelled` et écrit l'action `moderation.cancelled` dans la même transaction. `ModerationStatusSchema` gagne la valeur `cancelled`.
