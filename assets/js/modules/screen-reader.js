/**
 * tell assistive technologies that links with target="_blank" open in a new tab
 */
export const explainExternalLinks = () => {
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    const ariaLabel = link.getAttribute("aria-label");
    if (!ariaLabel) {
      link.setAttribute("aria-label", link.textContent + " (nouvelle fenêtre)");
    }
  });
};

/**
 * we have a few cases where we must use <a> tags for DSFR styling reasons,
 * on elements that actually behave like buttons.
 *
 * It's not ideal, but at least better match usual button behavior
 * by allowing "space" key to trigger the link click.
 */
export const improveFakeButtons = () => {
  window.addEventListener("keydown", (event) => {
    if (
      event.key === " " &&
      document.activeElement &&
      document.activeElement.tagName === "A" &&
      document.activeElement.getAttribute("role") === "button"
    ) {
      event.preventDefault();
      document.activeElement.click();
    }
  });
};

/** we use some trickery to be able to notify screen reader users in real time
 * by updating an aria-live region that is placed at the very bottom at the DOM.
 *
 * this region is hidden by default and is only shown when a message is set.
 * this kind of lets us notify people without them also hearing the message when
 * they navigate the page.
 */
let screenReaderTimeout = null;

export const announce = (message) => {
  const screenReaderLiveElement = document.getElementById("aria-live-message");
  if (!screenReaderLiveElement) {
    return;
  }
  screenReaderLiveElement.textContent = message;
  clearTimeout(screenReaderTimeout);
  screenReaderTimeout = setTimeout(() => {
    screenReaderLiveElement.textContent = "";
  }, 10000);
  return screenReaderTimeout;
};

/**
 * announce to assistive technologies the content of server-rendered notifications
 *
 * DOM elements with `role` or `aria-live` attribute are not consistently announced
 * when the page loads. We call this function at document load to trigger
 * the announcement of already-there notifications.
 */
export const announceNotifications = () => {
  const notifications = document.getElementById("notifications");
  if (!notifications) {
    return;
  }

  const screenReaderLiveElement = document.getElementById("aria-live-message");
  if (!screenReaderLiveElement) {
    return;
  }

  setTimeout(() => {
    screenReaderLiveElement.innerHTML = notifications.innerHTML;
  }, 1000);
};
