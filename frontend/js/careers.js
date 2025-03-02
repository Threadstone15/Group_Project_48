export function initcareers() {
    console.log("Initialized career page");
    document.body.addEventListener("click", (event) => {
        if (event.target && event.target.id === "trainerApplication") {
            navigate("trainerApplication");
        }
    });
    fetchCareerOpportunities();
    function fetchCareerOpportunities() {
        console.log("Fetching career opportunities");
        const requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/landingPageController.php?action=get_trainer_career", requestOptions)
            .then(response => {
                if (!response.ok) 
                    throw new Error('Failed to fetch trainer careers');
                return response.json()
            })
            .then(data => {
                console.log("Fetched trainer careers :", data);
                displayCareerOpportunities(data)
            })
            .catch(error => console.error("Error fetching career opportunities:", error));
    }

    function displayCareerOpportunities(jobs) {
        const careerListings = document.getElementById("career-listings");
        careerListings.innerHTML = ""; 

        jobs.forEach(job => {
            const jobCard = document.createElement("div");
            jobCard.classList.add("career-card");

            jobCard.innerHTML = `
                <h3 class="career-role">${job.job_role}</h3>
                <p class="career-requirements"><strong>Requirements:</strong> ${job.requirements}</p>
                <button class="apply-button" data-career-id="${job.career_id}">Apply Now</button>
            `;

            careerListings.appendChild(jobCard);
        });

        // event listeners for "Apply Now" buttons
        document.querySelectorAll(".apply-button").forEach(button => {
            button.addEventListener("click", function () {
                const careerId = this.getAttribute("data-career-id");
                navigate(`trainerApplication?careerId=${careerId}`);
            });
        });
    }
}