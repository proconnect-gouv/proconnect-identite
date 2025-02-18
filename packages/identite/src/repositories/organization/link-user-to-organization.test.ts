import { emptyDatabase, migrate, pg } from "#testing";
import FakeTimers from "@sinonjs/fake-timers";
import * as chai from "chai";
import "chai-as-promised";
import chaiAsPromised from "chai-as-promised";
import { describe } from "mocha";
import { linkUserToOrganizationFactory } from "./link-user-to-organization.js";
chai.use(chaiAsPromised);
const expect = chai.expect;

//

const linkUserToOrganization = linkUserToOrganizationFactory({ pg: pg as any });

describe(linkUserToOrganizationFactory.name, () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("should link user to organization", async () => {
    await pg.sql`
      INSERT INTO organizations
        (cached_libelle, cached_nom_complet, id, siret, created_at, updated_at)
      VALUES
        ('Necron', 'Necrontyr', 1, '⚰️', '1967-12-19', '1967-12-19')
      ;
    `;
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque')
      ;
    `;
    FakeTimers.install({ now: new Date("4444-04-04") });

    const userOrganizationLink = await linkUserToOrganization({
      organization_id: 1,
      user_id: 1,
      verification_type: "bypassed",
    });

    expect(userOrganizationLink).to.deep.equal({
      created_at: new Date("4444-04-04"),
      has_been_greeted: false,
      is_external: false,
      needs_official_contact_email_verification: false,
      official_contact_email_verification_sent_at: null,
      official_contact_email_verification_token: null,
      organization_id: 1,
      updated_at: new Date("4444-04-04"),
      user_id: 1,
      verification_type: "bypassed",
      verified_at: null,
    });
  });
});
