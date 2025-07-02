---
"@gouvfr-lasuite/proconnect.core": minor
---

✨ Ajouter l'export du dossier data pour permettre l'import direct des domaines d'emails gratuits les plus utilisés

Cette modification permet aux outils externes (comme hyyypertool) d'importer directement les données de domaines d'emails gratuits sans avoir besoin de dupliquer les listes.

**Nouveaux exports disponibles :**
- `@gouvfr-lasuite/proconnect.core/data` - export barrel pour toutes les données

**Utilisation :**
```typescript
import { mostUsedFreeEmailDomains } from "@gouvfr-lasuite/proconnect.core/data";
```

Cette amélioration résout la dette technique de migration et centralise la gestion des domaines d'emails gratuits.
