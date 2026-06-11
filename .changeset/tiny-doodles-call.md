---
"@proconnect-gouv/proconnect.identite.database": minor
---

🚀 Ajout d'un index composite sur les connexions des utilisateurs

Ajoute un index `(user_id, created_at DESC)` sur la table `users_oidc_clients` pour accélérer la requête de listing des connexions d'un utilisateur triée par date de création, évitant un parcours séquentiel de la table.
