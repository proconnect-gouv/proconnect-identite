---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Publie le schéma `moderation.reopened` dans `activityContextSchemas`, avec la cause de la réouverture et le statut qu'avait la modération.

Le journal d'une procédure accepte un `cause_activity_id` optionnel, écrit tel quel dans la ligne : une action peut ainsi pointer vers l'activité qui l'a provoquée.
