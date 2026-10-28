---
"@proconnect-gouv/proconnect.identite": major
---

`getOrganizationInfo` et `processCertificationDirigeant` renvoient leurs issues au lieu d'écrire dans la console ou de lever des erreurs.

Migration :

- `getOrganizationInfo` renvoie un `OrganizationInfoLookup` : faites un `match` sur `kind` au lieu d'attraper `InvalidSiretError`, `NotFoundError` ou `ApiEntrepriseConnectionError`.
  - `found` : les données sont dans `organization_info` ; `rne.kind` vaut `enriched`, ou `failed` avec l'`exception` du registre national des entreprises.
  - `invalid_siret` : le SIRET ou SIREN est mal formé ou refusé par entreprise.api.gouv.fr ; `exception` est une `InvalidSiretError` dont la `cause` porte le refus d'entreprise.api.gouv.fr.
  - `not_diffusible` : l'établissement n'est pas diffusible.
  - `api_entreprise_failed` : entreprise.api.gouv.fr a échoué, avec l'`exception`.
- `processCertificationDirigeant` ajoute `details.source_selection` (`SourceSelection`) : `preferred`, ou `fallback` avec l'`exception` du registre national des entreprises quand les mandataires viennent d'entreprise.api.gouv.fr.
- Les erreurs `InvalidSiretError`, `NotFoundError` et `ApiEntrepriseConnectionError` restent exportées.
