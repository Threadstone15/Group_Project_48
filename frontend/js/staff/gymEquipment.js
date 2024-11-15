console.log("JS loaded");

{/*const equipmentTable = document.getElementById("equipmentsTable");

    if (equipmentTable) {
        // If the table exists, trigger fetching the equipment list
        fetchEquipmentList();
    } else {
        console.warn("Equipment table not found. Skipping fetch.");
    }

    function fetchEquipmentList() {
        console.log("Fetching Equipments");

        // Retrieve auth token from local storage
        const authToken = localStorage.getItem("authToken");

        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        console.log("Auth Token:", authToken); // Debugging log

        // Set up request options with headers
        const requestOptions = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            redirect: 'follow'
        };

        // Send GET request to backend to fetch equipment list
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=get_equipments", requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch equipment list");
                }
                return response.json();
            })
            .then(data => {
                console.log("Fetched equipment list:", data); // Debugging log

                // Populate the equipment table in the DOM
                const tableBody = equipmentTable.getElementsByTagName("tbody")[0];
                tableBody.innerHTML = ""; // Clear existing table rows

                if (data.length > 0) {
                    data.forEach(equipment => {
                        const row = document.createElement("tr");

                        row.innerHTML = `
                            <td>${equipment['equipment_id']}</td>
                            <td>${equipment['name']}</td>
                            <td>${equipment['purchase_date']}</td>
                            <td>${equipment['status']}</td>
                            <td>${equipment['maintenance_frequency']}</td>
                        `;

                        tableBody.appendChild(row);
                    });
                } else {
                    const noDataRow = document.createElement("tr");
                    noDataRow.innerHTML = `<td colspan="5" style="text-align: center;">No equipment found</td>`;
                    tableBody.appendChild(noDataRow);
                }
            })
            .catch(error => console.error("Error fetching equipment list:", error));
    }*/}

document.getElementById('EquipmentForm').addEventListener('submit', (event) => {
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


document.addEventListener("DOMContentLoaded", () => {
  const equipmentsTableBody = document.querySelector("#equipmentsTable tbody");
  console.log("DOM loaded"); 

  // Sample data
  const sampleEquipments = [
      { id: "EQ001", name: "Treadmill", purchaseDate: "2023-01-15", status: "Good", duration: "3 years" },
      { id: "EQ002", name: "Dumbbells", purchaseDate: "2022-07-10", status: "Fair", duration: "2 years" },
      { id: "EQ003", name: "Exercise Bike", purchaseDate: "2021-11-20", status: "Excellent", duration: "4 years" },
  ];

  // Populate the table with sample data
  equipmentsTableBody.innerHTML = "";
  sampleEquipments.forEach(equipment => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${equipment.id}</td>
          <td>${equipment.name}</td>
          <td>${equipment.purchaseDate}</td>
          <td>${equipment.status}</td>
          <td>${equipment.duration}</td>
          <td>
              <button class="update-button">Update</button>
              <button class="delete-button">Delete</button>
          </td>
      `;
      equipmentsTableBody.appendChild(row);
  });

  // Add event listeners to "Update" and "Delete" buttons
  equipmentsTableBody.addEventListener("click", (e) => {
      if (e.target.classList.contains("update-button")) {
          const row = e.target.closest("tr");
          alert(`Update button clicked for: ${row.cells[1].textContent}`);
      }

      if (e.target.classList.contains("delete-button")) {
          const row = e.target.closest("tr");
          const equipmentName = row.cells[1].textContent;
          if (confirm(`Are you sure you want to delete ${equipmentName}?`)) {
              row.remove();
              alert(`${equipmentName} deleted.`);
          }
      }
  });
});
