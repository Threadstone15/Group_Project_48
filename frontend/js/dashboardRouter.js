// export function navigateDashboard(role, page) {
//   const storedRole = localStorage.getItem('role');
//   if (!storedRole || storedRole !== role) {
//     navigate('login');
//     return;
//   }
//   if (isInitialDashboardNavigate()) {
//     //removing non-dashboard navbar, footer, page content if presents
//     clearNonDashboardComponents();
//     //then load the sidebar
//     loadSidebar(role);
//     loadDashboardPage(role, page);
//     history.pushState({ page: `${role}/${page}` }, "", `/Group_Project_48/${role}/${page}`);
//     location.reload();
//     return;
//   }
//   loadDashboardPage(role, page);
//   history.pushState({ page: `${role}/${page}` }, "", `/Group_Project_48/${role}/${page}`);
// }

// window.navigateDashboard = navigateDashboard;

// export function initialNavigateDashboard(role, page) {
//   const storedRole = localStorage.getItem('role');
//   if (!storedRole || storedRole !== role) {
//     navigate('login');
//     return;
//   }
//   clearNonDashboardComponents();
//   loadSidebar(role);
//   navigateDashboard(role, page);
// }

// window.initialNavigateDashboard = initialNavigateDashboard;

// export function loadDashboardPage(role, page) {
//   const pageUrl = `/Group_Project_48/frontend/pages/${role}/${page}.html`;

//   // Set the iframe src to the dashboard page URL
//   const contentFrame = document.getElementById("content-frame");
//   if (contentFrame) {
//     contentFrame.src = pageUrl;

//     // Optionally, listen for iframe load events (for logging or further actions)
//     contentFrame.onload = () => {
//       console.log(`Dashboard page ${pageUrl} loaded successfully.`);
//     };
//     contentFrame.onerror = () => {
//       console.error(`Failed to load dashboard page: ${pageUrl}`);
//     };
//   } else {
//     console.error("Content frame not found. Ensure #content-frame exists in the DOM.");
//   }
// }

// function clearNonDashboardComponents() {
//   document.getElementById("navbar-container").innerHTML = '';
//   document.getElementById("footer-container").innerHTML = '';
//   document.getElementById("content-container").innerHTML = '';
// }

// function loadSidebar(role) {
//   fetch(`/Group_Project_48/frontend/components/${role}Sidebar/${role}sideBar.html`)
//     .then(response => response.text())
//     .then(data => {
//       document.getElementById("sidebar-container").innerHTML = data;

//       // Dynamically load staffSidebar.js for sidebar functionality
//       const script = document.createElement('script');
//       script.src = `/Group_Project_48/frontend/components/${role}Sidebar/${role}sideBar.js`;
//       document.body.appendChild(script);
//     })
//     .catch(error => console.error('Error loading sidebar:', error));

//   const navbarLink = document.createElement('link');
//   navbarLink.rel = 'stylesheet';
//   navbarLink.href = `/Group_Project_48/frontend/components/${role}Sidebar/${role}sideBar.css`;
//   document.head.appendChild(navbarLink);

//   const globalCssLink = document.createElement('link');
//   globalCssLink.rel = 'stylesheet';
//   globalCssLink.href = '/Group_Project_48/frontend/css/globals.css';
//   document.head.appendChild(globalCssLink);
// }

// function isInitialDashboardNavigate() {
//   const currentPath = window.location.pathname.replace('/Group_Project_48/', '');
//   const role = currentPath.split('/')[0];
//   if (!['member', 'staff', 'trainer', 'owner', 'admin'].includes(role)) {
//     return true;
//   }
//   return false;
// }


