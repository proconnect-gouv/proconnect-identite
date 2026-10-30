---
"@proconnect-gouv/proconnect.identite": major
---

Retire `deleteFranceconnectUserinfoFactory` et `upsertFranceconnectUserinfoFactory` (`repositories/franceconnect_userinfo`), exposés aussi par `connectors`. L'application identite relie et délie maintenant une identité FranceConnect avec `connectFranceConnect` et `disconnectFranceConnect` du runtime, qui écrivent la ligne `franceconnect.connected` ou `franceconnect.disconnected` dans la même transaction que la modification.
