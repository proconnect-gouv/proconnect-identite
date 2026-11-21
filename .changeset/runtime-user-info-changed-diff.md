---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Le schéma `user.info_changed` ne journalise plus que les champs modifiés, avec leur ancienne et leur nouvelle valeur : `outcome: { next, previous }`, et `inputs` devient vide. Comme pour `organization.info_changed`, un affichage peut dire « Prénom : Jean → Jehan » sans comparer le formulaire envoyé à l'état précédent.
