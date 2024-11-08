// Function to load content based on sidebar clicks
document.getElementById("member-attendance").addEventListener("click", function () {
    setActive("member-attendance");
    loadContent('/frontend/pages/staff/memberAttendance.html');
  });

  document.getElementById("gym-equipment").addEventListener("click", function () {
    setActive("gym-equipment");
    loadContent('/frontend/pages/staff/gymEquipment.html');
  });

  document.getElementById("publish-notice").addEventListener("click", function () {
    setActive("publish-notice");
    loadContent('/frontend/pages/staff/publishNotices.html');
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
  
