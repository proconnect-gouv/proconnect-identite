---
"@proconnect-gouv/proconnect.identite.database": major
---

Les colonnes horodatées de `users` (`created_at`, `updated_at`, `email_verified_at`, `last_sign_in_at`, `magic_link_sent_at`, `reset_password_sent_at`, `totp_key_verified_at`, `verify_email_sent_at`) sont typées en `Date` : Drizzle convertit les timestamps à la lecture, et une écriture `.returning()` renvoie directement un `User`. `build:schema` réapplique ce typage après `drizzle-kit pull`.
