---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Ajoute la commande `openModeration` : elle crée, dans une seule transaction, une modération en attente (`pending`) et journalise l'action `moderation.opened` sous l'acteur reçu, avec le `type` de modération et le `sp_name` dans `inputs`, et les colonnes `moderation_id`, `organization_id` et `user_id` renseignées. Elle renvoie l'issue `moderation_opened` (avec `activity_id` et l'`id` de la modération).
