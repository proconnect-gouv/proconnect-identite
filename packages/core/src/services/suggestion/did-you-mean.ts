import gouvfrDomains from "#src/data/gouvfr-domains";
import mostUsedFreeEmailDomains from "#src/data/most-used-free-email-domains";
import otherGouvDomains from "#src/data/other-gouv-domains";
import { run as spellCheckEmail } from "@zootools/email-spell-checker";

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
