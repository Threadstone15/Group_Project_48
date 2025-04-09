import { runSessionTimedOut } from "../routeConfig.js";
import { navigate } from "../router.js";

export function initOwner_trainers() {
    console.log("Initializing trainers.js");

    const pendingApplicationsTable = document.getElementById("pendingApplications");
    const acceptedRejectedTable = document.getElementById("acceptedRejectedApplications");

    if (pendingApplicationsTable && acceptedRejectedTable) {
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
                    fetchApplications(); //fetching applications after career offers are fected
                } else {
                    console.warn("No Trainer career ofers Available at the moment");
                    fetchApplications();
                }
            })
            .catch(error => {
                console.error("API Error:", error.message);
                if (error.message === "Token expired") {
                    runSessionTimedOut();
                } else {
                    alert("Error: " + error.message);
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

                    // combining accepted and rejected appli..
                    const acceptedRejectedApplications = [...acceptedApplications, ...rejectedApplications];

                    if (pendingApplications.length > 0) {
                        populatePendingApplicationsTable(pendingApplications, pendingApplicationsTableBody);
                    } else {
                        const noDataRow = `<tr><td colspan="6" style="text-align: center;">No applications found</td></tr>`;
                        pendingApplicationsTableBody.innerHTML = noDataRow;
                    }

                    if (acceptedRejectedApplications.length > 0) {
                        populateAcceptedRejectedTable(acceptedRejectedApplications, acceptedRejectedTableBody);
                    } else {
                        const noDataRow = `<tr><td colspan="6" style="text-align: center;">No applications found</td></tr>`;
                        acceptedRejectedTableBody.innerHTML = noDataRow;
                    }
                } else {
                    //data nt availble
                    const noDataRow = `<tr><td colspan="6" style="text-align: center;">No applications found</td></tr>`;
                    pendingApplicationsTableBody.innerHTML = noDataRow;
                    acceptedRejectedTableBody.innerHTML = noDataRow;
                }
            })
            .catch(error => console.error("Error fetching trainer applications", error));
    }

    function populatePendingApplicationsTable(applications, tableBody) {
        applications.forEach(application => {
            const row = document.createElement("tr");

            //finding the carer offer using career_id
            const career = allTrainerAppliedCareers.find(career => career.career_id === application.career_id);
            const jobName = career ? career.job_role : "N/A";

            row.innerHTML = `
            <td>${application['firstName']} ${application['lastName']}</td>
            <td>${jobName}</td>
            <td>${application['submission_date']}</td>
            <td>
                <button id="viewApp" data-app-id="${application['application_id']}">View</button>
            </td>
            `;
            tableBody.appendChild(row);
        });

        // adding event listener to the table body
        tableBody.addEventListener('click', (event) => {
            if (event.target.id == "viewApp") {
                const applicationId = event.target.getAttribute('data-app-id');
                openViewPopup(applicationId);
            }
        });
    }
    function populateAcceptedRejectedTable(applications, tableBody) {
        applications.forEach(application => {
            const row = document.createElement("tr");

            //finding the carer offer using career_id
            const career = allTrainerAppliedCareers.find(career => career.career_id === application.career_id);
            const jobName = career ? career.job_role : "N/A";
            let status;
            switch (application.approved_by_owner) {
                case 1: status = "Accepted"; break;
                case 2: status = "Rejected"; break;
                default: status = "N/A";
            }

            row.innerHTML = `
            <td>${application['firstName']} ${application['lastName']}</td>
            <td>${jobName}</td>
            <td>${status}</td>
            <td>${application['submission_date']}</td>
            <td>
                <button id="viewApp2" data-app-id="${application['application_id']}">View</button>
            </td>
            `;
            tableBody.appendChild(row);
        });
        // adding event listener to the table body
        tableBody.addEventListener('click', (event) => {
            if (event.target.id == "viewApp2") {
                const applicationId = event.target.getAttribute('data-app-id');
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

        document.getElementById('popup-name').textContent = `${application.firstName} ${application.lastName}`;
        document.getElementById('popup-job').textContent = appliedCareer.job_role;
        document.getElementById('popup-nic').textContent = application.NIC;
        document.getElementById('popup-dob').textContent = application.DOB;
        document.getElementById('popup-email').textContent = application.email;
        document.getElementById('popup-phone').textContent = application.mobile_number;
        document.getElementById('popup-address').textContent = application.address;
        document.getElementById('popup-experience').textContent = `${application.years_of_experience} years`;
        document.getElementById('popup-specialties').textContent = application.specialties;
        document.getElementById('popup-cv').href = application.cv;
        document.getElementById('popup-date').textContent = application.submission_date;

        popup.style.display = 'block';  //showing the popup

        closeBtn.onclick = () => {
            pendingApplicationButtons.style.display = 'none';
            acceptedRejectedButtons.style.display = 'none';
            popup.style.display = 'none';
        };

        //displaying accept & reject buttons if application is pending
        if (application.approved_by_owner == 0) {
            pendingApplicationButtons.style.display = 'block';
        } else {
            //displaying delete buttons if application is accepted or rejected
            acceptedRejectedButtons.style.display = 'block';
        }

        document.getElementById('approveBtn').onclick = () => {
            handleApplicationDecision(application.application_id, 1);
        };

        document.getElementById('rejectBtn').onclick = () => {
            handleApplicationDecision(application.application_id, 2);
        };
        document.getElementById('deleteBtn').onclick = () => {
            handleApplicationDecision(application.application_id, "Delete");
            acceptedRejectedButtons.style.display = 'none';
            popup.style.display = 'none';
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
        //decision - 1 --> Accepted
        //decision - 2 --> Rejected
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
                    showFormResponse("applicationStatusResponse", data.message, "success");
                    setTimeout(() => {
                        document.getElementById("pendingApplicationButtonsPopup").style.display = "none";
                        document.getElementById("viewApplicationPopup").style.display = "none";
                    }, 3000);
                    fetchApplications(); // refreshing tables by fetching applicatons again
                } else {
                    const errorMsg = data.error || "Failed to update Application Status.";
                    showFormResponse("applicationStatusResponse", errorMsg, "error");
                }
            })
            .catch(error => {
                console.error("API Error:", error.message);
                if (error.message === "Token expired") {
                    runSessionTimedOut();
                } else {
                    console.error("Error: " + error.message);
                }
            });
    }

    function deleteApplication(applicationID) {
        const deletePopup = document.getElementById("deletePopup");
        deletePopup.style.display = "block";

        document.getElementById("confirmDelete").onclick = () => {
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
                        if (!response.ok) throw new Error("Failed to Update trainer application status");
                        return data;
                    });
                })
                .then(data => {
                    if (data.message) {
                        showFormResponse("deleteResponse", data.message, "success");
                        setTimeout(() => {
                            deletePopup.style.display = "none";
                            document.getElementById("rejectedAcceptedButtonsPopup").style.display = "none";
                            document.getElementById("viewApplicationPopup").style.display = "none";
                        }, 3000);
                        fetchApplications();
                    } else {
                        const errorMsg = data.error || "Failed to delete membership plan.";
                        showFormResponse("deleteResponse", errorMsg, "error");
                    }
                })
                .catch(error => {
                    console.error("API Error:", error.message);
                    if (error.message === "Token expired") {
                        runSessionTimedOut();
                    } else {
                        console.error("Error: " + error.message);
                    }
                });
        };
    }

    function showFormResponse(formType, message, type) {
        console.log("Displaying message:", message, "Type:", type); // Debugging log
        const responseContainer = document.getElementById(formType);
        responseContainer.textContent = message;
        responseContainer.className = `form-response ${type}`;
        responseContainer.style.display = "block";

        setTimeout(() => {
            responseContainer.style.display = "none";
        }, 3000);
    }

}