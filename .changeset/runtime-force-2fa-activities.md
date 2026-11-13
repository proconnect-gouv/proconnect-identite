---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Publie les schémas `user.force_2fa_enabled` et `user.force_2fa_disabled` : le journal dit quand la double authentification devient obligatoire pour un compte, et quelle action l’a levée (`reason`) : l’utilisateur la désactive (`"user_choice"`), supprime sa dernière clé d’accès (`"passkey_removed"`) ou son application d’authentification (`"totp_removed"`), ou récupère son compte avec ses mots de récupération (`"account_recovery"`).
