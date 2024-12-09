import { initabout } from "./about.js";
import { initbecomeMember } from "./becomeMember.js";
import { initcareers } from "./careers.js";
import { initfindATrainer } from "./findATrainer.js";
import { initforgotPassword } from "./forgotPassword.js";
import { inithome } from "./home.js";
import { initlogin } from "./login.js";
import { initpricing } from "./pricing.js";
import { initresetPw } from "./resetPw.js";
import { initservices } from "./services.js";
import { inittrainerApplication } from "./trainerApplication.js";

export function navigate(page) {
  removeExistingCSSJS();
  if (isInitialNavigate()) {
    //clearing dashbaord components if present
    clearDashboardComponents();
    //then load navbar and footer
    loadNavbar();
    loadFooter();
    loadPage(page);
    history.pushState({ page }, "", `/Group_Project_48/${page}`);
    location.reload();
  } else {
    loadPage(page);
    history.pushState({ page }, "", `/Group_Project_48/${page}`);
  }
}

window.addEventListener("popstate", () => {
  // Get the page state from history.state
  const state = history.state;

  if (state?.page) {
    const [pathPart1, pathPart2] = state.page.split('/'); // Split the state page into role and page

    if (['member', 'staff', 'trainer', 'owner', 'admin'].includes(pathPart1)) {
      // This is a dashboard route
      const role = pathPart1;
      const page = pathPart2;
      if (IsNonDashboardContentExists()) {
        clearNonDashboardComponents();
        loadSidebar(role);
      }
      loadDashboardPage(role, page);
    } else {
      // This is a non-dashboard route
      const page = pathPart1;
      if (IsDashboardContentExists()) {
        clearDashboardComponents();
        loadNavbar();
        loadFooter();
        location.reload();
      }
      loadPage(page);
    }
  }
});
window.navigate = navigate;


//initialNavigate func
export function initialNavigate(page) {
  clearDashboardComponents();
  loadNavbar();
  loadFooter();
  navigate(page);
}

window.initialNavigate = initialNavigate;

