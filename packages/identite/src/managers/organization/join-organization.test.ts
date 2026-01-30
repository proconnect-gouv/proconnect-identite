import type { EmailDomain, Organization } from "#src/types";
import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { joinOrganization, type JoinContext } from "./join-organization.js";

function createContext(overrides: Partial<JoinContext> = {}): JoinContext {
  const defaultOrganization: Partial<Organization> = {
    cached_est_active: true,
    cached_libelle_categorie_juridique: "Société à responsabilité limitée",
    cached_tranche_effectifs: "12",
    siret: "12345678901234",
  };

  return {
    contactEmail: null,
    domain: "example.com",
    featureBypassModeration: false,
    isContactDomainFree: true,
    isContactEmailSameDomain: false,
    isContactEmailValid: false,
    isFreeEmailProvider: false,
    organization: {
      ...defaultOrganization,
      ...overrides.organization,
    } as Organization,
    organizationEmailDomains: [],
    userEmail: "user@example.com",
    userHasConfirmed: false,
    ...overrides,
  };
}

suite("joinOrganization", () => {
  suite("organization-only checks", () => {
    test("returns error when organization is not active", () => {
      const result = joinOrganization(
        createContext({
          organization: { cached_est_active: false } as Organization,
        }),
      );

      assert.deepEqual(result, {
        type: "error",
        reason: "organization_not_active",
      });
    });

    test("returns link for entreprise unipersonnelle", () => {
      const result = joinOrganization(
        createContext({
          organization: {
            cached_est_active: true,
            cached_libelle_categorie_juridique: "Entrepreneur individuel",
            cached_tranche_effectifs_unite_legale: "00",
          } as Organization,
        }),
      );

      assert.deepEqual(result, {
        type: "link",
        verification_type:
          "no_verification_means_for_entreprise_unipersonnelle",
      });
    });

    test("returns link for small association", () => {
      const result = joinOrganization(
        createContext({
          organization: {
            cached_est_active: true,
            cached_libelle_categorie_juridique: "Association déclarée",
            cached_tranche_effectifs: "12",
          } as Organization,
        }),
      );

      assert.deepEqual(result, {
        type: "link",
        verification_type: "no_verification_means_for_small_association",
      });
    });
  });

  suite("domain validation checks", () => {
    test("returns error when domain is not allowed for organization", () => {
      const result = joinOrganization(
        createContext({
          organization: {
            cached_est_active: true,
            siret: "11000201100044",
          } as Organization,
          domain: "unauthorized.com",
        }),
      );

      assert.deepEqual(result, {
        type: "error",
        reason: "domain_not_allowed",
      });
    });

    test("returns error when domain is explicitly refused", () => {
      const result = joinOrganization(
        createContext({
          domain: "refused.com",
          organizationEmailDomains: [
            {
              domain: "refused.com",
              verification_type: "refused",
            } as EmailDomain,
          ],
        }),
      );

      assert.deepEqual(result, {
        type: "error",
        reason: "domain_refused",
      });
    });

    test("returns error when using gouv.fr domain for private organization", () => {
      const result = joinOrganization(
        createContext({
          organization: {
            cached_est_active: true,
            cached_categorie_juridique: "5710",
          } as Organization,
          domain: "example.gouv.fr",
        }),
      );

      assert.deepEqual(result, {
        type: "error",
        reason: "gouv_fr_domain_forbidden_for_private_org",
      });
    });

    test("allows gouv.fr domain for public service", () => {
      const result = joinOrganization(
        createContext({
          organization: {
            cached_est_active: true,
            cached_categorie_juridique: "7120",
            cached_etat_administratif: "A",
          } as Organization,
          domain: "example.gouv.fr",
        }),
      );

      assert.notEqual(result.type, "error");
    });
  });

  suite("public service email requirements", () => {
    test("returns error when public service user uses free email", () => {
      const result = joinOrganization(
        createContext({
          organization: {
            cached_est_active: true,
            cached_categorie_juridique: "7120",
            cached_etat_administratif: "A",
          } as Organization,
          isFreeEmailProvider: true,
        }),
      );

      assert.deepEqual(result, {
        type: "error",
        reason: "public_service_requires_professional_email",
      });
    });

    test("allows free email for syndicat communal", () => {
      const result = joinOrganization(
        createContext({
          organization: {
            cached_est_active: true,
            cached_categorie_juridique: "7120",
            cached_etat_administratif: "A",
            cached_libelle_categorie_juridique:
              "Syndicat intercommunal à vocation unique (SIVU)",
          } as Organization,
          isFreeEmailProvider: true,
        }),
      );

      if (result.type === "error") {
        assert.notEqual(
          result.reason,
          "public_service_requires_professional_email",
        );
      }
    });
  });

  suite("large organization confirmation", () => {
    test("returns needs_confirmation for large organization with free email", () => {
      const result = joinOrganization(
        createContext({
          organization: {
            cached_est_active: true,
            cached_tranche_effectifs: "21",
          } as Organization,
          isFreeEmailProvider: true,
          userHasConfirmed: false,
        }),
      );

      assert.deepEqual(result, {
        type: "needs_confirmation",
      });
    });

    test("proceeds when user has confirmed", () => {
      const result = joinOrganization(
        createContext({
          organization: {
            cached_est_active: true,
            cached_tranche_effectifs: "21",
          } as Organization,
          isFreeEmailProvider: true,
          userHasConfirmed: true,
        }),
      );

      assert.notEqual(result.type, "needs_confirmation");
    });

    test("skips confirmation for small organization", () => {
      const result = joinOrganization(
        createContext({
          organization: {
            cached_est_active: true,
            cached_tranche_effectifs: "12",
          } as Organization,
          isFreeEmailProvider: true,
        }),
      );

      assert.notEqual(result.type, "needs_confirmation");
    });
  });

  suite("commune contact email verification", () => {
    const communeOrganization = {
      cached_est_active: true,
      cached_libelle_categorie_juridique: "Commune et commune nouvelle",
      cached_etat_administratif: "A",
      cached_libelle_activite_principale:
        "84.11Z - Administration publique générale",
      cached_tranche_effectifs: null,
    } as Organization;

    test("links with official_contact_email when user email matches contact", () => {
      const result = joinOrganization(
        createContext({
          organization: communeOrganization,
          userEmail: "mairie@commune.fr",
          domain: "commune.fr",
          contactEmail: "mairie@commune.fr",
          isContactEmailSameDomain: true,
          isContactEmailValid: true,
          isContactDomainFree: false,
        }),
      );

      assert.deepEqual(result, {
        type: "link",
        verification_type: "official_contact_email",
        should_mark_contact_domain_verified: true,
      });
    });

    test("links with domain when user domain matches contact domain", () => {
      const result = joinOrganization(
        createContext({
          organization: communeOrganization,
          userEmail: "autre@commune.fr",
          domain: "commune.fr",
          contactEmail: "mairie@commune.fr",
          isContactEmailSameDomain: true,
          isContactEmailValid: true,
          isContactDomainFree: false,
        }),
      );

      assert.deepEqual(result, {
        type: "link",
        verification_type: "domain",
        should_mark_contact_domain_verified: true,
      });
    });

    test("sends code to official contact when domains differ", () => {
      const result = joinOrganization(
        createContext({
          organization: communeOrganization,
          userEmail: "user@gmail.com",
          domain: "gmail.com",
          isFreeEmailProvider: true,
          contactEmail: "mairie@commune.fr",
          isContactEmailSameDomain: false,
          isContactEmailValid: true,
          isContactDomainFree: false,
        }),
      );

      assert.deepEqual(result, {
        type: "link",
        verification_type: "code_sent_to_official_contact_email",
        needs_official_contact_email_verification: true,
        should_mark_contact_domain_verified: true,
      });
    });

    test("does not mark contact domain verified if free email provider", () => {
      const result = joinOrganization(
        createContext({
          organization: communeOrganization,
          userEmail: "mairie@gmail.com",
          domain: "gmail.com",
          isFreeEmailProvider: true,
          contactEmail: "mairie@gmail.com",
          isContactEmailSameDomain: true,
          isContactEmailValid: true,
          isContactDomainFree: true,
        }),
      );

      assert.deepEqual(result, {
        type: "link",
        verification_type: "official_contact_email",
        should_mark_contact_domain_verified: false,
      });
    });
  });

  suite("school contact email verification", () => {
    const schoolOrganization = {
      cached_est_active: true,
      cached_libelle_categorie_juridique:
        "Établissement public local d'enseignement",
      cached_etat_administratif: "A",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_tranche_effectifs: null,
    } as Organization;

    test("links with official_contact_email when user email matches contact", () => {
      const result = joinOrganization(
        createContext({
          organization: schoolOrganization,
          userEmail: "directeur@ac-paris.fr",
          domain: "ac-paris.fr",
          contactEmail: "directeur@ac-paris.fr",
          isContactEmailSameDomain: true,
          isContactEmailValid: true,
        }),
      );

      assert.deepEqual(result, {
        type: "link",
        verification_type: "official_contact_email",
        should_mark_contact_domain_verified: false,
      });
    });

    test("sends code to official contact when emails differ", () => {
      const result = joinOrganization(
        createContext({
          organization: schoolOrganization,
          userEmail: "prof@ac-paris.fr",
          domain: "ac-paris.fr",
          contactEmail: "directeur@ac-paris.fr",
          isContactEmailSameDomain: true,
          isContactEmailValid: true,
        }),
      );

      assert.deepEqual(result, {
        type: "link",
        verification_type: "code_sent_to_official_contact_email",
        needs_official_contact_email_verification: true,
      });
    });

    test("falls through to domain verification when no valid contact email", () => {
      const result = joinOrganization(
        createContext({
          organization: schoolOrganization,
          userEmail: "prof@ac-paris.fr",
          domain: "ac-paris.fr",
          contactEmail: null,
          isContactEmailValid: false,
          organizationEmailDomains: [
            {
              domain: "ac-paris.fr",
              verification_type: "verified",
            } as EmailDomain,
          ],
        }),
      );

      assert.deepEqual(result, {
        type: "link",
        verification_type: "domain",
      });
    });
  });

  suite("domain-based verification", () => {
    test("links with domain when domain is verified", () => {
      const result = joinOrganization(
        createContext({
          domain: "verified.com",
          organizationEmailDomains: [
            {
              domain: "verified.com",
              verification_type: "verified",
            } as EmailDomain,
          ],
        }),
      );

      assert.deepEqual(result, {
        type: "link",
        verification_type: "domain",
      });
    });

    test("links with domain and is_external when domain is external", () => {
      const result = joinOrganization(
        createContext({
          domain: "ext.company.com",
          organizationEmailDomains: [
            {
              domain: "ext.company.com",
              verification_type: "external",
            } as EmailDomain,
          ],
        }),
      );

      assert.deepEqual(result, {
        type: "link",
        verification_type: "domain",
        is_external: true,
      });
    });

    test("links with domain when domain is trackdechets verified", () => {
      const result = joinOrganization(
        createContext({
          domain: "trackdechets.com",
          organizationEmailDomains: [
            {
              domain: "trackdechets.com",
              verification_type: "trackdechets_postal_mail",
            } as EmailDomain,
          ],
        }),
      );

      assert.deepEqual(result, {
        type: "link",
        verification_type: "domain",
      });
    });
  });

  suite("fallback paths", () => {
    test("links with bypassed when featureBypassModeration is true", () => {
      const result = joinOrganization(
        createContext({
          featureBypassModeration: true,
        }),
      );

      assert.deepEqual(result, {
        type: "link",
        verification_type: "bypassed",
      });
    });

    test("returns moderation_required when domain exists but not verified", () => {
      const result = joinOrganization(
        createContext({
          domain: "unverified.com",
          organizationEmailDomains: [
            {
              domain: "unverified.com",
              verification_type: null,
            } as EmailDomain,
          ],
        }),
      );

      assert.deepEqual(result, {
        type: "moderation_required",
        moderation_type: "non_verified_domain",
      });
    });

    test("returns unable_to_auto_join when no path available", () => {
      const result = joinOrganization(
        createContext({
          domain: "unknown.com",
          organizationEmailDomains: [],
        }),
      );

      assert.deepEqual(result, {
        type: "unable_to_auto_join",
      });
    });
  });
});
