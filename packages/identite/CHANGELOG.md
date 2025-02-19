# @gouvfr-lasuite/proconnect.identite

## 0.5.1

### Patch Changes

- [#990](https://github.com/numerique-gouv/proconnect-identite/pull/990) [`5ad2bd9`](https://github.com/numerique-gouv/proconnect-identite/commit/5ad2bd9031d9b01902401990ba79affb0082eb43) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 🐛 Correction d'un code d'erreur

  - si l'organisation est introuvable, `markDomainAsVerifiedFactory` retourne une erreur `NotFoundError` au lieu de `InseeNotFoundError`

## 0.5.0

### Minor Changes

- [#988](https://github.com/numerique-gouv/proconnect-identite/pull/988) [`375ea4e`](https://github.com/numerique-gouv/proconnect-identite/commit/375ea4e3c134bc70ae0bbda09663cc50fd511c59) Thanks [@douglasduteil](https://github.com/douglasduteil)! - ♻️ Prélevement d'un partie du buisness proconnect identité

## 0.4.0

### Minor Changes

- [#983](https://github.com/numerique-gouv/proconnect-identite/pull/983) [`5f866a6`](https://github.com/numerique-gouv/proconnect-identite/commit/5f866a6c57642229f8ccf8d517dc55519e7abee8) Thanks [@douglasduteil](https://github.com/douglasduteil)! - ♻️ Prélevement d'un partie du buisness proconnect identité

## 0.3.2

### Patch Changes

- [#975](https://github.com/numerique-gouv/proconnect-identite/pull/975) [`8e57ecc`](https://github.com/numerique-gouv/proconnect-identite/commit/8e57eccff4d3d614a4264b63f2583a63f82a88e6) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 🚚 Renommage de moncomptepro en proconnect-identite

## 0.3.1

### Patch Changes

- [#964](https://github.com/numerique-gouv/proconnect-identite/pull/964) [`eb63af3`](https://github.com/numerique-gouv/proconnect-identite/commit/eb63af3bf33139adece820c1cfadf3ee387713f1) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 🧑‍💻 Ajout du package @gouvfr-lasuite/proconnect.devtools.typescript

  Partage de la configuration de TypeScript entre les packages.

## 0.3.0

### Minor Changes

- [#913](https://github.com/numerique-gouv/proconnect-identite/pull/913) [`21d47b6`](https://github.com/numerique-gouv/proconnect-identite/commit/21d47b6c00670b7bbea1ce1f59b96a91c59bbe7a) Thanks [@douglasduteil](https://github.com/douglasduteil)! - ♻️ Prélevement d'un partie du buisness proconnect identité

  Dans le cadres la migration du script d'import de comptes coop, une partie de du buisness proconnect est déplacées dans le package `@gouvfr-lasuite/proconnect.identite` pour permettre leur réutilisation dans Hyyypertool.
