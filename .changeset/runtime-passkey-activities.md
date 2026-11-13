---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Publie les schémas `user.passkey_added` et `user.passkey_removed` : le journal dit quelle clé d’accès a été ajoutée (`credential_id`, `display_name`, pour la rapprocher des connexions), et quelles clés ont été supprimées (`credential_id`, ou `null` quand toutes partent), combien (`removed`), et si la suppression vient de l’utilisateur (`source: "self"`) ou de la récupération du compte (`source: "account_recovery"`).