export function loadPage(page) {
  const pageUrl = `/Group_Project_48/frontend/pages/${page}.html`;
  const pageCssUrl = `/Group_Project_48/frontend/css/${page}.css`;
  const globalCssUrl = '/Group_Project_48/frontend/css/globals.css';
  const pageJsUrl = `/Group_Project_48/frontend/js/${page}.js`;

  const contentContainer = document.getElementById("content-container");
  const footerContainer = document.getElementById("footer-container");

  // Hide the footer while loading
  if (footerContainer) {
    footerContainer.style.visibility = "hidden";
  }

  // Show a loading message while resources are being loaded
  contentContainer.innerHTML = ``;

  // Helper function to load a CSS file and return a Promise
  function loadCss(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = resolve;
      link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
      document.head.appendChild(link);
    });
  }

  // Helper function to load a JavaScript file and return a Promise
  function loadJs(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.type = "module";
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load JavaScript: ${src}`));
      document.body.appendChild(script);
    });
  }

  // Fetch the HTML content
  fetch(pageUrl)
    .then((response) => {
      if (!response.ok) throw new Error("Page not found");
      return response.text();
    })
    .then((htmlContent) => {
      // Load CSS and JS resources in parallel
      Promise.all([
        loadCss(globalCssUrl),
        loadCss(pageCssUrl),
        loadJs(pageJsUrl),
      ])
        .then(() => {
          // Replace the loading message with the actual content
          contentContainer.innerHTML = htmlContent;

          // Show the footer after all resources are loaded
          if (footerContainer) {
            footerContainer.style.visibility = "visible";
          }

          // Execute page-specific initialization functions
          switch (page) {
            case 'home': inithome(); break;
            case 'login': initlogin(); break;
            case 'pricing': initpricing(); break;
            case 'about': initabout(); break;
            case 'becomeMember': initbecomeMember(); break;
            case 'findATrainer': initfindATrainer(); break;
            case 'careers': initcareers(); break;
            case 'services': initservices(); break;
            case 'forgotPassword': initforgotPassword(); break;
            case 'resetPw': initresetPw(); break;
            case 'trainerApplication': inittrainerApplication(); break;
            default: console.log("Page not defined within router");
          }
        })
        .catch((error) => {
          // Handle resource loading errors
          console.error(error);
          contentContainer.innerHTML = `<p>Error loading resources. Please try again later.</p>`;
        });
    })
    .catch(() => {
      // Handle HTML fetch errors
      contentContainer.innerHTML = `<p>404 - Page not found.</p>`;
    });
}


export function clearDashboardComponents() {
  document.getElementById("sidebar-container").innerHTML = '';
  document.getElementById("content-frame").src = '';
}

export function loadNavbar() {
  fetch("/Group_Project_48/frontend/components/navbar/navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      const logoImage = document.querySelector('.logo-black');
      if (logoImage) {
        logoImage.src = '/Group_Project_48/frontend/assets/images/logo-black-transparent.png';
      }

      // Dynamically load navbar.js
      const script = document.createElement('script');
      script.src = "/Group_Project_48/frontend/components/navbar/navbar.js";
      document.body.appendChild(script);
    })
    .catch(error => console.error('Error loading navbar:', error));

  const navbarLink = document.createElement('link');
  navbarLink.rel = 'stylesheet';
  navbarLink.href = '/Group_Project_48/frontend/components/navbar/navbar.css';
  document.head.appendChild(navbarLink);

  const globalCssLink = document.createElement('link');
  globalCssLink.rel = 'stylesheet';
  globalCssLink.href = '/Group_Project_48/frontend/css/globals.css';
}

export function loadFooter() {
  fetch("/Group_Project_48/frontend/components/footer/footer.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("footer-container").innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));

  const footerLink = document.createElement('link');
  footerLink.rel = 'stylesheet';
  footerLink.href = '/Group_Project_48/frontend/components/footer/footer.css';
  document.head.appendChild(footerLink);

  const globalCssLink = document.createElement('link');
  globalCssLink.rel = 'stylesheet';
  globalCssLink.href = '/Group_Project_48/frontend/css/globals.css';
}

export function isInitialNavigate() {
  const currentPath = window.location.pathname.replace('/Group_Project_48/', '');
  const role = currentPath.split('/')[0];
  if (['member', 'staff', 'trainer', 'owner', 'admin'].includes(role)) {
    return true;
  }
  return false;
}

function IsDashboardContentExists() {
  const sidebarContainer = document.getElementById('sidebar-container');
  const contentFrame = document.getElementById('content-frame');

  if (sidebarContainer && contentFrame) {
    if (sidebarContainer.innerHTML.trim() !== '' && contentFrame.src.trim() !== '') {
      return true;
    }
  }

  return false;
}


function IsNonDashboardContentExists() {
  const navbarContainer = document.getElementById('navbar-container');
  const footerContainer = document.getElementById('footer-container');
  const contentContainer = document.getElementById('content-container');

  if (navbarContainer && contentContainer) {
    if (navbarContainer.innerHTML.trim() !== '' && contentContainer.innerHTML.trim() !== '') {
      return true;
    }
  }

  return false;
}



//non-dashbaord functions
export function loadDashboardPage(role, page) {
  const pageUrl = `/Group_Project_48/frontend/pages/${role}/${page}.html`;
  const pageCssUrl = `/Group_Project_48/frontend/css/${role}/${page}.css`;
  const globalCssUrl = '/Group_Project_48/frontend/css/globals.css';
  const pageJsUrl = `/Group_Project_48/frontend/js/${role}/${page}.js`;

  // Set the iframe src to the dashboard page URL
  const contentFrame = document.getElementById("content-frame");
  if (contentFrame) {
    contentFrame.src = pageUrl;

    // Load the necessary CSS and JS files for the dashboard
    // loadCss(pageCssUrl);
    // loadJs(pageJsUrl);
    // loadGlobalCss(globalCssUrl);

    // Optionally, listen for iframe load events (for logging or further actions)
    contentFrame.onload = () => {
      console.log(`Dashboard page ${pageUrl} loaded successfully.`);
    };
    contentFrame.onerror = () => {
      console.error(`Failed to load dashboard page: ${pageUrl}`);
    };
  } else {
    console.error("Content frame not found. Ensure #content-frame exists in the DOM.");
  }
}

function clearNonDashboardComponents() {
  document.getElementById("navbar-container").innerHTML = '';
  document.getElementById("footer-container").innerHTML = '';
  document.getElementById("content-container").innerHTML = '';
}

function loadSidebar(role) {
  fetch(`/Group_Project_48/frontend/components/${role}Sidebar/${role}sideBar.html`)
    .then(response => response.text())
    .then(data => {
      document.getElementById("sidebar-container").innerHTML = data;

      // Dynamically load staffSidebar.js for sidebar functionality
      const script = document.createElement('script');
      script.src = `/Group_Project_48/frontend/components/${role}Sidebar/${role}sideBar.js`;
      document.body.appendChild(script);
    })
    .catch(error => console.error('Error loading sidebar:', error));

  const navbarLink = document.createElement('link');
  navbarLink.rel = 'stylesheet';
  navbarLink.href = `/Group_Project_48/frontend/components/${role}Sidebar/${role}sideBar.css`;
  document.head.appendChild(navbarLink);

  const globalCssLink = document.createElement('link');
  globalCssLink.rel = 'stylesheet';
  globalCssLink.href = '/Group_Project_48/frontend/css/globals.css';
}

function isInitialDashboardNavigate() {
  const currentPath = window.location.pathname.replace('/Group_Project_48/', '');
  const role = currentPath.split('/')[0];
  if (!['member', 'staff', 'trainer', 'owner', 'admin'].includes(role)) {
    return true;
  }
  return false;
}

function removeExistingCSSJS() {
  const currentPath = window.location.pathname.replace('/Group_Project_48/', '');
  const page = currentPath.split('/')[0];

  const pageCssUrl = `/Group_Project_48/frontend/css/${page}.css`;
  const pageJsUrl = `/Group_Project_48/frontend/js/${page}.js`;
  const globalCssUrl = '/Group_Project_48/frontend/css/globals.css';

  // Helper function to remove existing tags
  function removeExistingTags(selector) {
    const existingTags = document.querySelectorAll(selector);
    existingTags.forEach(tag => tag.remove());
  }

  // Remove existing CSS and JS related to the page
  removeExistingTags(`link[href="${pageCssUrl}"]`);
  removeExistingTags(`link[href="${globalCssUrl}"]`);
  removeExistingTags(`script[src="${pageJsUrl}"]`);
}


