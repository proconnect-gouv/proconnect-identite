---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Ajoute la commande `updateMembership` : elle modifie, dans une seule transaction, le `is_external` et/ou le `verification_type` du rattachement d'un utilisateur à une organisation et journalise l'action `member.updated` sous l'acteur reçu, avec dans `inputs` les champs demandés et dans `outcome.previous` le `is_external` et le `verification_type` d'avant. Un nouveau `verification_type` remet `verified_at` à maintenant, ou à `null` pour `domain_not_verified_yet` ; `renew_verification: true` le remet à maintenant même quand le `verification_type` ne change pas (renouvellement d'une certification). Elle renvoie l'issue `member_updated` (avec `previous` et `activity_id`), `membership_unchanged` si rien ne change, ou `membership_not_found` (avec `organization_id` et `user_id`) ; ces deux dernières n'écrivent rien.
