export function loadNavbar() {
  fetch("/Group_Project_48/frontend/components/navbar/navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      const logoImage = document.querySelector('.logo-black');
      if (logoImage) {
        logoImage.src = '/Group_Project_48/frontend/assets/images/logo-black-transparent.png';
      }

      // Dynamically load navbar.js
      const script = document.createElement('script');
      script.src = "/Group_Project_48/frontend/components/navbar/navbar.js";
      document.body.appendChild(script);
    })
    .catch(error => console.error('Error loading navbar:', error));

  const navbarLink = document.createElement('link');
  navbarLink.rel = 'stylesheet';
  navbarLink.href = '/Group_Project_48/frontend/components/navbar/navbar.css';
  document.head.appendChild(navbarLink);
}

export function loadFooter() {
  fetch("/Group_Project_48/frontend/components/footer/footer.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("footer-container").innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));

  const footerLink = document.createElement('link');
  footerLink.rel = 'stylesheet';
  footerLink.href = '/Group_Project_48/frontend/components/footer/footer.css';
  document.head.appendChild(footerLink);
}
