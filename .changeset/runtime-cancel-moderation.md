---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Ajoute la commande `cancelModeration` : elle annule, dans une seule transaction, une demande de rattachement encore en attente en gardant sa ligne (`status` passe à `cancelled`, `moderated_at` à maintenant) et journalise l'action `moderation.cancelled` sous l'acteur reçu, avec dans `inputs` l'identifiant de la modération et dans `outcome.previous` son statut d'avant. Elle renvoie l'issue `moderation_cancelled` (avec `previous` et `activity_id`), `moderation_not_pending` (déjà traitée, sans rien écrire) ou `moderation_not_found` (sans rien écrire).
