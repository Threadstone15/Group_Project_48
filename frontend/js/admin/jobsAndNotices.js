export function initAdmin_jobs() {
    console.log("initializing trainer jobs page");

    const spinner = document.getElementById("loading-spinner");
    const jobsTable = document.getElementById("jobsTable");

    if (jobsTable) {
        fetchJobsList();
    } else {
        console.warn("Jobs table not found. Skipping fetch.");
    }

    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    function fetchJobsList() {
        console.log("Fetching Jobs List");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("Please log in to continue", "error");
            return;
        }

        spinner.classList.remove("hidden");

        fetch(
            "http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=get_trainer_career",
            {
                method: "GET",
                headers: { Authorization: `Bearer ${authToken}` },
                redirect: "follow",
            }
        )
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch jobs list");
                return response.json();
            })
            .then((data) => {
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
                    noDataRow.innerHTML = `<td colspan="4" style="text-align: center;">No jobs found</td>`;
                    tableBody.appendChild(noDataRow);
                }
            })
            .catch((error) => {
                console.error("Error fetching jobs list:", error);
                showToast("Failed to load jobs. Try again.", "error");
            })
            .finally(() => {
                spinner.classList.add("hidden");
            });
    }

    document.getElementById("publishBtn").addEventListener("click", () => {
        const jobInput = document.getElementById("jobInput").value.trim();
        const jobInputTopic = document.getElementById("jobInputTopic").value.trim();

        if (!jobInputTopic || !jobInput) {
            showToast("Both job title and content are required", "error");
            return;
        }

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("Please log in to continue", "error");
            return;
        }

        const payload = {
            job_role: jobInputTopic,
            requirements: jobInput,
        };

        spinner.classList.remove("hidden");

        fetch(
            "http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=add_trainer_career",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(payload),
            }
        )
            .then((response) => {
                if (!response.ok) throw new Error("Failed to add job");
                return response.text();
            })
            .then(() => {
                showToast("Job added successfully!");
                document.getElementById("jobInput").value = "";
                document.getElementById("jobInputTopic").value = "";
                fetchJobsList();
            })
            .catch((error) => {
                console.error("Error adding job:", error);
                showToast("Failed to add job. Try again.", "error");
            })
            .finally(() => {
                spinner.classList.add("hidden");
            });
    });

    document.addEventListener("click", (event) => {
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

    function deleteJob(jobId) {
        const deletePopup = document.getElementById("deletePopup");
        const overlay = document.getElementById("overlay");

        deletePopup.style.display = "block";
        overlay.style.display = "block";

        document.getElementById("confirmDelete").onclick = () => {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                showToast("Please log in to continue", "error");
                return;
            }

            spinner.classList.remove("hidden");

            fetch(
                `http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=delete_trainer_career&career_id=${jobId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                    redirect: "follow",
                }
            )
                .then((response) => {
                    if (!response.ok) throw new Error("Failed to delete job");
                    return response.json();
                })
                .then(() => {
                    showToast("Job deleted successfully!");
                    fetchJobsList();
                    deletePopup.style.display = "none";
                    overlay.style.display = "none";
                })
                .catch((error) => {
                    console.error("Error deleting job:", error);
                    showToast("Failed to delete job", "error");
                })
                .finally(() => {
                    spinner.classList.add("hidden");
                });
        };

        document.getElementById("cancelDelete").onclick = () => {
            deletePopup.style.display = "none";
            overlay.style.display = "none";
        };
    }

    function openUpdatePopup(jobId, jobTitle, jobDescription) {
        document.getElementById("updatePopup").style.display = "block";
        document.getElementById("overlay").style.display = "block";
        document.getElementById("updateJobId").value = jobId;
        document.getElementById("updateJobTitle").value = jobTitle;
        document.getElementById("updateJobDescription").value = jobDescription;

        document.getElementById("closeUpdatePopup").onclick = () => {
            document.getElementById("updatePopup").style.display = "none";
            document.getElementById("overlay").style.display = "none";
        };
    }

    document.getElementById("updateForm").addEventListener("submit", (event) => {
        event.preventDefault();

        const jobId = document.getElementById("updateJobId").value;
        const title = document.getElementById("updateJobTitle").value.trim();
        const description = document.getElementById("updateJobDescription").value.trim();

        if (!title || !description) {
            showToast("Job title and description cannot be empty", "error");
            return;
        }

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("Please log in to continue", "error");
            return;
        }

        const payload = {
            career_id: jobId,
            job_role: title,
            requirements: description,
        };

        spinner.classList.remove("hidden");

        fetch(
            "http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=update_trainer_career",
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        )
            .then((response) => {
                if (!response.ok) throw new Error("Failed to update job");
                return response.json();
            })
            .then(() => {
                showToast("Job updated successfully!");
                document.getElementById("updatePopup").style.display = "none";
                document.getElementById("overlay").style.display = "none";
                fetchJobsList();
            })
            .catch((error) => {
                console.error("Error updating job:", error);
                showToast("Failed to update job", "error");
            })
            .finally(() => {
                spinner.classList.add("hidden");
            });
    });

    document.getElementById("closePopup").addEventListener("click", () => {
        document.getElementById("deletePopup").style.display = "none";
        document.getElementById("overlay").style.display = "none";
    });
}
