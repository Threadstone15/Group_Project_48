export function loadNavbar() {
  // Load navbar.html into the navbar-container
  fetch("/frontend/components/navbar/navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      // Change the logo path after inserting the HTML
      const logoImage = document.querySelector('.logo-black');
      if (logoImage) {
        logoImage.src = '/frontend/assets/images/logo-black-transparent.png';
      }

      // Attach event listeners after the navbar is loaded
      attachNavbarListeners();

    })
    .catch(error => console.error('Error loading navbar:', error));

  // Load navbar.css
  const navbarLink = document.createElement('link');
  navbarLink.rel = 'stylesheet';
  navbarLink.href = '/frontend/components/navbar/navbar.css';
  document.head.appendChild(navbarLink);
}

// Function to attach navbar event listeners
function attachNavbarListeners() {
  document.getElementById("logo").addEventListener("click", function () {
    loadPage('home');
  });

  document.getElementById("services").addEventListener("click", function () {
    loadPage('services');
  });

  document.getElementById("about").addEventListener("click", function () {
    loadPage('about');
  });

  document.getElementById("find-trainer").addEventListener("click", function () {
    loadPage('findATrainer');
  });

  document.getElementById("pricing").addEventListener("click", function () {
    loadPage('pricing');
  });

  document.getElementById("careers").addEventListener("click", function () {
    loadPage('careers');
  });

  document.getElementById("login").addEventListener("click", function () {
    loadPage('login');
  });

  document.getElementById("member").addEventListener("click", function () {
    loadPage('becomeMember');
  });
}

export function loadFooter() {
  // Load footer.html into the footer-container
  fetch("/frontend/components/footer/footer.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("footer-container").innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));

  // Load footer.css
  const footerLink = document.createElement('link');
  footerLink.rel = 'stylesheet';
  footerLink.href = '/frontend/components/footer/footer.css';
  document.head.appendChild(footerLink);
}

// Function to load other pages dynamically, including CSS
export function loadPage(page) {
  const pageUrl = `/frontend/pages/${page}.html`;
  const pageCssUrl = `/frontend/css/${page}.css`;

  // Load the page HTML
  fetch(pageUrl)
    .then(response => response.text())
    .then(data => {
      document.getElementById("content-container").innerHTML = data;

      // Load the corresponding CSS for the page
      const pageCssLink = document.createElement('link');
      pageCssLink.rel = 'stylesheet';
      pageCssLink.href = pageCssUrl;
      document.head.appendChild(pageCssLink);
    })
    .catch(error => {
      console.error('Error loading page:', error);
      document.getElementById("content-container").innerHTML = `<p>Page not found.</p>`;
    });
}
