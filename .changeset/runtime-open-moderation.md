---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Retire la commande `openModeration` : l’application identite ouvre maintenant une modération avec sa propre procédure `moderation.opened`, qui écrit la même ligne de journal ; le schéma `moderation.opened` reste publié dans `activityContextSchemas`.
