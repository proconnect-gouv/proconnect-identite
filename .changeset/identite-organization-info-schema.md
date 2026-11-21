---
"@proconnect-gouv/proconnect.identite": major
---

Retire `upsertFactory` et `UpsertHandler` (`repositories/organization`), exposés aussi par `connectors` (`organizations.upsert`). Une organisation se crée maintenant avec la procédure `organization.created` du runtime, et ses données INSEE se rafraîchissent avec `organization.info_changed`.

Exporte `OrganizationInfoSchema` (données INSEE et RNE d'une organisation), dont `OrganizationInfo` est désormais le type de sortie, et `CachedOrganizationInfoSchema`, la liste unique des colonnes `cached_*` d'une organisation : `Organization` en dérive ses champs `cached_*` et devient un type (plus une interface). `toPartialOrganization` (`managers/organization`) renvoie aussi `cached_denomination_usuelle_etablissement_principal` et devient l'unique correspondance entre `OrganizationInfo` et ces colonnes.
