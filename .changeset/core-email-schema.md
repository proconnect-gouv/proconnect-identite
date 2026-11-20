---
"@proconnect-gouv/proconnect.core": major
---

Remplace `isEmailValid` et `isDomainValid` (`security`) par les objets `Email` et `Domain` (et leurs types du même nom) : `Email.parse` / `Email.safeParse` et `Domain.parse` / `Domain.safeParse` normalisent la valeur (`trim`, minuscules), vérifient sa forme et le TLD, puis renvoient les types marqués `Email` et `Domain` ; `Email.isValid` et `Domain.isValid` gardent la vérification sans normalisation. Un TLD inconnu produit une issue `custom` dont `params.cause` garde l'erreur de `tld-extract`. `Domain.isValid` refuse en plus les libellés vides (`bad..fr`) et les domaines sans point.
