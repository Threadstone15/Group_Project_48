import { loadPage } from "./contentLoader.js";

export function navigate(page) {
    loadPage(page);
    history.pushState({ page }, "", `/Group_Project_48/${page}`);
  }
  
  window.addEventListener('popstate', () => {
    const page = history.state?.page || 'home';
    loadPage(page);
  });
  
  window.navigate = navigate;
  