import { runPageJS, runDashboardPgJS, validRoutes } from "./routeConfig.js";

export function navigate(path) {
    const basePath = extractBasePath(path); //incase if URL parameters exist
    //for landing pages
    if (isLandingPg(basePath)) {
        //this is a landing pg
        console.log("Landing Page path" + path);
        removeExistingCSSJS();
        if (isInitialLandingPgNavigate()) {
            //this is the first time navigating to this landing pg
            console.log("first time landing pg navigate");
            clearAndHideDashboardComponents();
            loadLandingPgComponents();
            loadLandingPg(basePath);
            history.pushState({ path }, "", `/Group_Project_48/${path}`);
            location.reload();
        } else {
            //this is not the first time navigating to this landing pg
            console.log("not first time landing pg navigate");
            loadLandingPg(basePath);
            history.pushState({ path }, "", `/Group_Project_48/${path}`);
        }
    }
    //for dashboard pages
    if (isDashboardPg(basePath)) {
        //this is a dashboard pg
        console.log("Dashboard Page path" + path);
        removeExistingDashboardCSSJS();
        const role = basePath.split('/')[0];
        const page = basePath.split('/')[1];

        const storedRole = localStorage.getItem('role');
        if (!storedRole || storedRole !== role) {
            navigate('login');
            return;
        }
        if (isInitialDashboardPgNavigate()) {
            //this is the first time navigating to this dashboard pg
            console.log("first stime navigating dashboard pg");
            clearAndHideLandingPgComponents();
            loadDashboardPgComponents(role);
            loadDashboardPage(role, page);
            history.pushState({ path }, "", `/Group_Project_48/${path}`);
        } else {
            console.log("not first time dashboard pg navigate");
            loadDashboardPage(role, page);
            history.pushState({ path }, "", `/Group_Project_48/${path}`);
        }

    }
}

window.addEventListener("popstate", () => {
    const state = history.state;
    const path = state.path;

    if (!path) {
        return;
    }
    const basePath = extractBasePath(path); //incase if URL parameters exist
    if (isLandingPg(basePath)) {
        //this is a landing pg
        console.log("Landing Page path" + path);
        removeExistingCSSJS();
        if (isInitialLandingPgNavigate()) {
            //this is the first time navigating to this landing pg
            console.log("first time landing pg navigate");
            clearAndHideDashboardComponents();
            loadLandingPgComponents();
            loadLandingPg(basePath);
            location.reload();
        } else {
            //this is not the first time navigating to this landing pg
            console.log("not first time landing pg navigate");
            loadLandingPg(basePath);
        }
    }

    //for dashboard pages
    if (isDashboardPg(basePath)) {
        //this is a dashboard pg
        console.log("Dashboard Page path" + path);
        removeExistingDashboardCSSJS();
        const role = basePath.split('/')[0];
        const page = basePath.split('/')[1];

        const storedRole = localStorage.getItem('role');
        if (!storedRole || storedRole !== role) {
            navigate('login');
            return;
        }
        if (isInitialDashboardPgNavigate()) {
            //this is the first time navigating to this dashboard pg
            clearAndHideLandingPgComponents();
            loadDashboardPgComponents(role);
            loadDashboardPage(role, page);
            location.reload();
        } else {
            loadDashboardPage(role, page);
        }

    }
});


window.navigate = navigate;

export function initialPageLoad(path) {
    const basePath = extractBasePath(path);
    //for landing pages
    if (isLandingPg(basePath)) {
        clearAndHideDashboardComponents();
        loadLandingPgComponents();
        loadLandingPg(basePath);
        history.pushState({ path }, "", `/Group_Project_48/${path}`);
    }
    //for dashboard pages
    if (isDashboardPg(basePath)) {
        const role = basePath.split('/')[0];
        const page = basePath.split('/')[1];

        const storedRole = localStorage.getItem('role');
        if (!storedRole || storedRole !== role) {
            navigate('login');
            return;
        }
        clearAndHideLandingPgComponents();
        loadDashboardPgComponents(role);
        loadDashboardPage(role, page);
        history.pushState({ path }, "", `/Group_Project_48/${path}`);

    }
}

