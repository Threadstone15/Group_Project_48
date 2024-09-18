document.addEventListener("DOMContentLoaded", () => {
   
    // Load navbar.html into the navbar-container
    fetch("./components/navbar.html")
      .then(response => response.text())
      .then(data => {
        document.getElementById("navbar-container").innerHTML = data;

        // change the logo path
        const logoImage = document.querySelector('.logo-black');
        if (logoImage) {
            logoImage.src = './assets/images/logo-black-transparent.png';
        }
      })
      .catch(error => console.error('Error loading navbar:', error));
  
    // Load footer.html into the footer-container
    fetch("./components/footer.html")
      .then(response => response.text())
      .then(data => {
        document.getElementById("footer-container").innerHTML = data;
      })
      .catch(error => console.error('Error loading footer:', error));

});
