export function initTrainer_assignedMembers() {
    console.log("Initializing assignedMembers.js");

    const spinner = document.getElementById("loading-spinner");

    let allMembers = [];

    fetchAssignedMembers();

    document.getElementById("search-input").addEventListener("input", (e) => {
        const searchValue = e.target.value.toLowerCase();
        const filtered = allMembers.filter(member =>
            member.fullName.toLowerCase().includes(searchValue)
        );
        displayAssignedMembers(filtered);
    });
    spinner.classList.remove("hidden");
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
                    if (!response.ok) throw new Error("Failed to fetch trainer assigned members");
                    return data;
                });
            })
            .then(data => {
                if (data.error) {
                    showToast(data.error, "error");
                } else {
                    allMembers = data;
                    console.log("Assigned Members Data:", data);
                    spinner.classList.add("hidden");
                    displayAssignedMembers(allMembers);
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
        membersTableBody.innerHTML = "";

        if (members.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="4">No trainers found</td>`;
            membersTableBody.appendChild(row);
            return;
        }

        // members.sort((a, b) => a.fullName.localeCompare(b.fullName));
        members.sort((a, b) => a.fullName.localeCompare(b.fullName, undefined, { sensitivity: 'base' })); //case insensitive


        members.forEach(member => {
            const row = document.createElement("tr");
            let memberGender = "Other";
            if (member.gender == 'M') {
                memberGender = 'Male';
            } else if (member.gender == 'F') {
                memberGender = 'Female';
            }
            row.innerHTML = `
                <td>${member.fullName}</td>
                <td>${memberGender}</td>
                <td>${member.phone}</td>
                <td>${member.assigned_date}</td>
            `;
            membersTableBody.appendChild(row);
        });
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
}
