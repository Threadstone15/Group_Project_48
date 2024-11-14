export function navigateStaff(page) {
    loadStaffPage(page);
    history.pushState({ page }, "", `/Group_Project_48/staff/${page}`);
  }
  
  // Handle browser back/forward navigation
  window.addEventListener("popstate", () => {
    const page = history.state?.page || "memberAttendance";
    loadStaffPage(page);
  });
  
  // Dynamic page loading for staff-dashboard pages
  export function loadStaffPage(page) {
    const pageUrl = `/Group_Project_48/frontend/pages/staff/${page}.html`;
    const pageCssUrl = `/Group_Project_48/frontend/css/staff/${page}.css`;
    const pageJsUrl = `/Group_Project_48/frontend/js/staff/${page}.js`;
  
    fetch(pageUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Page not found");
        return response.text();
      })
      .then((data) => {
        document.getElementById("content-area").innerHTML = data;
  
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
        document.getElementById("content-area").innerHTML = `<p>404 - Page not found.</p>`;
      });
  }
  
  window.navigateStaff = navigateStaff; // Expose globally for easy access.
  