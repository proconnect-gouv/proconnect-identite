import {
  browserSupportsWebAuthn,
  startRegistration,
} from "@simplewebauthn/browser";

document.addEventListener(
  "DOMContentLoaded",
  async function () {
    const beginElement = document.getElementById(
      "webauthn-btn-begin-registration",
    );
    const registrationResponseStringInputElement = document.querySelector(
      'input[name="webauthn_registration_response_string"]',
    );
    const registrationResponseForm = document.getElementById(
      "webauthn-registration-response-form",
    );
    const notSupportedElement = document.getElementById(
      "webauthn-not-supported",
    );
    const errorAlertElement = document.getElementById("webauthn-alert-error");

    const clearDisplay = () => {
      notSupportedElement.style.display = "none";
      errorAlertElement.style.display = "none";
      errorAlertElement.innerText = "";
      beginElement.disabled = false;
    };
    // Start registration when the user clicks a button
    const onRegisterClick = async () => {
      // Reset success/error messages
      clearDisplay();
      beginElement.disabled = true;

      let attResp;

      try {
        // GET registration options from the endpoint that calls
        // @simplewebauthn/server -> generateRegistrationOptions()
        const resp = await fetch("/api/webauthn/generate-registration-options");

        // Pass the options to the authenticator and wait for a response
        attResp = await startRegistration(await resp.json());
      } catch (error) {
        clearDisplay();
        errorAlertElement.style.display = "block";
        if (error.name === "InvalidStateError") {
          errorAlertElement.innerText = `Cette clé est déjà enregistrée. Vous pouvez d'ores et déjà utiliser votre empreinte digitale, votre visage, le verrouillage de l’écran ou une clé de sécurité physique pour vous connecter sur cet appareil.`;
        } else if (error.name === "NotAllowedError") {
          errorAlertElement.innerText = `Une erreur est survenue. Nous n’avons pas pu enregistrer vos modifications. Merci de réessayer.`;
        } else {
          errorAlertElement.innerText = `Une erreur est survenue. Erreur: ${JSON.stringify(error, null, 2)}`;
        }

        errorAlertElement.scrollIntoView({ behavior: "smooth" });
        beginElement.disabled = false;

        throw error;
      }

      // POST the response to the endpoint that calls
      // @simplewebauthn/server -> verifyRegistrationResponse()
      registrationResponseStringInputElement.value = JSON.stringify(attResp);
      registrationResponseForm.requestSubmit();
    };

    clearDisplay();

    if (!browserSupportsWebAuthn()) {
      notSupportedElement.style.display = "block";
    } else {
      beginElement.addEventListener("click", onRegisterClick);
    }
  },
  false,
);
