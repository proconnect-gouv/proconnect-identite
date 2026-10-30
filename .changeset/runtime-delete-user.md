---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Ajoute la commande `deleteUser` : elle supprime, dans une seule transaction, le compte d'un utilisateur et journalise l'action `user.deleted` sous l'acteur reçu, avec dans `inputs` l'entrée de la commande (`user_id`) et dans `outcome` son résultat : l'email, le prénom et le nom du compte supprimé ainsi que ses rattachements (`organization_id`, `is_external`, `verification_type`) supprimés avec lui. La ligne reste lisible après la suppression : `activity_logs` n'a pas de clé étrangère vers `users`. Elle renvoie l'issue `user_deleted` (avec `previous` et `activity_id`) ou `user_not_found` (avec `user_id`, sans rien écrire).
