export function navigate(page) {
  if(isInitialNavigate()){
    //clearing dashbaord components if present
    clearDashboardComponents();
    //then load navbar and footer
    loadNavbar();
    loadFooter();
  }
  loadPage(page);
  history.pushState({ page }, "", `/Group_Project_48/${page}`);
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
export function initialNavigate(page){
  clearDashboardComponents();
  loadNavbar();
  loadFooter();
  navigate(page);
}

window.initialNavigate = initialNavigate;

// Dynamic page loading for non-dashboard pages
export function loadPage(page) {
  const pageUrl = `/Group_Project_48/frontend/pages/${page}.html`;
  const pageCssUrl = `/Group_Project_48/frontend/css/${page}.css`;
  const pageCssUrl2 = '/Group_Project_48/frontend/css/globals.css';
  const pageJsUrl = `/Group_Project_48/frontend/js/${page}.js`;

  fetch(pageUrl)
    .then((response) => {
      if (!response.ok) throw new Error("Page not found");
      return response.text();
    })
    .then((data) => {
      document.getElementById("content-container").innerHTML = data;

      // Append page-specific CSS
      if (!document.querySelector(`link[href="${pageCssUrl}"]`)) {
        const pageCssLink = document.createElement("link");
        pageCssLink.rel = "stylesheet";
        pageCssLink.href = pageCssUrl;
        document.head.appendChild(pageCssLink);
      }

      // Append global CSS
      if (!document.querySelector(`link[href="${pageCssUrl2}"]`)) {
        const globalCssLink = document.createElement("link");
        globalCssLink.rel = "stylesheet";
        globalCssLink.href = pageCssUrl2;
        document.head.appendChild(globalCssLink);
      }

      // Append page-specific JavaScript
      if (!document.querySelector(`script[src="${pageJsUrl}"]`)) {
        const script = document.createElement("script");
        script.src = pageJsUrl;
        document.body.appendChild(script);
      }
    })
    .catch(() => {
      document.getElementById("content-container").innerHTML = `<p>404 - Page not found.</p>`;
    });
}

export function clearDashboardComponents() {
  document.getElementById("sidebar-container").innerHTML = '';
  document.getElementById("content-area").innerHTML = '';
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
  const contentContainer = document.getElementById('content-area');
  
  if (sidebarContainer && contentContainer) {
    if (sidebarContainer.innerHTML.trim() !== '' && contentContainer.innerHTML.trim() !== '') {
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

  fetch(pageUrl)
    .then((response) => {
      if (!response.ok) throw new Error("Page not found");
      return response.text();
    })
    .then((data) => {
      document.getElementById("content-area").innerHTML = data;

      loadCss(pageCssUrl);
      loadJs(pageJsUrl);
      loadGlobalCss(globalCssUrl);
    })
    .catch(() => {
      document.getElementById("content-area").innerHTML = `<p>404 - Page not found.</p>`;
    });
}

function loadCss(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}

function loadGlobalCss(href){
  if (!document.querySelector(`link[href="${href}"]`)) {
    const globalCssLink = document.createElement("link");
    globalCssLink.rel = "stylesheet";
    globalCssLink.href = href;
    document.head.appendChild(globalCssLink);
  }
}

function loadJs(src) {
  if (!document.querySelector(`script[src="${src}"]`)) {
    const script = document.createElement("script");
    script.src = src;
    document.body.appendChild(script);
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



