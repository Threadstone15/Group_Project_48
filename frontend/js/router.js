export function navigate(page) {
  const role = extractRoleFromURL(page);

  if (isDashboardPage(role)) {
    loadDashboard(role);
  } else {
    loadPage(page);
  }

  history.pushState({ page }, "", `/Group_Project_48/${page}`);
}

window.addEventListener("popstate", () => {
  const page = history.state?.page || "home";
  const role = extractRoleFromURL(page);

  if (isDashboardPage(role)) {
    loadDashboard(role);
  } else {
    loadPage(page);
  }
});

window.navigate = navigate;

// Helper to extract the role from the URL path
function extractRoleFromURL(page) {
  const parts = page.split("/");
  return parts[0]; // First segment of the path is the role (e.g., "staff")
}

// Check if the page corresponds to a dashboard
function isDashboardPage(page) {
  return ["member", "staff", "trainer", "owner", "admin"].includes(page);
}

// Load a dashboard with a full reload
function loadDashboard(role) {
  const dashboardPathMap = {
    member: "/dashboard/member/memberDashboard.html",
    staff: "/dashboard/staff/staffDashboard.html",
    trainer: "/dashboard/trainer/trainerDashboard.html",
    owner: "/dashboard/owner/ownerDashboard.html",
    admin: "/dashboard/admin/adminDashboard.html",
  };

  const dashboardPath = dashboardPathMap[role];
  if (dashboardPath) {
    // // Preserve user-visible clean dashboard route
    // if (window.location.pathname !== `/Group_Project_48/${role}/memberAttendance`) {
    //   history.replaceState({ page: role }, "", `/Group_Project_48/${role}/memberAttendance`);
    // }

    // Let page render once from static file but subsequent path based by SPA
    window.location.href = `/Group_Project_48${dashboardPath}`;
  } else {
    console.error("Invalid dashboard role:", role);
    document.getElementById("content-container").innerHTML = `<p>404 - Dashboard not found.</p>`;
  }
}



// Dynamic page loading for non-dashboard pages
function loadPage(page) {
  const pageUrl = `/Group_Project_48/frontend/pages/${page}.html`;
  const pageCssUrl = `/Group_Project_48/frontend/css/${page}.css`;
  const pageJsUrl = `/Group_Project_48/frontend/js/${page}.js`;

  fetch(pageUrl)
    .then((response) => {
      if (!response.ok) throw new Error("Page not found");
      return response.text();
    })
    .then((data) => {
      document.getElementById("content-container").innerHTML = data;

      if (!document.querySelector(`link[href="${pageCssUrl}"]`)) {
        const pageCssLink = document.createElement("link");
        pageCssLink.rel = "stylesheet";
        pageCssLink.href = pageCssUrl;
        document.head.appendChild(pageCssLink);
      }

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
