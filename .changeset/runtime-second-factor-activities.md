---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Publie les schémas des actions sur le second facteur, pour que les modérateurs et l’équipe sécurité les lisent dans le journal : `user.force_2fa_enabled` et `user.force_2fa_disabled` (`reason` : l’utilisateur la désactive, supprime sa dernière clé d’accès ou son application d’authentification, ou récupère son compte), `user.totp_added` (remplace-t-elle une application existante) et `user.totp_removed` (`source` : l’utilisateur ou la récupération du compte), `user.passkey_added` (`credential_id`, `display_name`) et `user.passkey_removed` (`credential_id` ou `null` pour toutes, `source`, `removed`), `user.recovery_words_regenerated` (remplacent-ils des mots existants) et `user.account_recovered`, la récupération du compte par mots de récupération, écrite dans la même transaction que les suppressions qu’elle entraîne.
