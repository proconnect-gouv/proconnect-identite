---
"@proconnect-gouv/proconnect.identite": major
"@proconnect-gouv/proconnect.identite.database": minor
---

AuthorizationRequestOutcomeEnum gagne la valeur signed_out : une ligne de users_oidc_clients avec outcome = 'signed_out' enregistre une déconnexion demandée par un service ; un match exhaustif sur l'enum doit traiter ce cas. Ajout de la colonne sid à users_oidc_clients (identifiant de session oidc-provider propre au service) : BaseAuthorizationRequest gagne sid obligatoire, et upsertAuthorizationRequest le conserve quand une écriture suivante de la même interaction n'en a pas
