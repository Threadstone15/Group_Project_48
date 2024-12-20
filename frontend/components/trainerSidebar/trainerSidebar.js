document.getElementById("sidebar-container").addEventListener("click", function (e) {
  if (e.target.tagName === "A" && e.target.dataset.page) {
    e.preventDefault();
    const page = e.target.dataset.page;
    setActive(page);
    navigate(`trainer/${page}`);
  }
});

document.querySelector('.sidebar-logo-black').src = '/Group_Project_48/frontend/assets/images/logo-black-transparent.png';
document.getElementById("logo").addEventListener("click", () => navigate('home'));

document.getElementById("sign-out").addEventListener("click", () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('role');
  navigate('login');
});

const path = window.location.pathname.replace('/Group_Project_48/', '');

const dashboardTab = path.split('/')[1];
setActive(dashboardTab);

function setActive(id) {
  const links = document.querySelectorAll(".sidebar-menu a");
  links.forEach(link => link.classList.remove("active"));
  const activeLink = document.querySelector(`a[data-page="${id}"]`);
  if (activeLink) activeLink.classList.add("active");
}