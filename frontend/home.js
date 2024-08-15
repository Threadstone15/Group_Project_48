document.addEventListener("DOMContentLoaded", () => {
    const aboutSection = document.getElementById("about-us");
    const facilitiesSection = document.getElementById("facilities");
    const getStartedSection = document.getElementById("get-started");

    let aboutContentLoaded = false;
    let facilitiesContentLoaded = false;
    let getStartedContentLoaded = false;

    function loadAboutContent() {
        if (window.scrollY + window.innerHeight >= aboutSection.offsetTop && !aboutContentLoaded) {
            fetch("about.html")
                .then(response => response.text())
                .then(data => {
                    aboutSection.innerHTML = data;
                    aboutContentLoaded = true;
                    loadFacilitiesContent(); // Check if the next section should be loaded
                })
                .catch(error => console.error("Error loading About Us content:", error));
        }
    }

    function loadFacilitiesContent() {
        if (window.scrollY + window.innerHeight >= facilitiesSection.offsetTop && !facilitiesContentLoaded) {
            fetch("facilities.html")
                .then(response => response.text())
                .then(data => {
                    facilitiesSection.innerHTML = data;
                    facilitiesContentLoaded = true;
                    loadGetStartedContent(); // Check if the next section should be loaded
                })
                .catch(error => console.error("Error loading Facilities content:", error));
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
            loadFacilitiesContent();
        }
        if (facilitiesContentLoaded) {
            loadGetStartedContent();
        }
    }

    window.addEventListener("scroll", handleScroll);

    // Initial check in case the user has already scrolled past the sections
    handleScroll();
});
