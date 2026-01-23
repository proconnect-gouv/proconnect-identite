# @proconnect-gouv/proconnect.identite.database

## 1.1.0

### Minor Changes

- [#1701](https://github.com/proconnect-gouv/proconnect-identite/pull/1701) [`bd4edba`](https://github.com/proconnect-gouv/proconnect-identite/commit/bd4edba10eb1b3ad5093f2ce26578d3f6ff5377c) Thanks [@douglasduteil](https://github.com/douglasduteil)! - 🗃️ users_organizations.verification_type ne peut plus être null

## 1.0.0

### Major Changes

- [#1577](https://github.com/proconnect-gouv/proconnect-identite/pull/1577) [`e2cc9d1`](https://github.com/proconnect-gouv/proconnect-identite/commit/e2cc9d1fec67acb4f6bf7bb437bf78da8f816c3f) Thanks [@arnaud-robin](https://github.com/arnaud-robin)! - ✨ Ajout du champs birthcountry

## 0.1.0

### Minor Changes

- [#1544](https://github.com/proconnect-gouv/proconnect-identite/pull/1544) [`c37cbeb`](https://github.com/proconnect-gouv/proconnect-identite/commit/c37cbeb0ef833a3f3704ad83af3147f6a64cd428) Thanks [@rebeccadumazert](https://github.com/rebeccadumazert)! - Ajoute la table email_deliverability_whitelist afin que le support puisse gérer la whitelist des domaines email

- [#1526](https://github.com/proconnect-gouv/proconnect-identite/pull/1526) [`f1c0907`](https://github.com/proconnect-gouv/proconnect-identite/commit/f1c0907cfcb2e931d229f51b60abd42302dc6d2a) Thanks [@douglasduteil](https://github.com/douglasduteil)! - ✨ Ajoute le champ status à la table modérations pour suivre l'état des modérations (en attente, approuvée, rejetée, inconnu)

  Par défaut, toutes les modérations ont le statut inconnu : les données de la table ne permettent pas de savoir si une modération a été approuvée ou rejetée.
