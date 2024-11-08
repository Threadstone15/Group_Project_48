// Function to load content based on sidebar clicks
document.getElementById("home").addEventListener("click", function () {
    setActive("home");
    loadContent('/frontend/pages/trainer/trainerHome.html');
  });


  document.getElementById("meal-plans").addEventListener("click", function () {
    setActive("meal-plans");
    loadContent('/frontend/pages/trainer/workoutMealPlans.html');
  });

  document.getElementById("assigned-members").addEventListener("click", function () {
    setActive("assigned-members");
    loadContent('/frontend/pages/trainer/assignedMembers.html');
  });
  
  
  // Function to set the active link in the sidebar
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
  