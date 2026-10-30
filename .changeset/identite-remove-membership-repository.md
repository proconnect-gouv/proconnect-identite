---
"@proconnect-gouv/proconnect.identite": major
---

Retire `deleteUserOrganizationFactory` (`repositories/user_organisation`), exposé aussi par `connectors`. L'application identite supprime maintenant un rattachement avec `removeMembership` du runtime, qui fait la suppression et écrit la ligne `member.removed` dans la même transaction.
