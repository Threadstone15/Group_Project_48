export function initAdmin_accounts() {
    console.log("initlaizing accounts page...");
    const spinner = document.getElementById("loading-spinner");
    let searchTimeout = null;
    let role = 'member';
    let type = 'active';
    let currentMembers;
    // Get all role filter buttons
    const roleButtons = document.querySelectorAll('.role-filter');
    const statusButtons = document.querySelectorAll('.status-filter');

    // Function to toggle the 'selected' class on the clicked button

    // Modify the initialization part to trigger default loading
    async function initialize() {

        console.log("initlaize accounts page");
        // Set the default active buttons
        const defaultRoleButton = document.querySelector('.role-filter[data-role="member"]');
        const defaultStatusButton = document.querySelector('.status-filter[data-role="active"]');
        
        if (defaultRoleButton) defaultRoleButton.classList.add('selected', 'active');
        if (defaultStatusButton) defaultStatusButton.classList.add('selected', 'active');
        
        // Fetch emails and members
        await fetchMembersByRole(role, type);
    }

    // Call initialize at the end of your initOwner_accounts function

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




    async function fetchMembersByRole(role, type) {
    try {
        spinner.classList.remove("hidden");
        console.log("Selected role: ", role);
        const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=get_members_by_role&role=${role}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const members = await response.json();
            console.log("response: ", members);
            currentMembers = members;
            spinner.classList.add("hidden");
            populateTable(members, type);  // Passing type to filter the results
        } else {
            spinner.classList.add("hidden");
            console.error('Failed to fetch members by role, HTTP status:', response.status);
        }
    } catch (error) {
        spinner.classList.add("hidden");
        console.error('Error fetching members by role:', error);
    }
    }

    // Populate table with members based on type
    function populateTable(members, type) {
        const tbody = document.querySelector("#equipmentsTable tbody");
        tbody.innerHTML = ''; // Clear existing rows

        // Filter members based on the type
        let filteredMembers = [];


        if (type == 'active') {
            filteredMembers = members.filter(member => member.status == 1); // Filter for active members
        } else if (type == 'inactive') {
            filteredMembers = members.filter(member => member.status == 2); // Filter for inactive members
        } else if (type == 'deleted') {
            filteredMembers = members.filter(member => member.status == 3); // Filter for deleted members
        }


        if (filteredMembers.length > 0) {
            filteredMembers.forEach(member => {
                const row = document.createElement('tr');

                
                // Determine button properties based on status filter
                let buttonText, buttonClass, actionType;
                if (type === 'active') {
                    buttonText = 'Deactivate';
                    buttonClass = 'deactivate-button';
                    actionType = 'deactivate';
                } else {
                    buttonText = 'Reactivate';
                    buttonClass = 'reactivate-button';
                    actionType = 'reactivate';
                }

                row.innerHTML = `
                    <td>${member.userID}</td>
                    <td>${member.firstName} ${member.lastName}</td>
                    <td>${member.email}</td>
                    <td>${member.phone}</td>
                    <td>
                        <button class="${buttonClass} action-button" data-id="${member.user_id}">${buttonText}</button>
                    </td>
                `;
                tbody.appendChild(row);

                // Add event listener to the new button
                const button = row.querySelector('.action-button');
                button.addEventListener('click', () => {
                    if (actionType === 'deactivate') {
                        confirmDeactivate(member.user_id);
                    } else {
                        confirmReactivate(member.user_id);
                    }
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5">No members found for the selected role.</td></tr>';
        }
    }
    document.getElementById('searchInput').addEventListener('input', (e) => {

        console.log("Search input: ", e.target.value);
        // Clear any existing timeout
        clearTimeout(searchTimeout);
        
        // Set a new timeout to trigger the search after 300ms of inactivity
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.trim().toLowerCase();
            if (searchTerm) {
                filterMembersBySearch(searchTerm);
            } else {
                // If search field is empty, show all current filtered members
                populateTable(currentMembers, type);
            }
        }, 300);
    });
    
    // Modify the filterMembersBySearch function to highlight matches
    function filterMembersBySearch(term) {
        const filtered = currentMembers.filter(member => {
            const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
            const email = member.email.toLowerCase();
            const roleID = member.userID.toLowerCase();
            return fullName.includes(term) || email.includes(term) || roleID.includes(term);
        });
        
        const tbody = document.querySelector("#equipmentsTable tbody");
        tbody.innerHTML = '';
        
        if (filtered.length > 0) {
            filtered.forEach(member => {
                const row = document.createElement('tr');
                const fullName = `${member.firstName} ${member.lastName}`;
                const email = member.email;
                const roleID = member.userID;
                
                // Highlight matching text
                const highlightedName = highlightMatch(fullName, term);
                const highlightedEmail = highlightMatch(email, term);
                const highlightedRoleID = highlightMatch(roleID, term);
                
                row.innerHTML = `
                    <td>${highlightedRoleID}</td>
                    <td>${highlightedName}</td>
                    <td>${highlightedEmail}</td>
                    <td>${member.phone}</td>
                    <td>
                        <button class="${type === 'active' ? 'deactivate-button' : 'reactivate-button'} action-button" data-id="${member.user_id}">
                            ${type === 'active' ? 'Deactivate' : 'Reactivate'}
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
                
                // Reattach event listeners to the new buttons
                const button = row.querySelector('.action-button');
                button.addEventListener('click', () => {
                    if (type === 'active') {
                        confirmDeactivate(member.user_id);
                    } else {
                        confirmReactivate(member.user_id);
                    }
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5">No matching members found.</td></tr>';
        }
    }
    
    // Helper function to highlight matching text
    function highlightMatch(text, term) {
        if (!term) return text;
        
        const regex = new RegExp(term, 'gi');
        return text.replace(regex, match => `<span class="highlight">${match}</span>`);
    }

    // Event listener for role filter buttons
    document.querySelectorAll('.role-filter').forEach(button => {
        button.addEventListener('click', event => {
            document.querySelectorAll('.role-filter').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            role = event.target.dataset.role; // Assign the selected role
            console.log("Selected role: ", role);
            deletePopup.style.display = 'none';
            reactivatePopup.style.display = 'none';
            setTimeout(() => {
                fetchMembersByRole(role, type);  // Call with the current role
            }, 50);
        });
    });

    // Event listener for status filter buttons
    document.querySelectorAll('.status-filter').forEach(button => {
        button.addEventListener('click', event => {
            document.querySelectorAll('.status-filter').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            type = event.target.dataset.role; // Assign the selected type
            console.log("Selected type: ", type);
            deletePopup.style.display = 'none';
            reactivatePopup.style.display = 'none';
            setTimeout(() => {
                fetchMembersByRole(role, type);  // Call with the current role
            }, 50);
        });
    });
    

    function confirmDeactivate(userId) {
        console.log("Deactivating member with ID:", userId);
        const deletePopup = document.getElementById('deletePopup');
        const confirmDeleteButton = document.getElementById('confirmDelete');
        const cancelDeleteButton = document.getElementById('cancelDelete');
        const deactivationReason = document.getElementById('deactivationReason');

        // Show the popup
        deletePopup.style.display = 'block';
        deactivationReason.value = ''; // Clear previous reason

        // Add event listener for the confirm button
        confirmDeleteButton.onclick = async function() {
            const reason = deactivationReason.value;
            if (reason) {
                await deactivateMember(userId, reason);
                deletePopup.style.display = 'none';
            } else {
                showToast("Please enter a reason for deactivation.", "error");
            }
        };

        // Close the popup when cancel is clicked
        cancelDeleteButton.onclick = function() {
            deletePopup.style.display = 'none';
        };

        // Close popup when clicking the X button
        document.getElementById('closePopup').onclick = function() {
            deletePopup.style.display = 'none';
        };
    }

    // Confirm reactivate action
    function confirmReactivate(userId) {
        const reactivatePopup = document.getElementById('reactivatePopup');
        const confirmReactivateButton = document.getElementById('confirmReactivate');
        const cancelReactivateButton = document.getElementById('cancelReactivate');
        const reactivationReason = document.getElementById('reactivationReason');

        // Show the popup
        reactivatePopup.style.display = 'block';
        reactivationReason.value = ''; // Clear previous reason

        // Add event listener for the confirm button
        confirmReactivateButton.onclick = async function() {
            const reason = reactivationReason.value;
            if (reason) {
                await reactivateMember(userId, reason);
                reactivatePopup.style.display = 'none';
            } else {
                showToast("Please enter a reason for reactivation.", "error");
            }
        };

        // Close the popup when cancel is clicked
        cancelReactivateButton.onclick = function() {
            reactivatePopup.style.display = 'none';
        };

        // Close popup when clicking the X button
        document.getElementById('closeReactivatePopup').onclick = function() {
            reactivatePopup.style.display = 'none';
        };
    }

    // Deactivate member function
    async function deactivateMember(userId, reason) {
        console.log("Deactivating member with ID:(Fetch)", userId);
        try {
            spinner.classList.remove("hidden");
            const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=deactivate_staff`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    reason: reason
                })
            });

            if (response.ok) {
                spinner.classList.add("hidden");
                showToast("Member deactivated successfully", "success");
                fetchMembersByRole(role, type); // Refresh table with current filters
            } else {
                spinner.classList.add("hidden");
                showToast("Failed to deactivate member", "error");
            }
        } catch (error) {
            spinner.classList.add("hidden");
            console.error('Error deactivating member:', error);
            showToast("An error occurred", "error");
        }
    }

    // Reactivate member function
    async function reactivateMember(userId, reason) {
        try {
            spinner.classList.remove("hidden");
            const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=reactivate_staff`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    reason: reason
                })
            });

            if (response.ok) {
                spinner.classList.add("hidden");
                showToast("Member reactivated successfully", "success");
                fetchMembersByRole(role, type); // Refresh table with current filters
            } else {
                spinner.classList.add("hidden");
                showToast("Failed to reactivate member", "error");
            }
        } catch (error) {
            console.error('Error reactivating member:', error);
            spinner.classList.add("hidden");
            showToast("An error occurred", "error");
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

        
    
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=add_staff", {
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
        
    initialize();
    

}