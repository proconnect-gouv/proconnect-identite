---
"@proconnect-gouv/proconnect.email": patch
---

📦 Rend le package installable de manière autonome hors du monorepo

Passe la résolution de modules TypeScript en `NodeNext` et ajoute les extensions `.js` explicites sur les imports relatifs (requis par Node ESM). Marque le package public (`private: false`), limite le tarball publié au dossier `dist` via `files`, et déplace `@kitajs/ts-html-plugin` en dépendance de développement.
