import { containsEssentialAcrs } from "@proconnect-gouv/proconnect.core/services/oidc";
import { get, intersection, isArray, isEmpty } from "lodash-es";
import type { PromptDetail } from "oidc-provider";

const areAcrsRequestedInPrompt = ({
  prompt,
  acrs,
}: {
  prompt: PromptDetail;
  acrs: string[];
}) => {
  const requestedAcr = get(prompt.details, "acr.value") as string | undefined;
  const requestedAcrs = get(prompt.details, "acr.values") as
    | string[]
    | undefined;
  const essential = get(prompt.details, "acr.essential") as boolean | undefined;

  if (
    prompt.name === "login" &&
    prompt.reasons.includes("essential_acr") &&
    essential &&
    acrs.includes(requestedAcr || "")
  ) {
    return true;
  }

  if (
    prompt.name === "login" &&
    prompt.reasons.includes("essential_acrs") &&
    essential &&
    isArray(requestedAcrs) &&
    !isEmpty(intersection(acrs, requestedAcrs))
  ) {
    return true;
  }

  return false;
};

export const certificationDirigeantRequested = (prompt: PromptDetail) => {
  return (
    containsEssentialAcrs(prompt) &&
    areAcrsRequestedInPrompt({
      prompt,
      acrs: ["https://proconnect.gouv.fr/assurance/certification-dirigeant"],
    }) &&
    !areAcrsRequestedInPrompt({
      prompt,
      acrs: ["eidas0", "eidas0-mfa", "eidas1", "eidas1-mfa"],
    })
  );
};

export const isThereAnyRequestedAcr = (prompt: PromptDetail) => {
  return areAcrsRequestedInPrompt({
    prompt,
    acrs: [
      "eidas0",
      "eidas0-mfa",
      "eidas1",
      "eidas1-mfa",
      // This is a legacy ACR level.
      // It should be removed once the certification dirigeant is controlled with the `roles` claims.
      "https://proconnect.gouv.fr/assurance/certification-dirigeant",
    ],
  });
};

export const isAcrSatisfied = (
  prompt: PromptDetail | undefined,
  currentAcr: string | null,
) => {
  // if currentAcr is null, the user does not meet the minimum required authentication level
  if (!currentAcr) {
    return false;
  }

  // if no acr is required, it is satisfied
  if (!prompt || !containsEssentialAcrs(prompt)) {
    return true;
  }

  // if current acr is requested in prompt it is satisfied
  return areAcrsRequestedInPrompt({
    prompt,
    acrs: [currentAcr],
  });
};
