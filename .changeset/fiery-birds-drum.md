---
"@proconnect-gouv/proconnect.identite.database": minor
---

✨ Ajoute le champ status à la table modérations pour suivre l'état des modérations (en attente, approuvée, rejetée, inconnu)

Par défaut, toutes les modérations ont le statut inconnu : les données de la table ne permettent pas de savoir si une modération a été approuvée ou rejetée.