function isLandingPg(path) {
    if (validRoutes.landingPages.includes(path)) {
        return true;
    }
}

function isDashboardPg(path) {
    for (const role in validRoutes.dashboards) {
        if (validRoutes.dashboards[role].includes(path)) {
            return true;
        }
    }
}

function extractBasePath(path){
    const basePath = path.split("?")[0]; //extract base path form the url if parameters exist
    return basePath;
}

function removeExistingCSSJS() {
    const currentPath = window.location.pathname.replace('/Group_Project_48/', '');
    const basePath = extractBasePath(currentPath);
    const page = basePath.split('/')[0];

    const pageCssUrl = `/Group_Project_48/frontend/css/${page}.css`;
    const pageJsUrl = `/Group_Project_48/frontend/js/${page}.js`;
    const globalCssUrl = '/Group_Project_48/frontend/css/globals.css';

    // Helper function to remove existing tags
    function removeExistingTags(selector) {
        const existingTags = document.querySelectorAll(selector);
        existingTags.forEach(tag => tag.remove());
    }
    removeExistingTags(`link[href="${pageCssUrl}"]`);
    // removeExistingTags(`link[href="${globalCssUrl}"]`);
    removeExistingTags(`script[src="${pageJsUrl}"]`);
}

function removeExistingDashboardCSSJS() {
    const currentPath = window.location.pathname.replace('/Group_Project_48/', '');
    const basePath = extractBasePath(currentPath);
    const role = basePath.split('/')[0];
    const page = basePath.split('/')[1];

    const pageCssUrl = `/Group_Project_48/frontend/css/${role}/${page}.css`;
    const pageJsUrl = `/Group_Project_48/frontend/js/${role}/${page}.js`;
    const globalCssUrl = '/Group_Project_48/frontend/css/globals.css';

    // Helper function to remove existing tags
    function removeExistingTags(selector) {
        const existingTags = document.querySelectorAll(selector);
        existingTags.forEach(tag => tag.remove());
    }
    removeExistingTags(`link[href="${pageCssUrl}"]`);
    removeExistingTags(`link[href="${globalCssUrl}"]`);
    removeExistingTags(`script[src="${pageJsUrl}"]`);
}

function isInitialLandingPgNavigate() {
    //checking whether elements  langing pg elemnts exists
    const navbarContainer = document.getElementById('navbar-container');
    const footerContainer = document.getElementById('footer-container');
    const contentContainer = document.getElementById('content-container');

    if (navbarContainer && contentContainer) {
        if (navbarContainer.innerHTML.trim() !== '' && contentContainer.innerHTML.trim() !== '') {
            return false;
        }
        return true;
    }

    return false;
}

function clearAndHideDashboardComponents() {
    const sidebarContainer = document.getElementById("sidebar-container");
    sidebarContainer.innerHTML = '';
    sidebarContainer.style.visibility = "hidden";

    const dashboardPgContent = document.getElementById("content-area");
    dashboardPgContent.innerHTML = '';

    const dashbaordContainer = document.getElementById("dashboard-content");
    dashbaordContainer.style.visibility = "hidden";
}


function loadLandingPg(page) {
    const pageUrl = `/Group_Project_48/frontend/pages/${page}.html`;
    const pageCssUrl = `/Group_Project_48/frontend/css/${page}.css`;
    const globalCssUrl = '/Group_Project_48/frontend/css/globals.css';
    const pageJsUrl = `/Group_Project_48/frontend/js/${page}.js`;

    const contentContainer = document.getElementById("content-container");
    contentContainer.innerHTML = "";
    hideFooter(); //hiding while loading page

    loadGlobalCss(globalCssUrl);
    loadCss(pageCssUrl);
    loadJs(pageJsUrl);

    fetch(pageUrl)
        .then((response) => {
            if (!response.ok) throw new Error("Page not found");
            return response.text();
        })
        .then((data) => {
            document.getElementById("content-container").innerHTML = data;
            showFooter(); //make foot vsible after page loads
            runPageJS(page);
        })
        .catch(() => {
            document.getElementById("content-container").innerHTML = `<p>404 - Page not found.</p>`;
            showFooter();
        });
}

