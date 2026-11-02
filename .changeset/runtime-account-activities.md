---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Ajoute `upsertOrganization` et les schémas d'activité des actions de compte (`user.info_changed`, `user.password_changed`, `user.totp_added`, `user.totp_removed`, `user.passkey_added`, `user.passkey_removed`, `user.force_2fa_enabled`, `user.force_2fa_disabled`, `user.email_verified`, `user.recovery_words_regenerated`, `moderation.cancelled`, `organization.upserted`), et permet à l'application d'enregistrer une action partagée depuis sa propre transaction.
