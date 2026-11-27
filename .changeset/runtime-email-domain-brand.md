---
"@proconnect-gouv/proconnect.identite.runtime": major
---

`changeEmailDomainVerification` exige un `Domain` (`@proconnect-gouv/proconnect.core/security`) : une chaîne brute doit passer par `Domain.parse` avant d'être enregistrée dans `email_domains`.
