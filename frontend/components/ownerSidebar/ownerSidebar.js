// Function to load content based on sidebar clicks
document.getElementById("home").addEventListener("click", function () {
    setActive("home");
    loadContent('/frontend/pages/owner/ownerHome.html');
  });

  document.getElementById("gym-members").addEventListener("click", function () {
    setActive("gym-members");
    loadContent('/frontend/pages/owner/gymMembers.html');
  });

  document.getElementById("trainers").addEventListener("click", function () {
    setActive("trainers");
    loadContent('/frontend/pages/owner/trainers.html');
  });

  document.getElementById("staff").addEventListener("click", function () {
    setActive("staff");
    loadContent('/frontend/pages/owner/staff.html');
  });

  document.getElementById("finacial-overview").addEventListener("click", function () {
    setActive("finacial-overview");
    loadContent('/frontend/pages/owner/finacialOver.html');
  });

  document.getElementById("membership-plans").addEventListener("click", function () {
    setActive("membership-plans");
    loadContent('/frontend/pages/owner/memberPlans.html');
  });

  document.getElementById("analytics").addEventListener("click", function () {
    setActive("analytics");
    loadContent('/frontend/pages/owner/analytics.html');
  });
  
  
  function setActive(id) {
  
    const links = document.querySelectorAll(".sidebar-menu a");
    links.forEach(link => link.classList.remove("active"));
    const activeLink = document.getElementById(id);
    activeLink.classList.add("active");
  }
  
  function loadContent(file) {
    fetch(file)
      .then(response => response.text())
      .then(data => {
        document.getElementById('content-area').innerHTML = data;
      })
      .catch(error => {
        document.getElementById('content-area').innerHTML = `<p>Error loading content: ${error}</p>`;
      });
  }
  