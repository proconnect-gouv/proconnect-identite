---
"@proconnect-gouv/proconnect.core": patch
---

🐛 les listes de domaines sont de nouveau incluses dans le build : depuis la 1.0.1, `services/email` et `services/suggestion` chargeaient les fichiers `.ts` de `src/data`, ce qui cassait les projets qui les importent
