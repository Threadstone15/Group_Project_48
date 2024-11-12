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
    loadJSFile('login');
  });

  document.getElementById("member").addEventListener("click", function () {
    loadPage('becomeMember');
    loadJSFile('becomeMember');
  });

  document.getElementById("gymEquipment").addEventListener("click", function () {
    loadPage('gymEquipment');
    loadJSFile('gymEquipment');
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

// Function to load other pages dynamically, including CSS, and JS
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

// //loading teh js file for each html file-> or linking the js file to html file
export function loadJSFile(page) {
  const pageUrl = `/frontend/pages/${page}.html`;
  const pageJSUrl = `/frontend/js/${page}.js`;
  
  fetch(pageUrl)
    .then(response => response.text())
    .then(data => {
      document.getElementById('content-container').innerHTML = data;

      // Dynamically load the script for login page functionality
      const script = document.createElement('script');
      script.src = pageJSUrl;
      document.body.appendChild(script);
    })
    .catch(error => console.error('Error loading login page:', error));
}
