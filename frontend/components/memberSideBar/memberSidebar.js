// Function to load content based on sidebar clicks
document.getElementById("home").addEventListener("click", function () {
    setActive("home");
    loadContent('/frontend/pages/member/memberHome.html');
  });

  document.getElementById("get-trainer").addEventListener("click", function () {
    setActive("get-trainer");
    loadContent('/frontend/pages/member/getATrainer.html');
  });

  document.getElementById("payments").addEventListener("click", function () {
    setActive("payments");
    loadContent('/frontend/pages/member/payments.html');
  });

  document.getElementById("track-progress").addEventListener("click", function () {
    setActive("track-progress");
    loadContent('/frontend/pages/member/trackYourProgress.html');
  });

  document.getElementById("meal-plans").addEventListener("click", function () {
    setActive("meal-plans");
    loadContent('/frontend/pages/member/workoutMealPlans.html');
  });

  document.getElementById("upgrade-plan").addEventListener("click", function () {
    setActive("upgrade-plan");
    loadContent('/frontend/pages/member/upgradePlan.html');
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
  