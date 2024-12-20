import { initialPageLoad } from "./js/router.js";

document.addEventListener("DOMContentLoaded", () => {
  loadGlobalCss();
  const path = window.location.pathname === '/Group_Project_48/' ? 'home' : window.location.pathname.replace('/Group_Project_48/', '');
  initialPageLoad(path);
});

function loadGlobalCss(){
  if (!document.querySelector(`link[href="/Group_Project_48/frontend/css/globals.css"]`)) {
    const globalCssLink = document.createElement("link");
    globalCssLink.rel = "stylesheet";
    globalCssLink.href = "/Group_Project_48/frontend/css/globals.css";
    document.head.appendChild(globalCssLink);
  }
}
