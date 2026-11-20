# Sign-in and organization join flow

How a user goes from the "S'identifier avec ProConnect" button to a session for the service provider (SP).
This document replaces the old flowchart ("Demande d'authentification sur bouton ProConnect").

The diagrams follow the code; when they disagree, the code wins:

- authentication and requirement chain: `src/middlewares/navigation-guards/` (`meta.ts`, `guards.ts`, `process.ts`)
- join rules: `joinOrganization` in `src/managers/organization/join.ts`
- error → page mapping: `postJoinOrganizationMiddleware` in `src/controllers/organization.ts`
- organization categories: `src/services/organization.ts` and `packages/identite/src/services/organization/`

## 1. Overview

Every step is a navigation guard: when a requirement is not met, the guard redirects to the page that fixes it, then the chain runs again from the start.

```mermaid
flowchart TD
  start([Le FS envoie l’utilisateur vers ProConnect]) --> email[/"Saisie de l’email<br>/users/start-sign-in"/]
  email --> emailValid{Email valide ?}
  emailValid -- Non --> email
  emailValid -- Oui --> known{"Compte existant<br>avec un mot de passe ?"}
  known -- Oui --> signIn[/"Connexion : mot de passe, lien magique ou clé d’accès<br>/users/sign-in"/]
  known -- Non --> signUp[/"Choix du mot de passe<br>/users/sign-up"/]
  signIn --> verified
  signUp --> verified
  verified{"Email vérifié récemment<br>et navigateur de confiance ?"}
  verified -- Non --> verifyEmail[/"Saisie du code reçu par email<br>/users/verify-email"/] --> verified
  verified -- Oui --> mfa{"2FA exigée par le FS<br>ou imposée à l’utilisateur ?"}
  mfa -- Oui --> doMfa[/"Connexion 2FA ou configuration de la 2FA"/] --> hasOrg
  mfa -- Non --> hasOrg

  hasOrg{"Membre d’une organisation<br>(et de celle du SIRET indiqué par le FS) ?"}
  hasOrg -- Non --> join[["Rejoindre une organisation<br>(section 2)"]]
  join --> hasOrg
  hasOrg -- Oui --> selected{Organisation sélectionnée ?}
  selected -- "Non, plusieurs organisations" --> select[/"Choix de l’organisation<br>/users/select-organization"/] --> orgMfa
  selected -- "Oui, ou une seule organisation" --> orgMfa
  orgMfa{"L’organisation impose la 2FA ?"}
  orgMfa -- Oui --> doMfa2[/"Connexion 2FA ou configuration de la 2FA"/] --> fc
  orgMfa -- Non --> fc
  fc{"Le FS exige une identité FranceConnect<br>(ou l’identité doit être renouvelée) ?"}
  fc -- Oui --> franceConnect[/"FranceConnect<br>/users/franceconnect"/] --> dirigeant
  fc -- Non --> dirigeant
  dirigeant{"Le FS exige un dirigeant certifié ?"}
  dirigeant -- Oui --> certif[["Certification dirigeant<br>(section 3)"]] --> perso
  dirigeant -- Non --> perso
  perso{"Prénom et nom renseignés ?"}
  perso -- Non --> personal[/"/users/personal-information"/] --> done
  perso -- Oui --> done([Session transmise au FS])
```

After a new membership, the user also sees `/users/welcome` and gets the "Votre compte ProConnect a bien été créé" email (no email for certified dirigeants).

## 2. Joining an organization

The user lands on `/users/join-organization`. If the email domain matches organizations already known to ProConnect, and the SP gave no SIRET hint, `/users/organization-suggestions` is shown first.

The rules below run in this order; the first one that matches decides.
"Free email" means a webmail address (gmail.com, orange.fr…), see `usesAFreeEmailProvider`.

