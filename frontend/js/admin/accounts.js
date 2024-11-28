// Sample test data
let allEmails = [];

// Fetch all emails from the backend on page load
async function fetchEmails() {
    try {
        const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=get_all_emails", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result && Array.isArray(result)) {
                allEmails = result;
            } else {
                console.error('Unexpected response for fetching emails:', result);
            }
        } else {
            console.error('Failed to fetch emails, HTTP status:', response.status);
        }
    } catch (error) {
        console.error('Error fetching emails:', error);
    }
}

// Function to check if email is already used
function checkEmail() {
    const email = document.getElementById("email").value;
    const emailError = document.getElementById("email-error");

    if (allEmails.includes(email)) {
        emailError.style.display = "inline";
    } else {
        emailError.style.display = "none";
    }
}

async function fetchMembersByRole(role) {
    try {
        console.log("Selected role: ",role);
        const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=get_members_by_role&role=${role}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const members = await response.json();
            console.log("response: ",members);
            populateTable(members);
        } else {
            console.error('Failed to fetch members by role, HTTP status:', response.status);
        }
    } catch (error) {
        console.error('Error fetching members by role:', error);
    }
}

// Populate table with members
function populateTable(members) {
    const tbody = document.querySelector("#equipmentsTable tbody");
    tbody.innerHTML = ''; // Clear existing rows

    if (members && members.length > 0) {
        members.forEach(member => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.userID}</td>
                <td>${member.firstName} ${member.lastName}</td>
                <td>${member.email}</td>
                <td>${member.phone}</td>
                <td>
                    <button class="delete-button" data-id="${member.user_id}">Delete</button>
                    <button class="update-button" data-id="${member.userID}">Update</button>
                    
                </td>
            `;
            tbody.appendChild(row);
        });
        attachDeleteEventHandlers();
    } else {
        tbody.innerHTML = '<tr><td colspan="5">No members found for the selected role.</td></tr>';
    }
}

// Add delete functionality to buttons
function attachDeleteEventHandlers() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', event => {
            const userId = event.target.dataset.id;
            confirmDelete(userId);
        });
    });
}

// Confirm delete action
function confirmDelete(userId) {
    const deletePopup = document.getElementById("deletePopup");
    deletePopup.style.display = "block";

    document.getElementById("confirmDelete").onclick = () => {
        deleteMember(userId);
        deletePopup.style.display = "none";
    };

    document.getElementById("cancelDelete").onclick = () => {
        deletePopup.style.display = "none";
    };

    document.getElementById('closePopup').addEventListener('click', function() {
        document.getElementById('deletePopup').style.display = 'none';
    });
    
}

// Delete member
async function deleteMember(userId) {
    try {
        console.log("Deleting... - ",userId);
        const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=delete_staff&userID=${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            fetchMembersByRole(document.querySelector('.role-filter.active').dataset.role); // Refresh table
        } else {
            console.error('Failed to delete member, HTTP status:', response.status);
        }
    } catch (error) {
        console.error('Error deleting member:', error);
    }
}


document.querySelectorAll('.role-filter').forEach(button => {
    button.addEventListener('click', event => {
        document.querySelectorAll('.role-filter').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        const role = event.target.dataset.role;
        fetchMembersByRole(role);
    });
});

// Add event listener to fetch emails and monitor email input
document.addEventListener('DOMContentLoaded', () => {
    fetchEmails();
    document.getElementById("email").addEventListener('input', checkEmail);

    const defaultRole = 'member';
    document.querySelector(`.role-filter[data-role="${defaultRole}"]`).classList.add('active');
    fetchMembersByRole(defaultRole);
});



// Add member functionality
function initAddMember() {
    document.querySelector('.final-cta-button').addEventListener('click', function (event) {
        event.preventDefault();

        const role = document.getElementById('role').value.trim();
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const day = document.getElementById('day').value;
        const month = document.getElementById('month').value;
        const year = document.getElementById('year').value;
        const address = document.getElementById('address').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const gender = document.getElementById('gender').value;

        const errors = [];

        // Validate inputs
        if (!firstName) errors.push("First name is required.");
        if (!lastName) errors.push("Last name is required.");
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Invalid email address.");
        if (!day || !month || !year || isNaN(Date.parse(`${year}-${month}-${day}`))) {
            errors.push("Invalid Date of Birth.");
        } else {
            const dob = new Date(`${year}-${month}-${day}`);
            const age = calculateAge(dob);
            if (age < 12 || age > 100) errors.push("Age must be between 12 and 100.");
        }
        if (!address) errors.push("Address is required.");
        if (!mobile || !/^07\d{8}$/.test(mobile)) errors.push("Mobile number must be 10 digits and start with '07'.");
        if (!gender) errors.push("Gender is required.");

        if (errors.length > 0) {
            showFormResponse(errors.join('<br>'), "error");
            return;
        }

        const registrationData = JSON.stringify({
            role,
            firstName,
            lastName,
            email,
            dob: `${year}-${month}-${day}`,
            address,
            mobile,
            gender
        });

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=add_staff", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: registrationData
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to add member");
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    showFormResponse(data.error, "error");
                } else {
                    showFormResponse(data.message, "success");
                    resetForm();
                }
            })
            .catch(error => {
                console.error("Error:", error);
                showFormResponse("An error occurred. Please try again later.", "error");
            });
    });

    function calculateAge(dob) {
        const diff = Date.now() - dob.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    function showFormResponse(message, type) {
        const responseContainer = document.getElementById("formResponse") || createResponseContainer();
        responseContainer.innerHTML = message;
        responseContainer.className = `form-response ${type}`;
        responseContainer.style.display = "block";

        setTimeout(() => {
            responseContainer.style.display = "none";
        }, 3000);
    }

    function createResponseContainer() {
        const responseContainer = document.createElement('div');
        responseContainer.id = "formResponse";
        document.querySelector('.signup-form').appendChild(responseContainer);
        return responseContainer;
    }

    function resetForm() {
        document.querySelector('.signup-form form').reset();
    }
}

// Initialize form actions
document.addEventListener('DOMContentLoaded', initAddMember);


