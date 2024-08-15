document.addEventListener("DOMContentLoaded", () => {
    const aboutSection = document.getElementById("about-us");
    const getStartedSection = document.getElementById("get-started");

    let aboutContentLoaded = false;
    let getStartedContentLoaded = false;

    function loadAboutContent() {
        if (window.scrollY + window.innerHeight >= aboutSection.offsetTop && !aboutContentLoaded) {
            fetch("about.html")
                .then(response => response.text())
                .then(data => {
                    aboutSection.innerHTML = data;
                    aboutContentLoaded = true;
                    loadGetStartedContent(); // Check if the next section should be loaded
                })
                .catch(error => console.error("Error loading about content:", error));
        }
    }

    function loadGetStartedContent() {
        if (window.scrollY + window.innerHeight >= getStartedSection.offsetTop && !getStartedContentLoaded) {
            fetch("get-started.html")
                .then(response => response.text())
                .then(data => {
                    getStartedSection.innerHTML = data;
                    getStartedContentLoaded = true;
                })
                .catch(error => console.error("Error loading Get Started content:", error));
        }
    }

    function handleScroll() {
        loadAboutContent();
        if (aboutContentLoaded) {
            loadGetStartedContent();
        }
    }

    window.addEventListener("scroll", handleScroll);

    // Initial check in case the user has already scrolled past the sections
    handleScroll();
});
