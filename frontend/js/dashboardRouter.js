export function navigateDashboard(role, page) {
  if(isInitialDashboardNavigate()){
    //removing non-dashboard navbar, footer, page content if presents
    clearNonDashboardComponents();
    //then load the sidebar
    loadSidebar(role);
  }
  loadDashboardPage(role, page);
  history.pushState({ page: `${role}/${page}` }, "", `/Group_Project_48/${role}/${page}`);
}

// Handle browser back/forward navigation
// window.addEventListener("popstate", () => {
//   const state = history.state;
//   if (state?.page) {
//     const [role, page] = state.page.split('/');

//     if(initialNavigateDashboard()){
//       clearNonDashboardComponents();
//       loadSidebar(role);
//     }
//     loadDashboardPage(role, page);
//   }
// });

window.navigateDashboard = navigateDashboard;

export function initialNavigateDashboard(role, page){
  clearNonDashboardComponents();
  loadSidebar(role);
  navigateDashboard(role, page);
}

window.initialNavigateDashboard = initialNavigateDashboard;

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
  document.head.appendChild(globalCssLink);
}

function isInitialDashboardNavigate() {
  const currentPath = window.location.pathname.replace('/Group_Project_48/', '');
  const role = currentPath.split('/')[0];
  if (!['member', 'staff', 'trainer', 'owner', 'admin'].includes(role)) {
    return true;
  }
  return false;
}


