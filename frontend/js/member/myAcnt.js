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

    // Change Password Popup Logic
    const changePasswordPopup = document.getElementById("change-password-popup");
    const changePasswordBtn = document.getElementById("change-password-btn");
    const confirmChangePassword = document.getElementById("confirm-change-password");
    const cancelChangePassword = document.getElementById("cancel-change-password");

    changePasswordBtn.addEventListener("click", () => {
        changePasswordPopup.style.display = "block";
    });

    cancelChangePassword.addEventListener("click", () => {
        changePasswordPopup.style.display = "none";
    });

    confirmChangePassword.addEventListener("click", () => {
        const currentPassword = document.getElementById("current-password").value;
        const newPassword = document.getElementById("new-password").value;  
        const confirmPassword = document.getElementById("confirm-new-password").value;

        const authToken = localStorage.getItem("authToken");

        if (newPassword !== confirmPassword) {
            alert("New password and confirm password do not match.");
            return;
        }

        const formData = new FormData();
        formData.append("action", "change_password");
        formData.append("current_password", currentPassword);
        formData.append("new_password", newPassword);

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

        console.log("currentPassword:", currentPassword);
        console.log("newPassword:", newPassword);

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php",requestOptions)
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
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
  