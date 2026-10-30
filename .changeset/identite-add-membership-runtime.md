---
"@proconnect-gouv/proconnect.identite": major
---

Retire `createUserOrganizationFactory` (`repositories/user_organisation`), exposé aussi par `connectors`. L'application identite rattache maintenant un membre à une organisation avec `addMembership` du runtime, qui crée le rattachement et écrit la ligne `member.joined` dans la même transaction.
