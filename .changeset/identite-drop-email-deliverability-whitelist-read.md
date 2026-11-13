---
"@proconnect-gouv/proconnect.identite": major
---

Retire `findEmailInDeliverabilityWhiteListFactory` (`repositories/email-deliverability-whitelist`) et l'entrée `email_deliverability_whitelist` de `connectors` : la vérification de délivrabilité lit maintenant la base en Drizzle depuis l'application.
