import { runSessionTimedOut } from "../routeConfig.js";
import { navigate } from "../router.js";

export function initTrainer_assignedMembers() {
    console.log("Initializing assignedMembers.js");
    fetchAssignedMembers();

    function fetchAssignedMembers() {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("An error has occurred. Please log in again", "error");
            navigate("login");
            return;
        }
        const requestOptions = {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${authToken}`,
            },
            redirect: 'follow'
        };
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=get_assigned_members", requestOptions)
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
                if (data.error) {
                    showToast(data.error, "error");
                } else{
                    console.log("Assigned Members Data:", data);
                    displayAssignedMembers(data);
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

    function displayAssignedMembers(members) {
        const assignedMembersTable = document.getElementById("assigned-members-table");
        const membersTableBody = assignedMembersTable.getElementsByTagName("tbody")[0];
        //clearin table body
        membersTableBody.innerHTML = "";
        if (members.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="3">Currently, You do not have any assigned members</td>`;
            membersTableBody.appendChild(row);
            return;
        }
        members.forEach(member => {
            const row = document.createElement("tr");
            let memberGender = "Other";
            if(member.gender == 'M'){
                memberGender = 'Male';
            }else if(member.gender == 'F'){
                memberGender = 'Female';
            }
            row.innerHTML = `
                <td>${member.fullName}</td>
                <td>${memberGender}</td>
                <td>${member.assigned_date}</td>
                `;
            membersTableBody.appendChild(row);
        });
    }

    function showToast(message, type) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
}
