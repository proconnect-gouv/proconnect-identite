document.addEventListener(
  "DOMContentLoaded",
  function () {
    var goBackLinks = document.querySelectorAll(".go-back-link");

    function goBack() {
      history.back();
    }

    goBackLinks.forEach(function (goBackLink) {
      goBackLink.addEventListener("click", goBack);
    });
  },
  false,
);
