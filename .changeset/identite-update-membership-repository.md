---
"@proconnect-gouv/proconnect.identite": major
---

Retire `updateUserOrganizationFactory` (`repositories/user_organisation`), exposé aussi par `connectors`. L'application identite modifie maintenant un rattachement avec `updateMembership` du runtime, qui fait la modification et écrit la ligne `member.updated` dans la même transaction.
