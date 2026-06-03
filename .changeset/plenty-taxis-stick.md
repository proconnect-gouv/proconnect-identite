---
"@proconnect-gouv/proconnect.identite": minor
---

♻️ Les exports `*Types` sont renommés selon une convention uniforme : tableaux `as const` → `*Values`, schémas Zod → `*Enum`.

| Avant                                   | Après                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| `LinkTypes`                             | `LinkEnum`                                                                      |
| `StrongLinkTypes`                       | `StrongLinkValues`                                                              |
| `WeakLinkTypes`                         | `WeakLinkValues`                                                                |
| `SuperWeakLinkTypes`                    | `SuperWeakLinkValues` + `SuperWeakLinkEnum`                                     |
| `UnverifiedLinkTypes`                   | `UnverifiedLinkValues` + `UnverifiedLinkEnum`                                   |
| `EmailDomainApprovedVerificationTypes`  | `EmailDomainApprovedVerificationEnum`                                           |
| `EmailDomainPendingVerificationTypes`   | `EmailDomainPendingVerificationValues` + `EmailDomainPendingVerificationEnum`   |
| `EmailDomainRejectedVerificationTypes`  | `EmailDomainRejectedVerificationValues` + `EmailDomainRejectedVerificationEnum` |
| `EmailDomainNoPendingVerificationTypes` | `EmailDomainNoPendingVerificationEnum`                                          |
| `EmailDomainVerificationTypes`          | `EmailDomainVerificationEnum`                                                   |
