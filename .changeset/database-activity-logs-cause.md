---
"@proconnect-gouv/proconnect.identite.database": minor
---

Ajoute la colonne `cause_activity_id` (entier, sans clé étrangère) à `activity_logs` : une ligne écrite en conséquence d'une autre action pointe vers la ligne de cette action.
