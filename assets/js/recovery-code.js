const copyButton = document.getElementById("copy-recovery-codes");
const codesList = document.querySelector(".recovery-codes-list");

if (copyButton && codesList) {
  copyButton.addEventListener("click", async () => {
    const codes = Array.from(codesList.querySelectorAll("li")).map(
      (li) => li.textContent,
    );
    await navigator.clipboard.writeText(codes.join("\n"));

    const originalLabel = copyButton.getAttribute("aria-label");
    copyButton.classList.remove("fr-icon-clipboard-line");
    copyButton.classList.add("fr-icon-check-line");
    copyButton.setAttribute("aria-label", "Codes copiés");

    setTimeout(() => {
      copyButton.classList.remove("fr-icon-check-line");
      copyButton.classList.add("fr-icon-clipboard-line");
      copyButton.setAttribute("aria-label", originalLabel);
    }, 2000);
  });
}
