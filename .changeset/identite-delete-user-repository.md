---
"@proconnect-gouv/proconnect.identite": major
---

Retire `deleteUserFactory` (`repositories/user`), exposé aussi par `connectors`. L'application identite supprime maintenant un compte avec `deleteUser` du runtime, qui fait la suppression et écrit la ligne `user.deleted` dans la même transaction.
