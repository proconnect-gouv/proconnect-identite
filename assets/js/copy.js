document.addEventListener(
  "DOMContentLoaded",
  function () {
    var copyButtons = document.querySelectorAll(".copy-btn");

    function copyText() {
      const text = document.getElementById("textToCopy").textContent;
      navigator.clipboard.writeText(text);

      // Dynmic icon
      copyButtons.forEach(function (copyButton) {
        copyButton.classList.remove("fr-icon-clipboard-line");
        copyButton.classList.add("fr-icon-check-line");
        setTimeout(function () {
          copyButton.classList.remove("fr-icon-check-line");
          copyButton.classList.add("fr-icon-clipboard-line");
        }, 2000);
      });
    }

    copyButtons.forEach(function (copyButton) {
      copyButton.addEventListener("click", copyText);
    });
  },
  false,
);

// ocument.addEventListener(
//   "DOMContentLoaded",
//   function () {
//     var copyButtons = document.querySelectorAll(".copy-btn");

//     copyButtons.forEach(function (copyButton) {
//       copyButton.addEventListener("click", function () {
//         const textElement = copyButton.previousElementSibling;
//         if (textElement && textElement.classList.contains("text-to-copy")) {
//           const text = textElement.textContent;
//           navigator.clipboard.writeText(text);

//           // Changer l'icône
//           copyButton.classList.remove("fr-icon-clipboard-line");
//           copyButton.classList.add("fr-icon-check-line");

//           // Remettre l'icône d'origine après 2 secondes
//           setTimeout(function () {
//             copyButton.classList.remove("fr-icon-check-line");
//             copyButton.classList.add("fr-icon-clipboard-line");
//           }, 2000);
//         }
//       });
//     });
//   },
//   false,
// );
