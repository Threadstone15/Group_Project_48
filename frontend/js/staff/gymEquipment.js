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
