---
"@proconnect-gouv/proconnect.registre_national_entreprises": major
"@proconnect-gouv/proconnect.identite": minor
---

`findPouvoirsBySiren` renvoie `{ pouvoirs, updated_at }` au lieu du tableau de pouvoirs : `updated_at` est la date de dernière mise à jour de la fiche RNE (`updatedAt`), ou `null` si l'API ne la donne pas. `processCertificationDirigeant` expose cette date dans `details.source_updated_at` : `updatedAt` pour le RNE, `dateDernierTraitementUniteLegale` pour l'INSEE, `null` pour le repli sur le RCS.
