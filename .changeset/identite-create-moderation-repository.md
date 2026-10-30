---
"@proconnect-gouv/proconnect.identite": major
---

Retire `createModerationFactory` (`repositories/moderation`), exposé aussi par `connectors`. L'application identite ouvre maintenant une modération avec `openModeration` du runtime, qui crée la modération et écrit la ligne `moderation.opened` dans la même transaction.
