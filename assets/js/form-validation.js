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
    checkFormValidity();
  });
});
