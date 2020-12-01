window.addEventListener("load", () => {
  "use strict";

  // start service worker if supported
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
});
