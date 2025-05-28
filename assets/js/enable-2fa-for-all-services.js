const radioButtons = document.querySelectorAll('input[name="radio-hint"]');
const checkbox = document.getElementById("checkboxes-1");
const continueButton = document.getElementById("submit-button");

function checkRadioSelection() {
  const isAnyRadioSelected = Array.from(radioButtons).some(
    (radio) => radio.checked,
  );
  checkbox.disabled = !isAnyRadioSelected;

  if (!isAnyRadioSelected) {
    checkbox.checked = false;
  }

  if (continueButton) {
    if (isAnyRadioSelected) {
      continueButton.removeAttribute("aria-disabled");
      continueButton.classList.remove("disabled-button");
    } else {
      continueButton.setAttribute("aria-disabled", "true");
      continueButton.classList.add("disabled-button");
    }
  }
}

radioButtons.forEach((radio) => {
  radio.addEventListener("change", checkRadioSelection);
});

checkRadioSelection();
