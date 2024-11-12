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

export function loadPage(page) {
  const pageUrl = `/Group_Project_48/frontend/pages/${page}.html`;
  const pageCssUrl = `/Group_Project_48/frontend/css/${page}.css`;
  const pageJsUrl = `/Group_Project_48/frontend/js/${page}.js`;

  fetch(pageUrl)
    .then(response => {
      if (!response.ok) throw new Error('Page not found');
      return response.text();
    })
    .then(data => {
      document.getElementById("content-container").innerHTML = data;

      if (!document.querySelector(`link[href="${pageCssUrl}"]`)) {
        const pageCssLink = document.createElement('link');
        pageCssLink.rel = 'stylesheet';
        pageCssLink.href = pageCssUrl;
        document.head.appendChild(pageCssLink);
      }

      if (!document.querySelector(`script[src="${pageJsUrl}"]`)) {
        const script = document.createElement('script');
        script.src = pageJsUrl;
        document.body.appendChild(script);
      }
    })
    .catch(() => {
      document.getElementById("content-container").innerHTML = `<p>404 - Page not found.</p>`;
    });
}

export function navigate(page) {
  loadPage(page);
  history.pushState({ page }, "", `/Group_Project_48/${page}`);
}

window.addEventListener('popstate', () => {
  const page = history.state?.page || 'home';
  loadPage(page);
});

window.navigate = navigate;
