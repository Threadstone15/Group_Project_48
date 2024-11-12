import { loadNavbar, loadFooter } from './js/contentLoader.js';

document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
  loadFooter();

  // Handle the current path
  const path = window.location.pathname === '/Group_Project_48/' 
    ? 'home' 
    : window.location.pathname.replace('/Group_Project_48/', '');
  navigate(path);
});
