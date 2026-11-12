---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

`activityContextSchemas` ne décrit plus l’action `domain.removed` : aucune commande du runtime ne l’écrit. Une application qui journalise `domain.removed` la déclare dans ses propres `OwnContexts`, et `record()` l’accepte à nouveau. Changement cassant pour le typage : `ActivityContexts["domain.removed"]` n’existe plus.
