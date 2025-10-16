# @proconnect-gouv/proconnect.identite

## 1.1.0

### Minor Changes

- [#1449](https://github.com/proconnect-gouv/proconnect-identite/pull/1449) [`a12697c`](https://github.com/proconnect-gouv/proconnect-identite/commit/a12697c3785aea1bb737afec8ce52111132ec807) Thanks [@douglasduteil](https://github.com/douglasduteil)! - ✨ Ajout de la fonction `isPublicService` pour identifier les services publics

  Nouvelle fonction exportée permettant de déterminer si une organisation est un service public en fonction de sa nature juridique, son statut administratif et des listes de référence officielles.

  Inspirée par https://github.com/annuaire-entreprises-data-gouv-fr/search-infra/blob/f1e56ac476b0b1730115f7b1f0667e8509ee5379/workflows/data_pipelines/elasticsearch/data_enrichment.py#L155-L189

  ```
  import { isPublicService } from "@proconnect-gouv/proconnect.identite/services/organization";

  isPublicService(my_oganization) =>> true/false
  ```

## 1.0.0

### Major Changes

- [#1455](https://github.com/proconnect-gouv/proconnect-identite/pull/1455) [`38fffb0`](https://github.com/proconnect-gouv/proconnect-identite/commit/38fffb00ca5a5d2341a662f684d2555bbfb5ff02) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 📦 Première version officiel des packages `@proconnect-gouv/*`

## 0.9.0

### Minor Changes

- [#1385](https://github.com/proconnect-gouv/proconnect-identite/pull/1385) [`5906294`](https://github.com/proconnect-gouv/proconnect-identite/commit/5906294b6618d0d2cc1865a836886a35d740feb4) Thanks [@dependabot](https://github.com/apps/dependabot)! - feat: migration vers Zod v4

  Migration de Zod v3 vers v4 - les utilisateurs du package doivent s'assurer que leur projet est compatible avec Zod v4 si ils importent des schémas ou types depuis ce package.

## 0.8.1

### Patch Changes

- [#1317](https://github.com/proconnect-gouv/proconnect-identite/pull/1317) [`749329f`](https://github.com/proconnect-gouv/proconnect-identite/commit/749329f4279db13151d42337e578cacbed8d2a26) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 🐛 Correction du sélecteur lors de la suppression de domaines de vérification

  see [`b5893a5`](https://github.com/proconnect-gouv/proconnect-identite/commit/b5893a5412faeea47afd8b4c9683bae47d389089)

## 0.8.0

### Minor Changes

- [#1284](https://github.com/proconnect-gouv/proconnect-identite/pull/1284) [`30db367`](https://github.com/proconnect-gouv/proconnect-identite/commit/30db367114350ae67fbdf3a283858addfab56d26) Thanks [@rebeccadumazert](https://github.com/rebeccadumazert)! - Renomme la vérification type "receipt_sent" en "proof_received"

## 0.7.0

### Minor Changes

- [#1282](https://github.com/proconnect-gouv/proconnect-identite/pull/1282) [`a3b52c3`](https://github.com/proconnect-gouv/proconnect-identite/commit/a3b52c33470f24bbe164d2435c717cb1f2f0a932) Thanks [@rebeccadumazert](https://github.com/rebeccadumazert)! - Ajoute deux nouveaux types de vérification
  - in_liste_dirigeants_rne : Liste des dirigeants RNE
  - receipt_sent : Justificatif transmis

## 0.6.0

### Minor Changes

- [#1251](https://github.com/proconnect-gouv/proconnect-identite/pull/1251) [`2bd56c8`](https://github.com/proconnect-gouv/proconnect-identite/commit/2bd56c8c857fd7a819cbc787faf030547e18023c) Thanks [@BenoitSerrano](https://github.com/BenoitSerrano)! - Centralize handling of email domains verification (addition, deletion, update for a specific domain)

## 0.5.3

### Patch Changes

- [#1252](https://github.com/proconnect-gouv/proconnect-identite/pull/1252) [`d2d6759`](https://github.com/proconnect-gouv/proconnect-identite/commit/d2d6759458b98ccc153005537ac2f5d063d0495a) Thanks [@rdubigny](https://github.com/rdubigny)! - La vérification de domaine official_contact permet de créer un lien vérifié avec le type "domain" plutôt qu'un lien non vérifié lors d'une validation du domaine par hyyypertool.

## 0.5.2

### Patch Changes

- [#1021](https://github.com/proconnect-gouv/proconnect-identite/pull/1021) [`86ad73c`](https://github.com/proconnect-gouv/proconnect-identite/commit/86ad73c9bb43f7171c0bda7b06fba14837449c1e) Thanks [@douglasduteil](https://github.com/douglasduteil)! - ❎ Les erreurs sont nommées

## 0.5.1

### Patch Changes

- [#990](https://github.com/proconnect-gouv/proconnect-identite/pull/990) [`5ad2bd9`](https://github.com/proconnect-gouv/proconnect-identite/commit/5ad2bd9031d9b01902401990ba79affb0082eb43) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 🐛 Correction d'un code d'erreur
  - si l'organisation est introuvable, `markDomainAsVerifiedFactory` retourne une erreur `NotFoundError` au lieu de `InseeNotFoundError`

## 0.5.0

### Minor Changes

- [#988](https://github.com/proconnect-gouv/proconnect-identite/pull/988) [`375ea4e`](https://github.com/proconnect-gouv/proconnect-identite/commit/375ea4e3c134bc70ae0bbda09663cc50fd511c59) Thanks [@douglasduteil](https://github.com/douglasduteil)! - ♻️ Prélevement d'un partie du buisness proconnect identité

## 0.4.0

### Minor Changes

- [#983](https://github.com/proconnect-gouv/proconnect-identite/pull/983) [`5f866a6`](https://github.com/proconnect-gouv/proconnect-identite/commit/5f866a6c57642229f8ccf8d517dc55519e7abee8) Thanks [@douglasduteil](https://github.com/douglasduteil)! - ♻️ Prélevement d'un partie du buisness proconnect identité

## 0.3.2

### Patch Changes

- [#975](https://github.com/proconnect-gouv/proconnect-identite/pull/975) [`8e57ecc`](https://github.com/proconnect-gouv/proconnect-identite/commit/8e57eccff4d3d614a4264b63f2583a63f82a88e6) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 🚚 Renommage de moncomptepro en proconnect-identite

## 0.3.1

### Patch Changes

- [#964](https://github.com/proconnect-gouv/proconnect-identite/pull/964) [`eb63af3`](https://github.com/proconnect-gouv/proconnect-identite/commit/eb63af3bf33139adece820c1cfadf3ee387713f1) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 🧑‍💻 Ajout du package @gouvfr-lasuite/proconnect.devtools.typescript

  Partage de la configuration de TypeScript entre les packages.

## 0.3.0

### Minor Changes

- [#913](https://github.com/proconnect-gouv/proconnect-identite/pull/913) [`21d47b6`](https://github.com/proconnect-gouv/proconnect-identite/commit/21d47b6c00670b7bbea1ce1f59b96a91c59bbe7a) Thanks [@douglasduteil](https://github.com/douglasduteil)! - ♻️ Prélevement d'un partie du buisness proconnect identité

  Dans le cadres la migration du script d'import de comptes coop, une partie de du buisness proconnect est déplacées dans le package `@gouvfr-lasuite/proconnect.identite` pour permettre leur réutilisation dans Hyyypertool.
