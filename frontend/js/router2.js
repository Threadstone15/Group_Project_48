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

const validRoutes = {
    landingPages: [
        "careers",
        "home",
        "services",
        "about",
        "pricing",
        "becomeMember",
        "findATrainer",
        "login",
        "forgotPassword"
    ],
    dashboards: {
        owner: [
            "owner/ownerHome",
            "owner/gymMembers",
            "owner/trainers",
            "owner/staff",
            "owner/financialOver",
            "owner/memberPlans",
            "owner/analytics",
            "owner/myAcnt"
        ],
        member: [
            "member/memberHome",
            "member/getATrainer",
            "member/payments",
            "member/trackYourProgress",
            "member/workoutMealPlans",
            "member/upgradePlan",
            "member/myAcnt",
        ],
        admin: [
            "admin/adminHome",
            "admin/accounts",
            "admin/jobsAndNotices",
            "admin/paymentStatus",
            "admin/myAcnt"
        ],
        staff: [
            "staff/staffHome",
            "staff/memberAttendance",
            "staff/gymEquipment",
            "staff/equipMaintainance",
            "staff/publishNotices",
            "staff/myAcnt"
        ],
        trainer: [
            "trainer/trainerHome",
            "trainer/assignedMembers",
            "trainer/workoutMealPlans",
            "trainer/myAcnt",
            "trainer/classSchedule"
        ]
    }
};

export function navigate(path) {
    //for landing pages
    if (isLandingPg(path)) {
        //this is a landing pg
        console.log("Landing Page path" + path);
        removeExistingCSSJS();
        if (isInitialLandingPgNavigate()) {
            //this is the first time navigating to this landing pg
            console.log("first time landing pg navigate");
            clearAndHideDashboardComponents();
            loadLandingPgComponents();
            loadLandingPg(path);
            history.pushState({ path }, "", `/Group_Project_48/${path}`);
            location.reload();
        } else {
            //this is not the first time navigating to this landing pg
            console.log("not first time landing pg navigate");
            loadLandingPg(path);
            history.pushState({ path }, "", `/Group_Project_48/${path}`);
        }
    }
    //for dashboard pages
    if (isDashboardPg(path)) {
        //this is a dashboard pg
        console.log("Dashboard Page path" + path);
        const role = path.split('/')[0];
        const page = path.split('/')[1];

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
    if (isLandingPg(path)) {
        //this is a landing pg
        console.log("Landing Page path" + path);
        removeExistingCSSJS();
        if (isInitialLandingPgNavigate()) {
            //this is the first time navigating to this landing pg
            console.log("first time landing pg navigate");
            clearAndHideDashboardComponents();
            loadLandingPgComponents();
            loadLandingPg(path);
            location.reload();
        } else {
            //this is not the first time navigating to this landing pg
            console.log("not first time landing pg navigate");
            loadLandingPg(path);
        }
    }

    //for dashboard pages
    if (isDashboardPg(path)) {
        //this is a dashboard pg
        console.log("Dashboard Page path" + path);
        const role = path.split('/')[0];
        const page = path.split('/')[1];

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
    //for landing pages
    if (isLandingPg(path)) {
        clearAndHideDashboardComponents();
        loadLandingPgComponents();
        loadLandingPg(path);
        history.pushState({ path }, "", `/Group_Project_48/${path}`);
    }
    //for dashboard pages
    if (isDashboardPg(path)) {
        const role = path.split('/')[0];
        const page = path.split('/')[1];

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
    removeExistingTags(`link[href="${pageCssUrl}"]`);
    // removeExistingTags(`link[href="${globalCssUrl}"]`);
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

    const dashboardContent = document.getElementById("content-frame");
    dashboardContent.src = ''; //iframe elemnt

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

function runPageJS(page) {
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
    const contentFrame = document.getElementById('content-frame');

    if (sidebarContainer && contentFrame) {
        if (sidebarContainer.innerHTML.trim() !== '' && contentFrame.src.trim() !== '') {
            return false;
        }
        return true;
    }

    return false;
}

function clearAndHideLandingPgComponents() {
    const navbarContainer = document.getElementById("navbar-container");
    navbarContainer.innerHTML = '';
    navbarContainer.style.visibility = "hideen";


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

    // Set the iframe src to the dashboard page URL
    const contentFrame = document.getElementById("content-frame");
    if (contentFrame) {
        contentFrame.src = pageUrl;

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