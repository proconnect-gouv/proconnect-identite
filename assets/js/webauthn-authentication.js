import { startAuthentication } from "@simplewebauthn/browser";

document.addEventListener(
  "DOMContentLoaded",
  function () {
    const beginElement = document.getElementById(
      "webauthn-btn-begin-authentication",
    );
    if (!beginElement) {
      return;
    }
    const authenticationResponseStringInputElement = document.querySelector(
      'input[name="webauthn_authentication_response_string"]',
    );
    const authenticationResponseForm = document.getElementById(
      "webauthn-authentication-response-form",
    );
    const errorElement = document.getElementById("webauthn-alert-error");

    const actionAttribute = authenticationResponseForm.getAttribute("action");
    let authOptionsUrl;
    if (actionAttribute === "/users/2fa-sign-in-with-passkey") {
      authOptionsUrl =
        "/api/webauthn/generate-authentication-options-for-second-factor";
    } else if (actionAttribute === "/users/sign-in-with-passkey") {
      authOptionsUrl =
        "/api/webauthn/generate-authentication-options-for-first-factor";
    } else {
      throw new Error("Webauthn page miss-configured!");
    }

    // Start authentication
    const authenticate = async ({ useBrowserAutofill = false } = {}) => {
      // Reset success/error messages
      errorElement.style.display = "none";
      errorElement.innerText = "";

      if (!useBrowserAutofill) {
        beginElement.disabled = true;
      }

      let authResponse;

      try {
        // GET authentication options from the endpoint that calls
        // @simplewebauthn/server -> generateAuthenticationOptions()
        const authOptions = await fetch(authOptionsUrl);

        // Pass the options to the authenticator and wait for a response
        authResponse = await startAuthentication({
          optionsJSON: await authOptions.json(),
          useBrowserAutofill,
        });
      } catch (error) {
        // User dismissed/refused passkey prompt: do not show an error
        if (error.name === "AbortError") {
          beginElement.disabled = false;
          return;
        }

        errorElement.style.display = "block";
        if (error.name === "NotAllowedError") {
          errorElement.innerText = `Une erreur est survenue. Nous n’avons pas pu vérifier vos informations. Merci de réessayer.`;
        } else {
          errorElement.innerText = `Une erreur est survenue. Erreur: ${JSON.stringify(error, null, 2)}`;
        }

        beginElement.disabled = false;
        throw error;
      }

      // POST the response to the endpoint that calls
      // @simplewebauthn/server -> verifyAuthenticationResponse()
      authenticationResponseStringInputElement.value = JSON.stringify(authResponse);
      authenticationResponseForm.requestSubmit();
    };
    beginElement.addEventListener("click", () => {
      authenticate({ useBrowserAutofill: false });
    });

    authenticate({ useBrowserAutofill: true });
  },
  false,
);
