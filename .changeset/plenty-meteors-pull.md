---
"@proconnect-gouv/proconnect.identite": patch
---

🐛 Correction de l'import de `pg` en `import type` dans `contexts.ts` pour éviter que le barrel `types` n'embarque `pg` dans les bundles navigateur.
