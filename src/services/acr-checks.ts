import { containsEssentialAcrs } from "@gouvfr-lasuite/proconnect.core/services/oidc";
import { get, intersection, isArray, isEmpty } from "lodash-es";
import type { PromptDetail } from "oidc-provider";
import {
  ACR_VALUE_FOR_CERTIFICATION_DIRIGEANT,
  ACR_VALUE_FOR_IAL1_AAL1,
  ACR_VALUE_FOR_IAL1_AAL2,
  ACR_VALUE_FOR_IAL2_AAL1,
  ACR_VALUE_FOR_IAL2_AAL2,
  ACR_VALUE_FOR_IAL3_AAL1,
  ACR_VALUE_FOR_IAL3_AAL2,
} from "../config/env";

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

export const twoFactorsAuthRequested = (prompt: PromptDetail) => {
  return (
    containsEssentialAcrs(prompt) &&
    areAcrsRequestedInPrompt({
      prompt,
      acrs: [
        ACR_VALUE_FOR_IAL1_AAL2,
        ACR_VALUE_FOR_IAL2_AAL2,
        ACR_VALUE_FOR_IAL3_AAL2,
      ],
    }) &&
    !areAcrsRequestedInPrompt({
      prompt,
      acrs: [
        ACR_VALUE_FOR_IAL1_AAL1,
        ACR_VALUE_FOR_IAL2_AAL1,
        ACR_VALUE_FOR_IAL3_AAL1,
        ACR_VALUE_FOR_CERTIFICATION_DIRIGEANT,
      ],
    })
  );
};

export const certificationDirigeantRequested = (prompt: PromptDetail) => {
  return (
    containsEssentialAcrs(prompt) &&
    areAcrsRequestedInPrompt({
      prompt,
      acrs: [ACR_VALUE_FOR_CERTIFICATION_DIRIGEANT],
    }) &&
    !areAcrsRequestedInPrompt({
      prompt,
      acrs: [
        ACR_VALUE_FOR_IAL1_AAL1,
        ACR_VALUE_FOR_IAL1_AAL2,
        ACR_VALUE_FOR_IAL2_AAL1,
        ACR_VALUE_FOR_IAL2_AAL2,
      ],
    })
  );
};

export const isThereAnyRequestedAcr = (prompt: PromptDetail) => {
  return areAcrsRequestedInPrompt({
    prompt,
    acrs: [
      ACR_VALUE_FOR_IAL1_AAL1,
      ACR_VALUE_FOR_IAL1_AAL2,
      ACR_VALUE_FOR_IAL2_AAL1,
      ACR_VALUE_FOR_IAL2_AAL2,
      ACR_VALUE_FOR_IAL3_AAL1,
    ],
  });
};

export const isAcrSatisfied = (prompt: PromptDetail, currentAcr: string) => {
  // if no acr is required it is satisfied
  if (!containsEssentialAcrs(prompt)) {
    return true;
  }

  // if current acr is requested in prompt it is satisfied
  return areAcrsRequestedInPrompt({
    prompt,
    acrs: [currentAcr],
  });
};