function loadGlobalCss(link) {
    const globalCssLink = document.createElement("link");
    globalCssLink.rel = "stylesheet";
    globalCssLink.href = link;
    document.head.appendChild(globalCssLink);
}

function loadCss(link) {
    const pageCssLink = document.createElement("link");
    pageCssLink.rel = "stylesheet";
    pageCssLink.href = link;
    document.head.appendChild(pageCssLink);
}

function loadJs(link) {
    const script = document.createElement("script");
    script.src = link;
    script.type = "module";
    document.body.appendChild(script);
}


function hideFooter() {
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
        footerContainer.style.visibility = "hidden";
    }
}

function showFooter() {
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
        footerContainer.style.visibility = "visible";
    }
}

function loadLandingPgComponents() {
    const navbarContainer = document.getElementById("navbar-container");
    navbarContainer.style.visibility = "visible";
    loadNavbar();

    const footerContainer = document.getElementById("footer-container");
    footerContainer.style.visibility = "visible";
    loadFooter();

    const landingPgContainer = document.getElementById("content-container");
    landingPgContainer.style.visibility = "visible";
}

function loadNavbar() {
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

function loadFooter() {
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

//dashboard pg related functions
function isInitialDashboardPgNavigate() {
    const sidebarContainer = document.getElementById('sidebar-container');
    const dashboardPgContainer = document.getElementById('content-area');

    if (sidebarContainer && dashboardPgContainer) {
        if (sidebarContainer.innerHTML.trim() !== '' && dashboardPgContainer.innerHTML.trim() !== '') {
            return false;
        }
        return true;
    }

    return false;
}

function clearAndHideLandingPgComponents() {
    const navbarContainer = document.getElementById("navbar-container");
    navbarContainer.innerHTML = '';
    navbarContainer.style.visibility = "hidden";


    const footerContainer = document.getElementById("footer-container");
    footerContainer.innerHTML = '';
    footerContainer.style.visibility = "hidden";

    const landingPgContainer = document.getElementById("content-container");
    landingPgContainer.innerHTML = '';
    landingPgContainer.style.visibility = "hidden";
}

function loadDashboardPgComponents(role) {
    const sidebarContainer = document.getElementById("sidebar-container");
    sidebarContainer.style.visibility = "visible";

    const dashboardContent = document.getElementById("dashboard-content");
    dashboardContent.style.visibility = "visible";
    loadSidebar(role);
}


function loadSidebar(role) {
    fetch(`/Group_Project_48/frontend/components/${role}Sidebar/${role}sideBar.html`)
        .then(response => response.text())
        .then(data => {
            document.getElementById("sidebar-container").innerHTML = data;

            // Dynamically load staffSidebar.js for sidebar functionality
            const script = document.createElement('script');
            script.src = `/Group_Project_48/frontend/components/${role}Sidebar/${role}sideBar.js`;
            script.type = "module";
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

function loadDashboardPage(role, page) {
    const pageUrl = `/Group_Project_48/frontend/pages/${role}/${page}.html`;
    const pageCssUrl = `/Group_Project_48/frontend/css/${role}/${page}.css`;
    const globalCssUrl = '/Group_Project_48/frontend/css/globals.css';
    const pageJsUrl = `/Group_Project_48/frontend/js/${role}/${page}.js`;

    const dashboardPgContainer = document.getElementById("content-area");
    dashboardPgContainer.innerHTML = "";

    loadGlobalCss(globalCssUrl); //defined above
    loadCss(pageCssUrl); //defined above
    loadJs(pageJsUrl); //defined above

    fetch(pageUrl)
        .then((response) => {
            if (!response.ok) throw new Error("Page not found");
            return response.text();
        })
        .then((data) => {
            dashboardPgContainer.innerHTML = data;
            console.log(`Dashboard page ${pageUrl} loaded successfully.`);
            //run JS of each dashboard page
            runDashboardPgJS(role, page);
        })
        .catch(() => {
            dashboardPgContainer.innerHTML = `<p>404 - Page not found.</p>`;
            console.error(`Failed to load dashboard page: ${pageUrl}`);
        });
}