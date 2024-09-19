// general script for the entire app
document.addEventListener("DOMContentLoaded", function () {
    console.log("Document is ready");
    function navigateTo(url) {
      window.location.href = url;
    }
  
    console.log("Document is ready");
    document.getElementById("logo").addEventListener("click", function () {
      navigateTo("../index.html");
    });
  
    document.getElementById("services").addEventListener("click", function () {
      navigateTo("../pages/services.html");
    });
  
    document.getElementById("about").addEventListener("click", function () {
      navigateTo("../pages/aboutUs.html");
    });
  
    document.getElementById("find-trainer").addEventListener("click", function () {
      navigateTo("../pages/findATrainer.html");
    });
  
    document.getElementById("pricing").addEventListener("click", function () {
      navigateTo("../pages/pricing.html");
    });
  
    document.getElementById("careers").addEventListener("click", function () {
      navigateTo("../pages/careers.html");
    });
  
    document.getElementById("login").addEventListener("click", function () {
      navigateTo("../pages/login.html");
    });
  
    document.getElementById("member").addEventListener("click", function () {
      navigateTo("../pages/becomeAMember.html");
    });

    const sidebarLinks = document.querySelectorAll('.sidebar-list-item');

    sidebarLinks.forEach(link => {
      link.addEventListener('click', function () {
        // Remove 'active' class from all sidebar list items
        sidebarLinks.forEach(item => item.parentElement.classList.remove('active'));
  
        // Add 'active' class to the clicked link's parent list item
        this.parentElement.classList.add('active');
      });
    });
  });
  