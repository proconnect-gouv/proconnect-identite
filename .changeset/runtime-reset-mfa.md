---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Ajoute la commande `resetMfa` : elle réinitialise, dans une seule transaction, l'accès d'un utilisateur — suppression de ses clés d'accès (`authenticators`), clé TOTP effacée, mot de passe effacé, email marqué non vérifié, `force_2fa` désactivé — et journalise l'action `user.mfa_reset` sous l'acteur reçu, avec dans `inputs` l'identifiant de l'utilisateur et dans `outcome.previous` l'état d'avant (nombre de clés d'accès, email vérifié, mot de passe configuré, clé TOTP configurée, `force_2fa`). Elle renvoie l'issue `mfa_reset` (avec `previous` et `activity_id`) ou `user_not_found` (avec `user_id`, sans rien écrire).
