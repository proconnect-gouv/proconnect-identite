---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Ajoute la commande `removeMembership` : elle supprime, dans une seule transaction, le rattachement d'un utilisateur à une organisation et journalise l'action `member.removed` sous l'acteur reçu, avec `inputs` vide et, dans `outcome`, le `is_external` et le `verification_type` du rattachement supprimé. Elle renvoie l'issue `member_removed` (avec `previous` et `activity_id`) ou `membership_not_found` (avec `organization_id` et `user_id`, sans rien écrire). Le type `Actor` accepte `{ type: "user", user_id }`, journalisé avec `actor_type` `user` et `actor_ref` égal à l'identifiant.
