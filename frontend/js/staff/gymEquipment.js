export function initStaff_equipment() {
    console.log("JS loaded");

    initializePage();

    const equipmentTable = document.getElementById("equipmentsTable");
    const deletePopup = document.getElementById("deletePopup");
    const updatePopup = document.getElementById("updatePopup");
    const spinner = document.getElementById("loading-spinner");

    if (equipmentTable) {
        fetchEquipmentList();

    } else {
        console.warn("Equipment table not found. Skipping fetch.");
    }

    function filterEquipment() {
        const searchInput = document.getElementById('equipmentSearch');
        const filter = searchInput.value.toLowerCase().trim();
        const tableBody = document.getElementById("equipmentsTable").getElementsByTagName("tbody")[0];
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

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=get_equipments", requestOptions)
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
                        <td>${equipment['purchase_date']}</td>
                        <td>${equipment['status']}</td>
                        <td>${equipment['maintenance_frequency']}</td>
                        <td>
                            <input type="hidden" value="${equipment['equipment_id']}" class="equipment-id" />
                            <button class="update-button" onclick="openUpdatePopup(this)">Update</button>
                            <button class="delete-button" onclick="deleteEquipment('${equipment['equipment_id']}', '${equipment['name']}')">Remove</button>
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

    window.deleteEquipment = function(equipmentId, type) {
        const typeName = type.split('_')[0];
        console.log(`Delete button clicked for equipment ID: ${equipmentId}  ${typeName}`);


        // Show confirmation popup
        const deletePopup = document.getElementById("deletePopup");
        deletePopup.style.display = "block";

        document.getElementById("overlay").style.display = "block";

        document.getElementById("confirmDelete").onclick = () => {
            spinner.classList.remove("hidden");
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                console.error("Auth token not found. Please log in.");
                return;
            }

            console.log("Auth Token:", authToken); // Debugging log

            // Set up the request with headers for the DELETE method
            const requestOptions = {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'  // Ensure we send JSON content
                },
                redirect: 'follow'
            };

            // Send DELETE request to the backend with the equipmentId in the URL
            fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=delete_equipment&equipment_id=${equipmentId}&type=${typeName}`, requestOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to delete equipment");
                    }
                    return response.json(); // Expecting JSON response
                })
                .then(result => {
                    window.closeDeletePopup();// Close popup on success
                    fetchEquipmentList();
                    spinner.classList.add("hidden");
                    showToast("Equipment deleted successfully", "success");
            })
                .catch(error => {
                    console.error("Error deleting equipment:", error)
                    spinner.classList.add("hidden");
                    showToast("Failed to delete equipment", "error");
                });
        };

    // Call this to set up the close handlers
    window.setupDeletePopupHandlers();
}

   


    window.openUpdatePopup =function(button) {
        const row = button.closest('tr'); // Get the row containing the clicked button
        const name = row.cells[0].textContent; // Name
        const purchaseDate = row.cells[1].textContent;
        const status = row.cells[2].textContent;
        const maintenanceDuration = row.cells[3].textContent; // Maintenance Frequency

        const equipmentId = row.querySelector('.equipment-id').value;

        document.getElementById("overlay").style.display = "block";

        // Fill the update form with the selected row's data
        document.getElementById("updateEquipmentId").value = equipmentId;
        document.getElementById("updateEquipmentName").value = name;
        document.getElementById("updatePurchaseDate").value = purchaseDate;
        document.getElementById("updateStatus").value = status;
        document.getElementById("updateMaintenanceDuration").value = maintenanceDuration;

        // Show the update popup
        document.getElementById("updatePopup").style.display = "block";
    }

     // Close the Update Popup
     window.closeUpdatePopup = () => {
        document.getElementById("updatePopup").style.display = "none";
        document.getElementById("overlay").style.display = "none";
    };
    document.getElementById("closeUpdatePopup").onclick = window.closeUpdatePopup;



    // Real-time validation for Maintenance Duration
    const updateMaintenanceDurationInput = document.getElementById("updateMaintenanceDuration");

    updateMaintenanceDurationInput.addEventListener("input", function () {
        const value = this.value.trim();

        if (!/^\d+$/.test(value) || value < 1 || value > 365) {
            this.setCustomValidity("Please enter a number between 1 and 365.");
        } else {
            this.setCustomValidity(""); // Clear error if input is valid
        }
    });

    // Submit Event Listener for Update Form
    document.getElementById("updateForm").addEventListener("submit", function (event) {
        event.preventDefault();

        console.log("Update equipment form submitted");

        const equipmentId = document.getElementById("updateEquipmentId").value;
        const equipmentName = document.getElementById("updateEquipmentName").value;
        const purchaseDate = document.getElementById("updatePurchaseDate").value;
        const status = document.getElementById("updateStatus").value;
        const maintenanceDuration = document.getElementById("updateMaintenanceDuration").value;

        // Validate Maintenance Duration
        if (!/^\d+$/.test(maintenanceDuration) || maintenanceDuration < 1 || maintenanceDuration > 365) {
            alert("Maintenance duration must be a number between 1 and 365.");
            return;
        }
        spinner.classList.remove("hidden");
        const formData = {
            equipment_id: equipmentId,
            name: equipmentName,
            purchase_date: purchaseDate,
            status: status,
            maintenance_frequency: maintenanceDuration,
        };

        const authToken = localStorage.getItem("authToken");

        const requestOptions = {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
            redirect: "follow",
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=update_equipment_status", requestOptions)
            .then((response) => {
                if (!response.ok) throw new Error("Failed to update equipment");
                return response.json();
            })
            .then((data) => {
                if (data.message) {
                    window.closeUpdatePopup();
                    spinner.classList.add("hidden"); 
                    showToast("Equipment updated successfully", "success");
                    fetchEquipmentList();
                } else {
                    spinner.classList.add("hidden");
                    showToast("Failed to update equipment", "error");
                }
            })
            .catch((error) => console.error("Error updating equipment:", error));
    });


    document.getElementById('equipmentForm').addEventListener('submit', handleFormSubmit);

    // Handle the form submission logic
    function handleFormSubmit(event) {
        event.preventDefault();
        console.log("Add equipment form submitted"); // Debugging log

        // Get form input values
        const equipmentType = getEquipmentType();
        const purchaseDate = document.getElementById("purchaseDate").value;
        const maintenanceDuration = document.getElementById("maintenanceDuration").value;

        // Validate maintenance duration
        if (!validateMaintenanceDuration(maintenanceDuration)) {
            alert("Please enter a valid maintenance duration (1-365 days).");
            return;
        }

        console.log("Equipment Type:", equipmentType); // Debugging log
        console.log("Purchase Date:", purchaseDate); // Debugging log
        console.log("Maintenance Duration:", maintenanceDuration); // Debugging log

        // Show confirmation popup with the filled details
        showConfirmationPopup(equipmentType, purchaseDate, maintenanceDuration);
    }

    // Get the selected equipment type or custom input
    function getEquipmentType() {
        const equipmentTypeSelect = document.getElementById("equipmentType");
        const otherEquipmentTypeInput = document.getElementById("otherEquipmentType");

        return equipmentTypeSelect.value === "Other (Please Type)"
            ? otherEquipmentTypeInput.value.trim()
            : equipmentTypeSelect.value;
    }

    // Validate the maintenance duration (1-365 days)
    function validateMaintenanceDuration(maintenanceDuration) {
        return maintenanceDuration && !isNaN(maintenanceDuration) && maintenanceDuration >= 1 && maintenanceDuration <= 365;
    }

    // Show confirmation popup with the equipment details
    function showConfirmationPopup(equipmentType, purchaseDate, maintenanceDuration) {
        const confirmationPopup = document.getElementById('confirmationPopup');
        const confirmationMessage = document.getElementById('confirmationMessage');

        // Display the equipment details in the confirmation popup
        confirmationMessage.innerHTML = `
        <p><strong>Equipment Type:</strong> ${equipmentType}</p>
        <p><strong>Purchase Date:</strong> ${purchaseDate}</p>
        <p><strong>Maintenance Duration (Days):</strong> ${maintenanceDuration}</p>
    `;

        // Show the confirmation popup
        confirmationPopup.style.display = 'block';

        // Get confirmation buttons
        const confirmButton = document.getElementById('confirmAdd');
        const cancelButton = document.getElementById('cancelAdd');

        // Remove existing event listeners to prevent multiple submissions
        confirmButton.replaceWith(confirmButton.cloneNode(true));
        cancelButton.replaceWith(cancelButton.cloneNode(true));

        // Add event listeners again
        document.getElementById('confirmAdd').addEventListener('click', function () {
            addEquipmentToDatabase(equipmentType, purchaseDate, maintenanceDuration);
            confirmationPopup.style.display = 'none'; // Hide the popup after confirming
        });

        document.getElementById('cancelAdd').addEventListener('click', function () {
            confirmationPopup.style.display = 'none'; // Hide the popup if canceled
        });
    }


    // Add the equipment to the database
    function addEquipmentToDatabase(equipmentType, purchaseDate, maintenanceDuration) {
        const formData = new FormData();
        formData.append("type", equipmentType);
        formData.append("purchase_date", purchaseDate);
        formData.append("maintenance_frequency", maintenanceDuration);
        formData.append("status", "active");
        formData.append("action", "add_equipment");

        const authToken = localStorage.getItem("authToken");

        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData,
            redirect: 'follow'
        };
        spinner.classList.remove("hidden");
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to add equipment");
                return response.json(); // Parse JSON response
            })
            .then(result => {
                fetchEquipmentList();
                spinner.classList.add("hidden");
                showToast("Equipment added successfully", "success");
            })
            .catch(error => {
                console.error("Error adding equipment:", error);
                spinner.classList.add("hidden");
                showToast("Failed to add equipment", "error");
            });
    }




    // Fetch the available equipment types from the API
    function fetchEquipmentTypes() {
        console.log("Fetching Equipment Types from API");

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

        // Replace with the actual backend endpoint for equipment types
        const apiUrl = "http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=get_equipment_types";

        fetch(apiUrl, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch equipment types");
                }
                return response.json();
            })
            .then(data => {
                console.log("Fetched equipment types:", data);
                data.push({ type_name: "Other (Please Type)", no_items: 0 });
                localStorage.setItem("equipmentTypes", JSON.stringify(data));
                populateEquipmentTypes(data);
            })
            .catch(error => {
                console.error("Error fetching equipment types:", error);
            });
    }

    // Populate the equipment type dropdown with fetched data
    function populateEquipmentTypes(data) {
        console.log("Populating equipment types dropdown");
        const equipmentTypeSelect = document.getElementById("equipmentType");
        equipmentTypeSelect.innerHTML = `<option value="" disabled selected>Select an equipment type</option>`; // Clear existing options

        if (data.length > 0) {
            data.forEach(equipment => {
                const option = document.createElement("option");
                option.value = equipment['type_name']; // Use unique ID
                option.textContent = equipment['type_name']; // Use name as display text
                equipmentTypeSelect.appendChild(option);
            });
        } else {
            console.log("No equipment types available");
        }
    }

    // Initialize the page (optional)
    function initializePage() {
        fetchEquipmentTypes();
        setupEquipmentTypeDropdown();
    }

    // Setup event listener for changing equipment type selection
    function setupEquipmentTypeDropdown() {
        const equipmentTypeSelect = document.getElementById("equipmentType");
        const otherEquipmentTypeInput = document.getElementById("otherEquipmentType");

        equipmentTypeSelect.addEventListener("change", function () {
            if (this.value === "Other (Please Type)") {
                otherEquipmentTypeInput.style.display = "block"; // Show input for custom equipment type
            } else {
                otherEquipmentTypeInput.style.display = "none"; // Hide input if not selecting 'Other'
            }
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