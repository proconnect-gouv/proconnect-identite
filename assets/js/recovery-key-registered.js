const initializeCheckboxRecoveryKey = () => {
  const checkbox = document.getElementById("is-recovery-key-registered");
  const continueLink = document.getElementById("continue-button");

  if (!checkbox || !continueLink) return;

  const updateLinkState = () => {
    if (checkbox.checked) {
      continueLink.removeAttribute("aria-disabled");
      continueLink.classList.remove("disabled-button");
    } else {
      continueLink.setAttribute("aria-disabled", "true");
      continueLink.classList.add("disabled-button");
    }
  };

  updateLinkState();

  checkbox.addEventListener("change", updateLinkState);
};

document.addEventListener("DOMContentLoaded", initializeCheckboxRecoveryKey);
window.addEventListener("pageshow", initializeCheckboxRecoveryKey);
