document.addEventListener("DOMContentLoaded", () => {
    // Test user data
    const userData = {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      address: "1234 Elm Street, Springfield, USA",
      dob: "1990-01-01",
      gender: "Female"
    };
  
    // Populate user data
    document.getElementById("name").textContent = userData.name;
    document.getElementById("email").value = userData.email;
    document.getElementById("address").value = userData.address;
    document.getElementById("dob").value = userData.dob;
    document.getElementById("gender").value = userData.gender;
  
    // Change Password Event
    document.getElementById("change-password-btn").addEventListener("click", () => {
      fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email })
      })
      .then(response => response.json())
      .then(data => alert(data.message))
      .catch(error => console.error("Error:", error));
    });
  
    // Delete Account Popup Logic
    const deletePopup = document.getElementById("delete-account-popup");
    const deleteBtn = document.getElementById("delete-account-btn");
    const confirmDelete = document.getElementById("confirm-delete");
    const cancelDelete = document.getElementById("cancel-delete");
  
    deleteBtn.addEventListener("click", () => {
      deletePopup.style.display = "block";
    });
  
    cancelDelete.addEventListener("click", () => {
      deletePopup.style.display = "none";
    });
  
    confirmDelete.addEventListener("click", () => {
      const password = document.getElementById("delete-password").value;
      const reason = document.getElementById("delete-reason").value;

      const authToken = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("action", "account_delete");
      formData.append("password", password);
      formData.append("reason", reason);

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

      fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php",requestOptions)
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        if (data.success) window.location.href = "/login";
      })
      .catch(error => console.error("Error:", error));
    });
  });
  