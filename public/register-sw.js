window.addEventListener("load", () => {
  "use strict";

  // check support for service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(`${window.location.pathname}sw.js`);
  }
});
