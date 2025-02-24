import { initabout } from "./about.js";
import { initbecomeMember } from "./becomeMember.js";
import { initcareers } from "./careers.js";
import { initfindATrainer } from "./findATrainer.js";
import { initforgotPassword } from "./forgotPassword.js";
import { inithome } from "./home.js";
import { initlogin, notifySessionTimedOut } from "./login.js";
import { initpricing } from "./pricing.js";
import { initresetPw } from "./resetPw.js";
import { initservices } from "./services.js";
import { inittrainerApplication } from "./trainerApplication.js";

//import owner dashboardPg js funcs
import { initOwner_home } from "./owner/ownerHome.js";
import { initOwner_gymMembers } from "./owner/gymMembers.js";
import { initOwner_trainers } from "./owner/trainers.js";
import { initOwner_memberPlans } from "./owner/memberPlans.js";
import { initOwner_staff } from "./owner/staff.js";
import { initOwner_financialOver } from "./owner/financialOver.js";
import { initOwner_analytics } from "./owner/analytics.js";
import { initOwner_myAcnt } from "./owner/myAcnt.js";

//importing admin dashboardPg js funcs
import { initAdmin_home } from "./admin/adminHome.js";
import { initAdmin_accounts } from "./admin/accounts.js";
import { initAdmin_jobs } from "./admin/jobsAndNotices.js";
import { initAdmin_myAcnt } from "./admin/myAcnt.js";
import { initAdmin_paymentStat } from "./admin/paymentStatus.js";

//importing member dashboardPg js funcs
import { initMember_createPlan } from "./member/createPlan.js";
import { initMember_home } from "./member/memberHome.js";
import { initMember_myAcnt } from "./member/myAcnt.js";
import { initMember_trackProgress } from "./member/trackYourProgress.js";
import { initMember_upgradePlan } from "./member/upgradePlan.js";
import { initMember_viewPlan } from "./member/viewPlan.js";
import { initMember_workoutMealPlan } from "./member/workoutMealPlans.js";

//importing staff dashboardPg js funcs
import { initStaff_equipmentMaintain } from "./staff/equipMaintainance.js";
import { initStaff_equipment } from "./staff/gymEquipment.js";
import { initStaff_memberAttendance } from "./staff/memberAttendance.js"; 
import { initStaff_myAcnt } from "./staff/myAcnt.js";
import { initStaff_publishNotice } from "./staff/publishNotices.js";
import { initStaff_home } from "./staff/staffHome.js";

//import trainer dashboardPg js funcs
import { initTrainer_assignedMembers } from "./trainer/assignedMembers.js";
import { initTrainer_classSchedule } from "./trainer/classSchedule.js";
import { initTrainer_myAcnt } from "./trainer/myAcnt.js";
import { initTrainer_home } from "./trainer/trainerHome.js";
import { initTrainer_workoutMealPlans } from "./trainer/workoutMealPlans.js";

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
        removeExistingDashboardCSSJS();
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
        removeExistingDashboardCSSJS();
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

function removeExistingDashboardCSSJS() {
    const currentPath = window.location.pathname.replace('/Group_Project_48/', '');
    const role = currentPath.split('/')[0];
    const page = currentPath.split('/')[1];

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


// function loadDashboardPage(role, page) {
//     const pageUrl = `/Group_Project_48/frontend/pages/${role}/${page}.html`;

//     // Set the iframe src to the dashboard page URL
//     const contentFrame = document.getElementById("content-frame");
//     if (contentFrame) {
//         contentFrame.src = pageUrl;

//         // Optionally, listen for iframe load events (for logging or further actions)
//         contentFrame.onload = () => {
//             console.log(`Dashboard page ${pageUrl} loaded successfully.`);
//         };
//         contentFrame.onerror = () => {
//             console.error(`Failed to load dashboard page: ${pageUrl}`);
//         };
//     } else {
//         console.error("Content frame not found. Ensure #content-frame exists in the DOM.");
//     }
// }

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

export function runSessionTimedOut() {
    // Session timed out, redirect to login page
    navigate('login');
    notifySessionTimedOut();
}

function runDashboardPgJS(role, page) {
    //run JS of each dashboard page
    if(role == 'admin'){
        switch(page){
            case 'adminHome' : initAdmin_home(); break;
            case 'accounts' : initAdmin_accounts(); break;
            case 'jobsAndNotices' : initAdmin_jobs(); break;
            case 'myAcnt' : initAdmin_myAcnt(); break;
            case 'paymentStatus' : initAdmin_paymentStat(); break;
            default : console.error("Undefined admin dashboard page js func"); break;
        }
    }
    if (role == 'owner') {
        switch (page) {
            case 'ownerHome': initOwner_home(); break;
            case 'gymMembers': initOwner_gymMembers(); break;
            case 'trainers': initOwner_trainers(); break;
            case 'staff': initOwner_staff(); break;
            case 'financialOver': initOwner_financialOver(); break;
            case 'memberPlans': initOwner_memberPlans(); break;
            case 'analytics': initOwner_analytics(); break;
            case 'myAcnt': initOwner_myAcnt(); break;
            default: console.error("Unndefined owner dashboard pageJS func"); break;
        }
    }
    if (role == 'member'){
        switch (page) {
            case 'memberHome': initMember_home(); break;
            case 'createPlan' : initMember_createPlan();break;
            case 'myAcnt' : initMember_myAcnt(); break;
            case 'trackYourProgress' : initMember_trackProgress(); break;
            case 'upgradePlan' : initMember_upgradePlan(); break;
            case 'viewPlan' : initMember_viewPlan(); break;
            case 'workoutMealPlans' : initMember_workoutMealPlan(); break;
            default : console.error("Undefined member dashboard page js func"); break;
        }
    }
    if(role == 'staff'){
        switch(page){
            case 'staffHome' : initStaff_home(); break;
            case 'equipMaintainance' : initStaff_equipmentMaintain(); break;
            case 'gymEquipment' : initStaff_equipment(); break;
            case 'memberAttendance' : initStaff_memberAttendance(); break;
            case 'myAcnt' : initStaff_myAcnt(); break;
            case 'publishNotices' : initStaff_publishNotice(); break;
            default : console.error("Undefined staff dashboard pg js func"); break;
        }
    }
    if(role == 'trainer'){
        switch(page){
            case 'trainerHome' : initTrainer_home(); break;
            case 'classSchedule' : initTrainer_classSchedule(); break;
            case 'myAcnt' : initTrainer_myAcnt(); break;
            case 'trainerHome' : initTrainer_home(); break;
            case 'workoutMealPlans' : initTrainer_workoutMealPlans(); break;
            default : console.error("Undefined trainer dashboard "); break;
        }
    }
}