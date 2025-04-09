export function initOwner_accounts() {
    let temp_role;
    let allEmails = [];

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

    function checkEmailinUpdate(email) {
        if (allEmails.includes(email)) {
            return true;
        } else {
            return false;
        }
    }

    async function fetchMembersByRole(role) {
        try {
            console.log("Selected role: ", role);
            temp_role = role;
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
                <td>${member.user_id}</td>
                <td>${member.userID}</td>
                <td>${member.firstName} ${member.lastName}</td>
                <td>${member.email}</td>
                <td>${member.phone}</td>
                <td>
                    <button class="delete-button" data-id="${member.user_id}">Deactivate</button>
                    <button class="update-button" onclick="openUpdatePopup(this)">Update</button>
                    
                </td>
            `;
                tbody.appendChild(row);
            });
            attachEventHandlers();
        } else {
            tbody.innerHTML = '<tr><td colspan="5">No members found for the selected role.</td></tr>';
        }
    }

    function openUpdatePopup(button) {
        console.log("pop...");
        const row = button.closest('tr');
        const userId = row.cells[0].textContent;
        const roleId = row.cells[1].textContent;
        const fullName = row.cells[2].textContent.trim();
        const [firstName, lastName] = fullName.split(' ');
        const email = row.cells[3].textContent;
        const contactNo = row.cells[4].textContent;



        document.getElementById("updateFirstName").value = firstName;
        document.getElementById("updateLastName").value = lastName;
        document.getElementById("updateEmail").value = email;
        document.getElementById("updateMobile").value = contactNo;



        const popup = document.getElementById("updatePopup");
        popup.setAttribute("data-user-id", userId);
        popup.setAttribute("data-role-id", roleId);

        popup.style.display = "block";
    }

    document.getElementById("cancelUpdate").onclick = () => {
        document.getElementById("updatePopup").style.display = "none"; // Close the update popup
    };

    document.getElementById("updateForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const firstName = document.getElementById("updateFirstName").value.trim();
        const lastName = document.getElementById("updateLastName").value.trim();
        const email = document.getElementById("updateEmail").value.trim();
        const contactNo = document.getElementById("updateMobile").value.trim();
        // const dob = document.getElementById("updateDOB").value; // Assuming there is a DOB field for update

        const errors = [];

        // Validate First Name
        if (!firstName || !/^[A-Za-z]+$/.test(firstName)) errors.push("First name is required and should contain only letters.");

        // Validate Last Name
        if (!lastName || !/^[A-Za-z]+$/.test(lastName)) errors.push("Last name is required and should contain only letters.");

        // Validate Email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Invalid email address.");

        // // Validate Date of Birth (Optional check if DOB exists)
        // if (dob) {
        //     const dobDate = new Date(dob);
        //     const age = calculateAge(dobDate);
        //     if (age < 12 || age > 100) errors.push("Age must be between 12 and 100.");
        // }
        // if (checkEmailinUpdate(email) == true) {
        //     errors.push("Email already in use");
        // }

        // Validate Mobile Number
        if (!contactNo || !/^07\d{8}$/.test(contactNo)) errors.push("Mobile number must be 10 digits and start with '07'.");

        // If there are errors, display them and return early
        if (errors.length > 0) {
            showFormResponse("updateFormResponse", errors.join(','), "error");
            return;
        }

        const userId = document.getElementById("updatePopup").getAttribute("data-user-id");
        const roleId = document.getElementById("updatePopup").getAttribute("data-role-id");

        const formData = {
            user_id: userId,
            role_id: roleId,
            first_name: firstName,
            last_name: lastName,
            email: email,
            contact_no: contactNo,
        };

        console.log("Update user form submitted: ", formData);

        const authToken = localStorage.getItem("authToken");

        const requestOptions = {
            method: 'PUT', // Using PUT method for update
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData), // Stringify the data
            redirect: 'follow',
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=update_staff", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to update user");
                return response.json();
            })
            .then(data => {
                if (data.message) {
                    showFormResponse("updateFormResponse", data.message, "success");
                    setTimeout(() => {
                        document.getElementById("updatePopup").style.display = "none"; // Close the popup
                    }, 3000);
                    fetchMembersByRole(temp_role); // Refresh the members list by role
                } else {
                    showFormResponse("updateFormResponse", data.error, "error");
                }
            })
            .catch(error => console.error("Error updating user:", error));
    });

    // Calculate Age (Helper function for DOB validation)
    function calculateAge(dob) {
        const diff = Date.now() - dob.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    // Show form validation response
    function showFormResponse(responeContainerID, message, type) {
        const responseContainer = document.getElementById(responeContainerID);
        responseContainer.textContent = message;
        responseContainer.className = `form-response ${type}`;
        responseContainer.style.display = "block";

        setTimeout(() => {
            responseContainer.style.display = "none";
        }, 3000);
    }


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
    


    document.querySelectorAll('.role-filter').forEach(button => {
        button.addEventListener('click', event => {
            document.querySelectorAll('.role-filter').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            const role = event.target.dataset.role;
            console.log("Selected role: ", role);
            fetchMembersByRole(role);
        });
    });

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