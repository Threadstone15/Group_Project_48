export function initStaff_equipmentMaintain() {
    console.log("initialzing equipMaintainence.js");

    const equipmentTable = document.getElementById("equipmentsMaintainceTable");
    const spinner = document.getElementById("loading-spinner");

    if (equipmentsMaintainceTable) {
        fetchEquipmentList();
        fetchEquipmentIdList(); // Trigger fetching the equipment list if the table exists
    } else {
        console.warn("Equipment table not found. Skipping fetch.");
    }

    function filterEquipment() {
        const searchInput = document.getElementById('equipmentSearch');
        const filter = searchInput.value.toLowerCase().trim();
        const tableBody = document.getElementById("equipmentsMaintainceTable").getElementsByTagName("tbody")[0];
        const rows = tableBody.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            const nameCell = rows[i].getElementsByTagName('td')[0];
            if (nameCell) {
                const textValue = nameCell.textContent || nameCell.innerText;
                if (textValue.toLowerCase().indexOf(filter) > -1) {
                    rows[i].style.display = '';
                } else {
                    rows[i].style.display = 'none';
                }
            }
        }
    }

    function fetchEquipmentIdList() {
        console.log("Fetching Equipment IDs");


        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        const requestOptions = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` },
            redirect: 'follow'
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=get_equipments", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch equipment list");
                return response.json();
            })
            .then(data => {
                console.log("Fetched equipment ID list:", data);


                // Extract equipment IDs and save them to localStorage
                const equipmentData = data.map(equipment => ({
                    equipment_id: equipment['equipment_id'],
                    name: equipment['name']
                }));
                localStorage.setItem("equipmentData", JSON.stringify(equipmentData));
                console.log("Saved Equipment IDs in localStorage:", equipmentData);
            })
            .catch(error => console.error("Error fetching equipment list:", error));
    }


    function fetchEquipmentList() {
        console.log("Fetching Equipments");
        spinner.classList.remove("hidden");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        const requestOptions = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` },
            redirect: 'follow'
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=get_maintenances", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch equipment list");
                return response.json();
            })
            .then(data => {
                console.log("Fetched equipment list:", data);
                spinner.classList.add("hidden");

                const tableBody = equipmentTable.getElementsByTagName("tbody")[0];
                tableBody.innerHTML = "";

                if (data.length > 0) {
                    data.forEach(equipment => {
                        const row = document.createElement("tr");

                        row.innerHTML = `
                        <td>${equipment['name']}</td>
                        <td>${equipment['maintenance_date']}</td>
                        <td>${equipment['details']}</td>
                        <td>${equipment['next_maintenance_date']}</td>
                        <td>
                            <button class="update-button" onclick="openUpdatePopup('${equipment['maintenance_id']}', '${equipment['name']}', '${equipment['maintenance_date']}', '${equipment['details']}', '${equipment['next_maintenance_date']}')">Update</button>
                            <button class="delete-button" onclick="deleteEquipment('${equipment['maintenance_id']}')">Remove</button>
                        </td>
                    `;

                        tableBody.appendChild(row);
                    });

                    // Set up search input event listener after populating the table
                    const searchInput = document.getElementById('equipmentSearch');
                    if (searchInput) {
                        searchInput.addEventListener('keyup', filterEquipment);
                    }
                } else {
                    const noDataRow = document.createElement("tr");
                    noDataRow.innerHTML = `<td colspan="6" style="text-align: center;">No equipment found</td>`;
                    tableBody.appendChild(noDataRow);
                }
            })
            .catch(error => console.error("Error fetching equipment list:", error));
    }

    window.closeDeletePopup = function() {
        document.getElementById("deletePopup").style.display = "none";
        document.getElementById("overlay").style.display = "none";
    };
    
    window.setupDeletePopupHandlers = function() {
        // Set up cancel button
        document.getElementById("cancelDelete").onclick = window.closeDeletePopup;
        
        // Set up close button (X)
        document.getElementById("closePopup").addEventListener("click", window.closeDeletePopup);
    };

    window.deleteEquipment = function(maintenanceId) {
        console.log(`Delete button clicked for maintenance ID: ${maintenanceId}`);

        // Show confirmation popup
        const deletePopup = document.getElementById("deletePopup");
        deletePopup.style.display = "block";

        document.getElementById("confirmDelete").onclick = () => {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                console.error("Auth token not found. Please log in.");
                return;
            }

            console.log("Auth Token:", authToken); // Debugging log
            spinner.classList.remove("hidden");

            // Set up the request with headers for the DELETE method
            const requestOptions = {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'  // Ensure we send JSON content
                },
                redirect: 'follow'
            };

            // Send DELETE request to the backend with the maintenanceId in the URL
            fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=delete_maintenance&maintenance_id=${maintenanceId}`, requestOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to delete equipment");
                    }
                    return response.json(); // Expecting JSON response
                    
                })
                .then(result => {
                    console.log("Equipment deleted successfully:", result); // Debugging log
                    fetchEquipmentList(); // Refresh the equipment list after deletion
                    deletePopup.style.display = "none";
                    spinner.classList.add("hidden");
                    showToast("Maintenance record deleted successfully", "success");
                })
                .catch(error => {
                    console.error("Error adding maintenance record:", error);
                    spinner.classList.add("hidden");
                })
        };

        // Call this to set up the close handlers
        window.setupDeletePopupHandlers();

       
    }





    window.openUpdatePopup = function(
        maintenanceId,
        equipmentId,
        maintenanceDate,
        details,
        nextMaintenanceDate
    ) {
       

        document.getElementById("updateMaintenanceID").value = maintenanceId;
        document.getElementById("updateEquipmentID").value = equipmentId;
        document.getElementById("updateMaintainanceDate").value = maintenanceDate;
        document.getElementById("updateMaintainceDetails").value = details;
        document.getElementById("updateNextMaintenanceDate").value = nextMaintenanceDate;


        // Show the update popup
        document.getElementById("updatePopup").style.display = "block";
    }

    // Close the Update Popup
    window.closeUpdatePopup = () => {
        document.getElementById("updatePopup").style.display = "none";
        document.getElementById("overlay").style.display = "none";
    };
    document.getElementById("closeUpdatePopup").onclick = window.closeUpdatePopup;

    

    document.getElementById("updateForm").addEventListener("submit", function (event) {
        event.preventDefault();

        console.log("Update equipment form submitted");

        const maintenanceId = document.getElementById("updateMaintenanceID").value;
        const equipmentId = document.getElementById("updateEquipmentID").value;
        const maintenanceDate = document.getElementById("updateMaintainanceDate").value;
        const details = document.getElementById("updateMaintainceDetails").value;
        const nextMaintenanceDate = document.getElementById("updateNextMaintenanceDate").value;

        console.log("Maintenance ID:", maintenanceId);
        console.log("Equipment ID:", equipmentId);
        console.log("Maintenance Date:", maintenanceDate);
        console.log("Details:", details);
        console.log("Next Maintenance Date:", nextMaintenanceDate);


        if (!maintenanceDate || !details || !nextMaintenanceDate) {
            alert("Please fill in all fields.");
            return;
        }

        // Ensure next maintenance date is after maintenance date
        const maintenanceDateObj = new Date(maintenanceDate);
        const nextMaintenanceDateObj = new Date(nextMaintenanceDate);

        if (nextMaintenanceDateObj <= maintenanceDateObj) {
            alert("Next Maintenance Date must be later than the Maintenance Date.");
            return;
        }



        // Prepare the form data for update
        const formData = {
            maintenance_id: maintenanceId,
            equipment_id: equipmentId,
            maintenance_date: maintenanceDate,
            details: details,
            next_maintenance_date: nextMaintenanceDate
        };

        const authToken = localStorage.getItem("authToken");
        spinner.classList.remove("hidden");

        const requestOptions = {
            method: 'PUT', // Using PUT method for update
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json', // Sending JSON data
            },
            body: JSON.stringify(formData), // Stringify the data
            redirect: 'follow'
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=update_maintenance_status", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to update equipment");
                return response.json();
            })
            .then(data => {
                if (data.message) {
                    document.getElementById("updatePopup").style.display = "none"; // Close the popup
                    fetchEquipmentList(); // Refresh the equipment list
                    spinner.classList.add("hidden");
                    showToast("Maintenance record updated successfully", "success");
                } else {
                    console.error("Error updating equipment:", data);
                    spinner.classList.add("hidden");
                    showToast("Error updating maintenance record", "error");
                }
            })
            .catch(error => console.error("Error updating equipment:", error));
    });


// Attach event listeners for search input
const equipmentNameInput = document.getElementById("equipmentName");
const equipmentIDInput = document.getElementById("equipmentID");
const suggestionsList = document.getElementById("equipmentSuggestions");

let isSelectingSuggestion = false;

// Handle search input and focus
equipmentNameInput.addEventListener("input", handleSearchInput);
equipmentNameInput.addEventListener("focus", handleSearchInput);

function handleSearchInput(event) {
    const query = event.target.value.toLowerCase();
    
    // Clear previous suggestions
    suggestionsList.innerHTML = "";
    suggestionsList.style.display = "none";

    // If empty query, don't show suggestions
    if (!query.trim()) return;

    // Retrieve equipment data from local storage
    const savedEquipmentData = JSON.parse(localStorage.getItem("equipmentData")) || [];
    if (savedEquipmentData.length === 0) {
        console.error("No equipment data available. Fetch the equipment list first.");
        return;
    }

    // Filter equipment names based on input
    const filteredEquipments = savedEquipmentData.filter(equipment =>
        equipment.name.toLowerCase().includes(query)
    );

    // Display filtered equipment names as suggestions
    if (filteredEquipments.length > 0) {
        suggestionsList.style.display = "block";
        filteredEquipments.forEach(equipment => {
            const li = document.createElement("li");
            li.textContent = equipment.name;
            li.classList.add("suggestion-item");

            // Handle suggestion selection
            li.addEventListener("mousedown", (e) => {
                e.preventDefault();
                isSelectingSuggestion = true;
                equipmentNameInput.value = equipment.name;
                equipmentIDInput.value = equipment.equipment_id;
                suggestionsList.innerHTML = "";
                suggestionsList.style.display = "none";
            });

            suggestionsList.appendChild(li);
        });
    } else {
        // Show "No matches found" message
        suggestionsList.style.display = "block";
        const li = document.createElement("li");
        li.textContent = "No matches found";
        li.classList.add("no-match");
        suggestionsList.appendChild(li);
    }
}

// Handle blur event with delay
equipmentNameInput.addEventListener("blur", () => {
    setTimeout(() => {
        if (isSelectingSuggestion) {
            isSelectingSuggestion = false;
            return;
        }
        
        const savedEquipmentData = JSON.parse(localStorage.getItem("equipmentData")) || [];
        const isValidEquipment = savedEquipmentData.some(
            equipment => equipment.name === equipmentNameInput.value
        );

        if (!isValidEquipment) {
            equipmentNameInput.value = "";
            equipmentIDInput.value = "";
        }
        
        suggestionsList.style.display = "none";
    }, 200);
});

// Hide suggestions when clicking outside
document.addEventListener("click", (event) => {
    if (!equipmentNameInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = "none";
    }
});

// When showing suggestions:
document.getElementById('equipmentName').classList.add('has-suggestions');

// When hiding suggestions:
document.getElementById('equipmentName').classList.remove('has-suggestions');


    document.getElementById('equipmentForm').addEventListener('submit', (event) => {
        event.preventDefault();

        console.log("Add maintenance record form submitted");

        // Get form input values
        const equipmentID = document.getElementById("equipmentID").value;
        const equipmentName = document.getElementById("equipmentName").value;
        const maintainanceDate = document.getElementById("maintainanceDate").value;
        const maintenanceDetails = document.getElementById("maintainceDetails").value;
        const nextMaintenanceDate = document.getElementById("nextMaintenanceDate").value;

        console.log("Form Data:", { equipmentID, equipmentName, maintainanceDate, maintenanceDetails, nextMaintenanceDate });

        // Validate the form inputs
        if (!equipmentID || isNaN(equipmentID)) {
            alert("Please enter a valid Equipment ID.");
            return;
        }
        if (!maintainanceDate || !maintenanceDetails || !nextMaintenanceDate) {
            alert("Please fill in all fields.");
            return;
        }

        // Ensure next maintenance date is after maintenance date
        const maintenanceDateObj = new Date(maintainanceDate);
        const nextMaintenanceDateObj = new Date(nextMaintenanceDate);

        if (nextMaintenanceDateObj <= maintenanceDateObj) {
            alert("Next Maintenance Date must be later than the Maintenance Date.");
            return;
        }

        const formData = new FormData();
        formData.append("equipment_id", equipmentID);
        formData.append("equipment_name", equipmentName);
        formData.append("maintainance_date", maintainanceDate);
        formData.append("details", maintenanceDetails);
        formData.append("next_maintenance_date", nextMaintenanceDate);
        formData.append("action", "add_maintenance");

        // Retrieve auth token from local storage
        const authToken = localStorage.getItem("authToken");

        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        console.log("Auth Token:", authToken);

        spinner.classList.remove("hidden");

        // Set up the request with headers and form data
        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData,
            redirect: 'follow'
        };

        // Send POST request to backend
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php", requestOptions)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message); });
                }
                return response.json();
            })
            .then(result => {
                console.log("Maintenance record added successfully:", result);
                fetchEquipmentList(); // Refresh equipment list after adding
                spinner.classList.add("hidden");
                showToast("Maintenance record added successfully.");
            })
            .catch(error => {
                console.error("Error adding maintenance record:", error);
                spinner.classList.add("hidden");
                showToast("Error: " + error.message);
            })
    });






    // Close the delete popup when the close button is clicked
    document.getElementById("closePopup").addEventListener("click", function () {
        const popup = document.getElementById("deletePopup");
        popup.style.display = "none";
    });

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