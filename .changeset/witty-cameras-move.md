---
"@proconnect-gouv/proconnect.identite.database": minor
"@proconnect-gouv/proconnect.identite": minor
---

Ajoute la colonne `users.totp_display_name`, le champ `totp_display_name` à `UserSchema` (`null` par défaut) et `authenticators.rename`, qui renomme une clé d'accès sans toucher à ses compteurs. La réinitialisation de la double authentification remet aussi ce nom à `null`.
