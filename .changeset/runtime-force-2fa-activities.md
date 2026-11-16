---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Publie dans `activityContextSchemas` les schémas `user.force_2fa_enabled` et `user.force_2fa_disabled` (`reason` : l’utilisateur la désactive, supprime sa dernière clé d’accès ou son application d’authentification, ou récupère son compte), que l’application identite journalise maintenant quand la double authentification obligatoire change.
