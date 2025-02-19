---
"@gouvfr-lasuite/proconnect.identite": patch
---

🐛 Correction d'un code d'erreur

- si l'organisation est introuvable, `markDomainAsVerifiedFactory` retourne une erreur `NotFoundError` au lieu de `InseeNotFoundError`
