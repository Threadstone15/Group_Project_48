//How to Setup a new page?
//1. Create a new file in the pages directory
//2. create a corresponding js file in the js directory
//3. create aa css file in the css directory
//4. Note : html,css,and js files must have the same name
//5. Make sure to enclose the js file with a outer function and to it import here(routeConfig.js)
//6. If a correspong html file has more  than one JS file, import them both to routeConfig.js
//7. Enter the corresponding url path of this new page under "validRoutes" : make sure that file name is same as corresponding url path name
//8. Then update the necessary function (runPageJS() or runDashboardPgJs()) with a proper switch case to run the 
//9. imported JS functions when the corresponding page loads


//import landingPg js funcs
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
import { initOwner_accounts } from "./owner/accounts.js";
import { initOwner_trainers } from "./owner/trainers.js";
import { initOwner_memberPlans } from "./owner/memberPlans.js";
import { initOwner_financialOver } from "./owner/financialOver.js";
import { initOwner_analytics } from "./owner/analytics.js";
import { initOwner_myAcnt } from "./owner/myAcnt.js";

//importing admin dashboardPg js funcs
import { initAdmin_home } from "./admin/adminHome.js";
import { initAdmin_accounts } from "./admin/accounts.js";
import { initAdmin_jobs } from "./admin/jobsAndNotices.js";
import { initAdmin_myAcnt } from "./admin/myAcnt.js";
import { initAdmin_paymentStat } from "./admin/paymentStatus.js";
import { initAdmin_systemHistory } from "./admin/systemHistory.js";
import { initAdmin_systemConfig } from "./admin/systemConfig.js";
import { initAdmim_gymNotices } from "./admin/gymNotices.js";
import { initAdmin_cashPayments } from "./admin/cashPayments.js";

//importing member dashboardPg js funcs
import { initMember_createPlan } from "./member/createPlan.js";
import { initMember_home } from "./member/memberHome.js";
import { initMember_myAcnt } from "./member/myAcnt.js";
import { initMember_trackProgress } from "./member/trackYourProgress.js";
import { initMember_upgradePlan } from "./member/upgradePlan.js";
import { initMember_myPlans } from "./member/myPlans.js";
import { initMember_workoutPlans } from "./member/workoutPlans.js";
import { initMember_workoutMealPlans } from "./member/workoutMealPlans.js";
import { initMember_payments } from "./member/payments.js";
import { initMember_getATrainer } from "./member/getATrainer.js";
import { initMember_contactTrainer } from "./member/contactTrainer.js";

//importing staff dashboardPg js funcs
import { initStaff_equipmentMaintain } from "./staff/equipMaintainance.js";
import { initStaff_equipment } from "./staff/gymEquipment.js";
import { initStaff_memberAttendance } from "./staff/memberAttendance.js"; 
import { initStaff_myAcnt } from "./staff/myAcnt.js";
import { initStaff_publishNotice } from "./staff/publishNotices.js";
import { initStaff_home } from "./staff/staffHome.js";
import { initStaff_memberPayments } from "./staff/memberPayments.js";

//import trainer dashboardPg js funcs
import { initTrainer_assignedMembers } from "./trainer/assignedMembers.js";
import { initTrainer_messages } from "./trainer/messages.js";
import { initTrainer_classSchedule } from "./trainer/classSchedule.js";
import { initTrainer_myAcnt } from "./trainer/myAcnt.js";
import { initTrainer_home } from "./trainer/trainerHome.js";
import { initTrainer_createMealPlans } from "./trainer/createMealPlans.js";
import { initTrainer_createWorkoutPlans } from "./trainer/createWorkoutPlans.js";
import { initTrainer_planRequests } from "./trainer/planRequests.js";

import { navigate } from "./router.js";

export const validRoutes = {
    landingPages: [
        "careers",
        "home",
        "services",
        "about",
        "pricing",
        "becomeMember",
        "findATrainer",
        "login",
        "forgotPassword",
        "trainerApplication"
    ],
    dashboards: {
        owner: [
            "owner/ownerHome",
            "owner/accounts",
            "owner/trainers",
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
            "member/workoutPlans",
            "member/workoutMealPlans",
            "member/upgradePlan",
            "member/myAcnt",
            "member/myPlans",
            "member/contactTrainer"
        ],
        admin: [
            "admin/adminHome",
            "admin/accounts",
            "admin/jobsAndNotices",
            "admin/paymentStatus",
            "admin/myAcnt",
            "admin/systemHistory",
            "admin/systemConfig",
            "admin/gymNotices",
            "admin/cashPayments"
        ],
        staff: [
            "staff/staffHome",
            "staff/memberAttendance",
            "staff/gymEquipment",
            "staff/equipMaintainance",
            "staff/publishNotices",
            "staff/myAcnt",
            "staff/memberPayments"
        ],
        trainer: [
            "trainer/trainerHome",
            "trainer/messages",
            "trainer/assignedMembers",
            "trainer/myAcnt",
            "trainer/classSchedule",
            "trainer/createWorkoutPlans",
            "trainer/createMealPlans",
            "trainer/planRequests"
        ]
    }
};


export function runPageJS(page) {
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

export function runDashboardPgJS(role, page) {
    //run JS of each dashboard page
    if(role == 'admin'){
        switch(page){
            case 'adminHome' : initAdmin_home(); break;
            case 'accounts' : initAdmin_accounts(); break;
            case 'jobsAndNotices' : initAdmin_jobs(); break;
            case 'myAcnt' : initAdmin_myAcnt(); break;
            case 'paymentStatus' : initAdmin_paymentStat(); break;
            case 'systemHistory' : initAdmin_systemHistory(); break;
            case 'systemConfig' : initAdmin_systemConfig(); break;
            case 'gymNotices' : initAdmim_gymNotices(); break;
            case 'cashPayments' : initAdmin_cashPayments(); break;
            default : console.error("Undefined admin dashboard page js func"); break;
        }
    }
    if (role == 'owner') {
        switch (page) {
            case 'ownerHome': initOwner_home(); break;
            case 'accounts': initOwner_accounts(); break;
            case 'trainers': initOwner_trainers(); break;
            case 'financialOver': initOwner_financialOver() ; break;
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
            case 'payments' : initMember_payments(); break;
            case 'upgradePlan' : initMember_upgradePlan(); break;
            case 'myPlans' : initMember_myPlans(); break;
            case 'workoutPlans' : initMember_workoutPlans(); break;
            case 'workoutMealPlans' : initMember_workoutMealPlans(); break;
            case 'getATrainer' : initMember_getATrainer(); break;
            case 'contactTrainer' : initMember_contactTrainer(); break;
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
            case 'memberPayments' : initStaff_memberPayments(); break;
            default : console.error("Undefined staff dashboard pg js func"); break;
        }
    }
    if(role == 'trainer'){
        switch(page){
            case 'trainerHome' : initTrainer_home(); break;
            case 'messages' : initTrainer_messages(); break;
            case 'classSchedule' : initTrainer_classSchedule(); break;
            case 'myAcnt' : initTrainer_myAcnt(); break;
            case 'trainerHome' : initTrainer_home(); break;
            case 'createWorkoutPlans' : initTrainer_createWorkoutPlans(); break;
            case 'createMealPlans' : initTrainer_createMealPlans(); break;
            case 'planRequests' : initTrainer_planRequests(); break;
            case 'assignedMembers' : initTrainer_assignedMembers(); break;


            default : console.error("Undefined trainer dashboard "); break;
        }
    }
}

export function runSessionTimedOut() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    navigate('login');     
}