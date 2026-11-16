---
"@proconnect-gouv/proconnect.identite": major
---

Retire `upsertAuthorizationRequestFactory` (`repositories/oidc-client`), exposé aussi par `connectors` (`oidc_clients.upsertAuthorizationRequest`). L'application identite écrit maintenant ses lignes `users_oidc_clients` avec Drizzle ; `oidc_clients.findByClientId` reste.
