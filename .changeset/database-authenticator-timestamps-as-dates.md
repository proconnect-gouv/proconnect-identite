---
"@proconnect-gouv/proconnect.identite.database": major
---

Les colonnes `created_at` et `last_used_at` de `authenticators` sont typées en `Date` : Drizzle convertit les timestamps à la lecture, plutôt que de laisser chaque appelant le faire.
