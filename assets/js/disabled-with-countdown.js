document.addEventListener(
  "DOMContentLoaded",
  function () {
    const elements = document.querySelectorAll(".disabled-with-countdown");

    elements.forEach((element) => {
      const rawEndDate = element.getAttribute("data-countdown-end-date");
      const countdownContainer = document.querySelector(".countdown-container");
      const countdownText = document.querySelector(".countdown-time");

      if (!countdownContainer || !countdownText) return;

      try {
        const endDateInSeconds = new Date(rawEndDate).getTime() / 1000;
        const nowInSeconds = new Date().getTime() / 1000;
        let secondsToEndDate = Math.round(endDateInSeconds - nowInSeconds);

        if (secondsToEndDate <= 0) {
          element.disabled = false;
          return;
        }

        countdownContainer.classList.remove("fr-hidden");
        element.disabled = true;

        const updateCountdown = () => {
          if (secondsToEndDate > 0) {
            const minutes = Math.floor(secondsToEndDate / 60);
            const seconds = String(secondsToEndDate % 60).padStart(2, "0");
            countdownText.textContent = `Disponible dans ${minutes}:${seconds}min`;
          } else {
            countdownContainer.classList.add("fr-hidden");
            element.disabled = false;
            clearInterval(intervalId);
          }
        };

        updateCountdown();

        let intervalId = setInterval(function () {
          secondsToEndDate--;
          updateCountdown();
        }, 1000);
      } catch (error) {
        // silently fails
      }
    });
  },
  false,
);
