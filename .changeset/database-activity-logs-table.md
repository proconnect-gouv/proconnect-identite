---
"@proconnect-gouv/proconnect.identite.database": minor
---

Ajoute la table `activity_logs`, journal des actions (`action`, `actor_type`, `actor_ref`, `app` — l'application qui écrit la ligne —, `context` en `jsonb`, `created_at`, et `user_id`, `organization_id`, `moderation_id`, `interaction_cid` sans clé étrangère), avec les index `(organization_id, created_at)` et `(user_id, created_at)`, au schéma SQL et au schéma Drizzle.
