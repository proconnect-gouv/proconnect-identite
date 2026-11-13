---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Ajoute l’action `user.email_verified` : une vérification d’adresse email par code ou par lien de connexion est journalisée avec sa `source`, et `outcome.previous.email_verified` indique s’il s’agissait de la première vérification. Une connexion par lien par un utilisateur déjà vérifié ne crée aucune ligne, l’historique de connexion la couvrant déjà.
