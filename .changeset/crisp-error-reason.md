---
"@proconnect-gouv/proconnect.crisp": patch
---

Ajoute la raison renvoyée par Crisp (par exemple `invalid_data`) au message d'erreur quand le statut HTTP n'est pas OK. Un corps qui n'est pas du JSON, comme une page HTML, n'est pas recopié.
