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

// Add event listener to fetch emails and monitor email input
document.addEventListener('DOMContentLoaded', () => {
    fetchEmails();
    document.getElementById("email").addEventListener('input', checkEmail);
});

// Test data for equipment
const equipments = [
    { "Equipment ID": "EQ123", "Name": "Treadmill", "Purchase Date": "2023-01-15", "Status": "Active", "Usable Duration": "2 years" },
    { "Equipment ID": "EQ124", "Name": "Dumbbell Set", "Purchase Date": "2022-07-10", "Status": "Inactive", "Usable Duration": "5 years" },
    { "Equipment ID": "EQ125", "Name": "Stationary Bike", "Purchase Date": "2021-05-22", "Status": "Active", "Usable Duration": "3 years" }
];

// Function to populate the equipment table
function populateTable() {
    const tableBody = document.getElementById("equipmentsTable").querySelector("tbody");
    tableBody.innerHTML = "";
    equipments.forEach(equipment => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${equipment["Equipment ID"]}</td>
            <td>${equipment["Name"]}</td>
            <td>${equipment["Purchase Date"]}</td>
            <td>${equipment["Status"]}</td>
            <td>${equipment["Usable Duration"]}</td>
            <td>
                <a href="updateEquipment.php?id=${equipment['Equipment ID']}" class="button update-button">Update</a>
                <button class="button delete-button" onclick="handleDelete('${equipment["Equipment ID"]}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to handle equipment deletion
function handleDelete(equipmentId) {
    const popup = document.getElementById("deletePopup");
    const overlay = document.getElementById("overlay");
    popup.style.display = "block";
    overlay.style.display = "block";

    document.getElementById("confirmDelete").onclick = function() {
        deleteEquipment(equipmentId);
        popup.style.display = "none";
        overlay.style.display = "none";
    };

    document.getElementById("cancelDelete").onclick = closePopup;
    document.getElementById("closePopup").onclick = closePopup;
}

function closePopup() {
    document.getElementById("deletePopup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

// Delete equipment and refresh the table
function deleteEquipment(equipmentId) {
    const index = equipments.findIndex(equipment => equipment["Equipment ID"] === equipmentId);
    if (index > -1) {
        equipments.splice(index, 1);
        populateTable();
    }
}

// Call populateTable on page load
document.addEventListener("DOMContentLoaded", populateTable);

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
