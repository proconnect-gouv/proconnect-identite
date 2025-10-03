// heavily inspired from https://github.com/nowsecure/owasp-password-strength-test

type errorCode =
  | "failedMinLength"
  | "failedMaxLength"
  | "failedThreeRepeatedChars"
  | "optionalLowercaseRequired"
  | "optionalUppercaseRequired"
  | "optionalNumberRequired"
  | "optionalSpecialCharRequired";

interface Result {
  errors: errorCode[];
  failedTests: errorCode[];
  requiredTestErrors: errorCode[];
  optionalTestErrors: errorCode[];
  isPassphrase: boolean;
  strong: boolean;
  optionalTestsPassed: number;
}

interface Config {
  allowPassphrases: boolean;
  maxLength: number;
  minLength: number;
  minPhraseLength: number;
  minOptionalTestsToPass: number;
}

// This default config ensure a minimum entropy of 66.
// CNIL recommandation are 50 with access restriction (which is our case) or 80 without.
// More info at https://www.cnil.fr/fr/mots-de-passe-une-nouvelle-recommandation-pour-maitriser-sa-securite
const defaultConfig: Config = {
  allowPassphrases: true,
  maxLength: 128,
  minLength: 10,
  minPhraseLength: 20,
  minOptionalTestsToPass: 4,
};

// This is an object containing the tests to run against all passwords.
const tests = {
  // An array of required tests. A password *must* pass these tests in order
  // to be considered strong.
  required: [
    // enforce a minimum length
    (password: string, config: Config): errorCode | null =>
      password.length < config.minLength ? "failedMinLength" : null,

    // enforce a maximum length
    (password: string, config: Config): errorCode | null =>
      password.length > config.maxLength ? "failedMaxLength" : null,

    // forbid repeating characters
    (password: string, _config: Config): errorCode | null =>
      /(.)\1{2,}/.test(password) ? "failedThreeRepeatedChars" : null,
  ],

  // An array of optional tests. These tests are "optional" in two senses:
  //
  // 1. Passphrases (passwords whose length exceeds
  //    this.config.minPhraseLength) are not obligated to pass these tests
  //    provided that this.config.allowPassphrases is set to Boolean true
  //    (which it is by default).
  //
  // 2. A password need only to pass this.config.minOptionalTestsToPass
  //    number of these optional tests in order to be considered strong.
  optional: [
    // require at least one lowercase letter
    (password: string, _config: Config): errorCode | null =>
      !/[a-z]/.test(password) ? "optionalLowercaseRequired" : null,

    // require at least one uppercase letter
    (password: string, _config: Config): errorCode | null =>
      !/[A-Z]/.test(password) ? "optionalUppercaseRequired" : null,

    // require at least one number
    (password: string, _config: Config): errorCode | null =>
      !/[0-9]/.test(password) ? "optionalNumberRequired" : null,

    // require at least one special character
    (password: string, _config: Config): errorCode | null =>
      !/[^A-Za-z0-9]/.test(password) ? "optionalSpecialCharRequired" : null,
  ],
};

// This method tests password strength
export const owaspPasswordStrengthTest = (
  password: string,
  options: Partial<Config> = {},
): Result => {
  const config = { ...defaultConfig, ...options };
  // create an object to store the test results
  const result: Result = {
    errors: [],
    failedTests: [],
    requiredTestErrors: [],
    optionalTestErrors: [],
    isPassphrase: false,
    strong: true,
    optionalTestsPassed: 0,
  };

  // Always submit the password/passphrase to the required tests
  let i = 0;
  tests.required.forEach(function (test) {
    const err = test(password, config);
    if (!!err) {
      result.strong = false;
      result.errors.push(err);
      result.requiredTestErrors.push(err);
      result.failedTests.push(err);
    }
    i++;
  });

  // If configured to allow passphrases, and if the password is of a
  // sufficient length to consider it a passphrase, exempt it from the
  // optional tests.
  if (config.allowPassphrases && password.length >= config.minPhraseLength) {
    result.isPassphrase = true;
  }

  if (!result.isPassphrase) {
    let j = tests.required.length;
    tests.optional.forEach(function (test) {
      const err = test(password, config);
      if (!!err) {
        result.errors.push(err);
        result.optionalTestErrors.push(err);
        result.failedTests.push(err);
      } else {
        result.optionalTestsPassed++;
      }
      j++;
    });
  }

  // If the password is not a passphrase, assert that it has passed a
  // sufficient number of the optional tests, per the configuration
  if (
    !result.isPassphrase &&
    result.optionalTestsPassed < config.minOptionalTestsToPass
  ) {
    result.strong = false;
  }

  return result;
};
