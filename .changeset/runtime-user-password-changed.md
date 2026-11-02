---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Ajoute la commande `changePassword` et le schéma `user.password_changed` : un mot de passe défini à la réinitialisation ou à l'inscription est journalisé avec l'état précédent, sans jamais écrire le mot de passe ni son empreinte.
