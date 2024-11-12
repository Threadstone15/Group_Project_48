export function navigate(page) {
  loadPage(page);
  history.pushState({ page }, "", `/Group_Project_48/${page}`);
};

window.addEventListener('popstate', () => {
  const page = history.state?.page || 'home';
  loadPage(page);
});

window.navigate = navigate;


function loadPage(page) {
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
};



