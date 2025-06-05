const radioButtons = document.querySelectorAll('input[name="radio-hint-2fa"]');
const continueButton = document.getElementById("submit-button");

function checkRadioSelection() {
  const isAnyRadioSelected = Array.from(radioButtons).some(
    (radio) => radio.checked,
  );

  if (continueButton) {
    if (isAnyRadioSelected) {
      continueButton.disabled = false;
      continueButton.removeAttribute("aria-disabled");
      continueButton.classList.remove("disabled-button");
    } else {
      continueButton.disabled = true;
      continueButton.setAttribute("aria-disabled", "true");
      continueButton.classList.add("disabled-button");
    }
  }
}

radioButtons.forEach((radio) => {
  radio.addEventListener("change", checkRadioSelection);
});

checkRadioSelection();
