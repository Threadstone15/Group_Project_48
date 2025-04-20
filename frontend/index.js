import { initialPageLoad } from "./js/router.js";

document.addEventListener("DOMContentLoaded", () => {
  loadGlobalCss();
  const path = window.location.pathname === '/Group_Project_48/' ? 'home' : window.location.pathname.replace('/Group_Project_48/', '');
  initialPageLoad(path);
});

function loadGlobalCss(){
  if (!document.querySelector(`link[href="/Group_Project_48/frontend/css/globals.css"]`)) {
    const globalCssLink = document.createElement("link");
    globalCssLink.rel = "stylesheet";
    globalCssLink.href = "/Group_Project_48/frontend/css/globals.css";
    document.head.appendChild(globalCssLink);
  }
}

async function fetchFooterInfo() {
  console.log("Fetching footer info...");
  try {
    const res = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/footerController.php?action=get_footer_info", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}` // Optional
      }
    });

    const data = await res.json();
    if (res.ok && data.success && data.configs) {
      const { gym_address, gym_email, gym_no } = data.configs;

      document.getElementById("footer-address").textContent = `Address: ${gym_address}`;
      document.getElementById("footer-email").textContent = `Email: ${gym_email}`;
      document.getElementById("footer-phone").textContent = `Phone: ${gym_no}`;
    } else {
      console.warn("Failed to fetch footer info:", data);
    }
  } catch (error) {
    console.error("Error fetching footer info:", error);
  }
}

// Call the function to fetch footer info
fetchFooterInfo();

