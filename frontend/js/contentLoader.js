export function loadNavbar() {
  fetch("/frontend/components/navbar/navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      // Set the logo path after navbar HTML is loaded
      const logoImage = document.querySelector('.logo-black');
      if (logoImage) {
        logoImage.src = '/frontend/assets/images/logo-black-transparent.png';
      }

      // Load navbar.js only after navbar HTML is inserted
      const script = document.createElement('script');
      script.src = "/frontend/components/navbar/navbar.js";
      document.body.appendChild(script);
    })
    .catch(error => console.error('Error loading navbar:', error));

  // Load navbar.css
  const navbarLink = document.createElement('link');
  navbarLink.rel = 'stylesheet';
  navbarLink.href = '/frontend/components/navbar/navbar.css';
  document.head.appendChild(navbarLink);
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
  const pageJsUrl = `/frontend/js/${page}.js`;

  console.log(`Attempting to load page: ${pageUrl}`); // Debugging

  // Fetch the HTML content of the page
  fetch(pageUrl)
    .then(response => {
      if (!response.ok) throw new Error('Page not found');
      return response.text();
    })
    .then(data => {
      document.getElementById("content-container").innerHTML = data;

      // Load CSS if it exists for the page
      if (!document.querySelector(`link[href="${pageCssUrl}"]`)) {
        const pageCssLink = document.createElement('link');
        pageCssLink.rel = 'stylesheet';
        pageCssLink.href = pageCssUrl;
        document.head.appendChild(pageCssLink);
        console.log(`CSS loaded for page: ${pageCssUrl}`);
      }

      // Load JS if it exists for the page
      if (!document.querySelector(`script[src="${pageJsUrl}"]`)) {
        const script = document.createElement('script');
        script.src = pageJsUrl;
        document.body.appendChild(script);
        console.log(`JS loaded for page: ${pageJsUrl}`);
      }
    })
    .catch(error => {
      console.error('Error loading page:', error);
      document.getElementById("content-container").innerHTML = `<p>404 - Page not found.</p>`;
    });
}

// Unified navigation function
export function navigate(page) {
  loadPage(page);            // Load the specified page content
  history.pushState({ page }, "", `/${page}`); // Update the URL without reloading
}

window.addEventListener('popstate', (event) => {
  const page = event.state ? event.state.page : 'home';
  loadPage(page); // Load page without pushing to history
});

// Make `navigate` available globally
window.navigate = navigate;

