// Sample test data
let allEmails = [];

    // Fetch all emails from the backend on page load
    async function fetchEmails() {
        try {
            // Make a GET request to the backend to fetch emails
            const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=get_all_emails", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Authorization header if required (JWT token)
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            if (response.ok) {
                // Parse the JSON response and store the emails
                const result = await response.json();
                
                if (result && Array.isArray(result)) {
                    allEmails = result;
                } else {
                    console.error('Failed to fetch emails:', result);
                }
            } else {
                console.error('Failed to fetch emails');
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
        }
    }

    // Call the function to fetch emails on page load
    document.addEventListener('DOMContentLoaded', fetchEmails);

    // Function to check if email is already used
    function checkEmail() {
        const email = document.getElementById("email").value;
        const emailError = document.getElementById("email-error");

        // Check if the email exists in the array
        if (allEmails.includes(email)) {
            emailError.style.display = "inline";
        } else {
            emailError.style.display = "none";
        }
    }

    // Add event listener to the email input to check as user types
    document.getElementById("email").addEventListener('input', checkEmail);
const equipments = [
    { "Equipment ID": "EQ123", "Name": "Treadmill", "Purchase Date": "2023-01-15", "Status": "Active", "Usable Duration": "2 years" },
    { "Equipment ID": "EQ124", "Name": "Dumbbell Set", "Purchase Date": "2022-07-10", "Status": "Inactive", "Usable Duration": "5 years" },
    { "Equipment ID": "EQ125", "Name": "Stationary Bike", "Purchase Date": "2021-05-22", "Status": "Active", "Usable Duration": "3 years" }
];
console.log(equipments);
// Function to populate the table with test data
function populateTable() {
    const tableBody = document.getElementById("equipmentsTable").querySelector("tbody");
    tableBody.innerHTML = "";
    equipments.forEach((equipment) => {
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

    document.getElementById("cancelDelete").onclick = function() {
        popup.style.display = "none";
        overlay.style.display = "none";
    };

    document.getElementById("closePopup").onclick = function() {
        popup.style.display = "none";
        overlay.style.display = "none";
    };
}


// Function to delete equipment from the test data array and refresh the table
function deleteEquipment(equipmentId) {
    const index = equipments.findIndex(equipment => equipment["Equipment ID"] === equipmentId);
    if (index > -1) {
        equipments.splice(index, 1);
        populateTable();
    }
}

// Populate the table on page load
document.addEventListener("DOMContentLoaded", populateTable,fetchEmails);