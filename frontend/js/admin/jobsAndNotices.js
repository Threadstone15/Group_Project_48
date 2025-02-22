// Sample test data
export function initAdmin_jobs() {
    console.log("initializing trainer jobs page");

    const jobsTable = document.getElementById("jobsTable");

    // Initialize jobs data if the table exists
    if (jobsTable) {
        fetchJobsList();
    } else {
        console.warn("Jobs table not found. Skipping fetch.");
    }

    // Fetch the list of jobs from the backend
    function fetchJobsList() {
        console.log("Fetching Jobs List");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        const requestOptions = {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` },
            redirect: "follow",
        };

        fetch(
            "http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=get_trainer_career",
            requestOptions
        )
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch jobs list");
                return response.json();
            })
            .then((data) => {
                console.log("Fetched jobs list:", data);

                const tableBody = jobsTable.getElementsByTagName("tbody")[0];
                tableBody.innerHTML = "";

                if (data.length > 0) {
                    data.forEach((job) => {
                        const row = document.createElement("tr");

                        row.innerHTML = `
                        <td>${job["career_id"]}</td>
                        <td>${job["job_role"]}</td>
                        <td>${job["requirements"]}</td>
                        <td>
                            <button class="update-button"
                                data-job-id="${job["career_id"]}"
                                data-job-role="${job["job_role"]}"
                                data-job-requirements="${job["requirements"]}">
                                Update
                            </button>

                            <button class="delete-button" data-id="${job["career_id"]}">Remove</button>
                        </td>
                    `;

                        tableBody.appendChild(row);
                    });
                } else {
                    const noDataRow = document.createElement("tr");
                    noDataRow.innerHTML = `<td colspan="5" style="text-align: center;">No notices found</td>`;
                    tableBody.appendChild(noDataRow);
                }
            })
            .catch((error) => console.error("Error fetching jobs list:", error));
    }

    // Add a new job
    document.getElementById("publishBtn").addEventListener("click", function () {
        const jobInput = document.getElementById("jobInput").value;
        console.log("Job input:", jobInput);
        const jobInputTopic = document.getElementById("jobInputTopic").value;
        console.log("Job input topic:", jobInputTopic);
        if (!jobInput.trim()) {
            alert("Job content cannot be empty!");
            return;
        }
        if (!jobInputTopic.trim()) {
            alert("Job title cannot be empty!");
            return;
        }

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        const payload = {
            "job_role": jobInputTopic,
            "requirements": jobInput,
        };

        console.log("Payload:", JSON.stringify(payload));
        {/*const formData = new FormData();
  formData.append("title", jobInputTopic);
  formData.append("description", jobInput);
  formData.append("action", "add_jobs");*/}

        const requestOptions = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload),
        };

        fetch(
            "http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=add_trainer_career",
            requestOptions
        )
            .then((response) => {
                if (!response.ok) throw new Error("Failed to add job");
                return response.text();
            })
            .then((result) => {
                console.log("Job added successfully:", result);
                alert("Job added successfully!");
                fetchJobsList(); // Refresh the jobs list
                document.getElementById("jobInput").value = ""; // Clear the input field
                location.reload();
            })
            .catch((error) => console.error("Error adding job:", error));
    });

    //event-listner for delete and update buttons
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-button")) {
            const jobId = event.target.getAttribute("data-id");
            deleteJob(jobId);
        }
        if (event.target.classList.contains("update-button")) {
            const jobId = event.target.getAttribute("data-job-id");
            const jobTitle = event.target.getAttribute("data-job-role");
            const jobDescription = event.target.getAttribute("data-job-requirements");
            openUpdatePopup(jobId, jobTitle, jobDescription);
        }
    });
    // Delete a job
    function deleteJob(jobId) {
        console.log(`Delete button clicked for job ID: ${jobId}`);

        const deletePopup = document.getElementById("deletePopup");
        deletePopup.style.display = "block";

        document.getElementById("overlay").style.display = "block";

        document.getElementById("confirmDelete").onclick = () => {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                console.error("Auth token not found. Please log in.");
                return;
            }

            const requestOptions = {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
                redirect: "follow",
            };

            fetch(
                `http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=delete_trainer_career&career_id=${jobId}`,
                requestOptions
            )
                .then((response) => {
                    if (!response.ok) throw new Error("Failed to delete job");
                    return response.json();
                })
                .then((result) => {
                    console.log("Job deleted successfully:", result);
                    fetchJobsList(); // Refresh the jobs list
                    document.getElementById("overlay").style.display = "none";
                    deletePopup.style.display = "none";
                })
                .catch((error) => console.error("Error deleting notice:", error));
        };

        document.getElementById("cancelDelete").onclick = () => {
            deletePopup.style.display = "none";
            document.getElementById("overlay").style.display = "none";
        };
    }

    // Open the update popup for editing a job
    function openUpdatePopup(jobId, jobTitle, jobDescription) {
        document.getElementById("updatePopup").style.display = "block";
        document.getElementById("overlay").style.display = "block";
        document.getElementById("updateJobId").value = jobId;
        document.getElementById("updateJobTitle").value = jobTitle;
        document.getElementById("updateJobDescription").value = jobDescription;

        document.getElementById("updatePopup").style.display = "block";

        document.getElementById("closeUpdatePopup").onclick = () => {
            document.getElementById("updatePopup").style.display = "none";
            document.getElementById("overlay").style.display = "none";
        };


    }

    // Update a job
    document
        .getElementById("updateForm")
        .addEventListener("submit", function (event) {
            event.preventDefault();

            const jobId = document.getElementById("updateJobId").value;
            const title = document.getElementById("updateJobTitle").value;
            const description = document.getElementById("updateJobDescription").value;

            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                console.error("Auth token not found. Please log in.");
                return;
            }

            const payload = {
                "career_id": jobId,
                "job_role": title,
                "requirements": description
            };

            console.log("Payload:", JSON.stringify(payload));

            {/*const formData = JSON.stringify({
      job_id: jobId,
      title: title,
      description: description,
    });*/}

            const requestOptions = {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            };

            fetch(
                "http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=update_trainer_career",
                requestOptions
            )
                .then((response) => {
                    if (!response.ok) throw new Error("Failed to update job");
                    return response.json();
                })
                .then((result) => {
                    console.log("Job updated successfully:", result);
                    fetchJobsList(); // Refresh the job list
                    document.getElementById("updatePopup").style.display = "none";
                    document.getElementById("overlay").style.display = "none";
                })
                .catch((error) => console.error("Error updating job:", error));
        });

    // Close the delete popup
    document.getElementById("closePopup").addEventListener("click", function () {
        const popup = document.getElementById("deletePopup");
        popup.style.display = "none";
        document.getElementById("overlay").style.display = "none";
    });
}