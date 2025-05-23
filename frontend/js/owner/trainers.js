import { runSessionTimedOut } from "../routeConfig.js";
import { navigate } from "../router.js";

export function initOwner_trainers() {
    console.log("Initializing trainers.js");

    const pendingApplicationsTable = document.getElementById("pendingApplications");
    const acceptedRejectedTable = document.getElementById("acceptedRejectedApplications");
    const spinner = document.getElementById("loading-spinner");

    if (pendingApplicationsTable && acceptedRejectedTable) {
        showSpinner();
        fetchTrainerAppliedCareers();
    } else {
        console.warn("One or both tables not found. Skipping fetch.");
    }

    let allTrainerAppliedCareers = [];
    function fetchTrainerAppliedCareers() {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            navigate("login");
            return;
        }

        const requestOptions = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` },
            redirect: 'follow'
        };
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=get_trainerAppliedCareers", requestOptions)
            .then(response => {
                return response.json().then(data => {
                    if (data.error && data.error === "Token expired") {
                        throw new Error("Token expired");
                    }
                    if (!response.ok) throw new Error("Failed to fetch trainer applied careers");
                    return data;
                });
            })
            .then(data => {
                if (data.length > 0) {
                    allTrainerAppliedCareers = data;
                    fetchApplications();
                } else {
                    console.warn("No Trainer career offers available at the moment");
                    fetchApplications();
                }
            })
            .catch(error => {
                hideSpinner();
                console.error("API Error:", error.message);
                if (error.message === "Token expired") {
                    runSessionTimedOut();
                } else {
                    showToast("Error: " + error.message, "error");
                }
            });
    }

    let allApplications = [];
    function fetchApplications() {
        console.log("Fetching applications");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            navigate("login");
            return;
        }

        const requestOptions = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` },
            redirect: 'follow'
        };
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=get_trainerApplications", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch trainer applications list");
                return response.json();
            })
            .then(data => {
                const pendingApplicationsTableBody = pendingApplicationsTable.getElementsByTagName("tbody")[0];
                const acceptedRejectedTableBody = acceptedRejectedTable.getElementsByTagName("tbody")[0];
                pendingApplicationsTableBody.innerHTML = "";
                acceptedRejectedTableBody.innerHTML = "";

                if (data.length > 0) {
                    const pendingApplications = data.filter(app => app.approved_by_owner == 0);
                    const acceptedApplications = data.filter(app => app.approved_by_owner == 1);
                    const rejectedApplications = data.filter(app => app.approved_by_owner == 2);
                    allApplications = data;

                    const acceptedRejectedApplications = [...acceptedApplications, ...rejectedApplications];

                    if (pendingApplications.length > 0) {
                        populatePendingApplicationsTable(pendingApplications, pendingApplicationsTableBody);
                    } else {
                        const noDataRow = `<tr><td colspan="6" style="text-align: center;">No pending applications</td></tr>`;
                        pendingApplicationsTableBody.innerHTML = noDataRow;
                    }

                    if (acceptedRejectedApplications.length > 0) {
                        populateAcceptedRejectedTable(acceptedRejectedApplications, acceptedRejectedTableBody);
                    } else {
                        const noDataRow = `<tr><td colspan="6" style="text-align: center;">No processed applications</td></tr>`;
                        acceptedRejectedTableBody.innerHTML = noDataRow;
                    }
                } else {
                    const noDataRow = `<tr><td colspan="6" style="text-align: center;">No applications found</td></tr>`;
                    pendingApplicationsTableBody.innerHTML = noDataRow;
                    acceptedRejectedTableBody.innerHTML = noDataRow;
                }
            })
            .catch(error => {
                console.error("Error fetching trainer applications", error);
                showToast("Error fetching applications: " + error.message, "error");
            })
            .finally(() => {
                hideSpinner();
            });
    }

    function populatePendingApplicationsTable(applications, tableBody) {
        applications.forEach(application => {
            const row = document.createElement("tr");

            const career = allTrainerAppliedCareers.find(career => career.career_id === application.career_id);
            const jobName = career ? career.job_role : "N/A";

            row.innerHTML = `
            <td>${application['firstName']} ${application['lastName']}</td>
            <td>${jobName}</td>
            <td>${formatDate(application['submission_date'])}</td>
            <td>
                <button id="viewApp" data-app-id="${application['application_id']}" class="view-button">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
            `;
            tableBody.appendChild(row);
        });

        tableBody.addEventListener('click', (event) => {
            if (event.target.closest("#viewApp")) {
                const applicationId = event.target.closest("#viewApp").getAttribute('data-app-id');
                openViewPopup(applicationId);
            }
        });
    }

    function populateAcceptedRejectedTable(applications, tableBody) {
        applications.forEach(application => {
            const row = document.createElement("tr");

            const career = allTrainerAppliedCareers.find(career => career.career_id === application.career_id);
            const jobName = career ? career.job_role : "N/A";
            let status;
            switch (application.approved_by_owner) {
                case 1: 
                    status = `<span class="status-badge accepted">Accepted</span>`; 
                    break;
                case 2: 
                    status = `<span class="status-badge rejected">Rejected</span>`; 
                    break;
                default: status = "N/A";
            }

            row.innerHTML = `
            <td>${application['firstName']} ${application['lastName']}</td>
            <td>${jobName}</td>
            <td>${status}</td>
            <td>${formatDate(application['submission_date'])}</td>
            <td>
                <button id="viewApp2" data-app-id="${application['application_id']}" class="view-button">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
            `;
            tableBody.appendChild(row);
        });

        tableBody.addEventListener('click', (event) => {
            if (event.target.closest("#viewApp2")) {
                const applicationId = event.target.closest("#viewApp2").getAttribute('data-app-id');
                openViewPopup(applicationId);
            }
        });
    }

    function openViewPopup(applicationID) {
        const application = allApplications.find(app => app.application_id === applicationID);
        const appliedCareer = allTrainerAppliedCareers.find(career => career.career_id === application.career_id);

        if (!application) {
            console.error("Application not found");
            return;
        }

        const popup = document.getElementById('viewApplicationPopup');
        const closeBtn = document.getElementById('closeApplicationPopup');
        const pendingApplicationButtons = document.getElementById('pendingApplicationButtonsPopup');
        const acceptedRejectedButtons = document.getElementById('rejectedAcceptedButtonsPopup');

        // Populate the popup with application data
        document.getElementById('popup-name').textContent = `${application.firstName} ${application.lastName}`;
        document.getElementById('popup-job').textContent = appliedCareer ? appliedCareer.job_role : "N/A";
        document.getElementById('popup-nic').textContent = application.NIC || "N/A";
        document.getElementById('popup-dob').textContent = application.DOB ? formatDate(application.DOB) : "N/A";
        document.getElementById('popup-email').textContent = application.email || "N/A";
        document.getElementById('popup-phone').textContent = application.mobile_number || "N/A";
        document.getElementById('popup-address').textContent = application.address || "N/A";
        document.getElementById('popup-experience').textContent = application.years_of_experience ? 
            `${application.years_of_experience} years` : "N/A";
        document.getElementById('popup-specialties').textContent = application.specialties || "N/A";
        document.getElementById('popup-cv').href = application.cv || "#";
        document.getElementById('popup-cv').textContent = application.cv ? "Download CV" : "No CV available";
        document.getElementById('popup-date').textContent = application.submission_date ? 
            formatDate(application.submission_date) : "N/A";

        // Show/hide appropriate buttons
        if (application.approved_by_owner == 0) {
            pendingApplicationButtons.style.display = 'block';
            acceptedRejectedButtons.style.display = 'none';
        } else {
            pendingApplicationButtons.style.display = 'none';
            acceptedRejectedButtons.style.display = 'block';
        }

        // Show the popup
        popup.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        // Close button handler
        closeBtn.onclick = () => {
            popup.style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        // Button handlers
        document.getElementById('approveBtn').onclick = () => {
            handleApplicationDecision(application.application_id, 1);
        };

        document.getElementById('rejectBtn').onclick = () => {
            handleApplicationDecision(application.application_id, 2);
        };

        document.getElementById('deleteBtn').onclick = () => {
            handleApplicationDecision(application.application_id, "Delete");
        };
    }

    function handleApplicationDecision(applicationId, decision) {
        if (decision === 1 || decision === 2) {
            updateApplicationStatus(applicationId, decision);
        } else if (decision === "Delete") {
            deleteApplication(applicationId);
        }
    }

    function updateApplicationStatus(applicationID, decision) {
        showSpinner();
        const payload = {
            "application_id": applicationID,
            "approved_by_owner": decision
        };

        const authToken = localStorage.getItem("authToken");

        const requestOptions = {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            redirect: 'follow'
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=update_trainerApplicationStatus", requestOptions)
            .then(response => {
                return response.json().then(data => {
                    if (data.error && data.error === "Token expired") {
                        throw new Error("Token expired");
                    }
                    if (!response.ok) throw new Error("Failed to Update trainer application status");
                    return data;
                });
            })
            .then(data => {
                if (data.message) {
                    showToast(data.message, "success");
                    setTimeout(() => {
                        document.getElementById("pendingApplicationButtonsPopup").style.display = "none";
                        document.getElementById("viewApplicationPopup").style.display = "none";
                        document.body.style.overflow = 'auto';
                        fetchApplications();
                    }, 1500);
                } else {
                    throw new Error(data.error || "Failed to update Application Status.");
                }
            })
            .catch(error => {
                console.error("API Error:", error.message);
                if (error.message === "Token expired") {
                    runSessionTimedOut();
                } else {
                    showToast("Error: " + error.message, "error");
                }
            })
            .finally(() => {
                hideSpinner();
            });
    }

    function deleteApplication(applicationID) {
        const deletePopup = document.getElementById("deletePopup");
        deletePopup.style.display = "block";

        document.getElementById("cancelDelete").onclick = () => {
            deletePopup.style.display = "none";
        };

        document.getElementById("confirmDelete").onclick = () => {
            showSpinner();
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                console.error("Auth token not found. Please log in.");
                navigate('login');
                return;
            }
            const requestOptions = {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                redirect: 'follow'
            };

            fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=delete_trainerApplication&application_id=${applicationID}`, requestOptions)
                .then(response => {
                    return response.json().then(data => {
                        if (data.error && data.error === "Token expired") {
                            throw new Error("Token expired");
                        }
                        if (!response.ok) throw new Error("Failed to delete trainer application");
                        return data;
                    });
                })
                .then(data => {
                    if (data.message) {
                        showToast(data.message, "success");
                        setTimeout(() => {
                            deletePopup.style.display = "none";
                            document.getElementById("viewApplicationPopup").style.display = "none";
                            document.body.style.overflow = 'auto';
                            fetchApplications();
                        }, 1500);
                    } else {
                        throw new Error(data.error || "Failed to delete application.");
                    }
                })
                .catch(error => {
                    console.error("API Error:", error.message);
                    if (error.message === "Token expired") {
                        runSessionTimedOut();
                    } else {
                        showToast("Error: " + error.message, "error");
                    }
                })
                .finally(() => {
                    hideSpinner();
                });
        };
    }

    function showSpinner() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.classList.remove('hidden');
    }

    function hideSpinner() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.classList.add('hidden');
    }

    function formatDate(dateString) {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
    
        container.appendChild(toast);
    
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }
}