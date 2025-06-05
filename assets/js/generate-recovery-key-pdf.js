document.addEventListener(
  "DOMContentLoaded",
  function () {
    var downloadButtons = document.querySelectorAll(".download-pdf-btn");
    downloadButtons.forEach(function (downloadButton) {
      downloadButton.addEventListener("click", function () {
        const recoveryKey = document.querySelector(".recovery-key").textContent;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Votre clé de récupération :", 20, 60);

        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text(recoveryKey, 20, 80);

        doc.setFont(undefined, "normal");
        doc.setFontSize(12);
        doc.text("Conservez cette clé en lieu sûr.", 20, 110);
        doc.text("Elle vous permettra de récupérer votre compte.", 20, 125);

        const today = new Date().toLocaleDateString("fr-FR");
        doc.text("Généré le : " + today, 20, 150);

        doc.save("cle-recuperation.pdf");
      });
    });
  },
  false,
);
