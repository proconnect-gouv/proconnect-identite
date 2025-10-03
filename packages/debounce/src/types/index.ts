//

/**
 * @see https://developers.debounce.io/reference/responses#error-response
 */
export interface DebounceErrorResponse {
  debounce: {
    error: string;
    code: "0";
  };
  success: "0";
}

/**
 * @see https://developers.debounce.io/reference/responses#success-response
 */
export interface DebounceSuccessResponse {
  debounce: {
    // The email address you are requesting to validate.
    // ex: 'test@wanadoo.rf'
    email: string;
    // DeBounce validation response code.
    // ex: '6'
    code: string;
    // Is the email role-based or not. Role emails such as "sales@", "webmaster@" etc. are not suitable for sending marketing emails to.
    // ['true', 'false']
    role: string;
    // Is the email from a free email provider - like Gmail - or not.
    // ['true', 'false']
    free_email: string;
    // The final result of the validation process. This response will help to determine whether you should send marketing emails to a recipient or not.
    // ['Invalid', 'Risky', 'Safe to Send', 'Unknown']
    result: string;
    // The reason why the result is given.
    // ex: 'Bounce, Role'
    reason: string;
    // Is it suggested that you send transactional emails to the recipient or not (0: no, 1: yes). Generally, it is suggested to send transactional emails to Valid, Accept-all, and Unknown emails.
    // ['0', '1']
    send_transactional: string;
    // If you use a misspelled email address like someemail@gmial.com, the validation engine tries to suggest you the corrected email address.
    // ex: 'test@wanadoo.fr', ''
    did_you_mean: string;
  };

  success: "1";
  balance: `${number}`;
}
