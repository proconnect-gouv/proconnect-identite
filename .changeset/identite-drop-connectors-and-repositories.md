---
"@proconnect-gouv/proconnect.identite": major
---

Retire les sous-chemins `connectors` et `repositories` : les fabriques de repositories, leur câblage et le type `Context` vivent maintenant dans l'application, derrière la même interface `context.repository`.
