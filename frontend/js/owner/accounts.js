export function initOwner_accounts() {
    let temp_role;
    let allEmails = [];
    let role = '';
    let type = 'all';
    // Get all role filter buttons
    const roleButtons = document.querySelectorAll('.role-filter');
    const statusButtons = document.querySelectorAll('.status-filter');

    // Function to toggle the 'selected' class on the clicked button
    function toggleSelected(buttons) {
    buttons.forEach(button => {
        button.addEventListener('click', function() {
        // Remove 'selected' from all buttons
        buttons.forEach(btn => btn.classList.remove('selected'));
        // Add 'selected' to the clicked button
        this.classList.add('selected');
        });
    });
    }

    // Apply the toggle function to both role and status buttons
    toggleSelected(roleButtons);
    toggleSelected(statusButtons);




    // Fetch all emails from the backend on page load
    async function fetchEmails() {
        try {
            const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=get_all_emails", {
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



    async function fetchMembersByRole(role, type) {
    try {
        console.log("Selected role: ", role);
        const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=get_members_by_role&role=${role}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const members = await response.json();
            console.log("response: ", members);
            populateTable(members, type);  // Passing type to filter the results
        } else {
            console.error('Failed to fetch members by role, HTTP status:', response.status);
        }
    } catch (error) {
        console.error('Error fetching members by role:', error);
    }
}

// Populate table with members based on type
function populateTable(members, type) {
    const tbody = document.querySelector("#equipmentsTable tbody");
    tbody.innerHTML = ''; // Clear existing rows

    // Filter members based on the type
    let filteredMembers = [];

    if (type == 'all') {
        filteredMembers = members; // No filtering needed for 'all'
    } else if (type == 'active') {
        filteredMembers = members.filter(member => member.status == 1); // Filter for active members
    } else if (type == 'inactive') {
        filteredMembers = members.filter(member => member.status == 2); // Filter for inactive members
    }

    if (filteredMembers.length > 0) {
        filteredMembers.forEach(member => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.userID}</td>
                <td>${member.firstName} ${member.lastName}</td>
                <td>${member.email}</td>
                <td>${member.phone}</td>
                <td>
                    <button class="delete-button" data-id="${member.user_id}">Deactivate</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        attachEventHandlers();
    } else {
        tbody.innerHTML = '<tr><td colspan="5">No members found for the selected role.</td></tr>';
    }
}

// Event listener for role filter buttons
document.querySelectorAll('.role-filter').forEach(button => {
    button.addEventListener('click', event => {
        document.querySelectorAll('.role-filter').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        role = event.target.dataset.role; // Assign the selected role
        console.log("Selected role: ", role);
        fetchMembersByRole(role, type);  // Call with the current type
    });
});

// Event listener for status filter buttons
document.querySelectorAll('.status-filter').forEach(button => {
    button.addEventListener('click', event => {
        document.querySelectorAll('.status-filter').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        type = event.target.dataset.role; // Assign the selected type
        console.log("Selected type: ", type);
        fetchMembersByRole(role, type);  // Call with the current role
    });
});

    function attachEventHandlers() {
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', event => {
                const userId = event.target.dataset.id;
                confirmDelete(userId);
            });
        });

    }

    // Function to handle closing the popup
    function closePopup() {
        const deletePopup = document.getElementById('deletePopup');
        deletePopup.style.display = 'none';  // Hide the popup
    }

    // Get the close button and add event listener
    document.getElementById('closePopup').addEventListener('click', closePopup);


    // Confirm delete action
    function confirmDelete(userId) {

        const deletePopup = document.getElementById('deletePopup');
        const confirmDeleteButton = document.getElementById('confirmDelete');
        const cancelDeleteButton = document.getElementById('cancelDelete');

        // Show the popup
        deletePopup.style.display = 'block';

        // Store the user ID to be deleted
        deletePopup.setAttribute('data-user-id', userId);

        // Add event listener for the confirm button
        confirmDeleteButton.onclick = async function () {
            const reason = document.getElementById('deactivationReason').value;
            
            // Call the delete function with the reason and logged user ID
            if (reason) {
                console.log("Reason for deactivation: ", reason , userId);
                await deleteMember(userId, reason);
                deletePopup.style.display = 'none';  // Close the popup
            } else {
                showToast("Please enter a reason for deactivation.", "error");
            }
        };
        // Close the popup when cancel is clicked
        cancelDeleteButton.onclick = function () {
            deletePopup.style.display = 'none';
        };

    }

    // Delete member
    async function deleteMember(userId, reason) {
        try {
            console.log("Deleting... - ", userId);
    
            const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=delete_staff&userID=${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,  // The user being deactivated
                    reason: reason,  // Reason for deactivation
                })
            });
    
            if (response.ok) {
                showToast("Member deleted successfully", "success"); // Show success toast
                fetchMembersByRole(document.querySelector('.role-filter.active').dataset.role); // Refresh table
            } else {
                console.error('Failed to delete member, HTTP status:', response.status);
                showToast("Failed to delete member. Please try again.", "error"); // Show error toast
            }
        } catch (error) {
            console.error('Error deleting member:', error);
            showToast("An error occurred while deleting the member.", "error"); // Show error toast
        }
    }
    


    document.querySelectorAll('.final-cta-button').forEach(button => {
        button.addEventListener('click', event => {
            document.querySelectorAll('.final-cta-button').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            const role = event.target.dataset.role;
            console.log("Adding member");
            fetchMembersByRole(role);
        });
    });

    // Add event listener to fetch emails and monitor email input
    const addUserForm = document.querySelector("form");
    if (addUserForm) {
        addUserForm.addEventListener("submit", (event) => {
            event.preventDefault();
            console.log("Adding member");
            initAddMember();
        });
    }

    


    // Add member functionality
    function initAddMember() {
        const role = document.getElementById('role').value.trim();
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const dob = document.getElementById('dob').value;
        const address = document.getElementById('address').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const gender = document.getElementById('gender').value;
    
        const errors = [];
    
        // First Name
        if (!firstName) {
            errors.push("First name is required.");
        } else if (!/^[A-Za-z]+$/.test(firstName)) {
            errors.push("First name should contain only letters.");
        }
    
        // Last Name
        if (!lastName) {
            errors.push("Last name is required.");
        } else if (!/^[A-Za-z]+$/.test(lastName)) {
            errors.push("Last name should contain only letters.");
        }
    
        // Email
        if (!email) {
            errors.push("Email is required.");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push("Email format is invalid.");
        }
    
        // Address
        if (!address) {
            errors.push("Address is required.");
        } else if (!/^[A-Za-z0-9\s=,.\/|-]+$/.test(address) || address.split(' ').length <= 1) {
            errors.push("Address should be valid and descriptive.");
        }
    
        // Mobile
        if (!mobile) {
            errors.push("Mobile number is required.");
        } else if (!/^07\d{8}$/.test(mobile)) {
            errors.push("Mobile number must be 10 digits and start with '07'.");
        }
    
        // Gender
        if (!gender) {
            errors.push("Gender is required.");
        }
    
        // Date of Birth
        if (!dob) {
            errors.push("Date of Birth is required.");
        } else {
            const age = calculateAge(new Date(dob));
            if (age < 12 || age > 100) {
                errors.push("Age must be between 12 and 100.");
            }
        }
    
        // Display errors if any
        if (errors.length > 0) {
            errors.forEach(err => showToast(err, "error"));
            return;
        }
    
        // ✅ Proceed to send request if validation is good
        const registrationData = JSON.stringify({
            role,
            firstName,
            lastName,
            email,
            dob,
            address,
            mobile,
            gender
        });
    
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=add_staff", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: registrationData
        })
        .then(response => response.json())
        .then(data => {
            console.log("Response data:", data);
    
            if (data.message) {
                showToast(data.message, "success");
                resetForm();
                fetchMembersByRole(role);
            } else {
                showToast(data.error || "An unexpected error occurred.", "error");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            showToast("An error occurred. Please try again later.", "error");
        });
    
        function calculateAge(dob) {
            const diff = Date.now() - dob.getTime();
            const ageDate = new Date(diff);
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        }
    
        function resetForm() {
            document.querySelector('.signup-form form').reset();
        }
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