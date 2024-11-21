console.log("JS loaded");

const equipmentTable = document.getElementById("equipmentsMaintainceTable");

if (equipmentsMaintainceTable) {
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

    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=get_maintenances", requestOptions)
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
                        <td>${equipment['maintenance_id']}</td>
                        <td>${equipment['equipment_id']}</td>
                        <td>${equipment['maintenance_date']}</td>
                        <td>${equipment['details']}</td>
                        <td>${equipment['next_maintenance_date']}</td>
                        <td>
                            <button class="update-button" onclick="openUpdatePopup(this)">Update</button>
                            <button class="delete-button" onclick="deleteEquipment('${equipment['maintenance_id']}')">Delete</button>
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

function deleteEquipment(maintenanceId) {
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
              deletePopup.style.display = "none"; // Close the confirmation popup
          })
          .catch(error => console.error("Error deleting equipment:", error));
  };

  document.getElementById("cancelDelete").onclick = () => {
      deletePopup.style.display = "none"; // Close the confirmation popup if canceled
  };
}





function openUpdatePopup(button) {
    const row = button.closest('tr');
    const maintenanceId = row.cells[0].textContent;
    const equipmentId = row.cells[1].textContent; // Equipment ID
    const maintenanceDate = row.cells[2].textContent; // Maintenance Date
    const details = row.cells[3].textContent; // Details
    const nextMaintenanceDate = row.cells[4].textContent; // Next Maintenance Date
    
    document.getElementById("updateMaintenanceID").value = maintenanceId;
    document.getElementById("updateEquipmentID").value = equipmentId;
    document.getElementById("updateMaintainanceDate").value = maintenanceDate;
    document.getElementById("updateMaintainceDetails").value = details;
    document.getElementById("updateNextMaintenanceDate").value = nextMaintenanceDate;
    

  // Show the update popup
  document.getElementById("updatePopup").style.display = "block";
}

document.getElementById("closeUpdatePopup").onclick = () => {
  document.getElementById("updatePopup").style.display = "none"; // Close the update popup
};

document.getElementById("updateForm").addEventListener("submit", function (event) {
  event.preventDefault();

  console.log("Update equipment form submitted");

  const maintenanceId = document.getElementById("updateMaintenanceID").value;
  const equipmentId = document.getElementById("updateEquipmentID").value;
  const maintenanceDate = document.getElementById("updateMaintainanceDate").value;
  const details = document.getElementById("updateMaintainceDetails").value;
  const nextMaintenanceDate = document.getElementById("updateNextMaintenanceDate").value;

  const formData = {
    maintenance_id: maintenanceId,
    equipment_id: equipmentId,
    maintenance_date: maintenanceDate,
    details: details, 
    next_maintenance_date: nextMaintenanceDate
  };

  const authToken = localStorage.getItem("authToken");

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
        alert("Equipment updated successfully!");
        document.getElementById("updatePopup").style.display = "none"; // Close the popup
        fetchEquipmentList(); // Refresh the equipment list
      } else {
        alert("Failed to update equipment");
      }
    })
    .catch(error => console.error("Error updating equipment:", error));
});






document.getElementById('equipmentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    
    console.log("Add maintenance record form submitted"); // Debugging log
    
    // Get form input values
    const equipmentID = document.getElementById("equipmentID").value;
    const maintainanceDate = document.getElementById("maintainanceDate").value;
    const maintainceDetails = document.getElementById("maintainceDetails").value;
    const nextMaintenanceDate = document.getElementById("nextMaintenanceDate").value;
    
    console.log("Equipment ID:", equipmentID); // Debugging log
    console.log("Maintainance Date:", maintainanceDate); // Debugging log
    console.log("Details:", maintainceDetails); // Debugging log
    console.log("Next Maintenance Date:", nextMaintenanceDate); // Debugging log
    
    // Prepare form data using FormData
    const formData = new FormData();
    formData.append("equipment_id", equipmentID);
    formData.append("maintainance_date", maintainanceDate);
    formData.append("details", maintainceDetails);
    formData.append("next_maintenance_date", nextMaintenanceDate);
    formData.append("action", "add_maintenance"); // Set the action to match the backend case
    
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
                throw new Error("Failed to add maintenance record");
            }
            return response.text();
        })
        .then(result => {
            console.log("Maintenance record added successfully:", result); // Debugging log
            fetchEquipmentList(); // Refresh equipment list after adding
        })
        .catch(error => console.error("Error adding maintenance record:", error));
  });
  

// Close the delete popup when the close button is clicked
document.getElementById("closePopup").addEventListener("click", function () {
    const popup = document.getElementById("deletePopup");
    popup.style.display = "none";
});
