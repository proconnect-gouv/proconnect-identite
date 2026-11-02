---
"@proconnect-gouv/proconnect.identite": major
---

Retire `repositories/**`, `connectors` (`createContext`, `Context`, `DatabaseContext`) et `services/postgres` : le contexte de l'application lit et écrit la base en Drizzle depuis `src/repositories`, avec la même API `context.repository.<table>.<fn>`.
