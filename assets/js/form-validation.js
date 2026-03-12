document.addEventListener("DOMContentLoaded", function () {
  var forms = document.querySelectorAll("form");

  forms.forEach(function (form) {
    var submitButton = form.querySelector("button.fr-btn");

    if (!submitButton) {
      return;
    }
    function checkFormValidity() {
      submitButton.disabled = !form.checkValidity();
    }
    form.addEventListener("input", checkFormValidity);
    form.addEventListener("change", checkFormValidity);
    // Autofilled inputs may receive a value from the browser cache after the DOM Content has loaded.
    // This happens with Chrome when we enter an email with `autocomplete="email"`, submit, then go back.
    // See issue "Autofill should trigger a change event on inputs" https://issues.chromium.org/issues/41094857
    // It looks like the field is filled in within milliseconds after the DOMContentLoaded event.
    // As a workaround, we wait for 100ms to ensure the field is filled before checking the form validity.
    setTimeout(checkFormValidity, 100);
  });
});
