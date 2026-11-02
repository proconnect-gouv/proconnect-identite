---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Ajoute la commande `removeTotp` et le schéma `user.totp_removed` : la suppression d'un authentificateur TOTP est journalisée, ainsi que la levée de la 2FA obligatoire quand aucun autre facteur ne reste.
