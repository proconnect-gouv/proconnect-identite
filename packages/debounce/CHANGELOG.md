# @proconnect-gouv/proconnect.debounce

## 1.0.2

### Patch Changes

- [#1904](https://github.com/proconnect-gouv/proconnect-identite/pull/1904) [`711aa2f`](https://github.com/proconnect-gouv/proconnect-identite/commit/711aa2fd16b19f6ff2baf5da4a40aaf2a313a42b) Thanks [@BenoitSerrano](https://github.com/BenoitSerrano)! - correction de memory leak

- [#1900](https://github.com/proconnect-gouv/proconnect-identite/pull/1900) [`dc33a64`](https://github.com/proconnect-gouv/proconnect-identite/commit/dc33a6428431f5cca6e7d0d554c5a141f8872935) Thanks [@BenoitSerrano](https://github.com/BenoitSerrano)! - ajoute une fonction de ping pour le package debounce

## 1.0.1

### Patch Changes

- [#1879](https://github.com/proconnect-gouv/proconnect-identite/pull/1879) [`64c12ba`](https://github.com/proconnect-gouv/proconnect-identite/commit/64c12bab1152970195acc6f03ee8ae9d5ae325c8) Thanks [@BenoitSerrano](https://github.com/BenoitSerrano)! - remplace axios par fetch natif

## 1.0.0

### Major Changes

- [#1455](https://github.com/proconnect-gouv/proconnect-identite/pull/1455) [`38fffb0`](https://github.com/proconnect-gouv/proconnect-identite/commit/38fffb00ca5a5d2341a662f684d2555bbfb5ff02) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 📦 Première version officiel des packages `@proconnect-gouv/*`

## 0.5.0

### Minor Changes

- [#1385](https://github.com/proconnect-gouv/proconnect-identite/pull/1385) [`5906294`](https://github.com/proconnect-gouv/proconnect-identite/commit/5906294b6618d0d2cc1865a836886a35d740feb4) Thanks [@dependabot](https://github.com/apps/dependabot)! - feat: migration vers Zod v4

  Migration de Zod v3 vers v4 - les utilisateurs du package doivent s'assurer que leur projet est compatible avec Zod v4 si ils importent des schémas ou types depuis ce package.

## 0.4.3

### Patch Changes

- [#975](https://github.com/proconnect-gouv/proconnect-identite/pull/975) [`8e57ecc`](https://github.com/proconnect-gouv/proconnect-identite/commit/8e57eccff4d3d614a4264b63f2583a63f82a88e6) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 🚚 Renommage de moncomptepro en proconnect-identite

## 0.4.2

### Patch Changes

- [#964](https://github.com/proconnect-gouv/proconnect-identite/pull/964) [`eb63af3`](https://github.com/proconnect-gouv/proconnect-identite/commit/eb63af3bf33139adece820c1cfadf3ee387713f1) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 🧑‍💻 Ajout du package @gouvfr-lasuite/proconnect.devtools.typescript

  Partage de la configuration de TypeScript entre les packages.

## 0.4.1

### Patch Changes

- [#950](https://github.com/proconnect-gouv/proconnect-identite/pull/950) [`afaa477`](https://github.com/proconnect-gouv/proconnect-identite/commit/afaa477911ce350c69daac8a5fef56329e31b906) Thanks [@douglasduteil](https://github.com/douglasduteil)! - ✨ Export du type de handler

## 0.4.0

### Minor Changes

- [#945](https://github.com/proconnect-gouv/proconnect-identite/pull/945) [`aa82ec5`](https://github.com/proconnect-gouv/proconnect-identite/commit/aa82ec57d314c9d82ce3ed13e62604d9c6825c63) Thanks [@douglasduteil](https://github.com/douglasduteil)! - ♻️ Prélèvement d'un partie du connecteur Debounce

  Dans le cadre de la suggestion d'email sur PCF, une partie du connecteur Debounce est maintenant dans le package `@gouvfr-lasuite/proconnect.debounce`.
