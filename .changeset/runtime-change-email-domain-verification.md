---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Remplace la commande `markDomainAsVerified` par `changeEmailDomainVerification({ domain, organization_id, verification_type })`, qui accepte aussi les types refusés (`refused`, `blacklisted`). Une validation garde le comportement précédent (`domain.verified` et `member.promoted`). Un refus remplace les états du domaine sans `verified_at`, journalise `domain.refused` sous l’acteur reçu, retire de l’organisation chaque membre dont l’email est sur ce domaine et journalise une ligne `member.removed` par membre sous l’acteur `{ type: "app", job: "domain.remove_members" }`, avec `cause_activity_id`. L’issue unique `domain_verification_changed` porte `promoted_members` et `removed_members`. `activityContextSchemas` décrit désormais `domain.refused` : hyyypertool doit retirer sa propre définition et sa transaction de refus en passant à cette version.
