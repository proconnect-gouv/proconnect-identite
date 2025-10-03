document.addEventListener(
  "DOMContentLoaded",
  function () {
    const elements = document.querySelectorAll(".disabled-with-countdown");

    elements.forEach((element) => {
      const rawEndDate = element.getAttribute("data-countdown-end-date");
      try {
        const endDateInSeconds = new Date(rawEndDate).getTime() / 1000;
        const nowInSeconds = new Date().getTime() / 1000;
        let secondsToEndDate = Math.round(endDateInSeconds - nowInSeconds);
        let intervalId;
        element.disabled = true;
        intervalId = setInterval(function () {
          secondsToEndDate--;

          const prefixText =
            element.textContent.match(
              /(.*)(\s+\(disponible dans \d+:\d+\))/,
            )?.[1] || element.textContent;
          let suffixText = "";

          if (secondsToEndDate > 0) {
            const minutes = Math.floor(secondsToEndDate / 60);
            const seconds = String(secondsToEndDate % 60).padStart(2, "0");
            suffixText = ` (disponible dans ${minutes}:${seconds})`;
          }
          element.textContent = prefixText + suffixText;

          if (secondsToEndDate <= 0 || Number.isNaN(secondsToEndDate)) {
            element.disabled = false;
            clearInterval(intervalId);
          }
        }, 1000);
      } catch (error) {
        // silently fails
      }
    });
  },
  false,
);
