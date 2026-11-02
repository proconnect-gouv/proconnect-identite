---
"@proconnect-gouv/proconnect.identite": major
---

Retire `repositories/**`, `connectors` (`createContext`, `Context`, `DatabaseContext`) et `services/postgres` : le contexte lit la base en Drizzle depuis `src/repositories`, et les mutations métier passent par le journal d'activité.
