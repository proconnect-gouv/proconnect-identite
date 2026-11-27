---
"@proconnect-gouv/proconnect.identite.runtime": minor
---

Remplace `getCertificationDirigeantActivity` par `closeMatchDiff(identity, dirigeant)`, qui ne renvoie que le `diff` d’une correspondance partielle : l’application appelle elle-même la procédure `certification_dirigeant.*` qui correspond au résultat de la certification.
