---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Ajoute les procédures `organization.created` et `organization.info_changed` à `as(actor)`. La première crée une organisation depuis ses données INSEE et journalise qui l'a créée ; la seconde rafraîchit ses données INSEE en cache et journalise l'ancienne et la nouvelle valeur de chaque champ modifié (`outcome.previous` et `outcome.next`). Un rafraîchissement sans changement n'est pas journalisé.
