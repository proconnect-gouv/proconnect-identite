document.addEventListener(
  "DOMContentLoaded",
  function () {
    var goBackLinks = document.querySelectorAll(".go-back-link");

    function hasUsableHistory() {
      return window.history.length > 1;
    }

    function goBack() {
      history.back();
    }

    goBackLinks.forEach(function (goBackLink) {
      if (hasUsableHistory()) {
        goBackLink.classList.add("visible");
        goBackLink.addEventListener("click", goBack);
      }
    });
  },
  false,
);
