---
"@proconnect-gouv/proconnect.identite": minor
---

Les verification_type de la table email_domains ne peuvent plus être null. Ils prennent la valeur not_verified_yet à la place. On décommissione aussi la function forceJoinOrganization disponible via API au profil d'une logique centralisée dans Hyyypertool.
