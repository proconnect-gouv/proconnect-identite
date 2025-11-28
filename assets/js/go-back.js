document.addEventListener(
  "DOMContentLoaded",
  function () {
    var goBackLinks = document.querySelectorAll(".go-back-link");

    function hasUsableHistory() {
      return window.history.length > 1 && document.referrer !== "";
    }

    function goBack() {
      history.back();
    }

    goBackLinks.forEach(function (goBackLink) {
      if (!hasUsableHistory()) {
        goBackLink.style.display = "none";
      } else {
        goBackLink.addEventListener("click", goBack);
      }
    });
  },
  false,
);
