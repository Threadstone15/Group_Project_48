console.log("JS loaded");

const equipmentTable = document.getElementById("equipmentsTable");
const deletePopup = document.getElementById("deletePopup");
const updatePopup = document.getElementById("updatePopup");

if (equipmentTable) {
    fetchEquipmentList(); // Trigger fetching the equipment list if the table exists
} else {
    console.warn("Equipment table not found. Skipping fetch.");
}

function fetchEquipmentList() {
    console.log("Fetching Equipments");

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

            const tableBody = equipmentTable.getElementsByTagName("tbody")[0];
            tableBody.innerHTML = "";

            if (data.length > 0) {
                data.forEach(equipment => {
                    const row = document.createElement("tr");

                    row.innerHTML = `
                        <td>${equipment['equipment_id']}</td>
                        <td>${equipment['name']}</td>
                        <td>${equipment['purchase_date']}</td>
                        <td>${equipment['status']}</td>
                        <td>${equipment['maintenance_frequency']}</td>
                        <td>
                            <button class="update-button" onclick="openUpdatePopup(this)">Update</button>
                            <button class="delete-button" onclick="deleteEquipment('${equipment['equipment_id']}')">Remove</button>
                        </td>
                    `;

                    tableBody.appendChild(row);
                });
            } else {
                const noDataRow = document.createElement("tr");
                noDataRow.innerHTML = `<td colspan="6" style="text-align: center;">No equipment found</td>`;
                tableBody.appendChild(noDataRow);
            }
        })
        .catch(error => console.error("Error fetching equipment list:", error));
}

function deleteEquipment(equipmentId) {
  console.log(`Delete button clicked for equipment ID: ${equipmentId}`);
  
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
      fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=delete_equipment&equipment_id=${equipmentId}`, requestOptions)
          .then(response => {
              if (!response.ok) {
                  throw new Error("Failed to delete equipment");
              }
              return response.json(); // Expecting JSON response
          })
          .then(result => {
              console.log("Equipment deleted successfully:", result);
              alert("Equipment removed successfully!"); // Debugging log
              fetchEquipmentList(); // Refresh the equipment list after deletion
              deletePopup.style.display = "none"; // Close the confirmation popup
          })
          .catch(error => {
              console.error("Error deleting equipment:", error)
              alert("Failed to remove the equipment");
          });
  };

  document.getElementById("cancelDelete").onclick = () => {
      deletePopup.style.display = "none"; // Close the confirmation popup if canceled
  };
}





function openUpdatePopup(button) {
    const row = button.closest('tr'); // Get the row containing the clicked button
    const equipmentId = row.cells[0].textContent; // Equipment ID
    const name = row.cells[1].textContent; // Name
    const purchaseDate = row.cells[2].textContent;
    const status = row.cells[3].textContent;
    const maintenanceDuration = row.cells[4].textContent; // Maintenance Frequency
  
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
  document.getElementById("closeUpdatePopup").onclick = () => {
    document.getElementById("updatePopup").style.display = "none";
  };
  
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
          alert("Equipment updated successfully!");
          document.getElementById("updatePopup").style.display = "none";
          fetchEquipmentList();
        } else {
          alert("Failed to update equipment");
        }
      })
      .catch((error) => console.error("Error updating equipment:", error));
  });
  



/*


document.getElementById('equipmentForm').addEventListener('submit', (event) => {
  event.preventDefault();
  
  console.log("Add equipment form submitted"); // Debugging log
  
  // Get form input values
  const equipmentName = document.getElementById("equipmentName").value;
  const purchaseDate = document.getElementById("purchaseDate").value;
  const maintenanceDuration = document.getElementById("maintenanceDuration").value;
  
  console.log("Equipment Name:", equipmentName); // Debugging log
  console.log("Purchase Date:", purchaseDate); // Debugging log
  console.log("Maintenance Duration:", maintenanceDuration); // Debugging log
  
  // Prepare form data using FormData
  const formData = new FormData();
  formData.append("name", equipmentName);
  formData.append("purchase_date", purchaseDate);
  formData.append("maintenance_frequency", maintenanceDuration);
  formData.append("status", "active"); // Assuming "status" is hard-coded as "active"
  formData.append("action", "add_equipment"); // Set the action to match the backend case
  
  // Retrieve auth token from local storage
  const authToken = localStorage.getItem("authToken");
  
  if (!authToken) {
      console.error("Auth token not found. Please log in.");
      return;
  }
  
  console.log("Auth Token:", authToken); // Debugging log
  
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
              throw new Error("Failed to add equipment");
          }
          return response.text();
      })
      .then(result => {
          console.log("Equipment added successfully:", result); // Debugging log
          fetchEquipmentList(); 
          alert("Equipment added successfully!");
      })
      .catch(error => {
        console.error("Error adding equipment:", error)
        alert("Failed to add Euipment");
      });
});

// Close the delete popup when the close button is clicked
document.getElementById("closePopup").addEventListener("click", function () {
    const popup = document.getElementById("deletePopup");
    popup.style.display = "none";
});*/

// Maintenance duration input validation (numbers only, range 1-365)
document.getElementById("maintenanceDuration").addEventListener("input", function (event) {
    const input = event.target;
    let value = input.value;

    // Remove any non-numeric characters
    value = value.replace(/[^0-9]/g, "");

    // Ensure the value stays within the range 1-365
    if (value > 365) {
        value = "365";
    } else if (value < 1 && value !== "") {
        value = "1";
    }

    // Update the input value
    input.value = value;
});

document.getElementById('equipmentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    
    console.log("Add equipment form submitted"); // Debugging log
    
    // Get form input values
    const equipmentName = document.getElementById("equipmentName").value;
    const purchaseDate = document.getElementById("purchaseDate").value;
    const maintenanceDuration = document.getElementById("maintenanceDuration").value;

    // Validate maintenance duration
    if (!maintenanceDuration || isNaN(maintenanceDuration) || maintenanceDuration < 1 || maintenanceDuration > 365) {
        alert("Please enter a valid maintenance duration (1-365 days).");
        return;
    }
    
    console.log("Equipment Name:", equipmentName); // Debugging log
    console.log("Purchase Date:", purchaseDate); // Debugging log
    console.log("Maintenance Duration:", maintenanceDuration); // Debugging log
    
    // Prepare form data using FormData
    const formData = new FormData();
    formData.append("name", equipmentName);
    formData.append("purchase_date", purchaseDate);
    formData.append("maintenance_frequency", maintenanceDuration);
    formData.append("status", "active"); // Assuming "status" is hard-coded as "active"
    formData.append("action", "add_equipment"); // Set the action to match the backend case
    
    // Retrieve auth token from local storage
    const authToken = localStorage.getItem("authToken");
    
    if (!authToken) {
        console.error("Auth token not found. Please log in.");
        return;
    }
    
    console.log("Auth Token:", authToken); // Debugging log
    
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
                throw new Error("Failed to add equipment");
            }
            return response.text();
        })
        .then(result => {
            console.log("Equipment added successfully:", result); // Debugging log
            fetchEquipmentList(); 
            alert("Equipment added successfully!");
        })
        .catch(error => {
            console.error("Error adding equipment:", error);
            alert("Failed to add Equipment");
        });
});

