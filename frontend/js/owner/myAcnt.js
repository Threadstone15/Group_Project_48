export function initOwner_myAcnt(){
    console.log("Initializing owner account...");

  const authToken = localStorage.getItem("authToken");
  if (!authToken) {
    showToast("Not authenticated. Please login again.");
    window.location.href = "/login";
    return;
  }

  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  // Fetch Profile Data
  fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=get_profile", requestOptions)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load profile data");
      return res.json();
    })
    .then((data) => {
      console.log("Profile data:", data);
    
      const user = data.data; // This is the actual profile info
    
      document.getElementById("name").textContent = user.full_name;
      document.getElementById("email").value = user.email;
      document.getElementById("address").value = user.address;
    
      if (user.DOB) {
        const formattedDOB = new Date(user.DOB).toISOString().split("T")[0];
        document.getElementById("dob").value = formattedDOB;
      } else {
        console.warn("DOB not available");
      }
    
      document.getElementById("gender").value = user.gender.toUpperCase();
      document.getElementById("phone").value = user.phone;
      updateProfileImage();
    })
    
    .catch((err) => {
      console.error("Error:", err);
      showToast("Something went wrong fetching profile.", "error");
    });

  // Enable Edit Mode
  document.getElementById("edit-btn").addEventListener("click", () => {
    document.getElementById("address").readOnly = false;
    document.getElementById("dob").readOnly = false;
    document.getElementById("gender").disabled = false;
    document.getElementById("phone").readOnly = false;
    document.getElementById("update-profile-btn").disabled = false;
  });

  // Validate Profile Form Inputs
  function validateProfileInputs() {
    console.log("Validating profile inputs...");
    const address = document.getElementById("address").value;
    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender").value;
    const phone = document.getElementById("phone").value;

    // Validate address
    if (address.trim() === "") {
      showToast("Address cannot be empty." , "error");
      return false;
    }

    // Validate DOB (must not be empty and in the future)
    const dobDate = new Date(dob);
    if (dob.trim() === "" || dobDate > new Date()) {
      showToast("Please enter a valid Date of Birth." , "error");
      return false;
    }

    // Validate gender
    if (!["M", "F"].includes(gender.toUpperCase())) {
      showToast("Gender must be M or F.", "error");
      return false;
    }

    // Validate phone number (must be 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      showToast("Phone number must be 10 digits." , "error");
      return false;
    }

    return true;
  }

  // Update Profile
  document.getElementById("update-profile-btn").addEventListener("click", () => {
    console.log("Updating profile...");
    if (!validateProfileInputs()) return; // If validation fails, do not proceed

    const formData = new FormData();
    formData.append("action", "update_profile");
    formData.append("address", document.getElementById("address").value);
    formData.append("dob", document.getElementById("dob").value);
    formData.append("gender", document.getElementById("gender").value);
    formData.append("phone", document.getElementById("phone").value);

    const updateOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    };

    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=update_profile", updateOptions)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update profile");
        return res.json();
      })
      .then((result) => {
        showToast(result.message);
        document.getElementById("update-profile-btn").disabled = true;
      })
      .catch((err) => {
        console.error("Error updating profile:");
        showToast("Error updating profile", "error");
      });
  });

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

    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php", {
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

  // Delete Account Logic
  const deletePopup = document.getElementById("delete-account-popup");

  document.getElementById("delete-account-btn").addEventListener("click", () => {
    deletePopup.classList.remove("hidden");
  });

  document.getElementById("cancel-delete").addEventListener("click", () => {
    deletePopup.classList.add("hidden");
  });

  document.getElementById("confirm-delete").addEventListener("click", () => {
    const password = document.getElementById("delete-password").value;
    const reason = document.getElementById("delete-reason").value;
    const confirmText = document.getElementById("delete-confirm-text").value;

    if (confirmText.trim().toLowerCase() !== "confirm") {
      showToast("Please type 'confirm' to delete your account", "error");
      return;
    }

    const formData = new FormData();
    formData.append("action", "account_delete");
    formData.append("password", password);
    formData.append("reason", reason);

    console.log(formData);

    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Deletion failed");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          showToast(data.message);
          setTimeout(() => {
            localStorage.clear();
            window.location.href = "/Group_Project_48/home";
          }, 3000);
        }else{
          showToast(data.message, "error");
        }
      })
      .catch((err) => {
        console.error("Error deleting account:", err);
        showToast("Account deletion failed.", "error");
      });
  });

  const genderSelect = document.getElementById("gender");
  const profileImage = document.getElementById("profile-image");

    function updateProfileImage() {
        const gender = genderSelect.value;

        if (gender === "M") {
            profileImage.src = "/Group_Project_48/frontend/assets/images/trainer_m.jpg";
        } else if (gender === "F") {
            profileImage.src = "/Group_Project_48/frontend/assets/images/trainer_f.jpg";
        } else {
            profileImage.src = "/Group_Project_48/frontend/assets/images/trainer_m.jpg"; // default image
        }
    }

    // Load correct image on page load
    updateProfileImage();

    // If gender becomes editable later, listen for changes
    genderSelect.addEventListener("change", updateProfileImage);

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