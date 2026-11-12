---
"@proconnect-gouv/proconnect.identite.database": major
---

`unique_organization_domain` porte désormais sur `(organization_id, domain)` : un domaine n’a plus qu’une ligne par organisation, quel que soit son `verification_type`. Changer le statut d’un domaine passe par la suppression de sa ligne avant l’insertion de la nouvelle, comme le font `markDomainAsVerified` et le refus de hyyypertool.
