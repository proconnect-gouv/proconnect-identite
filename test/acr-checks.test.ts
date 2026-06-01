import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  certificationDirigeantRequested,
  isAcrSatisfied,
  isThereAnyRequestedAcr,
  twoFactorsAuthRequested,
} from "../src/services/acr-checks";

describe("twoFactorsAuthRequested", () => {
  it("should return false for random prompt", () => {
    const prompt = {
      name: "random",
      reasons: ["random"],
      details: { random: "random" },
    };

    assert.equal(twoFactorsAuthRequested(prompt), false);
  });

  it("should return false for prompt with no acr required", () => {
    const prompt = { name: "login", reasons: ["no_session"], details: {} };

    assert.equal(twoFactorsAuthRequested(prompt), false);
  });

  it("should return true for new session", () => {
    const prompt = {
      name: "login",
      reasons: ["no_session", "essential_acr"],
      details: {
        acr: {
          essential: true,
          value: "eidas1-mfa",
        },
      },
    };

    assert.equal(twoFactorsAuthRequested(prompt), true);
  });

  it("should return true for self asserted identity", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acr"],
      details: {
        acr: {
          essential: true,
          value: "eidas0-mfa",
        },
      },
    };

    assert.equal(twoFactorsAuthRequested(prompt), true);
  });

  it("should return true for existing session", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          values: ["eidas0-mfa", "eidas1-mfa"],
        },
      },
    };

    assert.equal(twoFactorsAuthRequested(prompt), true);
  });

  it("should return false if non 2fa acr are requested", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          values: ["eidas1", "eidas1-mfa"],
        },
      },
    };

    assert.equal(twoFactorsAuthRequested(prompt), false);
  });

  it("should return false for unknown acr", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          value: "eidas2",
        },
      },
    };

    assert.equal(twoFactorsAuthRequested(prompt), false);
  });
});

describe("isAcrSatisfied", () => {
  it("should return true for acr non-related prompt", () => {
    const prompt = {
      name: "random",
      reasons: ["random"],
      details: { random: "random" },
    };

    assert.equal(isAcrSatisfied(prompt, "eidas0"), true);
  });

  it("should return true for prompt with no acr required", () => {
    const prompt = { name: "login", reasons: ["no_session"], details: {} };

    assert.equal(isAcrSatisfied(prompt, "eidas0"), true);
  });

  it("should return true for consistency checked identity", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acr"],
      details: {
        acr: {
          essential: true,
          value: "eidas1",
        },
      },
    };

    assert.equal(isAcrSatisfied(prompt, "eidas1"), true);
  });
  it("should return false for self-asserted identity", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acr"],
      details: {
        acr: {
          essential: true,
          value: "eidas1",
        },
      },
    };

    assert.equal(isAcrSatisfied(prompt, "eidas0"), false);
  });
});

describe("isThereAnyRequestedAcr", () => {
  it("should return false for acr non-related prompt", () => {
    const prompt = {
      name: "random",
      reasons: ["random"],
      details: { random: "random" },
    };

    assert.equal(isThereAnyRequestedAcr(prompt), false);
  });

  it("should return true for prompt with no acr required", () => {
    const prompt = { name: "login", reasons: ["no_session"], details: {} };

    assert.equal(isThereAnyRequestedAcr(prompt), false);
  });

  it("should return false for legacy acr", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          value: "eidas1",
        },
      },
    };

    assert.equal(isThereAnyRequestedAcr(prompt), false);
  });

  it("should return true for non legacy acr", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          values: ["eidas1", "eidas1-mfa"],
        },
      },
    };

    assert.equal(isThereAnyRequestedAcr(prompt), true);
  });

  it("should return true for mfa requested identity", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          values: ["eidas0-mfa", "eidas1-mfa"],
        },
      },
    };

    assert.equal(isThereAnyRequestedAcr(prompt), true);
  });
});

describe("certificationDirigeantRequested", () => {
  it("should return true for certification dirigeant acr", () => {
    const prompt = {
      details: {
        acr: {
          essential: true,
          values: [
            "https://proconnect.gouv.fr/assurance/certification-dirigeant",
          ],
        },
      },
      name: "login",
      reasons: ["essential_acrs"],
    };

    assert.equal(certificationDirigeantRequested(prompt), true);
  });

  it("should return false if non certification dirigeant acr are requested", () => {
    const prompt = {
      details: {
        acr: {
          essential: true,
          values: [
            "https://proconnect.gouv.fr/assurance/certification-dirigeant",
            "eidas1",
            "eidas1-mfa",
            "eidas0",
            "eidas0-mfa",
          ],
        },
      },
      name: "login",
      reasons: ["essential_acrs"],
    };

    assert.equal(certificationDirigeantRequested(prompt), false);
  });

  it("should return false if non self asserted acr are requested", () => {
    const prompt = {
      details: {
        acr: {
          essential: true,
          values: [
            "https://proconnect.gouv.fr/assurance/certification-dirigeant",
            "eidas1",
            "eidas1-mfa",
          ],
        },
      },
      name: "login",
      reasons: ["essential_acrs"],
    };

    assert.equal(certificationDirigeantRequested(prompt), false);
  });
});
