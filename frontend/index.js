document.addEventListener("DOMContentLoaded", () => {

    // Load navbar.html into the navbar-container
    fetch("./components/navbar/navbar.html")
      .then(response => response.text())
      .then(data => {
        document.getElementById("navbar-container").innerHTML = data;
  
        // Change the logo path after inserting the HTML
        const logoImage = document.querySelector('.logo-black');
        if (logoImage) {
          logoImage.src = './assets/images/logo-black-transparent.png';
        }
  
        setupNavLinks(); // Set up navigation links after the navbar is loaded
      })
      .catch(error => console.error('Error loading navbar:', error));
  
    // Load navbar.css
    const navbarLink = document.createElement('link');
    navbarLink.rel = 'stylesheet';
    navbarLink.href = './components/navbar/navbar.css';
    document.head.appendChild(navbarLink);
  
    // Load footer.html into the footer-container
    fetch("./components/footer/footer.html")
      .then(response => response.text())
      .then(data => {
        document.getElementById("footer-container").innerHTML = data;
      })
      .catch(error => console.error('Error loading footer:', error));
  
    // Load footer.css
    const footerLink = document.createElement('link');
    footerLink.rel = 'stylesheet';
    footerLink.href = './components/footer/footer.css';
    document.head.appendChild(footerLink);
  
    // Function to load other pages dynamically, including CSS
    function loadPage(page) {
      const pageUrl = `./pages/${page}.html`;
      const pageCssUrl = `./css/${page}.css`;  // Assuming each page has a corresponding CSS file
  
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
  
    // Set up link behavior (run this after navbar loads)
    function setupNavLinks() {
      // Example: Add event listener to a navbar link for "Home"
      document.querySelector("#home-link").addEventListener("click", function (e) {
        e.preventDefault(); // Prevent page reload
        loadPage('home'); // Load home.html when "Home" link is clicked
      });
  
      // Add other event listeners for other pages
      // Example: About Us page
      document.querySelector("#about-link").addEventListener("click", function (e) {
        e.preventDefault(); // Prevent page reload
        loadPage('about-us'); // Load about-us.html when "About Us" link is clicked
      });
    }
  
    // Load the default home page
    loadPage('home');  // By default, the home page will load first
  });
  