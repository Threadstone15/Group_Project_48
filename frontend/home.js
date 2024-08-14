document.addEventListener("DOMContentLoaded", () => {
    const aboutSection = document.getElementById("about-us");
    let contentLoaded = false;

    function loadAboutContent() {
        if (window.scrollY + window.innerHeight >= aboutSection.offsetTop && !contentLoaded) {
            fetch("about.html")
                .then(response => response.text())
                .then(data => {
                    aboutSection.innerHTML = data;
                    contentLoaded = true;
                })
                .catch(error => console.error("Error loading about content:", error));
        }
    }

    window.addEventListener("scroll", loadAboutContent);

    // Initial check in case the user has already scrolled past the section
    loadAboutContent();
});
