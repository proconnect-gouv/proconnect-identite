---
"@proconnect-gouv/proconnect.identite": major
---

Retire `findByResetPasswordTokenFactory` (`repositories/user`) et l'entrée `users.findByResetPasswordToken` de `connectors` : la réinitialisation de mot de passe lit maintenant la base en Drizzle depuis l'application.
