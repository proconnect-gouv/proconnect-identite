---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Ajoute la commande `addMembership` : elle crée, dans une seule transaction, le rattachement d'un utilisateur à une organisation et journalise l'action `member.joined` sous l'acteur reçu, avec le `verification_type` et l'`is_external` dans `inputs`. Elle renvoie l'issue `member_joined` (avec `activity_id` et le rattachement) ou `member_already_exists` (avec `organization_id` et `user_id`, sans rien écrire ni modifier le rattachement existant).
