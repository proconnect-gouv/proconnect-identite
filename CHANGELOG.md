# Changelog

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
