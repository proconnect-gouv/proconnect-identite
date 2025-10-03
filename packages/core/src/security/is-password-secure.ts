//

import { owaspPasswordStrengthTest } from "./owasp-password-strength-tester.js";

//

export function isPasswordSecure(plainPassword: string, email: string) {
  const { strong } = owaspPasswordStrengthTest(plainPassword);

  const lowerCasedBlacklistedWords = [
    email.toLowerCase(),
    "moncomptepro",
    "mon compte pro",
    "agentconnect",
    "agent connect",
    "proconnect",
    "pro connect",
  ];

  const containsBlacklistedWord = lowerCasedBlacklistedWords.some((word) =>
    plainPassword.toLowerCase().includes(word),
  );

  return !containsBlacklistedWord && strong;
}
