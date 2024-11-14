document.getElementById("sidebar-container").addEventListener("click", function (e) {
  if (e.target.tagName === "A" && e.target.dataset.page) {
    e.preventDefault();
    const page = e.target.dataset.page;
    setActive(page);
    navigateStaff(page); // Use navigateStaff for seamless routing
  }
});

function setActive(id) {
  const links = document.querySelectorAll(".sidebar-menu a");
  links.forEach(link => link.classList.remove("active"));
  const activeLink = document.querySelector(`a[data-page="${id}"]`);
  if (activeLink) activeLink.classList.add("active");
}
