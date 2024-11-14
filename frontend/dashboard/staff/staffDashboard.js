import { navigateStaff } from "../../js/staff/staffRouter.js";

document.addEventListener("DOMContentLoaded", () => {
  loadSidebar();

   // Get the current path dynamically and load the respective page
  //  const path = window.location.pathname.replace("/Group_Project_48/staff/", "") || "memberAttendance";
   navigateStaff(path); // Dynamically load based on logical path
});

function loadSidebar() {
  fetch("/Group_Project_48/frontend/components/staffSidebar/staffsideBar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("sidebar-container").innerHTML = data;

      const logoImage = document.querySelector('.sidebar-logo-black');
      if (logoImage) {
        logoImage.src = '/Group_Project_48/frontend/assets/images/logo-black-transparent.png';
      }

      // Dynamically load staffSidebar.js for sidebar functionality
      const script = document.createElement('script');
      script.src = "/Group_Project_48/frontend/components/staffSidebar/staffSidebar.js";
      document.body.appendChild(script);
    })
    .catch(error => console.error('Error loading sidebar:', error));

  const navbarLink = document.createElement('link');
  navbarLink.rel = 'stylesheet';
  navbarLink.href = '/Group_Project_48/frontend/components/staffSidebar/staffSidebar.css';
  document.head.appendChild(navbarLink);
}
