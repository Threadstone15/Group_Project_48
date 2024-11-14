import {loadNavbar, loadFooter, loadPage, loadJSFile} from './js/contentLoader.js';

document.addEventListener("DOMContentLoaded", () => {

  loadNavbar();
  loadFooter();
  loadPage('home');  
  });
  