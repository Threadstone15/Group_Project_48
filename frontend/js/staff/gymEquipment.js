console.log("JS loaded");

const equipmentTable = document.getElementById("equipmentsTable");

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
                            <button class="delete-button" onclick="deleteEquipment('${equipment['equipment_id']}')">Delete</button>
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
  const row = button.closest('tr'); // Get the row containing the clicked button
  const equipmentId = row.cells[0].textContent; // Equipment ID
  const name = row.cells[1].textContent; // Name
  const purchaseDate = row.cells[2].textContent; // Purchase Date
  const maintenanceDuration = row.cells[4].textContent; // Maintenance Frequency

  // Fill the update form with the selected row's data
  document.getElementById("updateEquipmentId").value = equipmentId;
  document.getElementById("updateEquipmentName").value = name;
  document.getElementById("updatePurchaseDate").value = purchaseDate;
  document.getElementById("updateMaintenanceDuration").value = maintenanceDuration;

  // Show the update popup
  document.getElementById("updatePopup").style.display = "block";
}

document.getElementById("closeUpdatePopup").onclick = () => {
  document.getElementById("updatePopup").style.display = "none"; // Close the update popup
};

document.getElementById("updateForm").addEventListener("submit", function (event) {
  event.preventDefault();

  console.log("Update equipment form submitted");

  const equipmentId = document.getElementById("updateEquipmentId").value;
  const equipmentName = document.getElementById("updateEquipmentName").value;
  const purchaseDate = document.getElementById("updatePurchaseDate").value;
  const maintenanceDuration = document.getElementById("updateMaintenanceDuration").value;

  const formData = {
    equipment_id: equipmentId,
    name: equipmentName,
    purchase_date: purchaseDate,
    status: "active",  // Assuming status is 'active' by default. Update if needed.
    maintenance_frequency: maintenanceDuration
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

  fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=update_equipment_status", requestOptions)
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
          fetchEquipmentList(); // Refresh equipment list after adding
      })
      .catch(error => console.error("Error adding equipment:", error));
});
