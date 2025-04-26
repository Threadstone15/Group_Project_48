export async function initAdmin_systemConfig() {
  console.log("Initializing systemConfig.js");

  const configList = document.getElementById("config-list");
  const spinner = document.getElementById("loading-spinner");
  spinner.classList.remove("hidden");

  try {
    const res = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=get_all_system_configs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      },
      body: JSON.stringify({ action: "get_all_system_configs" })
    });

    const data = await res.json();
    console.log("Response data:", data);

    if (res.ok && data.success) {
      const configs = data.configs;
      Object.keys(configs).forEach(key => {
        renderConfigField(key, configs[key]);
      });
    } else {
      showToast("Could not load configuration settings.", "error");
    }
  } catch (error) {
    console.error("Error fetching configs:", error);
    showToast("An error occurred while loading settings.", "error");
  }

  spinner.classList.add("hidden");

  function renderConfigField(key, value) {
    const wrapper = document.createElement("div");
    wrapper.className = "form-group mb-3";

    const label = document.createElement("label");
    label.textContent = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    let input;

    if (key === "maintaince_mode" || key === "notifications") {
      input = document.createElement("select");
      input.className = "form-control";
      ["enabled", "disabled"].forEach(optVal => {
        const opt = document.createElement("option");
        opt.value = optVal;
        opt.textContent = optVal.charAt(0).toUpperCase() + optVal.slice(1);
        if (value === optVal) opt.selected = true;
        input.appendChild(opt);
      });
    } else if (key === "currency") {
      input = document.createElement("select");
      input.className = "form-control";
      ["USD", "LKR", "INR", "EUR", "GBP"].forEach(curr => {
        const opt = document.createElement("option");
        opt.value = curr;
        opt.textContent = curr;
        if (value === curr) opt.selected = true;
        input.appendChild(opt);
      });
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.value = value;
      input.name = key;
      input.className = "form-control";
    }

    const button = document.createElement("button");
    button.textContent = "Update";
    button.className = "btn btn-primary mt-2";

    button.addEventListener("click", () => {
      const newValue = input.value.trim();

      // Validation
      if ((key === "gym_capacity" || key === "session_time") && !/^[1-9]\d*$/.test(newValue)) {
        showToast(`Please enter a valid positive integer for ${label.textContent}`, "error");
        return;
      }

      if (key === "gym_no" && !/^\d{10}$/.test(newValue)) {
        showToast("Phone number must be exactly 10 digits.", "error");
        return;
      }

      if (key === "gym_email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
        showToast("Please enter a valid email address.", "error");
        return;
      }
      
      showConfirmationPopup(label.textContent, newValue, () => {
        updateConfigValue(key, newValue);
      });
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(button);
    configList.appendChild(wrapper);
  }

  async function updateConfigValue(key, value) {
    const spinner = document.getElementById("loading-spinner");
    spinner.classList.remove("hidden");

    const payload = {
      action: "update_system_config",
      key,
      value
    };

    try {
      const res = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=update_system_config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Configuration updated successfully!", "success");
      } else {
        showToast(data.message || "Failed to update configuration.", "error");
      }
    } catch (err) {
      console.error("Update error:", err);
      showToast("An error occurred while updating configuration.", "error");
    } finally {
      spinner.classList.add("hidden");
    }
  }

  function showConfirmationPopup(field, value, onConfirm) {
    const modal = document.getElementById("confirmation-modal");
    const message = document.getElementById("confirmation-message");
    const confirmBtn = document.getElementById("confirm-btn");
    const cancelBtn = document.getElementById("cancel-btn");

    message.textContent = `Are you sure you want to update "${field}" to "${value}"?`;
    modal.classList.remove("hidden");

    const confirmHandler = () => {
      modal.classList.add("hidden");
      onConfirm();
      confirmBtn.removeEventListener("click", confirmHandler);
      cancelBtn.removeEventListener("click", cancelHandler);
    };

    const cancelHandler = () => {
      modal.classList.add("hidden");
      confirmBtn.removeEventListener("click", confirmHandler);
      cancelBtn.removeEventListener("click", cancelHandler);
    };

    confirmBtn.addEventListener("click", confirmHandler);
    cancelBtn.addEventListener("click", cancelHandler);
  }

  function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 5000);
  }
  
}
