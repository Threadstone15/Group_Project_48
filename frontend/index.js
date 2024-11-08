import {loadNavbar, loadFooter, loadPage} from './js/contentLoader.js';

document.addEventListener("DOMContentLoaded", () => {

  loadNavbar();
  loadFooter();
  loadPage('home');  
  });
  