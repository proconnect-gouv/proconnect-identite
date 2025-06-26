import {
  browserSupportsWebAuthn,
  startRegistration,
} from "@simplewebauthn/browser";

const notSupportedElement = document.getElementById("webauthn-not-supported");
const submitButton = document.getElementById("webauthn-submit-button");
const errorAlertElement = document.getElementById("webauthn-alert-error");

document.addEventListener(
  "DOMContentLoaded",
  async function () {
    const passKeyOption = document.getElementById("radio-passkey");

    // Start registration when the user clicks a button

    const onRegisterClick = async (e) => {
      if (passKeyOption.checked) {
        e.preventDefault();
        await registerPassKey();
      }
    };

    clearDisplay();

    if (!browserSupportsWebAuthn()) {
      notSupportedElement.style.display = "block";
    } else {
      submitButton.addEventListener("click", onRegisterClick);
    }
  },
  false,
);

const registerPassKey = async () => {
  const registrationResponseStringInputElement = document.querySelector(
    'input[name="webauthn_registration_response_string"]',
  );
  const registrationResponseForm = document.getElementById(
    "webauthn-registration-response-form",
  );

  // Reset success/error messages
  clearDisplay();
  submitButton.disabled = true;

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
    submitButton.disabled = false;

    throw error;
  }

  // POST the response to the endpoint that calls
  // @simplewebauthn/server -> verifyRegistrationResponse()
  registrationResponseStringInputElement.value = JSON.stringify(attResp);

  const force2FAInput = document.querySelector(
    `form[action="/users/is-totp-app-installed"] input[name="force_2fa"]`,
  );

  const force2FAHiddenInput = registrationResponseForm.querySelector(
    'input[name="force_2fa"]',
  );

  if (force2FAHiddenInput) {
    force2FAHiddenInput.value = force2FAInput?.checked ? "on" : "";
  }

  registrationResponseForm.requestSubmit();
};

const clearDisplay = () => {
  notSupportedElement.style.display = "none";
  errorAlertElement.style.display = "none";
  errorAlertElement.innerText = "";
  submitButton.disabled = false;
};
