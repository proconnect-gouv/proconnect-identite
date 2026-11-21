---
"@proconnect-gouv/proconnect.identite": major
---

Retire `addDomainFactory` et `AddDomainHandler` (`repositories/email-domain`), exposés aussi par `connectors` (`email_domains.addDomain`). Son seul appelant, le script `import-domains` de l'application identite, insère maintenant le domaine avec Drizzle.
