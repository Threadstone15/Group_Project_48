import { initialNavigate } from './js/router.js';
import { initialNavigateDashboard } from './js/dashboardRouter.js';

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname === '/Group_Project_48/' ? 'home' : window.location.pathname.replace('/Group_Project_48/', '');

  // Determine if loading a dashboard
  const role = path.split('/')[0];
  console.log("role is"+role);
  if (['member', 'staff', 'trainer', 'owner', 'admin'].includes(role)) {
    const page = path.split('/')[1];
    console.log("page is"+page);
    initialNavigateDashboard(role, page);
  } else {
    initialNavigate(path);
  }
});
