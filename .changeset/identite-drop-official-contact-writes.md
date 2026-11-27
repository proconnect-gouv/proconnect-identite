---
"@proconnect-gouv/proconnect.identite": major
---

Retire `upsertOfficialContactEmailVerificationFactory` et `deleteOfficialContactEmailVerificationFactory` (`repositories/official-contact-email-verification`), exposés aussi par `connectors` (`official_contact_email_verifications.upsert` et `.delete`). L'application identite écrit et consomme maintenant le code envoyé au contact officiel avec Drizzle ; `official_contact_email_verifications.find` reste.
