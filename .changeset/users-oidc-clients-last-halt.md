---
"@proconnect-gouv/proconnect.identite": minor
"@proconnect-gouv/proconnect.identite.database": minor
---

ajout de la colonne last_halt à users_oidc_clients ; nouveau dépôt updateAuthorizationRequestLastHalt (met à jour l'étape d'arrêt de la demande d'une interaction) ; AuthorizationRequest gagne last_halt et AuthorizationRequestLastHaltEnum (zod) partage les valeurs de last_halt
