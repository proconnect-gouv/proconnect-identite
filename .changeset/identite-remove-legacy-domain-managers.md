---
"@proconnect-gouv/proconnect.identite": major
---

Retire `markDomainAsVerifiedFactory` (`managers/organization`) et `assignUserVerificationTypeToDomainFactory` (`managers/user`), ainsi que les repositories qu'ils étaient seuls à utiliser (`email_domains.deleteEmailDomainsByVerificationTypes`, `organizations.findUsers`), sans appelant depuis que les deux applications passent par `markDomainAsVerified` du runtime.
