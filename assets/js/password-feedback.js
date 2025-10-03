import { debounce } from "./modules/debounce";
import { announce } from "./modules/screen-reader";

document.addEventListener(
  "DOMContentLoaded",
  function () {
    var passwordInput = document.getElementById("password-input");
    var passwordInputDataEmail =
      document.getElementById("password-input").dataset.email;

    var passphraseInputMessageElement = document.getElementById(
      "passphrase-input-message",
    );
    var passphraseInputMessage20CharElement = document.getElementById(
      "passphrase-input-message-20char",
    );
    var passwordInputMessageElement = document.getElementById(
      "password-input-message",
    );
    var passwordInputMessage10charElement = document.getElementById(
      "password-input-message-10char",
    );
    var passwordInputMessageSpecialElement = document.getElementById(
      "password-input-message-special",
    );
    var passwordInputMessageNumberElement = document.getElementById(
      "password-input-message-number",
    );
    var passwordInputMessageLowercaseElement = document.getElementById(
      "password-input-message-lowercase",
    );
    var passwordInputMessageUppercaseElement = document.getElementById(
      "password-input-message-uppercase",
    );
    var passwordInputMessage128charElement = document.getElementById(
      "password-input-message-128char",
    );
    var passwordInputMessage3sameElement = document.getElementById(
      "password-input-message-3same",
    );
    var passwordInputMessageBlacklistedWordElement = document.getElementById(
      "password-input-message-blacklisted-word",
    );

    function toggleValidity(element, isValid) {
      if (isValid) {
        setValid(element);
      } else {
        setError(element);
      }
    }

    function resetValidity(element, options = {}) {
      if (!element) {
        return;
      }
      const display = options.display || "block";
      element.classList.remove("fr-message--error");
      element.classList.remove("fr-message--valid");
      element.classList.add("fr-message--info");
      element.removeAttribute("data-condition-ok");
      element.style.display = display;
    }

    function setValid(element) {
      if (!element) {
        return;
      }
      element.classList.remove("fr-message--info");
      element.classList.remove("fr-message--error");
      element.classList.add("fr-message--valid");
      element.removeAttribute("data-condition-ok");
    }

    function setError(element) {
      if (!element) {
        return;
      }
      element.classList.remove("fr-message--info");
      element.classList.remove("fr-message--valid");
      element.classList.add("fr-message--error");
      element.setAttribute("data-condition-ok", "false");
      element.style.display = "block";
    }

    // wait a little before notifying sr users of their input to prevent spam
    const debouncedAnnounce = debounce(announce, 2000);

    function clearPasswordMessages() {
      passphraseInputMessageElement.style.display = "block";
      resetValidity(passphraseInputMessage20CharElement);

      resetValidity(passwordInputMessage10charElement);
      resetValidity(passwordInputMessageSpecialElement);
      resetValidity(passwordInputMessageNumberElement);
      resetValidity(passwordInputMessageLowercaseElement);
      resetValidity(passwordInputMessageUppercaseElement);

      resetValidity(passwordInputMessage128charElement, { display: "none" });
      resetValidity(passwordInputMessage3sameElement, { display: "none" });
      resetValidity(passwordInputMessageBlacklistedWordElement, {
        display: "none",
      });
      passwordInputMessageBlacklistedWordElement.innerHTML = "";
    }

    function updatePasswordMessages() {
      clearPasswordMessages();
      passwordInput.setCustomValidity("");

      var inputValue = passwordInput.value;
      var inputLength = passwordInput.value.length;
      toggleValidity(passwordInputMessage10charElement, inputLength >= 10);
      if (inputLength >= 20) {
        setValid(passphraseInputMessage20CharElement);
        passwordInputMessageElement.style.display = "none";
        passwordInputMessage10charElement.style.display = "none";
        passwordInputMessageSpecialElement.style.display = "none";
        passwordInputMessageNumberElement.style.display = "none";
        passwordInputMessageLowercaseElement.style.display = "none";
        passwordInputMessageUppercaseElement.style.display = "none";
      }
      if (inputLength > 128) {
        setError(passwordInputMessage128charElement);
      }
      if (inputLength < 20) {
        toggleValidity(
          passwordInputMessageSpecialElement,
          /[^A-Za-z0-9]/.test(inputValue),
        );
        toggleValidity(
          passwordInputMessageNumberElement,
          /[0-9]/.test(inputValue),
        );
        toggleValidity(
          passwordInputMessageLowercaseElement,
          /[a-z]/.test(inputValue),
        );
        toggleValidity(
          passwordInputMessageUppercaseElement,
          /[A-Z]/.test(inputValue),
        );
      }
      if (/(.)\1{2,}/.test(inputValue)) {
        setError(passwordInputMessage3sameElement);
      }

      if (
        passwordInputDataEmail &&
        inputValue.toLowerCase().includes(passwordInputDataEmail)
      ) {
        setError(passwordInputMessageBlacklistedWordElement);
        passwordInputMessageBlacklistedWordElement.innerHTML =
          "ne doit pas contenir votre adresse email";
      }
      [
        "moncomptepro",
        "mon compte pro",
        "agentconnect",
        "agent connect",
        "proconnect",
        "pro connect",
      ].forEach((blacklistedWord) => {
        if (inputValue.toLowerCase().includes(blacklistedWord)) {
          setError(passwordInputMessageBlacklistedWordElement);
          passwordInputMessageBlacklistedWordElement.innerHTML =
            "ne doit pas contenir « " + blacklistedWord + " »";
        }
      });
    }

    function updateHelpTexts() {
      let conditions = [];
      document
        .querySelectorAll('[data-condition-ok="false"]')
        .forEach((element) => {
          conditions.push(element.textContent.trim());
        });

      if (!conditions.length) {
        passwordInput.setCustomValidity("");
        debouncedAnnounce.cancel();
        return;
      }

      if (passwordInput.value.length < 20) {
        conditions.push(
          "ou alors 20 caractères minimum sans autres conditions",
        );
      }

      let conditionsString =
        "Format restant à respecter : " + conditions.join(" ");
      if (conditionsString.slice(-1) === ",") {
        conditionsString = conditionsString.slice(0, -1);
      }
      debouncedAnnounce(conditionsString);
      passwordInput.setCustomValidity(conditionsString);
    }

    clearPasswordMessages();

    passwordInput.addEventListener(
      "input",
      () => {
        updatePasswordMessages();
        updateHelpTexts();
      },
      false,
    );

    // don't spam sr users with delayed notification when they try to submit the form, they will get the customValidity message
    passwordInput
      .closest("form")
      .querySelector('button[type="submit"]')
      .addEventListener("click", () => {
        debouncedAnnounce.cancel();
      });
  },
  false,
);
