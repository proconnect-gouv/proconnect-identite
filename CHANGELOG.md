# Changelog

## [2026.10.9](https://github.com/proconnect-gouv/proconnect-identite/compare/2026.10.8...2026.10.9) (2026-10-26)

### Ajouté

- ✨ Add a script to run all e2e test cases sequentially ([#2293](https://github.com/proconnect-gouv/proconnect-identite/issues/2293)) ([d0fcb24](https://github.com/proconnect-gouv/proconnect-identite/commit/d0fcb24833391ce51ceba98873c74f007e79000b))

### Dépendances

- ⬆️ bump postgres image to 17.11 ([#2305](https://github.com/proconnect-gouv/proconnect-identite/issues/2305)) ([f6f55f3](https://github.com/proconnect-gouv/proconnect-identite/commit/f6f55f31fe60d6d166ea5d8384398b25379fac6c))
- ⬆️ Bump the sentry group across 1 directory with 2 updates ([#2256](https://github.com/proconnect-gouv/proconnect-identite/issues/2256)) ([cd045b1](https://github.com/proconnect-gouv/proconnect-identite/commit/cd045b16f02caac6b4098361de51e90ddf7125d4))
- :arrow_up: Bump ejs from 5.0.1 to 7.0.2 ([#2301](https://github.com/proconnect-gouv/proconnect-identite/issues/2301)) ([dbc9126](https://github.com/proconnect-gouv/proconnect-identite/commit/dbc91269189e638e7e7baba28dae7f3b41ffcdda))
- :arrow_up: Bump hono from 4.13.11 to 4.13.13 ([#2300](https://github.com/proconnect-gouv/proconnect-identite/issues/2300)) ([b0b327c](https://github.com/proconnect-gouv/proconnect-identite/commit/b0b327c7f8482974166e88822396e63ea33b7c1a))
- :arrow_up: Bump csv from 6.6.3 to 6.6.4 ([#2302](https://github.com/proconnect-gouv/proconnect-identite/issues/2302)) ([07a3516](https://github.com/proconnect-gouv/proconnect-identite/commit/07a3516ca0bd89cdd4b35b58253de53588d876d8))
- :arrow_up: Bump body-parser from 2.3.0 to 2.4.0 ([#2303](https://github.com/proconnect-gouv/proconnect-identite/issues/2303)) ([8cf01d3](https://github.com/proconnect-gouv/proconnect-identite/commit/8cf01d34906f22adc3a948d43bc7195bb24c069f))
- :arrow_up: Bump undici from 7.30.0 to 7.30.1 ([#2304](https://github.com/proconnect-gouv/proconnect-identite/issues/2304)) ([65c4fe8](https://github.com/proconnect-gouv/proconnect-identite/commit/65c4fe8ee419e844b926ba4921c319b9c6344b05))
- :arrow_up: Bump nock from 14.0.11 to 15.0.2 ([#2294](https://github.com/proconnect-gouv/proconnect-identite/issues/2294)) ([6c27553](https://github.com/proconnect-gouv/proconnect-identite/commit/6c275536cbee19d3a13dee615b349c7533315f87))
- :arrow_up: Bump zod from 4.3.6 to 4.6.7 ([#2295](https://github.com/proconnect-gouv/proconnect-identite/issues/2295)) ([6e69c2b](https://github.com/proconnect-gouv/proconnect-identite/commit/6e69c2b44f02d1eaed378a845395d62b05ac0d0c))
- :arrow_up: Bump nodemailer from 10.0.15 to 10.1.7 ([#2298](https://github.com/proconnect-gouv/proconnect-identite/issues/2298)) ([0464da2](https://github.com/proconnect-gouv/proconnect-identite/commit/0464da2dae41378d4839cd0f484c997373a822ae))
- :arrow_up: Bump proconnect-gouv/proconnect-test-client ([#2297](https://github.com/proconnect-gouv/proconnect-identite/issues/2297)) ([596fc07](https://github.com/proconnect-gouv/proconnect-identite/commit/596fc0786b5567fcc2a75cb80393715d7c2abe61))

### CI/CD

- 👷 Add non-regression tests for per-SP organization selection ([#2292](https://github.com/proconnect-gouv/proconnect-identite/issues/2292)) ([a8c2df4](https://github.com/proconnect-gouv/proconnect-identite/commit/a8c2df48a38aba3e600b8ab78544daadbdbe7933))

### Divers

- Revert "💄 Warn users about the hosting provider security maintenance" ([#2284](https://github.com/proconnect-gouv/proconnect-identite/issues/2284)) ([8d64266](https://github.com/proconnect-gouv/proconnect-identite/commit/8d6426657b22f2a05b43fbf3c9e342c1b2878a9c))

## [2026.10.8](https://github.com/proconnect-gouv/proconnect-identite/compare/2026.10.7...2026.10.8) (2026-10-23)

### Corrigé

- 🐛 Bind the selected organization to the session and the client ([e750b01](https://github.com/proconnect-gouv/proconnect-identite/commit/e750b01953bf3d848dee5a3ca1929958731db112))
- 🔒 Self-host the Matomo Tag Manager container ([7383e19](https://github.com/proconnect-gouv/proconnect-identite/commit/7383e19f17ef59104cd6e6ad97ab228afd74a0e5))
- 🐛 Answer 500 when a testing route fails ([252c2a6](https://github.com/proconnect-gouv/proconnect-identite/commit/252c2a645248400e79a3d92ca01b1432bd86c33e))
- 🐛 Restrict testing fixture reads to known ids ([0836b82](https://github.com/proconnect-gouv/proconnect-identite/commit/0836b825456145f795f294e3f7409434300ec026))

### Dépendances

- :arrow_up: Bump vite from 7.3.2 to 7.3.7 ([525b8be](https://github.com/proconnect-gouv/proconnect-identite/commit/525b8be2389f8c44616001eae3ffe3ba341bcbbd))
- ⬆️ Synchronisation du Grist contenant la liste des administrations ([adc6960](https://github.com/proconnect-gouv/proconnect-identite/commit/adc6960974e2018631a462e9296d4b7e53705cd1))
- :arrow_up: Bump launch-editor from 2.14.1 to 2.14.2 ([10a6c2c](https://github.com/proconnect-gouv/proconnect-identite/commit/10a6c2cd44908faca47d478f21124d1c92af1a8d))

## [2026.10.7](https://github.com/proconnect-gouv/proconnect-identite/compare/2026.10.6...2026.10.7) (2026-10-21)

### Changements

- ✨ Régénérer et vérifier ses mots de secours depuis la page « Compte et connexion » ; après une régénération, les anciens mots ne fonctionnent plus

### Ajouté

- ✨ Create section & page recovery code ([#2172](https://github.com/proconnect-gouv/proconnect-identite/issues/2172)) ([679aa8a](https://github.com/proconnect-gouv/proconnect-identite/commit/679aa8a857070ae1e361142f1279a130e4c8f222))

### Modifié

- 💄 Warn users about the hosting provider security maintenance ([020f07f](https://github.com/proconnect-gouv/proconnect-identite/commit/020f07f435956786891606577495a91248c1cd2f))
- ♻️ Restore the `processPendingCertificationDirigeantGuard` name ([7dacd97](https://github.com/proconnect-gouv/proconnect-identite/commit/7dacd97fe915470791999c1b54dbf5ca4065d37c))
- 🔧 sign bot pull request commits ([#2268](https://github.com/proconnect-gouv/proconnect-identite/issues/2268)) ([5956df6](https://github.com/proconnect-gouv/proconnect-identite/commit/5956df63ca9a7e9b4ea24908a49b77be89d2d57f))

### Dépendances

- :arrow_up: Bump follow-redirects from 1.16.0 to 1.16.1 ([#2277](https://github.com/proconnect-gouv/proconnect-identite/issues/2277)) ([90dfd77](https://github.com/proconnect-gouv/proconnect-identite/commit/90dfd771d821d3112bca22426735f5e6d98c512a))
- :arrow_up: Bump hono from 4.13.7 to 4.13.11 ([#2278](https://github.com/proconnect-gouv/proconnect-identite/issues/2278)) ([156b3ef](https://github.com/proconnect-gouv/proconnect-identite/commit/156b3efc3fb899fc5087f62bfade435beae579cf))
- :arrow_up: Bump moment-timezone from 0.6.3 to 0.6.5 ([#2271](https://github.com/proconnect-gouv/proconnect-identite/issues/2271)) ([a923d8b](https://github.com/proconnect-gouv/proconnect-identite/commit/a923d8b3cb683fdda8d2534889db32664f32e39b))
- :arrow_up: Bump helmet from 8.1.0 to 8.3.0 ([#2272](https://github.com/proconnect-gouv/proconnect-identite/issues/2272)) ([731293c](https://github.com/proconnect-gouv/proconnect-identite/commit/731293c40c36a81ab78406e71dd4a5c6192af85a))
- :arrow_up: Bump openid-client from 6.8.2 to 6.8.8 ([#2273](https://github.com/proconnect-gouv/proconnect-identite/issues/2273)) ([48afb32](https://github.com/proconnect-gouv/proconnect-identite/commit/48afb32ffc854877380d256a84e35723618002e5))
- ⬆️ Synchronisation du Grist contenant la liste des administrations ([#2264](https://github.com/proconnect-gouv/proconnect-identite/issues/2264)) ([9cf1e2a](https://github.com/proconnect-gouv/proconnect-identite/commit/9cf1e2a369907ac811b005c5e0d20f5681368ec3))

### Divers

- ✅ run every forced 2fa e2e case ([f9b96f6](https://github.com/proconnect-gouv/proconnect-identite/commit/f9b96f69e57a620cac2d839b0309859bdf6a561a))
- 💬 Remove offensive and sensitive words from diceware word list ([a8fb327](https://github.com/proconnect-gouv/proconnect-identite/commit/a8fb327ad6de45523438cf1a6420e1ca2055a16b))

## [2026.10.6](https://github.com/proconnect-gouv/proconnect-identite/compare/2026.10.5...2026.10.6) (2026-10-12)

### Changements

- ✨ Un email de confirmation est envoyé après la réinitialisation du mot de passe, pour signaler une réinitialisation que l'utilisateur n'a pas faite
- ✨ Un email de confirmation est envoyé quand un utilisateur quitte une organisation, pour signaler un départ qu'il n'a pas fait

### Ajouté

- ✨ send confirmation email on password reset ([#2134](https://github.com/proconnect-gouv/proconnect-identite/issues/2134)) ([d6c3b4d](https://github.com/proconnect-gouv/proconnect-identite/commit/d6c3b4d9e312d11025754448a0ba27c552d4f005))
- ✨ send confirmation email when a user quits an organization ([#2135](https://github.com/proconnect-gouv/proconnect-identite/issues/2135)) ([ff19302](https://github.com/proconnect-gouv/proconnect-identite/commit/ff19302166915dce3f08ce4f969e2d147daf0e1b))

### Modifié

- 🔧 tag sentry release with app version ([#2262](https://github.com/proconnect-gouv/proconnect-identite/issues/2262)) ([62c7b5d](https://github.com/proconnect-gouv/proconnect-identite/commit/62c7b5d745ea51ffeb1aaa5b2c9ee0025d7600b5))

### Corrigé

- 🐛 drop non-workspace root package from changesets ([#2259](https://github.com/proconnect-gouv/proconnect-identite/issues/2259)) ([d6194a0](https://github.com/proconnect-gouv/proconnect-identite/commit/d6194a06c2fa81aa93fd4f078eb90cc20a8df708))

### Dépendances

- :arrow_up: bump cypress-io/github-action from 7.4.5 to 7.4.6 ([#2239](https://github.com/proconnect-gouv/proconnect-identite/issues/2239)) ([df6fa28](https://github.com/proconnect-gouv/proconnect-identite/commit/df6fa282f40447b30a1d54af1cd7142405b57cfc))
- :arrow_up: bump nodemailer from 10.0.9 to 10.0.15 ([#2258](https://github.com/proconnect-gouv/proconnect-identite/issues/2258)) ([1a32fb6](https://github.com/proconnect-gouv/proconnect-identite/commit/1a32fb65212e9d24d4fc4e93f45d4cd1512cf230))
- :arrow_up: bump @types/express-session from 1.18.2 to 1.19.0 ([#2257](https://github.com/proconnect-gouv/proconnect-identite/issues/2257)) ([64c17fe](https://github.com/proconnect-gouv/proconnect-identite/commit/64c17fe2cb732e14e24a7f4a56e5ea5833e913d4))
- ⬆️ bump cypress-maildev to 2.0.0, keep the maildev image on v2 ([#2254](https://github.com/proconnect-gouv/proconnect-identite/issues/2254)) ([c71a068](https://github.com/proconnect-gouv/proconnect-identite/commit/c71a06814972646c04e66e618844ad9756cda0fc))

### Divers

- chore(deps-dev): bump postcss-selector-parser from 7.1.1 to 7.1.6 ([#2225](https://github.com/proconnect-gouv/proconnect-identite/issues/2225)) ([e9492f9](https://github.com/proconnect-gouv/proconnect-identite/commit/e9492f90e7a0a819b7a5df5911f86dec52273459))
- chore(deps-dev): bump joi from 18.2.8 to 18.2.9 ([#2226](https://github.com/proconnect-gouv/proconnect-identite/issues/2226)) ([542d212](https://github.com/proconnect-gouv/proconnect-identite/commit/542d212d6dc9d149e2b354d16b27cff900c86a58))
- chore(deps): bump source-map-js from 1.2.1 to 1.2.2 ([#2224](https://github.com/proconnect-gouv/proconnect-identite/issues/2224)) ([f3fb7e6](https://github.com/proconnect-gouv/proconnect-identite/commit/f3fb7e6a375cd8c4f1a7f878eb72268fac5b93fe))

## [2026.10.5](https://github.com/proconnect-gouv/proconnect-identite/compare/2026.10.4...2026.10.5) (2026-10-12)

### Modifié

- ♻️ Split navigation guard internals into separate files ([#2250](https://github.com/proconnect-gouv/proconnect-identite/issues/2250)) ([880db16](https://github.com/proconnect-gouv/proconnect-identite/commit/880db161477bfbf3c3172c0b75d11e0cb414ca94))
- ♻️ Refactor duplicated guard logic ([#2236](https://github.com/proconnect-gouv/proconnect-identite/issues/2236)) ([1618dd5](https://github.com/proconnect-gouv/proconnect-identite/commit/1618dd57f99ee02eec603bbe120904a269cd6c30))
- ♻️ Let navigation guard redirects handle referrers ([#2241](https://github.com/proconnect-gouv/proconnect-identite/issues/2241)) ([9ad4d90](https://github.com/proconnect-gouv/proconnect-identite/commit/9ad4d9026cd1d9c1bffcbbfc9ece68c642ebaa73))
- 🔧 prefix dependabot commits with gitmoji ([#2238](https://github.com/proconnect-gouv/proconnect-identite/issues/2238)) ([a6afe4d](https://github.com/proconnect-gouv/proconnect-identite/commit/a6afe4d74ab0f466ffff58620bbf28cd0581f91a))
- ♻️ release through proconnect-gouv/release-action ([#2232](https://github.com/proconnect-gouv/proconnect-identite/issues/2232)) ([d0ff665](https://github.com/proconnect-gouv/proconnect-identite/commit/d0ff6655cc29528b1b852b7309fe5a26dff5d046))

### Corrigé

- 🐛 Fix free email domain detection ([#2246](https://github.com/proconnect-gouv/proconnect-identite/issues/2246)) ([d7a9f69](https://github.com/proconnect-gouv/proconnect-identite/commit/d7a9f69111ae9fe6b9c99a38e64258acc0663686))

### Supprimé

- 🔥 delete dead additionalWhereClause/additionalParams from getUsersByOrganization ([#2154](https://github.com/proconnect-gouv/proconnect-identite/issues/2154)) ([6894647](https://github.com/proconnect-gouv/proconnect-identite/commit/6894647574f1482cf9a7064dc5188d09cf9ded2a))

### Divers

- chore(deps): bump peter-evans/create-pull-request from 7 to 8 ([#1638](https://github.com/proconnect-gouv/proconnect-identite/issues/1638)) ([6f03762](https://github.com/proconnect-gouv/proconnect-identite/commit/6f03762f9de1a6197bcd8e764a7622d4769dfa6c))
