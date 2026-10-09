---
"@proconnect-gouv/proconnect.identite": major
---

computeServicePublicInfo est remplacé par computeServicePublicInfoFactory, qui reçoit les listes de @proconnect-gouv/proconnect.annuaire_entreprises en paramètre : la dépendance optionnelle n'est plus importée au chargement du module

```ts
import * as AnnuaireEntreprises from "@proconnect-gouv/proconnect.annuaire_entreprises";
import { computeServicePublicInfoFactory } from "@proconnect-gouv/proconnect.identite/services/organization";

const computeServicePublicInfo =
  computeServicePublicInfoFactory(AnnuaireEntreprises);
```