```mermaid
flowchart TD
  siret[/"Saisie du SIRET<br>/users/join-organization"/] --> found{"SIRET trouvé dans l’INSEE<br>et organisation active ?"}
  found -- Non --> siretErr["Notification : SIRET invalide<br>(ou INSEE indisponible)"] --> siret

  found -- Oui --> already{Déjà membre ?}
  already -- Oui --> alreadyErr["Notification : déjà membre"] --> siret
  already -- Non --> pendingMod{"Modération de rattachement en cours ?"}
  pendingMod -- Oui --> pendingPage["Demande en cours de traitement<br>/users/unable-to-auto-join-organization"]
  pendingMod -- Non --> rejectedMod{"Modération de rattachement refusée ?"}
  rejectedMod -- Oui --> rejectedPage["/users/moderation-rejected"]
  rejectedMod -- Non --> whitelist{"Organisation réservée à certains domaines<br>(DOMAINS_WHITELIST) et domaine absent ?"}
  whitelist -- Oui --> whitelistPage["/users/domain-not-allowed-for-organization"]
  whitelist -- Non --> refused{"Domaine refusé pour cette organisation ?"}
  refused -- Oui --> refusedPage["/users/domain-refused-for-organization"]
  refused -- Non --> gouv{"Domaine gouv.fr et l’organisation<br>n’est pas un service public ?"}
  gouv -- Oui --> gouvPage["/users/access-restricted-to-private-sector-email"]
  gouv -- Non --> certifReq{"Le FS exige un dirigeant certifié ?"}
  certifReq -- Oui --> certif[["Certification dirigeant<br>(section 3)"]]

  certifReq -- Non --> eu{"Entreprise unipersonnelle ?<br>(EI, SARL, SAS de 0 à 2 salariés)"}
  eu -- Oui --> joined([Rattachement créé])
  eu -- Non --> asso{"Petite association<br>(moins de 50 salariés) et email gratuit ?"}
  asso -- Oui --> joined
  asso -- Non --> small{"Petite exploitation agricole ou SCI<br>(0 à 2 salariés) et email gratuit ?"}
  small -- Oui --> joined
  small -- Non --> publicFree{"Email gratuit et service public autre<br>qu’une commune, une communauté de communes<br>ou un petit établissement public ?"}
  publicFree -- Oui --> publicPage["/users/access-restricted-to-public-sector-email"]
  publicFree -- Non --> big{"Email gratuit, 50 salariés ou plus,<br>pas un petit établissement public,<br>pas encore confirmé ?"}
  big -- Oui --> confirm[/"Confirmation du choix<br>/users/join-organization-confirm"/] --> siret
  big -- Non --> kind{"Type d’organisation ?"}

  kind -- "Commune (hors école)" --> communeEmails["Récupération des emails de contact<br>dans l’Annuaire Service Public<br>(leurs domaines non gratuits deviennent<br>des domaines official_contact de la commune)"]
  communeEmails --> communeSame{"L’email est un email de contact,<br>ou partage le domaine non gratuit<br>d’un email de contact ?"}
  communeSame -- Oui --> joined
  communeSame -- Non --> communeFree{"Email gratuit et au moins<br>un email de contact valide ?"}
  communeFree -- Oui --> code[["Code envoyé au contact officiel<br>(section 4)"]]
  communeFree -- Non --> domain

  kind -- "École publique<br>(collège, lycée, école)" --> schoolEmail["Récupération de l’email de contact<br>dans l’Annuaire de l’Éducation nationale"]
  schoolEmail --> schoolSame{"L’email est l’email de contact ?"}
  schoolSame -- Oui --> joined
  schoolSame -- Non --> schoolValid{"Email de contact valide ?"}
  schoolValid -- Oui --> code
  schoolValid -- Non --> domain

  kind -- Autre --> domain
  domain{"Domaine de l’email approuvé pour l’organisation ?<br>(verified, official_contact,<br>trackdechets_postal_mail, external)"}
  domain -- Oui --> joined
  domain -- Non --> bypass{"FEATURE_BYPASS_MODERATION activé ?"}
  bypass -- Oui --> joined
  bypass -- Non --> notYet{"Domaine de l’email connu<br>mais pas encore vérifié ?"}
  notYet -- Oui --> joinedMod(["Rattachement créé<br>+ modération non bloquante<br>du domaine"])
  notYet -- Non --> moderation[["Modération bloquante<br>(section 5)"]]
```

When the Annuaire APIs are unavailable or have no contact, the commune or school rules are skipped and the next rules apply.

## 3. Dirigeant certification

Used when the SP requests the dirigeant ACR (`certificationDirigeantRequested`), and to renew an expired certification.

```mermaid
flowchart TD
  start([Certification dirigeant demandée]) --> fc{"Identité FranceConnect valide ?"}
  fc -- Non --> franceConnect[/"FranceConnect<br>/users/franceconnect"/] --> fc
  fc -- Oui --> covered{"Catégorie juridique couverte ?<br>(isOrganizationCoveredByCertificationDirigeant)"}
  covered -- Non --> notCovered["/users/certification-dirigeant/organization-not-covered-error"]
  covered -- Oui --> match{"L’identité FranceConnect correspond<br>à un dirigeant du RNE<br>(INSEE à défaut) ?"}
  match -- Oui --> joined(["Rattachement créé ou renouvelé<br>en organization_dirigeant"])
  match -- "Correspondance approchante" --> close["/users/certification-dirigeant/close-match-error"]
  match -- Non --> noMatch["/users/certification-dirigeant/no-match-error"]
```

## 4. Official contact code

For communes and public schools, when the user's email is not the one listed in the Annuaire.

```mermaid
flowchart TD
  start([Vérification par le contact officiel]) --> several{"Commune avec plusieurs<br>emails de contact ?"}
  several -- Oui --> choose[/"Choix de l’email de contact<br>/users/official-contact-ask-which-email"/] --> send
  several -- Non --> send["Code envoyé à l’email du contact officiel<br>/users/official-contact-email-verification"]
  send --> enter[/"Saisie du code par l’utilisateur"/]
  enter --> ok{"Code valide et non expiré ?"}
  ok -- Non --> enter
  ok -- Oui --> joined([Rattachement créé])
  send -. "Annuaire indisponible<br>ou contact introuvable" .-> back["Retour à /users/join-organization<br>avec une notification"]
```

## 5. Moderation

```mermaid
flowchart TD
  start([Aucune règle automatique ne s’applique]) --> perso{"Prénom et nom renseignés ?"}
  perso -- Non --> personal[/"/users/personal-information"/] --> perso
  perso -- Oui --> open["Ouverture d’une modération organization_join_block<br>+ conversation Crisp"]
  open --> page["Demande en cours de traitement<br>/users/unable-to-auto-join-organization"]
  page --> review{"Décision de l’équipe support"}
  review -- Acceptée --> joined([Rattachement créé, utilisateur notifié])
  review -- Refusée --> rejected["Tentative suivante : /users/moderation-rejected"]
```

From the pending page, the user can cancel the request to change their email, their name or the organization.
The support team decides in a separate back-office, outside this repository.
