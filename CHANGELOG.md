# Changelog

## [2026.10.16](https://github.com/proconnect-gouv/proconnect-identite/compare/2026.10.15...2026.10.16) (2026-10-30)

### Changements

- ✨ enregistrer la demande d'autorisation dès la connexion de l'utilisateur pendant celle-ci, même si elle s'interrompt ensuite
- ✨ vérifier le domaine de l'adresse de contact officielle et rattacher les membres qui l'utilisent dans une seule transaction lorsqu'un utilisateur rejoint une organisation publique
- ✨ garder une trace de chaque vérification de domaine, avec qui l'a faite et quand, y compris lorsqu'un utilisateur rejoint une organisation grâce à l'adresse de contact officielle
- ✨ garder une trace de chaque membre rattaché automatiquement à son organisation lors de la vérification d'un domaine, et de la vérification qui l'a entraîné

### Ajouté

- ✨ journal each member a domain verification promotes ([#2370](https://github.com/proconnect-gouv/proconnect-identite/issues/2370)) ([d3dd8ca](https://github.com/proconnect-gouv/proconnect-identite/commit/d3dd8cada634db4d3ed9a08d3b6f0ff4000ea97c))
- ✨ journal each domain verification in activity_logs ([#2369](https://github.com/proconnect-gouv/proconnect-identite/issues/2369)) ([6971b21](https://github.com/proconnect-gouv/proconnect-identite/commit/6971b2172c4aeeb7a58f121e88d9d4548fbb87b3))
- ✨ verify an official contact domain at join in one transaction through identite.runtime ([#2365](https://github.com/proconnect-gouv/proconnect-identite/issues/2365)) ([e47d7dd](https://github.com/proconnect-gouv/proconnect-identite/commit/e47d7dd69c76c7b8c8dc8094c8ec4ac574278e75))
- ✨ record the authorization request at sign-in ([#2360](https://github.com/proconnect-gouv/proconnect-identite/issues/2360)) ([162a38c](https://github.com/proconnect-gouv/proconnect-identite/commit/162a38c74d367bb370ee6d1866a6df8015989a9e))

### Modifié

- ♻️ return organization lookup and certification outcomes instead of throwing ([#2362](https://github.com/proconnect-gouv/proconnect-identite/issues/2362)) ([da31f6d](https://github.com/proconnect-gouv/proconnect-identite/commit/da31f6d036c7569c0184962bb9bc6d14d12f04a1))

### Supprimé

- 🔥 remove the uncalled legacy domain-verification managers ([#2372](https://github.com/proconnect-gouv/proconnect-identite/issues/2372)) ([a31ca3e](https://github.com/proconnect-gouv/proconnect-identite/commit/a31ca3e90bcd2b874e754159d3597a720f7a62b0))

### Dépendances

- ⬆️ Synchronisation du Grist contenant la liste des administrations ([#2364](https://github.com/proconnect-gouv/proconnect-identite/issues/2364)) ([f3b80f8](https://github.com/proconnect-gouv/proconnect-identite/commit/f3b80f80b43550fda9e2014ea98f1a958ddd7126))
- :arrow_up: Bump systeminformation from 5.31.17 to 5.33.18 ([#2367](https://github.com/proconnect-gouv/proconnect-identite/issues/2367)) ([82f848e](https://github.com/proconnect-gouv/proconnect-identite/commit/82f848e22774a1b60488db166efd3d3962540543))
- :arrow_up: Bump @hono/node-server from 2.0.10 to 2.1.3 ([#2366](https://github.com/proconnect-gouv/proconnect-identite/issues/2366)) ([3bfb9e9](https://github.com/proconnect-gouv/proconnect-identite/commit/3bfb9e99b99311fa1b1f872b391420bf5bb702aa))

### Divers

- 🔊 write each tracked event as one OpenTelemetry-shaped log record ([#2353](https://github.com/proconnect-gouv/proconnect-identite/issues/2353)) ([2b6ef92](https://github.com/proconnect-gouv/proconnect-identite/commit/2b6ef9253b2764624593ca5398c6b03375f7d15f))

## [2026.10.15](https://github.com/proconnect-gouv/proconnect-identite/compare/2026.10.14...2026.10.15) (2026-10-28)

### Changements

- 🔒 Les paramètres « code » et « state » d’une connexion (retour de FranceConnect, déconnexion) ne sont plus transmis à Sentry avec l’adresse des pages : une erreur pendant votre connexion n’y laisse plus de trace de ces valeurs à usage unique.

### Modifié

- 🔧 default Sentry to preview and keep every trace of a local run ([#2355](https://github.com/proconnect-gouv/proconnect-identite/issues/2355)) ([92450e3](https://github.com/proconnect-gouv/proconnect-identite/commit/92450e3f4725508fbba9fcc46de3c9d26b503b73))
- 🔧 tell deployed environments apart in Sentry with SENTRY_ENVIRONMENT ([#2352](https://github.com/proconnect-gouv/proconnect-identite/issues/2352)) ([82b4cab](https://github.com/proconnect-gouv/proconnect-identite/commit/82b4cabe64b933c42cc38957c6506926421f6a6f))

### Corrigé

- 🔒 keep OAuth code and state out of the URLs sent to Sentry ([#2356](https://github.com/proconnect-gouv/proconnect-identite/issues/2356)) ([9501d48](https://github.com/proconnect-gouv/proconnect-identite/commit/9501d48c27522bcadc0f5141b915213fbf791f42))

### Divers

- 🔊 write the request's trace_id on every log line ([#2358](https://github.com/proconnect-gouv/proconnect-identite/issues/2358)) ([4919a12](https://github.com/proconnect-gouv/proconnect-identite/commit/4919a1271eadce69df299915795e1971b8d54dcc))
- 🔊 keep the traces of requests answered with a redirect or a 401/403 ([#2359](https://github.com/proconnect-gouv/proconnect-identite/issues/2359)) ([0aef892](https://github.com/proconnect-gouv/proconnect-identite/commit/0aef892d5d543a5e035bfb9fecbabdc80880a49c))
- 🔊 name the FranceConnect logout callback without state apart from a mismatching one ([#2357](https://github.com/proconnect-gouv/proconnect-identite/issues/2357)) ([c1b7771](https://github.com/proconnect-gouv/proconnect-identite/commit/c1b77715ac144359397e71c9eeb0a8c3a686b5d6))

## [2026.10.14](https://github.com/proconnect-gouv/proconnect-identite/compare/2026.10.13...2026.10.14) (2026-10-28)

### Changements

- ✨ Chaque demande de connexion d'un service n'est plus enregistrée qu'une fois, avec son aboutissement, pour que la modération distingue les connexions terminées des connexions interrompues.

### Ajouté

- ✨ record the interaction and the outcome of each connection ([#2345](https://github.com/proconnect-gouv/proconnect-identite/issues/2345)) ([434653c](https://github.com/proconnect-gouv/proconnect-identite/commit/434653cb36cc334edf2bdf81df47fe4904f4c6cc))

### CI/CD

- 👷 keep the Docker build's npm cache between runs, keyed on the lockfile ([#2349](https://github.com/proconnect-gouv/proconnect-identite/issues/2349)) ([ebe4622](https://github.com/proconnect-gouv/proconnect-identite/commit/ebe46229f88063feaceacfb6da0e00d01368cd7a))
- 👷 cache npm in the release workflow's unprivileged select-mode job ([#2350](https://github.com/proconnect-gouv/proconnect-identite/issues/2350)) ([dd3d01b](https://github.com/proconnect-gouv/proconnect-identite/commit/dd3d01bcf22076765e7b911360326e2177ff9433))

## [2026.10.13](https://github.com/proconnect-gouv/proconnect-identite/compare/2026.10.12...2026.10.13) (2026-10-28)

### Changements

- 🐛 Après avoir quitté une certification dirigeant en cours, une nouvelle connexion à un service ne vous demande plus de vous identifier avec FranceConnect.
- 🐛 Lorsqu’un service accepte une connexion sans identité vérifiée, ProConnect ne vous envoie plus sur la page « Vérifier votre identité » pour vous identifier avec FranceConnect ; et lorsqu’un service exige une identité vérifiée avec FranceConnect, ProConnect vous propose désormais cette page au lieu d’afficher « Erreur access_denied ».
- 🔊 Lorsqu’un service vous envoie vous connecter, chaque page et chaque erreur de ce parcours (connexion, vérification d’identité, choix d’organisation, retour vers le service) porte désormais le même identifiant `oidc.interaction_cid` dans Sentry : quand vous signalez un problème, l’équipe support retrouve tout votre parcours d’un seul coup, au lieu de recouper les erreurs une à une à l’heure près.

### Corrigé

- 🐛 check if FranceConnect is needed at the session AAL, not only AAL 2 ([#2341](https://github.com/proconnect-gouv/proconnect-identite/issues/2341)) ([e2a55e5](https://github.com/proconnect-gouv/proconnect-identite/commit/e2a55e567156fefe4828b447ab6ab6297e5571fc))
- 🐛 stop asking for FranceConnect after an abandoned certification ([#2339](https://github.com/proconnect-gouv/proconnect-identite/issues/2339)) ([240763a](https://github.com/proconnect-gouv/proconnect-identite/commit/240763a5bbde4563f885e098eaf706208b80ec10))

### Divers

- 🔊 write each log as one JSON line ([#2344](https://github.com/proconnect-gouv/proconnect-identite/issues/2344)) ([7022df3](https://github.com/proconnect-gouv/proconnect-identite/commit/7022df318cef59312ed9248466c2706849d577f9))
- 🔊 tag every Sentry event of an authorization request with its interaction cid ([#2343](https://github.com/proconnect-gouv/proconnect-identite/issues/2343)) ([d789f49](https://github.com/proconnect-gouv/proconnect-identite/commit/d789f49dd444ecd2a4c5c1ae102288747ec6b469))

## [2026.10.12](https://github.com/proconnect-gouv/proconnect-identite/compare/2026.10.11...2026.10.12) (2026-10-27)

### Changements

- 🐛 Valider deux fois de suite le code envoyé à l’adresse email officielle ne provoque plus d’erreur 500, et rouvrir une demande de rattachement supprimée entre-temps affiche « Information : aucune demande de rattachement n’est en cours. » au lieu d’un faux succès
- 🐛 Quand les données INSEE sont indisponibles, le formulaire de rattachement n’accuse plus votre SIRET d’être invalide : il affiche « Erreur : les données INSEE de l’organisation, nécessaires pour valider le rattachement, sont indisponibles pour le moment. Merci de réessayer ultérieurement. »

### Modifié

- ♻️ parse org page queries synchronously ([#2332](https://github.com/proconnect-gouv/proconnect-identite/issues/2332)) ([01c66c1](https://github.com/proconnect-gouv/proconnect-identite/commit/01c66c181028877dc0989982db678ae5e65f3276))

### Corrigé

- 🐛 stop calling a SIRET invalid when API Entreprise is down ([#2336](https://github.com/proconnect-gouv/proconnect-identite/issues/2336)) ([eebcb02](https://github.com/proconnect-gouv/proconnect-identite/commit/eebcb02e8ba968bae10d59876bd80f85ceb01e6a))
- 🐛 stop concurrent reopen and code checks from passing twice ([#2331](https://github.com/proconnect-gouv/proconnect-identite/issues/2331)) ([310f6ae](https://github.com/proconnect-gouv/proconnect-identite/commit/310f6ae565286c973b3c86fccafef8cfe7e8caa3))

### Divers

- 🔊 count stale tabs, token replays and passkey failures ([#2338](https://github.com/proconnect-gouv/proconnect-identite/issues/2338)) ([4bf17c5](https://github.com/proconnect-gouv/proconnect-identite/commit/4bf17c5c936e9077d6bf02ea5fc17a3aefcddd3c))
- 🔊 count external-directory fallbacks during join and certification ([#2337](https://github.com/proconnect-gouv/proconnect-identite/issues/2337)) ([7c406eb](https://github.com/proconnect-gouv/proconnect-identite/commit/7c406ebc4554a76ed0b7d209a1d3a609b0d19432))
- 🔊 count CSRF, rate-limit and OIDC rejections ([#2335](https://github.com/proconnect-gouv/proconnect-identite/issues/2335)) ([9cd6976](https://github.com/proconnect-gouv/proconnect-identite/commit/9cd6976432d7979c695be40501c268be17ea83f2))
- 🔊 log and count stale, missing and foreign requests ([#2334](https://github.com/proconnect-gouv/proconnect-identite/issues/2334)) ([0e116a9](https://github.com/proconnect-gouv/proconnect-identite/commit/0e116a9e0d4f1b5143f9424414cc849ec54e313b))

## [2026.10.11](https://github.com/proconnect-gouv/proconnect-identite/compare/2026.10.10...2026.10.11) (2026-10-26)

### Changements

- 🐛 Ouvrir la page de changement de mot de passe sans jeton de réinitialisation redirige désormais vers « Mot de passe oublié » avec le message de lien invalide ou expiré, au lieu d'afficher une erreur 400
- 🔒 Le limiteur de requêtes par e-mail s'arrête désormais à l'erreur quand la session ne contient aucun e-mail, au lieu de laisser la requête continuer sans limitation
- 🐛 Recharger le retour de connexion FranceConnect, ou terminer la déconnexion FranceConnect depuis un autre onglet, ramène désormais à la page de départ avec le message « L'authentification FranceConnect a échoué. Veuillez réessayer. », au lieu d'afficher une erreur 400
- 🐛 Ouvrir une page de rattachement à une organisation (accès restreint, confirmation, rattachement en cours, demande refusée, certification impossible) sans ses paramètres redirige désormais vers « Rejoindre une organisation » avec un message expliquant le problème, au lieu d'afficher une erreur 400, et consulter la demande refusée d'un autre utilisateur affiche une erreur 403 au lieu d'une erreur 500
- 🐛 Un échec d'enregistrement de clé d'accès lors de la configuration de la double authentification ramène désormais au choix de la méthode avec le message « Erreur : votre clé d’accès est invalide. », au lieu d'afficher une page non trouvée
- 🐛 Revenir sur la page de vérification de l'email officiel après avoir rejoint une organisation redirige désormais vers « Rejoindre une organisation » avec un message d'erreur, au lieu d'afficher une page non trouvée, et un code vide ou une adresse email officielle introuvable ramènent aussi vers un message d'erreur au lieu d'une erreur 400 ou 500
- 🐛 Annuler deux fois la même demande de rattachement ramène désormais à la page d’origine avec « Information : aucune demande de rattachement n’est en cours. » au lieu d'afficher une erreur 500, et annuler la demande d'un autre utilisateur affiche une erreur 403 au lieu d'une erreur 500
- 🐛 Quitter deux fois la même organisation, ou sélectionner une organisation que vous venez de quitter, affiche désormais « Information : vous ne faites pas partie de cette organisation. » au lieu d'une erreur 500
- 🚸 Un code composé uniquement d'espaces sur la page de vérification de l'email officiel est désormais refusé par le navigateur avant l'envoi, avec le format attendu, au lieu de recharger la page avec un message d'erreur
- 🐛 Deux annulations simultanées de la même demande de rattachement n’envoient plus deux emails d’annulation : la seconde affiche « Information : aucune demande de rattachement n’est en cours. » au lieu d’un succès
- ❎ Revenir sur la page de choix de l'adresse email officielle après avoir rejoint une organisation ramène désormais vers « Rejoindre une organisation » avec un message d'erreur au lieu d'afficher une page non trouvée, et une mairie sans adresse email officielle valide dans l'Annuaire Service Public affiche « nous n’avons pas trouvé d’adresse email officielle valide pour votre mairie » aussi sur la page de vérification du code, au lieu d'annoncer des données indisponibles

### Corrigé

- 🐛 send one cancellation email when a moderation is cancelled twice at once ([#2330](https://github.com/proconnect-gouv/proconnect-identite/issues/2330)) ([dbec561](https://github.com/proconnect-gouv/proconnect-identite/commit/dbec561f7274074295ac2612a74fd6a4d58bbbc3))
- 🐛 redirect after a double quit or a stale organization pick ([#2324](https://github.com/proconnect-gouv/proconnect-identite/issues/2324)) ([ea9f9f6](https://github.com/proconnect-gouv/proconnect-identite/commit/ea9f9f6d29a7e60a635741f902cda3e2d2b0d92c))
- 🐛 redirect when a cancelled moderation is gone ([#2323](https://github.com/proconnect-gouv/proconnect-identite/issues/2323)) ([3bf6f0a](https://github.com/proconnect-gouv/proconnect-identite/commit/3bf6f0a0e687f7e531ffee83c97ba2a6d3297834))
- 🐛 handle official contact verification errors with redirects ([#2322](https://github.com/proconnect-gouv/proconnect-identite/issues/2322)) ([f9ab0bb](https://github.com/proconnect-gouv/proconnect-identite/commit/f9ab0bba6163f23463d613563e6506195a5a4737))
- 🐛 fix passkey registration error redirect path ([#2321](https://github.com/proconnect-gouv/proconnect-identite/issues/2321)) ([e916cda](https://github.com/proconnect-gouv/proconnect-identite/commit/e916cdafa1becb2c2e9308852334b6001eda3d27))
- 🐛 redirect org pages opened without their query ([#2320](https://github.com/proconnect-gouv/proconnect-identite/issues/2320)) ([499411f](https://github.com/proconnect-gouv/proconnect-identite/commit/499411fb64172ddc3f3673e74db3ce46dc781b7d))
- 🐛 redirect franceconnect callbacks instead of erroring ([#2319](https://github.com/proconnect-gouv/proconnect-identite/issues/2319)) ([8b77657](https://github.com/proconnect-gouv/proconnect-identite/commit/8b77657583d270db106e0c8ce6edcb0bc26eb9c8))
- 🔒 stop email rate limiter after its no-email error ([#2318](https://github.com/proconnect-gouv/proconnect-identite/issues/2318)) ([48d37c4](https://github.com/proconnect-gouv/proconnect-identite/commit/48d37c4fe514622f9740551a7062241a9574bb58))
- 🐛 redirect change-password without reset token instead of erroring ([#2316](https://github.com/proconnect-gouv/proconnect-identite/issues/2316)) ([9f5640a](https://github.com/proconnect-gouv/proconnect-identite/commit/9f5640ad98aae3cfefe61fcb5fe058c2f56baf49))

### Divers

- ✅ test picking an organization just left ([#2329](https://github.com/proconnect-gouv/proconnect-identite/issues/2329)) ([5fe7c9f](https://github.com/proconnect-gouv/proconnect-identite/commit/5fe7c9fb071f5fa540dc126d2a8a981e80ee89ac))
- ✏️ restore no-break spaces in notification texts ([#2328](https://github.com/proconnect-gouv/proconnect-identite/issues/2328)) ([edd6df5](https://github.com/proconnect-gouv/proconnect-identite/commit/edd6df55e2af0057dc24eda22f5e316a593a260c))
- ❎ redirect the official contact pages instead of 404 or a wrong annuaire message ([#2327](https://github.com/proconnect-gouv/proconnect-identite/issues/2327)) ([cbed400](https://github.com/proconnect-gouv/proconnect-identite/commit/cbed4005e74f83ffe80a1f2ec2f101695f91ea6e))
- 🚸 refuse a blank official contact code in the browser ([#2326](https://github.com/proconnect-gouv/proconnect-identite/issues/2326)) ([d47de9c](https://github.com/proconnect-gouv/proconnect-identite/commit/d47de9c28328244f7e30a06af2449ed191a7bf7d))
- 🔊 log the missing reset token on the change password page ([#2325](https://github.com/proconnect-gouv/proconnect-identite/issues/2325)) ([9016a0f](https://github.com/proconnect-gouv/proconnect-identite/commit/9016a0fe759d4b86f4e6f9ee3316389e3c6512a9))

## [2026.10.10](https://github.com/proconnect-gouv/proconnect-identite/compare/2026.10.9...2026.10.10) (2026-10-26)

### Changements

- 🐛 Lors du rattachement à une mairie qui a plusieurs adresses email officielles, l'absence de choix ou un choix inconnu ramène désormais à la question « À quelle adresse e-mail souhaitez-vous recevoir le code ? » au lieu d'afficher une erreur de l'annuaire

### Ajouté

- ✨ validate express session data with zod ([#2242](https://github.com/proconnect-gouv/proconnect-identite/issues/2242)) ([31652e6](https://github.com/proconnect-gouv/proconnect-identite/commit/31652e608dd645911f7cd5710fc5395c81bb8a5f))

### Corrigé

- 🐛 bundle domain lists into core build ([#2313](https://github.com/proconnect-gouv/proconnect-identite/issues/2313)) ([3209f59](https://github.com/proconnect-gouv/proconnect-identite/commit/3209f59646da2171eb8ddad48f8e1d75d996f5d4))
- 🐛 redirect replayed franceconnect logout callback instead of erroring ([#2314](https://github.com/proconnect-gouv/proconnect-identite/issues/2314)) ([65e2916](https://github.com/proconnect-gouv/proconnect-identite/commit/65e2916f48fb3ef5d107fda3f6f9c3880b8166b8))
- 🔒 limit github token permissions in workflows ([#2312](https://github.com/proconnect-gouv/proconnect-identite/issues/2312)) ([63d44d7](https://github.com/proconnect-gouv/proconnect-identite/commit/63d44d79ada7e52cd745b2004e2b79c1a3b0e228))
- 🐛 forbid authorization header on interaction routes ([#2310](https://github.com/proconnect-gouv/proconnect-identite/issues/2310)) ([a9a85ff](https://github.com/proconnect-gouv/proconnect-identite/commit/a9a85ffbcb4ccf4a45d17c547082a22f9be55abe))
- 🐛 ask again which mairie email to use when the choice is skipped or unknown ([#2252](https://github.com/proconnect-gouv/proconnect-identite/issues/2252)) ([0a009f3](https://github.com/proconnect-gouv/proconnect-identite/commit/0a009f33b8c6751943b9c937f1331655400c4a27))
- 🐛 count franceconnect cancellations instead of reporting them as errors ([#2306](https://github.com/proconnect-gouv/proconnect-identite/issues/2306)) ([b2717c0](https://github.com/proconnect-gouv/proconnect-identite/commit/b2717c0be73a88b4495eceddceccf8aca15c2be6))

### Dépendances

- ⬆️ bump postgres to 18.6 ([#2308](https://github.com/proconnect-gouv/proconnect-identite/issues/2308)) ([51244d7](https://github.com/proconnect-gouv/proconnect-identite/commit/51244d74e47f0546aa827ac0b4e1a40284bace62))
- ⬆️ replace ioredis with node-redis for connect-redis 10 ([#2071](https://github.com/proconnect-gouv/proconnect-identite/issues/2071)) ([adaa07b](https://github.com/proconnect-gouv/proconnect-identite/commit/adaa07bbf2bd77967c463ad3c7189c0fa7bceb2f))

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
