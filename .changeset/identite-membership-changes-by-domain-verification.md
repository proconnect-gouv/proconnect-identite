---
"@proconnect-gouv/proconnect.identite": major
---

Remplace `getMemberIdsPromotedByDomain` (`services/organization`) par `getMembershipChangesByDomainVerification({ domain, members, verification_type })`, la règle unique de ce qu'un domaine validé ou refusé fait aux membres de l'organisation dont l'email est sur ce domaine. Pour un type validé, elle renvoie `{ kind: "domain_approved", promoted_members, verification_type }` avec les membres non vérifiés ou `domain_not_verified_yet` ; pour un type refusé, `{ kind: "domain_refused", removed_members, verification_type }` avec tous les membres du domaine, quel que soit leur rattachement.
