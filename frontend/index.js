import { loadNavbar, loadFooter, navigate } from './js/contentLoader.js';

document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
  loadFooter();

  // If no specific page is provided, default to the home page
  const path = window.location.pathname === '/' ? 'home' : window.location.pathname.slice(1);
  navigate(path);
});
