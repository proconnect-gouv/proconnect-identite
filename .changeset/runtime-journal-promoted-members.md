---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Journalise les membres promus par une vérification de domaine. `markDomainAsVerified` ajoute, dans sa transaction, une ligne `member.promoted` par membre promu, sous l'acteur `{ type: "app", job: "domain.promote_members" }`, avec `user_id`, `organization_id` et `cause_activity_id` pointant vers la ligne `domain.verified`. `activityContextSchemas` décrit la nouvelle action : `inputs.previous_verification_type`, `outcome.verification_type`.
