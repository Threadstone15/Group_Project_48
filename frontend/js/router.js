export function navigate(page) {
  if (isDashboardPage(page)) {
    loadDashboard(page);
  } else {
    loadPage(page);
  }
  history.pushState({ page }, "", `/Group_Project_48/${page}`);
}

window.addEventListener("popstate", () => {
  const page = history.state?.page || "home";
  if (isDashboardPage(page)) {
    loadDashboard(page);
  } else {
    loadPage(page);
  }
});

window.navigate = navigate;

// Check if the page corresponds to a dashboard
function isDashboardPage(page) {
  return ['member', 'staff', 'trainer', 'owner', 'admin'].includes(page);
}

// Load a dashboard with a full reload
function loadDashboard(role) {
  const dashboardPathMap = {
    member: "/frontend/pages/member/memberDashboard.html",
    staff: "/frontend/pages/staff/staffDashboard.html",
    trainer: "/frontend/pages/trainer/trainerDashboard.html",
    owner: "/frontend/pages/owner/ownerDashboard.html",
    admin: "/frontend/pages/admin/adminDashboard.html"
  };

  const dashboardPath = dashboardPathMap[role];
  if (dashboardPath) {
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
