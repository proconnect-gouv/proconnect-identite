---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Ajoute les commandes `connectFranceConnect` et `disconnectFranceConnect` : elles lient ou délie, dans une seule transaction, l'identité FranceConnect d'un utilisateur et journalisent `franceconnect.connected` ou `franceconnect.disconnected` sous l'acteur reçu, avec `inputs` vide et, dans `outcome`, la date de création du rattachement FranceConnect. `connectFranceConnect` recopie aussi les noms FranceConnect sur l'utilisateur ; elle renvoie l'issue `franceconnect_connected` (avec `activity_id`, `connected_at` et les noms posés) ou `user_not_found`. `disconnectFranceConnect` renvoie `franceconnect_disconnected` (avec `activity_id` et `connected_at`) ou `franceconnect_identity_not_found`, sans rien écrire.
