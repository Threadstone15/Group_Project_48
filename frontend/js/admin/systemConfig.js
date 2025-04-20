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
      alert("Could not load configuration settings.");
    }
  } catch (error) {
    console.error("Error fetching configs:", error);
    alert("An error occurred while loading settings.");
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
        alert("Please enter a valid positive integer for " + label.textContent);
        return;
      }

      if (key === "gym_no" && !/^\d{10}$/.test(newValue)) {
        alert("Phone number must be exactly 10 digits.");
        return;
      }

      if (key === "gym_email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
        alert("Please enter a valid email address.");
        return;
      }
      

      // Show custom confirmation modal
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
        alert("Configuration updated successfully!");
      } else {
        alert(data.message || "Failed to update configuration.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("An error occurred while updating configuration.");
    }
  }

  // Custom confirmation popup
  function showConfirmationPopup(field, value, onConfirm) {
    const modal = document.getElementById("confirmation-modal");
    const message = document.getElementById("confirmation-message");
    const confirmBtn = document.getElementById("confirm-btn");
    const cancelBtn = document.getElementById("cancel-btn");

    message.textContent = `Are you sure you want to update "${field}" to "${value}"?`;
    modal.style.display = "block";

    confirmBtn.onclick = () => {
      modal.style.display = "none";
      onConfirm();
    };

    cancelBtn.onclick = () => {
      modal.style.display = "none";
    };
  }
}
