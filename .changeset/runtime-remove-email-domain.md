---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Ajoute la commande `removeEmailDomain({ email_domain_id })`, qui supprime la ligne `email_domains` et journalise `domain.removed` sous l’acteur reçu dans la même transaction (`inputs.domain`, `outcome.email_domain_id`, `outcome.previous_verification_type`, sur l’organisation du domaine). Elle renvoie `{ kind: "domain_removed", activity_id, domain, organization_id, previous_verification_type }`, ou `{ kind: "domain_not_found", email_domain_id }` sans rien écrire si la ligne n’existe pas. `record()` n’accepte que les actions propres à l’application : hyyypertool passe par cette commande pour retirer un domaine.
