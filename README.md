# 🔑 ProConnect Identité

ProConnect Identité est un fournisseur d'identité "OpenId Connect" géré par la DINUM.

Pour les professionnels n’ayant pas de fournisseur d’identité attitré dans la fédération ProConnect,
la DINUM met à disposition un compte dans ProConnect Identité.
Ainsi, toute personne affiliée à une organisation enregistrée à l'INSEE, c'est-à-dire ayant un SIRET, peut utiliser une identité fournie par la DINUM au sein de la fédération ProConnect.

Pour vous intégrer la fédération ProConnect, merci de vous référer à [notre documentation en ligne](https://github.com/numerique-gouv/proconnect-documentation).

⚠️ ProConnect Identité n'est plus utilisable en dehors de [la fédération ProConnect](https://www.proconnect.gouv.fr/).

## 1. 🗺️ Tester le parcours

Pour tester le parcours de connexion ProConnect Identité, vous pouvez utiliser notre plateforme dédiée : https://test.identite.proconnect.gouv.fr/.

Vous pouvez utiliser le compte de test suivant :

- identifiant : user@yopmail.com
- mot de passe : user@yopmail.com

Cette plateforme utilise de vraies données ouvertes de l'INSEE pour les données des organisations.

Elle n’est cependant connectée à aucun environment de production.

Ainsi, vous pouvez vous créer n’importe quel compte utilisateur en entrant n’importe quel numéro SIRET et en utilisant des emails jetables `yopmail.com`.

À noter que les emails reçus sur les adresses en yopmail.com sont accessibles sur : http://yopmail.com/.

Voici 2 scénarios que vous pouvez tester sur cet environnement :

- entreprise unipersonnelle : créer un compte avec une adresse email jetable, puis utiliser le SIRET d'une organisation unipersonnelle ;
- [commune de Clarmart](https://annuaire-entreprises.data.gouv.fr/entreprise/commune-de-clamart-219200235) : vous pouvez directement rejoindre cette commune avec un compte utilisant un email sur le domaine `yopmail.com`.

## 2. 📚 Documentation technique

### 2.1. 🎯 Périmètres de données disponibles (scopes)

Afin d'effectuer les développements sur votre service en ligne, nous fournissons un environnement de test pour vous permettre d'effectuer des tests de bout en bout.

Afin de configurer votre module ou votre client OpenId Connect, vous trouverez ci-dessous les paramètres de configuration spécifiques à ProConnect Identité :

- paramètres de configuration de l’instance de test : https://identite-sandbox.proconnect.gouv.fr/.well-known/openid-configuration
- paramètres de configuration de l’instance de production : https://identite.proconnect.gouv.fr/.well-known/openid-configuration
- Les périmètres de données (scope) disponibles sont les suivants :
- `openid` (données : sub)
- `email` (données : email, email_verified)
- `profile` (données : family_name, given_name, updated_at, job)
- `organization` (données : label, siret, is_commune, is_external, is_public_service)

### 2.2. 🔚 Exemple des données retournées par l’endpoint GET /userinfo du serveur OpenID

```json
{
  "sub": "154",
  "email": "jean.valjean-mairie@wanadoo.fr",
  "email_verified": true,
  "family_name": "Valjean",
  "given_name": "Jean",
  "job": "Secrétaire de mairie",
  "updated_at": "2023-06-15T16:17:05.958Z",
  "label": "Commune de les martres sur morge - Mairie",
  "siret": "21630215800011",
  "is_commune": true,
  "is_public_service": true,
  "is_external": true
}
```

> NB : `is_external` vaut `true` lorsque l’utilisateur est externe à l’organisation (ex : prestataire, sous-traitant, mandataire, etc.)
> NB : si `is_commune` vaut `true` alors `is_public_service` vaut `true` également
> NB : ProConnect Identité vérifie systématiquement les adresses emails, en conséquence `email_verified` vaut toujours `true`

### 2.3. 🔓 Déconnexion

Lorsqu'un utilisateur se déconnecte de votre plateforme, il se peut qu'il soit toujours connecté à ProConnect Identité. Ainsi,
si votre utilisateur utilise un poste partagé, une autre personne pourrait utiliser la session ProConnect Identité et récupérer
les informations de l'utilisateur initial dans votre service. Il convient d'effectuer une déconnexion simultanée sur
ProConnect Identité et sur votre service.

Vous pouvez tester la cinématique de déconnexion via le lien suivant : https://test.identite.proconnect.gouv.fr/#logout

Afin d'effectuer une déconnexion simultanée, il faut rediriger l'utilisateur vers la route de déconnexion de ProConnect Identité :

https://identite-sandbox.proconnect.gouv.fr/oauth/logout?post_logout_redirect_uri=https%3A%2F%2Ftest.identite.proconnect.gouv.fr%2F&client_id=client_id

### 2.4. 🏛️ Permettre à l'utilisateur de sélectionner une autre organisation

Les utilisateurs peuvent représenter plusieurs organisations dans ProConnect Identité.
Au moment de se connecter à votre service, ProConnect Identité demande à l'utilisateur de choisir l'organisation qu’il souhaite représenter.

Si vous souhaitez donner la possibilité à l’utilisateur de représenter une autre organisation sans qu’il ait besoin de
se reconnecter, vous pouvez demander l’interface de sélection d’organisation à ProConnect Identité.

Vous pouvez tester la cinématique via le lien suivant : https://test.identite.proconnect.gouv.fr/#select-organization

Pour ce faire, vous pouvez rediriger l'utilisateur sur la route authorize avec le paramètre `prompt=select_organization` comme suit :

https://identite-sandbox.proconnect.gouv.fr/oauth/authorize?client_id=client_id&scope=openid%20email%20profile%20organization&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin-callback&prompt=select_organization

### 2.5. 🔎 Permettre à l'utilisateur de mettre à jour ses informations

Les utilisateurs peuvent avoir commis des erreurs lors de la constitution de leur identité sur ProConnect Identité.

Si vous souhaitez donner l’opportunité à l’utilisateur de mettre à jour ses informations utilisateurs sans qu’il ait besoin
de se reconnecter, vous pouvez demander l’interface de mise à jour des informations personnelles à ProConnect Identité.

Vous pouvez tester la cinématique via le lien suivant : https://test.identite.proconnect.gouv.fr/#update-userinfo

Pour ce faire, vous pouvez rediriger l'utilisateur sur la route authorize avec le paramètre `prompt=update_userinfo` comme suit :

https://identite-sandbox.proconnect.gouv.fr/oauth/authorize?client_id=client_id&scope=openid%20email%20profile%20organization&response_type=code&redirect_uri=https%3A%2F%2Ftest.identite.proconnect.gouv.fr%2Flogin-callback&prompt=update_userinfo

### 2.6. 🚪 Exiger une ré-authentification

Certaines fonctionnalités sensibles requièrent d’authentifier l'utilisateur à nouveau pour réduire les risques
d’usurpations d’identités liés à la durée de session de ProConnect Identité.

Vous pouvez tester la cinématique via le lien suivant : https://test.identite.proconnect.gouv.fr/#force-login

Pour ce faire, vous devez passer les paramètres `prompt=login` et `claims={"id_token":{"auth_time":{"essential":true}}}` comme suit :

https://identite-sandbox.proconnect.gouv.fr/oauth/authorize?client_id=client_id&scope=openid%20email%20profile%20organization&response_type=code&redirect_uri=https%3A%2F%2Ftest.identite.proconnect.gouv.fr%2Flogin-callback&claims=%7B%22id_token%22%3A%7B%22auth_time%22%3A%7B%22essential%22%3Atrue%7D%7D%7D&prompt=login

Afin de s’assurer que l’utilisateur s’est bien ré-authentifié, il est impératif que votre service vérifie la valeur `auth_time`
retournée dans l’ID token. Si la date est supérieure à 5 minutes, l’utilisateur ne s'est pas reconnecté récemment et vous
devez recommencer la cinématique.

### 2.7. 💡 Connaître les méthodes d'authentification utilisées

Pour éviter à un usager d’avoir à s’authentifier auprès de votre service avec un second facteur alors qu’il a déjà utilisé une authentification multi-facteur dans ProConnect Identité,
il est possible de récupérer via le claim `amr` la liste des méthodes d’authentification et d’adapter votre parcours en fonction.

Par défaut ce claim `amr` n’est pas retourné dans l’IdToken, il doit être demandé explicitement.
Pour ce faire, vous devez passer les paramètres `prompt=login` et `claims={"id_token":{"auth_time":{"essential":true}}}` comme suit :

https://identite-sandbox.proconnect.gouv.fr/oauth/authorize?client_id=client_id&scope=openid%20email%20profile%20organization&response_type=code&redirect_uri=https%3A%2F%2Ftest.identite.proconnect.gouv.fr%2Flogin-callback&claims=%7B%22id_token%22%3A%7B%22amr%22%3A%7B%22essential%22%3Atrue%7D%7D%7D

ProConnect Identité peut renvoyer une combinaison des valeurs suivantes :

| valeur amr | description                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| pwd        | Authentification par mot de passe. En complément d’un mot de passe, l’utilisateur a authentifié son navigateur avec un otp envoyé par mail |
| mail       | Authentification par lien de connexion « lien magique ».                                                                                   |
| totp       | Authentification avec une application « authenticator » comme FreeOTP.                                                                     |
| pop        | Authentification avec une clé d’accès (Passkey).                                                                                           |
| mfa        | Authentification a deux facteurs.                                                                                                          |

Vous trouverez de plus amples informations sur la [documentation de FranceConnect](https://docs.partenaires.franceconnect.gouv.fr/fs/fs-technique/fs-technique-amr/#quels-sont-les-differents-methodes-d-authentification-qui-peuvent-etre-utilisees).

### 2.8. 📲 Exiger une authentification double facteur

Certaines fonctionnalités sensibles requièrent une authentification à double facteur pour réduire les risques
d’usurpations d’identités liés aux attaques par _phishing_ par exemple.

Vous pouvez tester la cinématique via le lien suivant : https://test.identite.proconnect.gouv.fr/#force-2fa

Pour ce faire, vous devez passer les paramètres `claims={"id_token":{"acr":{"essential":true,value:"https://proconnect.gouv.fr/assurance/consistency-checked-2fa"}}}` comme suit :

https://identite-sandbox.proconnect.gouv.fr/oauth/authorize?client_id=client_id&scope=openid%20email%20profile%20organization&response_type=code&redirect_uri=https%3A%2F%2Ftest.identite.proconnect.gouv.fr%2Flogin-callback&claims=%7B%22id_token%22%3A%7B%22acr%22%3A%7B%22essential%22%3Atrue%2C%22value%22%3A%22https%3A%2F%2Frefeds.org%2Fprofile%2Fmfa%22%7D%7D%7D

Les valeurs `acr` utilisées par ProConnect Identité sont les suivantes :

- `eidas1` niveau historique sans signification particulière qui sera remplacé par les valeurs plus détaillées qui suivent ;
- `https://proconnect.gouv.fr/assurance/self-asserted` : identité déclarative ;
- `https://proconnect.gouv.fr/assurance/self-asserted-2fa` : identité déclarative ;
- `https://proconnect.gouv.fr/assurance/consistency-checked` : identité déclarative + un des tests de cohérence suivant :
  - contrôle du référencement du nom de domaine
  - code à usage unique envoyé par courrier postal au siège social
  - code à usage unique envoyé par email à l'adresse de contact référencée dans un annuaire de référence
  - identité du dirigeant d'association conforme
- `https://proconnect.gouv.fr/assurance/consistency-checked-2fa` : `https://proconnect.gouv.fr/assurance/consistency-checked` + authentification à double facteur
- `https://proconnect.gouv.fr/assurance/certification-dirigeant` : pour activer la certification dirigeant

## 3. 👋 Contribuer à ProConnect Identité

Pour contribuer à ProConnect Identité, vous pouvez installer l’application localement.

Les instructions se trouvent sur [la page de doc dédiée](./installation.md).

## Packages

| Package                                                               | Version                                                                                                                                                        | Downloads                                                                                 | Changelog                                       |
| :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- | :---------------------------------------------- |
| [@gouvfr-lasuite/proconnect.core](./packages/core#readme)             | [![npm](https://img.shields.io/npm/v/@gouvfr-lasuite/proconnect.core.svg?logo=npm)](https://www.npmjs.com/package/@gouvfr-lasuite/proconnect.core)             | ![Downloads](https://img.shields.io/npm/dw/@gouvfr-lasuite/proconnect.core?label=↓)       | [Changelog](./packages/core/CHANGELOG.md)       |
| [@gouvfr-lasuite/proconnect.crisp](./packages/crisp#readme)           | [![npm](https://img.shields.io/npm/v/@gouvfr-lasuite/proconnect.crisp.svg?logo=npm)](https://www.npmjs.com/package/@gouvfr-lasuite/proconnect.crisp)           | ![Downloads](https://img.shields.io/npm/dw/@gouvfr-lasuite/proconnect.crisp?label=↓)      | [Changelog](./packages/crisp/CHANGELOG.md)      |
| [@gouvfr-lasuite/proconnect.debounce](./packages/debounce#readme)     | [![npm](https://img.shields.io/npm/v/@gouvfr-lasuite/proconnect.debounce.svg?logo=npm)](https://www.npmjs.com/package/@gouvfr-lasuite/proconnect.debounce)     | ![Downloads](https://img.shields.io/npm/dw/@gouvfr-lasuite/proconnect.debounce?label=↓)   | [Changelog](./packages/debounce/CHANGELOG.md)   |
| [@gouvfr-lasuite/proconnect.email](./packages/email#readme)           | [![npm](https://img.shields.io/npm/v/@gouvfr-lasuite/proconnect.email.svg?logo=npm)](https://www.npmjs.com/package/@gouvfr-lasuite/proconnect.email)           | ![Downloads](https://img.shields.io/npm/dw/@gouvfr-lasuite/proconnect.email?label=↓)      | [Changelog](./packages/email/CHANGELOG.md)      |
| [@gouvfr-lasuite/proconnect.entreprise](./packages/entreprise#readme) | [![npm](https://img.shields.io/npm/v/@gouvfr-lasuite/proconnect.entreprise.svg?logo=npm)](https://www.npmjs.com/package/@gouvfr-lasuite/proconnect.entreprise) | ![Downloads](https://img.shields.io/npm/dw/@gouvfr-lasuite/proconnect.entreprise?label=↓) | [Changelog](./packages/entreprise/CHANGELOG.md) |
| [@gouvfr-lasuite/proconnect.identite](./packages/identite#readme)     | [![npm](https://img.shields.io/npm/v/@gouvfr-lasuite/proconnect.identite.svg?logo=npm)](https://www.npmjs.com/package/@gouvfr-lasuite/proconnect.identite)     | ![Downloads](https://img.shields.io/npm/dw/@gouvfr-lasuite/proconnect.identite?label=↓)   | [Changelog](./packages/entreprise/CHANGELOG.md) |
