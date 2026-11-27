---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Retire la commande `updatePersonalInformations` : l’application identite modifie maintenant les informations personnelles avec sa propre procédure `user.info_changed`. Le schéma `user.info_changed` reste publié et ses `inputs` deviennent partiels : la ligne ne journalise plus que les champs envoyés, `outcome.previous` restant complet.
