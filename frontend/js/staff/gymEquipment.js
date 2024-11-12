document.getElementById('EquipmentForm').addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent default form submission behavior   

  alert('Form submitted!');
});

// gymEquipment.js

// Fetch the list of equipment and populate the table
// function fetchEquipmentList() {
//     fetch('/api/equipment')  // Adjust the API endpoint as per your setup
//       .then(response => {
//         if (!response.ok) {
//           throw new Error("Failed to fetch equipment list");
//         }
//         return response.json();
//       })
//       .then(data => {
//         populateEquipmentTable(data);
//       })
//       .catch(error => console.error("Error fetching equipment list:", error));
//   }
  
//   // Populate the equipment table with data
//   function populateEquipmentTable(equipmentList) {
//     const tableBody = document.querySelector("#equipmentsTable tbody");
//     tableBody.innerHTML = ""; // Clear existing rows
  
//     if (equipmentList.length > 0) {
//       equipmentList.forEach(equipment => {
//         const row = document.createElement("tr");
//         row.innerHTML = `
//           <td>${equipment.equipmentId}</td>
//           <td>${equipment.name}</td>
//           <td>${equipment.purchaseDate}</td>
//           <td>${equipment.status}</td>
//           <td>${equipment.usableDuration}</td>
//         `;
//         tableBody.appendChild(row);
//       });
//     } else {
//       tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No equipments added</td></tr>`;
//     }
//   }
  
//   // Add a new equipment item when the form is submitted
//   function addEquipment(event) {
//     event.preventDefault();
  
//     const equipmentName = document.getElementById("equipmentName").value;
//     const purchaseDate = document.getElementById("purchaseDate").value;
//     const maintenanceDuration = document.getElementById("maintenanceDuration").value;
  
//     const equipmentData = {
//       name: equipmentName,
//       purchaseDate: purchaseDate,
//       maintenanceDuration: maintenanceDuration
//     };
  
//     fetch('http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(equipmentData)
//     })
//       .then(response => {
//         if (!response.ok) {
//           throw new Error("Failed to add equipment");
//         }
//         return response.json();
//       })
//       .then(data => {
//         console.log("Equipment added:", data);
//         fetchEquipmentList();  // Refresh the equipment list after adding
//       })
//       .catch(error => console.error("Error adding equipment:", error));
//   }
  
//   // Initialize event listeners on page load
//   document.addEventListener("DOMContentLoaded", () => {
//     fetchEquipmentList();
  
//     const form = document.querySelector(".equipment-form");
//     form.addEventListener("submit", addEquipment);
//   });
  