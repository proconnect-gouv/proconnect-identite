---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Retire la commande `connectFranceConnect` : l’application identite relie maintenant une identité FranceConnect avec sa propre procédure `franceconnect.connected`, qui écrit la même ligne de journal ; le schéma `franceconnect.connected` reste publié dans `activityContextSchemas`.
