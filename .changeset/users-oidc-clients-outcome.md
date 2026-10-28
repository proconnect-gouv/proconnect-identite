---
"@proconnect-gouv/proconnect.identite": major
"@proconnect-gouv/proconnect.identite.database": minor
---

ajout des colonnes interaction_cid et outcome à users_oidc_clients, avec un index unique partiel sur interaction_cid ; addConnection devient upsertAuthorizationRequest (met à jour la ligne d'une même interaction au lieu d'en ajouter une), les types Connection et BaseConnection deviennent AuthorizationRequest et BaseAuthorizationRequest avec interaction_cid et outcome obligatoires ; AuthorizationRequestOutcomeEnum (zod) partage les valeurs de outcome
