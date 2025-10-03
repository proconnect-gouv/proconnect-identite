---
"@gouvfr-lasuite/proconnect.identite": minor
---

✨ Ajout de la fonction `isPublicService` pour identifier les services publics

Nouvelle fonction exportée permettant de déterminer si une organisation est un service public en fonction de sa nature juridique, son statut administratif et des listes de référence officielles.

Inspirée par https://github.com/annuaire-entreprises-data-gouv-fr/search-infra/blob/f1e56ac476b0b1730115f7b1f0667e8509ee5379/workflows/data_pipelines/elasticsearch/data_enrichment.py#L155-L189

```
import { isPublicService } from "@gouvfr-lasuite/proconnect.identite/services/organization";

isPublicService(my_oganization) =>> true/false
```
