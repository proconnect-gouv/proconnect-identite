---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

`activityContextSchemas` ne décrit plus l’action `domain.removed` : le runtime ne la possède plus, car seul hyyypertool l’écrit. Une application qui journalise `domain.removed` la déclare dans ses propres `OwnContexts`, et `record()` l’accepte à nouveau. Changement cassant pour le typage : `ActivityContexts["domain.removed"]` n’existe plus.
