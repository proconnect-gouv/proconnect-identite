import { run as spellCheckEmail } from "@zootools/email-spell-checker";
import gouvfrDomains from "../../data/gouvfr-domains.js";
import mostUsedFreeEmailDomains from "../../data/most-used-free-email-domains.js";
import otherGouvDomains from "../../data/other-gouv-domains.js";

// Display an email suggestion for most used public domains
export function getDidYouMeanSuggestion(email: string): string {
  const suggestedEmail = spellCheckEmail({
    domains: [
      ...gouvfrDomains,
      ...otherGouvDomains,
      ...mostUsedFreeEmailDomains,
    ],
    topLevelDomains: ["fr", "com", "net"],
    email,
  });

  return suggestedEmail?.full ? suggestedEmail.full : "";
}
