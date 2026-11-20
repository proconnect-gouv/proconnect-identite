---
"@proconnect-gouv/proconnect.identite": major
---

`users.create` exige un `Email` et `email_domains.addDomain` un `Domain` (`@proconnect-gouv/proconnect.core/security`) : une chaîne brute doit passer par `Email.parse` ou `Domain.parse` avant d'être insérée.
