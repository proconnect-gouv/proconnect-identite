---
"@proconnect-gouv/proconnect.identite.runtime": minor
"@proconnect-gouv/proconnect.identite": minor
---

Le runtime ajoute `certificationDirigeantActivities` (schémas zod des actions `certification_dirigeant.certified`, `.close_matched`, `.not_matched` et `.not_covered`) et `getCertificationDirigeantActivity`, qui transforme le résultat de `processCertificationDirigeant` en l'une de ces actions. `outcome` porte le registre consulté, la raison d'un échec et, pour une correspondance partielle seulement, `diff` : pour chaque critère discordant, la valeur FranceConnect et celle du registre, telles que reçues (`raw`) et telles que comparées (`compared`). Ces schémas ne font pas encore partie de `activityContextSchemas` : l'application qui les écrit les passe à `createIdentiteRuntime` comme ses propres actions, et un lecteur du journal les ajoute à ses schémas. identite exporte `compareCriteria`, d'où `certificationScore` tire désormais ses critères concordants.
