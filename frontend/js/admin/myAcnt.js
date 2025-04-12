export function initAdmin_myAcnt() {
    console.log("Initializing admin account...");
  
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      showToast("Not authenticated. Please login again.");
      window.location.href = "/login";
      return;
    }
  
  
    // Change Password Logic
    const changePasswordPopup = document.getElementById("change-password-popup");
  
    // Validate Change Password Form
    function validateChangePasswordInputs() {
      const oldPass = document.getElementById("old-password").value;
      const newPass = document.getElementById("new-password").value;
      const confirmNewPass = document.getElementById("confirm-new-password").value;
  
      if (oldPass.trim() === "" || newPass.trim() === "" || confirmNewPass.trim() === "") {
        showToast("All fields must be filled out.", "error");
        return false;
      }
  
      if (newPass !== confirmNewPass) {
        showToast("New passwords do not match.", "error");
        return false;
      }
  
      if (oldPass === newPass) {
        showToast("New password cannot be the same as the old password.", "error");
        return false;
      }
  
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
      if (!passwordRegex.test(newPass)) {
          showToast("Password must be at least 6 characters long and include a number and a special character.", "error");
          return false;
      }
  
      return true;
    }
  
    document.getElementById("change-password-btn").addEventListener("click", () => {
      changePasswordPopup.classList.remove("hidden");
    });
  
    document.getElementById("cancel-change-password").addEventListener("click", () => {
      changePasswordPopup.classList.add("hidden");
    });
  
    document.getElementById("submit-change-password").addEventListener("click", () => {
      if (!validateChangePasswordInputs()) return; // If validation fails, do not proceed
  
      const oldPass = document.getElementById("old-password").value;
      const newPass = document.getElementById("new-password").value;
  
      const formData = new FormData();
      formData.append("action", "change_password");
      formData.append("oldPassword", oldPass);
      formData.append("newPassword", newPass);
  
      fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) throw new Error("Password change failed");
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            changePasswordPopup.classList.add("hidden");
            showToast(data.message);
          }else{
            showToast(data.message, "error");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          showToast("Error changing password" , "error");
        });
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
  