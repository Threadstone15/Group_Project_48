// import { initialNavigate } from './js/router.js';
// import { initialNavigateDashboard } from './js/dashboardRouter.js';
import { initialPageLoad } from "./js/router2.js";

document.addEventListener("DOMContentLoaded", () => {
  loadGlobalCss();
  const path = window.location.pathname === '/Group_Project_48/' ? 'home' : window.location.pathname.replace('/Group_Project_48/', '');

  // Determine if loading a dashboard
  // const role = path.split('/')[0];
  // console.log("role is"+role);
  // if (['member', 'staff', 'trainer', 'owner', 'admin'].includes(role)) {
  //   const page = path.split('/')[1];
  //   console.log("page is"+page);
  //   initialNavigateDashboard(role, page);
  // } else {
  //   initialNavigate(path);
  // }
  // console.log("path isss"+path);
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
