---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Publie les schémas `user.totp_added` et `user.totp_removed` : le journal dit quand une application d’authentification est configurée, si elle en remplace une autre (`previous.totp_configured`), et si sa suppression vient de l’utilisateur (`source: "self"`) ou de la récupération du compte par mots de récupération (`source: "account_recovery"`).
